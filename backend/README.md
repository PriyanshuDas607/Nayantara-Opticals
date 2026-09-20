# Nayantara Opticals - Enterprise Production Backend API

Production-grade, secure, and scalable REST API backend for **Nayantara Opticals** (Optical Commerce & Healthcare Platform).

---

## Architecture & Technology Stack

- **Runtime & Language**: Node.js (v20+) + TypeScript
- **Database & ORM**: PostgreSQL 16 + Prisma ORM (30+ normalized models, UUID primary keys, integer paise currency)
- **Caching & Sessions**: Redis / ioredis
- **Authentication**: JWT Access Token (15m) + Refresh Token Rotation with device fingerprinting and token reuse detection
- **Security**: Argon2 / Bcrypt (12 salt rounds), Helmet security headers, CORS, Zod schema validation, Rate limiters, and Disposable Email Blocker (1000+ domains)
- **Object Storage**: AWS S3 / Cloudflare R2 private bucket with short-lived presigned upload and download URLs (5m expiry) and mandatory audit logging
- **Payment Gateway**: Razorpay Orders API + HMAC-SHA256 signature verification + Webhook idempotency protection
- **Notifications**: Multi-channel notification engine (Email via Resend/SES, SMS via Fast2SMS/Twilio, WhatsApp via Meta Cloud API)
- **Analytics**: Privacy-conscious active visible-tab heartbeat tracking (15-30s) using Page Visibility API
- **Virtual Try-On**: Dedicated session contracts and feature flags (ready for Claude / computer-vision model pipeline)
- **Documentation**: Swagger UI at `/docs` and Postman / Bruno collection export

---

## Directory Structure

```
backend/
├── src/
│   ├── config/               # Environment & server configuration
│   ├── constants/            # Role permissions matrix & error codes
│   ├── controllers/          # Request handling & HTTP response mapping
│   │   ├── auth.controller.ts
│   │   ├── product.controller.ts
│   │   ├── appointment.controller.ts
│   │   ├── prescription.controller.ts
│   │   ├── cart.controller.ts
│   │   ├── order.controller.ts
│   │   ├── admin.controller.ts
│   │   ├── owner.controller.ts
│   │   ├── analytics.controller.ts
│   │   ├── virtual-try-on.controller.ts
│   │   └── webhook.controller.ts
│   ├── middlewares/          # Auth, RBAC, Validation, Error Handler, Rate Limiters
│   ├── services/             # Pure Business Logic Layer
│   │   ├── auth.service.ts
│   │   ├── token.service.ts
│   │   ├── product.service.ts
│   │   ├── appointment.service.ts
│   │   ├── prescription.service.ts
│   │   ├── storage.service.ts
│   │   ├── cart.service.ts
│   │   ├── order.service.ts
│   │   ├── payment.service.ts
│   │   ├── notification.service.ts
│   │   ├── analytics.service.ts
│   │   ├── audit.service.ts
│   │   └── virtual-try-on.service.ts
│   ├── validation/           # Zod schemas for all request payloads
│   ├── docs/                 # Swagger config & Postman collection
│   ├── utils/                # Crypto, Phone, Logger, Prisma singleton
│   ├── app.ts                # Express application setup
│   └── server.ts             # Server entry point & graceful shutdown
├── prisma/
│   ├── schema.prisma         # 30+ PostgreSQL Prisma models
│   └── seed.ts               # Super Admin, Owner, Store, Categories & Products seed
├── tests/                    # Vitest unit & integration test suites
├── Dockerfile                # Multi-stage production Dockerfile
├── docker-compose.yml        # PostgreSQL, Redis & API composition
├── .env.example              # Environment variables template
└── package.json
```

---

## Quick Start & Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 3. Database Migration & Seeding
```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations against PostgreSQL
npm run prisma:migrate

# Seed Super Admin, Owner, Store, Categories & Sample Products
npm run prisma:seed
```

### 4. Run Development Server
```bash
npm run dev
```

Server will start on `http://localhost:5000`:
- **API Base**: `http://localhost:5000/api/v1`
- **Health Check**: `http://localhost:5000/api/v1/health`
- **Swagger Docs**: `http://localhost:5000/docs`

---

## Docker Setup

To start PostgreSQL, Redis, and the Backend API in containers:
```bash
docker-compose up -d --build
```

---

## Running Automated Tests

```bash
npm run test
```

---

## Role-Based Access Control (RBAC) Matrix

