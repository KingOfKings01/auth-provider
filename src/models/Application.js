const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const Application = {
    create: (name, description) => {
        const appId = uuidv4();
        const apiKey = require('crypto').randomBytes(24).toString('hex');
        const stmt = db.prepare(`
            INSERT INTO applications (name, description, app_id, api_key) 
            VALUES (?, ?, ?, ?)
        `);
        const info = stmt.run(name, description, appId, apiKey);
        return { id: info.lastInsertRowid, appId, apiKey };
    },

    findAll: () => {
        return db.prepare("SELECT * FROM applications ORDER BY created_at DESC").all();
    },

    findById: (id) => {
        return db.prepare("SELECT * FROM applications WHERE id = ?").get(id);
    },

    findByAppId: (appId) => {
        return db.prepare("SELECT * FROM applications WHERE app_id = ?").get(appId);
    },

    updateStatus: (id, status) => {
        return db.prepare("UPDATE applications SET status = ? WHERE id = ?").run(status, id);
    },

    delete: (id) => {
        return db.prepare("DELETE FROM applications WHERE id = ?").run(id);
    }
};

module.exports = Application;
