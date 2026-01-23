# API 接入汇总

## 更新时间
2026-01-21

## 概述

SunStudio 现已集成三个主要 API 服务，实现了完整的 AI 创作工作流：

1. **西瓜皮 API** - 图片和视频生成
2. **BLTCY API** - 对话和文本生成
3. **Gemini API** - 备用方案和特殊功能

## API 服务架构

```
┌─────────────────────────────────────────────────────────┐
│                    SunStudio 应用                        │
└─────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  西瓜皮 API   │    │  BLTCY API   │    │  Gemini API  │
│              │    │              │    │              │
│ • 图片生成    │    │ • 对话       │    │ • 备用方案    │
│ • 视频生成    │    │ • 分镜生成    │    │ • 音频生成    │
│              │    │ • 提示词优化  │    │ • 视频分析    │
└──────────────┘    └──────────────┘    └──────────────┘
```

## 功能分配

### 图片生成
- **主要**: 西瓜皮 API (nanobananapro)
- **备用**: Gemini API (gemini-2.5-flash-image)

### 视频生成
- **主要**: 西瓜皮 API (hailuo)
- **备用 1**: Gemini API (veo-3.1)
- **备用 2**: 生成静态图片

### 对话功能
- **主要**: BLTCY API (gpt-4o-mini)
- **备用**: Gemini API (gemini-2.5-flash)

### 分镜生成
- **主要**: BLTCY API (gpt-4o-mini)
- **备用**: Gemini API (gemini-2.5-flash)

### 音频生成
- **唯一**: Gemini API (gemini-2.5-flash-preview-tts)

### 视频分析
- **唯一**: Gemini API (gemini-2.5-flash)

## API 配置信息

### 西瓜皮 API
```
地址: https://tasks.xiguapi.tech/
密钥: w8n-cYYtSMwKtG6ghPyEykfbh8pl
文件: services/xiguapiService.ts
```

### BLTCY API
```
地址: https://api.bltcy.ai
密钥: sk-BN7z574kow0App9HZviHJu3TJIQqo0AEKIMFT18XkQ4FL5H2
文件: services/bltcyService.ts
```

### Gemini API
```
地址: https://generativelanguage.googleapis.com
密钥: 通过环境变量 API_KEY 配置
文件: services/geminiService.ts
```

## 工作流程

### 图片生成流程
```
用户输入提示词
    ↓
尝试西瓜皮 API
    ↓
成功? → 返回图片 URL
    ↓ 失败
尝试 Gemini API
    ↓
返回 base64 图片
```

### 视频生成流程
```
用户输入提示词
    ↓
尝试西瓜皮 Hailuo API
    ↓
成功? → 返回视频 URL
    ↓ 失败
尝试 Gemini Veo API
    ↓
成功? → 返回视频 URL
    ↓ 失败
生成静态图片作为备用
```

### 对话流程
```
用户发送消息
    ↓
尝试 BLTCY API
    ↓
成功? → 返回 AI 回复
    ↓ 失败
尝试 Gemini API
    ↓
返回 AI 回复
```

## 性能对比

| 功能 | 西瓜皮 | BLTCY | Gemini | 推荐 |
|------|--------|-------|--------|------|
| 图片生成 | ⚡ 快速 | - | 🐢 较慢 | 西瓜皮 |
| 视频生成 | ⚡ 快速 | - | 🐢 很慢 | 西瓜皮 |
| 文本对话 | - | ⚡ 快速 | ⚡ 快速 | BLTCY |
| 图片理解 | - | ❌ 不支持 | ✅ 支持 | Gemini |
| 音频生成 | - | - | ✅ 支持 | Gemini |
| 成本 | 💰 中等 | 💰 经济 | 💰 中等 | - |

## 优势与限制

### 西瓜皮 API
**优势**:
- ✅ 图片生成速度快
- ✅ 视频生成质量高
- ✅ 支持多种分辨率和宽高比
- ✅ 任务轮询机制可靠

**限制**:
- ❌ 仅支持图片和视频生成
- ❌ 需要轮询等待结果
- ❌ 不支持流式输出

### BLTCY API
**优势**:
- ✅ 对话响应快速
- ✅ 支持流式输出
- ✅ OpenAI 兼容格式
- ✅ 成本经济

**限制**:
- ❌ 不支持图片输入
- ❌ 不支持音频生成
- ❌ 不支持视频分析

### Gemini API
**优势**:
- ✅ 功能最全面
- ✅ 支持多模态（文本、图片、音频、视频）
- ✅ 强大的理解能力
- ✅ 可靠的备用方案

