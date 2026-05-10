# 🛡️ Auth Provider

A lightweight authentication and authorization token provisioning system, built to regulate access control for custom desktop applications.

## ✨ Features
- **Application Provisioning**: Register new desktop apps to generate Unique `App IDs` and `API Keys`.
- **Alias Identification**: Attach descriptive Usernames/Names to authorized emails for clear tracking.
- **Nested Activity Audits**: Track `LOGIN` and `LOGOUT` sequences with precise timestamps on a per-user level.
- **Instant Revocations**: Toggle "Blocked" statuses or permanently "Remove" credentials with zero latency.

## 🛠️ Installation & Local Run

1. Install Dependencies using PNPM (Optimized storage)
```bash
pnpm install
```

2. Setup `.env` file:
```env
PORT=3000
JWT_SECRET=your_secret_here
JWT_EXPIRE=24h
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
DATABASE_PATH=./data/database.sqlite
```

3. Start in Dev Mode:
```bash
pnpm run dev
```

## 🚀 Deployment (AWS with PM2)

1. Clone repo to your EC2 instance.
2. Ensure Node & PM2 are installed globally: `npm i -g pm2`.
3. Run the app process using ecosystem config:
```bash
pm2 start ecosystem.config.js
pm2 save
```
