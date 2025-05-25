const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const User = require('../models/User'); // <-- Only one import here!
const GoogleStrategy = require('passport-google-oauth20').Strategy;

module.exports = function() {
  passport.use(new LocalStrategy(
    async (username, password, done) => {
      try {
        console.log('Login attempt:', username); // Debug log
        const user = await User.findOne({ username });
        if (!user) {
          console.error('User not found');
          return done(null, false, { message: 'Incorrect username.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          console.error('Incorrect password');
          return done(null, false, { message: 'Incorrect password.' });
        }

        console.log('Login successful'); // Debug log
        return done(null, user);

      } catch (err) {
        console.error('Auth error:', err); // Debug log
        return done(err);
      }
    }
  ));

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Try to find the user by googleId
          let user = await User.findOne({ googleId: profile.id });
          if (user) {
            return done(null, user);
          }
          // If not found, check if a user exists with the same email
          user = await User.findOne({ email: profile.emails[0].value });
          if (user) {
            // Link Google account to existing user
            user.googleId = profile.id;
            user.displayName = profile.displayName || user.displayName;
            user.profileImage = profile.photos?.[0]?.value || user.profileImage;
            await user.save();
            return done(null, user);
          }
          // Otherwise, create a new user
          const newUser = await User.create({
            googleId: profile.id,
            username: profile.displayName,
            email: profile.emails[0].value,
            displayName: profile.displayName,
            profileImage: profile.photos?.[0]?.value
          });
          return done(null, newUser);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
};