**限制**:
- ❌ 图片生成较慢
- ❌ 视频生成很慢且需要轮询
- ❌ 配额限制较严格

## 错误处理策略

### 自动重试
- 西瓜皮 API: 图片 2 分钟，视频 6 分钟
- BLTCY API: 单次请求，失败立即切换
- Gemini API: 3 次重试，指数退避

### 备用方案
1. **图片生成**: 西瓜皮 → Gemini
2. **视频生成**: 西瓜皮 → Gemini → 静态图片
3. **对话**: BLTCY → Gemini
4. **分镜**: BLTCY → Gemini

### 友好错误提示
所有 API 都提供统一的友好错误信息：
- API 密钥无效
- 请求过于频繁
- 配额不足
- 请求超时

## 环境变量配置

创建 `.env.local` 文件：

```env
# Gemini API
API_KEY=your_gemini_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here

# 西瓜皮 API（可选，已硬编码）
XIGUAPI_API_KEY=w8n-cYYtSMwKtG6ghPyEykfbh8pl

# BLTCY API（可选，已硬编码）
BLTCY_API_KEY=sk-BN7z574kow0App9HZviHJu3TJIQqo0AEKIMFT18XkQ4FL5H2
```

## 使用示例

### 图片生成
```typescript
import { generateImageFromText } from './services/geminiService';

const images = await generateImageFromText(
  'a beautiful sunset over mountains',
  'gemini-2.5-flash-image',
  [],
  { aspectRatio: '16:9', count: 1 }
);
```

### 视频生成
```typescript
import { generateVideo } from './services/geminiService';

const result = await generateVideo(
  'a cinematic shot of a futuristic city',
  'veo-3.1-generate-preview',
  { aspectRatio: '16:9', resolution: '1080P' }
);
```

### 对话
```typescript
import { sendChatMessage } from './services/geminiService';

const history = [
  { role: 'user', parts: [{ text: 'Hello' }] }
];

const response = await sendChatMessage(
  history,
  'How are you?'
);
```

## 监控和日志

所有 API 调用都会在控制台输出详细日志：

```
[Xiguapi] 创建任务: {...}
[Xiguapi] 任务创建成功: {...}
[Xiguapi] 轮询 1/60: running
[Xiguapi] 任务完成，生成 1 张图片

[BLTCY] 发送聊天请求: {...}
[BLTCY] 收到回复: {...}

[Image Generation] 使用西瓜皮 API
[Video Generation] 使用西瓜皮 Hailuo API
[Chat] 使用 BLTCY API
```

## 成本估算

基于典型使用场景的成本估算（仅供参考）：

| 操作 | 西瓜皮 | BLTCY | Gemini | 推荐 |
|------|--------|-------|--------|------|
| 生成 1 张图片 | ¥0.05 | - | ¥0.10 | 西瓜皮 |
| 生成 1 个视频 | ¥0.50 | - | ¥2.00 | 西瓜皮 |
| 1000 tokens 对话 | - | ¥0.01 | ¥0.02 | BLTCY |
| 分镜生成 | - | ¥0.05 | ¥0.08 | BLTCY |

## 后续优化计划

### 短期（1-2 周）
- [ ] 将 API 密钥移到环境变量
- [ ] 实现请求缓存机制
- [ ] 添加使用统计和成本追踪
- [ ] 优化错误提示的多语言支持

### 中期（1 个月）
- [ ] 实现图片上传功能（支持 base64 转 URL）
- [ ] 添加 API 健康检查
- [ ] 实现智能 API 选择（基于负载和成本）
- [ ] 添加批量操作队列管理

### 长期（3 个月）
- [ ] 实现本地模型备用方案
- [ ] 添加 API 使用分析面板
- [ ] 实现多 API 并行生成（选择最快的结果）
- [ ] 添加自定义 API 配置界面

## 相关文档

- [西瓜皮API接入说明.md](./西瓜皮API接入说明.md)
- [BLTCY对话API接入说明.md](./BLTCY对话API接入说明.md)
- [README.md](./README.md)

## 技术支持

如遇到 API 相关问题，请检查：

1. **控制台日志**: 查看详细的错误信息
2. **API 密钥**: 确认密钥是否有效
3. **网络连接**: 确认能访问 API 服务器
4. **配额余额**: 检查 API 账户余额
5. **备用方案**: 确认备用 API 是否正常工作

---

**所有 API 接入完成！** 🎉

SunStudio 现在拥有完整的 AI 创作能力，支持图片、视频、对话、音频等多种功能。
