import { useCallback, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import styles from './DropZone.module.css'

export default function DropZone({ onDrop, hasFiles }) {
  const fileInputRef = useRef(null)

  const handleDrop = useCallback(
    (acceptedFiles) => {
      onDrop(acceptedFiles)
    },
    [onDrop]
  )

  const handleFolderChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length) onDrop(files)
    e.target.value = ''
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length) onDrop(files)
    e.target.value = ''
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    multiple: true,
    noClick: true,
  })

  return (
    <div
      {...getRootProps()}
      className={`${styles.zone} ${isDragActive ? styles.active : ''} ${hasFiles ? styles.compact : ''}`}
    >
      <input {...getInputProps()} />

      <div className={styles.inner}>
        <div className={styles.iconWrap}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 15v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>

        {isDragActive ? (
          <p className={styles.hint}>Drop it!</p>
        ) : (
          <>
            <p className={styles.label}>{hasFiles ? 'Add more files' : 'Drop files or a folder here'}</p>
            <div className={styles.browseButtons}>
              <label className={styles.browseBtn}>
                Browse Files
                <input type="file" multiple hidden onChange={handleFileChange} ref={fileInputRef} />
              </label>
              <label className={styles.browseBtn}>
                Browse Folder
                <input type="file" webkitdirectory="" directory="" multiple hidden onChange={handleFolderChange} />
              </label>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
