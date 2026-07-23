# E-Commerce REST API

> E-Commerce REST API built with NestJS, MongoDB, Redis, AWS S3, and Stripe, featuring authentication, role-based authorization, cart, coupons, payments, refunds, and secure order management.

![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![AWS S3](https://img.shields.io/badge/AWS_S3-FF9900?style=for-the-badge&logo=amazons3&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-635BFF?style=for-the-badge&logo=stripe&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

**Live API:** https://e-commerce-nest-js.vercel.app
**API Docs:** [Postman Documentation](https://documenter.getpostman.com/view/49715513/2sBY4QsKkG)
**GitHub:** [E-Commerce-Nest-Js](https://github.com/diaaeldeenn/E-Commerce-Nest-Js)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js + TypeScript |
| Framework | NestJS 11 |
| Database | MongoDB + Mongoose |
| Cache | Redis (ioredis) |
| File Storage | AWS S3 |
| Auth | JWT (Access + Refresh tokens) |
| Payments | Stripe (Checkout + Webhooks + Refunds) |
| Email | Nodemailer |
| Validation | class-validator + class-transformer |
| Security | Helmet, CORS, @nestjs/throttler, bcrypt |
| Deployment | Vercel |

---

## Architecture

```
src/
├── modules/
│   ├── users/
│   ├── brand/
│   ├── category/
│   ├── product/
│   ├── cart/
│   ├── coupon/
│   └── order/
├── DB/
│   ├── models/
│   └── repository/          # BaseRepository<T>
├── common/
│   ├── guards/               # AuthenticationGuard, AuthorizationGuard
│   ├── middleware/           # Multer (memory storage)
│   ├── service/              # S3Service, StripeService
│   ├── redis/
│   └── enum/
└── main.ts
```

```
Request
   ↓
Guards (Authentication → Authorization)
   ↓
Controller
   ↓
Service
   ↓
Repository (BaseRepository<T>)
   ↓
MongoDB
```

---

## Flow

```
Signup
   ↓
Verify OTP
   ↓
Login
   ↓
Browse Products
   ↓
Add to Cart
   ↓
Apply Coupon
   ↓
Create Order
   ↓
Stripe Checkout
   ↓
Webhook (checkout.session.completed)
   ↓
Order Marked as Paid
```

---

## Features

### Authentication
- Signup with email + OTP confirmation via Nodemailer
- JWT access tokens (1h) + refresh tokens (1y)
- Full forget password flow: send OTP → verify → reset
- OTP rate limiting via Redis: max 3 attempts, 5-minute block on exceed
- Passwords hashed with bcrypt
- Phone numbers encrypted at rest

### Authorization
- Role-based access control: `admin` / `user`
- `AuthenticationGuard` verifies JWT and attaches user to request
- `AuthorizationGuard` checks roles via `@SetMetadata` decorator

### Products
- Full CRUD with soft delete on all entities
- Main image + up to 5 sub-images uploaded to S3
- S3 rollback: if DB insert fails, uploaded files are deleted automatically
- Discount percentage, stock tracking, brand and category linking
- Auto slug generation via `slugify`
- Pagination with search, populated brand and category
- Wishlist toggle per user (add / remove) on `UserModel`

### Cart
- Add products with quantity validation against real-time stock
- Auto-calculates `subTotal` on every operation
- Update quantity, increase by 1, decrease by 1 (minimum guard enforced)
- Remove single product or clear entire cart
- One active cart per user (`isOrdered: false`)

### Coupons
- Admin creates coupons with validity dates, discount percentage, and minimum order price
- Custom validators: future dates only, `toDate` must be after `fromDate`
- Per-user usage tracking (each coupon usable once per user)
- Apply coupon returns discount value and final total before checkout
- Soft delete with automatic deactivation

### Orders
- **Cash on Delivery:** create order directly from cart, coupon applied if provided
- **Card (Stripe):** create Stripe Checkout Session with full product line items
- **Webhook:** listens for `checkout.session.completed`, marks order paid, stores `paymentIntent`
- **Refund:** triggers Stripe refund, restores stock, removes coupon usage, unlocks cart
- **Cancel:** cancels pending unpaid orders, restores stock and coupon usage
- Stock deducted atomically with `$gte` conditional update to prevent overselling
- Admin can get all orders with pagination; users can get their own orders

### AWS S3
- File upload via memory storage (Multer), streamed directly to S3
- Automatic cleanup of old files on logo / image update
- S3 rollback pattern on any failure during create or update

### Redis
- OTP storage with TTL (2 minutes per OTP)
- Attempt counter with 5-minute block key
- Verified OTP flag (5-minute window to complete password reset)

### Security
- **Helmet** — HTTP security headers globally (`crossOriginResourcePolicy: false` for S3 image delivery)
- **CORS** — Enabled for all origins
- **Rate Limiting** — 100 requests per 60 seconds per IP via `@nestjs/throttler`
- Stripe Webhook excluded via `@SkipThrottle` to ensure Stripe always reaches it

---

## API Overview

| Module | Endpoints |
|---|---|
| Auth / Users | 13 |
| Brand | 5 |
| Category | 5 |
| Product | 5 |
| Cart | 7 |
| Coupon | 5 |
| Order | 8 |

Full documentation with request bodies, validation rules, and response examples: [Postman Docs](https://documenter.getpostman.com/view/49715513/2sBY4QsKkG)

---

## Environment Variables

```env
PORT=3000
NODE_ENV=development
MONGO_LOCAL=mongodb://...
MONGO_URI=mongodb+srv://...
JWT_TOKEN=your_jwt_secret
JWT_REFRESH_TOKEN=your_refresh_secret
GMAIL_USER=your@gmail.com
GMAIL_PASS=your_app_password
AWS_REGION=us-east-1
AWS_ACCESS_KEY=...
AWS_SECRET_ACCESS_KEY=...
AWS_BUCKET_NAME=...
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
Redis_URL=redis://...
```

---

## Running Locally

```bash
git clone https://github.com/diaaeldeenn/E-Commerce-Nest-Js
cd E-Commerce-Nest-Js
npm install
# add your .env file
npm run start:dev
```

---

## Developer

**Eng. Diaa Eldeen**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-blue)](https://www.linkedin.com/in/diaaelseady)
[![GitHub](https://img.shields.io/badge/GitHub-Follow-black)](https://github.com/diaaeldeenn)
