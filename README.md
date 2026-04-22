# Kittik Beauty

Kittik Beauty is an ecommerce monorepo with three active surfaces:

- a buyer-facing Expo Router mobile app in the repository root
- an Express API with Prisma and MariaDB/MySQL
- a separate Next.js admin dashboard in [`admin/`](./admin)

Additional documentation:

- [Architecture](./docs/ARCHITECTURE.md)
- [Admin dashboard README](./admin/README.md)

## What Is In The Repo

### Buyer App

The Expo app supports:

- customer signup and login
- product listing and product detail screens
- variant-aware product detail and cart data
- cart, wishlist, saved addresses, and persisted checkout details
- authenticated order creation, order history, and eligible order cancellation
- cash on delivery checkout
- eSewa payment initiation, in-app WebView handoff, callback handling, and verification

### Backend API

The Express app exposes:

- health check routes
- customer signup and login
- admin login and current-admin session validation
- admin stats, recent orders, and user listing
- public product read routes plus admin-protected product write routes
- Shopify-style product storage with media, options, option values, variants, tags, and variant selections
- inventory-aware order creation using product variants
- customer cancellation, order detail fetch, and admin status updates
- eSewa initiate, redirect, callback, and verify routes

### Admin Dashboard

The Next.js dashboard includes:

- production-style admin session bootstrap and protected route gating
- admin login
- dashboard stats and recent orders
- product list, create, edit, and delete screens
- unified Shopify-style product editor with title, description, media, category, price, stock, status, vendor, type, tags, and SEO fields
- product option builder and generated variants table
- variant row selection, bulk price/stock edits, per-variant images, default variant selection, and variant deletion
- Sonner toast feedback and shadcn/Radix confirmation dialogs
- order list and order detail with status updates
- customer list
- placeholder settings page

## Tech Stack

### Buyer App

- Expo SDK 54
- React 19
- React Native 0.81
- Expo Router
- Zustand with AsyncStorage persistence
- React Native Reanimated
- React Native WebView
- TypeScript

### Backend

- Express 5
- Prisma 7
- MariaDB / MySQL
- JWT auth
- bcryptjs
- multer for product media uploads

### Admin

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- shadcn/ui-style components
- Sonner toast notifications

## Quick Start

### 1. Install Dependencies

Install the root app and API dependencies:

```bash
npm install
```

Install the admin dashboard dependencies:

```bash
cd admin
npm install
```

### 2. Configure Environment

Create a root `.env` file, or copy `.env.sample`, with at least:

```env
DATABASE_URL="mysql://USER:PASSWORD@localhost:3306/kittik"
JWT_SECRET="replace-this-with-a-real-secret"
```

Required eSewa config for backend payment flows:

- `ESEWA_FORM_URL`
- `ESEWA_PRODUCT_CODE`
- `ESEWA_SECRET_KEY`
- `ESEWA_STATUS_CHECK_URL`
- `ESEWA_APP_REDIRECT_URL`

Important setup notes:

- Prisma migrations read `DATABASE_URL` from [`prisma.config.ts`](./prisma.config.ts).
- The backend expects all listed `ESEWA_*` variables to be present at startup.
- The runtime Prisma adapter in [`src/config/prisma.js`](./src/config/prisma.js) is still hardcoded to a local MariaDB instance.
- The seed script in [`prisma/seed.js`](./prisma/seed.js) is also hardcoded to the same local MariaDB instance.
- The mobile API base URL is currently hardcoded in [`services/api.ts`](./services/api.ts).
- The admin API base URL is currently hardcoded in [`admin/lib/api-config.ts`](./admin/lib/api-config.ts).

Until configuration is centralized, keep those values aligned with your local environment.

### 3. Apply Migrations And Seed Data

Run Prisma migrations from the repo root:

```bash
npx prisma migrate dev
```

Seed demo products:

```bash
npm run seed
```

### 4. Start The Services

Start the backend API:

```bash
npm run dev:server
```

Start the Expo app from the repo root:

```bash
npm run start
```

Start the admin dashboard from `admin/`:

```bash
npm run dev
```

For same-Wi-Fi testing from another device, start the admin dashboard from
`admin/` with the LAN-stable webpack dev server:

```bash
npm run dev:lan
```

This runs `next dev --hostname 0.0.0.0 --port 3000 --webpack`.

Default local ports:

- backend API on the host machine: `http://192.168.1.66:5000`
- admin dashboard on the host machine: `http://192.168.1.66:3000`
- Expo dev server: shown by `expo start`

## Auth And Access

Customer auth routes:

