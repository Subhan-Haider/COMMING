const express = require("express");
const { deleteSubscriber, listSubscribers } = require("../controllers/adminController");
const { basicAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/subscribers", basicAuth, listSubscribers);
router.delete("/subscribers/:id", basicAuth, deleteSubscriber);

module.exports = router;
