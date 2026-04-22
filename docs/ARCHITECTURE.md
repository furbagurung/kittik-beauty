# Architecture

This document describes the current Kittik Beauty architecture across the Expo buyer app, the Express API, the Prisma data layer, and the separate Next.js admin dashboard.

## 1. Runtime Topology

Kittik Beauty runs as four connected parts:

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
- [`app/product/[id].tsx`](../app/product/%5Bid%5D.tsx): product detail and variant selection
- [`app/cart.tsx`](../app/cart.tsx): cart review
- [`app/checkout.tsx`](../app/checkout.tsx): checkout form and order creation
- [`app/payment-confirmation.tsx`](../app/payment-confirmation.tsx): in-app eSewa WebView flow
- [`app/orders.tsx`](../app/orders.tsx): authenticated order list
- [`app/order/[id].tsx`](../app/order/%5Bid%5D.tsx): authenticated order detail
- [`app/order-success.tsx`](../app/order-success.tsx): post-checkout success screen

### Client Service Layer

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

### Client State

The buyer app uses focused Zustand stores:

- [`store/authStore.ts`](../store/authStore.ts): persisted auth session
- [`store/cartStore.ts`](../store/cartStore.ts): persisted cart with variant-aware item data
- [`store/wishlistStore.ts`](../store/wishlistStore.ts): persisted wishlist
- [`store/addressStore.ts`](../store/addressStore.ts): saved addresses
- [`store/checkoutStore.ts`](../store/checkoutStore.ts): saved checkout details
- [`store/paymentSessionStore.ts`](../store/paymentSessionStore.ts): in-memory payment session payload
- [`store/orderStore.ts`](../store/orderStore.ts): legacy local order store

The active buyer flow uses backend order APIs instead of `store/orderStore.ts` as the main source of truth.

## 3. Admin Dashboard Architecture

The admin dashboard is a separate Next.js App Router app under [`admin/`](../admin).

### Main Routes

- [`admin/app/(auth)/login/page.tsx`](../admin/app/%28auth%29/login/page.tsx): admin login
- [`admin/app/(dashboard)/page.tsx`](../admin/app/%28dashboard%29/page.tsx): stats and recent orders
- [`admin/app/(dashboard)/products/page.tsx`](../admin/app/%28dashboard%29/products/page.tsx): product list
- [`admin/app/(dashboard)/products/new/page.tsx`](../admin/app/%28dashboard%29/products/new/page.tsx): create product
- [`admin/app/(dashboard)/products/[id]/page.tsx`](../admin/app/%28dashboard%29/products/%5Bid%5D/page.tsx): edit product
- [`admin/app/(dashboard)/orders/page.tsx`](../admin/app/%28dashboard%29/orders/page.tsx): order list
- [`admin/app/(dashboard)/orders/[id]/page.tsx`](../admin/app/%28dashboard%29/orders/%5Bid%5D/page.tsx): order detail and status update
- [`admin/app/(dashboard)/customers/page.tsx`](../admin/app/%28dashboard%29/customers/page.tsx): user list
- [`admin/app/(dashboard)/settings/page.tsx`](../admin/app/%28dashboard%29/settings/page.tsx): placeholder settings UI

### Admin Shell And Auth Model

[`admin/lib/admin-session.ts`](../admin/lib/admin-session.ts) is the client-side session source of truth. It stores minimal persisted session data in `localStorage` and exposes explicit auth states:

- `idle`
- `hydrating`
- `authenticated`
- `unauthenticated`

The bootstrap flow reads `adminToken`, validates it through `GET /api/auth/admin/me`, restores `adminUser`, and clears invalid sessions. Module-level guards prevent duplicate bootstrap work for the same token.

[`admin/components/layout/AdminShell.tsx`](../admin/components/layout/AdminShell.tsx) waits for session hydration before rendering protected dashboard routes and redirects unauthenticated users to `/login`.

This is still a client-side gate. Backend enforcement comes from JWT validation and `isAdmin` middleware on protected routes.

### Admin API Client

