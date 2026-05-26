import { useState } from 'react'
import { Link } from 'react-router-dom'
import styles from './ShareResult.module.css'

export default function ShareResult({ shareId, onReset }) {
  const [copied, setCopied] = useState(false)
  const shareUrl = `${window.location.origin}/s/${shareId}`

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={styles.card}>
      <div className={styles.icon}>✓</div>
      <h2 className={styles.title}>Your files are live</h2>
      <p className={styles.desc}>
        Share this link with anyone — no account needed to view.
      </p>

      <div className={styles.linkRow}>
        <span className={styles.url}>{shareUrl}</span>
        <button className={styles.copyBtn} onClick={handleCopy}>
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      <div className={styles.actions}>
        <Link to={`/s/${shareId}`} className={styles.viewBtn}>
          Preview share →
        </Link>
        <button className={styles.resetBtn} onClick={onReset}>
          Upload another
        </button>
      </div>
    </div>
  )
}
