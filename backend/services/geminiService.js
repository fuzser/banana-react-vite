/**
 * Google Gemini API 服务
 * 封装 Nano Banana 图像生成 API 调用
 */

import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import config from "../config/config.js";

// 获取当前文件的目录（ES module）
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 上传目录
/* const uploadDir = path.join(__dirname, '../uploads')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
} */

/**
 * 构建 Gemini API 请求的 parts 数组
 * @param {string} prompt - 提示词
 * @param {Array<string>} imageUrls - Base64 图片数组
 * @returns {Array} parts 数组
 */
const buildContentParts = (prompt, imageUrls = []) => {
  const parts = [];

  // 添加参考图片（如果有）
  if (imageUrls && imageUrls.length > 0) {
    for (const imageUrl of imageUrls) {
      // 解析 data URI: data:image/jpeg;base64,/9j/4AAQ...
      const matches = imageUrl.match(/^data:image\/(\w+);base64,(.+)$/);

      if (matches) {
        const mimeType = `image/${matches[1]}`;
        const base64Data = matches[2];

        parts.push({
          inline_data: {
            mime_type: mimeType,
            data: base64Data,
          },
        });
      } else {
        console.warn("无法解析图片格式:", imageUrl.substring(0, 50));
      }
    }
  }

  // 添加文本提示词（必须在图片之后）
  parts.push({
    text: prompt,
  });

  return parts;
};

/**
 * 构建 Gemini API 请求体
 * @param {string} prompt - 提示词
 * @param {Array<string>} imageUrls - Base64 图片数组
 * @param {string} aspectRatio - 分辨率比例
 * @param {number} temperature - 随机度
 * @returns {Object} 请求体
 */
const buildRequestPayload = (prompt, imageUrls, aspectRatio, temperature, imageSize) => {
  const parts = buildContentParts(prompt, imageUrls);

  return {
    contents: [
      {
        parts: parts,
      },
    ],
    generationConfig: {
      temperature: temperature,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 8192,
      responseModalities: ["IMAGE"],
      imageConfig: {
        aspectRatio: aspectRatio, // 16:9, 1:1 等
        imageSize: imageSize, // 1K, 2K, 4K
      },
    },
  };
};

/**
 * 解析 Gemini API 响应
 * @param {Object} data - API 响应数据
 * @returns {Object} { success: boolean, images: Array, error: string }
 */
const parseResponse = (data) => {
  // 检查是否有候选结果
  if (!data.candidates || data.candidates.length === 0) {
    return {
      success: false,
      images: [],
      error: "API 未返回有效结果",
    };
  }

  const candidate = data.candidates[0];

  // 检查 finishReason 是否为错误
  if (candidate.finishReason && candidate.finishReason !== "STOP") {
    const errorMessages = {
      NO_IMAGE:
        "⚠️ AI 无法为此提示词生成图片。可能原因：\n- 提示词与参考图片不匹配\n- 描述的内容无法生成\n- 提示词过于复杂或模糊\n\n建议：\n- 简化提示词，使用更明确的描述\n- 确保提示词与参考图片相关\n- 尝试用英文描述",
      SAFETY: "🚫 内容被安全过滤器拦截，请修改提示词",
      RECITATION: "⚠️ 生成内容可能涉及版权问题",
      MAX_TOKENS: "⚠️ Token 数量超限，请减少参考图片或简化提示词",
      OTHER: "⚠️ 生成失败，请重试",
    };

    const errorMsg =
      errorMessages[candidate.finishReason] || errorMessages["OTHER"];

    return {
      success: false,
      images: [],
      error: errorMsg,
      finishReason: candidate.finishReason,
    };
  }

  // 提取生成的图片
  if (!candidate.content || !candidate.content.parts) {
    return {
      success: false,
      images: [],
      error: "API 返回格式异常",
    };
  }

  const imageParts = candidate.content.parts.filter((part) => part.inlineData);

  if (imageParts.length === 0) {
    return {
      success: false,
      images: [],
      error: "未找到生成的图片数据",
    };
  }

  // 转换为返回格式（同时保存到本地）
  const images = imageParts.map((part, index) => {
    const base64Data = part.inlineData.data;
    const mimeType = part.inlineData.mimeType || "image/png";

    // 保存到本地文件
    try {
      const ext = mimeType.split("/")[1];
      const filename = `generated_${Date.now()}_${index}.${ext}`;
      const filepath = path.join(uploadDir, filename);
      fs.writeFileSync(filepath, Buffer.from(base64Data, "base64"));
      console.log(`💾 已保存图片: ${filename}`);
    } catch (saveError) {
      /* console.error('保存图片失败:', saveError) */
      // 继续处理，即使保存失败也返回 Base64
    }

    return {
      base64: `data:${mimeType};base64,${base64Data}`,
      mimeType: mimeType,
    };
  });

  return {
    success: true,
    images: images,
    error: null,
  };
};

