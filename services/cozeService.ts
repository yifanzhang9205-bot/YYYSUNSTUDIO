/**
 * Coze AI 导演助手服务
 * API 文档：https://www.coze.cn/docs/developer_guides/chat_v3
 */

// API 配置 - 从环境变量读取
const getApiConfig = () => {
  const apiKey = import.meta.env.VITE_COZE_API_KEY || process.env.COZE_API_KEY || 'pat_d3JkCQSKDAVnS7czYyb8CXpf5WGqjwJ5nsvkHSz8A4tqo7EVe3mwC5YzNq7017mF';
  const botId = import.meta.env.VITE_COZE_BOT_ID || process.env.COZE_BOT_ID || '7598900942121271323';
  const baseUrl = import.meta.env.VITE_COZE_API_BASE_URL || process.env.COZE_API_BASE_URL || 'https://api.coze.cn';
  
  return { apiKey, botId, baseUrl };
};

const API_BASE_URL = 'https://api.coze.cn/v1';
const API_KEY = 'pat_d3JkCQSKDAVnS7czYyb8CXpf5WGqjwJ5nsvkHSz8A4tqo7EVe3mwC5YzNq7017mF';
const BOT_ID = '7598900942121271323';

interface CozeMessage {
  role: 'user' | 'assistant';
  content: string;
  content_type: 'text';
}

interface CozeChatRequest {
  bot_id: string;
  user_id: string;
  stream: boolean;
  auto_save_history: boolean;
  additional_messages: CozeMessage[];
}

interface CozeChatResponse {
  code: number;
  msg: string;
  data: {
    conversation_id: string;
    id: string;
    created_at: number;
    last_error?: {
      code: number;
      msg: string;
    };
    status: 'created' | 'in_progress' | 'completed' | 'failed' | 'requires_action';
    required_action?: any;
    usage?: {
      token_count: number;
      output_count: number;
      input_count: number;
    };
  };
  messages?: Array<{
    role: 'assistant';
    type: 'answer';
    content: string;
  }>;
}

interface OptimizePromptRequest {
  function: 'optimize_prompt';
  userInput: string;
  nodeType: 'IMAGE_GENERATOR' | 'VIDEO_GENERATOR' | 'CHARACTER_REFERENCE' | 'SCENE_REFERENCE';
  context: {
    aspectRatio?: string;
    style?: string;
  };
}

interface OptimizePromptResponse {
  function: 'optimize_prompt';
  result: {
    versions: {
      concise: string;
      standard: string;
      cinematic: string;
    };
    negativePrompt: string;
    parameters: {
      aspectRatio: string;
      shotType: string;
      cameraAngle: string;
      lighting: string;
      style: string;
    };
    reasoning: string;
  };
}

interface BreakdownScriptRequest {
  function: 'breakdown_script';
  script: string;
  preferences: {
    targetDuration?: number;
    shotCount?: number;
    style?: string;
  };
}

interface BreakdownScriptResponse {
  function: 'breakdown_script';
  result: {
    title: string;
    logline: string;
    theme: string;
    characters: Array<{
      name: string;
      description: string;
      personality: string;
      visualKeywords: string[];
    }>;
    scenes: Array<{
      sceneNumber: number;
      location: string;
      timeOfDay: string;
      mood: string;
      description: string;
      visualKeywords: string[];
    }>;
    shots: Array<{
      shotNumber: number;
      sceneNumber: number;
      shotType: string;
      cameraAngle: string;
      cameraMovement: string;
      duration: number;
      characters: string[];
      action: string;
      dialogue?: string;
      visualDescription: string;
      imagePrompt: string;
    }>;
  };
}

interface BatchOptimizeRequest {
  function: 'batch_optimize';
  prompts: string[];
  optimizationGoal: 'unify_style' | 'unify_tone' | 'unify_camera';
  targetStyle: string;
}

interface BatchOptimizeResponse {
  function: 'batch_optimize';
  result: {
    optimizedPrompts: string[];
    changes: string[];
    reasoning: string;
  };
}

