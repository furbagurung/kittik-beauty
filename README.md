# Kittik Backend

This folder contains both the Kittik Beauty Express backend server and the admin panel frontend.

It is not the public customer website. The public website lives in the sibling folder:

```text
D:\Coding\kittikbeauty-website
```

## Workspace Roles

```text
D:\Coding\kittikbeauty-website         Customer Website Frontend
D:\Coding\kittik-backend               Backend Server
D:\Coding\kittik-backend\admin         Admin Panel Frontend
```

### Backend Server

Path:

```text
D:\Coding\kittik-backend
```

Purpose:

This is the Express backend server/API for Kittik Beauty.

Run command:

```bash
npm run dev:server
```

Use this folder for Express API routes, Prisma/database logic, authentication backend, product API, category/brand/subcategory API, order/payment API, uploads handling, and server-side backend logic.

Do not put customer website UI changes directly in this backend root.

### Admin Panel Frontend

Path:

```text
D:\Coding\kittik-backend\admin
```

Purpose:

This is the admin dashboard frontend inside the backend project.

Run command:

```bash
cd D:\Coding\kittik-backend\admin
npm run dev
```

Use this folder for admin dashboard UI, product management UI, category/brand/subcategory management UI, order management UI, banner management UI, admin login/session UI, and shadcn admin components.

The backend project contains both:

1. Backend server at `D:\Coding\kittik-backend`, run with `npm run dev:server`.
2. Admin panel frontend at `D:\Coding\kittik-backend\admin`, run with `cd D:\Coding\kittik-backend\admin` and then `npm run dev`.

Use `D:\Coding\kittik-backend` when changing Express API routes, Prisma/database logic, authentication backend, product API, category/brand/subcategory API, order/payment API, uploads handling, and server-side backend logic.

Use `D:\Coding\kittik-backend\admin` when changing admin dashboard UI, product/category/brand/subcategory management UI, order management UI, banner management UI, admin login/session UI, and shadcn admin components.

Use `D:\Coding\kittikbeauty-website` when changing the public customer website: homepage, product listing UI, product detail UI, category pages, makeup service page, customer search UI, header/navbar/footer, SEO pages, and public website design or branding.

## Workspace Boundaries

Always check whether the requested task is for the public customer website, backend API/server, or admin dashboard frontend before editing files.

- Customer storefront changes must be done inside `D:\Coding\kittikbeauty-website`.
- Backend server changes must be done inside `D:\Coding\kittik-backend`.
- Admin frontend changes must be done inside `D:\Coding\kittik-backend\admin`.
- Do not edit backend/API files for website UI tasks.
- Do not edit website frontend files for backend/API tasks.
- Do not edit customer website files when the task is admin dashboard related.
- Do not put customer website UI changes directly in this backend root.

## What Is In This Project

```text
src/       Express backend API
admin/     Next.js admin panel frontend
prisma/    Prisma schema, migrations, and seed data
uploads/   Uploaded product and media files
docs/      Additional documentation
scripts/   Utility scripts
postman/   Postman collections and globals
```

## Backend Server

The backend server is in:

```text
src/
```

Run command:

```bash
npm run dev:server
```

Important backend paths:

```text
src/server.js                    Server entry point
src/app.js                       Express app setup and route mounting
src/routes/                      API route groups
src/controllers/                 Request handlers and business logic
src/middleware/                  Auth and upload middleware
src/config/                      Prisma/database configuration
src/utils/                       Shared backend utilities
prisma/schema.prisma             Database schema
uploads/                         Uploaded media
```

The API handles product, category, brand, banner, reel, order, customer, auth, upload, and payment-related backend work.

## Admin Panel

The admin frontend is in:

```text
admin/
```

Run command:

```bash
cd D:\Coding\kittik-backend\admin
npm run dev
```

Important admin paths:

```text
admin/app/                       Next.js App Router pages
admin/components/                Admin UI components
admin/lib/api.ts                 Admin API client
admin/lib/admin-session.ts       Admin session management
admin/lib/api-config.ts          Admin API base URL config
```

The admin panel manages products, orders, customers, banners, and other operational content.

## Public Website Connection

The public storefront in `D:\Coding\kittikbeauty-website` reads public data from this backend through:

```text
kittikbeauty-website/src/lib/api.ts
```

For local development, the website should point to this backend:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Tech Stack

Backend:

- Node.js
- Express 5
- Prisma 7
- MariaDB/MySQL
- JWT auth
- bcryptjs
- multer

Admin:

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- shadcn/Radix-style UI
- Sonner

## Setup

Install backend dependencies:

```bash
npm install
```

Install admin dependencies:

```bash
cd admin
npm install
```

Create `.env` in this folder, or copy `.env.sample`.

Common required values:

```env
DATABASE_URL="mysql://USER:PASSWORD@localhost:3306/kittik"
JWT_SECRET="replace-this-with-a-real-secret"
```

Payment-related flows may also require:

```env
ESEWA_FORM_URL=
ESEWA_PRODUCT_CODE=
ESEWA_SECRET_KEY=
ESEWA_STATUS_CHECK_URL=
ESEWA_APP_REDIRECT_URL=
```

## Run Locally

Run the backend API:

```bash
npm run dev:server
```

Run the admin panel:

```bash
cd admin
npm run dev
```

Run the public website from the sibling project:

```bash
cd ..\kittikbeauty-website
npm run dev
```

## Database

Run Prisma commands from this project root:

```bash
npx prisma migrate dev
npm run seed
```

## Scripts

```text
npm run dev:server     Start backend API with nodemon
npm run start:server   Start backend API with node
npm run seed           Seed database data
```

Admin scripts are inside `admin/package.json`:

```text
npm run dev            Start admin dashboard
npm run dev:lan        Start admin dashboard on LAN
npm run build          Build admin dashboard
npm run lint           Lint admin dashboard
```

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the current high-level workspace structure.

The older detailed architecture document is still available at [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md).
