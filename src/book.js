const sqlite3 = require('better-sqlite3');
const sql = require('./sql');
const fs = require('fs')

const sanscreet = require("./sanscreet")


module.exports = class Book {
    model
    constructor() {
        const dbPath = './db/general.db';
        this.db = new sqlite3(dbPath);
    }

    async initTables() {
        await this.db.exec(sql.CREATE_BOOK + sql.CREATE_CHAPTERS + sql.CREATE_CONTENT);
    }

    async load(id) {
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
        content.search_sanskrit = sanscreet.replaceToCyrillicChars(content.search_sanskrit, this.model.lang)
            // .replace(/<\/?[^>]+(>|$)/g, "") // replace tabs
            .replace(/ґг/g, "г") // replace ґ
            .replace(/ґ/g, "г")
            .replace(/‘/g, "")
            .replace(/(\s+)/g, ' '); // replace multiple spaces to single
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
            level: this.model.levels - 1,
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