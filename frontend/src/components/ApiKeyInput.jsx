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
        <span>🔑API Key:</span>

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