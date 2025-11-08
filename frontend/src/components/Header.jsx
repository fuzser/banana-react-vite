import PropTypes from 'prop-types'

function Header() {
  return (
    <div className="header">
      <h1>🍌 Nano Banana</h1>
      <p className="subtitle">Google Gemini 2.5 Flash 驱动的 AI 图像生成器</p>
      <div className="badge-group">
        <span className="badge badge-primary">支持多参考图(最多10张)</span>
        <span className="badge badge-success">Base64 传输</span>
        <span className="badge badge-info">10秒快速生成</span>
      </div>
    </div>
  )
}

export default Header