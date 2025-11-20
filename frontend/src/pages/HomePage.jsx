import { useState, useEffect } from "react";
import ApiKeyInput from "../components/ApiKeyInput";
import ImageUpload from "../components/ImageUpload";
import PromptInput from "../components/PromptInput";
import ParamsPanel from "../components/ParamsPanel";
import GenerateButton from "../components/ImageGenerateButton";
import ResultsPanel from "../components/ResultsPanel";
import { saveHistory, getAllHistory } from "../utils/db.js";

function HomePage() {
  // ===== 状态管理 =====
  const [apiKey, setApiKey] = useState(
    () => localStorage.getItem("banana_api_key") || ""
  );
  const [uploadedFiles, setUploadedFiles] = useState(() => {
    const saved = localStorage.getItem("banana_uploaded_files");
    return saved ? JSON.parse(saved) : [];
  });
  const [uploadedBase64, setUploadedBase64] = useState([]);
  const [prompt, setPrompt] = useState(() => {
    return localStorage.getItem("banana_prompt") || "";
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState(() => {
    const saved = localStorage.getItem("banana_generated_images");
    return saved ? JSON.parse(saved) : [];
  });
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

  // ===== 处理函数 =====
  const handleApiKeyChange = (newKey) => {
    setApiKey(newKey);
    localStorage.setItem("banana_api_key", newKey);
  };

  const handleUploadSuccess = (files) => {
    setUploadedFiles((prev) => [...prev, ...files]);
    setUploadedBase64((prev) => [...prev, ...files.map((f) => f.base64)]);
  };

  const handleRemoveImage = (index) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
    setUploadedBase64((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearImages = () => {
    setUploadedFiles([]);
    setUploadedBase64([]);
  };

  // 生成完成回调
  const handleGenerateComplete = async (images) => {
    setIsGenerating(false);
    setGeneratedImages(images);
    localStorage.setItem("banana_generated_images", JSON.stringify(images));

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
        await saveHistory(record);
        console.log(
          `✅ 保存历史记录 ID=${record.id}, 图片数量: ${images.length}`
        );

        const allRecords = await getAllHistory();
        console.log(`📦 当前数据库总条数: ${allRecords.length}`);
      } catch (err) {
        console.error("⚠️ 保存历史记录失败:", err);
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
