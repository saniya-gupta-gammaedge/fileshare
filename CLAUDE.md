# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**FileShare** is a full-stack web app for sharing project folders via secure, temporary links. It has three independent npm packages — run commands from within each package directory.

## Package Structure

| Directory | Role |
|---|---|
| `fileshare-frontend/` | React + Vite SPA |
| `fileshare-backend/` | Express API with Cloudflare R2 storage (primary) |
| `fileshare-backend-supabase/` | Alternative backend using Supabase Storage |

## Commands

### Frontend (`fileshare-frontend/`)
```bash
npm run dev      # Dev server at http://localhost:5173
npm run build    # Production build to dist/
npm run preview  # Preview production build
```

### Backend (`fileshare-backend/` or `fileshare-backend-supabase/`)
```bash
npm run dev   # Node --watch (auto-reloads on file changes)
npm start     # Production
```

No test runner is configured in any package.

## Architecture

### Frontend
- `src/App.jsx` — React Router setup; `/s/:shareId` renders `SharePage` without the navbar (full-screen viewer), all other routes use `Layout` with `Navbar`
- `src/pages/UploadPage.jsx` — orchestrates the upload flow: DropZone → FileTree preview → UploadOptions → ShareResult
- `src/pages/SharePage.jsx` — share viewer: fetches share metadata, shows `PasswordGate` if locked, then renders `FolderSidebar` + `FilePreview`
- `src/services/api.js` — all API calls; upload uses raw `XMLHttpRequest` (not axios) to track progress
- In dev, Vite proxies `/api` to `localhost:4000` — `VITE_API_URL` overrides this for production

### Backend
- `src/config/db.js` — creates Postgres pool and **auto-runs table migrations on startup** (creates `shares` and `share_files` tables if absent)
- `src/config/r2.js` — initializes the S3-compatible Cloudflare R2 client
- `src/services/shares.js` — business logic: `createShare` (generate nanoid, hash password, write to Postgres + R2), `getShare` (check expiry, verify password, return file list)
- `src/services/storage.js` — R2 operations: upload, stream file inline, stream zip archive (archiver), presigned URLs, delete
- `src/routes/shares.js` — all share endpoints with rate limiting applied per-route

### Data Flow

**Upload**: `POST /api/shares` — Multer buffers files in memory → `createShare` stores metadata in Postgres and uploads each file to R2 at key `shares/{shareId}/{relativePath}` → returns `{ shareId }`

**View**: `GET /api/shares/:shareId` — returns share metadata + file list (r2_key is never exposed); password passed via `X-Share-Password` header

**File preview**: `GET /api/shares/:shareId/files/:filePath` — streams file from R2 inline with `Cache-Control: public, max-age=3600`

**Download**: `GET /api/shares/:shareId/download` — streams a zip built on-the-fly with archiver (respects `allowDownload` flag)

### Database Schema

```sql
shares(id TEXT PK, name TEXT, password_hash TEXT, allow_download BOOL, expires_at TIMESTAMPTZ, created_at TIMESTAMPTZ, view_count INT)
share_files(id SERIAL PK, share_id TEXT FK→shares CASCADE, path TEXT, name TEXT, size BIGINT, mime_type TEXT, r2_key TEXT)
```

Index on `share_files(share_id)`.

## Environment Variables

### Frontend
- `VITE_API_URL` — backend URL (omit in dev; Vite proxy handles `/api`)

### Backend
- `DATABASE_URL` — Supabase Postgres connection string (required)
- `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME` — Cloudflare R2 credentials (required)
- `R2_PUBLIC_URL` — if set, serves files via public URL instead of presigned URLs
- `FRONTEND_URL` — CORS origin (default: `http://localhost:5173`)
- `PORT` — server port (default: `4000`)
- `MAX_UPLOAD_BYTES` — upload size limit (default: 100 MB)

## Deployment

### Frontend → Vercel
- `fileshare-frontend/vercel.json` rewrites all routes to `/index.html` for SPA routing
- Set `VITE_API_URL` to your backend URL in Vercel environment variables

### Backend → Railway
- `fileshare-backend/railway.json` (or `fileshare-backend-supabase/railway.json`) configures start command and health check
- Set all required environment variables in Railway dashboard
- Health check path: `GET /api/health`

## Key Design Decisions

- **Two backends**: `fileshare-backend` (R2 + pg directly) vs `fileshare-backend-supabase` (Supabase Storage + supabase-js). They share the same API contract; swap by changing the frontend's API URL.
- **No build step for backend**: pure Node.js ES modules (`"type": "module"` in package.json).
- **Password security**: bcryptjs cost factor 10; password hash is stored in Postgres and never returned to the frontend.
- **r2_key isolation**: the internal R2 key is never sent to the frontend; file access goes through the backend proxy endpoints.
- **Expired share cleanup**: `src/utils/cleanup.js` runs on startup and every hour — deletes expired rows from Postgres and removes their files from storage.
- **Security middleware stack**: helmet (security headers) → CORS → compression → morgan (HTTP logs) → routes. Note `crossOriginResourcePolicy: cross-origin` is required for file streaming to the frontend.
- **Graceful shutdown**: SIGTERM/SIGINT handlers close the HTTP server and drain the Postgres pool before exiting.
