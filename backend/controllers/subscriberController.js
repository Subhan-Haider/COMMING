const Subscriber = require("../models/Subscriber");
const { sendWelcomeEmail } = require("../services/mailService");

async function subscribe(req, res, next) {
  try {
    const subscriber = await Subscriber.findOneAndUpdate(
      { email: req.body.email },
      { email: req.body.email, status: "active" },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    sendWelcomeEmail(subscriber.email).catch((error) => {
      console.error("Failed to send welcome email", error.message);
    });

    res.status(201).json({
      message: "Signal locked. Welcome to VOIDFORGE.",
      subscriber: {
        email: subscriber.email,
        status: subscriber.status,
        createdAt: subscriber.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { subscribe };
