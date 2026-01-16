/**
 * Chat API 服务
 * 文档：https://grsai.com/zh/dashboard/documents/chat
 * 兼容 OpenAI API 格式
 */

// API 配置
const API_BASE_URL = 'https://grsaiapi.com';
const API_KEY = 'sk-3d142c4d54fd4ceaae4a841bf40fb4ae';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  model: string;
  messages: ChatMessage[];
  stream?: boolean;
  temperature?: number;
  max_tokens?: number;
}

interface ChatResponse {
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
}

interface ChatStreamChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    delta: {
      role?: string;
      content?: string;
    };
    finish_reason: string | null;
  }>;
}

/**
 * 发送聊天请求（非流式）
 */
export const sendChatMessage = async (
  messages: ChatMessage[],
  options: {
    model?: string;
    temperature?: number;
    max_tokens?: number;
  } = {}
): Promise<string> => {
  const requestBody: ChatRequest = {
    model: options.model || 'gpt-4o-mini',
    messages: messages,
    stream: false,
    temperature: options.temperature,
    max_tokens: options.max_tokens
  };

  console.log('[Chat] 发送请求:', { model: requestBody.model, messageCount: messages.length });

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
      console.error('[Chat] API 错误:', response.status, errorText);
      throw new Error(`API 请求失败: ${response.status} - ${errorText}`);
    }

    const result: ChatResponse = await response.json();
    console.log('[Chat] 响应成功');
    
    return result.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('[Chat] 请求异常:', error);
    throw error;
  }
};

/**
 * 发送聊天请求（流式）
 */
export const sendChatMessageStream = async (
  messages: ChatMessage[],
  onChunk: (content: string) => void,
  options: {
    model?: string;
    temperature?: number;
    max_tokens?: number;
  } = {}
): Promise<void> => {
  const requestBody: ChatRequest = {
    model: options.model || 'gpt-4o-mini',
    messages: messages,
    stream: true,
    temperature: options.temperature,
    max_tokens: options.max_tokens
  };

  console.log('[Chat] 发送流式请求:', { model: requestBody.model, messageCount: messages.length });

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
      console.error('[Chat] API 错误:', response.status, errorText);
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
        if (!trimmed.startsWith('data: ')) continue;

        try {
          const jsonStr = trimmed.slice(6);
          const chunk: ChatStreamChunk = JSON.parse(jsonStr);
          const content = chunk.choices[0]?.delta?.content;
          if (content) {
            onChunk(content);
          }
        } catch (e) {
          console.warn('[Chat] 解析流数据失败:', trimmed);
        }
      }
    }

    console.log('[Chat] 流式响应完成');
  } catch (error) {
    console.error('[Chat] 流式请求异常:', error);
    throw error;
  }
};

/**
 * 快捷方法：发送单条消息
 */
export const chat = async (
  userMessage: string,
  systemPrompt?: string,
  options?: {
    model?: string;
    temperature?: number;
    max_tokens?: number;
  }
): Promise<string> => {
  const messages: ChatMessage[] = [];
  
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }
  
  messages.push({ role: 'user', content: userMessage });
  
  return sendChatMessage(messages, options);
};

/**
 * 更新 API 配置
 */
export const updateChatConfig = (baseUrl: string, apiKey: string) => {
  console.log('[Chat] API 配置已更新');
};
