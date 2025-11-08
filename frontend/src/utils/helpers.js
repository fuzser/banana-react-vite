/**
 * 检测文本中是否包含中文字符
 * @param {string} text - 要检测的文本
 * @returns {boolean} 是否包含中文
 */
export const hasChinese = (text) => {
  return /[\u4e00-\u9fa5]/.test(text)
}

/**
 * 复制文本到剪贴板
 * @param {string} text - 要复制的文本
 * @returns {Promise<boolean>} 复制是否成功
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    console.error('剪贴板 API 失败，使用降级方案:', err)
    // 降级方案：使用 textarea
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    
    try {
      document.execCommand('copy')
      document.body.removeChild(textarea)
      return true
    } catch (execErr) {
      console.error('降级复制方案也失败:', execErr)
      document.body.removeChild(textarea)
      return false
    }
  }
}

/**
 * 格式化时间为相对时间（刚刚、5分钟前、2小时前等）
 * @param {number|string|Date} timestamp - 时间戳
 * @returns {string} 格式化后的相对时间
 */
export const formatRelativeTime = (timestamp) => {
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
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} 周前`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} 个月前`
  return `${Math.floor(diffDays / 365)} 年前`
}

/**
 * 格式化完整日期时间
 * @param {number|string|Date} timestamp - 时间戳
 * @returns {string} 格式化后的日期时间字符串
 */
export const formatDateTime = (timestamp) => {
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

/**
 * 生成唯一 ID
 * @returns {string} 唯一标识符
 */
export const generateId = () => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 验证 API Key 格式
 * @param {string} apiKey - API Key
 * @returns {boolean} 是否有效
 */
export const validateApiKey = (apiKey) => {
  if (!apiKey || typeof apiKey !== 'string') return false
  
  // Google API Key 通常以 AIza 开头，长度约 39 个字符
  return apiKey.trim().startsWith('AIza') && apiKey.trim().length >= 35
}

/**
 * 验证图片文件
 * @param {File} file - 文件对象
 * @param {number} maxSize - 最大文件大小（字节），默认 20MB
 * @returns {Object} 验证结果 { valid: boolean, error: string }
 */
export const validateImageFile = (file, maxSize = 20 * 1024 * 1024) => {
  // 检查文件类型
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: '只支持 JPG、PNG 和 WebP 格式的图片'
    }
  }
  
  // 检查文件大小
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(0)
    return {
      valid: false,
      error: `图片大小不能超过 ${maxSizeMB}MB`
    }
  }
  
  return { valid: true, error: null }
}

/**
 * 将文件转换为 Base64
 * @param {File} file - 文件对象
 * @returns {Promise<string>} Base64 字符串（包含 data URL 前缀）
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = () => {
      resolve(reader.result)
    }
    
    reader.onerror = () => {
      reject(new Error('文件读取失败'))
    }
    
    reader.readAsDataURL(file)
  })
}

/**
 * 下载文件
 * @param {string} url - 文件 URL
 * @param {string} filename - 文件名
 */
export const downloadFile = (url, filename) => {
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * 批量下载文件
 * @param {Array<{url: string, filename: string}>} files - 文件列表
 * @param {number} delay - 每次下载之间的延迟（毫秒），默认 200ms
 */
export const downloadMultipleFiles = async (files, delay = 200) => {
  for (let i = 0; i < files.length; i++) {
    const { url, filename } = files[i]
    downloadFile(url, filename)
    
    // 添加延迟避免浏览器阻止多个下载
    if (i < files.length - 1) {
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
}

/**
 * 从 LocalStorage 获取数据
 * @param {string} key - 键名
 * @param {*} defaultValue - 默认值
 * @returns {*} 存储的值或默认值
 */
export const getStorageItem = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (err) {
    console.error(`读取 localStorage[${key}] 失败:`, err)
    return defaultValue
  }
}

/**
 * 保存数据到 LocalStorage
 * @param {string} key - 键名
 * @param {*} value - 要保存的值
 * @returns {boolean} 是否保存成功
 */
export const setStorageItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (err) {
    console.error(`保存到 localStorage[${key}] 失败:`, err)
    return false
  }
}

/**
 * 从 LocalStorage 删除数据
 * @param {string} key - 键名
 * @returns {boolean} 是否删除成功
 */
export const removeStorageItem = (key) => {
  try {
    localStorage.removeItem(key)
    return true
  } catch (err) {
    console.error(`删除 localStorage[${key}] 失败:`, err)
    return false
  }
}

/**
 * 截断文本
 * @param {string} text - 原始文本
 * @param {number} maxLength - 最大长度
 * @param {string} suffix - 后缀，默认 '...'
 * @returns {string} 截断后的文本
 */
export const truncateText = (text, maxLength, suffix = '...') => {
  if (!text || text.length <= maxLength) return text
  return text.substring(0, maxLength) + suffix
}

/**
 * 防抖函数
 * @param {Function} fn - 要防抖的函数
 * @param {number} delay - 延迟时间（毫秒）
 * @returns {Function} 防抖后的函数
 */
export const debounce = (fn, delay) => {
  let timeoutId = null
  
  return function (...args) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

/**
 * 节流函数
 * @param {Function} fn - 要节流的函数
 * @param {number} interval - 时间间隔（毫秒）
 * @returns {Function} 节流后的函数
 */
export const throttle = (fn, interval) => {
  let lastTime = 0
  
  return function (...args) {
    const now = Date.now()
    
    if (now - lastTime >= interval) {
      lastTime = now
      fn.apply(this, args)
    }
  }
}