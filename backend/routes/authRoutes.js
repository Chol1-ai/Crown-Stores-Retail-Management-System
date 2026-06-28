const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { login, logout, changePassword, forgotPassword, resetPassword } = require('../controllers/authController');

router.post('/login', login);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/change-password', (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'No token provided' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}, changePassword);

module.exports = router;