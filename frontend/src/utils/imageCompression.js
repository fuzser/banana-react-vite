/**
 * 图片压缩工具
 * 针对 sessionStorage 1MB 限制优化
 */

/**
 * 压缩 Base64 图片
 * @param {string} base64 - 原始 Base64
 * @param {number} maxWidth - 最大宽度
 * @param {number} quality - 质量 (0-1)
 * @returns {Promise<string>} 压缩后的 Base64
 */
export const compressBase64Image = (base64, maxWidth = 600, quality = 0.5) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = base64;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // 按比例缩放
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      // 转换为 JPEG 并压缩
      const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
      
      const originalSizeKB = (base64.length / 1024).toFixed(1);
      const compressedSizeKB = (compressedBase64.length / 1024).toFixed(1);
      const savedPercent = ((1 - compressedBase64.length / base64.length) * 100).toFixed(1);
      
      console.log(`📉 图片压缩: ${originalSizeKB}KB → ${compressedSizeKB}KB (减少 ${savedPercent}%)`);
      
      resolve(compressedBase64);
    };

    img.onerror = () => {
      console.warn('⚠️ 图片压缩失败，使用原图');
      resolve(base64);
    };
  });
};