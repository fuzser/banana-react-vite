/**
 * SessionStorage 工具函数（自动压缩/解压版）
 * 用于保存临时的上传图片状态（标签页关闭自动清除）
 * 自动检测并压缩图片数据，读取时自动解压
 */

/**
 * 压缩 Base64 图片
 * @param {string} base64 - 原始 Base64
 * @param {number} maxWidth - 最大宽度
 * @param {number} quality - 质量 (0-1)
 * @returns {Promise<string>} 压缩后的 Base64
 */
const compressBase64Image = (base64, maxWidth = 600, quality = 0.5) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = base64;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // 按比例缩放
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      // 转换为 JPEG 并压缩
      const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
      
      const originalSizeKB = (base64.length / 1024).toFixed(1);
      const compressedSizeKB = (compressedBase64.length / 1024).toFixed(1);
      const savedPercent = ((1 - compressedBase64.length / base64.length) * 100).toFixed(1);
      
      console.log(`  📉 压缩: ${originalSizeKB}KB → ${compressedSizeKB}KB (减少 ${savedPercent}%)`);
      
      resolve(compressedBase64);
    };

    img.onerror = () => {
      console.warn('  ⚠️ 图片压缩失败，使用原图');
      resolve(base64);
    };
  });
};

/**
 * 检测并压缩数据中的图片
 * @param {*} value - 要保存的值
 * @returns {Promise<*>} 处理后的值
 */
const compressDataIfNeeded = async (value) => {
  // 如果是数组，检查是否包含图片对象
  if (Array.isArray(value)) {
    const hasImages = value.some(item => 
      item && typeof item === 'object' && item.base64 && typeof item.base64 === 'string'
    );
    
    if (hasImages) {
      console.log(`🔄 检测到 ${value.length} 个对象，开始压缩图片...`);
      
      // 压缩所有包含 base64 的对象
      const compressed = await Promise.all(
        value.map(async (item) => {
          if (item && item.base64 && item.base64.startsWith('data:image')) {
            const compressedBase64 = await compressBase64Image(item.base64, 600, 0.5);
            
            // ✅ 只保留最小必要字段，移除 File 对象、size、lastModified 等大字段
            return {
              name: item.name || 'unknown.jpg',  // 文件名（用于显示）
              type: item.type || 'image/jpeg',   // 文件类型（用于验证）
              base64: compressedBase64,          // 压缩后的 base64 数据
              _compressed: true,                 // 标记已压缩
              _originalSize: item.base64.length  // 记录原始大小（用于日志）
            };
          }
          return item;
        })
      );
      
      console.log(`✅ 压缩完成，已移除冗余字段（File对象、size等）`);
      return compressed;
    }
  }
  
  // 不是图片数组，直接返回
  return value;
};

/**
 * 保存数据到 sessionStorage（自动压缩图片）
 * @param {string} key - 存储键名
 * @param {*} value - 要保存的值
 * @returns {Promise<boolean>} 是否保存成功
 */
export const saveToSession = async (key, value) => {
  try {
    // 自动压缩图片数据
    const processedValue = await compressDataIfNeeded(value);
    
    const serializedValue = JSON.stringify(processedValue);
    const sizeKB = (serializedValue.length / 1024).toFixed(2);
    
    console.log(`💾 保存到 sessionStorage: ${key} (${sizeKB}KB)`);
    
    // 警告：接近 1MB 限制
    if (serializedValue.length > 800 * 1024) { // 800KB
      console.warn(`⚠️ 数据大小 ${sizeKB}KB 接近 sessionStorage 1MB 限制！`);
    }
    
    sessionStorage.setItem(key, serializedValue);
    return true;
    
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      console.error('⚠️ SessionStorage 存储空间已满 (限制: 1MB)');
      console.warn('💡 提示：上传图片过多或过大，状态将不会保存');
      
      // 提供当前存储使用情况
      try {
        let total = 0;
        for (let k in sessionStorage) {
          if (sessionStorage.hasOwnProperty(k)) {
            total += sessionStorage[k].length;
          }
        }
        console.log(`📊 当前 sessionStorage 使用: ${(total / 1024).toFixed(2)}KB`);
      } catch (e) {
        // 忽略
      }
    } else {
      console.error('保存到 sessionStorage 失败:', error);
    }
    return false;
  }
};

/**
 * 从 sessionStorage 读取数据（自动处理压缩标记）
 * @param {string} key - 存储键名
 * @param {*} defaultValue - 默认值
 * @returns {*} 读取的值或默认值
 */
export const getFromSession = (key, defaultValue = null) => {
  try {
    const serializedValue = sessionStorage.getItem(key);
    if (serializedValue === null) {
      return defaultValue;
    }
    
    const value = JSON.parse(serializedValue);
    
    // 检查是否有压缩标记
    if (Array.isArray(value)) {
      const hasCompressed = value.some(item => item && item._compressed);
      if (hasCompressed) {
        console.log(`📦 从 sessionStorage 读取: ${key} (包含 ${value.length} 个压缩对象)`);
      }
    }
    
    return value;
    
  } catch (error) {
    console.error(`读取 sessionStorage[${key}] 失败:`, error);
    return defaultValue;
  }
};

/**
 * 从 sessionStorage 删除数据
 * @param {string} key - 存储键名
 * @returns {boolean} 是否删除成功
 */
export const removeFromSession = (key) => {
  try {
    sessionStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`删除 sessionStorage[${key}] 失败:`, error);
    return false;
  }
};

/**
 * 清空所有 sessionStorage 数据
 */
export const clearSession = () => {
  try {
    sessionStorage.clear();
    return true;
  } catch (error) {
    console.error('清空 sessionStorage 失败:', error);
    return false;
  }
};

/**
 * 获取 sessionStorage 使用情况（估算）
 * @returns {Object} { usedKB, itemCount, usedMB }
 */
export const getSessionStorageInfo = () => {
  try {
    let totalSize = 0;
    let itemCount = 0;

    for (let key in sessionStorage) {
      if (sessionStorage.hasOwnProperty(key)) {
        totalSize += sessionStorage[key].length + key.length;
        itemCount++;
      }
    }

    return {
      usedKB: (totalSize / 1024).toFixed(2),
      itemCount,
      usedMB: (totalSize / (1024 * 1024)).toFixed(2)
    };
  } catch (error) {
    console.error('获取 sessionStorage 信息失败:', error);
    return { usedKB: 0, itemCount: 0, usedMB: 0 };
  }
};