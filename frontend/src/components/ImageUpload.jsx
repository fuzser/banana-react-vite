import { useState, useRef } from 'react'
import PropTypes from 'prop-types'

function ImageUpload({ uploadedFiles, onUploadSuccess, onRemoveImage, onClearImages }) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)

  // 处理文件上传
  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return

    // 检查总数量限制
    if (uploadedFiles.length + files.length > 10) {
      alert(`⚠️ 最多只能添加 10 张图片\n当前已有 ${uploadedFiles.length} 张，只能再添加 ${10 - uploadedFiles.length} 张`)
      return
    }

    // 验证文件类型和大小
    const maxSize = 20 * 1024 * 1024 // 20MB
    for (const file of files) {
      if (!file.type.match(/image\/(jpeg|jpg|png|webp)/i)) {
        alert('⚠️ 只支持 JPG、PNG 和 WebP 格式的图片')
        return
      }
      if (file.size > maxSize) {
        alert(`⚠️ 图片 "${file.name}" 超过 20MB 限制`)
        return
      }
    }

    setIsUploading(true)
    setUploadError(null)

    const formData = new FormData()
    for (const file of files) {
      formData.append('images', file)
    }

    try {
      const response = await fetch('http://localhost:3000/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      // 通知父组件上传成功
      onUploadSuccess(data.files)

      // 清空文件输入
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

    } catch (error) {
      console.error('上传图片失败:', error)
      setUploadError(error.message)
    } finally {
      setIsUploading(false)
    }
  }

  // 文件选择事件
  const handleFileChange = (e) => {
    handleFileUpload(Array.from(e.target.files))
  }

  // 拖拽事件处理
  const handleDragEnter = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    handleFileUpload(files)
  }

  // 点击上传按钮
  const handleClickUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <div className="image-upload-section">
      <label className="label-with-info">
        <span>🖼️ 上传参考图片（可选）:</span>
        <span className="info-tag">最多10张 | JPG/PNG/WebP | 最大20MB</span>
      </label>

      {/* 上传区域 */}
      <div
        className={`upload-area ${isDragging ? 'drag-over' : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />

        {isUploading ? (
          <div className="upload-loading">
            <div className="spinner"></div>
            <p>上传中...</p>
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={handleClickUpload}
              className="btn btn-upload"
              disabled={uploadedFiles.length >= 10}
            >
              📁 添加图片
            </button>
            <p className="upload-hint">
              {uploadedFiles.length >= 10 
                ? '已达到最大数量限制 (10张)' 
                : '点击按钮或拖拽图片到此区域'}
            </p>
          </>
        )}
      </div>

      {/* 错误提示 */}
      {uploadError && (
        <div className="error-message">
          ❌ 上传失败: {uploadError}
        </div>
      )}

      {/* 图片预览 */}
      {uploadedFiles.length > 0 && (
        <div className="preview-section">
          <div className="preview-header">
            <span className="preview-title">
              ✅ 已添加 {uploadedFiles.length} 张参考图片
            </span>
            <button
              type="button"
              onClick={onClearImages}
              className="btn-clear-all"
            >
              🗑️ 清空全部
            </button>
          </div>

          <div className="preview-grid">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="preview-item">
                <img
                  src={file.url}
                  alt={`Preview ${index + 1}`}
                  className="preview-image"
                />
                <button
                  type="button"
                  onClick={() => onRemoveImage(index)}
                  className="preview-remove-btn"
                  title="删除"
                >
                  ×
                </button>
                <div className="preview-index">{index + 1}</div>
              </div>
            ))}
          </div>

          <p className="preview-hint">
            💡 提示: 可以继续点击"添加图片"按钮（最多10张）
          </p>
        </div>
      )}
    </div>
  )
}

ImageUpload.propTypes = {
  uploadedFiles: PropTypes.arrayOf(
    PropTypes.shape({
      url: PropTypes.string.isRequired,
      base64: PropTypes.string.isRequired
    })
  ).isRequired,
  onUploadSuccess: PropTypes.func.isRequired,
  onRemoveImage: PropTypes.func.isRequired,
  onClearImages: PropTypes.func.isRequired
}

export default ImageUpload