# 文字节点 - 图片反推提示词 - API 调用规则

> **适用范围**：文字节点的"图片反推提示词"功能
> **当前 API**：Coze AI 导演助手
> **创建时间**：2026-02-04

---

## 📋 功能说明

**功能名称**：图片反推提示词（Image to Prompt）

**功能描述**：
- 用户将图片节点连接到文字节点
- 点击"生成提示词"按钮
- AI 分析图片内容，生成专业的图片生成提示词
- 生成的提示词可以被下游节点读取使用（作为文生图的输入）

---

## 🎯 API 调用规则（通用）

### 规则 1：API 选择优先级

**优先级顺序**：
1. **Coze API**（当前默认）- 如果配置了 Coze API Key
2. **Gemini API**（备用）- 如果 Coze 不可用
3. **其他 API**（未来扩展）- 按配置顺序尝试

**实现位置**：`hooks/useTextNodeActions.ts` 中的 `analyzeImage` 函数

**代码示例**：
```typescript
const analyzeImage = async (nodeId: string): Promise<void> => {
  // 1. 检查 Coze API 是否可用
  if (isCozeAvailable()) {
    // 使用 Coze API
    const prompt = await analyzeImageWithCoze(imageBase64);
  } else if (isGeminiAvailable()) {
    // 使用 Gemini API（备用）
    const prompt = await analyzeImageWithGemini(imageBase64);
  } else {
    throw new Error('没有可用的 API，请配置 API Key');
  }
};
```

---

### 规则 2：提示词生成准则（7 要素结构）

**无论使用哪个 API，生成的提示词必须包含以下 7 个要素**：

1. **[核心主体]** - 图片的主要对象（人物、动物、物体等）
2. **[动作/场景]** - 主体在做什么？处于什么场景？
3. **[画风/媒介]** - 艺术风格、绘画媒介、摄影风格
4. **[镜头参数]** - 镜头类型、景别、角度
5. **[光影氛围]** - 光线类型、明暗对比、氛围感
6. **[色彩方案]** - 主要色调、配色方案
7. **[细节/材质]** - 重要的细节、材质、纹理

**输出格式要求**：
- 直接输出提示词内容，不要输出标签或编号
- 用自然流畅的语言组织，不要生硬地列举
- 长度控制在 150-200 字
- 使用专业的摄影和艺术术语
- 适合直接用于 AI 图片生成

**示例输出**：
```
一位年轻女性站在霓虹灯闪烁的赛博朋克街道上，身穿未来感科技外套，电影级构图，使用 35mm 镜头拍摄，低角度仰视，戏剧性的蓝紫色霓虹光影，高对比度，冷色调为主配以暖色点缀，精致的面部细节和服装材质，8K 超高清画质
```

---

### 规则 3：API 调用流程

**标准流程**（适用于所有 API）：

```
1. 检查输入图片是否存在
   ↓
2. 转换图片格式（如果需要）
   - Blob URL → Base64
   - 其他格式 → Base64
   ↓
3. 调用 API 分析图片
   - 传递图片数据
   - 传递提示词生成准则
   ↓
4. 解析 API 返回结果
   - 提取提示词内容
   - 验证是否符合 7 要素结构
   ↓
5. 更新节点状态
   - 保存生成的提示词
   - 更新 UI 显示
```

---

### 规则 4：错误处理

**必须处理的错误类型**：

| 错误类型 | 触发条件 | 提示信息 | 用户操作 |
|---------|---------|---------|---------|
| 无输入图片 | 没有连接图片节点 | "请先连接图片节点" | 连接图片节点 |
| API 不可用 | 没有配置 API Key | "请配置 API Key" | 前往设置配置 |
| API 调用失败 | 网络错误、服务器错误 | "图片分析失败，请重试" | 点击重试 |
| 超时 | 请求超过 30 秒 | "请求超时，请重试" | 点击重试 |
| 格式错误 | API 返回格式不正确 | "AI 返回格式错误，请重试" | 点击重试 |
| 配额不足 | API 配额用完 | "API 配额不足，请检查账户" | 充值或更换 API |

---

### 规则 5：性能要求

**响应时间**：
- 目标：< 5 秒
- 可接受：< 10 秒
- 超时：> 30 秒

**内存占用**：
- 图片转换：使用 Blob URL，避免 Base64 内存占用
- 请求取消：支持 AbortController，避免内存泄漏

**并发控制**：
- 同一节点：只允许一个请求，新请求会取消旧请求
- 不同节点：允许并发

---

## 🔧 当前实现（Coze API）

### API 配置

**环境变量**：
```bash
VITE_COZE_API_KEY=your_api_key
VITE_COZE_BOT_ID=your_bot_id
VITE_COZE_API_BASE_URL=https://api.coze.cn
```

