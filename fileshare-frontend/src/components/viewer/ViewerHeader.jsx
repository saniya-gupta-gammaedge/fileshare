import { Link } from 'react-router-dom'
import { formatBytes } from '@/utils/format'
import { downloadZip } from '@/services/api'
import styles from './ViewerHeader.module.css'

export default function ViewerHeader({ share, shareId }) {
  const totalSize = share.files?.reduce((s, f) => s + f.size, 0) ?? 0

  const handleDownload = async () => {
    await downloadZip(shareId)
  }

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <Link to="/" className={styles.logo}>
          <span className={styles.logoIcon}>⬡</span>
          fileshare
        </Link>
        <div className={styles.divider} />
        <div className={styles.meta}>
          <span className={styles.metaName}>{share.name || shareId}</span>
          <span className={styles.metaMuted}>
            {share.files?.length} files · {formatBytes(totalSize)}
            {share.expiresAt && ` · expires ${new Date(share.expiresAt).toLocaleDateString()}`}
          </span>
        </div>
      </div>

      {share.allowDownload && (
        <button className={styles.downloadBtn} onClick={handleDownload}>
          ↓ Download zip
        </button>
      )}
    </header>
  )
}
