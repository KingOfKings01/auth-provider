const db = require('../config/database');

const Admin = {
    findByEmail: (email) => {
        return db.prepare("SELECT * FROM admins WHERE email = ?").get(email);
    }
};

module.exports = Admin;