interface ChatRequest {
  function: 'chat';
  message: string;
  context?: {
    currentWorkflow?: {
      nodeCount: number;
      nodeTypes: string[];
      hasGroups: boolean;
    };
  };
}

interface ChatResponse {
  function: 'chat';
  result: {
    message: string;
    suggestions?: Array<{
      action: string;
      description: string;
    }>;
  };
}

/**
 * 获取对话消息列表
 */
const getChatMessages = async (
  conversationId: string,
  chatId: string
): Promise<any[]> => {
  const config = getApiConfig();
  
  try {
    const response = await fetch(
      `${config.baseUrl}/v3/chat/message/list?conversation_id=${conversationId}&chat_id=${chatId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`
        }
      }
    );
    
    if (!response.ok) {
      console.error('[Coze] 获取消息失败:', response.status);
      return [];
    }
    
    const result = await response.json();
    console.log('[Coze] 获取消息成功:', {
      code: result.code,
      messageCount: result.data?.length || 0
    });
    
    return result.data || [];
  } catch (error) {
    console.error('[Coze] 获取消息异常:', error);
    return [];
  }
};

/**
 * 轮询获取对话结果
 */
const pollChatResult = async (
  conversationId: string,
  chatId: string,
  maxAttempts: number = 30
): Promise<CozeChatResponse> => {
  const config = getApiConfig();
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // 等待 1 秒
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log(`[Coze] 轮询第 ${attempt + 1} 次...`);
    
    try {
      const response = await fetch(
        `${config.baseUrl}/v3/chat/retrieve?conversation_id=${conversationId}&chat_id=${chatId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${config.apiKey}`
          }
        }
      );
      
      if (!response.ok) {
        console.error('[Coze] 轮询失败:', response.status);
        continue;
      }
      
      const result: CozeChatResponse = await response.json();
      
      console.log('[Coze] 轮询状态:', {
        status: result.data?.status,
        hasMessages: !!result.messages,
        messageCount: result.messages?.length || 0
      });
      
      // 如果完成，获取消息列表
      if (result.data.status === 'completed') {
        console.log('[Coze] 对话完成，获取消息列表...');
        const messages = await getChatMessages(conversationId, chatId);
        
        // 将消息添加到结果中
        result.messages = messages.map((msg: any) => ({
          role: msg.role,
          type: msg.type,
          content: msg.content
        }));
        
        console.log('[Coze] 最终消息数量:', result.messages.length);
        return result;
      }
      
      // 如果失败，抛出错误
      if (result.data.status === 'failed') {
        const errorMsg = result.data.last_error?.msg || '未知错误';
        throw new Error(`AI 处理失败: ${errorMsg}`);
      }
      
      // 继续轮询
    } catch (error) {
      console.error('[Coze] 轮询异常:', error);
      // 继续尝试
    }
  }
  
  throw new Error('AI 响应超时，请重试');
};

/**
 * 发送消息到 Coze AI 导演
 */
