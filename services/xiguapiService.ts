/**
 * 西瓜皮 (Xiguapi) 图片生成 API 服务
 * API 文档：https://tasks.xiguapi.tech/
 */

// API 配置
const API_BASE_URL = 'https://tasks.xiguapi.tech/';
const API_KEY = 'w8n-cYYtSMwKtG6ghPyEykfbh8pl';

// imgbb 图床配置（用于上传 base64 图片获取 URL）
const IMGBB_API_KEY = '8c87c1c0c9258b3b3f3b0c8f9c8c8c8c'; // 需要替换为你的 imgbb API key
const IMGBB_UPLOAD_URL = 'https://api.imgbb.com/1/upload';

interface CreateTaskRequest {
  prompt: string;
  model: string;
  resolution?: string;
  aspect_ratio?: string;
  image_urls?: string[];
  hailuoMode?: string; // 视频生成模式：'01' 或 '02'
  num?: number; // 生成数量
}

interface CreateTaskResponse {
  success: boolean;  // API 实际返回 success 字段
  taskId: string;    // API 返回 taskId（驼峰命名）
  status: string;
  message?: string;
}

interface QueryTaskRequest {
  taskId: string;
}

interface QueryTaskResponse {
  success: boolean;
  status: 'running' | 'success' | 'failed';
  result?: {
    images: string[]; // 可能是图片 URL 或视频 URL
  };
  message?: string;
  error?: string;
}

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * 创建图片生成任务
 */
const createTask = async (
  prompt: string,
  options: {
    model?: string;
    resolution?: string;
    aspectRatio?: string;
    referenceUrls?: string[];
    hailuoMode?: string; // 视频生成模式
    num?: number; // 生成数量
  } = {}
): Promise<string> => {
  const requestBody: CreateTaskRequest = {
    prompt: prompt,
    model: options.model || 'nanobananapro',
    resolution: options.resolution || '1K',
    aspect_ratio: options.aspectRatio || '3:4',
    image_urls: options.referenceUrls || []
  };

  // 如果指定了生成数量
  if (options.num !== undefined && options.num > 0) {
    requestBody.num = options.num;
  }

  // 如果是视频生成，添加 hailuoMode
  if (options.model === 'hailuo' && options.hailuoMode) {
    requestBody.hailuoMode = options.hailuoMode;
  }

  console.log('[Xiguapi] 创建任务:', JSON.stringify(requestBody, null, 2));

  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify(requestBody)
    });

    // 先尝试解析 JSON，不管状态码
    let result: CreateTaskResponse;
    try {
      result = await response.json();
      console.log('[Xiguapi] API 响应:', result);
    } catch (parseError) {
      // 如果无法解析 JSON，再检查状态码
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[Xiguapi] API 错误:', response.status, errorText);
        throw new Error(`API 请求失败: ${response.status} - ${errorText}`);
      }
      throw parseError;
    }

    // 检查业务状态码（API 返回 success 字段）
    if (!result.success) {
      console.error('[Xiguapi] 业务错误:', result);
      throw new Error(`任务创建失败: ${result.message || '未知错误'}`);
    }

    console.log('[Xiguapi] 任务创建成功，taskId:', result.taskId);
    return result.taskId;
  } catch (error) {
    console.error('[Xiguapi] 创建任务异常:', error);
    throw error;
  }
};

/**
 * 查询任务结果
 */
const queryTask = async (taskId: string): Promise<QueryTaskResponse> => {
  const requestBody: QueryTaskRequest = {
    taskId: taskId
  };

  console.log('[Xiguapi] 查询任务请求:', JSON.stringify(requestBody, null, 2));

  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify(requestBody)
    });
    
    console.log('[Xiguapi] 查询响应状态:', response.status, response.statusText);

    // 先尝试解析 JSON，不管状态码
    let result: QueryTaskResponse;
    try {
      result = await response.json();
      console.log('[Xiguapi] 查询响应内容:', JSON.stringify(result, null, 2));
    } catch (parseError) {
      // 如果无法解析 JSON，再检查状态码
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[Xiguapi] 查询失败，无法解析 JSON:', errorText);
        throw new Error(`查询失败: ${response.status} - ${errorText}`);
      }
      throw parseError;
    }

    return result;
  } catch (error) {
    console.error('[Xiguapi] 查询任务异常:', error);
    throw error;
  }
};

