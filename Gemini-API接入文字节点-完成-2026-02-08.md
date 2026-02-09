# Gemini API 接入文字节点 - 完成

**日期**：2026-02-08  
**状态**：✅ 已完成

---

## 📋 需求

用户提供了新的 Gemini API Key，希望接入到文字节点功能中。

**提供的信息**：
- API Key: `AIzaSyCSs9MGQE_4BvvC-YkcmdTR5VJKdWi4mi8`
- 示例代码：使用 `@google/generative-ai` 包的简单 HTML 示例

---

## 🔍 问题诊断

### 错误信息

```
Error: API Key is missing. Please select a paid API key via the Google AI Studio button.
```

### 根本原因

**Vite 项目的环境变量访问规则**：

1. ❌ **错误**：使用 `process.env.API_KEY`
   - 这是 Node.js 的环境变量访问方式
   - 在浏览器中不可用

2. ✅ **正确**：使用 `import.meta.env.VITE_API_KEY`
   - Vite 要求环境变量必须以 `VITE_` 前缀开头
   - 使用 `import.meta.env` 访问

---

## ✅ 修复方案

### 1. 修改环境变量名称

**文件**：`.env.local`

```diff
# ImgBB 图床配置（用于图生图功能）
IMGBB_API_KEY=10eb22383bb75164f05374d7663f3c54

- # Gemini API 配置（用于图片分析等功能的备用）
- API_KEY=AIzaSyCSs9MGQE_4BvvC-YkcmdTR5VJKdWi4mi8

+ # Gemini API 配置（用于图片分析等功能的备用）
+ # 注意：Vite 项目需要 VITE_ 前缀才能在浏览器中访问
+ VITE_API_KEY=AIzaSyCSs9MGQE_4BvvC-YkcmdTR5VJKdWi4mi8
```

### 2. 修改 geminiService.ts

**修改 1**：`getClient()` 函数

```diff
const getClient = () => {
-  if (!process.env.API_KEY) {
+  // Vite 项目使用 import.meta.env 访问环境变量
+  const apiKey = import.meta.env.VITE_API_KEY;
+  if (!apiKey) {
    throw new Error("API Key is missing. Please select a paid API key via the Google AI Studio button.");
  }
-  return new GoogleGenAI({ apiKey: process.env.API_KEY });
+  return new GoogleGenAI({ apiKey });
};
```

**修改 2**：视频 URI 拼接

```diff
if (res.status === 'fulfilled') {
    const vid = res.value.response?.generatedVideos?.[0]?.video;
    if (vid?.uri) {
-        const fullUri = `${vid.uri}&key=${process.env.API_KEY}`;
+        const apiKey = import.meta.env.VITE_API_KEY;
+        const fullUri = `${vid.uri}&key=${apiKey}`;
        validUris.push(fullUri);
        if (!primaryMetadata) primaryMetadata = vid;
    }
}
```

---

## 🎯 功能说明

### 文字节点的 API 调用逻辑

#### 1. 图片反推提示词（`analyzeImage`）

```
用户上传图片
    ↓
尝试使用 Coze API
    ↓
如果 Coze 不支持图片或不可用
    ↓
使用 Gemini API 备用 ← 新的 API Key 在这里生效
    ↓
返回分析结果
```

#### 2. 提示词生成（`generatePrompt`）

```
用户输入描述
    ↓
使用 Coze API
    ↓
返回生成的提示词
```

---

## 🔧 使用的 Gemini 模型

根据 `services/geminiService.ts` 的实现：

- **图片分析**：`gemini-2.0-flash-001`（默认，稳定版本）
- **图片生成**：`gemini-2.5-flash-image`
- **视频生成**：`veo-3.1-generate-preview`
- **语音合成**：`gemini-2.5-flash-preview-tts`

**⚠️ 注意**：
- `gemini-2.0-flash-exp` 已经不可用（实验版本已过期）
- 使用 `gemini-2.0-flash-001` 作为稳定版本