const sendCozeMessage = async (
  userMessage: string,
  conversationId?: string
): Promise<CozeChatResponse> => {
  const config = getApiConfig();
  const userId = 'sunstudio_user_' + Date.now();
  
  const requestBody: CozeChatRequest = {
    bot_id: config.botId,
    user_id: userId,
    stream: false,
    auto_save_history: true,
    additional_messages: [
      {
        role: 'user',
        content: userMessage,
        content_type: 'text'
      }
    ]
  };

  console.log('[Coze] 发送请求:', {
    bot_id: config.botId,
    messageLength: userMessage.length,
    conversationId
  });

  try {
    // 1. 创建对话
    const response = await fetch(`${config.baseUrl}/v3/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Coze] API 错误:', response.status, errorText);
      throw new Error(`API 请求失败: ${response.status} - ${errorText}`);
    }

    const result: CozeChatResponse = await response.json();
    console.log('[Coze] 创建对话成功:', {
      code: result.code,
      status: result.data?.status,
      conversation_id: result.data?.conversation_id,
      chat_id: result.data?.id
    });

    if (result.code !== 0) {
      throw new Error(`Coze API 错误: ${result.msg}`);
    }

    // 2. 如果状态是 in_progress，需要轮询
    if (result.data.status === 'in_progress' || result.data.status === 'created') {
      console.log('[Coze] 开始轮询结果...');
      return await pollChatResult(result.data.conversation_id, result.data.id);
    }

    // 3. 如果已经完成，直接返回
    if (result.data.status === 'completed') {
      return result;
    }

    // 4. 如果失败
    if (result.data.status === 'failed') {
      const errorMsg = result.data.last_error?.msg || '未知错误';
      throw new Error(`AI 处理失败: ${errorMsg}`);
    }

    return result;
  } catch (error: any) {
    console.error('[Coze] 请求异常:', error);
    
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
 * 解析 Coze 返回的 JSON 内容
 */
const parseCozeResponse = <T>(response: CozeChatResponse): T => {
  if (!response.messages || response.messages.length === 0) {
    throw new Error('AI 未返回任何内容');
  }

  const content = response.messages[0].content;
  
  try {
    // 移除可能的 markdown 代码块标记
    let cleanContent = content.trim();
    if (cleanContent.startsWith('```')) {
      cleanContent = cleanContent.replace(/```json?\n?/g, '').replace(/```\n?$/g, '');
    }
    
    const parsed = JSON.parse(cleanContent);
    return parsed as T;
  } catch (error) {
    console.error('[Coze] JSON 解析失败:', content);
    throw new Error('AI 返回的格式不正确，请重试');
  }
};

/**
 * 优化提示词
 * @param userInput 用户的简单描述
 * @param nodeType 节点类型
 * @param context 上下文信息
 * @returns 优化后的提示词（3个版本）
 */
export const optimizePrompt = async (
  userInput: string,
  nodeType: 'IMAGE_GENERATOR' | 'VIDEO_GENERATOR' | 'CHARACTER_REFERENCE' | 'SCENE_REFERENCE',
  context: {
    aspectRatio?: string;
    style?: string;
  } = {}
): Promise<OptimizePromptResponse['result']> => {
  const request: OptimizePromptRequest = {
    function: 'optimize_prompt',
    userInput,
    nodeType,
    context: {
      aspectRatio: context.aspectRatio || '16:9',
      style: context.style
    }
  };

  const response = await sendCozeMessage(JSON.stringify(request));
  const parsed = parseCozeResponse<OptimizePromptResponse>(response);
  
  return parsed.result;
};

/**
 * 剧本分解
 * @param script 剧本或故事大纲
 * @param preferences 偏好设置
 * @returns 分解后的角色、场景、镜头列表
 */
export const breakdownScript = async (
  script: string,
  preferences: {
    targetDuration?: number;
    shotCount?: number;
    style?: string;
  } = {}
): Promise<BreakdownScriptResponse['result']> => {
  const request: BreakdownScriptRequest = {
    function: 'breakdown_script',
    script,
    preferences: {
      targetDuration: preferences.targetDuration || 60,
      shotCount: preferences.shotCount || 10,
      style: preferences.style
    }
  };

  const response = await sendCozeMessage(JSON.stringify(request));
  const parsed = parseCozeResponse<BreakdownScriptResponse>(response);
  
  return parsed.result;
};

/**
 * 批量优化提示词
 * @param prompts 提示词数组
 * @param optimizationGoal 优化目标
 * @param targetStyle 目标风格
 * @returns 优化后的提示词数组
 */
export const batchOptimize = async (
  prompts: string[],
  optimizationGoal: 'unify_style' | 'unify_tone' | 'unify_camera',
  targetStyle: string
): Promise<BatchOptimizeResponse['result']> => {
  const request: BatchOptimizeRequest = {
    function: 'batch_optimize',
    prompts,
    optimizationGoal,
    targetStyle
  };

  const response = await sendCozeMessage(JSON.stringify(request));
  const parsed = parseCozeResponse<BatchOptimizeResponse>(response);
  
  return parsed.result;
};

