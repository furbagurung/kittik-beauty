# Architecture

This document describes the current Kittik Beauty architecture across the Expo buyer app, the Express API, the Prisma data layer, and the separate Next.js admin dashboard.

## 1. Runtime Topology

Kittik Beauty currently runs as four connected parts:

1. a buyer-facing Expo app in the repository root
2. an Express API in [`src/`](../src)
3. a MariaDB / MySQL database accessed through Prisma
4. an admin dashboard in [`admin/`](../admin)

The repository also includes a repo-local Postman workspace in [`.postman/`](../.postman) and [`postman/`](../postman).

## 2. Buyer App Architecture

### Navigation

The root stack is defined in [`app/_layout.tsx`](../app/_layout.tsx). The main route groups are:

- [`app/(tabs)/index.tsx`](../app/%28tabs%29/index.tsx): home discovery screen
- [`app/(tabs)/categories.tsx`](../app/%28tabs%29/categories.tsx): category browsing
- [`app/(tabs)/wishlist.tsx`](../app/%28tabs%29/wishlist.tsx): persisted wishlist
- [`app/(tabs)/profile.tsx`](../app/%28tabs%29/profile.tsx): account summary and order count
- [`app/login.tsx`](../app/login.tsx): customer login
- [`app/signup.tsx`](../app/signup.tsx): customer signup
- [`app/products.tsx`](../app/products.tsx): catalog screen with search and sort
- [`app/product/[id].tsx`](../app/product/%5Bid%5D.tsx): product detail
- [`app/cart.tsx`](../app/cart.tsx): cart review
- [`app/checkout.tsx`](../app/checkout.tsx): checkout form and order creation
- [`app/payment-confirmation.tsx`](../app/payment-confirmation.tsx): in-app eSewa WebView flow
- [`app/orders.tsx`](../app/orders.tsx): authenticated order list
- [`app/order/[id].tsx`](../app/order/%5Bid%5D.tsx): authenticated order detail
- [`app/order-success.tsx`](../app/order-success.tsx): post-checkout success screen

### Client service layer

[`services/api.ts`](../services/api.ts) is the shared HTTP entry point for the buyer app. It wraps:

- auth requests
- product reads
- order reads and creation
- customer order cancellation
- order status updates
- eSewa payment initiate and verify calls

[`services/payments/paymentClient.ts`](../services/payments/paymentClient.ts) normalizes payment initiation and verification across providers.

Provider-specific modules:

- [`services/payments/esewa.ts`](../services/payments/esewa.ts)
- [`services/payments/khalti.ts`](../services/payments/khalti.ts)

### Client state

The buyer app uses focused Zustand stores:

- [`store/authStore.ts`](../store/authStore.ts): persisted auth session
- [`store/cartStore.ts`](../store/cartStore.ts): persisted cart
- [`store/wishlistStore.ts`](../store/wishlistStore.ts): persisted wishlist
- [`store/addressStore.ts`](../store/addressStore.ts): saved addresses
- [`store/checkoutStore.ts`](../store/checkoutStore.ts): saved checkout details
- [`store/paymentSessionStore.ts`](../store/paymentSessionStore.ts): in-memory payment session payload
- [`store/orderStore.ts`](../store/orderStore.ts): legacy local order store

The active buyer flow now uses backend order APIs instead of `store/orderStore.ts` as the main source of truth.

## 3. Admin Dashboard Architecture

The admin dashboard is a separate Next.js App Router app under [`admin/`](../admin).

### Main routes

- [`admin/app/(auth)/login/page.tsx`](../admin/app/%28auth%29/login/page.tsx): admin login
- [`admin/app/(dashboard)/page.tsx`](../admin/app/%28dashboard%29/page.tsx): stats and recent orders
- [`admin/app/(dashboard)/products/page.tsx`](../admin/app/%28dashboard%29/products/page.tsx): product list
- [`admin/app/(dashboard)/products/new/page.tsx`](../admin/app/%28dashboard%29/products/new/page.tsx): create product
- [`admin/app/(dashboard)/products/[id]/page.tsx`](../admin/app/%28dashboard%29/products/%5Bid%5D/page.tsx): edit product
- [`admin/app/(dashboard)/orders/page.tsx`](../admin/app/%28dashboard%29/orders/page.tsx): order list
- [`admin/app/(dashboard)/orders/[id]/page.tsx`](../admin/app/%28dashboard%29/orders/%5Bid%5D/page.tsx): order detail and status update
- [`admin/app/(dashboard)/customers/page.tsx`](../admin/app/%28dashboard%29/customers/page.tsx): user list
- [`admin/app/(dashboard)/settings/page.tsx`](../admin/app/%28dashboard%29/settings/page.tsx): placeholder settings UI

