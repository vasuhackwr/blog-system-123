const mongoose = require('mongoose');
const Post = require('../models/Post');
const { postValidation } = require('../utils/validators');

// Notification & Subscription models for real-time notifications
const Subscription = require('../models/Subscription');
const Notification = require('../models/Notification');

// Import Socket.IO instance getter
const { getIO } = require('../socket');

// Get all posts with optional search
exports.getAllPosts = async (req, res) => {
  try {
    const searchTerm = req.query.search;
    let query = {};

    if (searchTerm) {
      query = {
        $or: [
          { title: { $regex: searchTerm, $options: 'i' } },
          { tags: { $in: [searchTerm] } }
        ]
      };
    }

    const posts = await Post.find(query)
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 });

    res.json({ success: true, posts, searchTerm });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Get single post
exports.getPost = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ success: false, message: 'Invalid post ID' });
  }
  try {
    const post = await Post.findById(req.params.id).populate('createdBy', 'username');
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    res.json({ success: true, post });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Create new post (now with real-time notification logic)
exports.postCreatePost = async (req, res) => {
  // Log the incoming request body for debugging
  console.log("POST /posts request body:", req.body);

  // Validate the post input
  const { error } = postValidation(req.body);
  if (error) {
    console.error("Validation error:", error);
    return res.status(400).json({ success: false, message: error.details[0].message });
  }

  try {
    const { title, content, tags } = req.body;
    // If tags is already an array, use as is, else split string to array
    const tagsArray = Array.isArray(tags)
      ? tags
      : (tags ? tags.split(',').map(tag => tag.trim()) : []);

    const newPost = new Post({
      title,
      content,
      tags: tagsArray,
      createdBy: req.user._id,
    });

    await newPost.save();

    // Emit notification to all connected clients
    try {
      const io = getIO();
      io.emit("notification", { message: `New post created: ${newPost.title}` });
    } catch (e) {
      console.warn("Socket.io not initialized, notification not sent.");
    }

    res.json({ success: true, message: 'Post created successfully', post: newPost });
  } catch (err) {
    console.error("POST /posts error:", err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Update post
exports.putEditPost = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ success: false, message: 'Invalid post ID' });
  }
  const { error } = postValidation(req.body);
  if (error) {
    return res.status(400).json({ success: false, message: error.details[0].message });
  }

  try {
    const { title, content, tags } = req.body;
    const tagsArray = tags ? tags.split(',').map(tag => tag.trim()) : [];

    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { title, content, tags: tagsArray },
      { new: true }
    );

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    res.json({ success: true, message: 'Post updated successfully', post });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Delete post
exports.deletePost = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ success: false, message: 'Invalid post ID' });
  }
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    res.json({ success: true, message: 'Post deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};