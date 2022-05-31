const c = require('./constants');

module.exports = {
    CREATE_CONTENT: `CREATE TABLE IF NOT EXISTS content (
     "id" INTEGER PRIMARY KEY AUTOINCREMENT,
     "path" TEXT,
     "sanskrit" TEXT,
     "wordly" TEXT,
     "txt" TEXT,
     "comment" TEXT,
     "book" TEXT,
     "lang" TEXT
    );`,
    CREATE_CATEGORIES: `CREATE TABLE IF NOT EXISTS categories (
     "id" INTEGER PRIMARY KEY AUTOINCREMENT,
     "level" INTEGER,
     "path" TEXT,
     "title" TEXT,
     "book" TEXT,
     "lang" TEXT
    );`,
    INSERT_CONTENT: `INSERT INTO content (path, sanskrit, wordly, txt, comment, book, lang) VALUES ($path, $sanskrit, $wordly, $txt, $comment, $book, $lang)`,
    INSERT_CATEGORY: `INSERT INTO categories (path, title, level, book, lang) VALUES ($path, $title, $level, $book, $lang)`,
    SELECT_CHAPTERS: `SELECT * FROM categories WHERE level = $level AND book = $book AND lang = $lang`,
};