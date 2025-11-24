/**
 * 视频生成页面
 * 集成所有视频相关组件
 */

import { useState, useEffect } from "react";
import { useVideoState } from "../hooks/useVideoState";
import { getModelConfig } from "../utils/videoModels";
import { addToVideoHistory } from "../utils/videoStorage";
import { saveVideoState, getVideoState } from "../utils/videoStorage";

// 导入组件
import VideoApiKeyInput from "../components/video/VideoApiKeyInput";
import VideoModelSelector from "../components/video/VideoModelSelector";
import VideoImageUpload from "../components/video/VideoImageUpload";
import VideoPromptInput from "../components/video/VideoPromptInput";
import VideoParamsPanel from "../components/video/VideoParamsPanel";
import VideoGenerateButton from "../components/video/VideoGenerateButton";
import VideoPlayer from "../components/video/VideoPlayer";

import "./VideoPage.css";

function VideoPage() {
  // ⭐ 使用持久化状态
  const [apiKey, setApiKey] = useVideoState("nano_banana_video_api_key", "");
  const [selectedModel, setSelectedModel] = useVideoState(
    "nano_banana_video_model",
    "doubao-seedance-1-0-pro-250528"
  );
  const [images, setImages] = useVideoState("nano_banana_video_images", []);
  const [prompt, setPrompt] = useVideoState("nano_banana_video_prompt", "");
  const [params, setParams] = useVideoState("nano_banana_video_params", {
    resolution: "1080p",
    duration: 10,
    ratio: "16:9",
  });

  // 临时状态(不持久化)
  const [currentVideoUrl, setCurrentVideoUrl] = useState("");
  const [currentVideoInfo, setCurrentVideoInfo] = useState(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  /**
   * 页面首次加载提示
   */
  useEffect(() => {
    if (isFirstLoad) {
      setIsFirstLoad(false);

      // 检查是否有恢复的状态
      const hasRestoredState = apiKey || prompt || images.length > 0;

      if (hasRestoredState) {
        const restoredItems = [];
        if (apiKey) restoredItems.push("API Key");
        if (prompt) restoredItems.push("提示词");
        if (images.length > 0) restoredItems.push(`${images.length}张图片`);

        console.log("✅ 已恢复上次的设置:", restoredItems.join(", "));
      }
    }
  }, []);

  // 在文件中找到任意一个 useEffect，或添加新的
  useEffect(() => {
    // 🧹 一次性清理：将旧的 localStorage 图片数据迁移到 sessionStorage
    const oldFiles = localStorage.getItem("banana_uploaded_files");
    const oldBase64 = localStorage.getItem("banana_uploaded_base64");

    if (oldFiles || oldBase64) {
      console.log("🔄 检测到旧的 localStorage 图片数据，正在清理...");

      // 如果 sessionStorage 为空，则迁移数据
      if (!sessionStorage.getItem("banana_uploaded_files") && oldFiles) {
        sessionStorage.setItem("banana_uploaded_files", oldFiles);
      }
      if (!sessionStorage.getItem("banana_uploaded_base64") && oldBase64) {
        sessionStorage.setItem("banana_uploaded_base64", oldBase64);
      }

      // 清理 localStorage
      localStorage.removeItem("banana_uploaded_files");
      localStorage.removeItem("banana_uploaded_base64");

      console.log("✅ 旧数据已迁移到 sessionStorage 并清理");
    }
  }, []); // 只在组件挂载时执行一次

  /**
   * 处理图片变化
   */
  const handleImagesChange = (newImages) => {
    const modelConfig = getModelConfig(selectedModel);

    // 确保不超过模型限制
    if (newImages.length > modelConfig.maxImages) {
      alert(`当前模型最多支持 ${modelConfig.maxImages} 张图片`);
      return;
    }

    setImages(newImages);
  };

  /**
   * 处理模型变化
   */
  const handleModelChange = (newModel) => {
    setSelectedModel(newModel);

    // 模型变化会在 VideoImageUpload 组件中自动处理图片调整
  };

  /**
   * 处理参数变化
   */
  const handleParamsChange = (newParams) => {
    setParams(newParams);
  };

  /**
   * 处理生成开始
   */
  const handleGenerateStart = () => {
    console.log("开始生成视频...");
    setShowPlayer(false);
    setCurrentVideoUrl("");
    setCurrentVideoInfo(null);
  };

  /**
   * 处理生成完成
   */
  const handleGenerateComplete = (result) => {
    console.log("视频生成完成:", result);

    // 设置视频信息
    setCurrentVideoUrl(result.videoUrl);
    setCurrentVideoInfo({
      prompt: result.prompt,
      model: result.model,
      params: result.params,
      timestamp: result.timestamp,
    });
    setShowPlayer(true);

    // 保存到历史记录
    addToVideoHistory({
      id: result.taskId || Date.now().toString(),
      videoUrl: result.videoUrl,
      prompt: result.prompt,
      model: result.model,
      images: result.images.map((img) => ({
        role: img.role,
        fileName: img.fileName,
        // 注意: 不保存 base64,节省空间
      })),
      params: result.params,
      timestamp: result.timestamp,
      createdAt: new Date(result.timestamp).toLocaleString("zh-CN"),
    });

    // 成功提示
    setTimeout(() => {
      alert("🎉 视频生成成功!");
    }, 500);
  };

  /**
   * 处理生成失败
   */
  const handleGenerateError = (error) => {
    console.error("视频生成失败:", error);
    alert(`❌ 视频生成失败: ${error.message}`);
  };

  /**
   * 关闭播放器
   */
  const handleClosePlayer = () => {
    if (window.confirm("确定要关闭播放器吗?")) {
      setShowPlayer(false);
    }
  };

  /**
   * 滚动到播放器
   */
  useEffect(() => {
    if (showPlayer) {
      // 延迟滚动,等待 DOM 更新
      setTimeout(() => {
        const playerElement = document.querySelector(".video-player");
        if (playerElement) {
          playerElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }, 100);
    }
  }, [showPlayer]);

  return (
    <div className="page-container">
      <div className="container">
        {/* 图片上传 */}
        <section className="section">
          <VideoImageUpload
            images={images}
            onChange={handleImagesChange}
            selectedModel={selectedModel}
          />
        </section>

        {/* 提示词输入 */}
        <section className="section">
          <VideoPromptInput value={prompt} onChange={setPrompt} />
        </section>

        {/* 生成按钮 */}
        <section className="section">
          <VideoGenerateButton
            apiKey={apiKey}
            selectedModel={selectedModel}
            images={images}
            prompt={prompt}
            params={params}
            onGenerateStart={handleGenerateStart}
            onGenerateComplete={handleGenerateComplete}
            onGenerateError={handleGenerateError}
          />
        </section>

        {/* 视频播放器 */}
        {showPlayer && currentVideoUrl && (
          <section className="section">
            <VideoPlayer
              videoUrl={currentVideoUrl}
              videoInfo={currentVideoInfo}
              onClose={handleClosePlayer}
            />
          </section>
        )}

        {/* 参数设置 */}
        <section className="section">
          <VideoParamsPanel
            params={params}
            onChange={handleParamsChange}
            selectedModel={selectedModel}
          />
        </section>

        {/* 模型选择 */}
        <section className="section">
          <VideoModelSelector
            value={selectedModel}
            onChange={handleModelChange}
          />
        </section>

        {/* API Key 输入 */}
        <section className="section">
          <VideoApiKeyInput value={apiKey} onChange={setApiKey} />
        </section>
      </div>
    </div>
  );
}

export default VideoPage;