/**
 * 清理 AI 回复，移除不必要的英文和括号
 */
const cleanAIResponse = (text: string): string => {
  // 如果是提示词优化结果（包含"版本一"、"版本二"等），不清理
  if (text.includes('版本一') || text.includes('版本二') || text.includes('Optimized Prompt')) {
    return text;
  }
  
  // 如果是 JSON 格式，不清理
  if (text.trim().startsWith('[') || text.trim().startsWith('{')) {
    return text;
  }
  
  // 移除括号中的英文注释
  // 例如："这是一个场景 (This is a scene)" → "这是一个场景"
  let cleaned = text.replace(/\s*\([A-Za-z\s,]+\)/g, '');
  
  // 移除纯英文的句子（保留中英混合）
  // 例如："This is English. 这是中文。" → "这是中文。"
  cleaned = cleaned.replace(/^[A-Za-z\s,\.!?]+$/gm, '');
  
  // 移除多余的空行
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  
  return cleaned.trim();
};

/**
 * 对话助手
 * @param message 用户消息
 * @param context 当前工作流上下文
 * @returns AI 回复文本
 */
export const chat = async (
  message: string,
  context?: {
    currentWorkflow?: {
      nodeCount: number;
      nodeTypes: string[];
      hasGroups: boolean;
    };
  }
): Promise<string> => {
  // 直接发送用户消息，不包装成 JSON
  const response = await sendCozeMessage(message);
  
  // 提取 AI 回复
  if (!response.messages || response.messages.length === 0) {
    throw new Error('AI 未返回任何内容');
  }
  
  // 找到 answer 类型的消息
  const answerMessage = response.messages.find(msg => msg.type === 'answer');
  if (answerMessage && answerMessage.content) {
    return cleanAIResponse(answerMessage.content);
  }
  
  // 如果没有 answer，返回第一条消息
  return cleanAIResponse(response.messages[0].content);
};

/**
 * 兼容旧的 Gemini 格式的对话接口
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
  }
): Promise<string> => {
  // 如果是分镜模式，使用剧本分解功能
  if (options?.isStoryboard) {
    try {
      const result = await breakdownScript(newMessage, {
        shotCount: 10
      });
      
      // 返回镜头描述数组的 JSON 字符串
      const shots = result.shots.map(shot => shot.imagePrompt);
      return JSON.stringify(shots);
    } catch (error) {
      console.error('[Coze] 分镜生成失败:', error);
      throw error;
    }
  }
  
  // 如果是提示词优化模式
  if (options?.isHelpMeWrite) {
    try {
      const result = await optimizePrompt(newMessage, 'IMAGE_GENERATOR');
      
      // 格式化输出
      const output = `### ✨ 优化提示词 (Optimized Prompt)

#### 版本一：简洁关键词 (Concise)
${result.versions.concise}

#### 版本二：标准结构化提示 (Standard Structured Prompt)
${result.versions.standard}

#### 版本三：叙事性/文学性提示 (Narrative/Literary Prompt)
${result.versions.cinematic}

---

### 🚫 高级质量控制 (Advanced Quality Control)

* **负面提示 (Negative Prompt):**
    * ${result.negativePrompt}
* **核心参数与权重建议:**
    * 画面比例: ${result.parameters.aspectRatio}
    * 镜头类型: ${result.parameters.shotType}
    * 机位角度: ${result.parameters.cameraAngle}
    * 光线: ${result.parameters.lighting}
    * 风格: ${result.parameters.style}

### 💡 优化说明与下一步 (Rationale & Next Step)

* **本次优化核心：** ${result.reasoning}
`;
      
      return output;
    } catch (error) {
      console.error('[Coze] 提示词优化失败:', error);
      throw error;
    }
  }
  
  // 普通对话模式
  try {
    const result = await chat(newMessage);
    return result.message;
  } catch (error) {
    console.error('[Coze] 对话失败:', error);
    throw error;
  }
};

/**
 * 生成分镜脚本（兼容旧接口）
 * @param prompt 用户提示词
 * @param context 上下文信息
 * @returns 分镜描述数组
 */
