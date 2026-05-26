import { Routes, Route } from 'react-router-dom'
import Layout from '@/components/layout/Layout'
import HomePage from '@/pages/HomePage'
import UploadPage from '@/pages/UploadPage'
import SharePage from '@/pages/SharePage'
import NotFoundPage from '@/pages/NotFoundPage'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/upload" element={<UploadPage />} />
      </Route>
      {/* Share viewer is full-screen, no nav */}
      <Route path="/s/:shareId" element={<SharePage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
