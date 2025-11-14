import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'

function PromptInput({ value, onChange }) {
  const [hasChinese, setHasChinese] = useState(false)
  const [charCount, setCharCount] = useState(0)

  // 检测中文字符
  useEffect(() => {
    const chineseRegex = /[\u4e00-\u9fa5]/
    setHasChinese(chineseRegex.test(value))
    setCharCount(value.length)
  }, [value])

  const handleChange = (e) => {
    onChange(e.target.value)
  }

  // 快速示例提示词
  const examplePrompts = [
    "A cute cat wearing sunglasses on a sunny beach",
    "Add a wizard hat to the person, make background magical",
    "Transform into oil painting style with vibrant colors",
    "Add rainbow and butterflies, make scene more dreamy",
    "Change to night scene with stars and moonlight"
  ]

  const handleUseExample = (prompt) => {
    onChange(prompt)
  }

  const handleClear = () => {
    onChange('')
  }

  return (
    <div className="prompt-input-section">
      <label className="label-with-info">
        <span>✍️ 文字描述（Prompt）:</span>
        <span className="info-tag">推荐使用英文</span>
      </label>

      {/* 文本输入框 */}
      <div className="textarea-wrapper">
        <textarea
          id="prompt"
          value={value}
          onChange={handleChange}
          rows="4"
          placeholder="例如：A cute cat wearing sunglasses on a sunny beach&#10;示例：Add a wizard hat to the person, make background magical"
          className="textarea-prompt"
        />
        
        {/* 字符计数 */}
        <div className="char-count">
          {charCount} 字符
        </div>

        {/* 清空按钮 */}
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="clear-prompt-btn"
            title="清空"
          >
            ×
          </button>
        )}
      </div>

      {/* 中文警告 */}
      {hasChinese && (
        <div className="chinese-warning">
          ⚠️ 检测到中文输入 - Nano Banana 对英文提示词效果更好，建议使用英文描述以获得最佳效果
        </div>
      )}

      {/* 提示信息 */}
      <div className="prompt-hints">
        <p className="hint">
          💡 提示: 可以描述想要添加的元素、修改的风格、或整体场景
        </p>
        
        {/* 长度提示 */}
        {value.length > 0 && value.length < 5 && (
          <p className="warning-hint">
            ⚠️ 描述文字太短，建议至少输入 5 个字符
          </p>
        )}

        {value.length > 500 && (
          <p className="warning-hint">
            ⚠️ 描述过长可能影响生成效果，建议精简到 500 字符以内
          </p>
        )}
      </div>

      {/* 快速示例 */}
      <div className="example-prompts">
{/*         <div className="example-header">
          <span className="example-title">💡 快速示例：</span>
          <span className="example-subtitle">点击使用</span>
        </div> */}
{/*         <div className="example-chips">
          {examplePrompts.map((prompt, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleUseExample(prompt)}
              className="example-chip"
              title="点击使用这个提示词"
            >
              {prompt}
            </button>
          ))}
        </div> */}
      </div>

      {/* 写作技巧提示 */}
{/* {      <details className="writing-tips">
        <summary className="tips-summary">📝 写作技巧</summary>
        <div className="tips-content">
          <div className="tip-item">
            <strong>1. 描述清晰具体</strong>
            <p>❌ "make it better" → ✅ "add colorful flowers in the foreground"</p>
          </div>
          <div className="tip-item">
            <strong>2. 使用形容词和细节</strong>
            <p>❌ "a cat" → ✅ "a fluffy orange cat with green eyes"</p>
          </div>
          <div className="tip-item">
            <strong>3. 指定风格或氛围</strong>
            <p>✅ "in watercolor style", "dreamy atmosphere", "cinematic lighting"</p>
          </div>
          <div className="tip-item">
            <strong>4. 有参考图时描述变化</strong>
            <p>✅ "change background to forest", "add sunglasses to person"</p>
          </div>
          <div className="tip-item">
            <strong>5. 避免否定词</strong>
            <p>❌ "no cars" → ✅ "empty street with trees"</p>
          </div>
        </div>
      </details>} */}
    </div>
  )
}

PromptInput.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired
}

export default PromptInput