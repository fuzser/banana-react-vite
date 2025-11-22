/**
 * 视频 API 工具函数
 * 封装与后端的视频相关 API 交互
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * 创建视频生成任务
 * @param {Object} params - 生成参数
 * @returns {Promise<Object>} 任务信息 { taskId, status }
 */
export const createVideoTask = async (params) => {
  const { apiKey, model, images, prompt, params: videoParams } = params;

  try {
    const response = await fetch(`${API_BASE_URL}/api/video/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        apiKey,
        model,
        images,
        prompt,
        params: videoParams
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('创建视频任务失败:', error);
    throw error;
  }
};

/**
 * 查询视频生成任务状态
 * @param {string} taskId - 任务ID
 * @returns {Promise<Object>} 任务状态 { status, videoUrl?, error? }
 */
export const queryVideoTaskStatus = async (taskId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/video/status/${taskId}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('查询任务状态失败:', error);
    throw error;
  }
};

/**
 * 轮询任务状态直到完成
 * @param {string} taskId - 任务ID
 * @param {Function} onProgress - 进度回调
 * @param {number} maxAttempts - 最大尝试次数
 * @param {number} interval - 轮询间隔(毫秒)
 * @returns {Promise<string>} 视频URL
 */
export const pollVideoTask = async (
  taskId, 
  onProgress = null, 
  maxAttempts = 60, 
  interval = 3000
) => {
  let attempts = 0;

  while (attempts < maxAttempts) {
    attempts++;

    if (onProgress) {
      onProgress({
        attempts,
        maxAttempts,
        progress: Math.min(20 + (attempts / maxAttempts) * 75, 95)
      });
    }

    try {
      const result = await queryVideoTaskStatus(taskId);

      if (result.status === 'completed') {
        return result.videoUrl;
      } else if (result.status === 'failed') {
        throw new Error(result.error || '视频生成失败');
      }

      // 等待后重试
      await new Promise(resolve => setTimeout(resolve, interval));

    } catch (error) {
      // 如果是网络错误,继续重试
      if (attempts >= maxAttempts) {
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, interval));
    }
  }

  throw new Error('生成超时,请稍后重试');
};

/**
 * 验证 API Key
 * @param {string} apiKey - API Key
 * @returns {Promise<boolean>} 是否有效
 */
export const verifyApiKey = async (apiKey) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/video/verify-key`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ apiKey })
    });

    if (!response.ok) {
      return false;
    }

    const result = await response.json();
    return result.valid === true;
  } catch (error) {
    console.error('验证 API Key 失败:', error);
    return false;
  }
};

/**
 * 下载视频
 * @param {string} videoUrl - 视频URL
 * @param {string} filename - 文件名
 */
export const downloadVideo = (videoUrl, filename = `video-${Date.now()}.mp4`) => {
  const a = document.createElement('a');
  a.href = videoUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

/**
 * 获取视频元数据
 * @param {string} videoUrl - 视频URL
 * @returns {Promise<Object>} 元数据 { duration, width, height }
 */
export const getVideoMetadata = (videoUrl) => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.src = videoUrl;
    
    video.onloadedmetadata = () => {
      resolve({
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight
      });
    };

    video.onerror = () => {
      reject(new Error('无法加载视频'));
    };
  });
};

/**
 * 将 Base64 图片转换为 Blob
 * @param {string} base64 - Base64 字符串
 * @returns {Blob} Blob 对象
 */
export const base64ToBlob = (base64) => {
  const arr = base64.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new Blob([u8arr], { type: mime });
};

/**
 * 压缩图片
 * @param {string} base64 - Base64 图片
 * @param {number} maxWidth - 最大宽度
 * @param {number} quality - 质量 (0-1)
 * @returns {Promise<string>} 压缩后的 Base64
 */
export const compressImage = (base64, maxWidth = 1920, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = base64;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      resolve(canvas.toDataURL('image/jpeg', quality));
    };

    img.onerror = () => {
      reject(new Error('图片加载失败'));
    };
  });
};