[`admin/lib/api.ts`](../admin/lib/api.ts) talks directly to the backend API and handles:

- admin login
- current admin lookup
- dashboard stats
- recent orders
- user listing
- order listing and detail fetch
- order status updates
- product fetch, create, update, and delete

Product mutations use multipart form data with product fields, media files, option/variant JSON, and per-variant image files.

### Admin Feedback UX

The admin app uses Sonner and shadcn/Radix dialogs instead of browser alerts.

- [`admin/components/ui/sonner.tsx`](../admin/components/ui/sonner.tsx) wraps Sonner.
- The global `<Toaster />` is mounted in [`admin/app/layout.tsx`](../admin/app/layout.tsx).
- [`admin/components/ui/alert-dialog.tsx`](../admin/components/ui/alert-dialog.tsx) provides `AlertDialog` primitives.
- [`admin/components/shared/ConfirmActionDialog.tsx`](../admin/components/shared/ConfirmActionDialog.tsx) handles destructive confirmations such as product delete and discard.

## 4. Backend Architecture

### Entry Points

- [`src/server.js`](../src/server.js): loads env, connects Prisma, and starts the server
- [`src/app.js`](../src/app.js): configures CORS, JSON parsing, health routes, mounted route groups, uploads, and the 404 handler

### Middleware

- [`src/middleware/authMiddleware.js`](../src/middleware/authMiddleware.js): `protect` and `isAdmin`
- [`src/middleware/productUploadMiddleware.js`](../src/middleware/productUploadMiddleware.js): product media uploads for primary, gallery, and variant images

JWTs are created in [`src/utils/generateToken.js`](../src/utils/generateToken.js) and include:

- `id`
- `role`

### Route Groups

Mounted route groups from [`src/app.js`](../src/app.js):

- `GET /api/health`
- `/api/auth`
- `/api/products`
- `/api/orders`
- `/api/payments`

#### Auth Routes

[`src/routes/authRoutes.js`](../src/routes/authRoutes.js) exposes:

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/admin/login`
- `GET /api/auth/admin/me`
- `GET /api/auth/users`
- `GET /api/auth/admin/stats`
- `GET /api/auth/admin/recent-orders`

#### Product Routes

[`src/routes/productRoutes.js`](../src/routes/productRoutes.js) exposes:

- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/products`
- `PUT /api/products/:id`
- `PATCH /api/products/:id`
- `DELETE /api/products/:id`

Product writes are wrapped in both `protect` and `isAdmin`.

#### Order Routes

[`src/routes/orderRoutes.js`](../src/routes/orderRoutes.js) applies `protect` to the entire router, then exposes:

- `POST /api/orders`
- `GET /api/orders`
- `GET /api/orders/:id`
- `PATCH /api/orders/:id/cancel`
- `PATCH /api/orders/:id/status`

`PATCH /api/orders/:id/status` additionally requires `isAdmin`.

#### Payment Routes

[`src/routes/paymentRoutes.js`](../src/routes/paymentRoutes.js) exposes:

- `POST /api/payments/esewa/initiate`
- `GET /api/payments/esewa/redirect/:transactionUuid`
- `ALL /api/payments/esewa/callback/:transactionUuid`
- `POST /api/payments/esewa/verify`

Both `initiate` and `verify` require `protect`.

## 5. Data Model

The Prisma schema lives in [`prisma/schema.prisma`](../prisma/schema.prisma).

### User

`User` stores customer/admin identity and role data. `role` defaults to `customer` and is used by admin authorization checks.

### Product Catalog

The catalog uses normalized Shopify-style storage:

- `Product`: product-level title, slug, descriptions, status, vendor, product type, category, featured image, SEO, rating, timestamps
- `ProductMedia`: ordered product media with image/video type
- `ProductOption`: option groups such as Size, Shade, or Color
- `ProductOptionValue`: ordered option values such as Small, Pink, or Black
- `ProductVariant`: price, stock, SKU, barcode, tracking flags, image, default flag, status, weight, timestamps
- `VariantOptionSelection`: joins each variant to one value for each product option
- `ProductTag`: normalized product tags

