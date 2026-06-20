const crypto = require("crypto");
const config = require("../config");

function safeEqual(left, right) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function basicAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, encoded] = header.split(" ");

  if (scheme !== "Basic" || !encoded) {
    res.set("WWW-Authenticate", "Basic realm=\"VOIDFORGE Admin\"");
    res.status(401).json({ message: "Admin credentials required." });
    return;
  }

  const decoded = Buffer.from(encoded, "base64").toString("utf8");
  const separatorIndex = decoded.indexOf(":");
  const user = separatorIndex >= 0 ? decoded.slice(0, separatorIndex) : "";
  const password = separatorIndex >= 0 ? decoded.slice(separatorIndex + 1) : "";
  if (safeEqual(user || "", config.adminUser) && safeEqual(password || "", config.adminPassword)) {
    next();
    return;
  }

  res.set("WWW-Authenticate", "Basic realm=\"VOIDFORGE Admin\"");
  res.status(401).json({ message: "Invalid admin credentials." });
}

module.exports = { basicAuth };
