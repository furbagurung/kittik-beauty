# Kittik Beauty

Kittik Beauty is an Expo Router based React Native ecommerce app for browsing beauty products, managing a cart and wishlist, authenticating users, placing orders, and simulating online payment confirmation for eSewa and Khalti.

Additional documentation:

- [docs/ARCHITECTURE.md](/d:/Development/kittik-beauty/docs/ARCHITECTURE.md) for a deeper technical breakdown

## Overview

The app is built as a mobile-first storefront with:

- product browsing and search
- category-based discovery
- product detail pages
- cart and checkout flow
- saved addresses and persisted checkout details
- order history and order detail screens
- demo online payment confirmation
- wishlist and lightweight account screens
- reusable premium motion with Reanimated, Moti, and Gesture Handler

## Tech Stack

- Expo SDK 54
- React 19
- React Native 0.81
- Expo Router for file-based navigation
- Zustand with AsyncStorage persistence
- React Native Reanimated for core animations
- Moti for entrance and micro interactions
- React Native Gesture Handler for gesture-friendly press interactions
- TypeScript

## Running The Project

1. Install dependencies

```bash
npm install
```

2. Start the app

```bash
npm run start
```

Useful scripts:

- `npm run android`
- `npm run ios`
- `npm run web`
- `npm run lint`

## Project Structure

```text
app/                    Screens and Expo Router routes
app/(tabs)/             Bottom-tab screens
components/             Reusable UI and feature components
components/home/        Home and commerce-specific components
components/motion/      Shared motion wrappers
constants/              Theme, mock data, and motion constants
services/payments/      Demo payment initiation and verification logic
store/                  Zustand persisted stores
types/                  Shared TypeScript models
utils/                  Payment helpers and shared utilities
```

## Main Routes

### Tab routes

- `app/(tabs)/index.tsx`  
  Home screen with hero, search, categories, and featured products.

- `app/(tabs)/categories.tsx`  
  Category browsing entry.

- `app/(tabs)/wishlist.tsx`  
  Saved product list.

- `app/(tabs)/profile.tsx`  
  Account summary, login/signup entry, and order access.

### Stack routes

- `app/login.tsx`  
  Demo login screen backed by the auth store.

- `app/signup.tsx`  
  Demo signup screen backed by the auth store.

- `app/products.tsx`  
  Full product list with search, category filter, and sorting.

- `app/product/[id].tsx`  
  Product detail page with wishlist and add-to-cart actions.

- `app/cart.tsx`  
  Cart management and quantity updates.

- `app/checkout.tsx`  
  Customer details, saved addresses, payment selection, and order creation.

- `app/payment-confirmation.tsx`  
  Demo payment confirmation step for online methods.

- `app/order-success.tsx`  
  Post-order success screen.

- `app/orders.tsx`  
  Persisted order history.

- `app/order/[id].tsx`  
  Single order detail screen.

## State Management

The app uses small focused Zustand stores. Most stores persist through AsyncStorage.

- `store/authStore.ts`  
  Holds the signed-in user and auth hydration state.

- `store/cartStore.ts`  
  Manages cart items, quantity changes, totals, and cart persistence.

- `store/wishlistStore.ts`  
  Stores wishlisted products.

- `store/addressStore.ts`  
  Persists reusable delivery addresses.

- `store/checkoutStore.ts`  
  Saves checkout details for reuse in future sessions.

- `store/orderStore.ts`  
  Persists orders and supports order status updates.

- `store/paymentSessionStore.ts`  
  Stores the temporary payload required by the payment confirmation screen.

## Data Model

Core shared types live in:

- `types/product.ts`
- `types/order.ts`

Order status currently supports:

- `pending_payment`
- `paid`
- `placed`
- `processing`
- `delivered`

Payment methods currently support:

- `cod`
- `esewa`
- `khalti`

## Payment Flow

The payment flow is intentionally demo-friendly and structured for later gateway integration.

1. Checkout builds an `Order`.
2. If the selected method is `cod`, the order is stored and the app routes directly to success.
3. If the selected method is `esewa` or `khalti`, checkout stores the order with `pending_payment`.
4. `services/payments/paymentClient.ts` delegates initiation and verification to provider-specific modules.
5. `app/payment-confirmation.tsx` verifies the payment and updates the order status to `paid`.

Relevant files:

- `services/payments/paymentClient.ts`
- `services/payments/esewa.ts`
- `services/payments/khalti.ts`
- `services/payments/paymentTypes.ts`
- `utils/payment.ts`

## Motion System

The project includes a small reusable motion layer for premium, restrained UI feedback.

- `constants/motion.ts`  
  Shared timing, easing, and press-scale values.

- `components/motion/ScalePressable.tsx`  
  Reanimated + Gesture Handler powered press-scale wrapper.

- `components/motion/FadeUpView.tsx`  
  Moti-powered fade-up entrance wrapper.

This motion system is currently applied to:

- product cards
- checkout sections and primary actions
- order cards
- success and payment confirmation screens

## Styling Approach

- Screen styles are colocated in each route/component file.
- The visual language favors soft surfaces, rounded cards, pink accents, and high readability.
- `@expo/vector-icons` is used across the app.

## Persistence

The following user-facing data survives app restarts:

- auth session
- cart
- wishlist
- saved addresses
- checkout details
- orders
- payment session state

Persistence is implemented with Zustand `persist` and AsyncStorage.

## Notes For Development

- This app currently uses local mock product data from `constants/mockData.ts`.
- Authentication is local-state based and not yet connected to a backend.
- Payments are simulated and structured to be replaceable with real gateway integrations later.
- The app uses Expo Router file-based navigation, so route naming should stay aligned with the `app/` directory structure.

## Suggested Next Improvements

- connect products, auth, and orders to a backend API
- replace demo payment verification with real gateway callbacks
- add form schema validation for auth and checkout
- add automated tests for stores and payment helpers
- add environment-based configuration for payment providers

## Verification

Current local quality checks:

- `npm run lint`
- `npx tsc --noEmit`
