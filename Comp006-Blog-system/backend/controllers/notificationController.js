const Notification = require('../models/Notification');

// Get unseen notifications for the logged-in user
exports.getUnseenNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipientId: req.user._id,
      seen: false
    }).populate('postId');
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Mark all notifications as seen for the user
exports.markNotificationsAsSeen = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipientId: req.user._id, seen: false },
      { $set: { seen: true } }
    );
    res.sendStatus(200);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
