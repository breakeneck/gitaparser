const sqlite3 = require("better-sqlite3");
let db = new sqlite3('sb_rus.db', { verbose: console.log });

const sql = require('./sql');

let baseUri = '';

let insertCategory = async (url, title) => {
    let path = url.substr(url.indexOf(baseUri) + baseUri.length);

    await db.prepare(sql.INSERT_CONTENT).run({
        path,
        title
    });
}

module.exports.setBaseUri = (name) => baseUri = name;

module.exports.insertCategories = async (items) => {
    for (let item of items) {
        await insertCategory(item.url, item.title)
    }
}

module.exports.createTables = () => db.exec(sql.CREATE_CATEGORIES + sql.CREATE_CONTENT);

module.exports.updateCategoriesLevel = () => db.exec(sql.UPDATE_CATEGORIES_LEVEL);

