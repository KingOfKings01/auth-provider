const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const token = req.cookies.adminToken;
    
    if (!token) {
        if (req.path.startsWith('/api/')) {
            return res.status(401).json({ message: 'Unauthorized. No token provided.' });
        }
        // Use relative redirect based on route tree
        return res.redirect('login');
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
        return res.redirect('login');
    }
};
