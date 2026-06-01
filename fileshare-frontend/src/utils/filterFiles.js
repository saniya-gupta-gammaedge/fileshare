const IGNORED_NAMES = new Set([
  '.DS_Store', 'Thumbs.db', 'desktop.ini', '.gitkeep',
])

const IGNORED_EXTENSIONS = new Set([
  '.pyc', '.pyo', '.pyd',
  '.class',
  '.o', '.obj', '.exe', '.dll', '.so', '.dylib',
  '.log',
])

const IGNORED_PATH_SEGMENTS = new Set([
  '__pycache__', 'node_modules', '.git', '.svn', '.hg',
  '.idea', '.vscode', 'dist', 'build', '.cache',
  '.pytest_cache', '.mypy_cache', '.ruff_cache',
  'venv', '.venv', 'env', '.env',
])

export function filterFiles(files) {
  return files.filter((file) => {
    const path = file.webkitRelativePath || file.name
    const segments = path.split('/')
    const name = segments[segments.length - 1]
    const ext = name.includes('.') ? '.' + name.split('.').pop().toLowerCase() : ''

    if (IGNORED_NAMES.has(name)) return false
    if (IGNORED_EXTENSIONS.has(ext)) return false
    if (segments.some((s) => IGNORED_PATH_SEGMENTS.has(s))) return false
    return true
  })
}
