import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import '../App.css'

function GalleryPage() {
  const [history, setHistory] = useState([])
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [filter, setFilter] = useState('all') // all, today, week, month

  // 加载历史记录
  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = () => {
    const savedHistory = JSON.parse(localStorage.getItem('banana_history') || '[]')
    setHistory(savedHistory)
  }

  // 删除单条记录
  const handleDeleteRecord = (id) => {
    if (!confirm('确定要删除这条记录吗？')) return
    
    const updatedHistory = history.filter(record => record.id !== id)
    setHistory(updatedHistory)
    localStorage.setItem('banana_history', JSON.stringify(updatedHistory))
    
    // 如果删除的是当前选中的记录，清空选中状态
    if (selectedRecord?.id === id) {
      setSelectedRecord(null)
    }
  }

  // 清空所有历史记录
  const handleClearAll = () => {
    if (!confirm('确定要清空所有历史记录吗？此操作不可恢复！')) return
    
    setHistory([])
    setSelectedRecord(null)
    localStorage.removeItem('banana_history')
  }

  // 导出单条记录的图片
  const handleExportImages = (record) => {
    record.images.forEach((img, index) => {
      const link = document.createElement('a')
      link.href = img.url
      link.download = `banana_${record.id}_${index + 1}.png`
      link.click()
    })
  }

  // 复制提示词
  const handleCopyPrompt = (prompt) => {
    navigator.clipboard.writeText(prompt).then(() => {
      alert('✅ 提示词已复制到剪贴板！')
    }).catch(err => {
      console.error('复制失败:', err)
    })
  }

  // 时间过滤
  const getFilteredHistory = () => {
    if (filter === 'all') return history

    const now = new Date()
    const filtered = history.filter(record => {
      const recordDate = new Date(record.timestamp)
      const diffTime = now - recordDate
      const diffDays = diffTime / (1000 * 60 * 60 * 24)

      switch (filter) {
        case 'today':
          return diffDays < 1
        case 'week':
          return diffDays < 7
        case 'month':
          return diffDays < 30
        default:
          return true
      }
    })

    return filtered
  }

  // 格式化时间
  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffTime = now - date
    const diffMinutes = Math.floor(diffTime / (1000 * 60))
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffMinutes < 1) return '刚刚'
    if (diffMinutes < 60) return `${diffMinutes} 分钟前`
    if (diffHours < 24) return `${diffHours} 小时前`
    if (diffDays < 7) return `${diffDays} 天前`
    
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filteredHistory = getFilteredHistory()

  return (
    <div className="page-container">
      <div className="container">
        {/* 导航栏 */}
        <nav className="nav-bar">
          <Link to="/" className="nav-link">🎨 生成</Link>
          <Link to="/gallery" className="nav-link active">🖼️ 画廊</Link>
          <Link to="/settings" className="nav-link">⚙️ 设置</Link>
        </nav>

        {/* 页面标题 */}
        <div className="gallery-header">
          <h1>🖼️ 生成历史</h1>
          <p className="subtitle">共 {history.length} 条记录</p>
        </div>

        {/* 过滤和操作栏 */}
        <div className="gallery-toolbar">
          <div className="filter-buttons">
            <button 
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              全部 ({history.length})
            </button>
            <button 
              className={`filter-btn ${filter === 'today' ? 'active' : ''}`}
              onClick={() => setFilter('today')}
            >
              今天
            </button>
            <button 
              className={`filter-btn ${filter === 'week' ? 'active' : ''}`}
              onClick={() => setFilter('week')}
            >
              本周
            </button>
            <button 
              className={`filter-btn ${filter === 'month' ? 'active' : ''}`}
              onClick={() => setFilter('month')}
            >
              本月
            </button>
          </div>

          {history.length > 0 && (
            <button 
              className="btn-danger-small"
              onClick={handleClearAll}
            >
              🗑️ 清空全部
            </button>
          )}
        </div>

        {/* 历史记录列表 */}
        {filteredHistory.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎨</div>
            <h3>还没有生成记录</h3>
            <p>去首页生成你的第一张 AI 图片吧！</p>
            <Link to="/" className="btn-primary">
              开始创作 →
            </Link>
          </div>
        ) : (
          <div className="gallery-grid">
            {filteredHistory.map((record) => (
              <div 
                key={record.id} 
                className="gallery-card"
                onClick={() => setSelectedRecord(record)}
              >
                {/* 卡片预览图 */}
                <div className="gallery-card-preview">
                  {record.images.length > 0 && (
                    <img 
                      src={record.images[0].url} 
                      alt="Generated" 
                      className="gallery-preview-img"
                    />
                  )}
                  <div className="gallery-card-overlay">
                    <span className="image-count-badge">
                      {record.images.length} 张图片
                    </span>
                  </div>
                </div>

                {/* 卡片信息 */}
                <div className="gallery-card-info">
                  <div className="gallery-card-prompt">
                    {record.prompt.length > 60 
                      ? record.prompt.substring(0, 60) + '...' 
                      : record.prompt}
                  </div>
                  
                  <div className="gallery-card-meta">
                    <span className="meta-time">{formatTime(record.timestamp)}</span>
                    <span className="meta-params">
                      {record.params.aspectRatio} · T:{record.params.temperature}
                    </span>
                  </div>

                  {/* 快速操作按钮 */}
                  <div className="gallery-card-actions">
                    <button
                      className="card-action-btn"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleCopyPrompt(record.prompt)
                      }}
                      title="复制提示词"
                    >
                      📋
                    </button>
                    <button
                      className="card-action-btn"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleExportImages(record)
                      }}
                      title="导出图片"
                    >
                      💾
                    </button>
                    <button
                      className="card-action-btn danger"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteRecord(record.id)
                      }}
                      title="删除记录"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 详情模态框 */}
        {selectedRecord && (
          <div 
            className="modal-overlay"
            onClick={() => setSelectedRecord(null)}
          >
            <div 
              className="modal-content gallery-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                className="modal-close"
                onClick={() => setSelectedRecord(null)}
              >
                ✕
              </button>

              <h2>生成详情</h2>
              
              {/* 提示词 */}
              <div className="modal-section">
                <h3>📝 提示词</h3>
                <div className="prompt-display">
                  {selectedRecord.prompt}
                </div>
                <button
                  className="btn-secondary-small"
                  onClick={() => handleCopyPrompt(selectedRecord.prompt)}
                >
                  📋 复制提示词
                </button>
              </div>

              {/* 参数信息 */}
              <div className="modal-section">
                <h3>⚙️ 生成参数</h3>
                <div className="params-display">
                  <div className="param-item-display">
                    <span className="param-label">分辨率:</span>
                    <span className="param-value">{selectedRecord.params.aspectRatio}</span>
                  </div>
                  <div className="param-item-display">
                    <span className="param-label">生成数量:</span>
                    <span className="param-value">{selectedRecord.params.numImages} 张</span>
                  </div>
                  <div className="param-item-display">
                    <span className="param-label">随机度:</span>
                    <span className="param-value">{selectedRecord.params.temperature}</span>
                  </div>
                  <div className="param-item-display">
                    <span className="param-label">参考图:</span>
                    <span className="param-value">{selectedRecord.params.referenceCount} 张</span>
                  </div>
                  <div className="param-item-display">
                    <span className="param-label">生成时间:</span>
                    <span className="param-value">{formatTime(selectedRecord.timestamp)}</span>
                  </div>
                </div>
              </div>

              {/* 生成的图片 */}
              <div className="modal-section">
                <h3>🖼️ 生成结果 ({selectedRecord.images.length} 张)</h3>
                <div className="modal-images-grid">
                  {selectedRecord.images.map((img, index) => (
                    <div key={index} className="modal-image-item">
                      <img src={img.url} alt={`Generated ${index + 1}`} />
                      <div className="modal-image-actions">
                        <a 
                          href={img.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="btn-secondary-small"
                        >
                          🔍 查看
                        </a>
                        <button
                          className="btn-secondary-small"
                          onClick={() => {
                            navigator.clipboard.writeText(img.base64).then(() => {
                              alert('✅ Base64 已复制！')
                            })
                          }}
                        >
                          📋 Base64
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 底部操作 */}
              <div className="modal-actions">
                <button
                  className="btn-primary"
                  onClick={() => handleExportImages(selectedRecord)}
                >
                  💾 导出所有图片
                </button>
                <button
                  className="btn-danger"
                  onClick={() => {
                    handleDeleteRecord(selectedRecord.id)
                    setSelectedRecord(null)
                  }}
                >
                  🗑️ 删除记录
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default GalleryPage