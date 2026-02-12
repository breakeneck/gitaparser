const mysql = require('mysql2/promise');
const sql = require('./sql');
require('dotenv').config();

class Database {
    constructor() {
        this.pool = null;
    }

    async connect() {
        if (this.pool) return this.pool;
        
        this.pool = mysql.createPool({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER || 'gitaparser',
            password: process.env.DB_PASSWORD || 'gitaparser123',
            database: process.env.DB_NAME || 'gitaparser',
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
            charset: 'utf8mb4'
        });
        
        console.log('Connected to MySQL database');
        return this.pool;
    }

    async initTables() {
        const conn = await this.pool.getConnection();
        try {
            await conn.query(sql.CREATE_BOOK);
            await conn.query(sql.CREATE_CHAPTERS);
            await conn.query(sql.CREATE_CONTENT);
            await conn.query(sql.CREATE_SKIPPED);
            console.log('Database tables initialized');
        } finally {
            conn.release();
        }
    }

    async query(sqlQuery, params = []) {
        const [rows] = await this.pool.execute(sqlQuery, params);
        return rows;
    }

    async getOne(sqlQuery, params = []) {
        const rows = await this.query(sqlQuery, params);
        return rows[0];
    }

    async run(sqlQuery, params = []) {
        const [result] = await this.pool.execute(sqlQuery, params);
        return {
            lastInsertRowid: result.insertId,
            changes: result.affectedRows
        };
    }

    async transaction(callback) {
        const conn = await this.pool.getConnection();
        try {
            await conn.beginTransaction();
            const result = await callback(conn);
            await conn.commit();
            return result;
        } catch (error) {
            await conn.rollback();
            throw error;
        } finally {
            conn.release();
        }
    }

    async close() {
        if (this.pool) {
            await this.pool.end();
            this.pool = null;
        }
    }
}

// Singleton instance
let dbInstance = null;

async function getDatabase() {
    if (!dbInstance) {
        dbInstance = new Database();
        await dbInstance.connect();
    }
    return dbInstance;
}

module.exports = { Database, getDatabase };
