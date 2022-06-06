const sqlite3 = require('better-sqlite3');
const sql = require('./sql');


module.exports = class Book {
    constructor(dbName) {
        this.db = new sqlite3('./db/' + dbName);
    }

    reset() {
        this.db.exec(sql.CREATE_BOOK + sql.CREATE_CHAPTERS + sql.CREATE_CONTENT);
    }

    load(id) {
        this.model = this.db.prepare(sql.SELECT_BOOK).get({id: id});
    }

    async delete(id) {
        await this.db.prepare(sql.DELETE_BOOK).run({id: id});
    }

    async create(content) {
        const info = await this.db.prepare(sql.INSERT_BOOK).run(content);
        return info.lastInsertRowid;
    }

    async addChapter(title, url) {
        let path = this.getPath(url);
        let content = {
            title,
            path,
            book_id: this.model.id,
            level: path.split('/').length - 1
        };
        await this.db.prepare(sql.INSERT_CHAPTER).run(content);
    }

    async addContent(content) {
        content.book_id = this.model.id;
        return await this.db.prepare(sql.INSERT_CONTENT).run(content);
    }

    async deleteOldContent() {
        return this.db.prepare(sql.DELETE_OLD_CONTENT).run({
            book_id: this.model.id
        });
    }

    getContentLevelChapters() {
        return this.db.prepare(sql.SELECT_CHAPTERS).all({
            level: this.model.levels,
            book_id: this.model.id
        });
    }

    getContentLevelChaptersFrom(last_chapter_id) {
        return this.db.prepare(sql.SELECT_CHAPTERS_FROM).all({
            level: this.model.levels,
            book_id: this.model.id,
            last_chapter_id: last_chapter_id
        });
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
}