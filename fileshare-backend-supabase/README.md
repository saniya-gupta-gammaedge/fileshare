# FileShare — Backend

Node.js + Express API. Stores files on Cloudflare R2. Metadata in Supabase Postgres.

## Stack

| What | Technology | Free tier |
|---|---|---|
| Runtime | Node.js 20 (ESM) | — |
| Framework | Express 4 | — |
| File storage | Cloudflare R2 | 10 GB, zero egress fees |
| Database | Supabase Postgres | 500 MB, 2 projects |
| Hosting | Railway or Render | 500 hrs/month |

---

## Project structure

```
src/
├── index.js                  # App entry — Express setup, boot
├── config/
│   ├── env.js                # Validated env vars
│   ├── db.js                 # Postgres pool + auto-migrate
│   └── r2.js                 # Cloudflare R2 S3 client
├── routes/
│   ├── shares.js             # POST /shares, GET /shares/:id, GET /shares/:id/download
│   └── health.js             # GET /health
├── middleware/
│   ├── upload.js             # Multer (memory storage)
│   ├── rateLimit.js          # Per-route rate limiters
│   └── errorHandler.js       # Global error handler
├── services/
│   ├── shares.js             # Business logic: createShare, getShare
│   └── storage.js            # R2: upload, stream, delete
└── utils/
    ├── mime.js               # ext → MIME type
    └── expiry.js             # "7d" → Date
```

---

## API reference

### `POST /api/shares`
Upload files and create a share.

**Content-Type:** `multipart/form-data`

| Field | Type | Description |
|---|---|---|
| `files` | File[] | Files to upload (up to 500) |
| `options` | JSON string | `{ password, expiry, allowDownload }` |

**Response:** `{ shareId: "abc1234567" }`

---

### `GET /api/shares/:shareId`
Get share metadata + file list.

**Headers:** `X-Share-Password: <password>` (only for protected shares)

**Response:**
```json
{
  "id": "abc1234567",
  "allowDownload": true,
  "expiresAt": "2025-08-01T00:00:00Z",
  "files": [
    { "path": "src/index.js", "name": "index.js", "size": 1024, "mimeType": "text/javascript" }
  ]
}
```
Returns `{ "locked": true }` if password-protected and no password was given.

---

### `GET /api/shares/:shareId/files/:filePath`
Stream a single file to the browser (inline preview).

**Example:** `GET /api/shares/abc1234567/files/src%2Findex.js`

---

### `GET /api/shares/:shareId/download`
Stream a zip of all files in the share.

---

### `GET /api/health`
Health check. Returns `{ status: "ok", db: "connected" }`.

---

## Setup

### 1. Supabase Postgres

1. Go to [supabase.com](https://supabase.com) → New project
2. Settings → Database → copy the **Connection string** (URI format)
3. Paste it as `DATABASE_URL` in `.env`

Tables are created automatically on first boot via `migrate()`.

### 2. Cloudflare R2

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com) → R2 → Create bucket → name it `fileshare`
2. R2 → Manage R2 API Tokens → Create Token (Object Read & Write)
3. Copy **Account ID**, **Access Key ID**, **Secret Access Key**
4. (Optional) Make bucket public and copy the public URL → `R2_PUBLIC_URL`

### 3. Local dev

```bash
cp .env.example .env
# Fill in DATABASE_URL, R2_* values
npm install
npm run dev
```

Server starts on `http://localhost:4000`.

Add this proxy to your **frontend** `vite.config.js` so `/api` calls go to the backend:

```js
server: {
  proxy: {
    '/api': 'http://localhost:4000',
  },
}
```

### 4. Deploy to Railway

1. Push this folder to GitHub
2. [railway.app](https://railway.app) → New Project → Deploy from GitHub repo
3. Add all env vars from `.env.example` in the Railway dashboard
4. Railway auto-detects Node.js and runs `npm start`
5. Copy the Railway public URL → set it as `VITE_API_URL` in your frontend on Vercel

---

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | Server port (default 4000) |
| `NODE_ENV` | No | `development` or `production` |
| `DATABASE_URL` | **Yes** | Supabase Postgres connection string |
| `R2_ACCOUNT_ID` | **Yes** | Cloudflare account ID |
| `R2_ACCESS_KEY_ID` | **Yes** | R2 API access key |
| `R2_SECRET_ACCESS_KEY` | **Yes** | R2 API secret |
| `R2_BUCKET_NAME` | **Yes** | R2 bucket name |
| `R2_PUBLIC_URL` | No | Public bucket URL (skips presigned URLs) |
| `FRONTEND_URL` | No | Frontend origin for CORS (default localhost:5173) |
| `MAX_UPLOAD_BYTES` | No | Max file size in bytes (default 100 MB) |
