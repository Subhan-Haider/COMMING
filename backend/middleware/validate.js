const validator = require("validator");

function validateEmail(req, _res, next) {
  const email = String(req.body.email || "").trim().toLowerCase();
  if (!validator.isEmail(email)) {
    const error = new Error("Enter a valid email address.");
    error.status = 400;
    next(error);
    return;
  }
  req.body.email = email;
  next();
}

module.exports = { validateEmail };
