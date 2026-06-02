import { useState, useEffect } from 'react'
import DropZone from '@/components/upload/DropZone'
import FileTree from '@/components/upload/FileTree'
import UploadOptions from '@/components/upload/UploadOptions'
import ShareResult from '@/components/upload/ShareResult'
import { uploadFiles } from '@/services/api'
import { filterFiles } from '@/utils/filterFiles'
import styles from './UploadPage.module.css'

const MAX_BYTES = 100 * 1024 * 1024 // 100 MB
const SAVED_OPTIONS_KEY = 'fileshare_options'
const SAVED_SHARE_KEY   = 'fileshare_last_share'

function loadSavedOptions() {
  try { return JSON.parse(localStorage.getItem(SAVED_OPTIONS_KEY)) ?? null } catch { return null }
}
function loadSavedShare() {
  try { return JSON.parse(localStorage.getItem(SAVED_SHARE_KEY)) ?? null } catch { return null }
}

export default function UploadPage() {
  const saved = loadSavedShare()
  const [files, setFiles]       = useState([])
  const [options, setOptions]   = useState(
    loadSavedOptions() ?? { password: '', expiry: '7d', allowDownload: true, allowEdits: false }
  )
  const [status, setStatus]     = useState(saved ? 'done' : 'idle')
  const [progress, setProgress] = useState(0)
  const [shareId, setShareId]   = useState(saved?.shareId ?? null)
  const [error, setError]       = useState(null)

  // Persist options whenever they change
  useEffect(() => {
    localStorage.setItem(SAVED_OPTIONS_KEY, JSON.stringify({ ...options, password: '' }))
  }, [options])

  // Warn before accidental refresh/navigation when files are selected
  useEffect(() => {
    const handler = (e) => {
      if (files.length > 0 && status !== 'done') {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [files.length, status])

  const totalBytes = files.reduce((s, f) => s + f.size, 0)
  const overLimit  = totalBytes > MAX_BYTES

  const handleDrop = (droppedFiles) => {
    setFiles((prev) => filterFiles([...prev, ...droppedFiles]))
    setStatus('idle')
    setShareId(null)
    setError(null)
  }

  const handleRemoveFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleClear = () => {
    setFiles([])
    setStatus('idle')
    setShareId(null)
    setError(null)
    setProgress(0)
    localStorage.removeItem(SAVED_SHARE_KEY)
  }

  const handleUpload = async () => {
    if (!files.length || overLimit) return
    setStatus('uploading')
    setProgress(0)
    setError(null)

    try {
      const result = await uploadFiles(files, options, (pct) => setProgress(pct))
      setShareId(result.shareId)
      setStatus('done')
      localStorage.setItem(SAVED_SHARE_KEY, JSON.stringify({ shareId: result.shareId }))
    } catch (err) {
      setError(err.message || 'Upload failed. Please try again.')
      setStatus('error')
    }
  }

  const formatBytes = (b) => {
    if (b < 1024) return `${b} B`
    if (b < 1024 ** 2) return `${(b / 1024).toFixed(1)} KB`
    return `${(b / 1024 ** 2).toFixed(1)} MB`
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Upload & share</h1>
          <p className={styles.subtitle}>
            Drop a folder or pick files — you'll get a link in seconds.
            <span className={styles.limit}> Max 100 MB per share.</span>
          </p>
        </header>

        {status === 'done' ? (
          <ShareResult shareId={shareId} onReset={handleClear} />
        ) : (
          <div className={styles.body}>
            <div className={styles.left}>
              <DropZone onDrop={handleDrop} hasFiles={files.length > 0} />
              {files.length > 0 && (
                <>
                  <div className={`${styles.sizeBar} ${overLimit ? styles.sizeOver : ''}`}>
                    <span>{formatBytes(totalBytes)} / 100 MB</span>
                    {overLimit && <span>⚠ Too large — remove some files</span>}
                  </div>
                  <FileTree files={files} onRemove={handleRemoveFile} />
                </>
              )}
            </div>

            <div className={styles.right}>
              <UploadOptions options={options} onChange={setOptions} />

              {error && (
                <div className={styles.errorBanner}>
                  ⚠ {error}
                </div>
              )}

              {status === 'uploading' ? (
                <div className={styles.progressBlock}>
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className={styles.progressLabel}>{progress}% uploaded…</span>
                </div>
              ) : (
                <button
                  className={styles.uploadBtn}
                  onClick={handleUpload}
                  disabled={!files.length || overLimit}
                >
                  {files.length
                    ? `Upload ${files.length} file${files.length > 1 ? 's' : ''} →`
                    : 'Select files first'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
