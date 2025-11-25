/**
 * 输入验证工具函数
 */

import config from "../config/config.js";

/**
 * 验证 API Key
 * @param {string} apiKey - Google API Key
 * @returns {Object} { valid: boolean, error: string|null }
 */
export const validateApiKey = (apiKey) => {
  if (!apiKey || typeof apiKey !== "string") {
    return {
      valid: false,
      error: "请输入 Google API Key",
    };
  }

  if (apiKey.trim().length === 0) {
    return {
      valid: false,
      error: "API Key 不能为空",
    };
  }

  // Google API Key 通常以 AIza 开头
  if (!apiKey.startsWith("AIza")) {
    return {
      valid: false,
      error: "API Key 格式不正确（应以 AIza 开头）",
    };
  }

  return { valid: true, error: null };
};

/**
 * 验证提示词
 * @param {string} prompt - 提示词
 * @returns {Object} { valid: boolean, error: string|null }
 */
export const validatePrompt = (prompt) => {
  if (!prompt || typeof prompt !== "string") {
    return {
      valid: false,
      error: "Prompt 不能为空",
    };
  }

  const trimmedPrompt = prompt.trim();

  if (trimmedPrompt.length === 0) {
    return {
      valid: false,
      error: "Prompt 不能为空",
    };
  }

  if (trimmedPrompt.length < config.generation.minPromptLength) {
    return {
      valid: false,
      error: `Prompt 至少需要 ${config.generation.minPromptLength} 个字符`,
    };
  }

  return { valid: true, error: null };
};

/**
 * 验证参考图片数组
 * @param {Array<string>} imageUrls - Base64 图片数组
 * @returns {Object} { valid: boolean, error: string|null }
 */
export const validateImageUrls = (imageUrls) => {
  // 参考图是可选的
  if (!imageUrls || imageUrls.length === 0) {
    return { valid: true, error: null };
  }

  if (!Array.isArray(imageUrls)) {
    return {
      valid: false,
      error: "图片列表格式错误",
    };
  }

  // 检查数量限制
  if (imageUrls.length > config.generation.maxReferenceImages) {
    return {
      valid: false,
      error: `最多支持 ${config.generation.maxReferenceImages} 张参考图`,
    };
  }

  // 检查每个 URL 格式
  for (let i = 0; i < imageUrls.length; i++) {
    const url = imageUrls[i];

    if (typeof url !== "string") {
      return {
        valid: false,
        error: `图片 #${i + 1} 格式错误`,
      };
    }

    // 检查是否为 data URI 格式
    if (!url.startsWith("data:image/")) {
      return {
        valid: false,
        error: `图片 #${i + 1} 必须是 Base64 格式（data:image/...）`,
      };
    }
  }

  return { valid: true, error: null };
};

/**
 * 验证温度参数
 * @param {number} temperature - 随机度参数
 * @returns {Object} { valid: boolean, error: string|null }
 */
export const validateTemperature = (temperature) => {
  if (temperature === undefined || temperature === null) {
    return { valid: true, error: null }; // 使用默认值
  }

  if (typeof temperature !== "number") {
    return {
      valid: false,
      error: "随机度必须是数字",
    };
  }

  if (
    temperature < config.generation.temperatureMin ||
    temperature > config.generation.temperatureMax
  ) {
    return {
      valid: false,
      error: `随机度必须在 ${config.generation.temperatureMin}-${config.generation.temperatureMax} 之间`,
    };
  }

  return { valid: true, error: null };
};

/**
 * 验证分辨率比例
 * @param {string} aspectRatio - 分辨率比例
 * @returns {Object} { valid: boolean, error: string|null }
 */
export const validateAspectRatio = (aspectRatio) => {
  if (!aspectRatio) {
    return { valid: true, error: null }; // 使用默认值
  }

  if (typeof aspectRatio !== "string") {
    return {
      valid: false,
      error: "分辨率格式错误",
    };
  }

  if (!config.generation.aspectRatios.includes(aspectRatio)) {
    return {
      valid: false,
      error: `不支持的分辨率比例（支持: ${config.generation.aspectRatios.join(
        ", "
      )}）`,
    };
  }

  return { valid: true, error: null };
};

/**
 * 验证图片分辨率大小
 * @param {string} imageSize - 图片分辨率 (1K/2K/4K)
 * @returns {Object} { valid: boolean, error: string }
 */
export const validateImageSize = (imageSize) => {
  if (!imageSize) {
    return { valid: true, error: null }; // 使用默认值
  }

  if (typeof imageSize !== "string") {
    return {
      valid: false,
      error: "图片分辨率格式错误",
    };
  }

  if (!config.generation.imageSizes.includes(imageSize)) {
    return {
      valid: false,
      error: `不支持的图片分辨率(支持: ${config.generation.imageSizes.join(
        ", "
      )})`,
    };
  }

  return { valid: true, error: null };
};

/**
 * 验证完整的生成请求
 * @param {Object} params - 请求参数
 * @returns {Object} { valid: boolean, errors: Array<string> }
 */
export const validateGenerateRequest = (params) => {
  const errors = [];

  // 验证 API Key
  const apiKeyValidation = validateApiKey(params.apiKey);
  if (!apiKeyValidation.valid) {
    errors.push(apiKeyValidation.error);
  }

  // 验证 Prompt
  const promptValidation = validatePrompt(params.prompt);
  if (!promptValidation.valid) {
    errors.push(promptValidation.error);
  }

  // 验证参考图
  const imageUrlsValidation = validateImageUrls(params.image_urls);
  if (!imageUrlsValidation.valid) {
    errors.push(imageUrlsValidation.error);
  }

  // 验证温度
  const temperatureValidation = validateTemperature(params.temperature);
  if (!temperatureValidation.valid) {
    errors.push(temperatureValidation.error);
  }

  // 验证分辨率
  const aspectRatioValidation = validateAspectRatio(params.aspectRatio);
  if (!aspectRatioValidation.valid) {
    errors.push(aspectRatioValidation.error);
  }

  // 验证图片分辨率大小
  const imageSizeValidation = validateImageSize(params.imageSize);
  if (!imageSizeValidation.valid) {
    errors.push(imageSizeValidation.error);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

export default {
  validateApiKey,
  validatePrompt,
  validateImageUrls,
  validateTemperature,
  validateAspectRatio,
  validateImageSize,
  validateGenerateRequest,
};
