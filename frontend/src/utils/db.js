// frontend/src/utils/db.js
import { openDB } from 'idb'

const DB_NAME = 'bananaDB'
const STORE_NAME = 'history'

// 初始化数据库
export const getDB = async () => {
  return await openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }
  })
}

/**
 * 估算对象的存储大小（字节）
 * @param {Object} obj - 要估算的对象
 * @returns {number} 大小（字节）
 */
const estimateObjectSize = (obj) => {
  try {
    const jsonString = JSON.stringify(obj)
    // 使用 Blob 准确计算字节数
    return new Blob([jsonString]).size
  } catch (error) {
    console.error('估算对象大小失败:', error)
    return 0
  }
}

/**
 * 获取 IndexedDB 存储使用情况
 * @returns {Promise<{used: number, quota: number, available: number}>}
 */
const getStorageEstimate = async () => {
  try {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate()
      return {
        used: estimate.usage || 0,           // 已使用（字节）
        quota: estimate.quota || 0,          // 总配额（字节）
        available: (estimate.quota || 0) - (estimate.usage || 0)  // 可用空间
      }
    } else {
      // 浏览器不支持 Storage API，返回默认值
      console.warn('浏览器不支持 Storage Estimate API')
      return {
        used: 0,
        quota: 50 * 1024 * 1024,  // 假设 50MB
        available: 50 * 1024 * 1024
      }
    }
  } catch (error) {
    console.error('获取存储估算失败:', error)
    return {
      used: 0,
      quota: 50 * 1024 * 1024,
      available: 50 * 1024 * 1024
    }
  }
}

/**
 * 格式化字节大小为人类可读格式
 * @param {number} bytes - 字节数
 * @returns {string} 格式化后的字符串
 */
const formatBytes = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
}

/**
 * 获取最旧的记录
 * @returns {Promise<Object|null>} 最旧的记录对象
 */
const getOldestRecord = async () => {
  try {
    const db = await getDB()
    const records = await db.getAll(STORE_NAME)
    if (records.length === 0) return null
    
    // 按 id (时间戳) 升序排序，取第一个（最旧的）
    const sorted = records.sort((a, b) => a.id - b.id)
    return sorted[0]
  } catch (error) {
    console.error('获取最旧记录失败:', error)
    return null
  }
}

/**
 * 智能保存历史记录
 * 1. 先检查新记录大小是否超过可用空间上限
 * 2. 如果太大，直接拒绝保存
 * 3. 如果合理，尝试保存；空间不足时自动删除旧记录
 * 
 * @param {Object} record - 要保存的记录对象
 * @param {number} maxRetries - 最大重试次数，默认 10 次
 * @returns {Promise<{success: boolean, deleted: number, error?: string}>}
 */