export const planStoryboard = async (prompt: string, context: string): Promise<string[]> => {
  try {
    const result = await breakdownScript(prompt, {
      shotCount: 10
    });
    
    // 返回镜头的图片生成提示词数组
    return result.shots.map(shot => shot.imagePrompt);
  } catch (error) {
    console.error('[Coze] 分镜生成失败:', error);
    return [];
  }
};

/**
 * 编排视频提示词（兼容旧接口）
 * @param imageDescriptions 图片描述数组
 * @param userPrompt 用户意图
 * @returns 视频生成提示词
 */
export const orchestrateVideoPrompt = async (
  imageDescriptions: string[],
  userPrompt: string
): Promise<string> => {
  try {
    // 使用对话功能来编排视频提示词
    const message = `我有以下图片序列：
${imageDescriptions.map((desc, i) => `${i + 1}. ${desc}`).join('\n')}

用户意图：${userPrompt}

请帮我创建一个连贯的视频生成提示词，描述这些场景之间的运动和过渡。`;

    const result = await chat(message);
    return result.message;
  } catch (error) {
    console.error('[Coze] 视频提示词编排失败:', error);
    return userPrompt; // 失败时返回原始提示词
  }
};

/**
 * 生成剧本
 * @param userIdea 用户创意描述
 * @param targetDuration 目标时长（秒）
 * @returns 完整的剧本数据
 */
export const generateScript = async (
  userIdea: string,
  targetDuration: number = 60
): Promise<any> => {
  const prompt = `请根据以下创意生成一个专业的影视剧本：

创意：${userIdea}
目标时长：${targetDuration} 秒

要求：
1. 生成剧本标题、一句话概述、主题
2. 提取 2-3 个主要角色（包含外貌描述、性格特点、视觉关键词）
3. 设计 1-2 个场景（包含地点、时间、情绪、视觉关键词）
4. 分解为 6-10 个镜头（包含镜头类型、机位角度、运镜方式、动作、台词、视觉描述、图片生成提示词）

请以 JSON 格式返回，严格遵循以下结构：
{
  "title": "剧本标题",
  "logline": "一句话概述",
  "theme": "主题/情绪",
  "targetDuration": ${targetDuration},
  "characters": [
    {
      "id": "char-1",
      "name": "角色名",
      "description": "外貌描述",
      "personality": "性格特点",
      "visualKeywords": ["关键词1", "关键词2"]
    }
  ],
  "scenes": [
    {
      "id": "scene-1",
      "sceneNumber": 1,
      "location": "INT. 地点",
      "timeOfDay": "时间",
      "mood": "情绪",
      "description": "场景描述",
      "visualKeywords": ["关键词1", "关键词2"]
    }
  ],
  "shots": [
    {
      "id": "shot-1",
      "shotNumber": 1,
      "sceneId": "scene-1",
      "shotType": "Wide Shot",
      "cameraAngle": "Eye Level",
      "cameraMovement": "Static",
      "duration": 3,
      "characters": ["角色名"],
      "action": "动作描述",
      "dialogue": "台词（可选）",
      "visualDescription": "详细的视觉描述",
      "imagePrompt": "英文图片生成提示词"
    }
  ],
  "createdAt": ${Date.now()},
  "updatedAt": ${Date.now()},
  "version": 1
}

注意：
- shotType 必须是：Extreme Wide Shot, Wide Shot, Full Shot, Medium Shot, Close-Up, Extreme Close-Up 之一
- cameraAngle 必须是：Eye Level, High Angle, Low Angle, Bird's Eye View, Dutch Angle 之一
- cameraMovement 必须是：Static, Pan, Tilt, Dolly, Track, Crane, Handheld 之一
- imagePrompt 必须是英文，详细描述画面内容、光线、色调、构图`;

  console.log('[Coze] 开始生成剧本...');
  
  try {
    const response = await sendCozeMessage(prompt);
    const scriptData = parseCozeResponse<any>(response);
    
    console.log('[Coze] 剧本生成成功:', {
      title: scriptData.title,
      characterCount: scriptData.characters?.length || 0,
      sceneCount: scriptData.scenes?.length || 0,
      shotCount: scriptData.shots?.length || 0
    });
    
    return scriptData;
  } catch (error) {
    console.error('[Coze] 剧本生成失败:', error);
    throw error;
  }
};

