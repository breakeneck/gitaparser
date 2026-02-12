const Book = require('./book');
const Engine = require('./engine');
const engineFactory = require("./engineFactory");
const UrlMan = require("./urlMan");
const { retry } = require('./retry');
const { getDatabase } = require('./database');

module.exports = class Parser {
    book = new Book();
    engine = new Engine();
    skippedPages = [];

    setEngine(engineName) {
        this.engine = engineFactory.getEngine(engineName);
    }

    async initDbTables() {
        await this.book.initTables();
    }

    async newBook(engine, url, abbr, lang, levels) {
        this.setEngine(engine);
        let title = await this.engine.parseBookTitle(url);

        let book_id = await this.book.create({title, url, abbr, lang, engine, levels});

        // Book is already loaded in create method
        this.setEngine(this.book.model.engine);
        this.urlMan = new UrlMan(this.book.model.url);
        this.engine.setUrlMan(this.urlMan);
        console.log('book', this.book.model.id, this.book.model.title);
        
        return book_id;
    }

    async loadBook(id) {
        await this.book.load(id);
        this.setEngine(this.book.model.engine);
        this.urlMan = new UrlMan(this.book.model.url);
        this.engine.setUrlMan(this.urlMan);
        console.log('book', this.book.model.id, this.book.model.title);
    }

    async deleteBook(id) {
        await this.book.delete(id);
    }

    async bookStructure() {
        let cantoUrls = [];
        if (this.book.hasThreeLevels()) {
            let cantos = await this.engine.parseCantos(this.urlMan.rootUrl);
            cantoUrls = await this.addChapters(cantos);
        }
        else {
            cantoUrls = [this.urlMan.rootUrl];
        }

        for (let cantoUrl of cantoUrls) {
            let chapters = await this.engine.parseChapters(cantoUrl);
            let chaptersUrls = await this.addChapters(chapters);

            for (let chapterUrl of chaptersUrls) {
                let texts = await this.engine.parseTexts(chapterUrl);
                await this.addChapters(texts);
            }
        }
    }

    async addChapters(chapters) {
        let urls = [];
        for (let chapter of chapters) {
            await this.book.addChapter(chapter.title, chapter.url);
            urls.push(chapter.url);
        }
        return urls;
    }

    async bookContent(lastChapterId = 0, skipExisting = true) {
        let i = 0;
        let skipped = 0;
        let parsed = 0;
        let failed = 0;
        
        // Don't delete old content - use skip_existing instead
        let chapters = await this.book.getContentLevelChaptersFrom(lastChapterId || 0);
        const total = chapters.length;
        
        console.log(`\nStarting to parse ${total} chapters...\n`);
        this.skippedPages = [];

        for (let chapter of chapters) {
            i++;
            const progress = this.getProgress(i, total);
            
            // Check if content already exists
            if (skipExisting) {
                const exists = await this.book.contentExists(chapter.id);
                if (exists) {
                    console.log(`${progress} [SKIP] Chapter #${chapter.id} already exists - ${chapter.title || chapter.path}`);
                    skipped++;
                    continue;
                }
            }

            try {
                console.log(`${progress} [PARSE] Chapter #${chapter.id} - ${chapter.title || chapter.path}`);
                
                const content = await retry(
                    async () => {
                        return await this.engine.parseContentPage(chapter);
                    },
                    {
                        maxRetries: 5,
                        baseDelay: 2000,
                        onRetry: (attempt, error, delay) => {
                            console.log(`  └─ Retry ${attempt}/5 after ${Math.round(delay)}ms - Error: ${error.message}`);
                        }
                    }
                );
                
                await this.book.addContent(content);
                parsed++;
                this.printStats(parsed, skipped, failed, total);
                
            } catch (error) {
                failed++;
                console.error(`${progress} [FAIL] Chapter #${chapter.id} - Error: ${error.message}`);
                
                // Save to skipped pages for later retry
                await this.book.addSkippedPage(chapter.path, chapter.id, error);
                this.skippedPages.push({
                    chapterId: chapter.id,
                    path: chapter.path,
                    error: error.message
                });
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log('PARSING COMPLETE');
        console.log('='.repeat(60));
        console.log(`Total chapters: ${total}`);
        console.log(`Parsed:         ${parsed}`);
        console.log(`Skipped:        ${skipped} (already existed)`);
        console.log(`Failed:         ${failed}`);
        
        if (this.skippedPages.length > 0) {
            console.log('\nFailed pages saved for retry:');
            this.skippedPages.forEach(p => {
                console.log(`  - Chapter #${p.chapterId}: ${p.path}`);
            });
        }
        console.log('='.repeat(60));
    }

    async retrySkippedPages() {
        const skipped = await this.book.getSkippedPages();
        
        if (skipped.length === 0) {
            console.log('No skipped pages to retry.');
            return;
        }

        console.log(`\nRetrying ${skipped.length} skipped pages...\n`);
        
        let success = 0;
        let stillFailed = 0;

        for (let i = 0; i < skipped.length; i++) {
            const page = skipped[i];
            const progress = this.getProgress(i + 1, skipped.length);
            
            try {
                console.log(`${progress} [RETRY] Chapter #${page.chapter_id} - ${page.path}`);
                
                const chapter = {
                    id: page.chapter_id,
                    path: page.path
                };
                
                const content = await retry(
                    async () => {
                        return await this.engine.parseContentPage(chapter);
                    },
                    {
                        maxRetries: 3,
                        baseDelay: 2000
                    }
                );
                
                await this.book.addContent(content);
                await this.book.db.run('DELETE FROM skipped_pages WHERE id = ?', [page.id]);
                success++;
                console.log(`  └─ SUCCESS`);
                
            } catch (error) {
                stillFailed++;
                console.error(`  └─ STILL FAILED: ${error.message}`);
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log('RETRY COMPLETE');
        console.log(`Success: ${success}`);
        console.log(`Still failed: ${stillFailed}`);
        console.log('='.repeat(60));
    }

    getProgress(current, total) {
        const percent = Math.round(current / total * 100);
        const bar = this.getProgressBar(percent);
        return `[${bar}] ${percent}% (${current}/${total})`;
    }

    getProgressBar(percent, width = 20) {
        const filled = Math.round(width * percent / 100);
        const empty = width - filled;
        return '█'.repeat(filled) + '░'.repeat(empty);
    }

    printStats(parsed, skipped, failed, total) {
        const remaining = total - parsed - skipped - failed;
        if (remaining > 0 && (parsed + skipped + failed) % 10 === 0) {
            console.log(`  └─ Stats: Parsed=${parsed}, Skipped=${skipped}, Failed=${failed}, Remaining=${remaining}`);
        }
    }
};
