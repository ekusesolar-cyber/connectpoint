# ConnectPoint â€” Hotspot Monetization & Access Management Platform

Turn any internet connection into a managed Wi-Fi hotspot business. ConnectPoint helps schools, hostels, cafÃ©s, shops, offices, transport operators, communities, and Starlink owners monetize their internet connection with paid and free Wi-Fi access management.

## Architecture

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚              Frontend (Next.js 14)                    â”‚
â”‚  Next.js App Router â”‚ Tailwind CSS â”‚ next-intl       â”‚
â”‚  shadcn/ui â”‚ Recharts â”‚ TanStack Query               â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                   â”‚ REST API (HTTP/JSON)
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚              Backend (Express + TypeScript)           â”‚
â”‚  JWT Auth â”‚ Prisma ORM â”‚ Zod Validation              â”‚
â”‚  Flutterwave â”‚ SendGrid â”‚ node-cron                  â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                   â”‚
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚     PostgreSQL   â”‚     FreeRADIUS (UDP 1812/1813)   â”‚
â”‚  Users/Packages  â”‚  radcheck / radacct / nas tables â”‚
â”‚  Vouchers/Sessionsâ”‚                                  â”‚
â”‚  Transactions    â”‚     MikroTik RouterOS             â”‚
â”‚  Audit Logs      â”‚  Hotspot / RADIUS Client         â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| **UI** | shadcn/ui (Radix Primitives), Lucide Icons, Recharts |
| **i18n** | next-intl (English + French) |
| **State** | TanStack Query, React Context (Auth) |
| **Backend** | Node.js, Express, TypeScript |
| **ORM** | Prisma (PostgreSQL) |
| **Validation** | Zod |
| **Auth** | JWT (access + refresh tokens), bcrypt |
| **Payments** | Flutterwave (XAF), Paystack structure, MTN MoMo/Orange Money structure |
| **Email** | SendGrid (Nodemailer transport) |
| **RADIUS** | FreeRADIUS + PostgreSQL (radcheck/radacct) |
| **Router** | MikroTik RouterOS (RADIUS client) |
| **Infrastructure** | Docker Compose, Vercel (frontend), Railway (backend + DB) |

## Project Structure

```
ConnectPoint/
â”œâ”€â”€ apps/
â”‚   â”œâ”€â”€ frontend/              # Next.js 14 (Vercel)
â”‚   â”‚   â”œâ”€â”€ src/app/[locale]/  # Pages: landing, auth, dashboard, admin, portal
â”‚   â”‚   â”œâ”€â”€ src/components/    # UI components (shadcn), shared, landing, dashboard
â”‚   â”‚   â”œâ”€â”€ src/lib/           # API client, auth context, utils, query provider
â”‚   â”‚   â””â”€â”€ messages/          # en.json, fr.json (next-intl)
â”‚   â””â”€â”€ backend/               # Express API (Railway)
â”‚       â”œâ”€â”€ src/
â”‚       â”‚   â”œâ”€â”€ routes/        # auth, owner, admin, portal, payments, radius
â”‚       â”‚   â”œâ”€â”€ controllers/   # Request handlers
â”‚       â”‚   â”œâ”€â”€ services/      # Business logic
â”‚       â”‚   â”œâ”€â”€ middleware/    # auth, rbac, audit
â”‚       â”‚   â”œâ”€â”€ config/        # database, env
â”‚       â”‚   â””â”€â”€ utils/         # helpers, flutterwave
â”‚       â”œâ”€â”€ prisma/            # schema.prisma, migrations, seed.ts
â”‚       â””â”€â”€ radius/            # FreeRADIUS config templates
â””â”€â”€ packages/
    â””â”€â”€ shared/                # @connectpoint/shared (types, constants, validators)
```

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm 8+ (`npm install -g pnpm`)
- PostgreSQL 16
- Docker (optional, for RADIUS)

### 1. Clone & Install

```bash
git clone https://github.com/your-org/ConnectPoint.git
cd ConnectPoint
pnpm install
```

### 2. Environment Variables

```bash
cp .env.example .env
# Edit .env with your settings
```

