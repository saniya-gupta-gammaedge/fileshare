import { formatBytes } from '@/utils/format'
import styles from './FileTree.module.css'

export default function FileTree({ files, onRemove }) {
  const totalSize = files.reduce((sum, f) => sum + f.size, 0)

  return (
    <div className={styles.tree}>
      <div className={styles.treeHeader}>
        <span className={styles.treeTitle}>
          {files.length} file{files.length !== 1 ? 's' : ''}
        </span>
        <span className={styles.treeSize}>{formatBytes(totalSize)}</span>
      </div>

      <ul className={styles.list}>
        {files.map((file, i) => (
          <li key={`${file.name}-${i}`} className={styles.item}>
            <span className={styles.fileIcon}>{getFileIcon(file.name)}</span>
            <span className={styles.fileName} title={file.webkitRelativePath || file.name}>
              {file.webkitRelativePath || file.name}
            </span>
            <span className={styles.fileSize}>{formatBytes(file.size)}</span>
            <button
              className={styles.removeBtn}
              onClick={() => onRemove(i)}
              aria-label={`Remove ${file.name}`}
            >
              ×
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function getFileIcon(name) {
  const ext = name.split('.').pop()?.toLowerCase()
  const map = {
    js: '⬡', jsx: '⬡', ts: '⬡', tsx: '⬡',
    py: '◈', rb: '◈', go: '◈', rs: '◈',
    html: '◎', css: '◎', scss: '◎',
    json: '⬙', yaml: '⬙', yml: '⬙', toml: '⬙',
    md: '◌', txt: '◌',
    png: '◉', jpg: '◉', jpeg: '◉', svg: '◉', gif: '◉', webp: '◉',
    pdf: '▣',
    zip: '⬡', tar: '⬡', gz: '⬡',
  }
  return map[ext] ?? '◌'
}
