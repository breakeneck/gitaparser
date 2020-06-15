const c = require('./constants');

module.exports = {
    CREATE_CONTENT: `CREATE TABLE IF NOT EXISTS content (
     "id" INTEGER PRIMARY KEY AUTOINCREMENT,
     "path" INTEGER,
     "sanskrit" TEXT,
     "wordly" TEXT,
     "txt" TEXT,
     "comment" TEXT
    );`,
    CREATE_CATEGORIES: `CREATE TABLE IF NOT EXISTS categories (
     "id" INTEGER PRIMARY KEY AUTOINCREMENT,
     "level" INTEGER,
     "path" INTEGER,
     "title" TEXT
    );`,
    INSERT_CONTENT: `INSERT INTO content (path, sanskrit, wordly, txt, comment) VALUES ($path, $sanskrit, $wordly, $txt, $comment)`,
    INSERT_CATEGORY: `INSERT INTO categories (path, title) VALUES ($path, $title)`,
    UPDATE_CATEGORIES_LEVEL: `UPDATE categories SET level = LENGTH(path) - LENGTH(REPLACE(path, '/', ''))`,
    SELECT_ALL_TEXTS: `SELECT * FROM categories WHERE level = ${c.LEVEL_TEXT}`,
    SELECT_CATEGORIES: `SELECT * FROM categories WHERE level = $level`,
};