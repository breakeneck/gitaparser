const Book = require('./book');
const engineFactory = require("./engineFactory");
const UrlMan = require("./urlMan");

module.exports = class Parser {
    constructor(engineName) {
        this.engine = engineFactory.getEngine(engineName);
        this.book = new Book(this.engine.getDbName());
    }

    resetBook() {
        this.book.reset();
    }

    async newBook(url, abbr, lang, levels) {
        let engine = this.engine.getDbName().split('.')[0];
        let title = await this.engine.parseBookTitle(url);
        let book_id = await this.book.create({title, url, abbr, lang, engine, levels});

        this.loadBook(book_id);
        return book_id;
    }

    loadBook(id) {
        this.book.load(id);
        this.urlMan = new UrlMan(this.book.model.url);
        this.engine.setUrlMan(this.urlMan);
    }

    deleteBook(id) {
        this.book.delete(id);
    }

    async bookStructure() {
        let level = 1;
        let cantoUrls = [];
        if (this.book.hasThirdLevel()) {
            let cantos = await this.engine.parseCantos(this.urlMan.rootUrl);
            let chaptersUrls = await this.addChapters(cantos);
            level++;
        }
        else {
            cantoUrls = [this.urlMan.rootUrl];
        }

        for (let cantoUrl of cantoUrls) {
            let chapters = await this.engine.parseChapters(cantoUrl);
            let chaptersUrls = await this.addChapters(chapters);
            level++;

            for (let chapterUrl of chaptersUrls) {
                let texts = await this.engine.parseTexts(chapterUrl);
                await this.addChapters(texts);
                level++;
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




// async bookStructure() {
//     let cantoUrls = [];
//     if (this.book.hasThirdLevel()) {
//         let cantos = await this.engine.parseCantos(this.urlMan.rootUrl);
//         cantoUrls = cantos.map((canto) => this.book.addChapter(canto.title, canto.url))
//     }
//     else {
//         cantoUrls = [this.urlMan.rootUrl];
//     }
//
//     for (let cantoUrl of cantoUrls) {
//         let chapters = await this.engine.parseChapters(cantoUrl);
//         let chaptersUrls = await chapters.map(async(chapter) => await this.book.addChapter(chapter.title, chapter.url));
//
//         for (let chapterUrl of chaptersUrls) {
//             let texts = await this.engine.parseTexts(chapterUrl);
//             texts.map((text) => this.book.addChapter(text.title, text.url));
//         }
//     }
// }