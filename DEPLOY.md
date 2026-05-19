# ConnectPoint Deployment Guide

Choose your deployment path:

| Path | Best for | Cost |
|------|----------|------|
| **A. Vercel + Railway** | MVP, low traffic, serverless | ~$10-20/mo |
| **B. Docker VPS** | Full control, RADIUS included | ~$15-30/mo |
| **C. Manual VPS** | Production, custom infra | ~$20-50/mo |

---

## A. Vercel (Frontend) + Railway (Backend + DB)

### 1. Push to GitHub

```bash
cd C:\Users\Val\wifiVend
git init
git add .
git commit -m "Initial commit"
gh repo create connectpoint --public --push
```

### 2. Deploy Backend on Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize in backend directory
cd apps/backend
railway init
railway link

# Add PostgreSQL
railway add postgresql

# Set environment variables
railway env set JWT_SECRET=$(openssl rand -hex 32)
railway env set JWT_REFRESH_SECRET=$(openssl rand -hex 32)
railway env set FRONTEND_URL=https://connectpoint.vercel.app
railway env set FLUTTERWAVE_PUBLIC_KEY=your_key
railway env set FLUTTERWAVE_SECRET_KEY=your_secret
railway env set FLUTTERWAVE_ENCRYPTION_KEY=your_enc_key
railway env set FLUTTERWAVE_WEBHOOK_SECRET=your_webhook_secret
railway env set SENDGRID_API_KEY=your_sendgrid_key
railway env set NODE_ENV=production

# Deploy
railway up

# Run migrations
railway run npx prisma migrate dev --name init

# Seed demo data
railway run npx tsx prisma/seed.ts
```

Your backend URL will be like `https://connectpoint-production.up.railway.app`.

### 3. Deploy Frontend on Vercel

```bash
cd apps/frontend
vercel login
vercel --prod
```

Set environment variables in Vercel dashboard:
| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | `https://connectpoint-production.up.railway.app/api` |

Your frontend URL will be `https://connectpoint.vercel.app`.

### 4. Update Backend CORS

```bash
railway env set FRONTEND_URL=https://connectpoint.vercel.app
```

### 5. RADIUS (Lightweight VPS)

For RADIUS with MikroTik integration, spin up a $5/mo VPS:

```bash
ssh root@your-vps
apt update && apt install freeradius freeradius-postgresql -y

# Copy configs from project
# (scp from your local to VPS)

# Connect to same Railway Postgres DB
# Edit /etc/freeradius/3.0/sql.conf with Railway DB credentials

systemctl restart freeradius
```

---

## B. Docker VPS (Full Stack + RADIUS)

### 1. Provision a VPS

Get a $15-20/mo VPS (DigitalOcean, Linode, Hetzner) with:
- 2 vCPUs, 4GB RAM
- Ubuntu 22.04
- Docker + Docker Compose installed

### 2. Clone & Deploy

```bash
ssh root@your-vps-ip

# Install Docker
curl -fsSL https://get.docker.com | sh

# Clone repo
git clone https://github.com/your-org/connectpoint.git
cd connectpoint

# Create .env
cp .env.example .env
nano .env
# Fill in: JWT_SECRET, JWT_REFRESH_SECRET, FLUTTERWAVE_*, SENDGRID_API_KEY

# Start everything
docker compose up -d
```

### 3. Run Migrations

```bash
docker exec connectpoint-backend npx prisma migrate dev --name init
docker exec connectpoint-backend npx tsx prisma/seed.ts
```

### 4. Set Up Reverse Proxy (Caddy)

```bash
docker run -d \
  --name caddy \
  -p 80:80 -p 443:443 \
  -v $PWD/Caddyfile:/etc/caddy/Caddyfile \
  -v caddy_data:/data \
  caddy:latest
```

Create `Caddyfile`:

```
connectpoint.io {
    reverse_proxy frontend:3000
}

api.connectpoint.io {
    reverse_proxy backend:4000
}

radius.connectpoint.io {
    reverse_proxy freeradius:1812
}
```

### 5. Firewall

```bash
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 1812/udp
ufw allow 1813/udp
ufw enable
```

---

## C. Manual VPS (Production)

