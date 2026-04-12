# Architecture

This document explains how Kittik Beauty is structured, how the main user flows work, and where core responsibilities live in the codebase.

## 1. Application Shape

Kittik Beauty is an Expo Router app built around file-based navigation. The app is organized into a small set of screens, reusable feature components, focused Zustand stores, and payment helper modules.

At a high level:

- `app/` contains routes and screen-level UI
- `components/` contains reusable presentation and interaction building blocks
- `store/` contains app state and persistence
- `services/payments/` contains payment-provider-specific logic
- `types/` defines shared domain models
- `utils/` contains payment helpers and view logic support
- `constants/` contains mock catalog data, theme values, and motion settings

## 2. Navigation Architecture

### Root layout

The root entry point is [app/_layout.tsx](/d:/Development/kittik-beauty/app/_layout.tsx).

Responsibilities:

- installs the global navigation stack
- wraps the app in `ThemeProvider`
- wraps the app in `GestureHandlerRootView`
- loads Reanimated runtime support
- mounts the global toast UI

### Tab layout

The main shopper-facing shell is [app/(tabs)/_layout.tsx](/d:/Development/kittik-beauty/app/(tabs)/_layout.tsx).

Bottom tabs:

- Home
- Categories
- Wishlist
- Profile

The wishlist tab also displays a live badge from the wishlist store.

### Stack screens

These screens sit above or outside the bottom-tab shell:

- login
- signup
- products
- product details
- cart
- checkout
- payment confirmation
- order success
- orders
- order details

## 3. Screen Responsibilities

### Discovery and catalog

- [app/(tabs)/index.tsx](/d:/Development/kittik-beauty/app/(tabs)/index.tsx)  
  Entry home screen with hero content, search, categories, and featured products.

- [app/products.tsx](/d:/Development/kittik-beauty/app/products.tsx)  
  Full product list with filter and sort controls.

- [app/product/[id].tsx](/d:/Development/kittik-beauty/app/product/[id].tsx)  
  Product details, quantity selection, wishlist toggle, add-to-cart, and buy-now actions.

### Shopping and checkout

- [app/cart.tsx](/d:/Development/kittik-beauty/app/cart.tsx)  
  Cart review, quantity control, removal, and checkout entry.

- [app/checkout.tsx](/d:/Development/kittik-beauty/app/checkout.tsx)  
  Collects customer details, lets users reuse saved addresses, selects payment method, creates orders, and starts the payment session for online methods.

### Orders and payment

- [app/payment-confirmation.tsx](/d:/Development/kittik-beauty/app/payment-confirmation.tsx)  
  Demo payment confirmation step used for eSewa and Khalti.

- [app/order-success.tsx](/d:/Development/kittik-beauty/app/order-success.tsx)  
  Success state after COD or successful online payment verification.

- [app/orders.tsx](/d:/Development/kittik-beauty/app/orders.tsx)  
  Persisted order history list.

- [app/order/[id].tsx](/d:/Development/kittik-beauty/app/order/[id].tsx)  
  Order summary, customer information, item list, and payment summary.

### Identity and account

- [app/login.tsx](/d:/Development/kittik-beauty/app/login.tsx)  
  Local login form that writes to the auth store.

- [app/signup.tsx](/d:/Development/kittik-beauty/app/signup.tsx)  
  Local signup form that writes to the auth store.

- [app/(tabs)/profile.tsx](/d:/Development/kittik-beauty/app/(tabs)/profile.tsx)  
  Account overview, auth entry points, wishlist access, and order access.

## 4. State Management

State is split into small independent Zustand stores. Persisted stores use `persist` with AsyncStorage and expose a `hydrated` flag so screens can avoid rendering stale content before storage rehydrates.

### Auth store

File: [store/authStore.ts](/d:/Development/kittik-beauty/store/authStore.ts)

Responsibilities:

- stores the current user
- supports `login`, `signup`, and `logout`
- persists the user between sessions

### Cart store

File: [store/cartStore.ts](/d:/Development/kittik-beauty/store/cartStore.ts)

Responsibilities:

- stores cart items
- merges matching items when adding the same product
- supports quantity increase/decrease
- prevents quantity from going below 1
- computes total items and total price

### Wishlist store

File: [store/wishlistStore.ts](/d:/Development/kittik-beauty/store/wishlistStore.ts)

Responsibilities:

- adds/removes items through `toggleWishlist`
- checks membership through `isInWishlist`
- persists saved items

### Address store

File: [store/addressStore.ts](/d:/Development/kittik-beauty/store/addressStore.ts)

Responsibilities:

- stores saved delivery addresses
- deduplicates addresses by full name, phone, and address text
- supports removal and persistence

### Checkout store

File: [store/checkoutStore.ts](/d:/Development/kittik-beauty/store/checkoutStore.ts)

Responsibilities:

- persists the last-used checkout details
- allows checkout forms to preload customer information on future sessions

### Order store

File: [store/orderStore.ts](/d:/Development/kittik-beauty/store/orderStore.ts)

Responsibilities:

- stores the order history
- inserts new orders at the start of the list
- updates order status after payment verification

### Payment session store

File: [store/paymentSessionStore.ts](/d:/Development/kittik-beauty/store/paymentSessionStore.ts)

Responsibilities:

- stores temporary payment context between checkout and payment confirmation
- is intentionally in-memory only
- is cleared on confirmation or cancellation

## 5. Domain Model

### Product

Defined in [types/product.ts](/d:/Development/kittik-beauty/types/product.ts).

Main fields:

- `id`
- `name`
- `price`
- `image`
- `category`
- `rating`

### Order

