/**
 * 视频 API Key 输入组件
 * 支持显示/隐藏、验证、保存到本地存储
 */

import { useState } from 'react';
import PropTypes from 'prop-types';
import './VideoApiKeyInput.css';

function VideoApiKeyInput({ value, onChange }) {
  const [showApiKey, setShowApiKey] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState(''); // 'success' | 'error' | ''

  /**
   * 切换显示/隐藏 API Key
   */
  const handleToggleVisibility = () => {
    setShowApiKey(!showApiKey);
  };

  /**
   * 保存 API Key
   */
  const handleSave = () => {
    if (!value.trim()) {
      alert('请输入 API Key');
      return;
    }
    
    // API Key 已经通过 useVideoState 自动保存
    alert('✅ API Key 已保存到本地');
  };

  /**
   * 验证 API Key
   * 这里简单验证格式,实际可以调用后端 API 验证
   */
  const handleVerify = async () => {
    if (!value.trim()) {
      alert('请先输入 API Key');
      return;
    }

    setIsVerifying(true);
    setVerifyStatus('');

    try {
      // 简单格式验证
      if (value.length < 20) {
        throw new Error('API Key 格式不正确(长度过短)');
      }

      // TODO: 实际项目中应该调用后端 API 验证
      // const response = await fetch('/api/video/verify-key', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ apiKey: value })
      // });
      // const data = await response.json();
      // if (data.valid) { ... }

      // 模拟验证延迟
      await new Promise(resolve => setTimeout(resolve, 1000));

      setVerifyStatus('success');
      alert('✅ API Key 验证成功');
    } catch (error) {
      setVerifyStatus('error');
      alert(`❌ API Key 验证失败: ${error.message}`);
    } finally {
      setIsVerifying(false);
    }
  };

  /**
   * 清除 API Key
   */
  const handleClear = () => {
    if (window.confirm('确定要清除 API Key 吗?')) {
      onChange('');
      setVerifyStatus('');
      alert('✅ 已清除 API Key');
    }
  };

  /**
   * 获取状态提示文本
   */
  const getStatusText = () => {
    if (!value.trim()) return '未设置';
    if (verifyStatus === 'success') return '✅ 已验证';
    if (verifyStatus === 'error') return '❌ 验证失败';
    return '已保存 (未验证)';
  };

  /**
   * 获取状态样式类名
   */
  const getStatusClass = () => {
    if (!value.trim()) return 'status-empty';
    if (verifyStatus === 'success') return 'status-success';
    if (verifyStatus === 'error') return 'status-error';
    return 'status-saved';
  };

  return (
    <div className="video-api-key-input">
      <div className="api-key-header">
        <h3>🔑 Doubao API Key</h3>
        <div className={`api-key-status ${getStatusClass()}`}>
          状态: {getStatusText()}
        </div>
      </div>

      {/* API Key 输入框 */}
      <div className="api-key-input-wrapper">
        <input
          type={showApiKey ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="请输入豆包 Seedance API Key"
          className="api-key-input"
        />
        <button
          type="button"
          className="btn-toggle-visibility"
          onClick={handleToggleVisibility}
          title={showApiKey ? '隐藏' : '显示'}
        >
          {showApiKey ? '👁️' : '👁️‍🗨️'}
        </button>
      </div>

      {/* 操作按钮 */}
      <div className="api-key-actions">
        <button
          className="btn-primary"
          onClick={handleSave}
          disabled={!value.trim()}
        >
          💾 保存
        </button>
        <button
          className="btn-secondary"
          onClick={handleVerify}
          disabled={!value.trim() || isVerifying}
        >
          {isVerifying ? '🔄 验证中...' : '🔍 验证'}
        </button>
        <button
          className="btn-danger"
          onClick={handleClear}
          disabled={!value.trim()}
        >
          🗑️ 清除
        </button>
      </div>

      {/* 提示信息 */}
      <div className="api-key-hints">
        <p className="hint-item">
          💡 API Key 将保存在浏览器本地,不会上传到服务器
        </p>
        <p className="hint-item">
          📝 获取 API Key: 
          <a 
            href="https://console.volcengine.com/ark" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hint-link"
          >
            火山引擎控制台
          </a>
        </p>
      </div>
    </div>
  );
}

VideoApiKeyInput.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired
};

export default VideoApiKeyInput;