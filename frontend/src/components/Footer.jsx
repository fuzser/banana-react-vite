import PropTypes from 'prop-types'

function Footer() {
  const handleFeatureIntro = () => {
    const features = `
🎨 Nano Banana 核心功能：

✅ 多参考图融合（最多10张）
   - 支持多张图片同时上传
   - 智能融合多个参考图的特征
   - Base64 格式安全传输

✅ 图像编辑与风格迁移
   - 添加元素、修改背景
   - 风格转换（写实→卡通、水彩等）
   - 智能图像增强

✅ 高速并发生成
   - 平均10秒完成生成
   - 支持一次生成最多8张
   - 并发请求，实时显示进度

✅ 灵活的参数控制
   - 5种分辨率比例（1:1、16:9、9:16等）
   - 随机度调节（0-2）
   - 批量生成（1-8张）

✅ 便捷的结果管理
   - 一键下载单张/全部图片
   - Base64 数据快速复制
   - 大图预览与导航

技术支持：Google Gemini 2.5 Flash
模型特点：高速、高质量、多模态
    `.trim()
    
    alert(features)
  }

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-main">
          <p className="footer-description">
            <strong>🍌 Nano Banana</strong> 是基于 Google Gemini 2.5 Flash 的 AI 图像生成工具
          </p>
          <p className="footer-tech">
            采用最新的多模态 AI 技术，支持文生图、图生图、图像编辑等多种功能
          </p>
        </div>

        <div className="footer-links">
            <a 
            href="https://aistudio.google.com/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            🔑 获取 API Key
          </a>
          <span className="footer-divider">|</span>
          <a
            href="https://ai.google.dev/gemini-api/docs/image-generation"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            📚 API 文档
          </a>
          <span className="footer-divider">|</span>
            <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            💻 GitHub
          </a>
          <span className="footer-divider">|</span>
          <button
            type="button"
            onClick={handleFeatureIntro}
            className="footer-link footer-link-button"
          >
            ✨ 功能介绍
          </button>
        </div>

        <div className="footer-info">
          <p className="footer-version">
            Version 2.0 - React + Vite
          </p>
          <p className="footer-copyright">
            © 2024 Nano Banana. Powered by Google Gemini AI
          </p>
        </div>

        <div className="footer-disclaimer">
          <p>
            ⚠️ 免责声明：请遵守相关法律法规，不得生成违法违规内容。
            AI 生成内容仅供参考，使用者需自行判断内容的准确性和适用性。
          </p>
        </div>
      </div>
    </footer>
  )
}

Footer.propTypes = {}

export default Footer