Defined in [types/order.ts](/d:/Development/kittik-beauty/types/order.ts).

Main fields:

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

Order statuses currently in use:

- `pending_payment`
- `paid`
- `placed`
- `processing`
- `delivered`

## 6. Product Data

The product catalog currently comes from local mock data:

- [constants/mockData.ts](/d:/Development/kittik-beauty/constants/mockData.ts)

This means:

- product browsing is currently frontend-only
- there is no backend pagination or inventory sync
- catalog changes are code changes for now

## 7. Checkout And Order Flow

The core purchase flow is orchestrated inside [app/checkout.tsx](/d:/Development/kittik-beauty/app/checkout.tsx).

### COD flow

1. User fills checkout form.
2. App validates full name, phone, and address.
3. App creates an `Order` with status `placed`.
4. Order is added to `orderStore`.
5. Checkout details are persisted for reuse.
6. Cart is cleared.
7. User is routed to order success.

### Online payment flow

1. User selects `esewa` or `khalti`.
2. App creates an `Order` with status `pending_payment`.
3. Order is added to `orderStore`.
4. `initiatePayment()` is called with order and customer details.
5. Payment payload is stored in `paymentSessionStore`.
6. Cart is cleared.
7. User is routed to payment confirmation.
8. `verifyPayment()` is called from the confirmation screen.
9. If payment succeeds, the order status is updated to `paid`.
10. Payment session is cleared and the user is routed to success.

## 8. Payment Service Design

### Entry point

The payment abstraction entry point is [services/payments/paymentClient.ts](/d:/Development/kittik-beauty/services/payments/paymentClient.ts).

Responsibilities:

- delegates online payment initiation to the correct provider module
- delegates payment verification to the correct provider module
- returns normalized result shapes

### Provider modules

- [services/payments/esewa.ts](/d:/Development/kittik-beauty/services/payments/esewa.ts)
- [services/payments/khalti.ts](/d:/Development/kittik-beauty/services/payments/khalti.ts)

### Shared types

Defined in [services/payments/paymentTypes.ts](/d:/Development/kittik-beauty/services/payments/paymentTypes.ts).

These types normalize:

- initiation input
- initiation result
- verification input
- verification result

### Utility helpers

[utils/payment.ts](/d:/Development/kittik-beauty/utils/payment.ts) contains:

- display labels for payment methods
- online-payment detection
- payload construction helpers

## 9. Motion Architecture

The app uses a small, reusable motion layer rather than ad hoc screen-specific animation code.

### Motion constants

File: [constants/motion.ts](/d:/Development/kittik-beauty/constants/motion.ts)

Provides:

- duration values
- easing curves
- scale presets
- shared entrance transition factory

### ScalePressable

File: [components/motion/ScalePressable.tsx](/d:/Development/kittik-beauty/components/motion/ScalePressable.tsx)

Responsibilities:

- uses Gesture Handler `Pressable`
- uses Reanimated shared values and timing
- gives tactile press feedback
- stays reusable for buttons, cards, and selection rows

### FadeUpView

File: [components/motion/FadeUpView.tsx](/d:/Development/kittik-beauty/components/motion/FadeUpView.tsx)

Responsibilities:

- uses Moti for simple fade/translate entrance motion
- supports delay-based staggering
- keeps screen entrance patterns consistent

## 10. UI Composition

The UI is mostly screen-local, but a few reusable pieces are worth noting.

### Commerce UI

- [components/home/ProductCard.tsx](/d:/Development/kittik-beauty/components/home/ProductCard.tsx)

### Shared UI

- [components/ui/collapsible.tsx](/d:/Development/kittik-beauty/components/ui/collapsible.tsx)

## 11. Persistence Strategy

Persisted stores use:

- Zustand `persist`
- `createJSONStorage`
- `@react-native-async-storage/async-storage`

Hydration handling matters because screen logic depends on persisted data. Most persisted stores expose:

- `hydrated`
- `setHydrated`
- `onRehydrateStorage`

This pattern prevents the UI from assuming storage data is ready before rehydration completes.

## 12. Current Boundaries And Tradeoffs

Current implementation choices:

- auth is local and not server-backed
- products are mocked locally
- payment flows are simulated
- there is no backend order sync
- payment session state is intentionally short-lived and in-memory

These tradeoffs keep the app simple for prototyping while preserving clean upgrade paths for backend and gateway integration.

## 13. Extension Points

The cleanest next extension points are:

- replace mock products with API-backed catalog fetches
- connect auth to a backend identity system
- persist payment session in a safer resumable flow if needed
- add server-generated order IDs
- integrate real eSewa and Khalti callback handling
- add validation schemas shared between forms and store actions
- add unit tests for stores and payment modules

## 14. Recommended Reading Order

For a fast codebase walkthrough:

1. [README.md](/d:/Development/kittik-beauty/README.md)
2. [app/_layout.tsx](/d:/Development/kittik-beauty/app/_layout.tsx)
3. [app/(tabs)/_layout.tsx](/d:/Development/kittik-beauty/app/(tabs)/_layout.tsx)
4. [app/(tabs)/index.tsx](/d:/Development/kittik-beauty/app/(tabs)/index.tsx)
5. [app/product/[id].tsx](/d:/Development/kittik-beauty/app/product/[id].tsx)
6. [app/cart.tsx](/d:/Development/kittik-beauty/app/cart.tsx)
7. [app/checkout.tsx](/d:/Development/kittik-beauty/app/checkout.tsx)
8. [services/payments/paymentClient.ts](/d:/Development/kittik-beauty/services/payments/paymentClient.ts)
9. [store/](/d:/Development/kittik-beauty/store)
