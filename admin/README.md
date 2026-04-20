# Kittik Beauty Admin

This directory contains the Kittik Beauty admin dashboard built with Next.js App Router.

It is a separate app from the Expo buyer app in the repository root. The dashboard depends on the Express backend running from the root project.

## Current Features

- admin login
- dashboard stats and recent orders
- product list
- create and edit product screens
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

The dashboard talks directly to the Express API through [`lib/api.ts`](./lib/api.ts).

Current API assumption:

- `API_BASE_URL = "http://localhost:5000/api"`

If your backend is running somewhere else, update [`lib/api.ts`](./lib/api.ts) before testing.

## Auth Flow

The login screen posts to:

- `POST /api/auth/admin/login`

On success, the dashboard stores:

- `adminToken`
- `adminUser`

in `localStorage`.

[`components/layout/AdminShell.tsx`](./components/layout/AdminShell.tsx) checks for `adminToken` on the client and redirects to `/login` when it is missing.

Important:

- this is only a client-side gate
- real authorization still depends on backend JWT validation
- backend admin checks rely on `req.user.role === "admin"`

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
- The product form still exposes a `status` field, but the current backend product model does not persist product status.
- Login state is stored only in browser `localStorage`.

## Useful Commands

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`

## Related Docs

- [Root README](../README.md)
- [Architecture](../docs/ARCHITECTURE.md)
