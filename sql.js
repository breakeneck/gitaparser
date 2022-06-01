module.exports = {
    CREATE_BOOK: `CREATE TABLE IF NOT EXISTS book (
     "id" INTEGER PRIMARY KEY AUTOINCREMENT,
     "title" TEXT,
     "abbr" TEXT,
     "lang" TEXT,
     "url" TEXT,
     "levels" INTEGER
    );`,
    CREATE_CONTENT: `CREATE TABLE IF NOT EXISTS content (
     "id" INTEGER PRIMARY KEY AUTOINCREMENT,
     "path" TEXT,
     "sanskrit" TEXT,
     "wordly" TEXT,
     "txt" TEXT,
     "comment" TEXT,
     "book_id" INTEGER
    );`,
    CREATE_CATEGORIES: `CREATE TABLE IF NOT EXISTS categories (
     "id" INTEGER PRIMARY KEY AUTOINCREMENT,
     "level" INTEGER,
     "path" TEXT,
     "title" TEXT,
     "book_id" INTEGER
    );`,
    INSERT_BOOK: `INSERT INTO book (title, abbr, lang, url, levels) 
                            VALUES ($title, $abbr, $lang, $url, $levels)`,
    INSERT_CONTENT: `INSERT INTO content (path, sanskrit, wordly, txt, comment, book_id) 
                            VALUES ($path, $sanskrit, $wordly, $txt, $comment, $book_id)`,
    INSERT_CATEGORY: `INSERT INTO categories (path, title, level, book_id) 
                            VALUES ($path, $title, $level, $book_id)`,
    SELECT_CHAPTERS: `SELECT * FROM categories 
                        WHERE level = $level 
                          AND book_id = $book_id`,
    SELECT_BOOK: `SELECT * FROM book 
                        WHERE id = $id`,
};