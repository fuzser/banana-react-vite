/**
 * API 基础 URL
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

/**
 * 上传图片到服务器
 * @param {Array<File>} files - 文件数组
 * @returns {Promise<Object>} 上传结果
 */
export const uploadImages = async (files) => {
  const formData = new FormData()
  
  files.forEach(file => {
    formData.append('images', file)
  })

  try {
    const response = await fetch(`${API_BASE_URL}/upload`, {
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

    return data
  } catch (error) {
    console.error('上传 API 调用失败:', error)
    throw error
  }
}

/**
 * 生成图片（Nano Banana API）
 * @param {Object} params - 生成参数
 * @param {string} params.prompt - 提示词
 * @param {string} params.apiKey - Google API Key
 * @param {Array<string>} params.image_urls - 参考图片 Base64 数组
 * @param {string} params.aspectRatio - 分辨率比例
 * @param {number} params.temperature - 随机度
 * @returns {Promise<Object>} 生成结果
 */
export const generateImage = async ({
  prompt,
  apiKey,
  image_urls = [],
  aspectRatio = '1:1',
  temperature = 1.0
}) => {
  try {
    const response = await fetch(`${API_BASE_URL}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt,
        apiKey,
        image_urls,
        aspectRatio,
        temperature
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`)
    }

    if (data.error) {
      throw new Error(data.error)
    }

    return data
  } catch (error) {
    console.error('生成 API 调用失败:', error)
    return { error: error.message }
  }
}

/**
 * 健康检查
 * @returns {Promise<Object>} 服务器状态
 */
export const healthCheck = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`)
    
    if (!response.ok) {
      throw new Error('服务器无响应')
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('健康检查失败:', error)
    throw error
  }
}

/**
 * 测试 API Key 是否有效
 * @param {string} apiKey - Google API Key
 * @returns {Promise<boolean>} 是否有效
 */
export const testApiKey = async (apiKey) => {
  try {
    const result = await generateImage({
      prompt: 'test',
      apiKey,
      image_urls: [],
      aspectRatio: '1:1',
      temperature: 1.0
    })

    // 如果没有错误，说明 API Key 有效
    return !result.error
  } catch (error) {
    return false
  }
}

export default {
  uploadImages,
  generateImage,
  healthCheck,
  testApiKey
}