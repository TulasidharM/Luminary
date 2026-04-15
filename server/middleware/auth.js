const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'luminary_secret_dev';

module.exports = (req, res, next) => {
  const authHeader = req.header('Authorization');
  console.log("auth : " + authHeader);
  if (!authHeader) return res.status(401).json({ message: 'Access denied. No token provided.' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (ex) {
    res.status(401).json({ message: 'Invalid token.' });
  }
};