const sqlite3 = require("sqlite3").verbose();
const

(async () => {
    try {
        // Creating the Books table (Book_ID, Title, Author, Comments)
        const sql_create = `CREATE TABLE IF NOT EXISTS books ... `;
        await db.query(sql_create, []);
        console.log("Successful creation of the 'Books' table");
        // Database seeding
        const result = await db.query("SELECT COUNT(*) AS count FROM Books", []);
        const count = result.rows[0].count;
        if (count === 0) {
            const sql_insert = `INSERT INTO Books ... `;
            await db.query(sql_insert, []);
            console.log("Successful creation of 3 books");
        }
    }
    catch (error) { throw error; }
})();