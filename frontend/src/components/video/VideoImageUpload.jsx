/**
 * 视频图片上传组件
 * 支持智能首尾帧识别和手动切换
 */

import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getModelConfig, IMAGE_ROLES, getRoleLabel, getRoleClass } from '../../utils/videoModels';
import './VideoImageUpload.css';

function VideoImageUpload({ 
  images = [],        // 图片数组 [{ id, base64, role, fileName }]
  onChange,           // 图片变化回调
  selectedModel       // 当前选择的模型
}) {
  const [dragOver, setDragOver] = useState(false);
  const modelConfig = getModelConfig(selectedModel);
  
  /**
   * 当模型变化时,自动调整图片数量和角色
   */
  useEffect(() => {
    if (images.length > modelConfig.maxImages) {
      // 如果当前图片数超过新模型限制,自动删除多余的
      const trimmedImages = images.slice(0, modelConfig.maxImages);
      onChange(reassignRoles(trimmedImages, modelConfig));
      
      if (modelConfig.maxImages === 0) {
        alert(`已切换到 ${modelConfig.name},该模型不支持图片上传`);
      } else {
        alert(`已切换到 ${modelConfig.name},自动保留前 ${modelConfig.maxImages} 张图片`);
      }
    } else if (images.length > 0) {
      // 重新分配角色
      onChange(reassignRoles(images, modelConfig));
    }
  }, [selectedModel]);

  /**
   * 根据模型配置自动分配图片角色
   * @param {Array} imageList - 图片列表
   * @param {Object} config - 模型配置
   * @returns {Array} 重新分配角色后的图片列表
   */
  const reassignRoles = (imageList, config) => {
    if (!config.supportsFirstLastFrame) {
      // 不支持首尾帧的模型,所有图片标记为 reference
      return imageList.map(img => ({ ...img, role: IMAGE_ROLES.REFERENCE }));
    }

    // 支持首尾帧:第一张=首帧,第二张=尾帧
    return imageList.map((img, index) => ({
      ...img,
      role: index === 0 ? IMAGE_ROLES.FIRST_FRAME : IMAGE_ROLES.LAST_FRAME
    }));
  };

  /**
   * 处理文件选择
   * @param {FileList} files - 选择的文件列表
   */
  const handleFileSelect = (files) => {
    const fileArray = Array.from(files);
    const remainingSlots = modelConfig.maxImages - images.length;
    
    if (remainingSlots <= 0) {
      alert(`当前模型 ${modelConfig.name} 最多支持 ${modelConfig.maxImages} 张图片`);
      return;
    }

    const filesToProcess = fileArray.slice(0, remainingSlots);
    
    filesToProcess.forEach(file => {
      if (!file.type.startsWith('image/')) {
        alert(`文件 ${file.name} 不是图片格式`);
        return;
      }

      // 检查文件大小(限制为5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        alert(`文件 ${file.name} 过大(超过5MB),请选择较小的图片`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const newImage = {
          id: Date.now() + Math.random(),
          base64: e.target.result,
          fileName: file.name,
          role: IMAGE_ROLES.REFERENCE  // 先标记为普通,后面会自动分配
        };

        const updatedImages = [...images, newImage];
        onChange(reassignRoles(updatedImages, modelConfig));
      };
      reader.readAsDataURL(file);
    });
  };

  /**
   * 处理拖拽上传
   */
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  /**
   * 删除图片
   * @param {string} imageId - 图片ID
   */
  const handleRemoveImage = (imageId) => {
    const updatedImages = images.filter(img => img.id !== imageId);
    onChange(reassignRoles(updatedImages, modelConfig));
  };

  /**
   * 手动切换图片角色(首帧 ↔ 尾帧)
   * @param {string} imageId - 图片ID
   */
  const handleToggleRole = (imageId) => {
    if (!modelConfig.supportsFirstLastFrame || images.length !== 2) {
      return;  // 只有支持首尾帧且有2张图时才能切换
    }

    const updatedImages = images.map(img => {
      if (img.id === imageId) {
        // 切换当前图片的角色
        return {
          ...img,
          role: img.role === IMAGE_ROLES.FIRST_FRAME 
            ? IMAGE_ROLES.LAST_FRAME 
            : IMAGE_ROLES.FIRST_FRAME
        };
      } else {
        // 另一张图片自动切换到相反角色
        return {
          ...img,
          role: img.role === IMAGE_ROLES.FIRST_FRAME 
            ? IMAGE_ROLES.LAST_FRAME 
            : IMAGE_ROLES.FIRST_FRAME
        };
      }
    });

    onChange(updatedImages);
  };

  /**
   * 清空所有图片
   */
  const handleClearAll = () => {
    if (images.length === 0) return;
    
    if (window.confirm('确定要清空所有图片吗?')) {
      onChange([]);
    }
  };

  return (
    <div className="video-image-upload">
      <div className="upload-header">
        <h3>📸 参考图片上传</h3>
        <div className="model-info">
          <span className="info-label">当前模型:</span>
          <span className="info-value">{modelConfig.name}</span>
          <span className="info-limit">
            ({images.length}/{modelConfig.maxImages} 张)
          </span>
        </div>
        {images.length > 0 && (
          <button 
            className="btn-clear-all"
            onClick={handleClearAll}
            title="清空所有图片"
          >
            🗑️ 清空
          </button>
        )}
      </div>

      {modelConfig.maxImages > 0 ? (
        <>
          {/* 上传区域 */}
          {images.length < modelConfig.maxImages && (
            <div
              className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById('video-file-input').click()}
            >
              <div className="upload-icon">📤</div>
              <p className="upload-text">
                {modelConfig.supportsFirstLastFrame 
                  ? '拖拽或点击上传图片 (支持首尾帧控制)' 
                  : '拖拽或点击上传图片'}
              </p>
              <p className="upload-hint">
                支持 JPG、PNG、WebP 格式,最大 5MB
              </p>
              {modelConfig.supportsFirstLastFrame && (
                <p className="upload-hint-feature">
                  💡 第一张图片将作为首帧,第二张作为尾帧
                </p>
              )}
            </div>
          )}

          <input
            id="video-file-input"
            type="file"
            accept="image/*"
            multiple={modelConfig.maxImages > 1}
            onChange={(e) => handleFileSelect(e.target.files)}
            style={{ display: 'none' }}
          />

          {/* 图片预览列表 */}
          {images.length > 0 && (
            <div className="images-preview-list">
              {images.map((image, index) => (
                <div 
                  key={image.id} 
                  className={`image-preview-item ${getRoleClass(image.role)}`}
                >
                  {/* 角色标签 */}
                  <div className="image-role-badge">
                    {getRoleLabel(image.role)}
                  </div>

                  {/* 图片预览 */}
                  <div className="image-preview-wrapper">
                    <img 
                      src={image.base64} 
                      alt={image.fileName}
                      className="image-preview"
                    />
                  </div>

                  {/* 图片信息 */}
                  <div className="image-info">
                    <p className="image-filename" title={image.fileName}>
                      {image.fileName}
                    </p>
                    <p className="image-order">
                      顺序: 第 {index + 1} 张
                    </p>
                  </div>

                  {/* 操作按钮 */}
                  <div className="image-actions">
                    {/* 切换角色按钮(仅支持首尾帧且有2张图时显示) */}
                    {modelConfig.supportsFirstLastFrame && images.length === 2 && (
                      <button
                        className="btn-toggle-role"
                        onClick={() => handleToggleRole(image.id)}
                        title={`切换为${image.role === IMAGE_ROLES.FIRST_FRAME ? '尾帧' : '首帧'}`}
                      >
                        🔄 切换为{image.role === IMAGE_ROLES.FIRST_FRAME ? '尾帧' : '首帧'}
                      </button>
                    )}

                    {/* 删除按钮 */}
                    <button
                      className="btn-remove-image"
                      onClick={() => handleRemoveImage(image.id)}
                      title="删除图片"
                    >
                      🗑️ 删除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 提示信息 */}
          {modelConfig.supportsFirstLastFrame && images.length === 1 && (
            <div className="upload-tip">
              💡 再上传一张图片即可使用首尾帧功能
            </div>
          )}
        </>
      ) : (
        // 不支持图片的模型
        <div className="upload-disabled">
          <p className="disabled-text">
            ⚠️ 当前模型 <strong>{modelConfig.name}</strong> 不支持图片上传
          </p>
          <p className="disabled-hint">
            该模型仅支持纯文本生成视频
          </p>
        </div>
      )}
    </div>
  );
}

VideoImageUpload.propTypes = {
  images: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    base64: PropTypes.string.isRequired,
    role: PropTypes.string.isRequired,
    fileName: PropTypes.string.isRequired
  })),
  onChange: PropTypes.func.isRequired,
  selectedModel: PropTypes.string.isRequired
};

export default VideoImageUpload;