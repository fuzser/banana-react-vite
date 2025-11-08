import { useState } from 'react'
import PropTypes from 'prop-types'

function ApiKeyInput({ value, onChange }) {
  const [showKey, setShowKey] = useState(false)

  const handleChange = (e) => {
    onChange(e.target.value)
  }

  const handleToggleVisibility = () => {
    setShowKey(!showKey)
  }

  return (
    <div className="api-key-section">
      <label className="label-with-link">
        <span>🔑 Google API Key:</span>
        <a 
          href="https://aistudio.google.com/apikey" 
          target="_blank" 
          rel="noopener noreferrer"
          className="help-link"
        >
          获取 API Key →
        </a>
      </label>
      
      <div className="api-key-input-wrapper">
        <input
          type={showKey ? 'text' : 'password'}
          id="apiKey"
          value={value}
          onChange={handleChange}
          placeholder="输入你的 Google API Key (AIza...)"
          className="input-key"
        />
        <button
          type="button"
          className="toggle-visibility-btn"
          onClick={handleToggleVisibility}
          title={showKey ? '隐藏 API Key' : '显示 API Key'}
        >
          {showKey ? '👁️' : '👁️‍🗨️'}
        </button>
      </div>

      <p className="hint">
        💡 首次使用需要在 Google AI Studio 创建 API Key 并启用计费
      </p>

      {value && !value.startsWith('AIza') && (
        <p className="warning-hint">
          ⚠️ Google API Key 通常以 "AIza" 开头，请检查是否正确
        </p>
      )}
    </div>
  )
}

ApiKeyInput.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired
}

export default ApiKeyInput