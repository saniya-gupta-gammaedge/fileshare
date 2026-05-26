import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import styles from './DropZone.module.css'

export default function DropZone({ onDrop, hasFiles }) {
  const handleDrop = useCallback(
    (acceptedFiles) => {
      // Preserve relative path from webkitRelativePath if available
      onDrop(acceptedFiles)
    },
    [onDrop]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    multiple: true,
  })

  return (
    <div
      {...getRootProps()}
      className={`${styles.zone} ${isDragActive ? styles.active : ''} ${hasFiles ? styles.compact : ''}`}
    >
      <input {...getInputProps()} webkitdirectory="" directory="" multiple />

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
        ) : hasFiles ? (
          <p className={styles.hint}>Drop more files or click to add</p>
        ) : (
          <>
            <p className={styles.label}>Drop a folder or files here</p>
            <p className={styles.hint}>or click to browse</p>
          </>
        )}
      </div>
    </div>
  )
}
