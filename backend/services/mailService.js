const nodemailer = require("nodemailer");
const config = require("../config");

let transporter;

function getTransporter() {
  if (!config.smtp.enabled) return null;
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.secure,
    auth: {
      user: config.smtp.user,
      pass: config.smtp.pass,
    },
  });

  return transporter;
}

async function sendWelcomeEmail(email) {
  const mailer = getTransporter();
  if (!mailer) return { skipped: true };

  await mailer.sendMail({
    from: `"VOIDFORGE" <${config.smtp.from}>`,
    to: email,
    subject: "VOIDFORGE signal confirmed",
    text: [
      "Welcome to VOIDFORGE.",
      "",
      "Your launch signal is locked. We will notify you when the singularity opens.",
      "",
      "No camera data is recorded or stored by VOIDFORGE.",
    ].join("\n"),
    html: `
      <div style="background:#02030a;color:#ecf7ff;font-family:Inter,Arial,sans-serif;padding:32px">
        <div style="max-width:560px;margin:auto;border:1px solid rgba(55,247,255,.35);border-radius:8px;padding:28px;background:#071025">
          <p style="color:#37f7ff;letter-spacing:.14em;text-transform:uppercase;font-size:12px;margin:0 0 12px">Signal Confirmed</p>
          <h1 style="margin:0 0 16px;font-size:34px">VOIDFORGE</h1>
          <p>Your launch signal is locked. We will notify you when the singularity opens.</p>
          <p style="color:#94a8c7;font-size:13px">No camera data is recorded or stored by VOIDFORGE.</p>
        </div>
      </div>
    `,
  });

  return { skipped: false };
}

module.exports = { sendWelcomeEmail };
