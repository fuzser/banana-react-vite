/**
 * 后端配置文件
 * 集中管理所有配置项
 */

const config = {
  // 服务器配置
  server: {
    port: process.env.PORT || 3000,
    host: 'localhost',
    env: process.env.NODE_ENV || 'development'
  },

  // CORS 配置
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173', // Vite 默认端口
    credentials: true
  },

  // Body Parser 限制
  bodyLimit: {
    json: '500mb',      // 支持大 Base64 图片
    urlencoded: '500mb'
  },

  // Google Gemini API 配置
  gemini: {
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    model: 'gemini-2.5-flash-image',
    timeout: 60000 // 60秒超时
  },

  // 图片生成限制
  generation: {
    maxReferenceImages: 10,     // 最多参考图数量
    minPromptLength: 5,         // 最短提示词长度
    temperatureMin: 0,          // 最小随机度
    temperatureMax: 2,          // 最大随机度
    aspectRatios: [             // 支持的分辨率比例
      '1:1',
      '16:9',
      '9:16',
      '4:3',
      '3:4'
    ]
  },

  // 日志配置
  logging: {
    enabled: true,
    level: 'info' // 'error', 'warn', 'info', 'debug'
  }
}

export default config