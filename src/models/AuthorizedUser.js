const db = require('../config/database');

const AuthorizedUser = {
    create: (appId, email, username) => {
        const stmt = db.prepare(`
            INSERT INTO authorized_users (app_id, email, username)
            VALUES (?, ?, ?)
        `);
        return stmt.run(appId, email, username || null);
    },

    findAll: () => {
        // Join with applications to get app names
        return db.prepare(`
            SELECT au.*, a.name as app_name 
            FROM authorized_users au
            JOIN applications a ON au.app_id = a.app_id
            ORDER BY au.created_at DESC
        `).all();
    },

    findByAppId: (appId) => {
        return db.prepare(`
            SELECT * FROM authorized_users 
            WHERE app_id = ?
            ORDER BY created_at DESC
        `).all(appId);
    },

    findByAppAndEmail: (appId, email) => {
        return db.prepare(`
            SELECT * FROM authorized_users 
            WHERE app_id = ? AND email = ?
        `).get(appId, email);
    },

    updateStatus: (id, status) => {
        return db.prepare("UPDATE authorized_users SET status = ? WHERE id = ?").run(status, id);
    },

    delete: (id) => {
        return db.prepare("DELETE FROM authorized_users WHERE id = ?").run(id);
    }
};

module.exports = AuthorizedUser;
