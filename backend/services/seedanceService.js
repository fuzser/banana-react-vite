/**
 * Seedance 视频生成服务
 * 封装豆包 Seedance API 调用
 */

import fetch from 'node-fetch';

/**
 * Seedance API 基础配置
 */
const SEEDANCE_API_BASE = 'https://ark.cn-beijing.volces.com/api/v3';

/**
 * 生成视频
 * @param {string} apiKey - API Key
 * @param {Object} params - 生成参数
 * @returns {Promise<Object>} 任务信息
 */
export const generateVideo = async (apiKey, params) => {
  const { model, images, prompt, params: videoParams } = params;

  try {
    // 构建请求内容
    const content = buildContent(images, prompt, videoParams);

    console.log('📤 发送请求到 Seedance API');
    console.log('📍 URL:', `${SEEDANCE_API_BASE}/contents/generations/tasks`);

    // 调用 Seedance API
    const response = await fetch(`${SEEDANCE_API_BASE}/contents/generations/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        content: content
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Seedance API 错误:', errorText);
      throw new Error(`Seedance API 请求失败: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ API 响应:', result);
    return result;

  } catch (error) {
    console.error('❌ 生成视频失败:', error);
    throw error;
  }
};

/**
 * 查询任务状态
 * @param {string} apiKey - API Key
 * @param {string} taskId - 任务ID
 * @returns {Promise<Object>} 任务状态
 */
export const queryTaskStatus = async (apiKey, taskId) => {
  try {
    const response = await fetch(`${SEEDANCE_API_BASE}/contents/generations/tasks/${taskId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('查询任务状态错误:', errorText);
      throw new Error(`查询失败: ${response.status}`);
    }

    const result = await response.json();
    return result;

  } catch (error) {
    console.error('查询任务状态失败:', error);
    throw error;
  }
};

/**
 * 构建请求内容
 * 根据图片角色和提示词构建 API 请求内容
 * @param {Array} images - 图片数组 [{ base64, role, fileName }]
 * @param {string} prompt - 提示词
 * @param {Object} videoParams - 视频参数 { resolution, duration, ratio }
 * @returns {Array} content 数组
 */
const buildContent = (images, prompt, videoParams) => {
  const content = [];

  // ⭐ 根据角色提取首帧和尾帧
  const firstFrame = images?.find(img => img.role === 'first_frame');
  const lastFrame = images?.find(img => img.role === 'last_frame');
  const referenceImages = images?.filter(img => img.role === 'reference') || [];

  // ⭐ 按顺序构建内容: 文本 → 首帧 → 尾帧
  
  // 1. 添加文本提示词(包含参数)
  const fullPrompt = buildPromptWithParams(prompt, videoParams);
  content.push({
    type: 'text',
    text: fullPrompt
  });

  // 2. 添加首帧(如果有)
  if (firstFrame) {
    content.push({
      type: 'image_url',
      image_url: {
        url: firstFrame.base64
      },
      role: 'first_frame'
    });
  }

  // 3. 添加尾帧(如果有)
  if (lastFrame) {
    content.push({
      type: 'image_url',
      image_url: {
        url: lastFrame.base64
      },
      role: 'last_frame'
    });
  }

  // 4. 添加参考图(如果有)
  referenceImages.forEach(img => {
    content.push({
      type: 'image_url',
      image_url: {
        url: img.base64
      }
    });
  });

  return content;
};

/**
 * 构建包含参数的完整提示词
 * @param {string} prompt - 原始提示词
 * @param {Object} params - 参数 { resolution, duration, ratio }
 * @returns {string} 完整提示词
 */
const buildPromptWithParams = (prompt, params) => {
  const { resolution, duration, ratio } = params;
  
  // 添加参数到提示词末尾
  // 格式: --ratio 16:9 --dur 5 --rs 480p
  const paramStr = `--ratio ${ratio} --dur ${duration} --rs ${resolution}`;
  
  return `${prompt} ${paramStr}`;
};

/**
 * 验证 API Key 格式
 * @param {string} apiKey - API Key
 * @returns {boolean} 是否有效
 */
export const validateApiKey = (apiKey) => {
  if (!apiKey || typeof apiKey !== 'string') {
    return false;
  }

  // 基本长度检查
  if (apiKey.length < 20) {
    return false;
  }

  return true;
};

/**
 * 解析 Seedance API 响应
 * @param {Object} apiResponse - API 原始响应
 * @returns {Object} 标准化的响应
 */
export const parseApiResponse = (apiResponse) => {
  console.log('📦 解析API响应:', JSON.stringify(apiResponse, null, 2));
  
  // 提取视频URL - 可能在 content.video_url 或 video_url 或 url
  let videoUrl = null;
  if (apiResponse.content && apiResponse.content.video_url) {
    videoUrl = apiResponse.content.video_url;
  } else if (apiResponse.video_url) {
    videoUrl = apiResponse.video_url;
  } else if (apiResponse.url) {
    videoUrl = apiResponse.url;
  }

  const parsed = {
    taskId: apiResponse.id || apiResponse.task_id,
    status: apiResponse.status || 'processing',
    videoUrl: videoUrl,
    error: apiResponse.error || apiResponse.error_message
  };

  console.log('✅ 解析结果:', parsed);
  return parsed;
};

/**
 * 获取任务状态映射
 * @param {string} apiStatus - API 返回的状态
 * @returns {string} 标准化状态
 */
export const mapTaskStatus = (apiStatus) => {
  const statusMap = {
    'pending': 'processing',
    'processing': 'processing',
    'running': 'processing',
    'completed': 'completed',
    'succeeded': 'completed',  // ✅ 添加 succeeded 状态映射
    'success': 'completed',
    'failed': 'failed',
    'error': 'failed'
  };

  const mapped = statusMap[apiStatus] || 'processing';
  console.log(`🔄 状态映射: ${apiStatus} → ${mapped}`);
  return mapped;
};

export default {
  generateVideo,
  queryTaskStatus,
  validateApiKey,
  parseApiResponse,
  mapTaskStatus
};