| Role | Description | Permissions |
| --- | --- | --- |
| **SUPER_ADMIN** | Highest privilege administrator | Full system access: manage owners, stores, products, orders, appointments, prescriptions, payment settings, audit logs, and global analytics. |
| **OWNER** | Store owner / Optician manager | Scoped to assigned store: manage store products, store appointments, store orders, and store-level engagement analytics. |
| **CUSTOMER** | End user / Eyewear buyer | Self-service: browse products, manage cart, checkout, view own orders, upload prescriptions, book appointments. |

---

## API Endpoints Overview (`/api/v1`)

### Authentication (`/api/v1/auth`)
- `POST /auth/register` - Register customer account
- `POST /auth/login` - Email/phone + password login
- `POST /auth/phone-otp/request` - Request numeric mobile OTP
- `POST /auth/phone-otp/verify` - Verify OTP & login
- `POST /auth/forgot-password/request` - Request password reset OTP
- `POST /auth/reset-password` - Reset password with verified OTP
- `POST /auth/refresh` - Rotate refresh token (with reuse detection)
- `POST /auth/logout` - Revoke current device session
- `POST /auth/logout-all` - Revoke all active sessions
- `GET  /auth/me` - Get current authenticated profile

### Products & Categories (`/api/v1/products`)
- `GET /products` - Filtered public catalog (category, shape, material, gender, price, search)
- `GET /products/:id` - Single product by slug or UUID
- `GET /products/categories` - List active product categories

### Appointments (`/api/v1/appointments`)
- `GET  /appointments/slots?date=YYYY-MM-DD` - Dynamic slot availability (prevents double-booking)
- `POST /appointments` - Book appointment
- `GET  /appointments/me` - Customer appointment history
- `PATCH /appointments/:id/cancel` - Cancel appointment

### Prescription Vault (`/api/v1/prescriptions`)
- `POST /prescriptions/upload-url` - Presigned S3 upload URL (MIME check & size validation)
- `POST /prescriptions/complete-upload` - Complete prescription upload
- `POST /prescriptions/manual` - Submit OD/OS manual optical prescription
- `GET  /prescriptions/me` - Customer prescriptions list
- `GET  /prescriptions/:id/download-url` - Authorized, audited signed download URL (5m expiry)

### Cart & Orders (`/api/v1/cart`, `/api/v1/orders`)
- `GET    /cart` - View cart with server-side price & stock verification
- `POST   /cart/items` - Add item to cart
- `PATCH  /cart/items/:id` - Update quantity
- `DELETE /cart/items/:id` - Remove item
- `POST   /orders/validate-checkout` - Server-side price & inventory validation
- `POST   /orders/create` - Place order (COD or Razorpay online)
- `POST   /orders/verify-payment` - Verify Razorpay payment signature
- `GET    /orders/me` - Customer orders history
- `GET    /orders/me/:id` - Single order details

### Owner Dashboard (`/api/v1/owner`)
- `POST   /owner/products` - Create store product
- `PATCH  /owner/products/:id` - Update store product
- `DELETE /owner/products/:id` - Delete store product
- `GET    /owner/appointments` - List store appointments
- `PATCH  /owner/appointments/:id/status` - Update appointment status
- `GET    /owner/orders` - List store orders
- `PATCH  /owner/orders/:id/status` - Update order status

### Admin Dashboard (`/api/v1/admin`)
- `POST   /admin/owners` - Create & invite store owner (Admin only)
- `GET    /admin/owners` - List all store owners
- `PATCH  /admin/owners/:id/status` - Activate/Deactivate owner
- `GET    /admin/stores` - List stores
- `POST   /admin/stores` - Create store
- `GET    /admin/prescriptions` - All prescriptions with audit tracking
- `GET    /admin/analytics/global` - Global engagement metrics
- `GET    /admin/audit-logs` - System audit log records

### Privacy-Aware Analytics (`/api/v1/analytics`)
- `POST /analytics/event` - Track analytics event
- `POST /analytics/heartbeat` - Active visible-tab heartbeat (excludes background tabs)
- `POST /analytics/session/end` - Beacon session closure
- `GET  /analytics/top-pages` - Top pages by active visible time

### Virtual Try-On Preparation (`/api/v1/virtual-try-on`)
- `POST /virtual-try-on/session` - Create try-on session & get face upload URL
- `GET  /virtual-try-on/:id` - Check try-on rendering status

### Webhooks (`/api/v1/webhooks`)
- `POST /webhooks/razorpay` - Idempotent Razorpay payment webhook handler