/**
 * 更新 API 配置
 */
export const updateCozeConfig = (apiKey: string, botId: string, baseUrl?: string) => {
  console.log('[Coze] API 配置已更新');
  // 注意：这里需要修改为可配置的方式，当前是硬编码
};

/**
 * 检查 Coze API 是否可用
 * @returns 是否可用
 */
export const isCozeAvailable = (): boolean => {
  const config = getApiConfig();
  return !!(config.apiKey && config.botId);
};

/**
 * 根据用户描述生成专业提示词
 * @param description - 用户的自然语言描述
 * @param signal - AbortSignal（可选，用于取消请求）
 * @returns 生成的专业提示词
 */
export const generatePromptFromDescription = async (
    description: string,
    signal?: AbortSignal
): Promise<string> => {
  try {
    const result = await optimizePrompt(description, 'IMAGE_GENERATOR');
    
    // 返回标准结构化提示词（版本二）
    return result.versions.standard;
  } catch (error) {
    console.error('[Coze] 提示词生成失败:', error);
    throw error;
  }
};

/**
 * 分析图片并生成提示词（用于文字节点的图片反推功能）
 * @param imageBase64 - Base64 图片数据
 * @param signal - AbortSignal（可选，用于取消请求）
 * @returns 分析出的提示词
 */
export const analyzeImageForPrompt = async (
    imageBase64: string,
    signal?: AbortSignal
): Promise<string> => {
  try {
    // 构建图片分析提示
    const analysisPrompt = `请分析这张图片，并按照以下结构生成专业的 AI 图片生成提示词：

**必须包含以下 7 个要素：**

1. **[核心主体]** - 图片的主要对象是什么？（人物、动物、物体等）
2. **[动作/场景]** - 主体在做什么？处于什么场景？
3. **[画风/媒介]** - 艺术风格、绘画媒介、摄影风格（如：写实、油画、3D渲染、电影感等）
4. **[镜头参数]** - 镜头类型、景别、角度（如：广角、特写、俯视、仰视等）
5. **[光影氛围]** - 光线类型、明暗对比、氛围感（如：柔和光、戏剧性光影、黄金时段等）
6. **[色彩方案]** - 主要色调、配色方案（如：暖色调、冷色调、高饱和度、莫兰迪色系等）
7. **[细节/材质]** - 重要的细节、材质、纹理（如：皮肤质感、布料纹理、金属光泽等）

**输出格式要求：**
- 直接输出提示词内容，不要输出标签或编号
- 用自然流畅的语言组织，不要生硬地列举
- 长度控制在 150-200 字
- 使用专业的摄影和艺术术语
- 适合直接用于 AI 图片生成

**示例格式：**
"一位年轻女性站在霓虹灯闪烁的赛博朋克街道上，身穿未来感科技外套，电影级构图，使用 35mm 镜头拍摄，低角度仰视，戏剧性的蓝紫色霓虹光影，高对比度，冷色调为主配以暖色点缀，精致的面部细节和服装材质，8K 超高清画质"

请根据图片内容生成提示词：`;

    // 注意：Coze API 目前不直接支持图片输入
    // 这里我们先用文本描述的方式，未来可以扩展为支持图片
    // 临时方案：提示用户 Coze 暂不支持图片分析，建议使用 Gemini
    
    console.warn('[Coze] 当前 Coze API 不支持图片分析，将使用 Gemini API 作为备用');
    
    // 抛出特定错误，让调用方切换到 Gemini
    throw new Error('COZE_IMAGE_NOT_SUPPORTED');
    
  } catch (error) {
    console.error('[Coze] 图片分析失败:', error);
    throw error;
  }
};
