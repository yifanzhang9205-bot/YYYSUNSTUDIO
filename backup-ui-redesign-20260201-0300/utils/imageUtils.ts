/**
 * 图片处理工具
 * 使用 Web Worker 在后台处理图片
 */

let worker: Worker | null = null;

/**
 * 初始化 Worker
 */
const getWorker = (): Worker => {
  if (!worker) {
    worker = new Worker(new URL('../workers/imageProcessor.ts', import.meta.url), {
      type: 'module'
    });
  }
  return worker;
};

/**
 * 下载图片并转换为 base64（使用 Worker）
 */
export const downloadImageToBase64 = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const worker = getWorker();
    
    const handleMessage = (e: MessageEvent) => {
      if (e.data.type === 'download') {
        worker.removeEventListener('message', handleMessage);
        if (e.data.error) {
          reject(new Error(e.data.error));
        } else {
          resolve(e.data.base64);
        }
      }
    };
    
    worker.addEventListener('message', handleMessage);
    worker.postMessage({ type: 'download', url });
    
    // 超时处理
    setTimeout(() => {
      worker.removeEventListener('message', handleMessage);
      reject(new Error('下载超时'));
    }, 30000);
  });
};

/**
 * 生成缩略图（使用 Worker）
 */
export const generateThumbnail = (base64: string, maxWidth: number = 512): Promise<string> => {
  return new Promise((resolve, reject) => {
    const worker = getWorker();
    
    const handleMessage = (e: MessageEvent) => {
      if (e.data.type === 'thumbnail') {
        worker.removeEventListener('message', handleMessage);
        if (e.data.error) {
          reject(new Error(e.data.error));
        } else {
          resolve(e.data.base64);
        }
      }
    };
    
    worker.addEventListener('message', handleMessage);
    worker.postMessage({ type: 'thumbnail', base64, maxWidth });
    
    // 超时处理
    setTimeout(() => {
      worker.removeEventListener('message', handleMessage);
      reject(new Error('生成缩略图超时'));
    }, 10000);
  });
};

/**
 * 批量下载图片（并行处理）
 */
export const downloadImagesInBatch = async (urls: string[]): Promise<string[]> => {
  console.log(`[ImageUtils] 批量下载 ${urls.length} 张图片`);
  
  const results = await Promise.all(
    urls.map(url => downloadImageToBase64(url))
  );
  
  console.log(`[ImageUtils] 批量下载完成`);
  return results;
};

/**
 * 批量生成缩略图（并行处理）
 */
export const generateThumbnailsInBatch = async (
  base64Images: string[],
  maxWidth: number = 512
): Promise<string[]> => {
  console.log(`[ImageUtils] 批量生成 ${base64Images.length} 张缩略图`);
  
  const results = await Promise.all(
    base64Images.map(base64 => generateThumbnail(base64, maxWidth))
  );
  
  console.log(`[ImageUtils] 批量生成完成`);
  return results;
};

/**
 * 清理 Worker
 */
export const cleanupWorker = () => {
  if (worker) {
    worker.terminate();
    worker = null;
  }
};
