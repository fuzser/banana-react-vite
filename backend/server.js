/**
 * Nano Banana Backend Server
 * 支持图片生成和视频生成
 */

import express from 'express'
import cors from 'cors'
import config from './config/config.js'
import { validateGenerateRequest } from './utils/validation.js'
import { generateImage } from './services/geminiService.js'
// ⭐ 新增: 导入视频服务
import * as seedanceService from './services/seedanceService.js'

const app = express()

// ⭐ 新增: 内存存储视频任务状态(生产环境建议使用 Redis)
const videoTasks = new Map()

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
// 图片生成 API (原有功能)
// ==============================

/**
 * 健康检查
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    api: 'Nano Banana (Google Gemini 2.5 Flash + Doubao Seedance)',
    version: '2.0.0',
    mode: 'local-base64',
    features: [
      '多参考图(最多10张)',
      'Base64 直传',
      '图像编辑',
      '并发生成',
      '⭐ 视频生成(首尾帧控制)'  // 新增
    ],
    config: {
      maxReferenceImages: config.generation.maxReferenceImages,
      supportedAspectRatios: config.generation.aspectRatios
    },
    activeTasks: videoTasks.size  // ⭐ 新增: 当前活跃任务数
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
// ⭐ 视频生成 API (新增功能)
// ==============================

/**
 * 创建视频生成任务
 */
app.post('/api/video/generate', async (req, res) => {
  try {
    const { apiKey, model, images, prompt, params } = req.body

    // ⭐ 验证参数
    if (!apiKey) {
      return res.status(400).json({ error: 'API Key 是必需的' })
    }

    if (!seedanceService.validateApiKey(apiKey)) {
      return res.status(400).json({ error: 'API Key 格式不正确' })
    }

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: '提示词是必需的' })
    }

    if (!model) {
      return res.status(400).json({ error: '模型是必需的' })
    }

    console.log(`⭐ 创建视频生成任务:`)
    console.log(`  - 模型: ${model}`)
    console.log(`  - 提示词: ${prompt.substring(0, 50)}...`)
    console.log(`  - 图片数量: ${images?.length || 0}`)
    if (images && images.length > 0) {
      images.forEach((img, idx) => {
        console.log(`    [${idx + 1}] 角色: ${img.role}, 文件: ${img.fileName}`)
      })
    }
    console.log(`  - 参数: ${params.resolution} / ${params.duration}秒 / ${params.ratio}`)

    // ⭐ 调用 Seedance 服务
    const result = await seedanceService.generateVideo(apiKey, {
      model,
      images,
      prompt,
      params
    })

    // ⭐ 解析响应
    const parsedResult = seedanceService.parseApiResponse(result)
    const taskId = parsedResult.taskId

    // ⭐ 存储任务信息到内存
    videoTasks.set(taskId, {
      taskId,
      apiKey,
      status: 'processing',
      createdAt: Date.now(),
      model,
      prompt,
      params
    })

    console.log(`✅ 任务已创建: ${taskId}`)

    res.json({
      taskId,
      status: 'processing',
      message: '视频生成任务已创建'
    })

  } catch (error) {
    console.error('❌ 创建视频任务失败:', error)
    res.status(500).json({ 
      error: error.message || '创建任务失败，请稍后重试' 
    })
  }
})

/**
 * 查询视频生成任务状态
 */
app.get('/api/video/status/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params

    // ⭐ 从内存中获取任务信息
    const task = videoTasks.get(taskId)

    if (!task) {
      return res.status(404).json({ 
        error: '任务不存在或已过期' 
      })
    }

    console.log(`🔍 查询任务状态: ${taskId}`)

    // ⭐ 调用 Seedance API 查询状态
    const result = await seedanceService.queryTaskStatus(task.apiKey, taskId)
    const parsedResult = seedanceService.parseApiResponse(result)
    const status = seedanceService.mapTaskStatus(parsedResult.status)

    // ⭐ 更新任务状态
    task.status = status
    task.lastChecked = Date.now()

    if (status === 'completed') {
      task.videoUrl = parsedResult.videoUrl
      task.completedAt = Date.now()
      console.log(`✅ 任务完成: ${taskId}`)
    } else if (status === 'failed') {
      task.error = parsedResult.error || '生成失败'
      console.log(`❌ 任务失败: ${taskId} - ${task.error}`)
    }

    // ⭐ 返回状态
    res.json({
      taskId,
      status,
      videoUrl: task.videoUrl,
      error: task.error
    })

  } catch (error) {
    console.error('❌ 查询任务状态失败:', error)
    res.status(500).json({ 
      error: error.message || '查询状态失败，请稍后重试' 
    })
  }
})

/**
 * 验证 API Key (可选功能)
 */
app.post('/api/video/verify-key', async (req, res) => {
  try {
    const { apiKey } = req.body

    if (!apiKey) {
      return res.status(400).json({ error: 'API Key 是必需的' })
    }

    // 基本格式验证
    const isValid = seedanceService.validateApiKey(apiKey)

    if (!isValid) {
      return res.json({ valid: false, message: 'API Key 格式不正确' })
    }

    // TODO: 可以尝试调用一次 API 进行真实验证
    // 这里简化处理,只做格式验证
    res.json({ 
      valid: true, 
      message: 'API Key 格式正确' 
    })

  } catch (error) {
    console.error('验证 API Key 失败:', error)
    res.status(500).json({ 
      error: error.message || '验证失败' 
    })
  }
})

/**
 * ⭐ 清理过期任务(定时任务)
 * 每小时清理一次超过 24 小时的任务
 */
setInterval(() => {
  const now = Date.now()
  const expireTime = 24 * 60 * 60 * 1000 // 24 小时

  let cleanedCount = 0
  for (const [taskId, task] of videoTasks.entries()) {
    if (now - task.createdAt > expireTime) {
      videoTasks.delete(taskId)
      cleanedCount++
    }
  }

  if (cleanedCount > 0) {
    console.log(`🧹 清理了 ${cleanedCount} 个过期任务`)
  }
}, 60 * 60 * 1000) // 每小时执行一次

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
      'POST /generate',
      'POST /api/video/generate',           // ⭐ 新增
      'GET /api/video/status/:taskId',      // ⭐ 新增
      'POST /api/video/verify-key'          // ⭐ 新增
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
  console.log('🍌 Nano Banana API Server v2.0')
  console.log('='.repeat(60))
  console.log(`✅ 服务器运行在: http://${HOST}:${PORT}`)
  console.log(`🌍 环境: ${config.server.env}`)
  console.log(`📦 模式: 本地 Base64 直传`)
  console.log(`🔗 前端地址: ${config.cors.origin}`)
  console.log('='.repeat(60))
  console.log('\n📚 可用路由:')
  console.log(`   GET  /health                      - 健康检查`)
  console.log(`   POST /generate                    - 🎨 图片生成`)
  console.log(`   POST /api/video/generate          - 🎬 视频生成`)          // ⭐ 新增
  console.log(`   GET  /api/video/status/:taskId    - 🔍 查询任务状态`)     // ⭐ 新增
  console.log(`   POST /api/video/verify-key        - 🔑 验证 API Key`)     // ⭐ 新增
  console.log('\n📝 获取 API Key:')
  console.log(`   图片生成: https://aistudio.google.com/apikey`)
  console.log(`   视频生成: https://console.volcengine.com/ark`)             // ⭐ 新增
  console.log('='.repeat(60) + '\n')
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