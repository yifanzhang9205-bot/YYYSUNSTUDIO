/**
 * BLTCY AI 对话 API 服务
 * API 文档：https://api.bltcy.ai
 */

// API 配置
const API_BASE_URL = 'https://api.bltcy.ai';
const API_KEY = 'sk-BN7z574kow0App9HZviHJu3TJIQqo0AEKIMFT18XkQ4FL5H2';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * 发送聊天消息
 * @param messages 消息历史
 * @param options 配置选项
 * @returns AI 回复内容
 */
export const sendChatMessage = async (
  messages: ChatMessage[],
  options: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    systemPrompt?: string;
  } = {}
): Promise<string> => {
  const requestBody: ChatCompletionRequest = {
    model: options.model || 'gpt-4o-mini', // 默认模型
    messages: messages,
    temperature: options.temperature ?? 0.7,
    max_tokens: options.maxTokens,
    stream: false
  };

  // 如果有系统提示词，添加到消息开头
  if (options.systemPrompt && messages[0]?.role !== 'system') {
    requestBody.messages = [
      { role: 'system', content: options.systemPrompt },
      ...messages
    ];
  }

  console.log('[BLTCY] 发送聊天请求:', {
    model: requestBody.model,
    messageCount: requestBody.messages.length,
    temperature: requestBody.temperature
  });

  try {
    const response = await fetch(`${API_BASE_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[BLTCY] API 错误:', response.status, errorText);
      throw new Error(`API 请求失败: ${response.status} - ${errorText}`);
    }

    const result: ChatCompletionResponse = await response.json();
    console.log('[BLTCY] 收到回复:', {
      model: result.model,
      tokens: result.usage?.total_tokens
    });

    const content = result.choices[0]?.message?.content;
    if (!content) {
      throw new Error('API 返回空内容');
    }

    return content;
  } catch (error: any) {
    console.error('[BLTCY] 请求异常:', error);
    
    // 提供友好的错误信息
    let friendlyMessage = error.message || '未知错误';
    
    if (friendlyMessage.includes('401') || friendlyMessage.includes('Unauthorized')) {
      friendlyMessage = 'API 密钥无效，请检查配置';
    } else if (friendlyMessage.includes('429') || friendlyMessage.includes('rate_limit')) {
      friendlyMessage = 'API 请求过于频繁，请稍后再试';
    } else if (friendlyMessage.includes('quota') || friendlyMessage.includes('insufficient')) {
      friendlyMessage = 'API 配额不足，请检查账户余额';
    } else if (friendlyMessage.includes('timeout')) {
      friendlyMessage = '请求超时，请稍后重试';
    }
    
    throw new Error(friendlyMessage);
  }
};

/**
 * 流式发送聊天消息
 * @param messages 消息历史
 * @param onChunk 接收到文本块时的回调
 * @param options 配置选项
 */
export const sendChatMessageStream = async (
  messages: ChatMessage[],
  onChunk: (text: string) => void,
  options: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    systemPrompt?: string;
  } = {}
): Promise<void> => {
  const requestBody: ChatCompletionRequest = {
    model: options.model || 'gpt-4o-mini',
    messages: messages,
    temperature: options.temperature ?? 0.7,
    max_tokens: options.maxTokens,
    stream: true
  };

  // 如果有系统提示词，添加到消息开头
  if (options.systemPrompt && messages[0]?.role !== 'system') {
    requestBody.messages = [
      { role: 'system', content: options.systemPrompt },
      ...messages
    ];
  }

  console.log('[BLTCY] 发送流式聊天请求');

  try {
    const response = await fetch(`${API_BASE_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API 请求失败: ${response.status} - ${errorText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('无法读取响应流');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === 'data: [DONE]') continue;
        
        if (trimmed.startsWith('data: ')) {
          try {
            const json = JSON.parse(trimmed.slice(6));
            const content = json.choices?.[0]?.delta?.content;
            if (content) {
              onChunk(content);
            }
          } catch (e) {
            console.warn('[BLTCY] 解析流式数据失败:', trimmed);
          }
        }
      }
    }
  } catch (error: any) {
    console.error('[BLTCY] 流式请求异常:', error);
    throw error;
  }
};

/**
 * 简化的对话接口（兼容旧的 Gemini 格式）
 * @param history Gemini 格式的历史记录
 * @param newMessage 新消息
 * @param options 配置选项
 * @returns AI 回复
 */
