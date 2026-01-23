# BLTCY 对话 API 接入说明

## 更新时间
2026-01-21

## 接入内容

### 1. 新增服务文件
创建了 `services/bltcyService.ts`，集成 BLTCY AI 对话 API。

### 2. API 配置
- **API 地址**: `https://api.bltcy.ai`
- **API 密钥**: `sk-BN7z574kow0App9HZviHJu3TJIQqo0AEKIMFT18XkQ4FL5H2`
- **API 格式**: OpenAI 兼容格式

### 3. 支持的功能

#### 基础对话
- **默认模型**: `gpt-4o-mini`（快速、经济）
- **思考模式**: `gpt-4o`（更强大的推理能力）
- **温度控制**: 0.0 - 2.0（默认 0.7）
- **最大 Token**: 可自定义

**使用示例**:
```typescript
import { sendChatMessage } from './services/bltcyService';

const messages = [
  { role: 'user', content: 'Hello, how are you?' }
];

const response = await sendChatMessage(messages, {
  model: 'gpt-4o-mini',
  temperature: 0.7
});

console.log(response);
```

#### 流式对话
支持实时流式输出，适合聊天界面。

**使用示例**:
```typescript
import { sendChatMessageStream } from './services/bltcyService';

const messages = [
  { role: 'user', content: 'Tell me a story' }
];

await sendChatMessageStream(
  messages,
  (chunk) => {
    console.log('收到文本块:', chunk);
    // 实时显示到界面
  },
  { model: 'gpt-4o-mini' }
);
```

#### 分镜脚本生成
基于用户创意生成详细的分镜描述。

**使用示例**:
```typescript
import { planStoryboard } from './services/bltcyService';

const shots = await planStoryboard(
  'A hero saves the world',
  'Epic sci-fi action movie'
);

console.log('分镜数量:', shots.length);
// ["Wide shot of a futuristic city...", "Close up of hero's face..."]
```

#### 视频提示词编排
基于图片序列生成连贯的视频提示词。

**使用示例**:
```typescript
import { orchestrateVideoPrompt } from './services/bltcyService';

const imageDescriptions = [
  'A sunrise over mountains',
  'Birds flying in the sky',
  'A peaceful lake'
];

const videoPrompt = await orchestrateVideoPrompt(
  imageDescriptions,
  'Create a peaceful nature scene'
);

console.log('视频提示词:', videoPrompt);
```

### 4. 兼容性接口

为了保持与现有代码的兼容性，提供了 `sendChatMessageCompat` 函数，可以直接替换原来的 Gemini 对话接口。

**Gemini 格式**:
```typescript
const history = [
  { role: 'user', parts: [{ text: 'Hello' }] },
  { role: 'model', parts: [{ text: 'Hi there!' }] }
];

const response = await sendChatMessageCompat(history, 'How are you?', {
  isThinkingMode: false,
  isStoryboard: false,
  isHelpMeWrite: false
});
```

### 5. 集成到现有系统

#### 对话功能集成
修改了 `services/geminiService.ts` 中的以下函数：

1. **sendChatMessage()**
   - 优先使用 BLTCY API
   - 备用方案：Gemini API

2. **planStoryboard()**
   - 优先使用 BLTCY API
   - 备用方案：Gemini API

3. **orchestrateVideoPrompt()**
   - 优先使用 BLTCY API（文本编排）
   - 备用方案：Gemini API（支持图片输入）

### 6. 系统提示词

#### 默认助手提示词
```
You are SunStudio AI, an expert multimedia creative assistant.
Your goal is to assist users in generating images, videos, audio, and scripts.
Always be concise, professional, and helpful.
```

#### 分镜生成提示词
```
You are a professional film director and cinematographer.
Your task is to break down a user's prompt into a sequence of detailed shots.
Output strictly valid JSON array of strings.
```

#### 提示词优化提示词
```
You are a top-tier multimodal AI prompt engineering expert.
Your task is to optimize user prompts for AI image/video generation.
```

### 7. 错误处理

#### 友好错误提示
- `401/Unauthorized`: API 密钥无效
- `429/rate_limit`: 请求过于频繁
- `quota/insufficient`: API 配额不足
- `timeout`: 请求超时

