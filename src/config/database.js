const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const dbPath = process.env.DATABASE_PATH || './data/database.sqlite';
const dbDir = path.dirname(dbPath);

// Ensure directory exists
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath, { verbose: null });

// Initialize Tables
db.exec(`
    CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS applications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        app_id TEXT UNIQUE NOT NULL,
        api_key TEXT NOT NULL,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS authorized_users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        app_id TEXT NOT NULL,
        username TEXT,
        email TEXT NOT NULL,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (app_id) REFERENCES applications(app_id) ON DELETE CASCADE,
        UNIQUE(app_id, email)
    );

    CREATE TABLE IF NOT EXISTS activity_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        app_id TEXT NOT NULL,
        email TEXT NOT NULL,
        action TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (app_id) REFERENCES applications(app_id) ON DELETE CASCADE
    );
`);

// Run a migration check in case database already existed to inject username column
try {
    db.exec("ALTER TABLE authorized_users ADD COLUMN username TEXT;");
} catch(e) { /* Column exists or table new */ }

// Seed Admin User if not exists
const seedAdmin = () => {
    const count = db.prepare("SELECT COUNT(*) as count FROM admins").get().count;
    if (count === 0) {
        const email = process.env.ADMIN_EMAIL || 'admin@example.com';
        const rawPass = process.env.ADMIN_PASSWORD || 'admin123';
        const salt = bcrypt.genSaltSync(10);
        const hashedPass = bcrypt.hashSync(rawPass, salt);
        
        db.prepare("INSERT INTO admins (email, password) VALUES (?, ?)").run(email, hashedPass);
        console.log(`Initialized default admin: ${email}`);
    }
};

seedAdmin();

module.exports = db;