export const sendChatMessageCompat = async (
  history: { role: 'user' | 'model', parts: { text: string }[] }[],
  newMessage: string,
  options?: { 
    isThinkingMode?: boolean;
    isStoryboard?: boolean;
    isHelpMeWrite?: boolean;
    systemPrompt?: string;
  }
): Promise<string> => {
  // 转换 Gemini 格式到 OpenAI 格式
  const messages: ChatMessage[] = history.map(msg => ({
    role: msg.role === 'model' ? 'assistant' : 'user',
    content: msg.parts.map(p => p.text).join('\n')
  }));

  // 添加新消息
  messages.push({
    role: 'user',
    content: newMessage
  });

  // 根据选项设置系统提示词
  let systemPrompt = options?.systemPrompt;
  
  if (options?.isStoryboard) {
    systemPrompt = `You are a professional film director and cinematographer.
Your task is to break down a user's prompt into a sequence of detailed shots (storyboard).
Output strictly valid JSON array of strings. No markdown.
Each string should be a highly detailed image generation prompt for one shot.
Example: ["Wide shot of a cyberpunk city...", "Close up of a neon sign..."]`;
  } else if (options?.isHelpMeWrite) {
    systemPrompt = `You are a top-tier multimodal AI prompt engineering expert.
Your task is to optimize user prompts for AI image/video generation.
Provide detailed, structured prompts with quality control parameters.`;
  } else if (!systemPrompt) {
    systemPrompt = `You are SunStudio AI, an expert multimedia creative assistant.
Your goal is to assist users in generating images, videos, audio, and scripts.
Always be concise, professional, and helpful.
When the user asks for creative ideas, provide vivid, detailed descriptions suitable for generative AI prompts.`;
  }

  return sendChatMessage(messages, {
    model: options?.isThinkingMode ? 'gpt-4o' : 'gpt-4o-mini',
    systemPrompt: systemPrompt,
    temperature: 0.7
  });
};

/**
 * 生成分镜脚本
 * @param prompt 用户提示词
 * @param context 上下文信息
 * @returns 分镜描述数组
 */
export const planStoryboard = async (prompt: string, context: string): Promise<string[]> => {
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: `You are a professional film director and cinematographer.
Your task is to break down a user's prompt into a sequence of detailed shots (storyboard).
Output strictly valid JSON array of strings. No markdown, no code blocks.
Each string should be a highly detailed image generation prompt for one shot.`
    },
    {
      role: 'user',
      content: `Context: ${context}\n\nUser Idea: ${prompt}\n\nGenerate a storyboard as a JSON array of shot descriptions.`
    }
  ];

  try {
    const response = await sendChatMessage(messages, {
      model: 'gpt-4o-mini',
      temperature: 0.8
    });

    // 尝试解析 JSON
    // 移除可能的 markdown 代码块标记
    let cleanResponse = response.trim();
    if (cleanResponse.startsWith('```')) {
      cleanResponse = cleanResponse.replace(/```json?\n?/g, '').replace(/```\n?$/g, '');
    }

    const storyboard = JSON.parse(cleanResponse);
    
    if (Array.isArray(storyboard)) {
      return storyboard;
    } else {
      console.warn('[BLTCY] 返回的不是数组:', storyboard);
      return [];
    }
  } catch (error) {
    console.error('[BLTCY] 解析分镜失败:', error);
    return [];
  }
};

/**
 * 编排视频提示词（基于图片序列）
 * @param imageDescriptions 图片描述数组
 * @param userPrompt 用户意图
 * @returns 视频生成提示词
 */
export const orchestrateVideoPrompt = async (
  imageDescriptions: string[],
  userPrompt: string
): Promise<string> => {
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: `You are a video prompt engineering expert.
Your task is to create a seamless video generation prompt that bridges a sequence of images.
Analyze the provided image descriptions and the user's intent to create a prompt that describes the motion and transition.`
    },
    {
      role: 'user',
      content: `Image Sequence Descriptions:
${imageDescriptions.map((desc, i) => `${i + 1}. ${desc}`).join('\n')}

User Intent: ${userPrompt}

Create a single cohesive video prompt that describes the motion and transitions between these scenes.`
    }
  ];

  try {
    const response = await sendChatMessage(messages, {
      model: 'gpt-4o-mini',
      temperature: 0.7
    });
    return response;
  } catch (error) {
    console.error('[BLTCY] 编排视频提示词失败:', error);
    return userPrompt; // 失败时返回原始提示词
  }
};

/**
 * 更新 API 配置
 */
export const updateApiConfig = (apiKey: string, baseUrl?: string) => {
  console.log('[BLTCY] API 配置已更新');
  // 注意：这里需要修改为可配置的方式，当前是硬编码
};
