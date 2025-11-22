/**
 * 视频页面状态持久化存储工具
 * 使用 localStorage 保存用户状态
 */

/**
 * 存储键名常量
 */
export const STORAGE_KEYS = {
  API_KEY: 'nano_banana_video_api_key',
  MODEL: 'nano_banana_video_model',
  IMAGES: 'nano_banana_video_images',
  PROMPT: 'nano_banana_video_prompt',
  PARAMS: 'nano_banana_video_params',
  HISTORY: 'nano_banana_video_history',
  CURRENT_URL: 'nano_banana_video_current_url'
};

/**
 * 默认值配置
 */
export const DEFAULT_VALUES = {
  API_KEY: '',
  MODEL: 'doubao-seedance-1-0-pro-250528',
  IMAGES: [],
  PROMPT: '',
  PARAMS: {
    resolution: '1080p',
    duration: 10,
    ratio: '16:9'
  },
  HISTORY: [],
  CURRENT_URL: ''
};

/**
 * 保存单个状态到 localStorage
 * @param {string} key - 存储键名
 * @param {*} value - 要保存的值
 * @returns {boolean} 是否保存成功
 */
export const saveVideoState = (key, value) => {
  try {
    const serializedValue = JSON.stringify(value);
    localStorage.setItem(key, serializedValue);
    return true;
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      console.error('localStorage 存储空间已满');
      alert('存储空间已满,请清理历史记录或减少图片数量');
    } else {
      console.error('保存状态失败:', error);
    }
    return false;
  }
};

/**
 * 从 localStorage 读取单个状态
 * @param {string} key - 存储键名
 * @param {*} defaultValue - 默认值
 * @returns {*} 读取的值或默认值
 */
export const getVideoState = (key, defaultValue) => {
  try {
    const serializedValue = localStorage.getItem(key);
    if (serializedValue === null) {
      return defaultValue;
    }
    return JSON.parse(serializedValue);
  } catch (error) {
    console.error('读取状态失败:', error);
    return defaultValue;
  }
};

/**
 * 批量保存所有视频页状态
 * @param {Object} states - 状态对象
 * @returns {boolean} 是否全部保存成功
 */
export const saveAllVideoStates = (states) => {
  try {
    const {
      apiKey,
      selectedModel,
      images,
      prompt,
      params,
      videoHistory,
      currentVideoUrl
    } = states;

    saveVideoState(STORAGE_KEYS.API_KEY, apiKey);
    saveVideoState(STORAGE_KEYS.MODEL, selectedModel);
    saveVideoState(STORAGE_KEYS.IMAGES, images);
    saveVideoState(STORAGE_KEYS.PROMPT, prompt);
    saveVideoState(STORAGE_KEYS.PARAMS, params);
    saveVideoState(STORAGE_KEYS.HISTORY, videoHistory);
    saveVideoState(STORAGE_KEYS.CURRENT_URL, currentVideoUrl);

    return true;
  } catch (error) {
    console.error('批量保存状态失败:', error);
    return false;
  }
};

/**
 * 批量读取所有视频页状态
 * @returns {Object} 完整的状态对象
 */
export const getAllVideoStates = () => {
  return {
    apiKey: getVideoState(STORAGE_KEYS.API_KEY, DEFAULT_VALUES.API_KEY),
    selectedModel: getVideoState(STORAGE_KEYS.MODEL, DEFAULT_VALUES.MODEL),
    images: getVideoState(STORAGE_KEYS.IMAGES, DEFAULT_VALUES.IMAGES),
    prompt: getVideoState(STORAGE_KEYS.PROMPT, DEFAULT_VALUES.PROMPT),
    params: getVideoState(STORAGE_KEYS.PARAMS, DEFAULT_VALUES.PARAMS),
    videoHistory: getVideoState(STORAGE_KEYS.HISTORY, DEFAULT_VALUES.HISTORY),
    currentVideoUrl: getVideoState(STORAGE_KEYS.CURRENT_URL, DEFAULT_VALUES.CURRENT_URL)
  };
};

/**
 * 清除所有视频页状态
 */
export const clearAllVideoStates = () => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    console.log('已清除所有视频页缓存');
    return true;
  } catch (error) {
    console.error('清除状态失败:', error);
    return false;
  }
};

/**
 * 清除敏感信息(API Key)
 */
export const clearSensitiveData = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.API_KEY);
    console.log('已清除敏感信息');
    return true;
  } catch (error) {
    console.error('清除敏感信息失败:', error);
    return false;
  }
};

/**
 * 清除历史记录
 */
export const clearVideoHistory = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
    console.log('已清除历史记录');
    return true;
  } catch (error) {
    console.error('清除历史记录失败:', error);
    return false;
  }
};

/**
 * 获取当前存储使用情况
 * @returns {Object} { used: number, total: number, percentage: number }
 */
export const getStorageInfo = () => {
  try {
    let totalSize = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        totalSize += localStorage[key].length + key.length;
      }
    }
    
    // localStorage 一般限制为 5-10MB,这里假设 5MB
    const totalLimit = 5 * 1024 * 1024; // 5MB in bytes
    const usedMB = (totalSize / 1024 / 1024).toFixed(2);
    const totalMB = (totalLimit / 1024 / 1024).toFixed(2);
    const percentage = ((totalSize / totalLimit) * 100).toFixed(1);

    return {
      used: usedMB,
      total: totalMB,
      percentage: percentage,
      bytes: totalSize
    };
  } catch (error) {
    console.error('获取存储信息失败:', error);
    return {
      used: 0,
      total: 5,
      percentage: 0,
      bytes: 0
    };
  }
};

/**
 * 添加视频到历史记录
 * @param {Object} videoItem - 视频记录对象
 * @param {number} maxHistory - 最大保存数量
 */
export const addToVideoHistory = (videoItem, maxHistory = 50) => {
  try {
    const history = getVideoState(STORAGE_KEYS.HISTORY, DEFAULT_VALUES.HISTORY);
    
    // 添加新记录到开头
    const newHistory = [videoItem, ...history];
    
    // 限制数量
    const trimmedHistory = newHistory.slice(0, maxHistory);
    
    saveVideoState(STORAGE_KEYS.HISTORY, trimmedHistory);
    return true;
  } catch (error) {
    console.error('添加历史记录失败:', error);
    return false;
  }
};

/**
 * 从历史记录中删除指定项
 * @param {string} id - 记录ID
 */
export const removeFromVideoHistory = (id) => {
  try {
    const history = getVideoState(STORAGE_KEYS.HISTORY, DEFAULT_VALUES.HISTORY);
    const newHistory = history.filter(item => item.id !== id);
    saveVideoState(STORAGE_KEYS.HISTORY, newHistory);
    return true;
  } catch (error) {
    console.error('删除历史记录失败:', error);
    return false;
  }
};

/**
 * 检查 localStorage 是否可用
 * @returns {boolean}
 */
export const isLocalStorageAvailable = () => {
  try {
    const testKey = '__test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch (error) {
    console.warn('localStorage 不可用(可能处于隐私模式):', error);
    return false;
  }
};