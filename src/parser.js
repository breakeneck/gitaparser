const Book = require('./book');
const Engine = require('./engine');
const engineFactory = require("./engineFactory");
const UrlMan = require("./urlMan");

module.exports = class Parser {
    book = new Book()
    engine = new Engine()
    setEngine(engineName) {
        this.engine = engineFactory.getEngine(engineName);
    }

    initDbTables() {
        (new Book()).initTables();
    }

    async newBook(engine, url, abbr, lang, levels) {
        this.setEngine(engine);
        let title = await this.engine.parseBookTitle(url);

        let book_id = await (new Book()).create({title, url, abbr, lang, engine, levels});

        this.loadBook(book_id);
        return book_id;
    }

    loadBook(id) {
        this.book.load(id);
        this.setEngine(this.book.model.engine);
        this.urlMan = new UrlMan(this.book.model.url);
        this.engine.setUrlMan(this.urlMan);
        console.log('book', this.book.model.id, this.book.model.title)
    }

    deleteBook(id) {
        this.book.delete(id);
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

    async bookContent(last_chapter_id) {
        let i = 0;
        if (! last_chapter_id) {
            await this.book.deleteOldContent();
        }
        let chapters = this.book.getContentLevelChaptersFrom(last_chapter_id || 0)
        // console.log('Chapters', chapters);

        for (let chapter of chapters) {
            try {
                console.log(`Inserted ${Math.round(++i / chapters.length * 100)}% chapter # ${chapter.id}`);

                let content = await this.engine.parseContentPage(chapter);
                await this.book.addContent(content);
            } catch (error) {
                console.error(error);
            }
        }
    }
}