/**
 * 调用 Gemini API 生成图片
 * @param {Object} params - 生成参数
 * @param {string} params.prompt - 提示词
 * @param {string} params.apiKey - Google API Key
 * @param {Array<string>} params.image_urls - Base64 图片数组
 * @param {string} params.aspectRatio - 分辨率比例
 * @param {string} params.imageSize - 图片分辨率 (1K/2K/4K)
 * @param {number} params.temperature - 随机度
 * @returns {Promise<Object>} { success: boolean, data: Array, error: string }
 */
export const generateImage = async ({
  prompt,
  apiKey,
  image_urls = [],
  aspectRatio = "1:1",
  imageSize = "1K",
  temperature = 1.0,
}) => {
  try {
    // 构建请求体
    // 构建请求体
    const payload = buildRequestPayload(
      prompt,
      image_urls,
      aspectRatio,
      temperature,
      imageSize
    );

    // 构建 API URL
    const apiUrl = `${config.gemini.baseUrl}/models/${config.gemini.model}:generateContent?key=${apiKey}`;

    console.log("📤 调用 Gemini API:", {
      model: config.gemini.model,
      num_reference_images: image_urls.length,
      prompt_length: prompt.length,
      aspect_ratio: aspectRatio,
      image_size: imageSize,
      temperature: temperature,
    });

    // 发送请求
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      timeout: config.gemini.timeout,
    });

    console.log("📥 API 响应状态:", response.status);

    // 读取响应文本
    const responseText = await response.text();

    // 处理 HTTP 错误
    if (!response.ok) {
      console.error("❌ API 错误响应:", responseText);

      let errorMessage = "Gemini API 调用失败";

      if (response.status === 400) {
        errorMessage =
          "请检查 API Key 是否有效，以及是否在 Google AI Studio 启用了计费";
      } else if (response.status === 429) {
        errorMessage = "API 请求频率超限，请稍后重试";
      } else if (response.status === 403) {
        errorMessage = "API Key 权限不足或已被禁用";
      } else if (response.status === 500) {
        errorMessage = "Gemini 服务器错误，请稍后重试";
      }

      return {
        success: false,
        data: [],
        error: errorMessage,
        status: response.status,
        details: responseText.substring(0, 500),
      };
    }

    // 解析 JSON
    if (!responseText) {
      return {
        success: false,
        data: [],
        error: "API 返回空内容",
      };
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error("❌ JSON 解析失败:", parseError);
      return {
        success: false,
        data: [],
        error: "API 返回格式解析失败",
        details: responseText.substring(0, 500),
      };
    }

    // 解析响应
    const result = parseResponse(data);

    if (result.success) {
      console.log(`✅ 成功生成 ${result.images.length} 张图片`);
      return {
        success: true,
        data: result.images.map((img) => ({
          base64: img.base64,
          revised_prompt: prompt,
        })),
        error: null,
      };
    } else {
      console.log("❌ 生成失败:", result.error);
      return {
        success: false,
        data: [],
        error: result.error,
        finishReason: result.finishReason,
      };
    }
  } catch (error) {
    console.error("❌ Gemini API 调用异常:", error);

    let errorMessage = "生成图片失败";

    if (error.name === "FetchError") {
      errorMessage = "网络连接失败，请检查网络设置";
    } else if (error.code === "ETIMEDOUT") {
      errorMessage = "请求超时，请重试";
    }

    return {
      success: false,
      data: [],
      error: errorMessage,
      details: error.message,
    };
  }
};

export default {
  generateImage,
};
