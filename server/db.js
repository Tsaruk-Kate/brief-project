const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "brief.db");

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("SQLite connection error:", err.message);
    } else {
        console.log("SQLite connected");
    }
});

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS admin_tokens (
            token TEXT PRIMARY KEY,
            createdAt INTEGER
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS briefs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            organizationName TEXT NOT NULL,
            contactPerson TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT,
            projectType TEXT NOT NULL,
            projectProblem TEXT NOT NULL,
            goals TEXT NOT NULL,
            audience TEXT NOT NULL,
            sections TEXT NOT NULL,
            features TEXT NOT NULL,
            stakeholders TEXT,
            successCriteria TEXT,
            constraints TEXT,
            designStyle TEXT NOT NULL,
            referenceSites TEXT,
            deadline TEXT NOT NULL,
            budget TEXT NOT NULL,
            additionalInfo TEXT,
            createdAt TEXT DEFAULT CURRENT_TIMESTAMP
        )
    `);
});

module.exports = db;