/**
 * SessionStorage 工具函数
 * 用于保存临时的上传图片状态（标签页关闭自动清除）
 */

/**
 * 保存数据到 sessionStorage
 * @param {string} key - 存储键名
 * @param {*} value - 要保存的值
 * @returns {boolean} 是否保存成功
 */
export const saveToSession = (key, value) => {
  try {
    const serializedValue = JSON.stringify(value);
    sessionStorage.setItem(key, serializedValue);
    return true;
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      console.error('⚠️ SessionStorage 存储空间已满');
      console.warn('💡 提示：上传图片过多或过大，状态将不会保存');
    } else {
      console.error('保存到 sessionStorage 失败:', error);
    }
    return false;
  }
};

/**
 * 从 sessionStorage 读取数据
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
    return JSON.parse(serializedValue);
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
 * @returns {Object} { usedKB, itemCount }
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