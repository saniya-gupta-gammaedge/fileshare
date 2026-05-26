import { Link } from 'react-router-dom'
import styles from './NotFoundPage.module.css'

export default function NotFoundPage() {
  return (
    <div className={styles.page}>
      <span className={styles.code}>404</span>
      <h1 className={styles.title}>Page not found</h1>
      <p className={styles.desc}>
        This page doesn't exist or the share may have expired.
      </p>
      <Link to="/" className={styles.btn}>← Back home</Link>
    </div>
  )
}
