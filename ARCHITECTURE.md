# Kittik Backend Architecture

This project contains the operational side of Kittik Beauty: the Express backend server, Prisma database layer, uploads, and the admin panel frontend.

The backend project contains both:

1. Backend server at `D:\Coding\kittik-backend`, run with `npm run dev:server`.
2. Admin panel frontend at `D:\Coding\kittik-backend\admin`, run with `cd D:\Coding\kittik-backend\admin` and then `npm run dev`.

## Workspace Map

```text
D:\Coding\kittikbeauty-website
  Customer Website Frontend.
  Purpose: public customer-facing Kittik Beauty website/storefront.
  Run: npm run dev

D:\Coding\kittik-backend
  Backend Server plus admin project root.
  Purpose: Express backend server/API for Kittik Beauty.
  Backend run: npm run dev:server

D:\Coding\kittik-backend\admin
  Admin Panel Frontend.
  Purpose: admin dashboard frontend inside the backend project.
  Run: cd D:\Coding\kittik-backend\admin && npm run dev
```

## Workspace Boundaries

Always check whether the requested task is for the public customer website, backend API/server, or admin dashboard frontend before editing files.

- Customer storefront changes must be done inside `D:\Coding\kittikbeauty-website`.
- Backend server changes must be done inside `D:\Coding\kittik-backend`.
- Admin frontend changes must be done inside `D:\Coding\kittik-backend\admin`.
- Do not edit backend/API files for website UI tasks.
- Do not edit website frontend files for backend/API tasks.
- Do not edit customer website files when the task is admin dashboard related.
- Do not put customer website UI changes directly in the backend root.

## Project Boundaries

`D:\Coding\kittik-backend` owns:

- backend API routes
- Prisma database schema and data access
- admin authentication and authorization
- product, category, brand, banner, reel, customer, and order management
- media uploads
- payment/order backend flows

`D:\Coding\kittik-backend\admin` owns:

- admin dashboard UI
- product management UI
- category/brand/subcategory management UI
- order management UI
- banner management UI
- admin login/session UI
- shadcn admin components

`D:\Coding\kittikbeauty-website` owns:

- public storefront pages
- public responsive header/footer/search
- homepage sections
- product/category/brand browsing
- makeup service marketing page
- public SEO metadata and storefront styling

## Runtime Topology

```text
Public customer
  -> D:\Coding\kittikbeauty-website
  -> NEXT_PUBLIC_API_URL
  -> D:\Coding\kittik-backend src/
  -> Prisma
  -> MariaDB/MySQL

Admin user
  -> D:\Coding\kittik-backend\admin
  -> D:\Coding\kittik-backend src/
  -> Prisma
  -> MariaDB/MySQL
```

## Backend Server Structure

```text
src/
  server.js                        Starts the Express server
  app.js                           Express app setup, middleware, mounted routes
  config/                          Prisma/database configuration
  controllers/                     Request handlers and business logic
  middleware/                      Auth and upload middleware
  routes/                          API route groups
  utils/                           Shared backend helpers

prisma/
  schema.prisma                    Database model
  migrations/                      Database migrations
  seed.js                          Seed data script

uploads/
  Product and media uploads served by the backend
```

## Admin Frontend Structure

```text
admin/
  app/                             Next.js App Router admin pages
  components/                      Admin UI components
  lib/                             API client, config, admin session logic
  public/                          Admin static assets
```

Main admin areas:

- login
- dashboard
- products
- orders
- customers
- banners
- settings

## API Surface

Typical route groups are mounted under:

```text
/api/health
/api/auth
/api/products
/api/orders
/api/payments
```

Public storefront reads come from `kittikbeauty-website/src/lib/api.ts`.
Admin reads and writes come from `kittik-backend/admin/lib/api.ts`.

## Local Development

Install root/backend dependencies:

```bash
npm install
```

Install admin dependencies:

```bash
cd admin
npm install
```

Run the API server:

```bash
npm run dev:server
```

Run the admin panel:

```bash
cd admin
npm run dev
```

Run the public storefront from the sibling project:

```bash
cd ..\kittikbeauty-website
npm run dev
```

The public website should use:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Documentation

- Root README: `README.md`
- Detailed legacy/backend architecture: `docs/ARCHITECTURE.md`
- Public website docs: `..\kittikbeauty-website\README.md`
- Public website architecture: `..\kittikbeauty-website\ARCHITECTURE.md`
