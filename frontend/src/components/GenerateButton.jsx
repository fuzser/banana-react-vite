import { useState } from 'react'
import PropTypes from 'prop-types'

function GenerateButton({
  apiKey,
  prompt,
  uploadedBase64,
  aspectRatio,
  numImages,
  temperature,
  isGenerating,
  onGenerateStart,
  onGenerateComplete,
  onProgressUpdate
}) {
  const [errorMessage, setErrorMessage] = useState(null)

  // 验证输入
  const validateInputs = () => {
    if (!apiKey || apiKey.trim() === '') {
      alert('⚠️ 请输入 Google API Key\n\n访问 https://aistudio.google.com/apikey 获取')
      return false
    }

    if (!prompt || prompt.trim() === '') {
      alert('⚠️ 请输入文字描述（英文效果更佳）')
      return false
    }

    if (prompt.trim().length < 5) {
      alert('⚠️ 描述文字太短，请至少输入 5 个字符')
      return false
    }

    return true
  }

  // 单次生成请求
  const generateSingle = async (index) => {
    try {
      const response = await fetch('http://localhost:3000/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          apiKey: apiKey.trim(),
          image_urls: uploadedBase64,
          temperature: temperature,
          aspectRatio: aspectRatio
        })
      })

      const data = await response.json()

      if (data.error) {
        console.error(`图片 #${index + 1} 生成失败:`, data.error)
        return {
          success: false,
          error: data.error,
          index
        }
      }

      if (data.data && data.data.length > 0) {
        return {
          success: true,
          image: data.data[0],
          index
        }
      }

      return {
        success: false,
        error: '未返回图片数据',
        index
      }

    } catch (error) {
      console.error(`图片 #${index + 1} 请求异常:`, error)
      return {
        success: false,
        error: error.message,
        index
      }
    }
  }

  // 处理生成按钮点击
  const handleGenerate = async () => {
    // 验证输入
    if (!validateInputs()) {
      return
    }

    // 清除之前的错误
    setErrorMessage(null)

    // 通知父组件开始生成
    onGenerateStart()

    const startTime = Date.now()
    const results = []
    let completedCount = 0
    let successCount = 0

    try {
      // 创建所有生成请求的 Promise
      const promises = []
      for (let i = 0; i < numImages; i++) {
        promises.push(
          generateSingle(i).then(result => {
            completedCount++
            if (result.success) {
              successCount++
              results.push(result.image)
            }
            
            // 更新进度
            onProgressUpdate({
              completed: completedCount,
              success: successCount,
              total: numImages
            })

            return result
          })
        )
      }

      // 等待所有请求完成
      const allResults = await Promise.all(promises)

      const duration = ((Date.now() - startTime) / 1000).toFixed(1)
      console.log(`✅ 生成完成: ${successCount}/${numImages} 成功, 耗时 ${duration}秒`)

      // 检查是否有成功的结果
      if (successCount === 0) {
        const firstError = allResults.find(r => !r.success)?.error || '未知错误'
        setErrorMessage(`所有图片生成均失败: ${firstError}`)
      }

      // 通知父组件生成完成
      onGenerateComplete(results)

    } catch (error) {
      console.error('批量生成异常:', error)
      setErrorMessage(error.message)
      onGenerateComplete([])
    }
  }

  // 判断按钮是否应该禁用
  const isDisabled = isGenerating || !prompt.trim() || prompt.trim().length < 5

  return (
    <div className="generate-button-section">
      <button
        type="button"
        onClick={handleGenerate}
        disabled={isDisabled}
        className={`btn btn-generate ${isGenerating ? 'generating' : ''}`}
      >
        {isGenerating ? (
          <>
            <span className="btn-spinner"></span>
            <span>正在生成 {numImages} 张图片...</span>
          </>
        ) : (
          <>
            <span>🎨 生成图片</span>
          </>
        )}
      </button>

      {/* 错误提示 */}
      {errorMessage && (
        <div className="generate-error">
          ❌ {errorMessage}
        </div>
      )}

      {/* 生成提示 */}
      {!isGenerating && (
        <div className="generate-hints">
          <p className="generate-hint-primary">
            ⏱️ 预计生成时间: 10-15 秒
          </p>
          <div className="generate-hint-details">
            <span>📊 将生成 {numImages} 张</span>
            <span>📐 分辨率 {aspectRatio}</span>
            <span>🎨 随机度 {temperature}</span>
            {uploadedBase64.length > 0 && (
              <span>🖼️ 参考图 {uploadedBase64.length} 张</span>
            )}
          </div>
        </div>
      )}

      {/* 生成中的提示 */}
      {isGenerating && (
        <div className="generating-tips">
          <p>💡 提示: 图片生成完成后会立即显示</p>
          <p>⚡ 并发生成中，多张图片同时进行</p>
        </div>
      )}

      {/* 快捷键提示 */}
      {!isGenerating && (
        <div className="keyboard-shortcut">
          <span className="shortcut-label">快捷键:</span>
          <kbd>Ctrl</kbd> + <kbd>Enter</kbd> 快速生成
        </div>
      )}
    </div>
  )
}

GenerateButton.propTypes = {
  apiKey: PropTypes.string.isRequired,
  prompt: PropTypes.string.isRequired,
  uploadedBase64: PropTypes.arrayOf(PropTypes.string).isRequired,
  aspectRatio: PropTypes.string.isRequired,
  numImages: PropTypes.number.isRequired,
  temperature: PropTypes.number.isRequired,
  isGenerating: PropTypes.bool.isRequired,
  onGenerateStart: PropTypes.func.isRequired,
  onGenerateComplete: PropTypes.func.isRequired,
  onProgressUpdate: PropTypes.func.isRequired
}

export default GenerateButton