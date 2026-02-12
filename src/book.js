const { getDatabase } = require('./database');
const sql = require('./sql');
const sanscreet = require("./sanscreet");

module.exports = class Book {
    model;
    db;

    async init() {
        this.db = await getDatabase();
    }

    async initTables() {
        await this.init();
        await this.db.initTables();
    }

    async load(id) {
        await this.init();
        this.model = await this.db.getOne(sql.SELECT_BOOK, [id]);
    }

    async delete(id) {
        await this.init();
        await this.db.run(sql.DELETE_BOOK, [id]);
    }

    async create(content) {
        await this.init();
        const result = await this.db.run(sql.INSERT_BOOK, [
            content.title,
            content.abbr,
            content.lang,
            content.url,
            content.engine,
            content.levels
        ]);
        // Set the model after creating
        this.model = { id: result.lastInsertRowid, ...content };
        return result.lastInsertRowid;
    }

    async addChapter(title, url) {
        let path = this.getPath(url);
        let content = [
            path,
            title,
            this.model.id,
            path.split('/').length - 1
        ];
        await this.db.run(sql.INSERT_CHAPTER, content);
    }

    async addContent(content) {
        content.book_id = this.model.id;
        
        // Handle undefined search_sanskrit
        if (content.search_sanskrit) {
            content.search_sanskrit = sanscreet.replaceToCyrillicChars(content.search_sanskrit, this.model.lang)
                .replace(/ґг/g, "г")
                .replace(/ґ/g, "г")
                .replace(/'/g, "")
                .replace(/(\s+)/g, ' ');
        } else {
            content.search_sanskrit = '';
        }
        
        return await this.db.run(sql.INSERT_CONTENT, [
            content.path || '',
            content.sanskrit || '',
            content.search_sanskrit,
            content.wordly || '',
            content.txt || '',
            content.comment || '',
            content.chapter_id,
            content.book_id
        ]);
    }

    async addSkippedPage(path, chapterId, error) {
        return await this.db.run(sql.INSERT_SKIPPED, [
            path,
            chapterId,
            this.model.id,
            1,
            error.message || String(error)
        ]);
    }

    async getSkippedPages() {
        return await this.db.query(sql.SELECT_SKIPPED, [this.model.id]);
    }

    async deleteOldContent() {
        return this.db.run(sql.DELETE_OLD_CONTENT, [this.model.id]);
    }

    async contentExists(chapterId) {
        const result = await this.db.getOne(sql.CHECK_CONTENT_EXISTS, [chapterId]);
        return !!result;
    }

    getContentLevelChapters() {
        return this.db.query(sql.SELECT_CHAPTERS, [
            this.model.levels,
            this.model.id
        ]);
    }

    async getContentLevelChaptersFrom(lastChapterId) {
        return await this.db.query(sql.SELECT_CHAPTERS_FROM, [
            this.model.levels,
            this.model.id,
            lastChapterId
        ]);
    }

    async getChaptersWithoutContent() {
        return await this.db.query(sql.SELECT_CHAPTERS_WITHOUT_CONTENT, [
            this.model.levels,
            this.model.id
        ]);
    }

    hasThreeLevels() {
        return this.model.levels === 3;
    }

    getPath(url) {
        let path = url.slice(this.model.url.length).trim();
        if (path === '/') {
            return path;
        }
        return path.endsWith('/') ? path.slice(0, -1) : path;
    }
};
