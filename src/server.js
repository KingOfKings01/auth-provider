require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
const { connectDB } = require('./config/database');



const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Enable CORS for public desktop APIs
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const ROUTE_PREFIX = process.env.ROUTE_PREFIX || '/auth';

// Serve Static Assets under prefix
app.use(express.static(path.join(__dirname, '../public')));

// Database connection middleware (lazy connection)
app.use(async (req, res, next) => {
    if (req.path === '/ping') {
        return next();
    }
    try {
        await connectDB();
        next();
    } catch (err) {
        console.error('❌ Database connection error in middleware:', err.message);
        res.status(500).json({ error: 'Database connection failed' });
    }
});

// Load Routes under prefix
const routes = require('./routes');
app.use(routes);

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Start Server
if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`🚀 Auth Provider Server running on http://localhost:${PORT}`);
    });
}

module.exports = app;
