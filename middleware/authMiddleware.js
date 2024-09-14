// authMiddleware.js
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

exports.authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];

  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401); // Unauthorized

  req.token = token; 

  try {
    // Check if the token is blacklisted
    const result = await pool.query(
      'SELECT * FROM token_blacklist WHERE token = $1',
      [token]
    );

    if (result.rows.length > 0) {
      return res.status(401).json({ error: 'Token has been invalidated' });
    }

    // Verify token
    const user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Token is not valid' }); // Forbidden
  }
};


