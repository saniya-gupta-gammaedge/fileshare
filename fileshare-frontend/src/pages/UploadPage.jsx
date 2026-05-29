import { useState } from 'react'
import DropZone from '@/components/upload/DropZone'
import FileTree from '@/components/upload/FileTree'
import UploadOptions from '@/components/upload/UploadOptions'
import ShareResult from '@/components/upload/ShareResult'
import { uploadFiles } from '@/services/api'
import styles from './UploadPage.module.css'

// Upload states: idle | selecting | uploading | done | error
export default function UploadPage() {
  const [files, setFiles]       = useState([])   // flat list of File objects
  const [options, setOptions]   = useState({ password: '', expiry: '7d', allowDownload: true, allowEdits: false })
  const [status, setStatus]     = useState('idle') // idle | uploading | done | error
  const [progress, setProgress] = useState(0)
  const [shareId, setShareId]   = useState(null)
  const [error, setError]       = useState(null)

  const handleDrop = (droppedFiles) => {
    setFiles(droppedFiles)
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
  }

  const handleUpload = async () => {
    if (!files.length) return
    setStatus('uploading')
    setProgress(0)
    setError(null)

    try {
      const result = await uploadFiles(files, options, (pct) => setProgress(pct))
      setShareId(result.shareId)
      setStatus('done')
    } catch (err) {
      setError(err.message || 'Upload failed. Please try again.')
      setStatus('error')
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Upload & share</h1>
          <p className={styles.subtitle}>
            Drop a folder or pick files — you'll get a link in seconds.
          </p>
        </header>

        {status === 'done' ? (
          <ShareResult shareId={shareId} onReset={handleClear} />
        ) : (
          <div className={styles.body}>
            {/* Left column: drop zone + file tree */}
            <div className={styles.left}>
              <DropZone onDrop={handleDrop} hasFiles={files.length > 0} />
              {files.length > 0 && (
                <FileTree files={files} onRemove={handleRemoveFile} />
              )}
            </div>

            {/* Right column: options + upload button */}
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
                  disabled={!files.length}
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
