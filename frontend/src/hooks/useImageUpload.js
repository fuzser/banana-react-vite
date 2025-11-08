import { useState } from 'react'
import { validateImageFile } from '../../utils/helpers'
import { uploadImages } from '../../utils/api'

/**
 * 图片上传自定义 Hook
 * @returns {Object} 上传相关的状态和方法
 */
export const useImageUpload = () => {
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [uploadedBase64, setUploadedBase64] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)

  /**
   * 处理文件上传
   * @param {FileList} files - 要上传的文件列表
   */
  const handleUpload = async (files) => {
    if (!files?.length) return

    // 检查总数量限制
    const currentCount = uploadedFiles.length
    const newCount = files.length
    const maxCount = 10

    if (currentCount + newCount > maxCount) {
      setUploadError(
        `最多只能添加 ${maxCount} 张图片（当前已有 ${currentCount} 张，只能再添加 ${maxCount - currentCount} 张）`
      )
      return
    }

    // 验证所有文件
    const fileArray = Array.from(files)
    for (const file of fileArray) {
      const validation = validateImageFile(file)
      if (!validation.valid) {
        setUploadError(validation.error)
        return
      }
    }

    setIsUploading(true)
    setUploadError(null)

    try {
      // 调用后端 API 上传
      const result = await uploadImages(fileArray)

      if (result.error) {
        throw new Error(result.error)
      }

      // 添加到已有列表（而不是替换）
      setUploadedFiles(prev => [...prev, ...result.files])
      setUploadedBase64(prev => [...prev, ...result.files.map(f => f.base64)])

    } catch (error) {
      console.error('上传图片失败:', error)
      setUploadError(error.message || '上传失败，请重试')
    } finally {
      setIsUploading(false)
    }
  }

  /**
   * 删除单张图片
   * @param {number} index - 图片索引
   */
  const removeImage = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
    setUploadedBase64(prev => prev.filter((_, i) => i !== index))
  }

  /**
   * 清空所有图片
   */
  const clearAll = () => {
    setUploadedFiles([])
    setUploadedBase64([])
    setUploadError(null)
  }

  /**
   * 处理拖拽上传
   * @param {DragEvent} e - 拖拽事件
   */
  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const files = e.dataTransfer?.files
    if (files?.length) {
      handleUpload(files)
    }
  }

  /**
   * 防止默认拖拽行为
   * @param {DragEvent} e - 拖拽事件
   */
  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  return {
    uploadedFiles,
    uploadedBase64,
    isUploading,
    uploadError,
    handleUpload,
    removeImage,
    clearAll,
    handleDrop,
    handleDragOver, // 新增：方便组件使用
    setUploadError // 用于手动清除错误
  }
}

export default useImageUpload