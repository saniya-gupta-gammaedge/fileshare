import { useState } from 'react'
import styles from './PasswordGate.module.css'

export default function PasswordGate({ shareId, onUnlock }) {
  const [password, setPassword] = useState('')
  const [error, setError]       = useState(null)
  const [loading, setLoading]   = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!password) return
    setLoading(true)
    setError(null)
    try {
      await onUnlock(password)
    } catch (err) {
      setError(err.message || 'Wrong password')
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.icon}>◉</div>
        <h1 className={styles.title}>Password protected</h1>
        <p className={styles.desc}>Enter the password to access this share.</p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <input
            className={styles.input}
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
          {error && <p className={styles.error}>{error}</p>}
          <button className={styles.btn} type="submit" disabled={loading || !password}>
            {loading ? 'Checking…' : 'Unlock →'}
          </button>
        </form>
      </div>
    </div>
  )
}
