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

  // 在组件顶部添加比例 -> 像素转换函数
const aspectRatioToSize = (ratio) => {
  // 默认最大边 1024，按比例算另一边
  let width = 1024
  let height = 1024

  switch (ratio) {
    case '1:1':
      width = 1024
      height = 1024
      break
    case '16:9':
      width = 1024
      height = Math.round(1024 * 9 / 16)
      break
    case '9:16':
      width = Math.round(1024 * 9 / 16)
      height = 1024
      break
    case '4:3':
      width = 1024
      height = Math.round(1024 * 3 / 4)
      break
    case '3:4':
      width = Math.round(1024 * 3 / 4)
      height = 1024
      break
    default:
      width = 1024
      height = 1024
  }

  return { width, height }
}

  const validateInputs = () => {
    if (!apiKey || apiKey.trim() === '') {
      alert('⚠️ 请输入 Google API Key\n\n访问 https://aistudio.google.com/apikey 获取')
      return false
    }

    if (!prompt || prompt.trim().length < 5) {
      alert('⚠️ 描述文字太短，请至少输入 5 个字符')
      return false
    }

    return true
  }

  // 单次生成请求
  const generateSingle = async (index) => {
    const { width, height } = aspectRatioToSize(aspectRatio)
    try {
      const response = await fetch('http://localhost:3000/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          apiKey: apiKey.trim(),
          image_urls: uploadedBase64,
          temperature: temperature,
          aspectRatio: aspectRatio,
          width: width,
          height: height
        })
      })

      const data = await response.json()

      if (data.error) {
        console.error(`图片 #${index + 1} 生成失败:`, data.error)
        return { success: false, error: data.error, images: [], index }
      }

      if (data.data && data.data.length > 0) {
        // 返回整个数组，而不是只取第0张
        return { success: true, images: data.data, index }
      }

      return { success: false, error: '未返回图片数据', images: [], index }

    } catch (error) {
      console.error(`图片 #${index + 1} 请求异常:`, error)
      return { success: false, error: error.message, images: [], index }
    }
  }

  // 点击生成
  const handleGenerate = async () => {
    if (!validateInputs()) return
    setErrorMessage(null)
    onGenerateStart()

    const startTime = Date.now()
    const completedCount = { value: 0 }
    const successCount = { value: 0 }

    try {
      const promises = Array.from({ length: numImages }, (_, i) =>
        generateSingle(i).then(result => {
          completedCount.value++
          if (result.success) successCount.value++
          onProgressUpdate({
            completed: completedCount.value,
            success: successCount.value,
            total: numImages
          })
          return result
        })
      )

      const allResults = await Promise.all(promises)

      const duration = ((Date.now() - startTime) / 1000).toFixed(1)
      console.log(`✅ 生成完成: ${successCount.value}/${numImages} 成功, 耗时 ${duration}秒`)

      // 展开所有图片
      const allImages = allResults
        .filter(r => r.success)
        .flatMap(r => r.images)
        .map(img => {
          const base64 = img.base64
            ? img.base64.startsWith('data:image')
              ? img.base64
              : `data:image/png;base64,${img.base64}`
            : ''
          const url = img.url && img.url.startsWith('http') ? img.url : ''
          return { base64, url }
        })
        .filter(img => img.base64 || img.url)

      if (allImages.length === 0) {
        const firstError = allResults.find(r => !r.success)?.error || '未知错误'
        setErrorMessage(`所有图片生成均失败: ${firstError}`)
      }

      onGenerateComplete(allImages)

    } catch (error) {
      console.error('批量生成异常:', error)
      setErrorMessage(error.message)
      onGenerateComplete([])
    }
  }

  const isDisabled = isGenerating || !prompt.trim() || prompt.trim().length < 5

  return (
    <div className="generate-button-section">
      <button type="button" onClick={handleGenerate} disabled={isDisabled} className={`btn btn-generate ${isGenerating ? 'generating' : ''}`}>
        {isGenerating ? (
          <>
            <span className="btn-spinner"></span>
            <span>正在生成 {numImages} 张图片...</span>
          </>
        ) : (
          <span>🎨 生成图片</span>
        )}
      </button>

      {errorMessage && <div className="generate-error">❌ {errorMessage}</div>}
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
