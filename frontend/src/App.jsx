import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import HomePage from './pages/HomePage.jsx'
import GalleryPage from './pages/GalleryPage.jsx'
import SettingsPage from './pages/SettingsPage.jsx'

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Routes>
          {/* 主页 - 图片生成 */}
          <Route path="/" element={<HomePage />} />
          
          {/* 画廊 - 历史记录 */}
          <Route path="/gallery" element={<GalleryPage />} />
          
          {/* 设置页 */}
          <Route path="/settings" element={<SettingsPage />} />
          
          {/* 404 重定向到首页 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App