/**
 * 视频提示词输入组件
 * 支持字数统计、快捷提示词、历史记录
 */

import { useState } from 'react';
import PropTypes from 'prop-types';
import './VideoPromptInput.css';

function VideoPromptInput({ value, onChange }) {
  const [showTemplates, setShowTemplates] = useState(false);

  /**
   * 提示词模板
   */
  const templates = [
    {
      title: '镜头运动',
      prompts: [
        '镜头从远处缓慢推进,特写人物表情',
        '360度环绕拍摄,展示完整场景',
        '航拍视角,俯瞰城市全景',
        '镜头跟随主体移动,保持焦点'
      ]
    },
    {
      title: '场景描述',
      prompts: [
        '日出时分,金色阳光洒在海面上',
        '繁忙的城市街道,车水马龙',
        '宁静的森林,阳光透过树叶',
        '现代科技感的办公室,简约风格'
      ]
    },
    {
      title: '人物动作',
      prompts: [
        '一个人从走路到奔跑,动作流畅',
        '运动员投篮,完美弧线入网',
        '舞者优雅旋转,裙摆飞扬',
        '厨师熟练地翻炒,火焰升腾'
      ]
    },
    {
      title: '特效风格',
      prompts: [
        '电影级别的光影效果,史诗感',
        '赛博朋克风格,霓虹灯闪烁',
        '梦幻泡泡感,柔和色调',
        '复古胶片质感,怀旧氛围'
      ]
    }
  ];

  /**
   * 插入模板提示词
   */
  const handleInsertTemplate = (prompt) => {
    if (value.trim()) {
      onChange(value + ', ' + prompt);
    } else {
      onChange(prompt);
    }
    setShowTemplates(false);
  };

  /**
   * 清空提示词
   */
  const handleClear = () => {
    if (window.confirm('确定要清空提示词吗?')) {
      onChange('');
    }
  };

  /**
   * 获取字数
   */
  const getCharCount = () => {
    return value.length;
  };

  /**
   * 获取字数提示颜色
   */
  const getCharCountClass = () => {
    const count = getCharCount();
    if (count === 0) return 'count-empty';
    if (count < 50) return 'count-short';
    if (count < 200) return 'count-good';
    if (count < 500) return 'count-long';
    return 'count-too-long';
  };

  return (
    <div className="video-prompt-input">
      <div className="prompt-header">
        <h3>✍️ 视频描述提示词</h3>
        <div className={`char-count ${getCharCountClass()}`}>
          {getCharCount()} 字符
        </div>
      </div>

      {/* 提示词输入框 */}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="请详细描述你想要生成的视频内容...&#10;&#10;示例:&#10;一名侦探进入一间光线昏暗的房间,检查桌上的线索,拿起一个笔记本。镜头转向他皱眉思索的表情。电影感,悬疑氛围,暖色调灯光。"
        className="prompt-textarea"
        rows={6}
      />

      {/* 操作按钮 */}
      <div className="prompt-actions">
        <button
          className="btn-templates"
          onClick={() => setShowTemplates(!showTemplates)}
        >
          💡 {showTemplates ? '收起模板' : '查看模板'}
        </button>
        <button
          className="btn-clear"
          onClick={handleClear}
          disabled={!value.trim()}
        >
          🗑️ 清空
        </button>
      </div>

      {/* 提示词模板 */}
      {showTemplates && (
        <div className="templates-panel">
          <div className="templates-header">
            <h4>📚 提示词模板库</h4>
            <button
              className="btn-close-templates"
              onClick={() => setShowTemplates(false)}
            >
              ✕
            </button>
          </div>
          
          <div className="templates-content">
            {templates.map((category, index) => (
              <div key={index} className="template-category">
                <h5 className="category-title">{category.title}</h5>
                <div className="template-items">
                  {category.prompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      className="template-item"
                      onClick={() => handleInsertTemplate(prompt)}
                    >
                      <span className="template-icon">➕</span>
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 提示信息 */}
      <div className="prompt-hints">
        <p className="hint-item">
          💡 提示词越详细,生成效果越好。建议包含:场景、人物、动作、镜头、风格等元素
        </p>
        <p className="hint-item">
          📝 推荐长度: 50-200 字符为佳,过短可能不够具体,过长可能影响生成速度
        </p>
      </div>
    </div>
  );
}

VideoPromptInput.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired
};

export default VideoPromptInput;