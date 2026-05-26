import styles from './UploadOptions.module.css'

const EXPIRY_OPTIONS = [
  { value: '1h',    label: '1 hour' },
  { value: '24h',   label: '24 hours' },
  { value: '7d',    label: '7 days' },
  { value: '30d',   label: '30 days' },
  { value: 'never', label: 'Never' },
]

export default function UploadOptions({ options, onChange }) {
  const set = (key, val) => onChange((prev) => ({ ...prev, [key]: val }))

  return (
    <div className={styles.card}>
      <h3 className={styles.heading}>Share settings</h3>

      {/* Expiry */}
      <div className={styles.field}>
        <label className={styles.label} htmlFor="expiry">
          Expires after
        </label>
        <select
          id="expiry"
          className={styles.select}
          value={options.expiry}
          onChange={(e) => set('expiry', e.target.value)}
        >
          {EXPIRY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Password */}
      <div className={styles.field}>
        <label className={styles.label} htmlFor="password">
          Password <span className={styles.optional}>(optional)</span>
        </label>
        <input
          id="password"
          type="password"
          className={styles.input}
          placeholder="Leave blank for public link"
          value={options.password}
          onChange={(e) => set('password', e.target.value)}
        />
      </div>

      {/* Allow download toggle */}
      <div className={styles.toggleRow}>
        <div>
          <p className={styles.toggleLabel}>Allow download</p>
          <p className={styles.toggleDesc}>Recipients can download files as zip</p>
        </div>
        <button
          role="switch"
          aria-checked={options.allowDownload}
          className={`${styles.toggle} ${options.allowDownload ? styles.toggleOn : ''}`}
          onClick={() => set('allowDownload', !options.allowDownload)}
        >
          <span className={styles.toggleThumb} />
        </button>
      </div>
    </div>
  )
}
