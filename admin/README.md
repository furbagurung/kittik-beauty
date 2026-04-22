# Kittik Beauty Admin

This directory contains the Kittik Beauty admin dashboard built with Next.js App Router.

It is a separate app from the Expo buyer app in the repository root. The dashboard depends on the Express backend running from the root project.

## Current Features

- admin login with persisted session restore
- protected dashboard layout with status-based auth gating
- dashboard stats and recent orders
- product list, create, edit, and delete flows
- Shopify-style product editor with product media, category, price, stock, status, vendor, type, tags, and SEO fields
- product option builder for options such as Shade, Size, and Color
- generated variants table with row selection, bulk price/stock updates, per-variant images, default variant selection, and variant deletion
- Sonner toast feedback for validation, API errors, and product success states
- shadcn/Radix `AlertDialog` confirmations for destructive actions such as delete and discard
- order list and order detail screens
- order status updates
- customer list
- placeholder settings page

## Requirements

- Node.js 20+
- the root backend API running on a reachable URL
- at least one database user with `role = "admin"`

## Local Setup

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The app runs on `http://localhost:3000` by default.

## Backend Dependency

The dashboard talks directly to the Express API through [`lib/api.ts`](./lib/api.ts). The base URL is defined in [`lib/api-config.ts`](./lib/api-config.ts).

Current API assumption:

- `API_BASE_URL = "http://localhost:5000/api"`

If your backend is running somewhere else, update [`lib/api-config.ts`](./lib/api-config.ts) before testing.

## Auth Flow

The login screen posts to:

- `POST /api/auth/admin/login`

On success, the dashboard stores:

- `adminToken`
- `adminUser`

in `localStorage`.

The session layer in [`lib/admin-session.ts`](./lib/admin-session.ts) then manages:

- `status`: `idle`, `hydrating`, `authenticated`, or `unauthenticated`
- `hasHydrated`
- `token`
- `user`
- `bootstrapAdminSession()`
- `setAdminSession()`
- `clearAdminSession()`

During bootstrap, the app validates a stored token by calling:

- `GET /api/auth/admin/me`

[`components/layout/AdminShell.tsx`](./components/layout/AdminShell.tsx) waits for hydration/bootstrap before rendering protected dashboard routes. Invalid or missing sessions redirect to `/login`.

Backend authorization still depends on JWT validation and `isAdmin` middleware.

## Product Editor

The product form in [`components/products/ProductForm.tsx`](./components/products/ProductForm.tsx) edits the current normalized catalog model while preserving backward-compatible fields.

It supports:

- one unified product editor card for title, description, media, category, price, and stock
- product media upload and gallery management
- product status, vendor, product type, tags, and SEO fields
- option creation and editing
- generated variants from option values
- per-variant image upload
- row selection and bulk variant actions
- default variant selection
- product delete

Admin product mutations send multipart form data with:

- `primaryImage`
- `galleryImages`
- `variantImages`
- JSON fields for `options`, `variants`, `tags`, SEO, vendor, and product type

## Feedback UX

The admin app uses Sonner and shadcn/Radix dialogs instead of browser alerts.

- [`components/ui/sonner.tsx`](./components/ui/sonner.tsx) wraps Sonner.
- The global `<Toaster />` is mounted in [`app/layout.tsx`](./app/layout.tsx).
- [`components/ui/alert-dialog.tsx`](./components/ui/alert-dialog.tsx) provides the AlertDialog primitives.
- [`components/shared/ConfirmActionDialog.tsx`](./components/shared/ConfirmActionDialog.tsx) provides reusable destructive confirmations.
- [`components/products/ProductSuccessToast.tsx`](./components/products/ProductSuccessToast.tsx) turns product success query params into toast notifications.

Use toasts for short validation/API feedback and `AlertDialog` for destructive confirmations.

## Main Routes

- `/(auth)/login`
- `/(dashboard)`
- `/(dashboard)/products`
- `/(dashboard)/products/new`
- `/(dashboard)/products/[id]`
- `/(dashboard)/orders`
- `/(dashboard)/orders/[id]`
- `/(dashboard)/customers`
- `/(dashboard)/settings`

## Current Limitations

- The dashboard uses a hardcoded backend base URL.
- The settings page is presentational only.
- Variant editing currently focuses on title, image, price, stock, and default selection; advanced SKU/barcode/weight fields are not fully exposed in the UI yet.
- Admin auth is still client-rendered, while real enforcement happens in the backend.

## Useful Commands

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`
- `rg "alert\\(|confirm\\(|window\\.alert|window\\.confirm" admin`

## Related Docs

- [Root README](../README.md)
- [Architecture](../docs/ARCHITECTURE.md)