/**
 * 轮询等待任务完成
 */
const waitForTaskCompletion = async (
  taskId: string,
  maxAttempts: number = 30,  // 减少到 30 次（1 分钟）
  interval: number = 2000
): Promise<string[]> => {
  console.log('[Xiguapi] 开始轮询任务:', taskId);

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const result = await queryTask(taskId);
    console.log(`[Xiguapi] 轮询 ${attempt + 1}/${maxAttempts}:`, result);

    if (result.status === 'success' && result.result?.images) {
      console.log('[Xiguapi] 任务完成，生成', result.result.images.length, '张图片');
      console.log('[Xiguapi] 图片 URLs:', result.result.images);
      
      // 下载图片并转换为 base64（用于本地存储）
      console.log('[Xiguapi] 开始下载图片并转换为 base64...');
      const base64Images: string[] = [];
      
      for (let i = 0; i < result.result.images.length; i++) {
        const url = result.result.images[i];
        try {
          console.log(`[Xiguapi] 下载图片 ${i + 1}/${result.result.images.length}: ${url}`);
          const base64 = await urlToBase64(url);
          base64Images.push(base64);
          console.log(`[Xiguapi] 图片 ${i + 1} 转换完成 (${(base64.length / 1024).toFixed(2)} KB)`);
        } catch (error) {
          console.error(`[Xiguapi] 图片 ${i + 1} 下载失败:`, error);
          // 如果下载失败，保留 URL 作为备用
          base64Images.push(url);
        }
      }
      
      console.log('[Xiguapi] 所有图片处理完成');
      return base64Images;
    }

    if (result.status === 'failed') {
      throw new Error(result.error || result.message || '任务失败');
    }

    // 继续等待
    await wait(interval);
  }

  throw new Error('任务超时：等待时间过长');
};

/**
 * 将图片 URL 转换为 base64
 */
