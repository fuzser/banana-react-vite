import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import '../App.css'

function SettingsPage() {
  // API Key 管理
  const [apiKey, setApiKey] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)
  const [apiKeyStatus, setApiKeyStatus] = useState('未验证')
  
  // 默认参数设置
  const [defaultParams, setDefaultParams] = useState({
    aspectRatio: '1:1',
    numImages: 4,
    temperature: 1.0
  })
  
  // 应用设置
  const [appSettings, setAppSettings] = useState({
    autoSaveHistory: true,
    maxHistoryCount: 50,
    theme: 'light',
    language: 'zh-CN'
  })

  // 加载设置
  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = () => {
    // 加载 API Key
    const savedApiKey = localStorage.getItem('banana_api_key') || ''
    setApiKey(savedApiKey)
    
    // 加载默认参数
    const savedParams = JSON.parse(localStorage.getItem('banana_default_params') || '{}')
    setDefaultParams(prev => ({ ...prev, ...savedParams }))
    
    // 加载应用设置
    const savedAppSettings = JSON.parse(localStorage.getItem('banana_app_settings') || '{}')
    setAppSettings(prev => ({ ...prev, ...savedAppSettings }))
  }

  // 保存 API Key
  const handleSaveApiKey = () => {
    if (!apiKey.trim()) {
      alert('⚠️ API Key 不能为空！')
      return
    }
    
    if (!apiKey.startsWith('AIza')) {
      alert('⚠️ Google API Key 通常以 "AIza" 开头，请检查是否正确！')
      return
    }
    
    localStorage.setItem('banana_api_key', apiKey)
    alert('✅ API Key 已保存！')
  }

  // 验证 API Key
  const handleVerifyApiKey = async () => {
    if (!apiKey.trim()) {
      alert('⚠️ 请先输入 API Key！')
      return
    }

    setApiKeyStatus('验证中...')
    
    try {
      const response = await fetch('http://localhost:3000/health')
      
      if (response.ok) {
        setApiKeyStatus('✅ 可用')
        alert('✅ API Key 验证成功！')
      } else {
        setApiKeyStatus('❌ 无效')
        alert('❌ API Key 验证失败，请检查是否正确！')
      }
    } catch (error) {
      setApiKeyStatus('❌ 连接失败')
      alert('❌ 无法连接到服务器，请确保后端服务已启动！')
    }
  }

  // 清除 API Key
  const handleClearApiKey = () => {
    if (!confirm('确定要清除 API Key 吗？')) return
    
    setApiKey('')
    localStorage.removeItem('banana_api_key')
    setApiKeyStatus('未验证')
    alert('✅ API Key 已清除！')
  }

  // 保存默认参数
  const handleSaveDefaultParams = () => {
    localStorage.setItem('banana_default_params', JSON.stringify(defaultParams))
    alert('✅ 默认参数已保存！')
  }

  // 重置默认参数
  const handleResetDefaultParams = () => {
    const resetParams = {
      aspectRatio: '1:1',
      numImages: 4,
      temperature: 1.0
    }
    setDefaultParams(resetParams)
    localStorage.setItem('banana_default_params', JSON.stringify(resetParams))
    alert('✅ 已重置为默认值！')
  }

  // 保存应用设置
  const handleSaveAppSettings = () => {
    localStorage.setItem('banana_app_settings', JSON.stringify(appSettings))
    alert('✅ 应用设置已保存！')
  }

  // 导出所有设置
  const handleExportSettings = () => {
    const exportData = {
      apiKey: apiKey,
      defaultParams: defaultParams,
      appSettings: appSettings,
      history: JSON.parse(localStorage.getItem('banana_history') || '[]'),
      exportDate: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `banana-settings-${Date.now()}.json`
    link.click()
    URL.revokeObjectURL(url)
    
    alert('✅ 设置已导出！')
  }

  // 导入设置
  const handleImportSettings = (event) => {
    const file = event.target.files[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importData = JSON.parse(e.target.result)
        
        if (importData.apiKey) {
          setApiKey(importData.apiKey)
          localStorage.setItem('banana_api_key', importData.apiKey)
        }
        
        if (importData.defaultParams) {
          setDefaultParams(importData.defaultParams)
          localStorage.setItem('banana_default_params', JSON.stringify(importData.defaultParams))
        }
        
        if (importData.appSettings) {
          setAppSettings(importData.appSettings)
          localStorage.setItem('banana_app_settings', JSON.stringify(importData.appSettings))
        }
        
        if (importData.history) {
          localStorage.setItem('banana_history', JSON.stringify(importData.history))
        }
        
        alert('✅ 设置导入成功！')
      } catch (error) {
        alert('❌ 导入失败：文件格式错误！')
      }
    }
    reader.readAsText(file)
  }

  // 清除所有数据
  const handleClearAllData = () => {
    if (!confirm('⚠️ 确定要清除所有数据吗？此操作不可恢复！\n\n将清除：\n- API Key\n- 生成历史\n- 所有设置')) return
    
    localStorage.clear()
    setApiKey('')
    setApiKeyStatus('未验证')
    setDefaultParams({
      aspectRatio: '1:1',
      numImages: 4,
      temperature: 1.0
    })
    setAppSettings({
      autoSaveHistory: true,
      maxHistoryCount: 50,
      theme: 'light',
      language: 'zh-CN'
    })
    
    alert('✅ 所有数据已清除！')
  }

  return (
    <div className="page-container">
      <div className="container">
        {/* 导航栏 */}
        <nav className="nav-bar">
          <Link to="/" className="nav-link">🎨 生成</Link>
          <Link to="/gallery" className="nav-link">🖼️ 画廊</Link>
          <Link to="/settings" className="nav-link active">⚙️ 设置</Link>
        </nav>

        {/* 页面标题 */}
        <div className="settings-header">
          <h1>⚙️ 设置</h1>
          <p className="subtitle">管理你的 API Key 和应用偏好设置</p>
        </div>

        {/* API Key 设置 */}
        <div className="settings-section">
          <h2 className="settings-section-title">🔑 API Key 管理</h2>
          
          <div className="settings-card">
            <label className="settings-label">
              Google API Key
              <a 
                href="https://aistudio.google.com/apikey" 
                target="_blank" 
                rel="noopener noreferrer"
                className="help-link-inline"
              >
                获取 API Key →
              </a>
            </label>
            
            <div className="api-key-input-group">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="输入你的 Google API Key (AIza...)"
                className="settings-input"
              />
              <button
                className="btn-icon"
                onClick={() => setShowApiKey(!showApiKey)}
                title={showApiKey ? '隐藏' : '显示'}
              >
                {showApiKey ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>

            <div className="api-key-status">
              状态: <span className={`status-badge ${apiKeyStatus.includes('✅') ? 'success' : ''}`}>
                {apiKeyStatus}
              </span>
            </div>

            <div className="settings-actions">
              <button className="btn-primary" onClick={handleSaveApiKey}>
                💾 保存
              </button>
              <button className="btn-secondary" onClick={handleVerifyApiKey}>
                🔍 验证
              </button>
              <button className="btn-danger" onClick={handleClearApiKey}>
                🗑️ 清除
              </button>
            </div>

            <div className="settings-hint">
              💡 API Key 将保存在浏览器本地，不会上传到服务器
            </div>
          </div>
        </div>

        {/* 默认参数设置 */}
        <div className="settings-section">
          <h2 className="settings-section-title">🎨 默认生成参数</h2>
          
          <div className="settings-card">
            <div className="settings-row">
              <label className="settings-label">默认分辨率</label>
              <select
                value={defaultParams.aspectRatio}
                onChange={(e) => setDefaultParams({...defaultParams, aspectRatio: e.target.value})}
                className="settings-select"
              >
                <option value="1:1">1:1 (正方形)</option>
                <option value="16:9">16:9 (横屏)</option>
                <option value="9:16">9:16 (竖屏)</option>
                <option value="4:3">4:3 (标准)</option>
                <option value="3:4">3:4 (竖版标准)</option>
              </select>
            </div>

            <div className="settings-row">
              <label className="settings-label">默认生成数量</label>
              <select
                value={defaultParams.numImages}
                onChange={(e) => setDefaultParams({...defaultParams, numImages: parseInt(e.target.value)})}
                className="settings-select"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                  <option key={num} value={num}>{num} 张</option>
                ))}
              </select>
            </div>

            <div className="settings-row">
              <label className="settings-label">
                默认随机度: {defaultParams.temperature}
              </label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={defaultParams.temperature}
                onChange={(e) => setDefaultParams({...defaultParams, temperature: parseFloat(e.target.value)})}
                className="settings-slider"
              />
              <div className="slider-labels">
                <span>精确 (0)</span>
                <span>创意 (2)</span>
              </div>
            </div>

            <div className="settings-actions">
              <button className="btn-primary" onClick={handleSaveDefaultParams}>
                💾 保存默认参数
              </button>
              <button className="btn-secondary" onClick={handleResetDefaultParams}>
                🔄 重置
              </button>
            </div>
          </div>
        </div>

        {/* 应用设置 */}
        <div className="settings-section">
          <h2 className="settings-section-title">🔧 应用设置</h2>
          
          <div className="settings-card">
            <div className="settings-row">
              <label className="settings-label-checkbox">
                <input
                  type="checkbox"
                  checked={appSettings.autoSaveHistory}
                  onChange={(e) => setAppSettings({...appSettings, autoSaveHistory: e.target.checked})}
                />
                <span>自动保存生成历史</span>
              </label>
            </div>

            <div className="settings-row">
              <label className="settings-label">历史记录保存上限</label>
              <select
                value={appSettings.maxHistoryCount}
                onChange={(e) => setAppSettings({...appSettings, maxHistoryCount: parseInt(e.target.value)})}
                className="settings-select"
              >
                <option value="20">20 条</option>
                <option value="50">50 条</option>
                <option value="100">100 条</option>
                <option value="200">200 条</option>
              </select>
            </div>

            <div className="settings-row">
              <label className="settings-label">主题</label>
              <select
                value={appSettings.theme}
                onChange={(e) => setAppSettings({...appSettings, theme: e.target.value})}
                className="settings-select"
              >
                <option value="light">浅色</option>
                <option value="dark">深色</option>
                <option value="auto">跟随系统</option>
              </select>
            </div>

            <div className="settings-row">
              <label className="settings-label">语言</label>
              <select
                value={appSettings.language}
                onChange={(e) => setAppSettings({...appSettings, language: e.target.value})}
                className="settings-select"
              >
                <option value="zh-CN">简体中文</option>
                <option value="en-US">English</option>
              </select>
            </div>

            <div className="settings-actions">
              <button className="btn-primary" onClick={handleSaveAppSettings}>
                💾 保存应用设置
              </button>
            </div>
          </div>
        </div>

        {/* 数据管理 */}
        <div className="settings-section">
          <h2 className="settings-section-title">💾 数据管理</h2>
          
          <div className="settings-card">
            <div className="data-management-grid">
              <button className="btn-secondary" onClick={handleExportSettings}>
                📤 导出所有设置
              </button>
              
              <label className="btn-secondary" style={{cursor: 'pointer', textAlign: 'center'}}>
                📥 导入设置
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportSettings}
                  style={{display: 'none'}}
                />
              </label>

              <button className="btn-danger" onClick={handleClearAllData}>
                🗑️ 清除所有数据
              </button>
            </div>

            <div className="settings-hint">
              💡 导出的设置文件包含：API Key、默认参数、应用设置、生成历史
            </div>
          </div>
        </div>

        {/* 关于信息 */}
        <div className="settings-section">
          <h2 className="settings-section-title">ℹ️ 关于</h2>
          
          <div className="settings-card about-card">
            <h3>🍌 Nano Banana</h3>
            <p>基于 Google Gemini 2.5 Flash 的 AI 图像生成器</p>
            
            <div className="about-info">
              <div className="about-item">
                <span className="about-label">版本:</span>
                <span className="about-value">1.0.0</span>
              </div>
              <div className="about-item">
                <span className="about-label">技术栈:</span>
                <span className="about-value">React + Vite + Express</span>
              </div>
              <div className="about-item">
                <span className="about-label">API 模型:</span>
                <span className="about-value">gemini-2.5-flash-image-preview</span>
              </div>
            </div>

            <div className="about-links">
              <a href="https://ai.google.dev/gemini-api/docs/image-generation" target="_blank" rel="noopener noreferrer">
                📚 API 文档
              </a>
              <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer">
                🔑 获取 API Key
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                💻 GitHub
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage