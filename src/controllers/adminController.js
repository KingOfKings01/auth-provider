const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Application = require('../models/Application');
const AuthorizedUser = require('../models/AuthorizedUser');
const ActivityLog = require('../models/ActivityLog');

const adminController = {
    // -- Auth --
    login: async (req, res) => {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password required' });
        }

        try {
            const admin = await Admin.findByEmail(email);
            if (!admin) {
                return res.status(401).json({ success: false, message: 'Invalid credentials' });
            }

            const isMatch = await bcrypt.compare(password, admin.password);
            if (!isMatch) {
                return res.status(401).json({ success: false, message: 'Invalid credentials' });
            }

            // Create JWT
            const token = jwt.sign(
                { id: admin.id, email: admin.email },
                process.env.JWT_SECRET || 'auth_provider_default_secure_fallback',
                { 
                    expiresIn: process.env.JWT_EXPIRE || '24h',
                    issuer: 'auth-provider' 
                }
            );

            res.cookie('auth_provider_admin_token', token, {
                httpOnly: true,
                maxAge: 24 * 60 * 60 * 1000 // 24 hours
            });

            res.json({ success: true, message: 'Logged in successfully' });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Server error' });
        }
    },

    logout: (req, res) => {
        res.clearCookie('auth_provider_admin_token');
        res.json({ success: true, message: 'Logged out' });
    },

    // -- Applications --
    getApps: async (req, res) => {
        try {
            const apps = await Application.findAll();
            res.json(apps);
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    },

    createApp: async (req, res) => {
        const { name, description } = req.body;
        if (!name) return res.status(400).json({ error: 'Name is required' });
        
        try {
            const app = await Application.create(name, description);
            res.status(201).json(app);
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    },

    updateAppStatus: async (req, res) => {
        const { id } = req.params;
        const { status } = req.body;
        try {
            await Application.updateStatus(id, status);
            res.json({ success: true });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    },

    deleteApp: async (req, res) => {
        const { id } = req.params;
        try {
            await Application.delete(id);
            res.json({ success: true });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    },

    // -- Authorized Users --
    getUsers: async (req, res) => {
        try {
            const users = await AuthorizedUser.findAll();
            res.json(users);
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    },

    getUsersByApp: async (req, res) => {
        const { appId } = req.params;
        try {
            const users = await AuthorizedUser.findByAppId(appId);
            res.json(users);
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    },

    addUser: async (req, res) => {
        const { app_id, email, username } = req.body;
        if (!app_id || !email) return res.status(400).json({ error: 'App ID and Email are required' });

        try {
            await AuthorizedUser.create(app_id, email, username);
            res.status(201).json({ success: true });
        } catch (e) {
            // Adjust error checking to handle Mongo/Mongoose unique constraints
            if (e.code === 11000 || e.message.includes('duplicate') || e.message.includes('UNIQUE constraint')) {
                res.status(400).json({ error: 'Email already added for this application' });
            } else {
                res.status(500).json({ error: e.message });
            }
        }
    },

    updateUserStatus: async (req, res) => {
        const { id } = req.params;
        const { status } = req.body;
        try {
            await AuthorizedUser.updateStatus(id, status);
            res.json({ success: true });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    },

    deleteUser: async (req, res) => {
        const { id } = req.params;
        try {
            await AuthorizedUser.delete(id);
            res.json({ success: true });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    },

    getAppLogs: async (req, res) => {
        const { appId } = req.params;
        const { email } = req.query;
        
        try {
            let logs;
            if (email) {
                logs = await ActivityLog.findByUser(appId, email);
            } else {
                logs = await ActivityLog.findByApp(appId);
            }
            res.json(logs);
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    }
};

module.exports = adminController;
