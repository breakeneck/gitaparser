module.exports = {
    CREATE_BOOK: `CREATE TABLE IF NOT EXISTS book
                  (
                      "id"     INTEGER PRIMARY KEY AUTOINCREMENT,
                      "title"  TEXT,
                      "abbr"   TEXT,
                      "lang"   TEXT,
                      "url"    TEXT,
                      "levels" INTEGER
                  );`,
    CREATE_CONTENT: `CREATE TABLE IF NOT EXISTS content
                     (
                         "id"       INTEGER PRIMARY KEY AUTOINCREMENT,
                         "sanskrit" TEXT,
                         "wordly"   TEXT,
                         "txt"      TEXT,
                         "comment"  TEXT,
                         "chapter_id" INTEGER REFERENCES chapters (id) ON DELETE CASCADE,
                         "book_id"  INTEGER REFERENCES book (id) ON DELETE CASCADE
                     );`,
    CREATE_CHAPTERS: `CREATE TABLE IF NOT EXISTS chapters
                      (
                          "id"      INTEGER PRIMARY KEY AUTOINCREMENT,
                          "level"   INTEGER,
                          "path"    TEXT,
                          "title"   TEXT,
                          "book_id" INTEGER REFERENCES book (id) ON DELETE CASCADE
                      );`,
    INSERT_BOOK: `INSERT INTO book (title, abbr, lang, url, levels)
                  VALUES ($title, $abbr, $lang, $url, $levels)`,
    INSERT_CONTENT: `INSERT INTO content (sanskrit, wordly, txt, comment, chapter_id, book_id)
                     VALUES ($sanskrit, $wordly, $txt, $comment, $chapter_id, $book_id)`,
    INSERT_CHAPTER: `INSERT INTO chapters (path, title, level, book_id)
                     VALUES ($path, $title, $level, $book_id)`,
    SELECT_CHAPTERS: `SELECT *
                      FROM chapters
                      WHERE level = $level
                        AND book_id = $book_id`,
    SELECT_CHAPTERS_FROM: `SELECT *
                      FROM chapters
                      WHERE level = $level
                        AND book_id = $book_id
                        AND id >= $last_chapter_id`,
    DELETE_OLD_CONTENT: `DELETE
                         FROM content
                         WHERE book_id = $book_id`,
    DELETE_BOOK: `DELETE
                  FROM book
                  WHERE id = $id`,
    SELECT_BOOK: `SELECT *
                  FROM book
                  WHERE id = $id`,
};