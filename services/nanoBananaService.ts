/**
 * Nano Banana 图片生成 API 服务
 * 文档：https://grsai.com/zh/dashboard/documents/nano-banana
 */

// API 配置
const API_BASE_URL = 'https://grsai.dakka.com.cn';
const API_KEY = 'sk-3d142c4d54fd4ceaae4a841bf40fb4ae';

interface DrawRequest {
  model: string;
  prompt: string;
  aspectRatio?: string;
  imageSize?: string;
  urls?: string[];
}

interface DrawResponse {
  code: number;
  msg: string;
  data: {
    id: string;
  };
}

interface ResultResponse {
  code: number;
  msg: string;
  data: {
    id: string;
    results: Array<{
      url: string;
      content?: string;
    }>;
    progress: number;
    status: 'pending' | 'processing' | 'succeeded' | 'failed';
    failure_reason?: string;
    error?: string;
  };
}

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * 提交图片生成任务（流式响应）
 */
export const submitImageGeneration = async (
  prompt: string,
  options: {
    aspectRatio?: string;
    imageSize?: string;
    referenceUrls?: string[];
  } = {}
): Promise<string[]> => {
  const requestBody: DrawRequest = {
    model: 'nano-banana-fast',
    prompt: prompt,
    aspectRatio: options.aspectRatio || 'auto',
    imageSize: options.imageSize || '1K',
    urls: options.referenceUrls || []
  };

  console.log('[NanoBanana] 提交请求:', JSON.stringify(requestBody, null, 2));
  console.log('[NanoBanana] API URL:', `${API_BASE_URL}/v1/draw/nano-banana`);

  try {
    const response = await fetch(`${API_BASE_URL}/v1/draw/nano-banana`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify(requestBody)
    });

    console.log('[NanoBanana] 响应状态:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[NanoBanana] API 错误:', response.status, errorText);
      throw new Error(`API 请求失败: ${response.status} - ${errorText}`);
    }

    // 处理流式响应（Server-Sent Events 格式）
    const rawText = await response.text();
    console.log('[NanoBanana] 原始响应长度:', rawText.length);
    console.log('[NanoBanana] 原始响应预览:', rawText.substring(0, 500));

    // 解析流式数据 - 处理可能没有换行符的情况
    // 格式可能是 "data: {...}data: {...}" 或 "data: {...}\ndata: {...}"
    const dataMatches = rawText.match(/data:\s*\{[^}]+\}/g);
    
    if (!dataMatches || dataMatches.length === 0) {
      console.error('[NanoBanana] 无法解析响应:', rawText);
      throw new Error('未收到有效的响应数据');
    }

    console.log('[NanoBanana] 解析到', dataMatches.length, '条数据');

    // 获取最后一条数据（包含最终结果）
    const lastMatch = dataMatches[dataMatches.length - 1];
    const jsonStr = lastMatch.replace(/^data:\s*/, '').trim();
    
    let result: ResultResponse['data'];
    try {
      result = JSON.parse(jsonStr);
    } catch (parseError) {
      // 如果简单正则匹配失败，尝试更复杂的解析
      console.log('[NanoBanana] 简单解析失败，尝试完整 JSON 解析');
      
      // 找到所有完整的 JSON 对象
      const jsonObjects: ResultResponse['data'][] = [];
      let searchStart = 0;
      while (true) {
        const dataIndex = rawText.indexOf('data:', searchStart);
        if (dataIndex === -1) break;
        
        const jsonStart = rawText.indexOf('{', dataIndex);
        if (jsonStart === -1) break;
        
        // 找到匹配的闭合括号
        let depth = 0;
        let jsonEnd = jsonStart;
        for (let i = jsonStart; i < rawText.length; i++) {
          if (rawText[i] === '{') depth++;
          else if (rawText[i] === '}') {
            depth--;
            if (depth === 0) {
              jsonEnd = i + 1;
              break;
            }
          }
        }
        
        try {
          const obj = JSON.parse(rawText.substring(jsonStart, jsonEnd));
          jsonObjects.push(obj);
        } catch (e) {
          // 忽略解析失败的片段
        }
        
        searchStart = jsonEnd;
      }
      
      if (jsonObjects.length === 0) {
        console.error('[NanoBanana] JSON 解析失败:', parseError);
        throw new Error(`JSON 解析失败: ${jsonStr.substring(0, 200)}`);
      }
      
      result = jsonObjects[jsonObjects.length - 1];
    }
    
    console.log('[NanoBanana] 最终结果:', result);
    
    if (result.status === 'succeeded' && result.results && result.results.length > 0) {
      const urls = result.results.map(r => r.url);
      console.log('[NanoBanana] 生成成功:', urls.length, '张图片');
      return urls;
    } else if (result.status === 'failed') {
      // 处理常见错误类型，提供更友好的错误信息
      const reason = result.failure_reason || result.error || '未知错误';
      let friendlyMessage = reason;
      
      if (reason.includes('output_moderation')) {
        friendlyMessage = '内容审核未通过，请尝试修改提示词或更换参考图片';
      } else if (reason.includes('input_moderation')) {
        friendlyMessage = '输入内容审核未通过，请更换参考图片';
      } else if (reason.includes('rate_limit')) {
        friendlyMessage = 'API 请求过于频繁，请稍后再试';
      } else if (reason.includes('quota')) {
        friendlyMessage = 'API 配额不足，请检查账户余额';
      }
      
      throw new Error(friendlyMessage);
    } else {
      throw new Error(`生成未完成，状态: ${result.status}`);
    }
  } catch (error) {
    console.error('[NanoBanana] 请求异常:', error);
    throw error;
  }
};

/**
 * 查询生成结果
 */
export const queryImageResult = async (taskId: string): Promise<ResultResponse['data']> => {
  const response = await fetch(`${API_BASE_URL}/v1/draw/result`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    },
    body: JSON.stringify({ id: taskId })
  });

  if (!response.ok) {
    throw new Error(`查询失败: ${response.status}`);
  }

  const result: ResultResponse = await response.json();
  
  if (result.code !== 0) {
    throw new Error(`查询失败: ${result.msg}`);
  }

  return result.data;
};

/**
 * 生成图片（直接返回结果，API 使用流式响应）
 * @param prompt 生成提示词
 * @param options 配置选项
 * @returns 生成的图片 URL 数组
 */
export const generateImage = async (
  prompt: string,
  options: {
    aspectRatio?: string;
    imageSize?: string;
    referenceUrls?: string[];
  } = {}
): Promise<string[]> => {
  // API 使用流式响应，直接返回最终结果
  return submitImageGeneration(prompt, options);
};

/**
 * 更新 API 配置
 */
export const updateApiConfig = (baseUrl: string, apiKey: string) => {
  console.log('[NanoBanana] API 配置已更新');
};
