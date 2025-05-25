const Subscription = require('../models/Subscription');

exports.subscribe = async (req, res) => {
  const { targetUserId } = req.body;
  if (req.user._id.toString() === targetUserId) {
    return res.status(400).json({ error: "You cannot subscribe to yourself" });
  }
  try {
    const exists = await Subscription.findOne({
      subscriberId: req.user._id,
      targetUserId
    });
    if (exists) return res.status(400).json({ error: 'Already subscribed' });

    await Subscription.create({
      subscriberId: req.user._id,
      targetUserId
    });
    res.sendStatus(201);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.unsubscribe = async (req, res) => {
  const { targetUserId } = req.body;
  try {
    await Subscription.deleteOne({
      subscriberId: req.user._id,
      targetUserId
    });
    res.sendStatus(200);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getSubscriptions = async (req, res) => {
  try {
    const subs = await Subscription.find({ subscriberId: req.user._id }).populate('targetUserId');
    res.json(subs);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
