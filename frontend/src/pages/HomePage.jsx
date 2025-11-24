import { useState, useEffect } from "react";
import ApiKeyInput from "../components/ApiKeyInput";
import ImageUpload from "../components/ImageUpload";
import PromptInput from "../components/PromptInput";
import ParamsPanel from "../components/ParamsPanel";
import GenerateButton from "../components/ImageGenerateButton";
import ResultsPanel from "../components/ResultsPanel";
import { saveHistory, getAllHistory } from "../utils/db.js";
import {
  saveToSession,
  getFromSession,
  removeFromSession,
} from "../utils/sessionStorage";

function HomePage() {
  // ===== 状态管理 =====
  const [apiKey, setApiKey] = useState(
    () => localStorage.getItem("banana_api_key") || ""
  );
  const [uploadedFiles, setUploadedFiles] = useState(() => {
    // ✅ 从 sessionStorage 读取（标签页内有效）
    return getFromSession("banana_uploaded_files", []);
  });
  const [uploadedBase64, setUploadedBase64] = useState(() => {
    // ✅ 从 sessionStorage 读取（标签页内有效）
    return getFromSession("banana_uploaded_base64", []);
  });
  const [prompt, setPrompt] = useState(() => {
    return localStorage.getItem("banana_prompt") || "";
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState([]);
  const savedParams = JSON.parse(
    localStorage.getItem("banana_default_params") || "{}"
  );
  const [aspectRatio, setAspectRatio] = useState(
    savedParams.aspectRatio || "1:1"
  );
  const [numImages, setNumImages] = useState(savedParams.numImages || 4);
  const [temperature, setTemperature] = useState(
    savedParams.temperature || 1.0
  );
  const [generationProgress, setGenerationProgress] = useState({
    completed: 0,
    success: 0,
    total: 0,
  });

  // ===== 自动保存到 localStorage =====
  useEffect(() => {
    localStorage.setItem("banana_prompt", prompt);
  }, [prompt]);

  // ===== 从 IndexedDB 加载最新生成的图片 =====
  useEffect(() => {
    const loadLatestImages = async () => {
      try {
        const history = await getAllHistory();
        if (history.length > 0) {
          const latestRecord = history[0]; // getAllHistory 已按时间倒序排列
          setGeneratedImages(latestRecord.images);
          console.log(
            "✅ 已加载最新历史记录，图片数量:",
            latestRecord.images.length
          );
        }
      } catch (err) {
        console.error("⚠️ 加载历史记录失败:", err);
      }
    };

    loadLatestImages();
  }, []); // 空依赖数组，只在组件挂载时执行一次

  // ===== 处理函数 =====
  const handleApiKeyChange = (newKey) => {
    setApiKey(newKey);
    localStorage.setItem("banana_api_key", newKey);
  };

  const handleUploadSuccess = (files) => {
    // ✅ 步骤1: 先追加到状态（保持原有逻辑）
    const newUploadedFiles = [...uploadedFiles, ...files];
    const newUploadedBase64 = [
      ...uploadedBase64,
      ...files.map((f) => f.base64),
    ];

    setUploadedFiles(newUploadedFiles);
    setUploadedBase64(newUploadedBase64);

    // ✅ 步骤2: 清空 sessionStorage（替换 localStorage）
    removeFromSession("banana_uploaded_files");
    removeFromSession("banana_uploaded_base64");

    // ✅ 步骤3: 保存所有当前图片到 sessionStorage
    const savedFiles = saveToSession("banana_uploaded_files", newUploadedFiles);
    const savedBase64 = saveToSession(
      "banana_uploaded_base64",
      newUploadedBase64
    );

    console.log(
      `✅ 已上传 ${files.length} 张新图片，当前共 ${newUploadedFiles.length} 张图片`
    );

    if (savedFiles && savedBase64) {
      console.log(
        `💾 已保存 ${newUploadedFiles.length} 张图片到 sessionStorage (标签页内有效)`
      );
    } else {
      console.warn("⚠️ 图片状态保存失败，刷新页面后需要重新上传");
    }
  };

  const handleRemoveImage = (index) => {
    // ✅ 步骤1: 过滤掉指定图片
    const newUploadedFiles = uploadedFiles.filter((_, i) => i !== index);
    const newUploadedBase64 = uploadedBase64.filter((_, i) => i !== index);

    setUploadedFiles(newUploadedFiles);
    setUploadedBase64(newUploadedBase64);

    // ✅ 步骤2: 清空 sessionStorage
    removeFromSession("banana_uploaded_files");
    removeFromSession("banana_uploaded_base64");

    // ✅ 步骤3: 如果还有图片，重新保存；否则保持清空状态
    if (newUploadedFiles.length > 0) {
      saveToSession("banana_uploaded_files", newUploadedFiles);
      saveToSession("banana_uploaded_base64", newUploadedBase64);
      console.log(
        `💾 已重新保存 ${newUploadedFiles.length} 张图片到 sessionStorage`
      );
    } else {
      console.log(`💾 已清空 sessionStorage（无图片）`);
    }
  };

  const handleClearImages = () => {
    setUploadedFiles([]);
    setUploadedBase64([]);

    // ✅ 完全移除 sessionStorage 键
    removeFromSession("banana_uploaded_files");
    removeFromSession("banana_uploaded_base64");

    console.log("✅ 已清空所有图片并清除 sessionStorage");
  };

  // 生成完成回调
  const handleGenerateComplete = async (images) => {
    setIsGenerating(false);
    setGeneratedImages(images);

    if (images.length > 0) {
      const record = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        prompt,
        images,
        params: {
          aspectRatio,
          numImages,
          temperature,
          referenceCount: uploadedFiles.length,
        },
      };

      try {
        // ✅ 智能保存，自动处理空间不足问题
        const result = await saveHistory(record);

        if (result.success) {
          if (result.deleted > 0) {
            console.log(
              `✅ 保存成功！已自动清理 ${result.deleted} 条旧记录以腾出空间`
            );
          }
        } else {
          // 保存失败，详细提示用户
          console.error("❌ 保存失败:", result.error);

          let alertMessage = `保存失败：${result.error}`;

          if (result.details) {
            alertMessage += `\n\n详细信息：`;
            if (result.details.recordSize) {
              alertMessage += `\n• 本次生成大小: ${result.details.recordSize}`;
            }
            if (result.details.maxAllowed) {
              alertMessage += `\n• 最大允许大小: ${result.details.maxAllowed}`;
            }
            if (result.details.deletedRecords !== undefined) {
              alertMessage += `\n• 已尝试删除: ${result.details.deletedRecords} 条旧记录`;
            }
            if (result.details.suggestion) {
              alertMessage += `\n\n💡 ${result.details.suggestion}`;
            }
          }

          alert(alertMessage);
        }
      } catch (err) {
        console.error("⚠️ 保存历史记录异常:", err);
        alert("保存历史记录时发生未知错误，请查看控制台");
      }
    }
  };

  const handleProgressUpdate = (progress) => {
    setGenerationProgress(progress);
  };

  const handleResetGeneration = () => {
    setGeneratedImages([]);
    setGenerationProgress({ completed: 0, success: 0, total: numImages });
  };

  return (
    <div className="page-container">
      <div className="container">
        {/*         <Header /> */}

        <div className="section">
          <ImageUpload
            uploadedFiles={uploadedFiles}
            onUploadSuccess={handleUploadSuccess}
            onRemoveImage={handleRemoveImage}
            onClearImages={handleClearImages}
          />
        </div>

        <div className="section">
          <PromptInput value={prompt} onChange={setPrompt} />
        </div>

        <div className="section">
          <GenerateButton
            apiKey={apiKey}
            prompt={prompt}
            uploadedBase64={uploadedBase64}
            aspectRatio={aspectRatio}
            numImages={numImages}
            temperature={temperature}
            isGenerating={isGenerating}
            onGenerateStart={() => {
              setIsGenerating(true);
              handleResetGeneration();
            }}
            onGenerateComplete={handleGenerateComplete}
            onProgressUpdate={handleProgressUpdate}
          />
        </div>

        {/* 结果展示，避免空 src */}
        <div className="section">
          <ResultsPanel
            images={generatedImages.filter((img) => img.url || img.base64)}
            progress={generationProgress}
            isGenerating={isGenerating}
            aspectRatio={aspectRatio}
            temperature={temperature}
          />
        </div>

        <div className="section">
          <ParamsPanel
            aspectRatio={aspectRatio}
            numImages={numImages}
            temperature={temperature}
            onAspectRatioChange={setAspectRatio}
            onNumImagesChange={setNumImages}
            onTemperatureChange={setTemperature}
          />
        </div>

        <div className="section">
          <ApiKeyInput value={apiKey} onChange={handleApiKeyChange} />
        </div>

        {/*         <Footer /> */}
      </div>
    </div>
  );
}

export default HomePage;
