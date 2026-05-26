import { Link } from 'react-router-dom'
import styles from './HomePage.module.css'

const features = [
  {
    icon: '⬡',
    title: 'Full folder support',
    desc: 'Upload an entire project folder — structure is preserved exactly as-is.',
  },
  {
    icon: '◈',
    title: 'Instant share link',
    desc: 'One short link. Anyone with it can browse your files, no account needed.',
  },
  {
    icon: '◎',
    title: 'Live file preview',
    desc: 'Code, PDFs, images — preview right in the browser without downloading.',
  },
  {
    icon: '⬙',
    title: 'Download as zip',
    desc: 'Recipients can grab the whole folder or individual files in one click.',
  },
  {
    icon: '◉',
    title: 'Password protection',
    desc: 'Lock your share with a password. Only people you trust can access it.',
  },
  {
    icon: '◌',
    title: 'Auto-expiry',
    desc: 'Set links to expire after a day, a week, or never. You decide.',
  },
]

export default function HomePage() {
  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.badge}>Now in beta</div>
          <h1 className={styles.headline}>
            Share folders,<br />
            <span className={styles.accent}>not just files.</span>
          </h1>
          <p className={styles.sub}>
           Upload folders,
            get a short link, let anyone browse and download.
          </p>
          <div className={styles.actions}>
            <Link to="/upload" className={styles.btnPrimary}>
              Start sharing →
            </Link>
            <a href="#features" className={styles.btnSecondary}>
              See how it works
            </a>
          </div>
        </div>

        {/* Decorative grid */}
        <div className={styles.grid} aria-hidden="true">
          {Array.from({ length: 48 }).map((_, i) => (
            <div key={i} className={styles.gridCell} />
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className={styles.features}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Everything you need</h2>
          <div className={styles.featureGrid}>
            {features.map((f) => (
              <div key={f.title} className={styles.featureCard}>
                <span className={styles.featureIcon}>{f.icon}</span>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA strip */}
      <section className={styles.ctaStrip}>
        <div className={styles.container}>
          <p className={styles.ctaText}>Ready to share your first folder?</p>
          <Link to="/upload" className={styles.btnPrimary}>
            Upload now →
          </Link>
        </div>
      </section>
    </div>
  )
}
