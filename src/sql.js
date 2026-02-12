module.exports = {
    CREATE_BOOK: `CREATE TABLE IF NOT EXISTS book
                  (
                      id     INT AUTO_INCREMENT PRIMARY KEY,
                      title  TEXT,
                      abbr   VARCHAR(50),
                      lang   VARCHAR(10),
                      url    TEXT,
                      engine VARCHAR(50),
                      levels INT
                  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    CREATE_CHAPTERS: `CREATE TABLE IF NOT EXISTS chapters
                      (
                          id      INT AUTO_INCREMENT PRIMARY KEY,
                          level   INT,
                          path    TEXT,
                          title   TEXT,
                          book_id INT,
                          INDEX idx_book_id (book_id),
                          INDEX idx_level_book (level, book_id),
                          FOREIGN KEY (book_id) REFERENCES book(id) ON DELETE CASCADE
                      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    CREATE_CONTENT: `CREATE TABLE IF NOT EXISTS content
                     (
                         id               INT AUTO_INCREMENT PRIMARY KEY,
                         path             TEXT,
                         sanskrit         LONGTEXT,
                         search_sanskrit  TEXT,
                         wordly           LONGTEXT,
                         txt              TEXT,
                         comment          LONGTEXT,
                         chapter_id       INT,
                         book_id          INT,
                         INDEX idx_chapter_id (chapter_id),
                         INDEX idx_book_id (book_id),
                         UNIQUE INDEX idx_path_book (path(255), book_id),
                         FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE,
                         FOREIGN KEY (book_id) REFERENCES book(id) ON DELETE CASCADE
                     ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    CREATE_SKIPPED: `CREATE TABLE IF NOT EXISTS skipped_pages
                     (
                         id          INT AUTO_INCREMENT PRIMARY KEY,
                         path        TEXT,
                         chapter_id  INT,
                         book_id     INT,
                         attempts    INT DEFAULT 1,
                         last_error  TEXT,
                         created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                         updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                         INDEX idx_book_id (book_id),
                         INDEX idx_chapter_id (chapter_id),
                         FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE,
                         FOREIGN KEY (book_id) REFERENCES book(id) ON DELETE CASCADE
                     ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    INSERT_BOOK: `INSERT INTO book (title, abbr, lang, url, engine, levels)
                  VALUES (?, ?, ?, ?, ?, ?)`,
    INSERT_CONTENT: `INSERT INTO content (path, sanskrit, search_sanskrit, wordly, txt, comment, chapter_id, book_id)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                     ON DUPLICATE KEY UPDATE sanskrit = VALUES(sanskrit), wordly = VALUES(wordly), 
                     txt = VALUES(txt), comment = VALUES(comment), search_sanskrit = VALUES(search_sanskrit)`,
    INSERT_CHAPTER: `INSERT INTO chapters (path, title, level, book_id)
                     VALUES (?, ?, ?, ?)`,
    INSERT_SKIPPED: `INSERT INTO skipped_pages (path, chapter_id, book_id, attempts, last_error)
                     VALUES (?, ?, ?, ?, ?)
                     ON DUPLICATE KEY UPDATE attempts = attempts + 1, last_error = VALUES(last_error), updated_at = CURRENT_TIMESTAMP`,
    SELECT_CHAPTERS: `SELECT *
                      FROM chapters
                      WHERE level = ?
                        AND book_id = ?`,
    SELECT_CHAPTERS_FROM: `SELECT *
                           FROM chapters
                           WHERE level = ?
                             AND book_id = ?
                             AND id >= ?`,
    SELECT_CHAPTERS_WITHOUT_CONTENT: `SELECT c.*
                                      FROM chapters c
                                      LEFT JOIN content co ON c.id = co.chapter_id
                                      WHERE c.level = ?
                                        AND c.book_id = ?
                                        AND co.id IS NULL`,
    SELECT_SKIPPED: `SELECT * FROM skipped_pages WHERE book_id = ?`,
    DELETE_SKIPPED: `DELETE FROM skipped_pages WHERE id = ?`,
    DELETE_OLD_CONTENT: `DELETE
                         FROM content
                         WHERE book_id = ?`,
    DELETE_BOOK: `DELETE
                  FROM book
                  WHERE id = ?`,
    SELECT_BOOK: `SELECT *
                  FROM book
                  WHERE id = ?`,
    CHECK_CONTENT_EXISTS: `SELECT id FROM content WHERE chapter_id = ? LIMIT 1`,
};
