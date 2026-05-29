/**
 * api.js — all calls to the FileShare backend
 *
 * Base URL is picked from env var so it works
 * in both dev (proxy) and production.
 */
export const BASE = import.meta.env.VITE_API_URL ?? '/api'

// ── Uploads ────────────────────────────────────────────

/**
 * Upload files and return { shareId }.
 * @param {File[]} files
 * @param {{ password: string, expiry: string, allowDownload: boolean }} options
 * @param {(pct: number) => void} onProgress
 */
export async function uploadFiles(files, options, onProgress) {
  const form = new FormData()

  for (const file of files) {
    // Preserve folder path if available
    const path = file.webkitRelativePath || file.name
    form.append('files', file, path)
  }

  form.append('options', JSON.stringify(options))

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', `${BASE}/shares`)

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100))
      }
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText))
      } else {
        reject(new Error(JSON.parse(xhr.responseText)?.error ?? 'Upload failed'))
      }
    }

    xhr.onerror = () => reject(new Error('Network error'))
    xhr.send(form)
  })
}

// ── Share retrieval ────────────────────────────────────

/**
 * Fetch share metadata + file list.
 * Pass password for protected shares.
 * @returns {{ name, files, allowDownload, expiresAt, locked? }}
 */
export async function getShare(shareId, password = null) {
  const headers = { 'Content-Type': 'application/json' }
  if (password) headers['X-Share-Password'] = password

  const res = await fetch(`${BASE}/shares/${shareId}`, { headers })
  const data = await res.json()

  if (!res.ok) throw new Error(data.error ?? 'Failed to load share')
  return data
}

// ── Download ───────────────────────────────────────────

/**
 * Trigger a zip download for the entire share.
 */
export async function addFilesToShare(shareId, files, password = null) {
  const form = new FormData()
  for (const file of files) {
    const path = file.webkitRelativePath || file.name
    form.append('files', file, path)
  }
  const headers = {}
  if (password) headers['X-Share-Password'] = password
  const res = await fetch(`${BASE}/shares/${shareId}/files`, { method: 'POST', headers, body: form })
  if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? 'Upload failed') }
  return res.json()
}

export async function deleteFileFromShare(shareId, fileId, password = null) {
  const qs = password ? `?p=${encodeURIComponent(password)}` : ''
  const res = await fetch(`${BASE}/shares/${shareId}/files/${fileId}${qs}`, { method: 'DELETE' })
  if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? 'Delete failed') }
  return res.json()
}

export async function downloadZip(shareId, password = null) {
  const qs = password ? `?p=${encodeURIComponent(password)}` : ''
  const url = `${BASE}/shares/${shareId}/download${qs}`
  const link = document.createElement('a')
  link.href = url
  link.download = `${shareId}.zip`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
