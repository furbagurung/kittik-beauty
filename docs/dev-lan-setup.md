# Kittik Admin LAN Development Setup

Internal checklist for opening the Kittik admin panel from another laptop,
phone, or same-network device during local development.

## Network Overview

Current LAN endpoints:

```text
Admin frontend: http://192.168.1.66:3000
Backend API:    http://192.168.1.66:5000
```

Current architecture:

```text
[LAN browser/device]
        |
        v
http://192.168.1.66:3000  Next.js admin
        |
        v
http://192.168.1.66:5000  Express backend
        |
        v
Database
```

If the machine IP changes, update the admin `.env`, backend CORS, and
`admin/next.config.ts`, then restart both dev servers.

## 1. Backend Setup

Start the backend from the repo root:

```bash
npm run dev:server
```

The backend must listen on all interfaces:

```text
http://0.0.0.0:5000
```

This is required for other LAN devices to reach the API. Listening only on
`localhost` limits access to the host laptop.

Basic backend check from another device:

```text
http://192.168.1.66:5000/
```

Expected response:

```json
{ "message": "Kitik Backennd is running" }
```

## 2. Admin Frontend Setup

Open the admin app:

```bash
cd admin
```

Start the LAN dev server:

```bash
npm run dev:lan
```

Current script:

```json
"dev:lan": "next dev --hostname 0.0.0.0 --port 3000 --webpack"
```

Open the admin login page from another device:

```text
http://192.168.1.66:3000/login
```

Restart the admin dev server after any `.env` or `next.config.ts` change.
Next.js reads `NEXT_PUBLIC_*` environment values at startup.

## 3. Environment

Admin API base URL:

```env
NEXT_PUBLIC_API_URL="http://192.168.1.66:5000/api"
```

Admin code should use the centralized API base URL from
`process.env.NEXT_PUBLIC_API_URL`. Do not hardcode mixed `localhost` and LAN
API URLs in individual files.

## 4. Windows Firewall

Run these once on the host laptop if another device cannot reach the frontend
or backend ports.

Allow Next admin on port 3000:

```powershell
netsh advfirewall firewall add rule name="NextAdmin3000" dir=in action=allow protocol=TCP localport=3000
```

Allow Node backend on port 5000:

```powershell
netsh advfirewall firewall add rule name="NodeBackend5000" dir=in action=allow protocol=TCP localport=5000
```

## 5. Next.js LAN Hydration Fix

File: `admin/next.config.ts`

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.66"],
};

export default nextConfig;
```

Why this is required:

- Next.js blocks access to dev resources across untrusted origins by default.
- LAN access uses the host machine IP instead of `localhost`.
- Without `allowedDevOrigins`, another device can load the HTML but fail to
  hydrate the React app.

If hydration fails, the login page may stay on:

```text
Interactive status: server rendered
waiting for hydration
```

## 6. Admin Auth Flow

Login flow:

```text
POST /api/auth/login
GET  /api/auth/admin/me
Authorization: Bearer <token>
```

Successful login stores:

```text
localStorage.admin_token
localStorage.admin_user
```

`/api/auth/admin/me` is the admin authority check. The login response token is
validated there before the admin session is persisted.

## 7. Second-Device Test Checklist

From another laptop or same-network device:

1. Open `http://192.168.1.66:3000/login`.
2. Confirm the page shows `Interactive status: hydrated`.
3. Submit admin credentials.
4. In DevTools Network, confirm:

```text
POST http://192.168.1.66:5000/api/auth/login
GET  http://192.168.1.66:5000/api/auth/admin/me
```

5. Confirm `localStorage` contains:

```text
admin_token
admin_user
```

6. Confirm the app redirects to the admin dashboard.

## 8. Known Issues And Fixes

### Page Stuck On Waiting For Hydration

Likely causes already addressed:

- server/client mismatch from a live clock rendered during SSR
- script injection from the previous theme provider
- Next.js dev-origin blocking for LAN IP access

Current fixes:

- clock starts with a stable placeholder and updates inside `useEffect`
- theme provider no longer renders a raw script tag
- `allowedDevOrigins` includes `192.168.1.66`

### Login Button Does Nothing

Cause:

- React did not hydrate, so click handlers were never attached.

Fix:

- Resolve the hydration issue first. The button should only be debugged after
  the page shows `Interactive status: hydrated`.

### `/auth/admin/me` Returns 401

Likely cause:

- missing or invalid Bearer token

Required header:

```text
Authorization: Bearer <token>
```

## 9. Dev Command Summary

Backend:

```bash
npm run dev:server
```

Admin frontend:

```bash
cd admin
npm run dev:lan
```

## 10. Production Next Step

For access outside the local network, move from LAN development to a VPS or
hosted deployment:

```text
admin.yourdomain.com -> Next.js admin
api.yourdomain.com   -> Express backend
```

Recommended production setup:

- serve both frontend and backend behind HTTPS
- route `/api/*` to the Express backend
- set `NEXT_PUBLIC_API_URL` to the production API URL
- update backend CORS for the production admin origin

Benefits:

- access from outside the local Wi-Fi network
- mobile and office testing
- production-like authentication and CORS behavior
- no dependency on the host laptop LAN IP

## Current Status

- Multi-device admin access is configured.
- Admin authentication uses the verified login and admin validation flow.
- Hydration fixes are in place for LAN development.
- LAN development should use the documented backend and admin commands.
