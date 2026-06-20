const Subscriber = require("../models/Subscriber");

async function listSubscribers(req, res, next) {
  try {
    const subscribers = await Subscriber.find().sort({ createdAt: -1 }).lean();
    const activeCount = await Subscriber.countDocuments({ status: "active" });
    res.json({
      total: subscribers.length,
      active: activeCount,
      subscribers,
    });
  } catch (error) {
    next(error);
  }
}

async function deleteSubscriber(req, res, next) {
  try {
    const deleted = await Subscriber.findByIdAndDelete(req.params.id);
    if (!deleted) {
      res.status(404).json({ message: "Subscriber not found." });
      return;
    }
    res.json({ message: "Subscriber deleted." });
  } catch (error) {
    next(error);
  }
}

module.exports = { listSubscribers, deleteSubscriber };
