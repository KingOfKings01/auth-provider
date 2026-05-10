const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const token = req.cookies.adminToken;
    
    if (!token) {
        // If it's an API request, send 401. If it's a page request, redirect to login.
        if (req.path.startsWith('/api/')) {
            return res.status(401).json({ message: 'Unauthorized. No token provided.' });
        }
        return res.redirect('/login');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_key_change_this');
        req.admin = decoded;
        next();
    } catch (error) {
        res.clearCookie('adminToken');
        if (req.path.startsWith('/api/')) {
            return res.status(401).json({ message: 'Unauthorized. Invalid token.' });
        }
        return res.redirect('/login');
    }
};