### Admin shell and auth model

[`admin/components/layout/AdminShell.tsx`](../admin/components/layout/AdminShell.tsx) performs a lightweight client-side access check by looking for `adminToken` in `localStorage`. If no token is present, it redirects to `/login`.

This is only a client-side guard. Backend enforcement still comes from JWT validation and the `isAdmin` middleware on protected routes.

### Admin API client

[`admin/lib/api.ts`](../admin/lib/api.ts) talks directly to the backend API and currently handles:

- admin login
- dashboard stats
- recent orders
- user listing
- order listing and detail fetch
- order status updates
- product fetch, create, and update

The admin API base URL is currently hardcoded to `http://localhost:5000/api`.

## 4. Backend Architecture

### Entry points

- [`src/server.js`](../src/server.js): loads env, connects Prisma, and starts the server
- [`src/app.js`](../src/app.js): configures CORS, JSON parsing, health routes, mounted route groups, and the 404 handler

### Middleware

- [`src/middleware/authMiddleware.js`](../src/middleware/authMiddleware.js)

This module provides:

- `protect`: validates `Authorization: Bearer <token>`
- `isAdmin`: checks for `req.user.role === "admin"`

JWTs are created in [`src/utils/generateToken.js`](../src/utils/generateToken.js) and currently include only:

- `id`
- `role`

### Route groups

Mounted route groups from [`src/app.js`](../src/app.js):

- `GET /api/health`
- `/api/auth`
- `/api/products`
- `/api/orders`
- `/api/payments`

#### Auth routes

[`src/routes/authRoutes.js`](../src/routes/authRoutes.js) currently exposes:

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/admin/login`
- `GET /api/auth/users`
- `GET /api/auth/admin/stats`
- `GET /api/auth/admin/recent-orders`

#### Product routes

[`src/routes/productRoutes.js`](../src/routes/productRoutes.js) currently exposes:

- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/products`
- `PUT /api/products/:id`

The write routes are not currently wrapped in `protect` or `isAdmin`.

#### Order routes

[`src/routes/orderRoutes.js`](../src/routes/orderRoutes.js) applies `protect` to the entire router, then exposes:

- `POST /api/orders`
- `GET /api/orders`
- `GET /api/orders/:id`
- `PATCH /api/orders/:id/cancel`
- `PATCH /api/orders/:id/status`

`PATCH /api/orders/:id/status` additionally requires `isAdmin`.

#### Payment routes

[`src/routes/paymentRoutes.js`](../src/routes/paymentRoutes.js) currently exposes:

- `POST /api/payments/esewa/initiate`
- `GET /api/payments/esewa/redirect/:transactionUuid`
- `ALL /api/payments/esewa/callback/:transactionUuid`
- `POST /api/payments/esewa/verify`

Both `initiate` and `verify` require `protect`.

## 5. Data Model

The Prisma schema lives in [`prisma/schema.prisma`](../prisma/schema.prisma).

### User

Current user fields include:

- `id`
- `name`
- `email`
- `password`
- `role`
- `createdAt`

`role` defaults to `customer` and is used by admin authorization checks.

### Product

Current product fields in the schema include:

- `id`
- `name`
- `description`
- `price`
- `image`
- `category`
- `stock`
- `createdAt`

The mobile UI and seed data also expect an optional `rating` field when present.

### Order

Current order fields include:

- `id`
- `userId`
- `fullName`
- `phone`
- `address`
- `paymentMethod`
- `subtotal`
- `deliveryFee`
- `total`
- `totalItems`
- `status`
- `stockRestored`
- `createdAt`

### OrderItem

Current order item fields include:

- `id`
- `orderId`
- `productId`
- `name`
- `price`
- `quantity`

## 6. Buyer Flow

### Auth

1. The mobile app calls `signup` or `login`.
2. The backend returns a JWT and basic user payload.
3. [`store/authStore.ts`](../store/authStore.ts) persists the session for later requests.

### Product browsing

