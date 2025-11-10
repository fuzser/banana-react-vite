/**
 * Nano Banana Backend Server
 * 本地运行模式 - 前端 Base64 直传
 */

import express from 'express'
import cors from 'cors'
import config from './config/config.js'
import { validateGenerateRequest } from './utils/validation.js'
import { generateImage } from './services/geminiService.js'

const app = express()

// ==============================
// 中间件配置
// ==============================

// CORS 配置（允许前端访问）
app.use(cors(config.cors))

// Body Parser 配置（支持大 Base64 图片）
app.use(express.json({ limit: config.bodyLimit.json }))
app.use(express.urlencoded({ 
  limit: config.bodyLimit.urlencoded, 
  extended: true 
}))

// 请求日志中间件
app.use((req, res, next) => {
  if (config.logging.enabled) {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`)
  }
  next()
})

// ==============================
// 路由
// ==============================

/**
 * 健康检查
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    api: 'Nano Banana (Google Gemini 2.5 Flash)',
    version: '1.0.0',
    mode: 'local-base64',
    features: [
      '多参考图(最多10张)',
      'Base64 直传',
      '图像编辑',
      '并发生成'
    ],
    config: {
      maxReferenceImages: config.generation.maxReferenceImages,
      supportedAspectRatios: config.generation.aspectRatios
    }
  })
})

/**
 * Nano Banana 图片生成
 */
app.post('/generate', async (req, res) => {
  const startTime = Date.now()
  
  try {
    // 提取请求参数
    const {
      prompt,
      apiKey,
      image_urls = [],
      aspectRatio = '1:1',
      temperature = 1.0
    } = req.body

    console.log('📥 收到生成请求:', {
      prompt_length: prompt?.length,
      num_reference_images: image_urls?.length,
      aspect_ratio: aspectRatio,
      temperature: temperature,
      has_api_key: !!apiKey
    })

    // 验证请求参数
    const validation = validateGenerateRequest({
      prompt,
      apiKey,
      image_urls,
      aspectRatio,
      temperature
    })

    if (!validation.valid) {
      console.log('❌ 参数验证失败:', validation.errors)
      return res.status(400).json({
        error: validation.errors[0], // 返回第一个错误
        errors: validation.errors,
        hint: '请检查输入参数'
      })
    }

    // 调用 Gemini API 生成图片
    const result = await generateImage({
      prompt,
      apiKey,
      image_urls,
      aspectRatio,
      temperature
    })

    const duration = ((Date.now() - startTime) / 1000).toFixed(2)

    // 处理生成结果
    if (result.success) {
      console.log(`✅ 生成成功 (耗时 ${duration}s)`)
      return res.json({
        data: result.data,
        duration: `${duration}s`,
        metadata: {
          prompt: prompt,
          num_reference_images: image_urls.length,
          aspect_ratio: aspectRatio,
          temperature: temperature
        }
      })
    } else {
      console.log(`❌ 生成失败 (耗时 ${duration}s):`, result.error)
      return res.status(400).json({
        error: result.error,
        finishReason: result.finishReason,
        hint: '💡 提示：尝试使用更简单、清晰的英文提示词，例如 "Add sunglasses" 或 "Change background to beach"'
      })
    }

  } catch (error) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2)
    console.error(`❌ 服务器异常 (耗时 ${duration}s):`, error)
    
    return res.status(500).json({
      error: '服务器内部错误',
      details: error.message,
      hint: '请检查后端日志或重启服务器'
    })
  }
})

// ==============================
// 错误处理中间件
// ==============================

// 404 处理
app.use((req, res) => {
  res.status(404).json({
    error: '路由不存在',
    path: req.path,
    availableRoutes: [
      'GET /health',
      'POST /generate'
    ]
  })
})

// 全局错误处理
app.use((err, req, res, next) => {
  console.error('❌ 未捕获的错误:', err)
  
  // Body 解析错误（通常是 JSON 过大或格式错误）
  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      error: '请求体过大',
      hint: '请减少参考图片数量或降低图片质量'
    })
  }

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: '请求格式错误',
      hint: '请检查 JSON 格式是否正确'
    })
  }

  // 其他错误
  res.status(500).json({
    error: '服务器内部错误',
    details: err.message
  })
})

// ==============================
// 启动服务器
// ==============================

const PORT = config.server.port
const HOST = config.server.host

app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60))
  console.log('🍌 Nano Banana API Server')
  console.log('='.repeat(60))
  console.log(`✅ 服务器运行在: http://${HOST}:${PORT}`)
  console.log(`🌍 环境: ${config.server.env}`)
  console.log(`📦 模式: 本地 Base64 直传`)
  console.log(`🔗 前端地址: ${config.cors.origin}`)
  console.log('='.repeat(60))
  console.log('\n📚 可用路由:')
  console.log(`   GET  /health    - 健康检查`)
  console.log(`   POST /generate  - 图片生成`)
  console.log('\n📝 获取 API Key: https://aistudio.google.com/apikey')
  console.log('📖 API 文档: https://ai.google.dev/gemini-api/docs/image-generation')
  console.log('\n' + '='.repeat(60) + '\n')
})

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('⚠️  收到 SIGTERM 信号，正在关闭服务器...')
  process.exit(0)
})

process.on('SIGINT', () => {
  console.log('\n⚠️  收到 SIGINT 信号，正在关闭服务器...')
  process.exit(0)
})

export default app