### Backend (Express)

```bash
ssh root@your-vps

# Install Node 20 + PostgreSQL 16
curl -fsSL https://deb.nodesource.com/setup_20.x | bash
apt install nodejs postgresql postgresql-contrib -y

# Create database
sudo -u postgres psql -c "CREATE USER connectpoint WITH PASSWORD 'secure_password';"
sudo -u postgres psql -c "CREATE DATABASE connectpoint OWNER connectpoint;"

# Clone and build
git clone https://github.com/your-org/connectpoint.git
cd connectpoint/apps/backend
npm install
npx prisma generate
npx prisma migrate deploy
npm run build

# Install PM2
npm install -g pm2
pm2 start dist/index.js --name connectpoint-api
pm2 save
pm2 startup
```

### Frontend (Next.js)

```bash
cd ../frontend
npm install
npm run build

# Serve with PM2
pm2 start node_modules/.bin/next --name connectpoint-web -- start -p 3000
pm2 save
```

### Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name connectpoint.io;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name connectpoint.io;

    ssl_certificate /etc/letsencrypt/live/connectpoint.io/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/connectpoint.io/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

```bash
# SSL with Let's Encrypt
apt install certbot python3-certbot-nginx -y
certbot --nginx -d connectpoint.io -d api.connectpoint.io
```

---

## Post-Deployment Checklist

### Verify

```bash
# Health check
curl https://api.connectpoint.io/api/health
# Expected: {"status":"ok","timestamp":"...","version":"1.0.0"}

# Frontend
curl -I https://connectpoint.io
# Expected: 200 OK
```

### Configure Flutterwave Webhook

In Flutterwave dashboard → Settings → Webhook URL:
```
https://api.connectpoint.io/api/payments/webhook/flutterwave
```

Set your `FLUTTERWAVE_WEBHOOK_SECRET` as the **Secret Hash** in the dashboard.

### Test Payment Flow

1. Open `https://connectpoint.io/auth/login`
2. Login as `owner@connectpoint.io` / `Owner123!`
3. Create a hotspot → Create a test package (100 XAF)
4. Open the captive portal URL
5. Click "Buy Package" → enter test card details from Flutterwave
6. Verify session is created and RADIUS user is active

### Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@connectpoint.io | Admin123! |
| **Hotspot Owner** | owner@connectpoint.io | Owner123! |
| **Test Voucher** | Code: `FREE12345678` | PIN: `1234` |

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `JWT_SECRET` | ✅ | Random 64-char string (access tokens) |
| `JWT_REFRESH_SECRET` | ✅ | Different random 64-char string |
| `FRONTEND_URL` | ✅ | Frontend domain (CORS origin) |
| `FLUTTERWAVE_PUBLIC_KEY` | ✅ | From Flutterwave dashboard |
| `FLUTTERWAVE_SECRET_KEY` | ✅ | From Flutterwave dashboard |
| `FLUTTERWAVE_ENCRYPTION_KEY` | ✅ | From Flutterwave dashboard |
| `FLUTTERWAVE_WEBHOOK_SECRET` | ✅ | Set in Flutterwave webhook settings |
| `SENDGRID_API_KEY` | ❌ | For email notifications |

---

## Monitoring

### Railway (Backend)

Railway provides built-in logs, metrics, and alerts:
- Dashboard: live logs, CPU/memory graphs
- Alerts: response time > 5s, 5xx errors > 1%

### Vercel (Frontend)

Vercel Analytics: page views, geolocation, web vitals.

### Health Endpoint

```bash
# Simple monitoring
https://api.connectpoint.io/api/health

# Set up UptimeRobot or BetterUptime to ping this every 5 minutes
```

---

## Backup

### PostgreSQL (Railway)

Railway automatically backs up PostgreSQL daily. To manually export:

```bash
railway run pg_dump -h $PGHOST -U $PGUSER -d $PGDATABASE > backup_$(date +%Y%m%d).sql
```

### PostgreSQL (Self-hosted)

```bash
# Daily cron job
0 3 * * * pg_dump -U connectpoint connectpoint | gzip > /backups/connectpoint_$(date +\%Y\%m\%d).sql.gz
```
