# 🍌 Nano Banana

<div align="center">

**AI-Powered Multi-Modal Content Generation Platform**  
**基于 AI 的多模态内容生成平台**

**Powered by Google Gemini 2.5 Flash & Doubao Seedance**  
**由 Google Gemini 2.5 Flash 和豆包 Seedance 驱动**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF.svg)](https://vitejs.dev/)
[![Node](https://img.shields.io/badge/Node-18+-green.svg)](https://nodejs.org/)

[English](#english) | [中文](#chinese)

</div>

---

<a name="english"></a>
## 🌍 English Version

### 📖 About

Nano Banana is a modern AI-powered multi-modal generation platform that integrates two core capabilities:

- **🎨 Image Generation**: Leveraging Google Gemini 2.5 Flash's powerful capabilities for text-to-image, image-to-image, and image editing
- **🎬 Video Generation**: Based on Volcengine's Doubao Seedance models, supporting high-quality video generation with first/last frame control

Average generation time: 10-15 seconds (images) and 30-90 seconds (videos), providing a smooth creative experience.

### ✨ Features

#### Image Generation (Gemini 2.5 Flash)

- ✅ **Multi-Reference Fusion** - Support up to 10 reference images simultaneously
- ✅ **High-Speed Concurrent Generation** - Batch generation time optimized from 48s to 15s
- ✅ **Flexible Parameter Control** - 5 aspect ratios (1:1, 16:9, 9:16, 3:4, 4:3)
- ✅ **Temperature Adjustment** - Range 0-2 for different creative needs
- ✅ **Batch Generation** - Generate 1-8 images at once with real-time progress
- ✅ **Base64 Direct Transfer** - No file upload required, secure and efficient

#### Video Generation (Doubao Seedance)

- ✅ **First/Last Frame Control** - Precise control with Seedance 1.0 Pro
- ✅ **Multiple Models** - Pro/Lite models for image-to-video/text-to-video
- ✅ **HD Output** - Support for 480p/720p/1080p resolutions
- ✅ **Flexible Duration** - 5s/10s video generation
- ✅ **Real-time Progress** - Task status and progress tracking
- ✅ **History Management** - Auto-save generation history

#### Common Features

- 💾 **State Persistence** - All settings auto-saved to browser local storage
- 📱 **Responsive Design** - Perfect for desktop and mobile devices
- 🌐 **Local Deployment** - Fully local operation, data security guaranteed
- 🎯 **One-Click Launch** - Quick start script for Windows

### 🚀 Quick Start

#### Requirements

- **Node.js** 18 or higher
- **npm** or yarn package manager
- **API Keys**:
  - Google Gemini API Key ([Get it here](https://aistudio.google.com/apikey))
  - Volcengine Doubao API Key ([Get it here](https://console.volcengine.com/ark))

#### Installation

1. **Clone the repository**

```bash
git clone https://github.com/your-username/nano-banana.git
cd nano-banana
```

2. **Install dependencies**

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
cd ..
```

3. **Configure environment variables (optional)**

Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:3000
```

4. **Start the application**

**Option 1: One-click launch (Windows)**
```bash
# Double-click to run
一键启动.bat
```

**Option 2: npm command**
```bash
# Start both frontend and backend
npm start
```

**Option 3: Separate launch**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

5. **Access the application**

- Frontend: http://localhost:5173
- Backend: http://localhost:3000

6. **Configure API Keys**

Enter your API Keys in the settings page or corresponding feature pages on first use. The system will automatically save them to browser local storage.

### 📚 Usage Guide

#### Image Generation

**Basic Usage**

1. **Text-to-Image** - Generate images from text descriptions
   ```
   Example: "A fluffy orange cat sitting on a wooden table, watercolor style"
   ```

2. **Image-to-Image** - Upload reference image + description
   ```
   Upload: A landscape photo
   Description: "Change to sunset atmosphere with warm colors"
   ```

3. **Image Editing** - Upload image and describe modifications
   ```
   Upload: Portrait photo
   Description: "Add sunglasses and change background to beach"
   ```

**Parameters**

| Parameter | Description | Recommended |
|-----------|-------------|-------------|
| **Aspect Ratio** | Width-to-height ratio | 1:1 (general), 16:9 (landscape), 9:16 (portrait) |
| **Quantity** | Number of images per generation | 4 (balanced), 6-8 (explore more) |
| **Temperature** | Creativity level | 0.3 (precise), 1.0 (balanced), 1.5-2.0 (creative) |

**Tips**

**✅ Recommended**
- Use clear, specific English descriptions
- Add adjectives and details: "fluffy", "colorful", "dreamy"
- Specify art style: "watercolor style", "cinematic lighting"
- With reference images, describe specific changes: "add flowers", "change background"

**❌ Avoid**
- Too brief: "make it better"
- Negative words: "no cars" → use "empty street"
- Overly complex or lengthy descriptions

#### Video Generation

**Model Selection**

| Model | Type | Features | Use Case |
|-------|------|----------|----------|
| **Seedance 1.0 Pro** | First/Last Frame | High quality, 1080p support | Professional video creation |
| **Seedance 1.0 Lite (I2V)** | Single/Dual Image | Fast, first/last frame support | Quick prototyping |
| **Seedance 1.0 Lite (T2V)** | Text-only | No image required | Concept validation |

**First/Last Frame Usage**

1. **Upload Images** - First image becomes first frame, second becomes last frame
2. **Manual Toggle** - Click role label on images to switch first/last frame
3. **Adjust Order** - Drag images to reorder
4. **Describe Transition** - Describe the changes between first and last frames

**Video Parameters**

| Parameter | Options | Description |
|-----------|---------|-------------|
| **Resolution** | 480p/720p/1080p | Pro supports all, Lite supports 480p/720p only |
| **Duration** | 5s/10s | Video length |
| **Ratio** | 16:9/9:16/1:1/4:3/3:4 | Video aspect ratio |

**Generation Time**

- **Lite Models**: 30-60 seconds
- **Pro Model (480p/720p)**: 60-120 seconds
- **Pro Model (1080p)**: 120-300 seconds

### 🏗️ Architecture

**Frontend Stack**

- **React 18** - Modern UI framework
- **Vite 6** - Next-generation build tool
- **React Router** - SPA routing
- **Custom Hooks** - State management and logic reuse
- **LocalStorage** - Client-side data persistence

**Backend Stack**

- **Node.js + Express** - Lightweight server framework
- **Google Gemini 2.5 Flash API** - AI image generation
- **Volcengine Doubao Seedance API** - AI video generation
- **CORS** - Cross-origin resource sharing
- **node-fetch** - HTTP request library

### 🐛 Common Issues

**Q: API Key invalid or request failed?**

A: 
- Check if API Key is correctly copied (no extra spaces)
- Verify API Key quota is not exhausted
- Gemini: Visit [Google AI Studio](https://aistudio.google.com/apikey) to check usage
- Doubao: Visit [Volcengine Ark Console](https://console.volcengine.com/ark) to check quota

**Q: Video generation timeout?**

A:
- Pro model 1080p videos may take 3-5 minutes, please be patient
- Try 480p first, then upgrade to higher resolutions
- Check if network connection is stable

**Q: Backend service won't start?**

A:
- Check if port 3000 is occupied
- Verify Node.js version >= 18
- Delete `node_modules` and reinstall:
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  ```

### 📝 Roadmap

- [ ] Support more AI models (Stable Diffusion, Midjourney, etc.)
- [ ] Add prompt template library
- [ ] Implement image/video edit history comparison
- [ ] Batch export support
- [ ] User favorites feature
- [ ] Cloud sync support
- [ ] Docker containerization
- [ ] Multi-language support

### 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details

### 🙏 Acknowledgments

- [Google Gemini AI](https://ai.google.dev/) - Powerful AI image generation
- [Volcengine Doubao](https://www.volcengine.com/product/ark) - Quality video generation models
- [React](https://reactjs.org/) - Excellent frontend framework
- [Vite](https://vitejs.dev/) - Fast build tool
- [Express](https://expressjs.com/) - Simple backend framework

---

<a name="chinese"></a>
## 🇨🇳 中文版本

### 📖 项目简介

Nano Banana 是一个现代化的 AI 多模态生成工具,集成了**图片生成**和**视频生成**两大核心功能:

- **🎨 图片生成**: 利用 Google Gemini 2.5 Flash 的强大能力,支持文生图、图生图、图像编辑等多种模式
- **🎬 视频生成**: 基于火山引擎豆包 Seedance 模型,支持首尾帧控制的高质量视频生成

平均生成时间仅需 10-15 秒(图片)和 30-90 秒(视频),提供流畅的创作体验。

### ✨ 功能特性

#### 图片生成 (Gemini 2.5 Flash)

- ✅ **多参考图融合** - 支持最多 10 张参考图同时上传
- ✅ **高速并发生成** - 批量生成时间从 48 秒优化至 15 秒
- ✅ **灵活参数控制** - 5 种分辨率比例(1:1、16:9、9:16、3:4、4:3)
- ✅ **随机度调节** - Temperature 参数范围 0-2,满足不同创作需求
- ✅ **批量生成** - 一次生成 1-8 张图片,实时显示进度
- ✅ **Base64 直传** - 无需文件上传,安全高效

#### 视频生成 (Doubao Seedance)

- ✅ **首尾帧控制** - 支持 Seedance 1.0 Pro 首尾帧精准控制
- ✅ **多模型支持** - Pro/Lite 图生视频/文生视频三种模型
- ✅ **高清输出** - 支持 480p/720p/1080p 多种分辨率
- ✅ **灵活时长** - 5秒/10秒视频生成
- ✅ **实时进度** - 任务状态实时查询和进度显示
- ✅ **历史管理** - 自动保存生成历史,随时回看

#### 通用特性

- 💾 **状态持久化** - 所有设置自动保存到浏览器本地
- 📱 **响应式设计** - 完美适配桌面和移动设备
- 🌐 **本地部署** - 支持完全本地运行,数据安全可控
- 🎯 **一键启动** - Windows 平台一键启动脚本

### 🚀 快速开始

#### 环境要求

- **Node.js** 18 或更高版本
- **npm** 或 yarn 包管理器
- **API Keys**:
  - Google Gemini API Key ([获取地址](https://aistudio.google.com/apikey))
  - 火山引擎 Doubao API Key ([获取地址](https://console.volcengine.com/ark))

#### 安装步骤

1. **克隆项目**

```bash
git clone https://github.com/your-username/nano-banana.git
cd nano-banana
```

2. **安装依赖**

```bash
# 安装根目录依赖
npm install

# 安装前端依赖
cd frontend
npm install

# 安装后端依赖
cd ../backend
npm install
cd ..
```

3. **配置环境变量 (可选)**

创建 `frontend/.env` 文件:
```env
VITE_API_URL=http://localhost:3000
```

4. **启动应用**

**方式一: 使用一键启动脚本 (Windows)**
```bash
# 双击运行
一键启动.bat
```

**方式二: 使用 npm 命令**
```bash
# 同时启动前后端
npm start
```

**方式三: 分别启动**
```bash
# 终端 1 - 启动后端
cd backend
npm run dev

# 终端 2 - 启动前端
cd frontend
npm run dev
```

5. **访问应用**

- 前端: http://localhost:5173
- 后端: http://localhost:3000

6. **配置 API Keys**

首次使用需在应用的设置页面或对应功能页面输入 API Keys,系统会自动保存到浏览器本地。

### 📚 使用指南

#### 图片生成

**基础使用**

1. **文生图** - 直接输入描述文字生成图片
   ```
   示例: "A fluffy orange cat sitting on a wooden table, watercolor style"
   ```

2. **图生图** - 上传参考图片 + 描述文字
   ```
   上传: 一张风景照
   描述: "Change to sunset atmosphere with warm colors"
   ```

3. **图像编辑** - 上传图片并描述修改内容
   ```
   上传: 人物照片
   描述: "Add sunglasses and change background to beach"
   ```

**参数说明**

| 参数 | 说明 | 推荐值 |
|------|------|--------|
| **分辨率比例** | 生成图片的宽高比 | 1:1(通用)、16:9(横屏)、9:16(竖屏) |
| **生成数量** | 一次生成的图片数量 | 4 张(平衡)、6-8 张(探索更多可能) |
| **随机度** | 控制生成的创意程度 | 0.3(精确)、1.0(平衡)、1.5-2.0(创意) |

**使用技巧**

**✅ 推荐做法**
- 使用清晰、具体的英文描述
- 添加形容词和细节:"fluffy", "colorful", "dreamy"
- 指定艺术风格:"watercolor style", "cinematic lighting"
- 有参考图时描述具体变化:"add flowers", "change background"

**❌ 避免做法**
- 过于简短的描述:"make it better"
- 使用否定词:"no cars" → 改为 "empty street"
- 描述过于复杂或冗长

#### 视频生成

**模型选择**

| 模型 | 类型 | 特点 | 适用场景 |
|------|------|------|----------|
| **Seedance 1.0 Pro** | 首尾帧控制 | 高质量、支持1080p | 专业视频创作 |
| **Seedance 1.0 Lite (图生视频)** | 单图/双图 | 快速、支持首尾帧 | 快速原型 |
| **Seedance 1.0 Lite (文生视频)** | 纯文本 | 无需图片 | 概念验证 |

**首尾帧使用**

1. **上传图片** - 第一张自动设为首帧,第二张设为尾帧
2. **手动切换** - 点击图片上的角色标签可切换首帧/尾帧
3. **调整顺序** - 拖拽图片可调整顺序
4. **描述过渡** - 在提示词中描述首尾帧之间的变化过程

**视频参数**

| 参数 | 可选值 | 说明 |
|------|--------|------|
| **分辨率** | 480p/720p/1080p | Pro模型支持全部,Lite仅支持480p/720p |
| **时长** | 5秒/10秒 | 视频时长 |
| **比例** | 16:9/9:16/1:1/4:3/3:4 | 视频宽高比 |

**生成时间**

- **Lite 模型**: 30-60 秒
- **Pro 模型 (480p/720p)**: 60-120 秒
- **Pro 模型 (1080p)**: 120-300 秒

### 🏗️ 技术架构

**前端技术栈**

- **React 18** - 现代化 UI 框架
- **Vite 6** - 下一代前端构建工具
- **React Router** - 单页应用路由
- **Custom Hooks** - 状态管理和逻辑复用
- **LocalStorage** - 客户端数据持久化

**后端技术栈**

- **Node.js + Express** - 轻量级服务器框架
- **Google Gemini 2.5 Flash API** - AI 图像生成
- **火山引擎 Doubao Seedance API** - AI 视频生成
- **CORS** - 跨域资源共享支持
- **node-fetch** - HTTP 请求库

### 🏗️ 项目结构

```
nano-banana/
├── frontend/                 # 前端应用
│   ├── src/
│   │   ├── components/       # React 组件
│   │   │   ├── video/       # 视频相关组件
│   │   │   └── ...          # 图片相关组件
│   │   ├── hooks/           # 自定义 Hooks
│   │   ├── pages/           # 页面组件
│   │   ├── utils/           # 工具函数
│   │   └── App.jsx          # 应用入口
│   └── package.json
├── backend/                  # 后端服务
│   ├── config/              # 配置文件
│   ├── services/            # API 服务
│   │   ├── geminiService.js    # Gemini API
│   │   └── seedanceService.js  # Seedance API
│   ├── utils/               # 工具函数
│   └── server.js            # 服务器入口
├── package.json             # 根配置文件
└── 一键启动.bat             # Windows 快速启动
```

### 🔧 配置说明

**后端配置**

编辑 `backend/config/config.js`:

```javascript
{
  server: {
    port: 3000,              // 后端服务端口
    host: 'localhost'
  },
  generation: {
    maxReferenceImages: 10,  // 最多参考图数量
    aspectRatios: ['1:1', '16:9', '9:16', '3:4', '4:3']
  }
}
```

**前端配置**

编辑 `frontend/.env`:

```env
VITE_API_URL=http://localhost:3000  # 后端API地址
```

### 🎯 性能优化

- **并发处理**: 图片生成采用 Promise.all 并发请求,显著提升批量生成速度
- **Base64 直传**: 避免文件系统 I/O 操作,提高传输效率
- **状态持久化**: 使用 localStorage 保存状态,提升用户体验
- **组件懒加载**: 优化首屏加载速度
- **轮询优化**: 视频生成采用智能轮询,平衡服务器压力和响应速度

### 🐛 常见问题

**Q: API Key 无效或请求失败?**

**A**: 
- 检查 API Key 是否正确复制(无多余空格)
- 确认 API Key 配额未用尽
- Gemini: 访问 [Google AI Studio](https://aistudio.google.com/apikey) 查看使用情况
- Doubao: 访问 [火山方舟控制台](https://console.volcengine.com/ark) 查看配额

**Q: 视频生成超时?**

**A**:
- Pro 模型 1080p 视频可能需要 3-5 分钟,请耐心等待
- 可以先使用 480p 测试,成功后再尝试更高分辨率
- 检查网络连接是否稳定

**Q: 后端服务无法启动?**

**A**:
- 检查 3000 端口是否被占用
- 确认 Node.js 版本 >= 18
- 删除 `node_modules` 重新安装依赖:
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  ```

**Q: 图片/视频生成失败?**

**A**:
- **图片生成**: 使用更简单、清晰的英文提示词
- **视频生成**: 
  - 确认已在火山方舟控制台开通对应模型
  - 检查模型ID是否正确(如 `doubao-seedance-1.0-pro`)
  - 查看后端日志获取详细错误信息

**Q: 如何查询视频生成任务状态?**

**A**: 
可以通过以下方式查询:

1. **浏览器访问**:
   ```
   http://localhost:3000/api/video/status/任务ID
   ```

2. **命令行查询**:
   ```bash
   curl -X GET "https://ark.cn-beijing.volces.com/api/v3/contents/generations/tasks/任务ID" \
     -H "Authorization: Bearer 你的API_KEY"
   ```

### 📝 开发计划

- [ ] 支持更多 AI 模型(Stable Diffusion, Midjourney等)
- [ ] 添加提示词模板库
- [ ] 实现图片/视频编辑历史对比
- [ ] 支持批量导出
- [ ] 添加用户收藏功能
- [ ] 云端同步支持
- [ ] Docker 容器化部署
- [ ] 多语言支持

### 🤝 贡献指南

欢迎提交 Issue 和 Pull Request!

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

### 🙏 致谢

- [Google Gemini AI](https://ai.google.dev/) - 提供强大的 AI 图像生成能力
- [火山引擎豆包](https://www.volcengine.com/product/ark) - 提供优质的视频生成模型
- [React](https://reactjs.org/) - 优秀的前端框架
- [Vite](https://vitejs.dev/) - 快速的构建工具
- [Express](https://expressjs.com/) - 简洁的后端框架

### 📧 联系方式

- 项目主页: [GitHub](https://github.com/your-username/nano-banana)
- 问题反馈: [Issues](https://github.com/your-username/nano-banana/issues)
- API 文档:
  - [Google Gemini API](https://ai.google.dev/gemini-api/docs/image-generation)
  - [火山引擎 Doubao API](https://www.volcengine.com/docs/82379)

---

<div align="center">

**⭐ If this project helps you, please give it a Star ⭐**  
**⭐ 如果这个项目对你有帮助,请给个 Star ⭐**

Made with ❤️ by [Your Name]

</div>
