const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const { ensureAuth } = require('../utils/middleware');

router.post('/subscribe', ensureAuth, subscriptionController.subscribe);
router.post('/unsubscribe', ensureAuth, subscriptionController.unsubscribe);
router.get('/', ensureAuth, subscriptionController.getSubscriptions);

module.exports = router;
