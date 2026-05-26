import { useMemo, useState } from 'react'
import { formatBytes } from '@/utils/format'
import styles from './FolderSidebar.module.css'

export default function FolderSidebar({ files, selected, onSelect }) {
  const [search, setSearch] = useState('')

  const filtered = useMemo(
    () =>
      search
        ? files.filter((f) =>
            f.path.toLowerCase().includes(search.toLowerCase())
          )
        : files,
    [files, search]
  )

  // Build tree structure
  const tree = useMemo(() => buildTree(filtered), [filtered])

  return (
    <aside className={styles.sidebar}>
      <div className={styles.searchWrap}>
        <input
          className={styles.search}
          placeholder="Filter files…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className={styles.tree}>
        <TreeNode nodes={tree} selected={selected} onSelect={onSelect} depth={0} />
      </div>
    </aside>
  )
}

function TreeNode({ nodes, selected, onSelect, depth }) {
  const [collapsed, setCollapsed] = useState({})

  const toggle = (key) =>
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }))

  return (
    <>
      {nodes.map((node) => {
        if (node.type === 'dir') {
          const isOpen = !collapsed[node.path]
          return (
            <div key={node.path}>
              <button
                className={styles.dirRow}
                style={{ paddingLeft: `${12 + depth * 14}px` }}
                onClick={() => toggle(node.path)}
              >
                <span className={styles.arrow}>{isOpen ? '▾' : '▸'}</span>
                <span className={styles.dirIcon}>⬡</span>
                <span className={styles.dirName}>{node.name}</span>
              </button>
              {isOpen && (
                <TreeNode
                  nodes={node.children}
                  selected={selected}
                  onSelect={onSelect}
                  depth={depth + 1}
                />
              )}
            </div>
          )
        }

        // File node
        const isSelected = selected?.path === node.path
        return (
          <button
            key={node.path}
            className={`${styles.fileRow} ${isSelected ? styles.selected : ''}`}
            style={{ paddingLeft: `${12 + depth * 14}px` }}
            onClick={() => onSelect(node.file)}
          >
            <span className={styles.fileIcon}>{getFileIcon(node.name)}</span>
            <span className={styles.fileName}>{node.name}</span>
            <span className={styles.fileSize}>{formatBytes(node.file.size)}</span>
          </button>
        )
      })}
    </>
  )
}

// Build hierarchical tree from flat file list
function buildTree(files) {
  const root = []
  const dirs = {}

  for (const file of files) {
    const parts = file.path.split('/')
    let level = root
    let currentPath = ''

    for (let i = 0; i < parts.length - 1; i++) {
      currentPath += (currentPath ? '/' : '') + parts[i]
      if (!dirs[currentPath]) {
        const dir = { type: 'dir', name: parts[i], path: currentPath, children: [] }
        dirs[currentPath] = dir
        level.push(dir)
      }
      level = dirs[currentPath].children
    }
    level.push({ type: 'file', name: parts[parts.length - 1], path: file.path, file })
  }

  return root
}

function getFileIcon(name) {
  const ext = name.split('.').pop()?.toLowerCase()
  const map = {
    js: 'JS', jsx: 'JS', ts: 'TS', tsx: 'TS',
    py: 'PY', rb: 'RB', go: 'GO', rs: 'RS',
    html: 'HT', css: 'CS', scss: 'CS',
    json: '{}', yaml: 'YM', yml: 'YM',
    md: 'MD', txt: 'TX',
    png: 'IM', jpg: 'IM', jpeg: 'IM', svg: 'SV', gif: 'GI', webp: 'IM',
    pdf: 'PD',
  }
  return map[ext] ?? '  '
}
