require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');
const morgan = require('morgan');
const csrf = require('csurf');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const methodOverride = require('method-override');

const app = express();

// ====== Database connection ======
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected Successfully!'))
.catch(err => {
  console.error('MongoDB Connection Error:', err.message);
  process.exit(1);
});

// ====== Middleware ======
app.use(cors({
  origin: "http://localhost:3000", // React frontend
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 3600000, secure: false, httpOnly: true }
}));
app.use(flash());

// ====== Passport ======
require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());

// ====== View engine ======
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// ====== CSRF and global variables ======
app.use((req, res, next) => {
  res.locals.user = req.user;
  res.locals.messages = req.flash();
  try {
    res.locals.csrfToken = req.csrfToken();
  } catch (err) {
    res.locals.csrfToken = null;
  }
  next();
});

// ====== Routes ======
app.use('/auth', require('./routes/authRoutes'));
app.use('/posts', require('./routes/postRoutes'));
app.use('/notifications', require('./routes/notificationRoutes')); // Notification API
app.use('/', require('./routes/userRoutes'));

// Home route
app.get('/', (req, res) => res.redirect('/posts'));

// ====== Error handlers ======
app.use((req, res) => {
  res.status(404).render('404', {
    title: 'Page Not Found',
    user: req.user
  });
});
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('500', {
    title: 'Server Error',
    error: process.env.NODE_ENV === 'development' ? err : null,
    user: req.user
  });
});

// ====== Socket.io setup using socket.js ======
const http = require('http');
const server = http.createServer(app);
const io = require('./socket').init(server);

io.on('connection', (socket) => {
  console.log("Socket connected:", socket.id);
  // Optional: test notification
  // socket.emit('notification', {
  //   message: "🚀 This is a test notification from the backend!",
  //   createdAt: new Date()
  // });
});

// ====== Start server ======
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});