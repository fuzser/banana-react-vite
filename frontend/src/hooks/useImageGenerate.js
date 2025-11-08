import { useState } from 'react'
import { generateImage } from '../../utils/api'

/**
 * 图片生成自定义 Hook
 * @returns {Object} 生成相关的状态和方法
 */
export const useImageGenerate = () => {
  const [generatedImages, setGeneratedImages] = useState([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState({
    completed: 0,
    success: 0,
    total: 0
  })
  const [generateError, setGenerateError] = useState(null)

  /**
   * 并发生成多张图片
   * @param {Object} params - 生成参数
   * @param {string} params.prompt - 提示词
   * @param {string} params.apiKey - API Key
   * @param {Array<string>} params.imageUrls - 参考图片 Base64 数组
   * @param {number} params.numImages - 生成数量
   * @param {string} params.aspectRatio - 分辨率
   * @param {number} params.temperature - 随机度
   */
  const generateImages = async ({
    prompt,
    apiKey,
    imageUrls = [],
    numImages = 1,
    aspectRatio = '1:1',
    temperature = 1.0
  }) => {
    // 重置状态
    setGeneratedImages([])
    setIsGenerating(true)
    setGenerateError(null)
    setProgress({
      completed: 0,
      success: 0,
      total: numImages
    })

    // 使用对象存储计数器，避免闭包问题
    const counters = {
      completed: 0,
      success: 0
    }

    /**
     * 生成单张图片
     * @param {number} index - 图片索引
     */
    const generateSingle = async (index) => {
      try {
        const result = await generateImage({
          prompt,
          apiKey,
          image_urls: imageUrls,
          aspectRatio,
          temperature
        })

        if (result.error) {
          console.error(`图片 #${index + 1} 生成失败:`, result.error)
          counters.completed++
          setProgress({
            completed: counters.completed,
            success: counters.success,
            total: numImages
          })
          return { success: false, error: result.error, index }
        }

        if (result.data && result.data.length > 0) {
          const img = result.data[0]
          counters.completed++
          counters.success++
          
          // 更新进度
          setProgress({
            completed: counters.completed,
            success: counters.success,
            total: numImages
          })
          
          // 实时添加生成的图片到展示区
          setGeneratedImages(prev => [...prev, img])
          
          return { success: true, data: img, index }
        }

        counters.completed++
        setProgress({
          completed: counters.completed,
          success: counters.success,
          total: numImages
        })
        return { success: false, error: 'No data returned', index }
        
      } catch (error) {
        console.error(`图片 #${index + 1} 请求异常:`, error)
        counters.completed++
        setProgress({
          completed: counters.completed,
          success: counters.success,
          total: numImages
        })
        return { success: false, error: error.message, index }
      }
    }

    try {
      // 并发发送所有请求
      const promises = []
      for (let i = 0; i < numImages; i++) {
        promises.push(generateSingle(i))
      }

      // 等待所有请求完成
      const results = await Promise.all(promises)
      
      // 提取成功的图片
      const successfulImages = results
        .filter(r => r && r.success)
        .map(r => r.data)

      // 检查是否全部失败
      if (successfulImages.length === 0) {
        setGenerateError('所有图片生成均失败，请检查 API Key 和网络连接')
      }

      return successfulImages

    } catch (error) {
      console.error('批量生成异常:', error)
      setGenerateError(error.message || '生成失败，请重试')
      return []
    } finally {
      setIsGenerating(false)
    }
  }

  /**
   * 重置生成状态
   */
  const resetGenerate = () => {
    setGeneratedImages([])
    setIsGenerating(false)
    setProgress({
      completed: 0,
      success: 0,
      total: 0
    })
    setGenerateError(null)
  }

  return {
    generatedImages,
    isGenerating,
    progress,
    generateError,
    generateImages,
    resetGenerate,
    setGenerateError
  }
}

export default useImageGenerate