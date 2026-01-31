/**
 * ImgBB 图床服务
 * 用于将 base64 图片上传到 ImgBB，获取公开 URL
 * API 文档：https://api.imgbb.com/
 */

// ImgBB API 配置
// 获取 API Key：https://api.imgbb.com/
const IMGBB_API_KEY = process.env.IMGBB_API_KEY || '';

interface ImgBBUploadResponse {
  data: {
    id: string;
    title: string;
    url_viewer: string;
    url: string;
    display_url: string;
    width: number;
    height: number;
    size: number;
    time: number;
    expiration: number;
    image: {
      filename: string;
      name: string;
      mime: string;
      extension: string;
      url: string;
    };
    thumb: {
      filename: string;
      name: string;
      mime: string;
      extension: string;
      url: string;
    };
    medium: {
      filename: string;
      name: string;
      mime: string;
      extension: string;
      url: string;
    };
    delete_url: string;
  };
  success: boolean;
  status: number;
}

/**
 * 上传 base64 图片到 ImgBB
 * @param base64Image base64 格式的图片（可以带 data:image/...;base64, 前缀）
 * @param name 图片名称（可选）
 * @param expiration 过期时间（秒，可选，60-15552000）
 * @returns 图片的公开 URL
 */
export const uploadImageToImgBB = async (
  base64Image: string,
  name?: string,
  expiration?: number
): Promise<string> => {
  // 检查 API Key
  if (!IMGBB_API_KEY) {
    throw new Error('ImgBB API Key 未配置，请在 .env.local 中添加 IMGBB_API_KEY');
  }

  try {
    // 移除 data URL 前缀（如果有）
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
    
    console.log('[ImgBB] 开始上传图片');
    console.log('[ImgBB] 图片大小:', (base64Data.length * 0.75 / 1024).toFixed(2), 'KB');

    // 构建表单数据
    const formData = new FormData();
    formData.append('image', base64Data);
    
    if (name) {
      formData.append('name', name);
    }
    
    // 如果设置了过期时间（秒）
    if (expiration && expiration >= 60 && expiration <= 15552000) {
      formData.append('expiration', expiration.toString());
    }

    // 发送 POST 请求（推荐方式）
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
      method: 'POST',
      body: formData
    });

    console.log('[ImgBB] 响应状态:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[ImgBB] 上传失败:', response.status, errorText);
      throw new Error(`ImgBB 上传失败: ${response.status} - ${errorText}`);
    }

    const result: ImgBBUploadResponse = await response.json();
    console.log('[ImgBB] API 响应:', result);

    if (!result.success || result.status !== 200) {
      throw new Error('ImgBB 上传失败: API 返回 success=false 或状态码非 200');
    }

    console.log('[ImgBB] 上传成功');
    console.log('[ImgBB] 图片 ID:', result.data.id);
    console.log('[ImgBB] 图片 URL:', result.data.url);
    console.log('[ImgBB] 显示 URL:', result.data.display_url);
    console.log('[ImgBB] 图片尺寸:', result.data.width, 'x', result.data.height);
    console.log('[ImgBB] 文件大小:', (result.data.size / 1024).toFixed(2), 'KB');

    // 返回图片 URL（使用 display_url，这是优化后的 CDN 链接）
    return result.data.display_url;
  } catch (error: any) {
    console.error('[ImgBB] 上传异常:', error);
    
    // 提供友好的错误信息
    let friendlyMessage = error.message || '未知错误';
    
    if (friendlyMessage.includes('400')) {
      friendlyMessage = 'ImgBB 请求参数错误，请检查图片格式';
    } else if (friendlyMessage.includes('401') || friendlyMessage.includes('Unauthorized')) {
      friendlyMessage = 'ImgBB API Key 无效，请检查配置';
    } else if (friendlyMessage.includes('429') || friendlyMessage.includes('rate_limit')) {
      friendlyMessage = 'ImgBB 请求过于频繁，请稍后再试';
    } else if (friendlyMessage.includes('413') || friendlyMessage.includes('too large')) {
      friendlyMessage = '图片太大，ImgBB 限制单张图片最大 32MB';
    } else if (friendlyMessage.includes('NetworkError') || friendlyMessage.includes('Failed to fetch')) {
      friendlyMessage = '网络错误，请检查网络连接';
    }
    
    throw new Error(friendlyMessage);
  }
};

/**
 * 批量上传图片到 ImgBB
 * @param base64Images base64 图片数组
 * @returns 图片 URL 数组
 */
export const uploadMultipleImagesToImgBB = async (
  base64Images: string[]
): Promise<string[]> => {
  console.log('[ImgBB] 批量上传', base64Images.length, '张图片');
  
  // 并行上传所有图片
  const uploadPromises = base64Images.map((img, index) => 
    uploadImageToImgBB(img, `image-${Date.now()}-${index}`)
  );
  
  try {
    const urls = await Promise.all(uploadPromises);
    console.log('[ImgBB] 批量上传完成，获得', urls.length, '个 URL');
    return urls;
  } catch (error) {
    console.error('[ImgBB] 批量上传失败:', error);
    throw error;
  }
};

/**
 * 检查 ImgBB API Key 是否已配置
 */
export const isImgBBConfigured = (): boolean => {
  return !!IMGBB_API_KEY && IMGBB_API_KEY.length > 0;
};
