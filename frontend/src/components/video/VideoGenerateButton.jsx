/**
 * 视频生成按钮组件
 * 支持进度显示、状态管理、错误处理
 */

import { useState } from 'react';
import PropTypes from 'prop-types';
import './VideoGenerateButton.css';

function VideoGenerateButton({
  apiKey,
  selectedModel,
  images,
  prompt,
  params,
  onGenerateStart,
  onGenerateComplete,
  onGenerateError
}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');

  /**
   * 验证生成参数
   */
  const validateParams = () => {
    const errors = [];

    // 验证 API Key
    if (!apiKey || apiKey.trim() === '') {
      errors.push('请先设置 API Key');
    }

    // 验证提示词
    if (!prompt || prompt.trim() === '') {
      errors.push('请输入视频描述提示词');
    }

    // 验证图片(根据模型要求)
    const modelConfig = getModelConfig(selectedModel);
    if (modelConfig.minImages > 0 && images.length < modelConfig.minImages) {
      errors.push(`当前模型至少需要 ${modelConfig.minImages} 张图片`);
    }

    return errors;
  };

  /**
   * 处理生成按钮点击
   */
  const handleGenerate = async () => {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
    // 验证参数
    const errors = validateParams();
    if (errors.length > 0) {
      alert('❌ 参数验证失败:\n\n' + errors.join('\n'));
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setStatusMessage('正在准备生成...');
    
    if (onGenerateStart) {
      onGenerateStart();
    }

    try {
      // 第一步: 创建任务
      setStatusMessage('正在创建生成任务...');
      setProgress(10);

      const createResponse = await fetch(`${API_BASE_URL}/api/video/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          apiKey,
          model: selectedModel,
          images,
          prompt,
          params
        })
      });

      if (!createResponse.ok) {
        throw new Error(`创建任务失败: ${createResponse.status}`);
      }

      const createData = await createResponse.json();
      const taskId = createData.taskId;

      setStatusMessage('任务已创建,正在生成视频...');
      setProgress(20);

      // 第二步: 轮询任务状态
      const videoUrl = await pollTaskStatus(taskId);

      // 第三步: 生成完成
      setStatusMessage('视频生成完成!');
      setProgress(100);

      if (onGenerateComplete) {
        onGenerateComplete({
          videoUrl,
          taskId,
          prompt,
          model: selectedModel,
          images,
          params,
          timestamp: Date.now()
        });
      }

      // 延迟重置状态
      setTimeout(() => {
        setIsGenerating(false);
        setProgress(0);
        setStatusMessage('');
      }, 2000);

    } catch (error) {
      console.error('生成失败:', error);
      setStatusMessage('生成失败: ' + error.message);
      
      if (onGenerateError) {
        onGenerateError(error);
      }

      // 延迟重置状态
      setTimeout(() => {
        setIsGenerating(false);
        setProgress(0);
        setStatusMessage('');
      }, 3000);
    }
  };

  /**
   * 轮询任务状态
   */
  const pollTaskStatus = async (taskId, maxAttempts = 120) => {
    let attempts = 0;
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    while (attempts < maxAttempts) {
      attempts++;
      
      // 更新进度 (20% -> 95%)
      const currentProgress = Math.min(20 + (attempts / maxAttempts) * 75, 95);
      setProgress(Math.floor(currentProgress));
      setStatusMessage(`正在生成视频... (${attempts}/${maxAttempts})`);

      try {
        const statusResponse = await fetch(`${API_BASE_URL}/api/video/status/${taskId}`);
        
        if (!statusResponse.ok) {
          throw new Error(`查询状态失败: ${statusResponse.status}`);
        }

        const statusData = await statusResponse.json();

        if (statusData.status === 'completed') {
          return statusData.videoUrl;
        } else if (statusData.status === 'failed') {
          throw new Error(statusData.error || '视频生成失败');
        }

        // 等待 3 秒后重试
        await new Promise(resolve => setTimeout(resolve, 6000));

      } catch (error) {
        console.error('查询状态出错:', error);
        throw error;
      }
    }

    throw new Error('生成超时,请稍后重试');
  };

  /**
   * 取消生成
   */
  const handleCancel = () => {
    if (window.confirm('确定要取消生成吗?')) {
      setIsGenerating(false);
      setProgress(0);
      setStatusMessage('');
    }
  };

  /**
   * 获取模型配置(临时函数,应该从 utils 导入)
   */
  const getModelConfig = (modelId) => {
    // 这里简化处理,实际应该导入 videoModels
    const configs = {
      'doubao-seedance-1-0-pro-250528': { minImages: 0 },
      'doubao-seedance-1-0-lite-i2v-250428': { minImages: 1 },
      'doubao-seedance-1-0-lite-t2v-250428': { minImages: 0 }
    };
    return configs[modelId] || { minImages: 0 };
  };

  return (
    <div className="video-generate-button">
      {!isGenerating ? (
        // 生成按钮
        <button
          className="btn-generate"
          onClick={handleGenerate}
        >
          <span className="btn-icon">🎬</span>
          <span className="btn-text">开始生成视频</span>
        </button>
      ) : (
        // 生成中状态
        <div className="generating-status">
          {/* 进度条 */}
          <div className="progress-bar-container">
            <div 
              className="progress-bar-fill"
              style={{ width: `${progress}%` }}
            >
              <span className="progress-text">{progress}%</span>
            </div>
          </div>

          {/* 状态消息 */}
          <div className="status-message">
            <span className="status-icon">🔄</span>
            <span className="status-text">{statusMessage}</span>
          </div>

          {/* 取消按钮 */}
          <button
            className="btn-cancel"
            onClick={handleCancel}
          >
            ✕ 取消生成
          </button>
        </div>
      )}

      {/* 提示信息 */}
      <div className="generate-hints">
        <p className="hint-item">
          💡 视频生成需要 10-30 秒,请耐心等待
        </p>
        <p className="hint-item">
          ⚠️ 生成期间请勿关闭页面或刷新浏览器
        </p>
      </div>
    </div>
  );
}

VideoGenerateButton.propTypes = {
  apiKey: PropTypes.string.isRequired,
  selectedModel: PropTypes.string.isRequired,
  images: PropTypes.array.isRequired,
  prompt: PropTypes.string.isRequired,
  params: PropTypes.shape({
    resolution: PropTypes.string.isRequired,
    duration: PropTypes.number.isRequired,
    ratio: PropTypes.string.isRequired
  }).isRequired,
  onGenerateStart: PropTypes.func,
  onGenerateComplete: PropTypes.func,
  onGenerateError: PropTypes.func
};

export default VideoGenerateButton;