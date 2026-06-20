const path = require("path");
const compression = require("compression");
const cors = require("cors");
const express = require("express");
const helmet = require("helmet");
const mongoose = require("mongoose");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const config = require("./config");
const subscriberRoutes = require("./routes/subscriberRoutes");
const adminRoutes = require("./routes/adminRoutes");
const { listSubscribers } = require("./controllers/adminController");
const { basicAuth } = require("./middleware/auth");

const app = express();
mongoose.set("bufferCommands", false);

const limiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));
app.use(cors({ origin: config.corsOrigin === "*" ? true : config.corsOrigin }));
app.use(compression());
app.use(express.json({ limit: "32kb" }));
app.use(limiter);
app.use(morgan(config.env === "production" ? "combined" : "dev"));

app.use(express.static(config.frontendPath));
app.use("/admin", express.static(path.join(config.frontendPath, "admin")));
app.use("/api", subscriberRoutes);
app.get("/api/subscribers", basicAuth, listSubscribers);
app.use("/api/admin", adminRoutes);
app.get("/favicon.ico", (_req, res) => res.status(204).end());

app.get("/api/status", (_req, res) => {
  res.json({
    ok: true,
    service: "VOIDFORGE",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
});

app.get("*", (_req, res) => {
  res.sendFile(path.join(config.frontendPath, "index.html"));
});

app.use((err, _req, res, _next) => {
  const status = err.status || 500;
  const message = status >= 500 ? "VOIDFORGE relay fault." : err.message;
  if (status >= 500) console.error(err);
  res.status(status).json({ message });
});

async function connectDatabase() {
  try {
    await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log("VOIDFORGE database connected");
  } catch (error) {
    console.error(`VOIDFORGE database offline: ${error.message}`);
  }
}

function start() {
  connectDatabase();
  app.listen(config.port, () => {
    console.log(`VOIDFORGE API online on port ${config.port}`);
  });
}

start();

module.exports = app;
