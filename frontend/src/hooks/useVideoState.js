/**
 * 视频页面状态持久化 Hook
 * 自动同步状态到 localStorage
 */

import { useState, useEffect, useRef } from 'react';
import { saveVideoState, getVideoState } from '../utils/videoStorage';

/**
 * 自定义 Hook: 状态持久化
 * 使用方式与 useState 一致,但会自动保存到 localStorage
 * 
 * @param {string} key - 存储键名
 * @param {*} defaultValue - 默认值
 * @param {number} debounceMs - 防抖延迟(毫秒),默认500ms
 * @returns {[any, Function]} [state, setState]
 */
export const useVideoState = (key, defaultValue, debounceMs = 500) => {
  // 初始化时从 localStorage 读取
  const [state, setState] = useState(() => {
    return getVideoState(key, defaultValue);
  });

  // 使用 ref 存储定时器,避免闭包问题
  const timeoutRef = useRef(null);

  // 监听状态变化,自动保存到 localStorage
  useEffect(() => {
    // 清除之前的定时器
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // 设置防抖定时器
    timeoutRef.current = setTimeout(() => {
      saveVideoState(key, state);
      console.log(`✅ 已保存状态: ${key}`);
    }, debounceMs);

    // 清理函数
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [key, state, debounceMs]);

  return [state, setState];
};

/**
 * 立即保存的 Hook (无防抖)
 * 适用于重要操作(如 API Key、模型选择)
 * 
 * @param {string} key - 存储键名
 * @param {*} defaultValue - 默认值
 * @returns {[any, Function]} [state, setState]
 */
export const useVideoStateImmediate = (key, defaultValue) => {
  const [state, setState] = useState(() => {
    return getVideoState(key, defaultValue);
  });

  useEffect(() => {
    saveVideoState(key, state);
    console.log(`✅ 已立即保存状态: ${key}`);
  }, [key, state]);

  return [state, setState];
};

/**
 * 批量状态管理 Hook
 * 返回所有状态和统一的更新函数
 * 
 * @returns {Object} { states, updateState, resetStates }
 */
export const useVideoStates = () => {
  const [apiKey, setApiKey] = useVideoStateImmediate('nano_banana_video_api_key', '');
  const [selectedModel, setSelectedModel] = useVideoStateImmediate('nano_banana_video_model', 'doubao-seedance-1-0-pro-250528');
  const [images, setImages] = useVideoState('nano_banana_video_images', [], 300);
  const [prompt, setPrompt] = useVideoState('nano_banana_video_prompt', '', 800);
  const [params, setParams] = useVideoState('nano_banana_video_params', {
    resolution: '1080p',
    duration: 10,
    ratio: '16:9'
  }, 500);
  const [videoHistory, setVideoHistory] = useVideoState('nano_banana_video_history', [], 1000);

  // 统一的状态对象
  const states = {
    apiKey,
    selectedModel,
    images,
    prompt,
    params,
    videoHistory
  };

  // 统一的更新函数
  const setters = {
    setApiKey,
    setSelectedModel,
    setImages,
    setPrompt,
    setParams,
    setVideoHistory
  };

  /**
   * 统一更新状态
   * @param {string} key - 状态名称
   * @param {*} value - 新值
   */
  const updateState = (key, value) => {
    const setterName = `set${key.charAt(0).toUpperCase()}${key.slice(1)}`;
    if (setters[setterName]) {
      setters[setterName](value);
    } else {
      console.warn(`未找到 setter: ${setterName}`);
    }
  };

  /**
   * 重置所有状态到默认值
   */
  const resetStates = () => {
    setApiKey('');
    setSelectedModel('doubao-seedance-1-0-pro-250528');
    setImages([]);
    setPrompt('');
    setParams({
      resolution: '1080p',
      duration: 10,
      ratio: '16:9'
    });
    setVideoHistory([]);
    console.log('✅ 已重置所有状态');
  };

  return {
    states,
    setters,
    updateState,
    resetStates
  };
};

/**
 * 图片状态管理 Hook
 * 专门用于管理图片上传状态,包含图片压缩逻辑
 * 
 * @param {string} selectedModel - 当前选择的模型
 * @returns {Object} { images, addImages, removeImage, toggleImageRole, clearImages }
 */
export const useVideoImages = (selectedModel) => {
  const [images, setImages] = useVideoState('nano_banana_video_images', [], 300);

  /**
   * 添加图片
   * @param {Array} newImages - 新图片数组
   */
  const addImages = (newImages) => {
    setImages(prev => [...prev, ...newImages]);
  };

  /**
   * 删除图片
   * @param {string} imageId - 图片ID
   */
  const removeImage = (imageId) => {
    setImages(prev => prev.filter(img => img.id !== imageId));
  };

  /**
   * 切换图片角色
   * @param {string} imageId - 图片ID
   */
  const toggleImageRole = (imageId) => {
    setImages(prev => {
      return prev.map(img => {
        if (img.id === imageId) {
          return {
            ...img,
            role: img.role === 'first_frame' ? 'last_frame' : 'first_frame'
          };
        } else {
          return {
            ...img,
            role: img.role === 'first_frame' ? 'last_frame' : 'first_frame'
          };
        }
      });
    });
  };

  /**
   * 清空所有图片
   */
  const clearImages = () => {
    setImages([]);
  };

  /**
   * 替换所有图片
   * @param {Array} newImages - 新的图片数组
   */
  const replaceImages = (newImages) => {
    setImages(newImages);
  };

  return {
    images,
    addImages,
    removeImage,
    toggleImageRole,
    clearImages,
    replaceImages
  };
};

export default useVideoState;