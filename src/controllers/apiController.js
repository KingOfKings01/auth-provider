const Application = require('../models/Application');
const AuthorizedUser = require('../models/AuthorizedUser');
const ActivityLog = require('../models/ActivityLog');
const jwt = require('jsonwebtoken');

const apiController = {
    authorize: (req, res) => {
        const { app_id, api_key, email } = req.body;

        if (!app_id || !api_key || !email) {
            return res.status(400).json({ 
                authorized: false, 
                message: 'Missing required parameters: app_id, api_key, or email' 
            });
        }

        try {
            // 1. Validate Application
            const app = Application.findByAppId(app_id);
            if (!app) {
                return res.status(404).json({ authorized: false, message: 'Application not found' });
            }
            
            // Check if app is blocked
            if (app.status !== 'active') {
                return res.status(403).json({ authorized: false, message: 'Application access is currently suspended' });
            }

            // Check API key
            if (app.api_key !== api_key) {
                return res.status(401).json({ authorized: false, message: 'Invalid API key' });
            }

            // 2. Validate User email for this app
            const user = AuthorizedUser.findByAppAndEmail(app_id, email);
            if (!user) {
                return res.status(403).json({ authorized: false, message: 'Email is not registered for this application' });
            }

            if (user.status !== 'active') {
                return res.status(403).json({ authorized: false, message: 'Access denied. Your email is blocked.' });
            }

            // 3. Create validation token
            const clientToken = jwt.sign(
                { 
                    app_id: app_id, 
                    email: email, 
                    granted_at: new Date().toISOString() 
                },
                process.env.JWT_SECRET || 'super_secret_key_change_this',
                { expiresIn: '24h' } // Example expiry
            );

            // LOG ACTIVITY: LOGIN SUCCESS
            ActivityLog.log(app_id, email, 'LOGIN');

            return res.json({
                authorized: true,
                message: 'Authorized successfully',
                token: clientToken,
                app_name: app.name
            });

        } catch (e) {
            console.error(e);
            res.status(500).json({ authorized: false, message: 'Internal server error' });
        }
    },

    logout: (req, res) => {
        const { app_id, api_key, email } = req.body;
        
        if (!app_id || !email) {
            return res.status(400).json({ success: false, message: 'app_id and email required' });
        }

        try {
            // Verify basic app logic first
            const app = Application.findByAppId(app_id);
            if (app && app.api_key === api_key) {
                ActivityLog.log(app_id, email, 'LOGOUT');
                return res.json({ success: true, message: 'Logged out tracked' });
            }
            return res.status(401).json({ success: false });
        } catch (e) {
            res.status(500).json({ success: false });
        }
    }
};

module.exports = apiController;
