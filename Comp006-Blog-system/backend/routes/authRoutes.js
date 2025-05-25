const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const passport = require('passport');

// ================== Local Authentication Routes ==================

// Register user
router.post('/register', authController.postRegister);

// Local login
router.post('/login',
  passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }),
  authController.loginSuccess
);

// Logout
router.get('/logout', authController.logout);

// ================== Google OAuth Routes ==================

// Start Google authentication
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google OAuth callback
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', failureFlash: true }),
  (req, res) => {
    // On success, redirect to React frontend home page (adjust URL if needed)
    res.redirect('http://localhost:3000/');
  }
);

module.exports = router;