1. The mobile app calls `GET /api/products` or `GET /api/products/:id`.
2. The product detail screen supports add-to-cart, buy-now, and related-product UI.

### Order creation

1. Checkout collects customer details, addresses, and payment method.
2. The app calls `POST /api/orders`.
3. The backend validates item structure and checks current product stock.
4. Product stock is decremented inside the same transaction that creates the order.
5. The backend creates the order and nested `OrderItem` records.
6. COD orders default to `placed`; online-payment orders default to `pending_payment`.

### Order cancellation

The buyer app exposes cancellation from [`app/order/[id].tsx`](../app/order/%5Bid%5D.tsx).

Current rules:

- customers can cancel orders in `placed` or `pending_payment`
- admins can cancel orders in `placed`, `pending_payment`, or `processing`
- stock restoration is performed once for cancellation paths that were still holding inventory
- restored orders are marked with `stockRestored: true`

## 7. Payment Architecture

### eSewa

The current eSewa implementation spans:

- buyer checkout in [`app/checkout.tsx`](../app/checkout.tsx)
- payment session state in [`store/paymentSessionStore.ts`](../store/paymentSessionStore.ts)
- provider adapter in [`services/payments/esewa.ts`](../services/payments/esewa.ts)
- WebView host in [`app/payment-confirmation.tsx`](../app/payment-confirmation.tsx)
- backend controller in [`src/controllers/paymentController.js`](../src/controllers/paymentController.js)

Flow summary:

1. The app creates an order.
2. The backend signs an eSewa form payload.
3. The backend stores a pending session in an in-memory `Map`.
4. The app opens the backend redirect page inside a `WebView`.
5. The backend redirect page auto-submits a `POST` form to eSewa.
6. eSewa returns through the backend callback route.
7. The app calls the verify route with callback payload data.
8. The backend verifies signature, amount, product code, and remote status.
9. Successful verification updates the order to `paid`.
10. Failed or incomplete verification updates the order to `payment_failed` and restores reserved stock.

### Khalti

Khalti is currently only represented by placeholder client functions in [`services/payments/khalti.ts`](../services/payments/khalti.ts). There is no backend Khalti route set or real verification flow yet.

## 8. Configuration

### Environment-backed configuration

Current environment-backed settings include:

- `DATABASE_URL` via [`prisma.config.ts`](../prisma.config.ts)
- `JWT_SECRET`
- required `ESEWA_FORM_URL`
- required `ESEWA_PRODUCT_CODE`
- required `ESEWA_SECRET_KEY`
- required `ESEWA_STATUS_CHECK_URL`
- required `ESEWA_APP_REDIRECT_URL`

### Hardcoded configuration still in the repo

The following values are still hardcoded:

- database adapter settings in [`src/config/prisma.js`](../src/config/prisma.js)
- database adapter settings in [`prisma/seed.js`](../prisma/seed.js)
- the buyer app API base URL in [`services/api.ts`](../services/api.ts)
- the admin API base URL in [`admin/lib/api.ts`](../admin/lib/api.ts)

This split configuration is the main local setup friction point right now.

## 9. Operational Boundaries

The current architecture is workable, but several gaps are still visible in the codebase:

- the admin settings page is not wired to backend persistence
- the admin product form collects fields the current backend does not save
- product create and update routes are not backend-protected
- pending eSewa sessions live only in memory
- the backend now depends on required eSewa env vars being present at process start
- Khalti is still a placeholder
- the old local `orderStore` still exists even though backend orders are the active source of truth
- payment Postman request files are not committed yet

## 10. Suggested Reading Order

For a practical code walkthrough, read in this order:

1. [`README.md`](../README.md)
2. [`app/_layout.tsx`](../app/_layout.tsx)
3. [`services/api.ts`](../services/api.ts)
4. [`app/checkout.tsx`](../app/checkout.tsx)
5. [`app/payment-confirmation.tsx`](../app/payment-confirmation.tsx)
6. [`src/app.js`](../src/app.js)
7. [`src/routes/authRoutes.js`](../src/routes/authRoutes.js)
8. [`src/routes/orderRoutes.js`](../src/routes/orderRoutes.js)
9. [`src/controllers/paymentController.js`](../src/controllers/paymentController.js)
10. [`admin/lib/api.ts`](../admin/lib/api.ts)
11. [`admin/app/(dashboard)/page.tsx`](../admin/app/%28dashboard%29/page.tsx)
