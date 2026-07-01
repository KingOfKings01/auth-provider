const express = require('express');
const router = express.Router();
const path = require('path');
const adminController = require('../controllers/adminController');
const apiController = require('../controllers/apiController');
const protect = require('../middleware/auth');

// ==========================================
// Page Routes (Web UI)
// ==========================================
router.get('/', (req, res) => res.redirect('dashboard'));

// Public Diagnostic Route
router.get('/ping', (req, res) => res.json({ status: "online", message: "Auth Provider Service is Live" }));

router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/login.html'));
});

// Protected Pages
router.get('/dashboard', protect, (req, res) => {
    res.sendFile(path.join(__dirname, '../views/dashboard.html'));
});

// ==========================================
// Admin API (Protected by session token)
// ==========================================
router.post('/api/admin/login', adminController.login);
router.post('/api/admin/logout', adminController.logout);

// Apps
router.get('/api/admin/apps', protect, adminController.getApps);
router.post('/api/admin/apps', protect, adminController.createApp);
router.patch('/api/admin/apps/:id/status', protect, adminController.updateAppStatus);
router.delete('/api/admin/apps/:id', protect, adminController.deleteApp);
router.get('/api/admin/apps/:appId/users', protect, adminController.getUsersByApp);
router.get('/api/admin/apps/:appId/logs', protect, adminController.getAppLogs);

// Users
router.get('/api/admin/users', protect, adminController.getUsers);
router.post('/api/admin/users', protect, adminController.addUser);
router.patch('/api/admin/users/:id/status', protect, adminController.updateUserStatus);
router.delete('/api/admin/users/:id', protect, adminController.deleteUser);

// ==========================================
// Public Desktop API
// ==========================================
router.post('/api/authorize', apiController.authorize);
router.post('/api/track-logout', apiController.logout);

module.exports = router;
