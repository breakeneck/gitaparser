const sqlite3 = require('better-sqlite3');
const fs = require('fs')
const sql = require('./sql');

const DB_FILENAME = 'gitabase.db';
const PROTO = 'https://';

let db = null;
let getDb = function () {
    if (!db) {
        db = new sqlite3('./' + DB_FILENAME);
    }
    return db;
}

module.exports = class Book {
    reset() {
        try {
            fs.unlinkSync('./' + DB_FILENAME);
        } catch (error) {
            console.error(error)
        }

        getDb().exec(sql.CREATE_BOOK + sql.CREATE_CATEGORIES + sql.CREATE_CONTENT);
    }

    load(id) {
        this.model = getDb().prepare(sql.SELECT_BOOK).get({id: id});
        let url = new URL(this.model.url);
        this.hostname = url.hostname;
    }

    async create(content) {
        const info = await getDb().prepare(sql.INSERT_BOOK).run(content);
        this.load(info.lastInsertRowid);
    }

    async addChapter(content) {
        content.book_id = this.model.id;
        content.level = content.path.split(',').length;
        return await getDb().prepare(sql.INSERT_CATEGORY).run(content);
    }

    async addContent(content) {
        content.book_id = this.model.id;
        return await getDb().prepare(sql.INSERT_CONTENT).run(content);
    }

    getContentLevelChapters() {
        return getDb().prepare(sql.SELECT_CHAPTERS).all({
            level: this.model.levels - 1,
            book_id: this.model.id
        });
    }

    hasThirdLevel() {
        return this.model.levels === 3;
    }

    getUrl(uri) {
        if (! uri) {
            return this.model.url;
        }
        if (uri.indexOf(PROTO) === -1) {
            return PROTO + this.hostname + uri;
        }
        return uri;
    }

    getUrlByPath(path) {
        return this.model.url + '/' + path;
    }

    getPath(url) {
        return url.slice(this.model.url.length - 1);
    }
}