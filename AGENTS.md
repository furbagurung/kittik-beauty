# Kittik Backend - ChatGPT / Codex Instructions

## Project Context

This project contains the operational side of **Kittik Beauty**:

- Express backend server
- Prisma database schema and data access
- Admin panel frontend
- Upload handling
- Product, order, customer, banner, reel, auth, and payment backend logic

The public storefront frontend is in the sibling folder:

```txt
D:\Coding\kittikbeauty-website
```

## Required Reading Before Changes

Before making code, documentation, styling, API, admin, backend, database, or architecture changes in this workspace, read:

- `README.md`
- `ARCHITECTURE.md`
- `docs/ARCHITECTURE.md`
- `D:\Coding\kittikbeauty-website\README.md`
- `D:\Coding\kittikbeauty-website\ARCHITECTURE.md`

This folder, `D:\Coding\kittik-backend`, contains both the Express backend server and the admin panel frontend. The sibling folder, `D:\Coding\kittikbeauty-website`, is only the public storefront frontend.

## Project Roles

### Backend Server

Path:

```txt
D:\Coding\kittik-backend
```

Purpose:

This is the Express backend server/API for Kittik Beauty.

Run command:

```bash
npm run dev:server
```

Use this folder for:

- Express API routes
- Prisma/database logic
- authentication backend
- product API
- category/brand/subcategory API
- order/payment API
- uploads handling
- server-side backend logic

Do not put customer website UI changes directly in this backend root.

### Admin Panel Frontend

Path:

```txt
D:\Coding\kittik-backend\admin
```

Purpose:

This is the admin dashboard frontend inside the backend project.

Run command:

```bash
cd D:\Coding\kittik-backend\admin
npm run dev
```

Use this folder for:

- admin dashboard UI
- product management UI
- category/brand/subcategory management UI
- order management UI
- banner management UI
- admin login/session UI
- shadcn admin components

## Workspace Boundaries

Always identify the correct workspace before editing files:

- Customer storefront changes must be done inside `D:\Coding\kittikbeauty-website`.
- Backend server changes must be done inside `D:\Coding\kittik-backend`.
- Admin frontend changes must be done inside `D:\Coding\kittik-backend\admin`.
- Do not edit backend/API files for website UI tasks.
- Do not edit website frontend files for backend/API tasks.
- Do not edit customer website files when the task is admin dashboard related.
- Do not put customer website UI changes directly in this backend root.

This backend project contains both:

1. Backend server at `D:\Coding\kittik-backend`, run with:

```bash
npm run dev:server
```

2. Admin panel frontend at `D:\Coding\kittik-backend\admin`, run with:

```bash
cd D:\Coding\kittik-backend\admin
npm run dev
```

For Next.js admin code changes in `admin/`, read the relevant guide in `admin/node_modules/next/dist/docs/` before writing code because this project uses a Next.js version with breaking API and convention changes.
