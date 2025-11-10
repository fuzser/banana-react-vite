import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../App.css";
import { getAllHistory, deleteHistory, clearAllHistory } from "../utils/db.js";
import Footer from "../components/Footer";
import Header from "../components/Header";

function GalleryPage() {
  const [history, setHistory] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [filter, setFilter] = useState("all");

  // 加载 IndexedDB 历史记录
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const records = await getAllHistory();
      setHistory(records);
    } catch (err) {
      console.error("⚠️ 读取历史记录失败:", err);
    }
  };

  // 删除单条记录
  const handleDeleteRecord = async (id) => {
    if (!confirm("确定要删除这条记录吗？")) return;

    try {
      await deleteHistory(id);
      setHistory((prev) => prev.filter((r) => r.id !== id));
      if (selectedRecord?.id === id) setSelectedRecord(null);
    } catch (err) {
      console.error("删除失败:", err);
    }
  };

  // 清空所有历史记录
  const handleClearAll = async () => {
    if (!confirm("确定要清空所有历史记录吗？此操作不可恢复！")) return;

    try {
      await clearAllHistory();
      setHistory([]);
      setSelectedRecord(null);
    } catch (err) {
      console.error("清空失败:", err);
    }
  };

  // 导出图片
  const handleExportImages = (record) => {
    record.images.forEach((img, index) => {
      const link = document.createElement("a");
      link.href = img.url || img.base64;
      link.download = `banana_${record.id}_${index + 1}.png`;
      link.click();
    });
  };

  // 复制提示词
  const handleCopyPrompt = (prompt) => {
    navigator.clipboard
      .writeText(prompt)
      .then(() => alert("✅ 提示词已复制到剪贴板！"))
      .catch((err) => console.error("复制失败:", err));
  };

  // 时间过滤
  const getFilteredHistory = () => {
    if (filter === "all") return history;

    const now = new Date();
    return history.filter((record) => {
      const recordDate = new Date(record.timestamp);
      const diffDays = (now - recordDate) / (1000 * 60 * 60 * 24);
      switch (filter) {
        case "today":
          return diffDays < 1;
        case "week":
          return diffDays < 7;
        case "month":
          return diffDays < 30;
        default:
          return true;
      }
    });
  };

  // 格式化时间
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const diff = Date.now() - date.getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return "刚刚";
    if (mins < 60) return `${mins} 分钟前`;
    if (hours < 24) return `${hours} 小时前`;
    if (days < 7) return `${days} 天前`;
    return date.toLocaleString("zh-CN", { hour12: false });
  };

  const filteredHistory = getFilteredHistory();

  return (
    <div className="page-container">
      <div className="container">
        <nav className="nav-bar">
          <Link to="/" className="nav-link">
            🎨 生成
          </Link>
          <Link to="/gallery" className="nav-link active">
            🖼️ 画廊
          </Link>
          <Link to="/settings" className="nav-link">
            ⚙️ 设置
          </Link>
        </nav>
        <Header />

        <div className="gallery-header">
          <h1>🖼️ 生成历史</h1>
          <p className="subtitle">共 {history.length} 条记录</p>
        </div>

        <div className="gallery-toolbar">
          <div className="filter-buttons">
            {["all", "today", "week", "month"].map((type) => (
              <button
                key={type}
                className={`filter-btn ${filter === type ? "active" : ""}`}
                onClick={() => setFilter(type)}
              >
                {type === "all"
                  ? "全部"
                  : type === "today"
                  ? "今天"
                  : type === "week"
                  ? "本周"
                  : "本月"}
              </button>
            ))}
          </div>
          {history.length > 0 && (
            <button className="btn-danger-small" onClick={handleClearAll}>
              🗑️ 清空全部
            </button>
          )}
        </div>

        {filteredHistory.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎨</div>
            <h3>还没有生成记录</h3>
            <p>去首页生成你的第一张 AI 图片吧！</p>
            <Link to="/" className="btn-primary">
              开始创作 →
            </Link>
          </div>
        ) : (
          <div className="gallery-grid">
            {filteredHistory.map((record) => (
              <div
                key={record.id}
                className="gallery-card"
                onClick={() => setSelectedRecord(record)}
              >
                <div className="gallery-card-preview">
                  {record.images?.map((img, i) => (
                    <img
                      key={i}
                      src={img.url || img.base64}
                      alt={`Generated ${i + 1}`}
                      className="gallery-preview-img"
                    />
                  ))}
                  <div className="gallery-card-overlay">
                    <span className="image-count-badge">
                      {record.images?.length || 0} 张图片
                    </span>
                  </div>
                </div>

                <div className="gallery-card-info">
                  <div className="gallery-card-prompt">
                    {record.prompt.length > 60
                      ? record.prompt.substring(0, 60) + "..."
                      : record.prompt}
                  </div>

                  <div className="gallery-card-meta">
                    <span className="meta-time">
                      {formatTime(record.timestamp)}
                    </span>
                    <span className="meta-params">
                      {record.params.aspectRatio} · T:
                      {record.params.temperature}
                    </span>
                  </div>

                  <div className="gallery-card-actions">
                    <button
                      className="card-action-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyPrompt(record.prompt);
                      }}
                    >
                      📋
                    </button>
                    <button
                      className="card-action-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExportImages(record);
                      }}
                    >
                      💾
                    </button>
                    <button
                      className="card-action-btn danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteRecord(record.id);
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedRecord && (
          <div
            className="modal-overlay"
            onClick={() => setSelectedRecord(null)}
          >
            <div
              className="modal-content gallery-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="modal-close"
                onClick={() => setSelectedRecord(null)}
              >
                ✕
              </button>

              <h2>生成详情</h2>
              <div className="modal-section">
                <h3>📝 提示词</h3>
                <div className="prompt-display">{selectedRecord.prompt}</div>
                <button
                  className="btn-secondary-small"
                  onClick={() => handleCopyPrompt(selectedRecord.prompt)}
                >
                  📋 复制提示词
                </button>
              </div>

              <div className="modal-section">
                <h3>⚙️ 生成参数</h3>
                <div className="params-display">
                  {Object.entries(selectedRecord.params).map(([key, val]) => (
                    <div key={key} className="param-item-display">
                      <span className="param-label">{key}:</span>
                      <span className="param-value">{val}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="modal-section">
                <h3>🖼️ 生成结果 ({selectedRecord.images.length} 张)</h3>
                <div className="modal-images-grid">
                  {selectedRecord.images.map((img, i) => (
                    <div key={i} className="modal-image-item">
                      <img
                        src={img.url || img.base64}
                        alt={`Generated ${i + 1}`}
                      />
                      <div className="modal-image-actions">
                        <a
                          href={img.url || img.base64}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-secondary-small"
                        >
                          🔍 查看
                        </a>
                        <button
                          className="btn-secondary-small"
                          onClick={() => {
                            navigator.clipboard.writeText(
                              img.base64 || img.url
                            );
                            alert("✅ 已复制 Base64 链接！");
                          }}
                        >
                          📋 Base64
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="modal-actions">
                <button
                  className="btn-primary"
                  onClick={() => handleExportImages(selectedRecord)}
                >
                  💾 导出所有图片
                </button>
                <button
                  className="btn-danger"
                  onClick={() => {
                    handleDeleteRecord(selectedRecord.id);
                    setSelectedRecord(null);
                  }}
                >
                  🗑️ 删除记录
                </button>
              </div>
            </div>
          </div>
        )}
      <Footer />
      </div>
    </div>
  );
}

export default GalleryPage;
