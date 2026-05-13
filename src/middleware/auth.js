const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const token = req.cookies.auth_provider_admin_token;
    
    if (!token) {
        if (req.path.startsWith('/api/')) {
            return res.status(401).json({ message: 'Unauthorized. No token provided.' });
        }
        // Use relative redirect based on route tree
        return res.redirect('login');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'auth_provider_default_secure_fallback', {
            issuer: 'auth-provider'
        });
        req.admin = decoded;
        next();
    } catch (error) {
        res.clearCookie('auth_provider_admin_token');
        if (req.path.startsWith('/api/')) {
            return res.status(401).json({ message: 'Unauthorized. Invalid token.' });
        }
        return res.redirect('login');
    }
};
