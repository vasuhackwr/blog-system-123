const Post = require('../models/Post');

// Check if user is authenticated (for API)
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  // API: return 401 instead of redirect
  return res.status(401).json({ error: 'Unauthorized' });
};

// Check if user is the author of the post
const isAuthor = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    if (post.createdBy.equals(req.user._id)) {
      return next();
    }
    return res.status(403).json({ error: 'You are not authorized to perform this action' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// Check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    return next();
  }
  return res.status(403).json({ error: 'Admin access required' });
};

module.exports = {
  isAuthenticated,
  ensureAuth: isAuthenticated, // Alias for consistency
  isAuthor,
  isAdmin,
};
