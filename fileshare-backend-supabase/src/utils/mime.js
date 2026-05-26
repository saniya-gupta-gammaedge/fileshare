const MIME_MAP = {
  // Web
  html: 'text/html',
  htm:  'text/html',
  css:  'text/css',
  js:   'text/javascript',
  jsx:  'text/javascript',
  ts:   'text/plain',
  tsx:  'text/plain',
  // Data
  json: 'application/json',
  yaml: 'text/plain',
  yml:  'text/plain',
  toml: 'text/plain',
  xml:  'application/xml',
  csv:  'text/csv',
  // Text / code
  md:   'text/markdown',
  txt:  'text/plain',
  sh:   'text/plain',
  py:   'text/plain',
  rb:   'text/plain',
  go:   'text/plain',
  rs:   'text/plain',
  java: 'text/plain',
  c:    'text/plain',
  cpp:  'text/plain',
  h:    'text/plain',
  sql:  'text/plain',
  env:  'text/plain',
  gitignore: 'text/plain',
  // Images
  png:  'image/png',
  jpg:  'image/jpeg',
  jpeg: 'image/jpeg',
  gif:  'image/gif',
  webp: 'image/webp',
  svg:  'image/svg+xml',
  ico:  'image/x-icon',
  // Documents
  pdf:  'application/pdf',
  // Archives
  zip:  'application/zip',
  tar:  'application/x-tar',
  gz:   'application/gzip',
}

export function parseMime(filename) {
  const ext = filename.split('.').pop()?.toLowerCase() ?? ''
  return MIME_MAP[ext] ?? 'application/octet-stream'
}
