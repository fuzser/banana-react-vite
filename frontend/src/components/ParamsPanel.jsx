import { useState } from 'react'
import PropTypes from 'prop-types'

function ParamsPanel({ 
  aspectRatio, 
  numImages, 
  temperature, 
  onAspectRatioChange, 
  onNumImagesChange, 
  onTemperatureChange 
}) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  // 分辨率选项配置
  const aspectRatioOptions = [
    { value: '1:1', label: '1:1 (正方形)', resolution: '1024×1024' },
    { value: '16:9', label: '16:9 (横屏)', resolution: '1920×1080' },
    { value: '9:16', label: '9:16 (竖屏)', resolution: '1080×1920' },
    { value: '4:3', label: '4:3 (标准)', resolution: '1600×1200' },
    { value: '3:4', label: '3:4 (竖版标准)', resolution: '1200×1600' }
  ]

  // 生成数量选项
  const numImagesOptions = [1, 2, 3, 4, 5, 6, 7, 8]

  // 获取温度描述
  const getTemperatureDescription = (temp) => {
    if (temp < 0.5) return '非常精确，接近参考图'
    if (temp < 1.0) return '较精确，小幅创意'
    if (temp < 1.5) return '平衡精确与创意'
    if (temp < 2.0) return '更多创意变化'
    return '最大创意自由度'
  }

  // 获取温度建议
  const getTemperatureSuggestion = (temp) => {
    if (temp < 0.5) return '适合：微调现有图片、保持原图风格'
    if (temp < 1.0) return '适合：在参考图基础上小改动'
    if (temp < 1.5) return '推荐：大多数场景的最佳选择'
    if (temp < 2.0) return '适合：探索更多可能性'
    return '适合：完全创意性的生成'
  }

  return (
    <div className="params-panel">
      <div className="params-header">
        <h3 className="params-title">🎨 生成参数</h3>
        <button
          type="button"
          className="toggle-advanced-btn"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          {showAdvanced ? '收起高级选项 ▲' : '展开高级选项 ▼'}
        </button>
      </div>

      <div className="params-grid">
        {/* 分辨率选择 */}
        <div className="param-item">
          <label className="param-label">
            📐 分辨率
            <span className="param-badge">必选</span>
          </label>
          <select
            value={aspectRatio}
            onChange={(e) => onAspectRatioChange(e.target.value)}
            className="param-select"
          >
            {aspectRatioOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="param-description">
            {aspectRatioOptions.find(opt => opt.value === aspectRatio)?.resolution}
          </div>
        </div>

        {/* 生成数量 */}
        <div className="param-item">
          <label className="param-label">
            🎲 生成数量
            <span className="param-badge badge-info">并发</span>
          </label>
          <select
            value={numImages}
            onChange={(e) => onNumImagesChange(parseInt(e.target.value))}
            className="param-select"
          >
            {numImagesOptions.map((num) => (
              <option key={num} value={num}>
                {num} 张
              </option>
            ))}
          </select>
          <div className="param-description">
            同时生成多张，提高效率
          </div>
        </div>

        {/* 随机度滑块 */}
        <div className="param-item param-item-full">
          <label className="param-label">
            🎨 随机度（Temperature）
            <span className="param-value-display">{temperature.toFixed(1)}</span>
          </label>
          
          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={temperature}
            onChange={(e) => onTemperatureChange(parseFloat(e.target.value))}
            className="param-slider"
          />
          
          <div className="slider-labels">
            <span>精确 (0)</span>
            <span>平衡 (1)</span>
            <span>创意 (2)</span>
          </div>

          <div className="temperature-info">
            <div className="temperature-description">
              <strong>{getTemperatureDescription(temperature)}</strong>
            </div>
            <div className="temperature-suggestion">
              💡 {getTemperatureSuggestion(temperature)}
            </div>
          </div>
        </div>
      </div>

      {/* 高级选项 */}
      {showAdvanced && (
        <div className="advanced-options">
          <div className="advanced-header">
            <span>⚙️ 高级选项</span>
          </div>

          <div className="advanced-grid">
            {/* 预设场景 */}
            <div className="advanced-item">
              <label className="param-label">🎬 预设场景</label>
              <div className="preset-buttons">
                <button
                  type="button"
                  className="preset-btn"
                  onClick={() => {
                    onAspectRatioChange('16:9')
                    onTemperatureChange(1.2)
                    onNumImagesChange(4)
                  }}
                >
                  📸 摄影作品
                </button>
                <button
                  type="button"
                  className="preset-btn"
                  onClick={() => {
                    onAspectRatioChange('1:1')
                    onTemperatureChange(1.5)
                    onNumImagesChange(6)
                  }}
                >
                  🎨 艺术创作
                </button>
                <button
                  type="button"
                  className="preset-btn"
                  onClick={() => {
                    onAspectRatioChange('9:16')
                    onTemperatureChange(0.8)
                    onNumImagesChange(3)
                  }}
                >
                  📱 社交媒体
                </button>
                <button
                  type="button"
                  className="preset-btn"
                  onClick={() => {
                    onAspectRatioChange('4:3')
                    onTemperatureChange(0.5)
                    onNumImagesChange(2)
                  }}
                >
                  🖼️ 精确编辑
                </button>
              </div>
            </div>

            {/* 参数说明 */}
            <div className="advanced-item">
              <label className="param-label">📖 参数说明</label>
              <div className="param-explanation">
                <div className="explanation-item">
                  <strong>分辨率:</strong> 生成图片的宽高比，影响图片尺寸和构图
                </div>
                <div className="explanation-item">
                  <strong>生成数量:</strong> 一次性生成多张图片，并发执行，总耗时不变
                </div>
                <div className="explanation-item">
                  <strong>随机度:</strong> 控制 AI 的创意程度
                  <ul>
                    <li>0-0.7: 忠实还原参考图，适合微调</li>
                    <li>0.7-1.3: 平衡保真与创新，通用场景</li>
                    <li>1.3-2.0: 更多创意变化，艺术创作</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 推荐配置 */}
            <div className="advanced-item">
              <label className="param-label">✨ 推荐配置</label>
              <div className="recommendation-cards">
                <div className="recommendation-card">
                  <div className="recommendation-title">🎯 精确复制</div>
                  <div className="recommendation-content">
                    Temperature: 0.3 | 数量: 2-3张
                  </div>
                  <div className="recommendation-desc">适合：产品图修图、人像微调</div>
                </div>
                <div className="recommendation-card">
                  <div className="recommendation-title">⚖️ 平衡模式</div>
                  <div className="recommendation-content">
                    Temperature: 1.0 | 数量: 4张
                  </div>
                  <div className="recommendation-desc">适合：大多数日常使用场景</div>
                </div>
                <div className="recommendation-card">
                  <div className="recommendation-title">🚀 创意探索</div>
                  <div className="recommendation-content">
                    Temperature: 1.5-2.0 | 数量: 6-8张
                  </div>
                  <div className="recommendation-desc">适合：艺术创作、风格实验</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 快速信息 */}
      <div className="params-summary">
        <div className="summary-item">
          <span className="summary-label">当前配置:</span>
          <span className="summary-value">
            {aspectRatio} · {numImages}张 · T:{temperature}
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-label">预计时间:</span>
          <span className="summary-value">
            约 10-15 秒
          </span>
        </div>
      </div>
    </div>
  )
}

ParamsPanel.propTypes = {
  aspectRatio: PropTypes.string.isRequired,
  numImages: PropTypes.number.isRequired,
  temperature: PropTypes.number.isRequired,
  onAspectRatioChange: PropTypes.func.isRequired,
  onNumImagesChange: PropTypes.func.isRequired,
  onTemperatureChange: PropTypes.func.isRequired
}

export default ParamsPanel