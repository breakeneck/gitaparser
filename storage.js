const sqlite3 = require("better-sqlite3");
const sql = require('./sql');
const c = require('./constants');
const fs = require('fs');

let db = new sqlite3(c.DB_FILENAME);///*, { verbose: console.log }*/);

module.exports.db = db;

module.exports.removeDb = async () => {
    db.close();
    fs.unlink('./' + c.DB_FILENAME, (err) => {
        err ? console.log(err) : null
    });
    db = new sqlite3(c.DB_FILENAME);
}
// module.exports.iterateCategories = ;
// module.exports.iterateCategories = db.prepare(sql.SELECT_ALL_TEXTS, (err, categories) => console.log(categories.length));

