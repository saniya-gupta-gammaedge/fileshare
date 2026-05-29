import { useState, useEffect } from 'react'
import styles from './FilePreview.module.css'
import { BASE } from '../../services/api.js'

const CODE_EXTS = new Set([
  'js','jsx','ts','tsx','py','rb','go','rs','java','c','cpp','h',
  'css','scss','html','json','yaml','yml','toml','md','sh','txt',
  'env','gitignore','xml','sql',
])
const IMAGE_EXTS = new Set(['png','jpg','jpeg','gif','webp','svg'])

export default function FilePreview({ file, shareId, password }) {
  if (!file) {
    return (
      <div className={styles.empty}>
        <span className={styles.emptyIcon}>◎</span>
        <p>Select a file to preview</p>
      </div>
    )
  }

  const ext = file.name.split('.').pop()?.toLowerCase()
  const qs = password ? `?p=${encodeURIComponent(password)}` : ''
  const previewUrl = `${BASE}/shares/${shareId}/files/${encodeURIComponent(file.path)}${qs}`

  return (
    <div className={styles.pane}>
      <div className={styles.paneHeader}>
        <span className={styles.panePath}>{file.path}</span>
        <a
          href={previewUrl}
          download={file.name}
          className={styles.downloadFileBtn}
        >
          ↓ Download
        </a>
      </div>

      <div className={styles.content}>
        {IMAGE_EXTS.has(ext) ? (
          <div className={styles.imageWrap}>
            <img src={previewUrl} alt={file.name} className={styles.image} />
          </div>
        ) : ext === 'pdf' ? (
          <iframe
            src={previewUrl}
            title={file.name}
            className={styles.iframe}
          />
        ) : CODE_EXTS.has(ext) ? (
          <CodeViewer url={previewUrl} />
        ) : (
          <div className={styles.unsupported}>
            <p className={styles.unsupportedText}>
              Preview not available for .{ext} files
            </p>
            <a href={previewUrl} download={file.name} className={styles.downloadBig}>
              ↓ Download file
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

function CodeViewer({ url }) {
  const [code, setCode] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(url)
      .then((r) => r.text())
      .then((text) => { setCode(text); setLoading(false) })
      .catch(() => { setCode('Failed to load file.'); setLoading(false) })
  }, [url])

  if (loading) return <div className={styles.loading}>Loading…</div>

  return (
    <pre className={styles.code}>
      <code>{code}</code>
    </pre>
  )
}
