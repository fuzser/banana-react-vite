/**
 * 视频生成模型配置
 * 定义不同模型的能力和限制
 */

/**
 * 图片角色类型
 */
export const IMAGE_ROLES = {
  FIRST_FRAME: 'first_frame',  // 首帧
  LAST_FRAME: 'last_frame',    // 尾帧
  REFERENCE: 'reference'        // 普通参考图
};

/**
 * 视频生成模型配置
 */
export const VIDEO_MODELS = {
  'doubao-seedance-1-0-pro-250528': {
    id: 'doubao-seedance-1-0-pro-250528',
    name: 'Seedance 1.0 Pro',
    supportsFirstLastFrame: true,  // 支持首尾帧
    maxImages: 2,                  // 最多2张图片
    minImages: 0,                  // 最少0张(可以纯文生视频)
    description: '支持首尾帧生成,高质量视频输出',
    features: ['首尾帧控制', '1080P高清', '多镜头切换'],
    resolutions: ['480p', '720p', '1080p'],
    durations: [5, 10],            // 支持的时长(秒)
    ratios: ['16:9', '9:16', '1:1', '4:3', '3:4']
  },
  'doubao-seedance-1-0-lite-i2v-250428': {
    id: 'doubao-seedance-1-0-lite-i2v-250428',
    name: 'Seedance 1.0 Lite (图生视频)',
    supportsFirstLastFrame: false,  // 仅支持单图
    maxImages: 1,
    minImages: 1,                   // 必须有1张图片
    description: '单图生成视频,快速版本',
    features: ['快速生成', '图片动画化'],
    resolutions: ['480p', '720p'],
    durations: [5],
    ratios: ['16:9', '9:16', '1:1']
  },
  'doubao-seedance-1-0-lite-t2v-250428': {
    id: 'doubao-seedance-1-0-lite-t2v-250428',
    name: 'Seedance 1.0 Lite (文生视频)',
    supportsFirstLastFrame: false,
    maxImages: 0,                   // 不支持图片
    minImages: 0,
    description: '纯文本生成视频,无需参考图',
    features: ['纯文本生成', '快速出图'],
    resolutions: ['480p', '720p'],
    durations: [5],
    ratios: ['16:9', '9:16', '1:1']
  }
};

/**
 * 默认模型ID
 */
export const DEFAULT_MODEL = 'doubao-seedance-1-0-pro-250528';

/**
 * 获取模型配置
 * @param {string} modelId - 模型ID
 * @returns {Object} 模型配置对象
 */
export const getModelConfig = (modelId) => {
  return VIDEO_MODELS[modelId] || VIDEO_MODELS[DEFAULT_MODEL];
};

/**
 * 获取所有可用模型列表
 * @returns {Array} 模型配置数组
 */
export const getAllModels = () => {
  return Object.values(VIDEO_MODELS);
};

/**
 * 检查模型是否支持首尾帧
 * @param {string} modelId - 模型ID
 * @returns {boolean}
 */
export const supportsFirstLastFrame = (modelId) => {
  const config = getModelConfig(modelId);
  return config.supportsFirstLastFrame;
};

/**
 * 获取模型支持的最大图片数
 * @param {string} modelId - 模型ID
 * @returns {number}
 */
export const getMaxImages = (modelId) => {
  const config = getModelConfig(modelId);
  return config.maxImages;
};

/**
 * 获取角色显示文本
 * @param {string} role - 角色类型
 * @returns {string}
 */
export const getRoleLabel = (role) => {
  switch(role) {
    case IMAGE_ROLES.FIRST_FRAME:
      return '🎬 首帧';
    case IMAGE_ROLES.LAST_FRAME:
      return '🏁 尾帧';
    case IMAGE_ROLES.REFERENCE:
      return '📷 参考图';
    default:
      return '📷 图片';
  }
};

/**
 * 获取角色的CSS类名
 * @param {string} role - 角色类型
 * @returns {string}
 */
export const getRoleClass = (role) => {
  switch(role) {
    case IMAGE_ROLES.FIRST_FRAME:
      return 'role-first-frame';
    case IMAGE_ROLES.LAST_FRAME:
      return 'role-last-frame';
    case IMAGE_ROLES.REFERENCE:
      return 'role-reference';
    default:
      return 'role-unknown';
  }
};