Required variables:
- `DATABASE_URL` â€” PostgreSQL connection string
- `JWT_SECRET` â€” Random 64-char string
- `JWT_REFRESH_SECRET` â€” Different random 64-char string
- `FLUTTERWAVE_*` â€” Flutterwave API keys (get from https://dashboard.flutterwave.com)
- `SENDGRID_API_KEY` â€” SendGrid API key for emails
- `FRONTEND_URL` â€” e.g. `http://localhost:3000`

### 3. Database Setup

```bash
# Generate Prisma client
cd apps/backend
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed demo data
pnpm prisma:seed
```

### 4. Run Development

```bash
# From root â€” runs both frontend and backend
pnpm dev
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:4000/api
- Health check: http://localhost:4000/api/health

### 5. Demo Credentials

After seeding:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@connectpoint.io | Admin123! |
| **Hotspot Owner** | owner@connectpoint.io | Owner123! |
| **Test Voucher** | Code: `FREE12345678` | PIN: `1234` |

## Deployment

### Vercel (Frontend)

```bash
cd apps/frontend
npx vercel --prod
```

Set environment variables in Vercel dashboard:
- `NEXT_PUBLIC_API_URL` â€” Your Railway backend URL

### Railway (Backend + Database)

```bash
# Deploy PostgreSQL
railway add postgres

# Deploy backend
railway up
```

Set environment variables in Railway dashboard.

### Docker (Full Stack)

```bash
docker-compose up -d
```

## Modules

### 1. Hotspot Owner Dashboard
- Register/login with email
- KYC verification (upload ID, business info)
- Add/manage hotspot locations
- Create internet packages (time/data/speed/unlimited)
- Generate single or bulk vouchers
- View active users with disconnect/block
- Revenue tracking with charts
- Usage reports
- Withdrawal requests
- Profile settings

### 2. Admin Dashboard
- Manage hotspot owners (suspend/unsuspend)
- Approve/reject KYC submissions
- View all hotspots and transactions
- Set platform commission rate
- Manage subscription plans
- System analytics
- Audit log viewer

### 3. Captive Portal
- Mobile-first, hotspot-branded login page
- Voucher code login
- Package purchase with Flutterwave (XAF)
- Session status (time/data remaining)
- Sponsor advertisement support
- Terms & conditions acceptance

### 4. Payment System
- **Flutterwave** â€” Primary payment gateway (XAF)
- **MTN MoMo** â€” Structure ready for Cameroon
- **Orange Money** â€” Structure ready for Cameroon
- Automatic session activation on payment success
- Webhook verification (HMAC-SHA256)

### 5. RADIUS Integration
- **FreeRADIUS** â€” Authentication and accounting
- **MikroTik RouterOS** â€” Configured as RADIUS client
- Automatic RADIUS user creation on package purchase
- Time/data/speed limits via RADIUS attributes
- Session expiry auto-disconnect
- Accounting data sync (data used, time used)

## API Overview

| Group | Prefix | Auth |
|-------|--------|------|
| Auth | `/api/auth` | Public |
| Owner Dashboard | `/api/owner` | JWT (hotspot_owner) |
| Admin Dashboard | `/api/admin` | JWT (admin) |
| Captive Portal | `/api/portal/:hotspotId` | Public |
| Payments | `/api/payments` | Mixed |
| RADIUS | `/api/radius` | Mixed |

### Key Endpoints

```
POST   /api/auth/register          # Register hotspot owner
POST   /api/auth/login             # Login, returns JWT tokens
POST   /api/auth/refresh           # Refresh access token
GET    /api/auth/me                # Current user profile

GET    /api/owner/dashboard        # Owner dashboard stats
POST   /api/owner/kyc              # Submit KYC
GET    /api/owner/hotspots         # List hotspots
POST   /api/owner/packages         # Create package
POST   /api/owner/vouchers/generate  # Generate vouchers
GET    /api/owner/sessions/active  # Active users
GET    /api/owner/revenue          # Revenue report
POST   /api/owner/withdrawals      # Request withdrawal

GET    /api/admin/kyc/pending      # Pending KYC queue
PUT    /api/admin/kyc/:id/approve  # Approve KYC
GET    /api/admin/transactions     # All transactions
PUT    /api/admin/commission       # Set platform commission
GET    /api/admin/analytics        # System analytics

GET    /api/portal/:hotspotId/packages   # Available packages
POST   /api/portal/:hotspotId/login/voucher  # Voucher login
POST   /api/portal/:hotspotId/purchase   # Buy package

POST   /api/payments/initialize    # Initialize Flutterwave payment
POST   /api/payments/webhook/flutterwave  # Flutterwave webhook
POST   /api/radius/accounting      # RADIUS accounting
```

## MikroTik Setup Guide

### Configure your MikroTik router as a RADIUS client:

1. Connect to your MikroTik via WinBox or SSH

2. Add RADIUS server:
```
/radius add address=YOUR_SERVER_IP secret=testing123 service=hotspot
```

3. Configure hotspot to use RADIUS:
```
/ip hotspot profile set [find] use-radius=yes
```

4. Set RADIUS accounting:
```
/radius add address=YOUR_SERVER_IP secret=testing123 service=hotspot accounting-port=1813
```

5. (Optional) Use MikroTik User Manager (built-in RADIUS):
- Go to: System â†’ User Manager â†’ Router
- Add your ConnectPoint server as RADIUS client
- Users are created automatically by the platform

### Alternative: FreeRADIUS VPS

If not using MikroTik User Manager, deploy FreeRADIUS on a $5/mo VPS:

```bash
# Install FreeRADIUS with PostgreSQL support
apt update && apt install freeradius freeradius-postgresql

# Copy config templates
cp apps/backend/radius/* /etc/freeradius/3.0/

# Run SQL schema
psql -h YOUR_DB_HOST -U ConnectPoint -d ConnectPoint -f apps/backend/radius/sql/postgresql/schema.sql

# Restart FreeRADIUS
systemctl restart freeradius
```

## Database Tables (PostgreSQL)

| Table | Purpose |
|-------|---------|
| `users` | Platform users (admins, hotspot owners) |
| `kyc_profiles` | KYC verification documents |
| `hotspots` | Managed Wi-Fi locations/routers |
| `packages` | Internet access plans (time/data/speed) |
| `vouchers` | Pre-generated access codes |
| `customers` | End-users connecting to Wi-Fi |
| `sessions` | Active/expired RADIUS sessions |
| `transactions` | Payment records |
| `withdrawals` | Owner payout requests |
| `advertisements` | Sponsor ads |
| `subscriptions` | Owner billing plans |
| `audit_logs` | Security audit trail |
| `refresh_tokens` | JWT refresh token storage |
| `radcheck` | FreeRADIUS auth attributes |
| `radacct` | FreeRADIUS accounting data |
| `radusergroup` | FreeRADIUS group assignments |
| `nas` | FreeRADIUS NAS clients |

## Security

- **Password hashing**: bcrypt (12 rounds)
- **Authentication**: JWT (15min access + 7-day refresh tokens)
- **Role-based access**: admin, hotspot_owner (checked by middleware)
- **Webhook verification**: HMAC-SHA256 for Flutterwave
- **Input validation**: Zod schemas on all API endpoints
- **Rate limiting**: 100 requests/minute per IP
- **SQL injection prevention**: Prisma ORM (parameterized queries)
- **CORS**: Whitelist frontend domain only
- **XSS protection**: Helmet middleware
- **Audit trail**: All admin/owner mutations logged
- **Data privacy**: No card storage, GDPR-ready, explicit consent

## Currency

All transactions are processed in **XAF** (Central African CFA franc). Primary payment provider is **Flutterwave** (supports XAF for Cameroon). MTN MoMo Cameroon and Orange Money Cameroon are pre-structured for future activation.

## i18n

English and French supported via next-intl:
- `/en/...` â€” English
- `/fr/...` â€” French
- Locale auto-detected from browser Accept-Language
- Captive portal respects hotspot owner's configured default

## License

MIT