Public product responses remain backward-compatible by exposing flat fields such as `name`, `price`, `stock`, `image`, and `images` alongside normalized `media`, `options`, `variants`, `defaultVariantId`, and `tags`.

### Order

`Order` stores customer, address, totals, status, stock restoration state, timestamp, and nested order items.

### OrderItem

`OrderItem` points to the purchased variant through `variantId`. It also stores snapshot fields:

- `name`
- `price`
- `quantity`

The snapshot keeps old order displays stable even if variant data changes later.

## 6. Buyer Flow

### Auth

1. The mobile app calls `signup` or `login`.
2. The backend returns a JWT and basic user payload.
3. [`store/authStore.ts`](../store/authStore.ts) persists the session for later requests.

### Product Browsing

1. The mobile app calls `GET /api/products` or `GET /api/products/:id`.
2. Product responses include both flat compatibility fields and normalized variant data.
3. Product detail supports variant selection and updates displayed price, stock, image, and add-to-cart availability.

### Order Creation

1. Checkout collects customer details, addresses, and payment method.
2. The app calls `POST /api/orders`.
3. The backend resolves each item to a product variant, with default-variant fallback for legacy product-only clients.
4. Variant stock is validated and decremented inside the same transaction that creates the order.
5. The backend creates the order and nested `OrderItem` records.
6. COD orders default to `placed`; online-payment orders default to `pending_payment`.

### Order Cancellation

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
10. Failed or incomplete verification updates the order to `payment_failed` and restores reserved variant stock.

### Khalti

Khalti is currently only represented by placeholder client functions in [`services/payments/khalti.ts`](../services/payments/khalti.ts). There is no backend Khalti route set or real verification flow yet.

## 8. Configuration

### Environment-Backed Configuration

Current environment-backed settings include:

- `DATABASE_URL` via [`prisma.config.ts`](../prisma.config.ts)
- `JWT_SECRET`
- required `ESEWA_FORM_URL`
- required `ESEWA_PRODUCT_CODE`
- required `ESEWA_SECRET_KEY`
- required `ESEWA_STATUS_CHECK_URL`
- required `ESEWA_APP_REDIRECT_URL`

### Hardcoded Configuration Still In The Repo

The following values are still hardcoded:

- database adapter settings in [`src/config/prisma.js`](../src/config/prisma.js)
- database adapter settings in [`prisma/seed.js`](../prisma/seed.js)
- the buyer app API base URL in [`services/api.ts`](../services/api.ts)
- the admin API base URL in [`admin/lib/api-config.ts`](../admin/lib/api-config.ts)

This split configuration is the main local setup friction point right now.

## 9. Operational Boundaries

The current architecture is workable, but several gaps are still visible:

- the admin settings page is not wired to backend persistence
- advanced variant fields such as SKU, barcode, weight, and cost exist in the schema but are not fully exposed in the admin editor
- pending eSewa sessions live only in memory
- the backend depends on required eSewa env vars being present at process start
- Khalti is still a placeholder
- the old local `orderStore` still exists even though backend orders are the active source of truth

## 10. Suggested Reading Order

For a practical code walkthrough, read in this order:

1. [`README.md`](../README.md)
2. [`prisma/schema.prisma`](../prisma/schema.prisma)
3. [`src/app.js`](../src/app.js)
4. [`src/routes/productRoutes.js`](../src/routes/productRoutes.js)
5. [`src/controllers/productController.js`](../src/controllers/productController.js)
6. [`src/controllers/orderController.js`](../src/controllers/orderController.js)
7. [`app/product/[id].tsx`](../app/product/%5Bid%5D.tsx)
8. [`app/checkout.tsx`](../app/checkout.tsx)
9. [`src/controllers/paymentController.js`](../src/controllers/paymentController.js)
10. [`admin/lib/admin-session.ts`](../admin/lib/admin-session.ts)
11. [`admin/lib/api.ts`](../admin/lib/api.ts)
12. [`admin/components/products/ProductForm.tsx`](../admin/components/products/ProductForm.tsx)
