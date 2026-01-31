/**
 * 图片优化服务
 * 
 * 学习 Lovart 的多级图片管理策略：
 * 1. 缩略图（200×200）：用于列表显示
 * 2. 预览图（800×800）：用于画布显示
 * 3. 原图（原始尺寸）：用于导出和编辑
 * 
 * 策略：
 * - 默认只加载缩略图（节省内存）
 * - 放大时动态加载预览图/原图
 * - 缩小时卸载高分辨率图片
 */

export interface ImageLevel {
  thumbnail: string;  // 缩略图 Blob URL（200×200）
  preview: string;    // 预览图 Blob URL（800×800）
  original: string;   // 原图 Blob URL（原始尺寸）
}

export interface ImageMetadata {
  width: number;
  height: number;
  size: number;
  format: string;
}

/**
 * 创建多级图片
 * 
 * @param file 原始文件
 * @returns 多级图片 URL 和元数据
 */
export const createMultiLevelImage = async (
  file: File
): Promise<{ levels: ImageLevel; metadata: ImageMetadata }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      const img = new Image();
      
      img.onload = async () => {
        try {
          // 元数据
          const metadata: ImageMetadata = {
            width: img.width,
            height: img.height,
            size: file.size,
            format: file.type,
          };
          
          // 生成三个级别的图片
          const [thumbnail, preview, original] = await Promise.all([
            createResizedImage(img, 200, 200, 0.8),   // 缩略图（质量 80%）
            createResizedImage(img, 800, 800, 0.9),   // 预览图（质量 90%）
            createResizedImage(img, img.width, img.height, 0.95), // 原图（质量 95%）
          ]);
          
          // 清理
          img.src = '';
          img.onload = null;
          img.onerror = null;
          
          resolve({
            levels: { thumbnail, preview, original },
            metadata,
          });
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => reject(new Error('图片加载失败'));
      img.src = dataUrl;
    };
    
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsDataURL(file);
  });
};

/**
 * 创建调整大小的图片
 * 
 * @param img 原始图片
 * @param maxWidth 最大宽度
 * @param maxHeight 最大高度
 * @param quality 质量（0-1）
 * @returns Blob URL
 */
const createResizedImage = async (
  img: HTMLImageElement,
  maxWidth: number,
  maxHeight: number,
  quality: number
): Promise<string> => {
  return new Promise((resolve) => {
    // 计算缩放比例（保持宽高比）
    let width = img.width;
    let height = img.height;
    
    if (width > maxWidth || height > maxHeight) {
      const ratio = Math.min(maxWidth / width, maxHeight / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }
    
    // 创建 Canvas
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    
    // 使用高质量缩放算法
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    // 绘制图片
    ctx.drawImage(img, 0, 0, width, height);
    
    // 转换为 Blob
    canvas.toBlob(
      (blob) => {
        const blobUrl = URL.createObjectURL(blob!);
        
        // 清理 Canvas
        canvas.width = 0;
        canvas.height = 0;
        
        resolve(blobUrl);
      },
      'image/webp',
      quality
    );
  });
};

/**
 * 根据缩放级别选择合适的图片
 * 
 * @param levels 多级图片
 * @param scale 当前缩放级别
 * @returns 合适的图片 URL
 */
export const selectImageByScale = (levels: ImageLevel, scale: number): string => {
  // 缩放级别 < 0.5：使用缩略图
  if (scale < 0.5) {
    return levels.thumbnail;
  }
  
  // 缩放级别 0.5-1.5：使用预览图
  if (scale < 1.5) {
    return levels.preview;
  }
  
  // 缩放级别 > 1.5：使用原图
  return levels.original;
};

/**
 * 清理多级图片
 * 
 * @param levels 多级图片
 */
export const revokeMultiLevelImage = (levels: ImageLevel) => {
  if (levels.thumbnail && levels.thumbnail.startsWith('blob:')) {
    URL.revokeObjectURL(levels.thumbnail);
  }
  if (levels.preview && levels.preview.startsWith('blob:')) {
    URL.revokeObjectURL(levels.preview);
  }
  if (levels.original && levels.original.startsWith('blob:')) {
    URL.revokeObjectURL(levels.original);
  }
};

/**
 * 预加载图片（提前加载更高级别的图片）
 * 
 * @param url 图片 URL
 */
export const preloadImage = (url: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      img.src = '';
      img.onload = null;
      img.onerror = null;
      resolve();
    };
    img.onerror = () => {
      img.src = '';
      img.onload = null;
      img.onerror = null;
      reject(new Error('预加载失败'));
    };
    img.src = url;
  });
};

/**
 * 批量创建多级图片
 * 
 * @param files 文件列表
 * @param onProgress 进度回调
 * @returns 多级图片列表
 */
export const createMultiLevelImages = async (
  files: File[],
  onProgress?: (current: number, total: number) => void
): Promise<Array<{ levels: ImageLevel; metadata: ImageMetadata }>> => {
  const results: Array<{ levels: ImageLevel; metadata: ImageMetadata }> = [];
  
  for (let i = 0; i < files.length; i++) {
    const result = await createMultiLevelImage(files[i]);
    results.push(result);
    
    if (onProgress) {
      onProgress(i + 1, files.length);
    }
  }
  
  return results;
};

/**
 * 获取图片的实际尺寸（从 Blob URL）
 * 
 * @param url Blob URL
 * @returns 图片尺寸
 */
export const getImageDimensions = (url: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const dimensions = { width: img.width, height: img.height };
      img.src = '';
      img.onload = null;
      img.onerror = null;
      resolve(dimensions);
    };
    img.onerror = () => {
      img.src = '';
      img.onload = null;
      img.onerror = null;
      reject(new Error('获取尺寸失败'));
    };
    img.src = url;
  });
};

/**
 * 计算图片的内存占用（估算）
 * 
 * @param width 宽度
 * @param height 高度
 * @returns 内存占用（MB）
 */
export const estimateImageMemory = (width: number, height: number): number => {
  // RGBA 格式：每个像素 4 字节
  const bytes = width * height * 4;
  return bytes / 1024 / 1024; // 转换为 MB
};

/**
 * 计算多级图片的总内存占用
 * 
 * @param metadata 图片元数据
 * @returns 总内存占用（MB）
 */
export const estimateMultiLevelMemory = (metadata: ImageMetadata): {
  thumbnail: number;
  preview: number;
  original: number;
  total: number;
} => {
  const thumbnail = estimateImageMemory(200, 200);
  const preview = estimateImageMemory(800, 800);
  const original = estimateImageMemory(metadata.width, metadata.height);
  
  return {
    thumbnail,
    preview,
    original,
    total: thumbnail + preview + original,
  };
};
