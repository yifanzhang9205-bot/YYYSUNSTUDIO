# Coze AI 导演 - API 接口规范

## 📋 目录

1. [概述](#概述)
2. [认证](#认证)
3. [通用规范](#通用规范)
4. [API 端点](#api-端点)
5. [错误处理](#错误处理)
6. [速率限制](#速率限制)
7. [TypeScript 类型定义](#typescript-类型定义)

---

## 概述

本文档定义了 SunStudio 与 Coze 智能体之间的 API 接口规范。

### 基本信息

- **协议**：HTTPS
- **格式**：JSON
- **编码**：UTF-8
- **超时**：30 秒

### 端点 URL

- **国际版**：`https://api.coze.com/v1/chat`
- **国内版**：`https://api.coze.cn/v1/chat`

---

## 认证

### 请求头

```http
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json
```

### API 密钥管理

- 存储位置：`localStorage`（加密）
- 环境变量：`COZE_API_KEY`
- 密钥格式：`sk-xxxxxxxxxxxxxxxxxxxxxxxx`

---

## 通用规范

### 请求结构

```typescript
interface CozeRequest {
  bot_id: string;          // 智能体 ID
  user_id: string;         // 用户 ID（建议使用 UUID）
  stream: boolean;         // 是否流式输出（推荐 false）
  messages: Message[];     // 消息列表
}

interface Message {
  role: 'user' | 'assistant';
  content: string;         // JSON 字符串
  content_type?: 'text';   // 内容类型
}
```

### 响应结构

```typescript
interface CozeResponse {
  code: number;            // 状态码（0 = 成功）
  msg: string;             // 消息
  data: {
    conversation_id: string;
    messages: ResponseMessage[];
  };
}

interface ResponseMessage {
  role: 'assistant';
  content: string;         // JSON 字符串
  type: 'answer';
  content_type: 'text';
}
```

---

## API 端点

### 1. 提示词优化

#### 请求

```typescript
interface OptimizePromptRequest {
  function: 'optimize_prompt';
  userInput: string;       // 用户的简单描述
  nodeType: NodeType;      // 节点类型
  context?: {
    aspectRatio?: string;  // 画面比例
    style?: string;        // 风格关键词
  };
}

type NodeType = 
  | 'IMAGE_GENERATOR'
  | 'VIDEO_GENERATOR'
  | 'CHARACTER_REFERENCE'
  | 'SCENE_REFERENCE';
```

#### 响应

```typescript
interface OptimizePromptResponse {
  function: 'optimize_prompt';
  result: {
    versions: {
      concise: string;     // 简洁版（≤50字符）
      standard: string;    // 标准版（100-300字符）
      cinematic: string;   // 电影级（300-500字符）
    };
    negativePrompt: string;
    parameters: {
      aspectRatio: string;
      shotType: ShotType;
      cameraAngle: CameraAngle;
      lighting: string;
      style: string;
    };
    reasoning: string;     // 优化理由
  };
}

type ShotType = 
  | 'Extreme Wide Shot'
  | 'Wide Shot'
  | 'Full Shot'
  | 'Medium Shot'
  | 'Close-Up'
  | 'Extreme Close-Up';

type CameraAngle = 
  | 'Eye Level'
  | 'High Angle'
  | 'Low Angle'
  | 'Bird\'s Eye View'
  | 'Dutch Angle';
```

#### 示例

**请求**：
```json
{
  "bot_id": "your_bot_id",
  "user_id": "user_123",
  "stream": false,
  "messages": [{
    "role": "user",
    "content": "{\"function\":\"optimize_prompt\",\"userInput\":\"一个机器人\",\"nodeType\":\"IMAGE_GENERATOR\",\"context\":{\"aspectRatio\":\"16:9\",\"style\":\"cyberpunk\"}}"
  }]
}
```

**响应**：
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "conversation_id": "conv_123",
    "messages": [{
      "role": "assistant",
      "content": "{\"function\":\"optimize_prompt\",\"result\":{\"versions\":{\"concise\":\"humanoid robot, neon lights, cyberpunk, night\",\"standard\":\"Medium shot of a humanoid robot...\",\"cinematic\":\"In the rain-soaked streets...\"},\"negativePrompt\":\"blurry, deformed, low quality...\",\"parameters\":{\"aspectRatio\":\"16:9\",\"shotType\":\"Medium Shot\",\"cameraAngle\":\"Eye Level\",\"lighting\":\"Cinematic\",\"style\":\"Photorealistic\"},\"reasoning\":\"使用中景展示机器人全貌...\"}}",
      "type": "answer"
    }]
  }
}
```

---

### 2. 剧本分解

#### 请求

```typescript
interface BreakdownScriptRequest {
  function: 'breakdown_script';
  script: string;          // 剧本或故事大纲
  preferences?: {
    targetDuration?: number;  // 目标时长（秒）
    shotCount?: number;       // 镜头数量
    style?: string;           // 风格
  };
}
```

#### 响应

```typescript
interface BreakdownScriptResponse {
  function: 'breakdown_script';
  result: {
    title: string;
    logline: string;
    theme: string;
    characters: Character[];
    scenes: Scene[];
    shots: Shot[];
  };
}

interface Character {
  name: string;
  description: string;
  personality: string;
  visualKeywords: string[];
}

interface Scene {
  sceneNumber: number;
  location: string;
  timeOfDay: string;
  mood: string;
  description: string;
  visualKeywords: string[];
}

interface Shot {
  shotNumber: number;
  sceneNumber: number;
  shotType: ShotType;
  cameraAngle: CameraAngle;
  cameraMovement: CameraMovement;
  duration: number;
  characters: string[];
  action: string;
  dialogue?: string;
  visualDescription: string;
  imagePrompt: string;
}

type CameraMovement = 
  | 'Static'
  | 'Pan'
  | 'Tilt'
  | 'Dolly'
  | 'Track'
  | 'Crane'
  | 'Handheld';
```

---

### 3. 批量优化

#### 请求

```typescript
interface BatchOptimizeRequest {
  function: 'batch_optimize';
  prompts: string[];       // 提示词列表
  optimizationGoal: OptimizationGoal;
  targetStyle?: string;    // 目标风格
}

type OptimizationGoal = 
  | 'unify_style'          // 统一风格
  | 'unify_tone'           // 统一色调
  | 'unify_camera';        // 统一镜头语言
```

#### 响应

```typescript
interface BatchOptimizeResponse {
  function: 'batch_optimize';
  result: {
    optimizedPrompts: string[];
    changes: string[];     // 变更说明
    reasoning: string;     // 整体思路
  };
}
```

---

### 4. 对话助手

#### 请求

```typescript
interface ChatRequest {
  function: 'chat';
  message: string;         // 用户的问题
  context?: {
    currentWorkflow?: {
      nodeCount: number;
      nodeTypes: string[];
      hasGroups: boolean;
    };
  };
}
```

#### 响应

```typescript
interface ChatResponse {
  function: 'chat';
  result: {
    message: string;       // AI 的回复
    suggestions?: Suggestion[];
  };
}

interface Suggestion {
  action: 'create_node' | 'modify_node' | 'connect_nodes';
  description: string;
}
```

---

## 错误处理

### 错误码

| 错误码 | 说明 | HTTP 状态码 | 处理方式 |
|-------|------|------------|---------|
| 0 | 成功 | 200 | 正常处理 |
| 1001 | 参数错误 | 400 | 检查请求参数 |
| 1002 | JSON 格式错误 | 400 | 检查 JSON 格式 |
| 2001 | 未授权 | 401 | 检查 API Key |
| 2002 | 权限不足 | 403 | 联系管理员 |
| 3001 | 请求过多 | 429 | 等待后重试 |
| 3002 | 配额不足 | 429 | 充值或升级 |
| 5001 | 服务器错误 | 500 | 重试或联系支持 |
| 5002 | 超时 | 504 | 重试 |

### 错误响应格式

```typescript
interface ErrorResponse {
  code: number;
  msg: string;
  data: null;
}
```

### 错误处理示例

```typescript
async function callCozeAPI(request: CozeRequest): Promise<any> {
  try {
    const response = await fetch('https://api.coze.com/v1/chat', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request),
      signal: AbortSignal.timeout(30000) // 30秒超时
    });

    const data: CozeResponse = await response.json();

    if (data.code !== 0) {
      throw new CozeAPIError(data.code, data.msg);
    }

    // 解析 JSON 字符串
    const content = JSON.parse(data.data.messages[0].content);
    return content;

  } catch (error) {
    if (error instanceof CozeAPIError) {
      // 处理 API 错误
      handleAPIError(error);
    } else if (error.name === 'AbortError') {
      // 处理超时
      throw new Error('请求超时，请稍后重试');
    } else {
      // 处理其他错误
      throw new Error('网络错误，请检查连接');
    }
  }
}

class CozeAPIError extends Error {
  constructor(public code: number, public message: string) {
    super(message);
    this.name = 'CozeAPIError';
  }
}

function handleAPIError(error: CozeAPIError) {
  switch (error.code) {
    case 2001:
      throw new Error('API 密钥无效，请检查配置');
    case 3001:
      throw new Error('请求过于频繁，请稍后再试');
    case 3002:
      throw new Error('API 配额不足，请充值');
    case 5001:
    case 5002:
      throw new Error('服务暂时不可用，请稍后重试');
    default:
      throw new Error(`API 错误: ${error.message}`);
  }
}
```

---

## 速率限制

### 限制规则

- **免费版**：10 次/分钟，1000 次/天
- **付费版**：60 次/分钟，10000 次/天
- **企业版**：无限制

### 限制响应头

```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 59
X-RateLimit-Reset: 1640000000
```

### 超限处理

```typescript
function handleRateLimit(response: Response) {
  const remaining = parseInt(response.headers.get('X-RateLimit-Remaining') || '0');
  const reset = parseInt(response.headers.get('X-RateLimit-Reset') || '0');

  if (remaining === 0) {
    const waitTime = reset - Math.floor(Date.now() / 1000);
    throw new Error(`请求过多，请在 ${waitTime} 秒后重试`);
  }
}
```

---

## TypeScript 类型定义

完整的类型定义文件：`services/cozeService.ts`

```typescript
// 导出所有类型
export type {
  CozeRequest,
  CozeResponse,
  OptimizePromptRequest,
  OptimizePromptResponse,
  BreakdownScriptRequest,
  BreakdownScriptResponse,
  BatchOptimizeRequest,
  BatchOptimizeResponse,
  ChatRequest,
  ChatResponse,
  NodeType,
  ShotType,
  CameraAngle,
  CameraMovement,
  OptimizationGoal,
  Character,
  Scene,
  Shot
};

// 导出 API 函数
export {
  optimizePrompt,
  breakdownScript,
  batchOptimize,
  chat
};
```

---

**文档版本**：v1.0  
**创建日期**：2025-01-24  
**最后更新**：2025-01-24  
**作者**：Kiro AI
