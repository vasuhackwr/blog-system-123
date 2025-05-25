const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { ensureAuth } = require('../utils/middleware');

// Protected routes
router.post('/', ensureAuth, postController.postCreatePost);
router.put('/:id', ensureAuth, postController.putEditPost);
router.delete('/:id', ensureAuth, postController.deletePost);

// Public routes
router.get('/', postController.getAllPosts);
router.get('/:id', postController.getPost);

module.exports = router;
