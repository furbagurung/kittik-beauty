# Kittik Beauty

Kittik Beauty is an Expo Router based React Native ecommerce app with an Express backend. The current codebase supports backend-backed auth, product browsing, cart and checkout, order history, and an in-app eSewa payment handoff.

Additional documentation:

- [docs/ARCHITECTURE.md](/d:/Development/kittik-beauty/docs/ARCHITECTURE.md)

## Overview

The app currently includes:

- backend-backed login and signup
- backend-backed product listing and product detail fetches
- rich product detail pages with image carousel, fullscreen gallery, and related products
- cart, wishlist, saved addresses, and persisted checkout details
- checkout with `cod`, `esewa`, and `khalti` payment selection
- in-app eSewa payment loading through `react-native-webview`
- backend order creation, order history, and order detail screens
- order success and payment status handling

## Tech Stack

Frontend:

- Expo SDK 54
- React 19
- React Native 0.81
- Expo Router
- Zustand with AsyncStorage persistence
- React Native Reanimated
- Moti
- React Native Gesture Handler
- React Native Reanimated Carousel
- React Native WebView
- TypeScript

Backend:

- Express 5
- Prisma
- MariaDB / MySQL
- JWT auth

## Running The Project

1. Install dependencies

```bash
npm install
```

2. Start the backend

```bash
npm run start:server
```

3. Start the app

```bash
npm run start
```

Useful scripts:

- `npm run android`
- `npm run ios`
- `npm run web`
- `npm run lint`
- `npx tsc --noEmit`

Important:

- The mobile app currently points to the API base URL defined in [services/api.ts](/d:/Development/kittik-beauty/services/api.ts:1).
- If you are testing on a real device, that API base URL must be reachable from the phone.

## Project Structure

```text
app/                    Expo Router screens
app/(tabs)/             Bottom-tab routes
components/             Reusable UI and feature components
services/api.ts         Shared frontend API client
services/payments/      Payment-provider frontend adapters
store/                  Zustand stores
types/                  Shared frontend models
utils/                  Payment helpers and shared utilities
src/                    Express backend
src/routes/             Backend route modules
src/controllers/        Backend controllers
src/config/             Prisma setup
docs/                   Project documentation
```

## Main Frontend Routes

### Tab routes

- `app/(tabs)/index.tsx`  
  Home screen with search, categories, and featured products.

- `app/(tabs)/categories.tsx`  
  Category browsing entry.

- `app/(tabs)/wishlist.tsx`  
  Saved product list.

- `app/(tabs)/profile.tsx`  
  Account screen that now reads order count from the backend orders API.

### Stack routes

- `app/login.tsx`  
  Signup/login entry backed by the API and persisted auth store.

- `app/signup.tsx`  
  Signup form backed by the API and persisted auth store.

- `app/products.tsx`  
  API-backed product grid with search, category filter, and sort.

- `app/product/[id].tsx`  
  Product detail screen with quantity controls, wishlist toggle, add-to-cart, buy-now, image carousel, fullscreen gallery, and related products.

- `app/cart.tsx`  
  Cart management and checkout entry.

- `app/checkout.tsx`  
  Customer details, saved addresses, payment selection, backend order creation, and online payment session setup.

- `app/payment-confirmation.tsx`  
  In-app payment screen that loads the backend-generated eSewa redirect page inside a WebView and intercepts the return callback.

- `app/order-success.tsx`  
  Success screen after COD or verified online payment.

- `app/orders.tsx`  
  Backend-backed order history.

- `app/order/[id].tsx`  
  Backend-backed single order detail screen.

## Backend API

The Express app entry is [src/app.js](/d:/Development/kittik-beauty/src/app.js:1). The server bootstrap is [src/server.js](/d:/Development/kittik-beauty/src/server.js:1).

Mounted API route groups:

- `/api/auth`
- `/api/products`
- `/api/orders`
- `/api/payments`

Current payment routes:

- `POST /api/payments/esewa/initiate`
- `GET /api/payments/esewa/redirect/:transactionUuid`
- `POST /api/payments/esewa/verify`

## State Management

The app uses small focused Zustand stores.

- `store/authStore.ts`  
  Persists signed-in user and token returned by the backend.

- `store/cartStore.ts`  
  Persists cart items and quantity changes.

- `store/wishlistStore.ts`  
  Persists wishlisted products.

- `store/addressStore.ts`  
  Persists reusable delivery addresses.

- `store/checkoutStore.ts`  
  Persists checkout form details for reuse.

- `store/paymentSessionStore.ts`  
  Keeps temporary online payment context such as `orderId`, `redirectUrl`, and provider reference while the user is in the payment flow.

- `store/orderStore.ts`  
  Legacy local order store. The main buyer flow now uses the backend orders API instead of this store for order history and order details.

## Payment Flow

### COD

1. Checkout creates an order through `POST /api/orders`.
2. The backend stores the order with status `placed`.
3. The app saves checkout details, clears the cart, and routes to order success.

### eSewa

1. Checkout creates an order through `POST /api/orders`.
2. The backend stores the order with status `pending_payment`.
3. The frontend payment client calls `POST /api/payments/esewa/initiate`.
4. The backend generates a signed eSewa form payload and returns a backend `redirectUrl`.
5. `app/payment-confirmation.tsx` opens that URL inside a WebView.
6. The backend redirect page auto-submits a `POST` form to the eSewa UAT payment endpoint.
7. On return, the payment screen intercepts the callback URL.
8. The app calls `POST /api/payments/esewa/verify`.
9. If verification succeeds, the app updates the order status to `paid` and routes to success.

### Khalti

- Khalti is still exposed in the payment selection UI.
- The current checkout flow treats Khalti as not yet available for production use.
- There is not yet a matching backend Khalti route set like the eSewa implementation.

## Payment Files

- [services/api.ts](/d:/Development/kittik-beauty/services/api.ts:1)
- [services/payments/paymentClient.ts](/d:/Development/kittik-beauty/services/payments/paymentClient.ts:1)
- [services/payments/esewa.ts](/d:/Development/kittik-beauty/services/payments/esewa.ts:1)
- [services/payments/khalti.ts](/d:/Development/kittik-beauty/services/payments/khalti.ts:1)
- [services/payments/paymentTypes.ts](/d:/Development/kittik-beauty/services/payments/paymentTypes.ts:1)
- [app/payment-confirmation.tsx](/d:/Development/kittik-beauty/app/payment-confirmation.tsx:1)
- [src/routes/paymentRoutes.js](/d:/Development/kittik-beauty/src/routes/paymentRoutes.js:1)
- [src/controllers/paymentController.js](/d:/Development/kittik-beauty/src/controllers/paymentController.js:1)

## Current Notes

- The app is no longer purely mock-data or local-auth driven; products, auth, and orders are API-backed.
- eSewa now has a backend initiation route and an in-app payment surface.
- eSewa verification is still placeholder-friendly on the backend and should be replaced with real status verification before production.
- `paymentSessionStore` remains intentionally in-memory.
- The API base URL is still hardcoded in the frontend service layer and should be environment-configured later.

## Suggested Next Improvements

- replace placeholder eSewa verification with real server-side status verification
- add Khalti backend initiation and verification routes
- move frontend API base URL and payment config to environment-based configuration
- remove or repurpose the legacy `orderStore`
- add automated tests for checkout, payment, and backend route handlers

## Verification

Current local quality checks:

- `npm run lint`
- `npx tsc --noEmit`