#### 自动备用方案
所有对话功能都有 Gemini API 作为备用，确保服务可用性。

### 8. 模型选择

#### 可用模型
- `gpt-4o-mini`: 快速、经济，适合日常对话
- `gpt-4o`: 强大的推理能力，适合复杂任务
- `gpt-3.5-turbo`: 经济型选择（如果支持）

#### 自动选择策略
- 普通对话：`gpt-4o-mini`
- 思考模式：`gpt-4o`
- 分镜生成：`gpt-4o-mini`
- 提示词优化：`gpt-4o-mini`

### 9. API 请求格式

#### 标准请求
```json
{
  "model": "gpt-4o-mini",
  "messages": [
    {
      "role": "system",
      "content": "You are a helpful assistant."
    },
    {
      "role": "user",
      "content": "Hello!"
    }
  ],
  "temperature": 0.7,
  "max_tokens": 2000,
  "stream": false
}
```

#### 流式请求
```json
{
  "model": "gpt-4o-mini",
  "messages": [...],
  "stream": true
}
```

### 10. API 响应格式

#### 标准响应
```json
{
  "id": "chatcmpl-xxx",
  "object": "chat.completion",
  "created": 1234567890,
  "model": "gpt-4o-mini",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Hello! How can I help you?"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 20,
    "total_tokens": 30
  }
}
```

#### 流式响应
```
data: {"choices":[{"delta":{"content":"Hello"}}]}
data: {"choices":[{"delta":{"content":"!"}}]}
data: [DONE]
```

### 11. 注意事项

1. **API 密钥安全**: 密钥已硬编码在 `bltcyService.ts` 中，生产环境建议使用环境变量
2. **图片输入限制**: BLTCY API 不支持图片输入，涉及图片的功能会自动切换到 Gemini 备用
3. **Token 限制**: 注意控制输入和输出的 token 数量，避免超出限制
4. **速率限制**: 注意 API 的速率限制，避免请求过于频繁

### 12. 性能对比

| 功能 | BLTCY API | Gemini API | 备注 |
|------|-----------|------------|------|
| 文本对话 | ✅ 快速 | ✅ 快速 | BLTCY 优先 |
| 图片理解 | ❌ 不支持 | ✅ 支持 | 自动切换 |
| 分镜生成 | ✅ 支持 | ✅ 支持 | BLTCY 优先 |
| 流式输出 | ✅ 支持 | ✅ 支持 | BLTCY 优先 |
| 成本 | 💰 经济 | 💰 中等 | - |

### 13. 后续优化建议

1. **环境变量配置**: 将 API 密钥移到 `.env.local` 文件
2. **图片描述**: 实现图片自动描述功能，让 BLTCY 也能处理图片相关任务
3. **缓存机制**: 对相同问题的回答进行缓存
4. **上下文管理**: 优化对话历史的管理，控制 token 使用
5. **流式 UI**: 在聊天界面实现流式输出显示

## 测试建议

### 基础对话测试
1. 打开应用的聊天窗口
2. 发送消息："你好，介绍一下自己"
3. 观察控制台日志，确认使用 BLTCY API
4. 检查回复质量

### 分镜生成测试
1. 创建"创意工作室"节点
2. 输入故事创意："一个英雄拯救世界的故事"
3. 点击生成分镜
4. 观察控制台日志，确认使用 BLTCY API
5. 检查生成的分镜描述

### 提示词优化测试
1. 在聊天窗口输入："帮我优化这个提示词：一个女孩"
2. 观察 AI 是否提供详细的优化建议
3. 检查优化后的提示词质量

## 文件修改清单

- ✅ 新增: `services/bltcyService.ts` - BLTCY 对话 API 服务
- ✅ 修改: `services/geminiService.ts` - 集成 BLTCY API，添加备用方案
- ✅ 新增: `BLTCY对话API接入说明.md` - 本文档

## 完成状态

- ✅ 基础对话 API 接入
- ✅ 流式对话支持
- ✅ 分镜生成接入
- ✅ 视频提示词编排接入
- ✅ 兼容性接口
- ✅ 错误处理和友好提示
- ✅ 自动备用方案（Gemini API）

---

**接入完成！** 🎉

现在所有的对话功能都会优先使用 BLTCY API，如果失败会自动切换到 Gemini 备用方案。
