/**
 * 视频参数设置面板组件
 * 支持分辨率、时长、宽高比设置
 */

import PropTypes from 'prop-types';
import { getModelConfig } from '../../utils/videoModels';
import './VideoParamsPanel.css';

function VideoParamsPanel({ 
  params,           // { resolution, duration, ratio }
  onChange,         // 参数变化回调
  selectedModel     // 当前选择的模型
}) {
  const modelConfig = getModelConfig(selectedModel);

  /**
   * 更新单个参数
   */
  const updateParam = (key, value) => {
    onChange({
      ...params,
      [key]: value
    });
  };

  /**
   * 重置为默认参数
   */
  const handleReset = () => {
    if (window.confirm('确定要重置为默认参数吗?')) {
      onChange({
        resolution: '1080p',
        duration: 10,
        ratio: '16:9'
      });
    }
  };

  /**
   * 获取预估生成时间
   */
  const getEstimatedTime = () => {
    const { resolution, duration } = params;
    
    // 根据分辨率和时长估算时间(仅供参考)
    let baseTime = 10; // 基础时间(秒)
    
    if (resolution === '1080p') baseTime += 10;
    else if (resolution === '720p') baseTime += 5;
    
    if (duration === 10) baseTime += 5;
    
    return `约 ${baseTime}-${baseTime + 10} 秒`;
  };

  /**
   * 获取分辨率描述
   */
  const getResolutionDesc = (res) => {
    const descriptions = {
      '480p': '标清 (640×480)',
      '720p': '高清 (1280×720)',
      '1080p': '全高清 (1920×1080)'
    };
    return descriptions[res] || res;
  };

  return (
    <div className="video-params-panel">
      <div className="params-header">
        <h3>⚙️ 生成参数设置</h3>
        <button 
          className="btn-reset"
          onClick={handleReset}
          title="重置为默认参数"
        >
          🔄 重置
        </button>
      </div>

      <div className="params-content">
        {/* 分辨率选择 */}
        <div className="param-item">
          <label className="param-label">
            <span className="label-icon">📐</span>
            <span className="label-text">分辨率</span>
          </label>
          <div className="param-control">
            <select
              value={params.resolution}
              onChange={(e) => updateParam('resolution', e.target.value)}
              className="param-select"
            >
              {modelConfig.resolutions.map(res => (
                <option key={res} value={res}>
                  {getResolutionDesc(res)}
                </option>
              ))}
            </select>
            <p className="param-hint">
              分辨率越高,生成时间越长,画质越好
            </p>
          </div>
        </div>

        {/* 时长选择 */}
        <div className="param-item">
          <label className="param-label">
            <span className="label-icon">⏱️</span>
            <span className="label-text">视频时长</span>
          </label>
          <div className="param-control">
            <div className="duration-options">
              {modelConfig.durations.map(dur => (
                <button
                  key={dur}
                  className={`duration-btn ${params.duration === dur ? 'active' : ''}`}
                  onClick={() => updateParam('duration', dur)}
                >
                  {dur} 秒
                </button>
              ))}
            </div>
            <p className="param-hint">
              时长越长,生成时间越长,内容越丰富
            </p>
          </div>
        </div>

        {/* 宽高比选择 */}
        <div className="param-item">
          <label className="param-label">
            <span className="label-icon">📏</span>
            <span className="label-text">宽高比</span>
          </label>
          <div className="param-control">
            <div className="ratio-grid">
              {modelConfig.ratios.map(ratio => (
                <button
                  key={ratio}
                  className={`ratio-btn ${params.ratio === ratio ? 'active' : ''}`}
                  onClick={() => updateParam('ratio', ratio)}
                  title={getRatioDescription(ratio)}
                >
                  <span className="ratio-visual">{getRatioVisual(ratio)}</span>
                  <span className="ratio-text">{ratio}</span>
                </button>
              ))}
            </div>
            <p className="param-hint">
              {getRatioDescription(params.ratio)}
            </p>
          </div>
        </div>

        {/* 预估信息 */}
        <div className="params-summary">
          <div className="summary-item">
            <span className="summary-label">📊 当前设置:</span>
            <span className="summary-value">
              {params.resolution} / {params.duration}秒 / {params.ratio}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">⏰ 预估生成时间:</span>
            <span className="summary-value">{getEstimatedTime()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 获取宽高比描述
 */
function getRatioDescription(ratio) {
  const descriptions = {
    '16:9': '横屏 - 适合电视、电脑观看',
    '9:16': '竖屏 - 适合手机、短视频平台',
    '1:1': '正方形 - 适合社交媒体',
    '4:3': '标准 - 经典比例',
    '3:4': '竖版标准 - 适合人物特写',
    '21:9': '超宽屏 - 电影感',
    '9:21': '超长竖屏 - 沉浸式体验'
  };
  return descriptions[ratio] || ratio;
}

/**
 * 获取宽高比可视化表示
 */
function getRatioVisual(ratio) {
  const visuals = {
    '16:9': '▬',
    '9:16': '▮',
    '1:1': '◼',
    '4:3': '▭',
    '3:4': '▯',
    '21:9': '▬▬',
    '9:21': '▮▮'
  };
  return visuals[ratio] || '◻';
}

VideoParamsPanel.propTypes = {
  params: PropTypes.shape({
    resolution: PropTypes.string.isRequired,
    duration: PropTypes.number.isRequired,
    ratio: PropTypes.string.isRequired
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  selectedModel: PropTypes.string.isRequired
};

export default VideoParamsPanel;