export const saveHistory = async (record, maxRetries = 10) => {
  // ===== 步骤 1: 估算新记录大小 =====
  const recordSize = estimateObjectSize(record)
  const recordSizeFormatted = formatBytes(recordSize)
  
  console.log(`📏 新记录大小: ${recordSizeFormatted} (${record.images.length} 张图片)`)

  // ===== 步骤 2: 获取存储空间信息 =====
  const storage = await getStorageEstimate()
  const usedFormatted = formatBytes(storage.used)
  const quotaFormatted = formatBytes(storage.quota)
  const availableFormatted = formatBytes(storage.available)

  console.log(`💾 存储空间: 已用 ${usedFormatted} / 总共 ${quotaFormatted} (可用 ${availableFormatted})`)

  // ===== 步骤 3: 检查单个记录是否超过配额的 80% =====
  const maxSingleRecordSize = storage.quota * 0.8  // 单个记录不能超过总配额的 80%
  
  if (recordSize > maxSingleRecordSize) {
    const maxAllowedFormatted = formatBytes(maxSingleRecordSize)
    const errorMsg = `单次生成的图片组过大 (${recordSizeFormatted})，超过最大允许存储大小 (${maxAllowedFormatted})`
    
    console.error(`❌ ${errorMsg}`)
    
    return {
      success: false,
      deleted: 0,
      error: errorMsg,
      details: {
        recordSize: recordSizeFormatted,
        maxAllowed: maxAllowedFormatted,
        suggestion: '建议：减少单次生成的图片数量，或降低图片分辨率'
      }
    }
  }

  // ===== 步骤 4: 检查是否有足够空间（包括一些缓冲） =====
  const bufferSize = 5 * 1024 * 1024  // 5MB 缓冲空间
  const requiredSpace = recordSize + bufferSize

  if (requiredSpace > storage.available) {
    console.log(`⚠️ 可用空间不足 (需要 ${formatBytes(requiredSpace)}, 可用 ${availableFormatted})`)
    console.log(`📦 将尝试删除旧记录以腾出空间...`)
  }

  // ===== 步骤 5: 尝试保存，必要时删除旧记录 =====
  let deletedCount = 0
  let attempt = 0

  while (attempt < maxRetries) {
    try {
      const db = await getDB()
      await db.put(STORE_NAME, record)
      
      // 保存成功
      console.log('✅ 保存历史记录 ID=', record.id, ', 图片数量:', record.images.length)
      
      if (deletedCount > 0) {
        console.log(`🗑️ 为腾出空间，已自动删除 ${deletedCount} 条旧记录`)
      }

      const allRecords = await db.getAll(STORE_NAME)
      console.log('📦 当前数据库总条数:', allRecords.length)

      return { success: true, deleted: deletedCount }

    } catch (error) {
      // 检查是否是存储空间不足的错误
      if (error.name === 'QuotaExceededError' || 
          error.message.includes('quota') || 
          error.message.includes('storage')) {
        
        attempt++
        console.warn(`⚠️ 存储空间不足，尝试删除最旧记录 (尝试 ${attempt}/${maxRetries})`)

        // 删除最旧的记录
        const oldestRecord = await getOldestRecord()
        
        if (!oldestRecord) {
          console.error('❌ 无法删除旧记录：数据库为空')
          return { 
            success: false, 
            deleted: deletedCount, 
            error: '存储空间不足且无旧记录可删除' 
          }
        }

        try {
          const oldRecordSize = estimateObjectSize(oldestRecord)
          await deleteHistory(oldestRecord.id)
          deletedCount++
          console.log(`🗑️ 已删除旧记录 ID=${oldestRecord.id} (${oldestRecord.images.length} 张图片, 释放 ${formatBytes(oldRecordSize)})`)
        } catch (deleteError) {
          console.error('删除旧记录失败:', deleteError)
          return { 
            success: false, 
            deleted: deletedCount, 
            error: '删除旧记录失败：' + deleteError.message 
          }
        }

        // 继续下一次尝试
        continue

      } else {
        // 其他类型的错误，直接抛出
        console.error('❌ 保存记录失败 (非空间问题):', error)
        return { 
          success: false, 
          deleted: deletedCount, 
          error: '保存失败：' + error.message 
        }
      }
    }
  }

  // 达到最大重试次数仍未成功
  const errorMsg = `已尝试删除 ${deletedCount} 条旧记录但空间仍不足`
  console.error(`❌ ${errorMsg}`)
  
  return { 
    success: false, 
    deleted: deletedCount, 
    error: errorMsg,
    details: {
      recordSize: recordSizeFormatted,
      deletedRecords: deletedCount,
      suggestion: '建议：手动前往图库清理更多历史记录，或减少单次生成的图片数量'
    }
  }
}

// 获取所有记录
export const getAllHistory = async () => {
  const db = await getDB()
  const records = await db.getAll(STORE_NAME)
  return records.sort((a, b) => b.id - a.id)
}

// 删除单条记录
export const deleteHistory = async (id) => {
  const db = await getDB()
  await db.delete(STORE_NAME, id)
}

// 清空所有记录
export const clearAllHistory = async () => {
  const db = await getDB()
  await db.clear(STORE_NAME)
}

/**
 * 获取数据库存储统计信息
 * @returns {Promise<Object>} 存储统计
 */
export const getStorageStats = async () => {
  try {
    const db = await getDB()
    const records = await db.getAll(STORE_NAME)
    
    // 计算所有记录的总大小
    let totalSize = 0
    records.forEach(record => {
      totalSize += estimateObjectSize(record)
    })

    // 获取浏览器存储配额信息
    const storage = await getStorageEstimate()

    return {
      count: records.length,
      totalSize: totalSize,
      totalSizeFormatted: formatBytes(totalSize),
      browserUsed: storage.used,
      browserUsedFormatted: formatBytes(storage.used),
      browserQuota: storage.quota,
      browserQuotaFormatted: formatBytes(storage.quota),
      browserAvailable: storage.available,
      browserAvailableFormatted: formatBytes(storage.available),
      usagePercentage: ((storage.used / storage.quota) * 100).toFixed(2)
    }
  } catch (error) {
    console.error('获取存储统计失败:', error)
    return {
      count: 0,
      totalSize: 0,
      totalSizeFormatted: '0 B',
      browserUsed: 0,
      browserUsedFormatted: '0 B',
      browserQuota: 0,
      browserQuotaFormatted: '0 B',
      browserAvailable: 0,
      browserAvailableFormatted: '0 B',
      usagePercentage: '0'
    }
  }
}