const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            status: 'Unauthorized',
            message: 'Access token is missing'
        });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({
                status: 'Forbidden',
                message: 'Invalid token'
            });
        }
        req.user = user; 
        next();
    });
};

module.exports = {
    authenticateToken
};
