/**
 * 视频播放器组件
 * 支持全屏播放、下载、画中画
 */

import { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import './VideoPlayer.css';

function VideoPlayer({ 
  videoUrl, 
  videoInfo = {},  // { prompt, model, timestamp, etc. }
  onClose 
}) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  /**
   * 播放/暂停切换
   */
  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  /**
   * 全屏播放
   */
  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      } else if (videoRef.current.webkitRequestFullscreen) {
        videoRef.current.webkitRequestFullscreen();
      } else if (videoRef.current.mozRequestFullScreen) {
        videoRef.current.mozRequestFullScreen();
      } else if (videoRef.current.msRequestFullscreen) {
        videoRef.current.msRequestFullscreen();
      }
    }
  };

  /**
   * 画中画模式
   */
  const handlePictureInPicture = async () => {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (videoRef.current) {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (error) {
      console.error('画中画模式失败:', error);
      alert('浏览器不支持画中画模式');
    }
  };

  /**
   * 下载视频
   */
  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = videoUrl;
    a.download = `video-${videoInfo.timestamp || Date.now()}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  /**
   * 处理时间更新
   */
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  /**
   * 处理视频加载完成
   */
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  /**
   * 处理进度条拖动
   */
  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  /**
   * 处理音量调整
   */
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }

    if (newVolume === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };

  /**
   * 切换静音
   */
  const handleToggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  /**
   * 格式化时间
   */
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  /**
   * 获取进度百分比
   */
  const getProgressPercent = () => {
    if (!duration) return 0;
    return (currentTime / duration) * 100;
  };

  return (
    <div className="video-player">
      {/* 视频信息头部 */}
      <div className="player-header">
        <h3>🎬 生成的视频</h3>
        {onClose && (
          <button 
            className="btn-close-player"
            onClick={onClose}
            title="关闭播放器"
          >
            ✕
          </button>
        )}
      </div>

      {/* 视频元素 */}
      <div className="video-container">
        <video
          ref={videoRef}
          src={videoUrl}
          className="video-element"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onClick={handlePlayPause}
        />
      </div>

      {/* 控制栏 */}
      <div className="player-controls">
        {/* 进度条 */}
        <div className="progress-container" onClick={handleSeek}>
          <div className="progress-track">
            <div 
              className="progress-filled"
              style={{ width: `${getProgressPercent()}%` }}
            />
          </div>
        </div>

        {/* 控制按钮 */}
        <div className="controls-row">
          {/* 左侧: 播放/暂停 + 时间 */}
          <div className="controls-left">
            <button
              className="control-btn"
              onClick={handlePlayPause}
              title={isPlaying ? '暂停' : '播放'}
            >
              {isPlaying ? '⏸️' : '▶️'}
            </button>

            <div className="time-display">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          {/* 右侧: 音量 + 功能按钮 */}
          <div className="controls-right">
            {/* 音量控制 */}
            <div className="volume-control">
              <button
                className="control-btn"
                onClick={handleToggleMute}
                title={isMuted ? '取消静音' : '静音'}
              >
                {isMuted ? '🔇' : volume > 0.5 ? '🔊' : '🔉'}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="volume-slider"
              />
            </div>

            {/* 画中画 */}
            <button
              className="control-btn"
              onClick={handlePictureInPicture}
              title="画中画"
            >
              📺
            </button>

            {/* 全屏 */}
            <button
              className="control-btn"
              onClick={handleFullscreen}
              title="全屏"
            >
              🖥️
            </button>

            {/* 下载 */}
            <button
              className="control-btn btn-download"
              onClick={handleDownload}
              title="下载视频"
            >
              💾 下载
            </button>
          </div>
        </div>
      </div>

      {/* 视频信息 */}
      {videoInfo && Object.keys(videoInfo).length > 0 && (
        <div className="video-info">
          {videoInfo.prompt && (
            <div className="info-item">
              <span className="info-label">📝 提示词:</span>
              <span className="info-value">{videoInfo.prompt}</span>
            </div>
          )}
          {videoInfo.model && (
            <div className="info-item">
              <span className="info-label">🤖 模型:</span>
              <span className="info-value">{videoInfo.model}</span>
            </div>
          )}
          {videoInfo.params && (
            <div className="info-item">
              <span className="info-label">⚙️ 参数:</span>
              <span className="info-value">
                {videoInfo.params.resolution} / {videoInfo.params.duration}秒 / {videoInfo.params.ratio}
              </span>
            </div>
          )}
          {videoInfo.timestamp && (
            <div className="info-item">
              <span className="info-label">🕐 生成时间:</span>
              <span className="info-value">
                {new Date(videoInfo.timestamp).toLocaleString('zh-CN')}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

VideoPlayer.propTypes = {
  videoUrl: PropTypes.string.isRequired,
  videoInfo: PropTypes.shape({
    prompt: PropTypes.string,
    model: PropTypes.string,
    params: PropTypes.object,
    timestamp: PropTypes.number
  }),
  onClose: PropTypes.func
};

export default VideoPlayer;