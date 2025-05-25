const User = require('../models/User');
const passport = require('passport');
const { registerValidation, loginValidation } = require('../utils/validators');

// Handle registration (POST /register)
exports.postRegister = async (req, res) => {
  const { error } = registerValidation(req.body);
  if (error) {
    return res.status(400).json({ success: false, message: error.details[0].message });
  }
  try {
    const { username, password } = req.body;
    let user = await User.findOne({ username });
    if (user) {
      return res.status(409).json({ success: false, message: "Username already exists" });
    }
    user = new User({ username, password });
    await user.save();
    return res.json({ success: true, message: "Registration successful. Please log in." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Handle login (POST /login) - handled by Passport, but validation function left for reference
exports.postLogin = (req, res, next) => {
  const { error } = loginValidation(req.body);
  if (error) {
    return res.status(400).json({ success: false, message: error.details[0].message });
  }
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.status(401).json({ success: false, message: info?.message || "Invalid credentials" });
    }
    req.logIn(user, (err) => {
      if (err) return next(err);
      return res.json({ success: true, message: "Login successful", user: { _id: user._id, username: user.username, isAdmin: user.isAdmin } });
    });
  })(req, res, next);
};

// For use as a callback in /login after passport.authenticate
exports.loginSuccess = (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Login failed" });
  }
  res.json({
    success: true,
    user: {
      _id: req.user._id,
      username: req.user.username,
      isAdmin: req.user.isAdmin,
      displayName: req.user.displayName,
      profileImage: req.user.profileImage,
      email: req.user.email
    }
  });
};

// Handle logout
exports.logout = (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ success: false, message: "Logout failed" });
    }
    res.json({ success: true, message: "You have been logged out" });
  });
};
