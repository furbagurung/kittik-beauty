# Architecture

This document describes the current Kittik Beauty architecture across the buyer-facing Expo app, the Express backend, and the repo-local API workspace assets.

## 1. System Shape

Kittik Beauty now has two main runtime layers:

- a buyer mobile app in `app/`, `components/`, `services/`, `store/`, and `utils/`
- an Express backend in `src/` that serves auth, products, orders, and payment routes

The repository also includes a repo-local Postman workspace in `.postman/` and `postman/` for API testing.

At a high level:

- `app/` owns buyer routes and screen-level UI
- `components/` owns reusable UI and motion primitives
- `services/api.ts` is the frontend HTTP entry point
- `services/payments/` contains payment-provider adapters used by checkout
- `store/` contains client state and persistence
- `src/routes/` mounts backend endpoints
- `src/controllers/` implements backend request handling

## 2. Frontend Navigation

### Root layout

The root stack is defined in [app/_layout.tsx](/d:/Development/kittik-beauty/app/_layout.tsx).

It mounts:

- tab shell
- cart
- checkout
- orders
- order detail
- product detail
- payment confirmation
- order success

There is no admin route group mounted in the current app shell.

### Main shopper routes

- [app/(tabs)/index.tsx](/d:/Development/kittik-beauty/app/(tabs)/index.tsx)  
  Home discovery screen.

- [app/products.tsx](/d:/Development/kittik-beauty/app/products.tsx)  
  Full catalog screen.

- [app/product/[id].tsx](/d:/Development/kittik-beauty/app/product/[id].tsx)  
  Product detail screen with:
  - API-backed product fetch
  - image carousel
  - fullscreen gallery
  - related product strip
  - add-to-cart and buy-now actions

- [app/cart.tsx](/d:/Development/kittik-beauty/app/cart.tsx)  
  Cart review and quantity management.

- [app/checkout.tsx](/d:/Development/kittik-beauty/app/checkout.tsx)  
  Checkout form, saved addresses, payment selection, backend order creation, and payment session setup.

- [app/payment-confirmation.tsx](/d:/Development/kittik-beauty/app/payment-confirmation.tsx)  
  In-app eSewa payment surface implemented with `react-native-webview`.

- [app/orders.tsx](/d:/Development/kittik-beauty/app/orders.tsx)  
  Backend-backed order history.

- [app/order/[id].tsx](/d:/Development/kittik-beauty/app/order/[id].tsx)  
  Backend-backed order detail.

- [app/(tabs)/profile.tsx](/d:/Development/kittik-beauty/app/(tabs)/profile.tsx)  
  Profile summary that now fetches order count from the backend instead of relying on the local order store.

## 3. Backend Architecture

### Entry points

- [src/server.js](/d:/Development/kittik-beauty/src/server.js)  
  Connects Prisma and starts the HTTP server.

- [src/app.js](/d:/Development/kittik-beauty/src/app.js)  
  Configures CORS, `express.json()`, health routes, route mounting, and the 404 handler.

### Mounted route groups

From [src/app.js](/d:/Development/kittik-beauty/src/app.js:1):

- `GET /api/health`
- `/api/auth`
- `/api/products`
- `/api/orders`
- `/api/payments`

### Route modules

- [src/routes/authRoutes.js](/d:/Development/kittik-beauty/src/routes/authRoutes.js)
- [src/routes/productRoutes.js](/d:/Development/kittik-beauty/src/routes/productRoutes.js)
- [src/routes/orderRoutes.js](/d:/Development/kittik-beauty/src/routes/orderRoutes.js)
- [src/routes/paymentRoutes.js](/d:/Development/kittik-beauty/src/routes/paymentRoutes.js)

### Payment routes

[src/routes/paymentRoutes.js](/d:/Development/kittik-beauty/src/routes/paymentRoutes.js) currently exposes:

- `POST /api/payments/esewa/initiate`
- `GET /api/payments/esewa/redirect/:transactionUuid`
- `ALL /api/payments/esewa/callback/:transactionUuid`
- `POST /api/payments/esewa/verify`

### Payment controller responsibilities

[src/controllers/paymentController.js](/d:/Development/kittik-beauty/src/controllers/paymentController.js) currently:

- builds a signed eSewa form payload on the backend
- stores a short-lived pending payment session in memory
- serves an HTML page that auto-submits the payment form to eSewa using `POST`
- serves a backend callback page that redirects back into the app
- validates the callback signature and amount/product metadata
- confirms the transaction with the eSewa status API
- marks the order as `paid` after successful verification

## 4. Frontend Service Layer

### Shared API client

[services/api.ts](/d:/Development/kittik-beauty/services/api.ts) is the shared frontend HTTP layer.

It currently wraps:

- `getProducts`
- `getProductById`
- `signup`
- `login`
- `getOrders`
- `getOrderById`
- `createOrder`
- `updateOrderStatus`
- `initiateEsewaPayment`
- `verifyEsewaPayment`

This file is also where the frontend API base URL is currently defined.

Protected frontend calls:

- all order calls send a bearer token
- eSewa initiate and verify also send a bearer token

### Payment service design

[services/payments/paymentClient.ts](/d:/Development/kittik-beauty/services/payments/paymentClient.ts) is the normalized payment entry point.

Responsibilities:

- chooses the provider module by payment method
- returns normalized initiation and verification results

Provider adapters:

- [services/payments/esewa.ts](/d:/Development/kittik-beauty/services/payments/esewa.ts)
- [services/payments/khalti.ts](/d:/Development/kittik-beauty/services/payments/khalti.ts)

Shared payment types:

- [services/payments/paymentTypes.ts](/d:/Development/kittik-beauty/services/payments/paymentTypes.ts)

## 5. State Management

The client uses focused Zustand stores.

### Active stores in the main buyer flow

- [store/authStore.ts](/d:/Development/kittik-beauty/store/authStore.ts)  
  Persists backend auth session and token.

- [store/cartStore.ts](/d:/Development/kittik-beauty/store/cartStore.ts)  
  Persists cart items and quantity changes.

- [store/wishlistStore.ts](/d:/Development/kittik-beauty/store/wishlistStore.ts)  
  Persists saved products.

- [store/addressStore.ts](/d:/Development/kittik-beauty/store/addressStore.ts)  
  Persists saved delivery addresses.

- [store/checkoutStore.ts](/d:/Development/kittik-beauty/store/checkoutStore.ts)  
  Persists last-used checkout form details.

- [store/paymentSessionStore.ts](/d:/Development/kittik-beauty/store/paymentSessionStore.ts)  
  Holds temporary payment context such as `orderId`, `redirectUrl`, `paymentId`, and provider reference between checkout and payment completion.

### Legacy store

- [store/orderStore.ts](/d:/Development/kittik-beauty/store/orderStore.ts)  
  Still exists, but the main order list and detail screens now use backend APIs rather than this store as the source of truth.

## 6. Buyer Flow

### Product to cart

1. Product cards route to [app/product/[id].tsx](/d:/Development/kittik-beauty/app/product/[id].tsx).
2. Product detail fetches the product from the backend.
3. Users can add to cart or use buy now to go straight to checkout.

### COD flow

1. Checkout validates name, phone, and address.
2. Checkout calls `POST /api/orders`.
3. The backend stores the order with status `placed`.
4. Checkout details are persisted locally.
5. Cart is cleared.
6. The app routes to [app/order-success.tsx](/d:/Development/kittik-beauty/app/order-success.tsx) with the new `orderId`.

### eSewa flow

1. Checkout calls `POST /api/orders`.
2. The backend stores the order with status `pending_payment`.
3. Checkout calls `initiatePayment()` for `esewa`.
4. [services/payments/esewa.ts](/d:/Development/kittik-beauty/services/payments/esewa.ts) calls `POST /api/payments/esewa/initiate`.
5. The backend returns a `redirectUrl` pointing back to its own redirect page.
6. Checkout stores the payment session in [store/paymentSessionStore.ts](/d:/Development/kittik-beauty/store/paymentSessionStore.ts).
7. The app routes to [app/payment-confirmation.tsx](/d:/Development/kittik-beauty/app/payment-confirmation.tsx).
8. The payment screen loads the backend redirect page in a WebView.
9. The backend redirect page auto-submits a `POST` form to `https://rc-epay.esewa.com.np/api/epay/main/v2/form`.
10. eSewa returns through the backend callback route, which redirects into the app with `status`, `orderId`, `transaction_uuid`, and callback `data`.
11. The WebView intercepts that callback URL.
12. The app calls `POST /api/payments/esewa/verify`.
13. The backend verifies the callback signature, checks the remote transaction status, updates the order to `paid`, and returns a normalized result.
14. The app clears the cart, clears the payment session, and routes to success.

