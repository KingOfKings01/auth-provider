const db = require('../config/database');

const ActivityLog = {
    log: (appId, email, action) => {
        const stmt = db.prepare(`
            INSERT INTO activity_logs (app_id, email, action)
            VALUES (?, ?, ?)
        `);
        return stmt.run(appId, email, action);
    },

    findByApp: (appId, limit = 50) => {
        // Combine with users to get human friendly usernames if available
        return db.prepare(`
            SELECT l.*, u.username
            FROM activity_logs l
            LEFT JOIN authorized_users u ON l.app_id = u.app_id AND l.email = u.email
            WHERE l.app_id = ?
            ORDER BY l.timestamp DESC
            LIMIT ?
        `).all(appId, limit);
    },

    findByUser: (appId, email, limit = 100) => {
        return db.prepare(`
            SELECT l.*, u.username
            FROM activity_logs l
            JOIN authorized_users u ON l.app_id = u.app_id AND l.email = u.email
            WHERE l.app_id = ? AND l.email = ?
            ORDER BY l.timestamp DESC
            LIMIT ?
        `).all(appId, email, limit);
    }
};

module.exports = ActivityLog;
