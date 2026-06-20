# VOIDFORGE

VOIDFORGE is a production-ready futuristic AI space experience system with a cinematic Three.js landing page, webcam HUD module, email waitlist API, MongoDB subscriber storage, and protected admin dashboard.

## Structure

```text
/frontend
  index.html
  styles.css
  app.js
  threejs-engine.js
  /admin
    index.html
    admin.css
    admin.js

/backend
  server.js
  config.js
  package.json
  .env.example
  /routes
  /models
  /controllers
  /middleware
```

## Frontend

- Fullscreen Three.js warp tunnel, starfield, black hole pull, camera tilt, pointer inertia, and mobile touch input.
- Minimal VOIDFORGE coming soon page with live countdown.
- Email subscription form connected to `POST /api/subscribe`.
- Webcam module using `getUserMedia`. It only displays the live local stream and does not record, upload, or store camera data.
- HUD status panels with animated system indicators.

Open `frontend/index.html` directly for a static preview, or serve it through the backend for full API integration.

## Backend API

Base server: Express + MongoDB via Mongoose.

Routes:

```text
POST /api/subscribe
GET  /api/status
GET  /api/subscribers           admin basic auth
GET  /api/admin/subscribers     admin basic auth
DELETE /api/admin/subscribers/:id admin basic auth
```

Subscriber schema:

```js
{
  email: String, unique, lowercase, required,
  status: "active" | "inactive",
  createdAt: Date,
  updatedAt: Date
}
```

Security included:

- Rate limiting with `express-rate-limit`.
- Email validation with `validator`.
- Helmet headers.
- CORS configuration through `.env`.
- HTTP Basic authentication for admin routes.
- Optional SMTP welcome email for new waitlist subscribers.

## Local Setup

1. Install MongoDB locally or create a MongoDB Atlas cluster.
2. Install backend dependencies:

```bash
cd backend
npm install
```

3. Create your environment file:

```bash
cp .env.example .env
```

4. Edit `backend/.env`:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/voidforge
CORS_ORIGIN=http://localhost:5000
ADMIN_USER=admin
ADMIN_PASSWORD=replace-with-a-long-random-password
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=120
FRONTEND_PATH=../frontend
SMTP_ENABLED=false
SMTP_FROM=support@example.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-address@gmail.com
SMTP_PASS=your-app-password
SMTP_SECURE=false
```

For Gmail, use an app password and keep `SMTP_SECURE=false` with port `587`.

5. Start the server:

```bash
npm run dev
```

6. Visit:

```text
http://localhost:5000
http://localhost:5000/admin
```

## Admin Dashboard

The admin dashboard is served from `/admin`.

Use the credentials from:

```env
ADMIN_USER
ADMIN_PASSWORD
```

Features:

- Login through Basic Auth.
- View total and active subscribers.
- List emails and timestamps.
- Delete subscribers.

## Deployment On Linux VPS

Install Node.js, MongoDB, and PM2:

```bash
sudo apt update
sudo apt install -y nodejs npm mongodb
sudo npm install -g pm2
```

Clone or upload the project:

```bash
cd /var/www/voidforge/backend
npm ci --omit=dev
cp .env.example .env
nano .env
```

Production `.env` example:

```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/voidforge
CORS_ORIGIN=https://voidforge.example.com
ADMIN_USER=admin
ADMIN_PASSWORD=use-a-long-random-secret
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=120
FRONTEND_PATH=/var/www/voidforge/frontend
```

Run with PM2:

```bash
pm2 start server.js --name voidforge-api
pm2 save
pm2 startup
```

Nginx reverse proxy example:

```nginx
server {
  server_name voidforge.example.com;

  location / {
    proxy_pass http://127.0.0.1:5000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

Enable HTTPS with Certbot:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d voidforge.example.com
```

## Vercel Or Netlify Frontend

You can host `/frontend` on Vercel or Netlify and keep the API on your VPS.

Add this before the frontend scripts in `frontend/index.html`, or inject it through your hosting platform:

```html
<script>
  window.VOIDFORGE_API_BASE = "https://api.voidforge.example.com";
</script>
```

Then set backend CORS:

```env
CORS_ORIGIN=https://voidforge.example.com
```

## Production Notes

- Use HTTPS. Browsers require a secure origin for webcam access, except on localhost.
- Change the default admin password before public deployment.
- Use MongoDB Atlas or a backed-up MongoDB instance for production.
- Keep `ADMIN_PASSWORD` and `MONGO_URI` out of source control.
- Add uptime monitoring against `/api/status`.
