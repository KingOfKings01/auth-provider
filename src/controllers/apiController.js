const Application = require('../models/Application');
const AuthorizedUser = require('../models/AuthorizedUser');
const ActivityLog = require('../models/ActivityLog');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendOTPEmail } = require('../config/mailer');

const apiController = {
    authorize: async (req, res) => {
        const { app_id, api_key, email } = req.body;

        if (!app_id || !api_key || !email) {
            return res.status(400).json({ 
                authorized: false, 
                message: 'Missing required parameters: app_id, api_key, or email' 
            });
        }

        try {
            // 1. Validate Application
            const app = await Application.findByAppId(app_id);
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
            const user = await AuthorizedUser.findByAppAndEmail(app_id, email);
            if (!user) {
                return res.status(403).json({ authorized: false, message: 'Email is not registered for this application' });
            }

            if (user.status !== 'active') {
                return res.status(403).json({ authorized: false, message: 'Access denied. Your email is blocked.' });
            }

            // 3. Generate validation OTP
            const otp = Math.floor(100000 + crypto.randomInt(900000)).toString();

            // 4. Dispatch the Email OTP
            try {
                await sendOTPEmail(email, otp, app.name);
            } catch (mailErr) {
                console.error('❌ Failed to dispatch OTP email:', mailErr);
                return res.status(500).json({
                    authorized: false,
                    message: 'Authentication initialization failed: Unable to dispatch verification email.'
                });
            }

            // LOG ACTIVITY: LOGIN INITIATED
            await ActivityLog.log(app_id, email, 'LOGIN_INIT');

            return res.json({
                authorized: true,
                message: 'Verification code sent. Please check your email inbox.',
                otp: otp,
                app_name: app.name
            });

        } catch (e) {
            console.error(e);
            res.status(500).json({ authorized: false, message: 'Internal server error' });
        }
    },

    logout: async (req, res) => {
        const { app_id, api_key, email } = req.body;
        
        if (!app_id || !email) {
            return res.status(400).json({ success: false, message: 'app_id and email required' });
        }

        try {
            // Verify basic app logic first
            const app = await Application.findByAppId(app_id);
            if (app && app.api_key === api_key) {
                await ActivityLog.log(app_id, email, 'LOGOUT');
                return res.json({ success: true, message: 'Logged out tracked' });
            }
            return res.status(401).json({ success: false });
        } catch (e) {
            res.status(500).json({ success: false });
        }
    }
};

module.exports = apiController;