const urlToBase64 = async (url: string): Promise<string> => {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * 生成图片（主函数）
 * @param prompt 生成提示词
 * @param options 配置选项
 * @returns 生成的图片 URL 数组
 */
export const generateImage = async (
  prompt: string,
  options: {
    model?: string;
    resolution?: string;
    aspectRatio?: string;
    referenceUrls?: string[];
    num?: number; // 生成数量
  } = {}
): Promise<string[]> => {
  try {
    // 1. 创建任务
    const taskId = await createTask(prompt, options);

    // 2. 等待任务完成
    const images = await waitForTaskCompletion(taskId);

    return images;
  } catch (error: any) {
    console.error('[Xiguapi] 生成图片失败:', error);
    
    // 提供友好的错误信息
    let friendlyMessage = error.message || '未知错误';
    
    if (friendlyMessage.includes('401') || friendlyMessage.includes('Unauthorized')) {
      friendlyMessage = 'API 密钥无效，请检查配置';
    } else if (friendlyMessage.includes('429') || friendlyMessage.includes('rate_limit')) {
      friendlyMessage = 'API 请求过于频繁，请稍后再试';
    } else if (friendlyMessage.includes('quota')) {
      friendlyMessage = 'API 配额不足，请检查账户余额';
    } else if (friendlyMessage.includes('timeout') || friendlyMessage.includes('超时')) {
      friendlyMessage = '生成超时，请稍后重试';
    }
    
    throw new Error(friendlyMessage);
  }
};

/**
 * 批量生成图片
 */
export const generateMultipleImages = async (
  prompt: string,
  count: number,
  options: {
    model?: string;
    resolution?: string;
    aspectRatio?: string;
    referenceUrls?: string[];
  } = {}
): Promise<string[]> => {
  console.log(`[Xiguapi] 批量生成 ${count} 张图片`);
  
  // 并行创建多个任务
  const taskPromises = Array.from({ length: count }, () => 
    createTask(prompt, options)
  );
  
  const taskIds = await Promise.all(taskPromises);
  console.log('[Xiguapi] 所有任务已创建:', taskIds);
  
  // 并行等待所有任务完成
  const resultPromises = taskIds.map(taskId => 
    waitForTaskCompletion(taskId)
  );
  
  const results = await Promise.all(resultPromises);
  
  // 合并所有结果
  return results.flat();
};

/**
 * 更新 API 配置（如果需要动态修改）
 */
export const updateApiConfig = (apiKey: string) => {
  console.log('[Xiguapi] API 配置已更新');
  // 注意：这里需要修改为可配置的方式，当前是硬编码
};

/**
 * 生成视频（主函数）
 * @param prompt 生成提示词
 * @param options 配置选项
 * @returns 生成的视频 URL（返回格式与图片生成一致，便于统一处理）
 */
export const generateVideo = async (
  prompt: string,
  options: {
    aspectRatio?: string;
    resolution?: string;
    hailuoMode?: string; // '01' 或 '02'，默认 '02'
    referenceImageUrl?: string; // 起始帧图片
  } = {}
): Promise<{ uri: string; isFallbackImage?: boolean }> => {
  try {
    const taskOptions = {
      model: 'hailuo',
      resolution: options.resolution || '1080P',
      aspectRatio: options.aspectRatio || '16:9',
      hailuoMode: options.hailuoMode || '02',
      referenceUrls: options.referenceImageUrl ? [options.referenceImageUrl] : []
    };

    console.log('[Xiguapi] 开始生成视频:', taskOptions);

    // 1. 创建任务
    const taskId = await createTask(prompt, taskOptions);

    // 2. 等待任务完成（视频生成可能需要更长时间）
    const results = await waitForTaskCompletion(taskId, 120, 3000); // 最多等待 6 分钟，每 3 秒轮询一次

    if (results.length === 0) {
      throw new Error('视频生成失败：未返回结果');
    }

    // 返回第一个视频 URL
    return {
      uri: results[0],
      isFallbackImage: false
    };
  } catch (error: any) {
    console.error('[Xiguapi] 生成视频失败:', error);
    
    // 提供友好的错误信息
    let friendlyMessage = error.message || '未知错误';
    
    if (friendlyMessage.includes('401') || friendlyMessage.includes('Unauthorized')) {
      friendlyMessage = 'API 密钥无效，请检查配置';
    } else if (friendlyMessage.includes('429') || friendlyMessage.includes('rate_limit')) {
      friendlyMessage = 'API 请求过于频繁，请稍后再试';
    } else if (friendlyMessage.includes('quota')) {
      friendlyMessage = 'API 配额不足，请检查账户余额';
    } else if (friendlyMessage.includes('timeout') || friendlyMessage.includes('超时')) {
      friendlyMessage = '视频生成超时，请稍后重试';
    }
    
    throw new Error(friendlyMessage);
  }
};

/**
 * 批量生成视频
 */
export const generateMultipleVideos = async (
  prompt: string,
  count: number,
  options: {
    aspectRatio?: string;
    resolution?: string;
    hailuoMode?: string;
    referenceImageUrl?: string;
  } = {}
): Promise<string[]> => {
  console.log(`[Xiguapi] 批量生成 ${count} 个视频`);
  
  const taskOptions = {
    model: 'hailuo',
    resolution: options.resolution || '1080P',
    aspectRatio: options.aspectRatio || '16:9',
    hailuoMode: options.hailuoMode || '02',
    referenceUrls: options.referenceImageUrl ? [options.referenceImageUrl] : []
  };
  
  // 并行创建多个任务
  const taskPromises = Array.from({ length: count }, () => 
    createTask(prompt, taskOptions)
  );
  
  const taskIds = await Promise.all(taskPromises);
  console.log('[Xiguapi] 所有视频任务已创建:', taskIds);
  
  // 并行等待所有任务完成（视频生成时间较长）
  const resultPromises = taskIds.map(taskId => 
    waitForTaskCompletion(taskId, 120, 3000)
  );
  
  const results = await Promise.all(resultPromises);
  
  // 合并所有结果
  return results.flat();
};