---

## 📦 包的区别

### 示例代码使用的包

```javascript
import { GoogleGenerativeAI } from "@google/generative-ai";
```

### 项目使用的包

```typescript
import { GoogleGenAI } from "@google/genai";
```

**两者的区别**：
- `@google/generative-ai`：官方旧版 SDK
- `@google/genai`：官方新版 SDK（功能更强大）

**项目已经使用新版 SDK，不需要修改代码。**

---

## ✅ 验收标准

### 1. 环境变量配置正确

- [x] `.env.local` 中添加了 `VITE_API_KEY`
- [x] API Key 值正确
- [x] 使用了 `VITE_` 前缀

### 2. 代码修改正确

- [x] `getClient()` 使用 `import.meta.env.VITE_API_KEY`
- [x] 视频 URI 拼接使用 `import.meta.env.VITE_API_KEY`
- [x] 移除了所有 `process.env.API_KEY` 引用

### 3. 功能可用

- [ ] 重启开发服务器后，文字节点的图片反推功能可以使用 Gemini 备用
- [ ] 如果 Coze API 不可用，Gemini API 会自动接管

---

## 🚀 下一步

### 1. 重启开发服务器（必须！）

```bash
# 停止当前服务器（Ctrl+C）
# 重新启动
npm run dev
```

**⚠️ 重要**：修改 `.env.local` 后必须重启服务器，否则新的环境变量不会生效！

### 2. 测试功能

1. 打开文字节点
2. 切换到"图片反推"模式
3. 上传一张图片
4. 点击"分析图片"
5. 查看是否成功生成提示词

### 3. 查看日志

打开浏览器控制台，查看 API 调用日志：

```
[Coze] 图片分析失败: Error: COZE_IMAGE_NOT_SUPPORTED
[TextNode] Coze 不可用，使用 Gemini API 备用
```

如果看到这两条日志，说明 Gemini 备用机制正常工作。

---

## 📌 注意事项

### 1. Vite 环境变量规则

**必须遵守的规则**：
- ✅ 环境变量必须以 `VITE_` 开头
- ✅ 使用 `import.meta.env.VITE_XXX` 访问
- ❌ 不能使用 `process.env.XXX`（这是 Node.js 的方式）

**为什么？**
- Vite 在构建时会将 `VITE_` 前缀的变量注入到浏览器代码中
- 没有 `VITE_` 前缀的变量只能在服务器端（Node.js）使用

### 2. API Key 安全

- ⚠️ `.env.local` 文件已在 `.gitignore` 中，不会提交到 Git
- ⚠️ 不要在代码中硬编码 API Key
- ⚠️ 不要在公开的地方分享 API Key

### 3. API 配额

- Gemini API 有免费配额限制
- 如果超出配额，会返回 429 错误
- 项目已实现自动重试机制（`retryWithBackoff`）

### 4. 模型选择

如果需要更换模型，可以在文字节点的 Store 中修改：

```typescript
// core/stores/textNodeStore.ts
model: 'gemini-2.0-flash-001' // 默认模型（稳定版本）
```

**可用的 Gemini 模型**：
- `gemini-2.0-flash-001` - 稳定版本（推荐）
- `gemini-1.5-flash` - 旧版本
- `gemini-1.5-pro` - 高级版本（更强大但更慢）

**⚠️ 避免使用实验版本**：
- ❌ `gemini-2.0-flash-exp` - 已过期
- ❌ 其他 `-exp` 后缀的模型 - 可能随时失效

---

## 🎉 完成

Gemini API 已成功接入到文字节点，作为 Coze API 的备用方案。

**修复内容**：
1. ✅ 环境变量改为 `VITE_API_KEY`
2. ✅ 代码改为使用 `import.meta.env.VITE_API_KEY`
3. ✅ 移除了所有 `process.env.API_KEY` 引用

**重启服务器后即可使用！**
