const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

function resolveFromBackend(value, fallback) {
  const target = value || fallback;
  return path.isAbsolute(target) ? target : path.resolve(__dirname, target);
}

const config = {
  env: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/voidforge",
  corsOrigin: process.env.CORS_ORIGIN || "*",
  adminUser: process.env.ADMIN_USER || "admin",
  adminPassword: process.env.ADMIN_PASSWORD || "change-this-password",
  rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX || 120),
  frontendPath: resolveFromBackend(process.env.FRONTEND_PATH, "../frontend"),
  smtp: {
    enabled: process.env.SMTP_ENABLED === "true",
    from: process.env.SMTP_FROM || "support@voidforge.local",
    host: process.env.SMTP_HOST || "",
    port: Number(process.env.SMTP_PORT || 587),
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
    secure: process.env.SMTP_SECURE === "true",
  },
};

module.exports = config;
