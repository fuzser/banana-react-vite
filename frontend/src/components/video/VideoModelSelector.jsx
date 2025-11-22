/**
 * 视频模型选择器组件
 * 支持显示模型详细信息和特性
 */

import PropTypes from 'prop-types';
import { getAllModels, getModelConfig } from '../../utils/videoModels';
import './VideoModelSelector.css';

function VideoModelSelector({ value, onChange }) {
  const models = getAllModels();
  const currentModel = getModelConfig(value);

  /**
   * 处理模型切换
   */
  const handleModelChange = (e) => {
    const newModelId = e.target.value;
    const newModel = getModelConfig(newModelId);
    
    // 提示用户模型切换可能影响图片
    if (window.confirm(`确定切换到 ${newModel.name} 吗?\n\n注意: 切换模型可能会影响已上传的图片数量。`)) {
      onChange(newModelId);
    }
  };

  return (
    <div className="video-model-selector">
      <div className="selector-header">
        <h3>🤖 选择视频生成模型</h3>
      </div>

      {/* 下拉选择框 */}
      <div className="selector-control">
        <select 
          value={value} 
          onChange={handleModelChange}
          className="model-select"
        >
          {models.map(model => (
            <option key={model.id} value={model.id}>
              {model.name}
            </option>
          ))}
        </select>
      </div>

      {/* 当前模型详细信息 */}
      <div className="model-details">
        <div className="model-detail-row">
          <span className="detail-label">📝 描述:</span>
          <span className="detail-value">{currentModel.description}</span>
        </div>

        <div className="model-detail-row">
          <span className="detail-label">🖼️ 图片支持:</span>
          <span className="detail-value">
            {currentModel.maxImages === 0 
              ? '不支持图片' 
              : `最多 ${currentModel.maxImages} 张`}
            {currentModel.supportsFirstLastFrame && ' (支持首尾帧)'}
          </span>
        </div>

        <div className="model-detail-row">
          <span className="detail-label">📐 分辨率:</span>
          <span className="detail-value">
            {currentModel.resolutions.join(', ')}
          </span>
        </div>

        <div className="model-detail-row">
          <span className="detail-label">⏱️ 时长:</span>
          <span className="detail-value">
            {currentModel.durations.map(d => `${d}秒`).join(', ')}
          </span>
        </div>

        <div className="model-detail-row">
          <span className="detail-label">📏 宽高比:</span>
          <span className="detail-value">
            {currentModel.ratios.join(', ')}
          </span>
        </div>

        {/* 特性标签 */}
        {currentModel.features && currentModel.features.length > 0 && (
          <div className="model-features">
            <span className="detail-label">✨ 特性:</span>
            <div className="features-tags">
              {currentModel.features.map((feature, index) => (
                <span key={index} className="feature-tag">
                  {feature}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 模型切换提示 */}
      {currentModel.supportsFirstLastFrame && (
        <div className="model-tip tip-success">
          💡 当前模型支持首尾帧控制,可上传两张图片精确控制视频开始和结束画面
        </div>
      )}

      {currentModel.maxImages === 1 && (
        <div className="model-tip tip-info">
          💡 当前模型仅支持单图生成视频,将图片动画化
        </div>
      )}

      {currentModel.maxImages === 0 && (
        <div className="model-tip tip-warning">
          ⚠️ 当前模型不支持图片上传,仅支持纯文本生成视频
        </div>
      )}
    </div>
  );
}

VideoModelSelector.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired
};

export default VideoModelSelector;