- `POST /api/auth/signup`
- `POST /api/auth/login`

Admin auth routes:

- `POST /api/auth/admin/login`
- `GET /api/auth/admin/me`
- `GET /api/auth/users`
- `GET /api/auth/admin/stats`
- `GET /api/auth/admin/recent-orders`

Admin-only backend routes require a JWT whose payload contains `role: "admin"`.

The admin dashboard persists `admin_token` and `admin_user` in `localStorage`, then validates the stored token through `GET /api/auth/admin/me` during session bootstrap. Legacy `adminToken` and `adminUser` values are migrated automatically.

## Main API Surface

### Public Routes

- `GET /api/health`
- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/admin/login`
- `GET /api/payments/esewa/redirect/:transactionUuid`
- `ALL /api/payments/esewa/callback/:transactionUuid`

### Authenticated Customer Routes

- `GET /api/orders`
- `GET /api/orders/:id`
- `POST /api/orders`
- `PATCH /api/orders/:id/cancel`
- `POST /api/payments/esewa/initiate`
- `POST /api/payments/esewa/verify`

### Admin-Protected Routes

- `GET /api/auth/admin/me`
- `GET /api/auth/users`
- `GET /api/auth/admin/stats`
- `GET /api/auth/admin/recent-orders`
- `POST /api/products`
- `PUT /api/products/:id`
- `PATCH /api/products/:id`
- `DELETE /api/products/:id`
- `PATCH /api/orders/:id/status`

## Product Catalog Summary

Products use normalized Shopify-style storage:

- `Product` stores product-level content, status, category, vendor, product type, SEO, tags, and featured image.
- `ProductMedia` stores ordered images/videos.
- `ProductOption` and `ProductOptionValue` store option sets such as Size, Shade, or Color.
- `ProductVariant` stores price, stock, SKU, image, inventory settings, and default-variant state.
- `VariantOptionSelection` connects each variant to its selected option values.
- `OrderItem.variantId` points to the purchased variant.

Product responses remain backward-compatible for older UI surfaces by returning flat fields such as `name`, `price`, `stock`, `image`, and `images` alongside normalized `media`, `options`, and `variants`.

## Payment Flow Summary

### Cash On Delivery

1. The buyer app creates an order with `paymentMethod: "cod"`.
2. The backend resolves each item to a product variant, validates stock, and decrements variant inventory inside the order transaction.
3. The backend stores the order with status `placed`.
4. If the order is later cancelled, variant stock is restored once and `stockRestored` is marked on the order.
5. The app clears the cart and routes to the success screen.

### eSewa

1. The buyer app creates an order with `paymentMethod: "esewa"`.
2. The backend validates variant stock, decrements inventory, and stores the order with status `pending_payment`.
3. The app calls `POST /api/payments/esewa/initiate`.
4. The backend signs an eSewa payload and returns a backend-hosted redirect URL.
5. [`app/payment-confirmation.tsx`](./app/payment-confirmation.tsx) opens that URL inside a `WebView`.
6. The backend redirect page auto-submits to eSewa.
7. eSewa returns through the backend callback route.
8. The app intercepts the callback URL and calls `POST /api/payments/esewa/verify`.
9. The backend verifies the callback payload and remote transaction status, then marks the order as `paid`.
10. Failed or incomplete eSewa payments are marked as `payment_failed`, and reserved variant stock is restored.

### Khalti

Khalti is still only a placeholder in the current codebase. The mobile UI exposes it, but the backend does not implement a real Khalti payment route set yet.

## Repository Layout

```text
app/                    Expo Router routes
components/             Shared mobile UI
services/               Mobile API and payment clients
store/                  Zustand state stores
types/                  Shared mobile/admin product types
src/                    Express API
prisma/                 Prisma schema, migrations, and seed data
docs/                   Project documentation
admin/                  Next.js admin dashboard
.postman/               Postman Local View registration
postman/                Repo-local Postman collections and globals
```

## Current Limitations

- The buyer app and admin app still use hardcoded API base URLs.
- Prisma runtime configuration is split between `DATABASE_URL` and hardcoded adapter values.
- Pending eSewa sessions are stored in memory and are lost on process restart.
- The backend fails fast at startup if required `ESEWA_*` variables are missing.
- Khalti is not implemented beyond placeholder client code.
- The admin settings page is presentational only.
- Product variant editing is implemented in admin, but advanced SKU/barcode/weight editing is still limited.

## Verification

Useful local checks:

- `npm run lint`
- `npx tsc --noEmit`
- `cd admin && npm run build`
- `cd admin && npm run lint`
