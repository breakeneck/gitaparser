const sqlite3 = require("better-sqlite3");
let db = new sqlite3('gitabase.db'/*, { verbose: console.log }*/);

const sql = require('./sql');

let baseUri = '';

let insertCategory = async (url, title) => {
    let path = url.substr(url.indexOf(baseUri) + baseUri.length);

    await db.prepare(sql.INSERT_CATEGORY).run({
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

module.exports.db = db;
// module.exports.iterateCategories = ;
// module.exports.iterateCategories = db.prepare(sql.SELECT_ALL_TEXTS, (err, categories) => console.log(categories.length));

