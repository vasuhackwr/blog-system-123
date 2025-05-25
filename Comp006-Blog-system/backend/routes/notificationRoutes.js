const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { ensureAuth } = require('../utils/middleware');

// Get unseen notifications
router.get('/', ensureAuth, notificationController.getUnseenNotifications);

// Mark notifications as seen
router.patch('/mark-seen', ensureAuth, notificationController.markNotificationsAsSeen);

module.exports = router;
