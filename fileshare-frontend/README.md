# FileShare — Frontend

React + Vite app with CSS Modules. Dark-themed, monospace-accented UI.

## Stack

- **React 18** + **React Router v6**
- **Vite** (dev server + build)
- **CSS Modules** (scoped styles, no runtime cost)
- **react-dropzone** (drag-and-drop uploads)
- **axios / XHR** (upload with progress tracking)

## Project structure

```
src/
├── pages/
│   ├── HomePage.jsx          # Landing page with hero + features
│   ├── UploadPage.jsx        # Upload flow (drop → options → share link)
│   ├── SharePage.jsx         # Full-screen share viewer (/s/:shareId)
│   └── NotFoundPage.jsx
│
├── components/
│   ├── layout/
│   │   ├── Layout.jsx        # Navbar + <Outlet>
│   │   └── Navbar.jsx
│   │
│   ├── upload/
│   │   ├── DropZone.jsx      # Drag-and-drop area (supports folders)
│   │   ├── FileTree.jsx      # Preview of selected files before upload
│   │   ├── UploadOptions.jsx # Expiry, password, allow-download settings
│   │   └── ShareResult.jsx   # Copy-link screen after upload
│   │
│   └── viewer/
│       ├── ViewerHeader.jsx  # Top bar with share info + download zip
│       ├── FolderSidebar.jsx # Collapsible folder tree
│       ├── FilePreview.jsx   # Code / image / PDF / fallback preview
│       └── PasswordGate.jsx  # Password entry screen
│
├── services/
│   └── api.js               # All backend API calls (upload, getShare, downloadZip)
│
└── utils/
    └── format.js            # formatBytes, formatDate
```

## Getting started

```bash
cp .env.example .env
npm install
npm run dev
```

## Environment variables

| Variable        | Description                                  |
|-----------------|----------------------------------------------|
| `VITE_API_URL`  | Backend URL (blank = Vite proxies `/api`)     |

## Connecting to the backend

In `vite.config.js`, add a proxy so `/api` calls go to your local backend:

```js
server: {
  proxy: {
    '/api': 'http://localhost:4000',
  },
}
```

## Deploy

Push to GitHub, import in Vercel. Set `VITE_API_URL` to your Railway/Render backend URL.
