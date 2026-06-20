const express = require("express");
const { subscribe } = require("../controllers/subscriberController");
const { validateEmail } = require("../middleware/validate");

const router = express.Router();

router.post("/subscribe", validateEmail, subscribe);

module.exports = router;