**默认值**（开发环境）：
```typescript
const apiKey = 'pat_d3JkCQSKDAVnS7czYyb8CXpf5WGqjwJ5nsvkHSz8A4tqo7EVe3mwC5YzNq7017mF';
const botId = '7598900942121271323';
const baseUrl = 'https://api.coze.cn';
```

### API 调用方式

**函数**：`services/cozeService.ts` 中的 `optimizePrompt`

**调用示例**：
```typescript
import { optimizePrompt } from '../services/cozeService';

const result = await optimizePrompt(
  userInput,           // 用户描述或图片分析结果
  'IMAGE_GENERATOR',   // 节点类型
  {
    aspectRatio: '16:9',
    style: undefined
  }
);

// 返回结果
const prompt = result.versions.standard; // 标准结构化提示词
```

### 提示词生成准则（Coze 专用）

**当前实现**：在 `services/geminiService.ts` 中的 `analyzeImageForPrompt` 函数

**问题**：目前使用的是 Gemini API，需要改为 Coze API

**修改方案**：
1. 在 `services/cozeService.ts` 中添加 `analyzeImageForPrompt` 函数
2. 调用 Coze 的 `optimizePrompt` 功能
3. 传递图片分析结果和 7 要素准则

---

## 🚀 未来扩展（其他 API）

### 扩展步骤

**1. 添加新的 API 服务**

创建新文件：`services/newApiService.ts`

```typescript
export const analyzeImageForPrompt = async (
  imageBase64: string,
  signal?: AbortSignal
): Promise<string> => {
  // 实现新 API 的调用逻辑
  // 必须返回符合 7 要素结构的提示词
};
```

**2. 更新 API 选择逻辑**

修改 `hooks/useTextNodeActions.ts`：

```typescript
const analyzeImage = async (nodeId: string): Promise<void> => {
  // 按优先级尝试 API
  if (isCozeAvailable()) {
    await analyzeImageWithCoze(nodeId);
  } else if (isNewApiAvailable()) {
    await analyzeImageWithNewApi(nodeId);
  } else if (isGeminiAvailable()) {
    await analyzeImageWithGemini(nodeId);
  } else {
    throw new Error('没有可用的 API');
  }
};
```

**3. 添加配置选项**

在设置面板中添加 API 选择：

```typescript
interface ApiConfig {
  provider: 'coze' | 'gemini' | 'openai' | 'custom';
  apiKey: string;
  baseUrl?: string;
  model?: string;
}
```

---

## ✅ 验收标准

**功能验收**：
- [ ] 图片节点连接到文字节点后，能正确读取图片
- [ ] 点击"生成提示词"按钮，能调用 API 分析图片
- [ ] 生成的提示词符合 7 要素结构
- [ ] 生成的提示词长度在 150-200 字
- [ ] 生成的提示词可以被下游节点读取

**性能验收**：
- [ ] 响应时间 < 10 秒
- [ ] 支持请求取消（AbortController）
- [ ] 不会造成内存泄漏

**错误处理验收**：
- [ ] 无输入图片时显示友好提示
- [ ] API 调用失败时显示错误信息
- [ ] 超时时允许重试
- [ ] 配额不足时提示用户

**兼容性验证**：
- [ ] 支持 Coze API
- [ ] 支持 Gemini API（备用）
- [ ] 架构支持未来添加其他 API

---

## 📝 开发清单

**当前需要完成的工作**：

- [ ] 在 `services/cozeService.ts` 中添加 `analyzeImageForPrompt` 函数
- [ ] 修改 `hooks/useTextNodeActions.ts` 中的 `analyzeImage` 函数，使用 Coze API
- [ ] 添加 API 选择逻辑（Coze → Gemini → 其他）
- [ ] 测试图片读取逻辑（从连接的图片节点读取）
- [ ] 测试提示词生成（是否符合 7 要素结构）
- [ ] 测试提示词传递（下游节点能否读取）
- [ ] 添加错误处理和用户提示
- [ ] 性能测试和优化

---

## 🔗 相关文件

**核心文件**：
- `components/TextNode/TextNodeReverse.tsx` - UI 组件
- `hooks/useTextNodeActions.ts` - 业务逻辑
- `core/stores/textNodeStore.ts` - 状态管理
- `services/cozeService.ts` - Coze API 调用
- `services/geminiService.ts` - Gemini API 调用（备用）

**配置文件**：
- `.env.local` - API Key 配置
- `types.ts` - 类型定义

---

## 📚 参考文档

**Coze API 文档**：
- 官方文档：https://www.coze.cn/docs/developer_guides/chat_v3
- 提示词优化：使用 `optimizePrompt` 函数
- 对话接口：使用 `chat` 函数

**Gemini API 文档**：
- 官方文档：https://ai.google.dev/docs
- 图片分析：使用 `generateContent` 接口

---

**最后更新**：2026-02-04
**维护者**：AI 开发团队
