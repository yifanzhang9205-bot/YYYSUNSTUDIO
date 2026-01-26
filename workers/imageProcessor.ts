/**
 * Web Worker: 图片下载和转换
 * 在后台线程处理，不阻塞主线程
 */

interface ImageProcessRequest {
  type: 'download' | 'thumbnail';
  url?: string;
  base64?: string;
  maxWidth?: number;
}

interface ImageProcessResponse {
  type: 'download' | 'thumbnail';
  base64?: string;
  error?: string;
}

self.onmessage = async (e: MessageEvent<ImageProcessRequest>) => {
  const { type, url, base64, maxWidth } = e.data;

  try {
    if (type === 'download' && url) {
      // 下载图片并转换为 base64
      const response = await fetch(url);
      const blob = await response.blob();
      
      const reader = new FileReader();
      reader.onloadend = () => {
        self.postMessage({
          type: 'download',
          base64: reader.result as string
        } as ImageProcessResponse);
      };
      reader.onerror = () => {
        self.postMessage({
          type: 'download',
          error: '图片下载失败'
        } as ImageProcessResponse);
      };
      reader.readAsDataURL(blob);
      
    } else if (type === 'thumbnail' && base64) {
      // 生成缩略图
      const img = await createImageBitmap(await (await fetch(base64)).blob());
      
      const ratio = (maxWidth || 512) / img.width;
      const canvas = new OffscreenCanvas(
        maxWidth || 512,
        img.height * ratio
      );
      
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.8 });
      const reader = new FileReader();
      reader.onloadend = () => {
        self.postMessage({
          type: 'thumbnail',
          base64: reader.result as string
        } as ImageProcessResponse);
      };
      reader.readAsDataURL(blob);
    }
  } catch (error: any) {
    self.postMessage({
      type,
      error: error.message || '处理失败'
    } as ImageProcessResponse);
  }
};
