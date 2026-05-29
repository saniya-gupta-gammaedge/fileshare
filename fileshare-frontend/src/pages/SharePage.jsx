import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import FolderSidebar from '@/components/viewer/FolderSidebar'
import FilePreview from '@/components/viewer/FilePreview'
import ViewerHeader from '@/components/viewer/ViewerHeader'
import PasswordGate from '@/components/viewer/PasswordGate'
import { getShare } from '@/services/api'
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
        />
        <FilePreview file={selectedFile} shareId={shareId} password={password} />
      </div>
    </div>
  )
}
