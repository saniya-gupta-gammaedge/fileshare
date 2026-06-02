import { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import FolderSidebar from '@/components/viewer/FolderSidebar'
import FilePreview from '@/components/viewer/FilePreview'
import ViewerHeader from '@/components/viewer/ViewerHeader'
import PasswordGate from '@/components/viewer/PasswordGate'
import { getShare, addFilesToShare, deleteFileFromShare, deleteAllFilesFromShare } from '@/services/api'
import { filterFiles } from '@/utils/filterFiles'
import styles from './SharePage.module.css'

export default function SharePage() {
  const { shareId } = useParams()
  const [share, setShare]             = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [status, setStatus]           = useState('loading') // loading | locked | ready | error
  const [error, setError]             = useState(null)
  const [password, setPassword]       = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const data = await getShare(shareId)
        if (data.locked) {
          setStatus('locked')
        } else {
          setShare(data)
          // Auto-select first file
          if (data.files?.length) setSelectedFile(data.files[0])
          setStatus('ready')
        }
      } catch (err) {
        setError(err.message || 'This share does not exist or has expired.')
        setStatus('error')
      }
    }
    load()
  }, [shareId])

  const fileInputRef = useRef(null)

  const refreshShare = async (pw = password) => {
    const data = await getShare(shareId, pw)
    setShare(data)
  }

  const handleAddFiles = async (e) => {
    const files = filterFiles(Array.from(e.target.files))
    if (!files.length) return
    e.target.value = ''
    await addFilesToShare(shareId, files, password)
    await refreshShare()
  }

  const handleDeleteFile = async (file) => {
    if (!window.confirm(`Delete "${file.name}"?`)) return
    await deleteFileFromShare(shareId, file.id, password)
    if (selectedFile?.id === file.id) setSelectedFile(null)
    await refreshShare()
  }

  const handleDeleteAll = async () => {
    if (!window.confirm('Delete all files from this share? This cannot be undone.')) return
    await deleteAllFilesFromShare(shareId, password)
    setSelectedFile(null)
    await refreshShare()
  }

  const handleUnlock = async (pw) => {
    try {
      const data = await getShare(shareId, pw)
      setShare(data)
      setPassword(pw)
      if (data.files?.length) setSelectedFile(data.files[0])
      setStatus('ready')
    } catch {
      throw new Error('Wrong password')
    }
  }

  if (status === 'loading') {
    return (
      <div className={styles.centered}>
        <div className={styles.spinner} />
        <p className={styles.loadingText}>Loading share…</p>
      </div>
    )
  }

  if (status === 'locked') {
    return <PasswordGate shareId={shareId} onUnlock={handleUnlock} />
  }

  if (status === 'error') {
    return (
      <div className={styles.centered}>
        <p className={styles.errorIcon}>⚠</p>
        <p className={styles.errorText}>{error}</p>
      </div>
    )
  }

  return (
    <div className={styles.viewer}>
      <ViewerHeader share={share} shareId={shareId} password={password} />
      <div className={styles.body}>
        <FolderSidebar
          files={share.files}
          selected={selectedFile}
          onSelect={setSelectedFile}
          allowEdits={share.allowEdits}
          onDelete={handleDeleteFile}
        />
        <div className={styles.main}>
          {share.allowEdits && (
            <div className={styles.editBar}>
              <label className={styles.addBtn}>
                + Add Files
                <input type="file" multiple hidden onChange={handleAddFiles} />
              </label>
              <label className={styles.addBtn}>
                + Add Folder
                <input type="file" webkitdirectory="" directory="" multiple hidden onChange={handleAddFiles} />
              </label>
              {share.files?.length > 0 && (
                <button className={styles.deleteAllBtn} onClick={handleDeleteAll}>
                  Delete All
                </button>
              )}
            </div>
          )}
          <FilePreview file={selectedFile} shareId={shareId} password={password} />
        </div>
      </div>
    </div>
  )
}
