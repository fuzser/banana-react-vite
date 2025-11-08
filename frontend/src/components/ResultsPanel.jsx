import { useState } from "react";
import PropTypes from "prop-types";

function ResultsPanel({
  images,
  progress,
  isGenerating,
  aspectRatio,
  temperature,
}) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageStates, setImageStates] = useState({});

  const copyBase64 = (base64, index) => {
    navigator.clipboard
      .writeText(base64)
      .then(() => {
        setImageStates((prev) => ({
          ...prev,
          [index]: "copied",
        }));
        setTimeout(() => {
          setImageStates((prev) => ({
            ...prev,
            [index]: null,
          }));
        }, 2000);
      })
      .catch((err) => {
        console.error("复制失败:", err);
        const textarea = document.createElement("textarea");
        textarea.value = base64;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        alert("✅ Base64 数据已复制到剪贴板！");
      });
  };

  const downloadImage = (url, index) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = `banana_${Date.now()}_${index + 1}.png`;
    link.click();
  };

  if (!isGenerating && images.length === 0 && progress.total === 0) {
    return null;
  }

  return (
    <div className="results-panel">
      {isGenerating && (
        <div className="progress-section">
          <h3 className="progress-title">
            🎨 正在并发生成 {progress.total} 张图片...
          </h3>
          <div className="progress-bar-container">
            <div
              className="progress-bar-fill"
              style={{
                width: `${(progress.completed / progress.total) * 100}%`,
              }}
            />
          </div>
          <div className="progress-text">
            已完成: {progress.completed}/{progress.total}
            (成功: {progress.success}，失败:{" "}
            {progress.completed - progress.success})
          </div>
          <p className="progress-hint">💡 图片生成完成后会立即显示</p>
        </div>
      )}

      {!isGenerating && images.length > 0 && (
        <div className="results-section">
          <div className="results-header">
            <h3 className="results-title">✅ 生成完成！</h3>
            <div className="results-meta">
              <span>
                成功 {progress.success}/{progress.total} 张
              </span>
              <span>分辨率 {aspectRatio}</span>
              <span>随机度 {temperature}</span>
            </div>
          </div>

          <div className="results-grid">
            {images.map((img, index) => (
              <div key={index} className="result-card">
                <div className="result-badge">#{index + 1}</div>
                <div
                  className="result-image-container"
                  onClick={() => setSelectedImage({ img, index })}
                >
                  <img
                    src={img.url}
                    alt={`Generated ${index + 1}`}
                    className="result-image"
                  />
                  <div className="result-overlay">
                    <span className="overlay-text">🔍 点击查看大图</span>
                  </div>
                </div>

                <div className="result-actions">
                  <a
                    href={img.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="result-btn result-btn-primary"
                  >
                    🔗 新标签打开
                  </a>
                  <button
                    type="button"
                    onClick={() => downloadImage(img.url, index)}
                    className="result-btn result-btn-secondary"
                  >
                    💾 下载
                  </button>
                  <button
                    type="button"
                    onClick={() => copyBase64(img.base64, index)}
                    className={`result-btn result-btn-secondary ${
                      imageStates[index] === "copied" ? "copied" : ""
                    }`}
                  >
                    {imageStates[index] === "copied"
                      ? "✅ 已复制"
                      : "📋 Base64"}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="batch-actions">
            <button
              type="button"
              onClick={() =>
                images.forEach((img, index) => downloadImage(img.url, index))
              }
              className="btn btn-secondary"
              disabled={images.length === 0}
            >
              💾 下载全部
            </button>
            <button
              type="button"
              onClick={() => {
                const allBase64 = images.map((img) => img.base64).join("\n\n");
                navigator.clipboard
                  .writeText(allBase64)
                  .then(() => alert("✅ 所有 Base64 数据已复制到剪贴板！"))
                  .catch((err) => {
                    console.error("复制失败:", err);
                    // 降级方案
                    const textarea = document.createElement("textarea");
                    textarea.value = allBase64;
                    textarea.style.position = "fixed";
                    textarea.style.opacity = "0";
                    document.body.appendChild(textarea);
                    textarea.select();
                    document.execCommand("copy");
                    document.body.removeChild(textarea);
                    alert("✅ 所有 Base64 数据已复制到剪贴板！");
                  });
              }}
              className="btn btn-secondary"
              disabled={images.length === 0}
            >
              📋 复制全部 Base64
            </button>
          </div>
        </div>
      )}

      {!isGenerating && images.length === 0 && progress.total > 0 && (
        <div className="results-error">
          <div className="error-icon">❌</div>
          <h3>全部生成失败</h3>
          <p>所有图片生成均失败，请检查 API Key 和网络连接</p>
          <div className="error-suggestions">
            <p>
              <strong>可能的原因：</strong>
            </p>
            <ul>
              <li>API Key 无效或已过期</li>
              <li>提示词被安全过滤器拦截</li>
              <li>网络连接问题</li>
              <li>服务器未启动</li>
            </ul>
          </div>
        </div>
      )}

      {selectedImage && (
        <div
          className="image-viewer-overlay"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="image-viewer-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="viewer-close"
              onClick={() => setSelectedImage(null)}
            >
              ✕
            </button>

            <div className="viewer-header">
              <h3>图片 #{selectedImage.index + 1}</h3>
            </div>

            <div className="viewer-image-container">
              <img
                src={selectedImage.img.url}
                alt={`Generated ${selectedImage.index + 1}`}
                className="viewer-image"
              />
            </div>

            <div className="viewer-actions">
              <a
                href={selectedImage.img.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                🔗 新标签打开
              </a>
              <button
                type="button"
                onClick={() =>
                  downloadImage(selectedImage.img.url, selectedImage.index)
                }
                className="btn btn-secondary"
              >
                💾 下载图片
              </button>
              <button
                type="button"
                onClick={() =>
                  copyBase64(selectedImage.img.base64, selectedImage.index)
                }
                className="btn btn-secondary"
              >
                📋 复制 Base64
              </button>
            </div>

            {images.length > 1 && (
              <div className="viewer-navigation">
                <button
                  type="button"
                  className="nav-btn nav-prev"
                  onClick={() => {
                    const newIndex =
                      selectedImage.index > 0
                        ? selectedImage.index - 1
                        : images.length - 1;
                    setSelectedImage({
                      img: images[newIndex],
                      index: newIndex,
                    });
                  }}
                >
                  {"<"} 上一张
                </button>
                <span className="nav-indicator">
                  {selectedImage.index + 1} / {images.length}
                </span>
                <button
                  type="button"
                  className="nav-btn nav-next"
                  onClick={() => {
                    const newIndex =
                      selectedImage.index < images.length - 1
                        ? selectedImage.index + 1
                        : 0;
                    setSelectedImage({
                      img: images[newIndex],
                      index: newIndex,
                    });
                  }}
                >
                  下一张 {">"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

ResultsPanel.propTypes = {
  images: PropTypes.arrayOf(
    PropTypes.shape({
      url: PropTypes.string.isRequired,
      base64: PropTypes.string.isRequired,
      revised_prompt: PropTypes.string,
    })
  ).isRequired,
  progress: PropTypes.shape({
    completed: PropTypes.number.isRequired,
    success: PropTypes.number.isRequired,
    total: PropTypes.number.isRequired,
  }).isRequired,
  isGenerating: PropTypes.bool.isRequired,
  aspectRatio: PropTypes.string.isRequired,
  temperature: PropTypes.number.isRequired,
};

export default ResultsPanel;