### Khalti flow

- Khalti is still represented in the checkout UI.
- The current production path is not implemented end-to-end yet.
- There is no matching backend Khalti route set at this stage.

## 7. Payment Confirmation Screen Design

[app/payment-confirmation.tsx](/d:/Development/kittik-beauty/app/payment-confirmation.tsx) now acts as:

- an in-app payment container
- a WebView host for the backend redirect page
- a callback interceptor using `onShouldStartLoadWithRequest`
- the place where frontend payment verification is triggered after the backend callback redirects back into the app

This replaced the earlier manual demo confirm step.

## 8. API Workspace

The repository includes a Postman Local View setup:

- [.postman/resources.yaml](/d:/Development/kittik-beauty/.postman/resources.yaml)
- [postman/globals/workspace.globals.yaml](/d:/Development/kittik-beauty/postman/globals/workspace.globals.yaml)
- request files under `postman/collections/Kittik Beauty API/`

Current committed request groups:

- Health
- Auth
- Products
- Orders

Current setup assumptions:

- define `baseUrl` locally, for example `http://localhost:5000/api`
- define `authToken` locally before running protected order requests
- payment endpoints exist in the backend, but matching Postman request files are not committed yet

## 9. Domain Model

### Product

Defined in [types/product.ts](/d:/Development/kittik-beauty/types/product.ts).

Main fields include:

- `id`
- `name`
- `price`
- `image`
- `images`
- `category`
- `rating`
- `description`
- `stock`

### Order

Defined in [types/order.ts](/d:/Development/kittik-beauty/types/order.ts).

Main fields include:

- `id`
- `items`
- `fullName`
- `phone`
- `address`
- `paymentMethod`
- `subtotal`
- `deliveryFee`
- `total`
- `totalItems`
- `status`
- `createdAt`

Order statuses currently used:

- `pending_payment`
- `paid`
- `placed`
- `processing`
- `delivered`

## 10. Current Boundaries

The codebase is more complete than the earlier prototype, but a few intentional gaps remain:

- Khalti is not integrated end-to-end yet
- `paymentSessionStore` is still in-memory only
- pending backend eSewa sessions are also kept in process memory with no expiry/persistence layer
- `store/orderStore.ts` is now secondary to the backend order APIs
- the frontend API base URL is still hardcoded
- the committed Postman workspace does not cover payment endpoints yet

## 11. Recommended Next Steps

- add backend Khalti initiation and verification routes
- add Postman request files for the payment routes
- add expiry or persistence for pending backend eSewa sessions
- move API and payment config to environment-based frontend configuration
- remove or refactor the legacy local order store
- add automated tests around checkout, payment callbacks, and backend payment routes

## 12. Suggested Reading Order

For a practical walkthrough, read in this order:

1. [README.md](/d:/Development/kittik-beauty/README.md)
2. [app/_layout.tsx](/d:/Development/kittik-beauty/app/_layout.tsx)
3. [services/api.ts](/d:/Development/kittik-beauty/services/api.ts)
4. [app/product/[id].tsx](/d:/Development/kittik-beauty/app/product/[id].tsx)
5. [app/cart.tsx](/d:/Development/kittik-beauty/app/cart.tsx)
6. [app/checkout.tsx](/d:/Development/kittik-beauty/app/checkout.tsx)
7. [app/payment-confirmation.tsx](/d:/Development/kittik-beauty/app/payment-confirmation.tsx)
8. [src/app.js](/d:/Development/kittik-beauty/src/app.js)
9. [src/routes/paymentRoutes.js](/d:/Development/kittik-beauty/src/routes/paymentRoutes.js)
10. [src/controllers/paymentController.js](/d:/Development/kittik-beauty/src/controllers/paymentController.js)
