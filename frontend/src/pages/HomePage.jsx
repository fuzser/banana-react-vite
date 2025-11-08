import { useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import ApiKeyInput from '../components/ApiKeyInput'
import ImageUpload from '../components/ImageUpload'
import PromptInput from '../components/PromptInput'
import ParamsPanel from '../components/ParamsPanel'
import GenerateButton from '../components/GenerateButton'
import Footer from '../components/Footer'
import ResultsPanel from '../components/ResultsPanel'

function HomePage() {
  // ===== 状态管理 =====
  
  // API Key (从 localStorage 读取)
  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem('banana_api_key') || ''
  })
  
  // 上传的图片
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [uploadedBase64, setUploadedBase64] = useState([])
  
  // 提示词
  const [prompt, setPrompt] = useState('')
  
  // 生成参数
  const [aspectRatio, setAspectRatio] = useState('1:1')
  const [numImages, setNumImages] = useState(4)
  const [temperature, setTemperature] = useState(1.0)
  
  // 生成状态
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImages, setGeneratedImages] = useState([])
  const [generationProgress, setGenerationProgress] = useState({
    completed: 0,
    success: 0,
    total: 0
  })

  // ===== 处理函数 =====
  
  // 处理 API Key 变化（保存到 localStorage）
  const handleApiKeyChange = (newKey) => {
    setApiKey(newKey)
    localStorage.setItem('banana_api_key', newKey)
  }
  
  // 处理图片上传成功
  const handleUploadSuccess = (files) => {
    setUploadedFiles(prev => [...prev, ...files])
    setUploadedBase64(prev => [...prev, ...files.map(f => f.base64)])
  }
  
  // 删除单张图片
  const handleRemoveImage = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
    setUploadedBase64(prev => prev.filter((_, i) => i !== index))
  }
  
  // 清空所有上传图片
  const handleClearImages = () => {
    setUploadedFiles([])
    setUploadedBase64([])
  }
  
  // 处理生成完成
  const handleGenerateComplete = (images) => {
    setGeneratedImages(images)
    setIsGenerating(false)
    
    // 保存到历史记录 (localStorage)
    if (images.length > 0) {
      const history = JSON.parse(localStorage.getItem('banana_history') || '[]')
      const newRecord = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        prompt,
        images,
        params: {
          aspectRatio,
          numImages,
          temperature,
          referenceCount: uploadedFiles.length
        }
      }
      history.unshift(newRecord) // 添加到开头
      // 只保留最近 50 条记录
      const limitedHistory = history.slice(0, 50)
      localStorage.setItem('banana_history', JSON.stringify(limitedHistory))
    }
  }
  
  // 处理生成进度更新
  const handleProgressUpdate = (progress) => {
    setGenerationProgress(progress)
  }
  
  // 重置生成状态
  const handleResetGeneration = () => {
    setGeneratedImages([])
    setGenerationProgress({
      completed: 0,
      success: 0,
      total: 0
    })
  }

  return (
    <div className="page-container">
      <div className="container">
        {/* 导航栏 */}
        <nav className="nav-bar">
          <Link to="/" className="nav-link active">🎨 生成</Link>
          <Link to="/gallery" className="nav-link">🖼️ 画廊</Link>
          <Link to="/settings" className="nav-link">⚙️ 设置</Link>
        </nav>

        {/* 头部 */}
        <Header />
        
        {/* API Key 输入 */}
        <div className="section">
          <ApiKeyInput 
            value={apiKey}
            onChange={handleApiKeyChange}
          />
        </div>
        
        {/* 图片上传 */}
        <div className="section">
          <ImageUpload
            uploadedFiles={uploadedFiles}
            onUploadSuccess={handleUploadSuccess}
            onRemoveImage={handleRemoveImage}
            onClearImages={handleClearImages}
          />
        </div>
        
        {/* 提示词输入 */}
        <div className="section">
          <PromptInput
            value={prompt}
            onChange={setPrompt}
          />
        </div>
        
        {/* 参数面板 */}
        <div className="section">
          <ParamsPanel
            aspectRatio={aspectRatio}
            numImages={numImages}
            temperature={temperature}
            onAspectRatioChange={setAspectRatio}
            onNumImagesChange={setNumImages}
            onTemperatureChange={setTemperature}
          />
        </div>
        
        {/* 生成按钮 */}
        <div className="section">
          <GenerateButton
            apiKey={apiKey}
            prompt={prompt}
            uploadedBase64={uploadedBase64}
            aspectRatio={aspectRatio}
            numImages={numImages}
            temperature={temperature}
            isGenerating={isGenerating}
            onGenerateStart={() => {
              setIsGenerating(true)
              handleResetGeneration()
            }}
            onGenerateComplete={handleGenerateComplete}
            onProgressUpdate={handleProgressUpdate}
          />
        </div>
        
        {/* 结果展示 */}
        <div className="section">
          <ResultsPanel
            images={generatedImages}
            progress={generationProgress}
            isGenerating={isGenerating}
            aspectRatio={aspectRatio}
            temperature={temperature}
          />
        </div>
        
        {/* 底部 */}
        <Footer />
      </div>
    </div>
  )
}

export default HomePage