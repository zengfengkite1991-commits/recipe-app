// 图片压缩服务

import imageCompression from 'browser-image-compression';

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  maxSizeMB?: number;
  quality?: number;
}

// 压缩封面图片（较大尺寸，用于预览）
export async function compressCoverImage(file: File): Promise<string> {
  const options = {
    maxWidthOrHeight: 1200,
    maxSizeMB: 2,
    useWebWorker: true,
    fileType: 'image/jpeg',
    initialQuality: 0.85,
  };

  try {
    const compressedFile = await imageCompression(file, options);
    return await fileToBase64(compressedFile);
  } catch (error) {
    console.error('封面图片压缩失败:', error);
    throw error;
  }
}

// 压缩步骤图片（中等尺寸）
export async function compressStepImage(file: File): Promise<string> {
  const options = {
    maxWidthOrHeight: 800,
    maxSizeMB: 1,
    useWebWorker: true,
    fileType: 'image/jpeg',
    initialQuality: 0.8,
  };

  try {
    const compressedFile = await imageCompression(file, options);
    return await fileToBase64(compressedFile);
  } catch (error) {
    console.error('步骤图片压缩失败:', error);
    throw error;
  }
}

// 压缩PDF用高清图片
export async function compressHDImage(file: File): Promise<string> {
  const options = {
    maxWidthOrHeight: 1600,
    maxSizeMB: 4,
    useWebWorker: true,
    fileType: 'image/jpeg',
    initialQuality: 0.9,
  };

  try {
    const compressedFile = await imageCompression(file, options);
    return await fileToBase64(compressedFile);
  } catch (error) {
    console.error('高清图片压缩失败:', error);
    throw error;
  }
}

// File转Base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Base64转File（用于导出）
export function base64ToFile(base64: string, filename: string): File {
  const arr = base64.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

// 获取图片尺寸
export function getImageDimensions(base64: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = reject;
    img.src = base64;
  });
}
