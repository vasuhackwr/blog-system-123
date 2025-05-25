const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Local Auth fields
  username: {
    type: String,
    required: function() { return !this.googleId; }, // required if not Google user
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: function() { return !this.googleId; } // required if not Google user
  },
  // Google OAuth fields
  googleId: {
    type: String
  },
  displayName: {
    type: String
  },
  email: {
    type: String
  },
  profileImage: {
    type: String
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving (only if password is present)
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model('User', userSchema);
