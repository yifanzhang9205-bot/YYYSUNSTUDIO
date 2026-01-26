# API 架构调整 - 移除 Gemini 图片生成

## 调整时间
2026-01-23

## 调整目标
- ✅ 移除所有基于 Gemini 的图片生成选项
- ✅ 统一使用 NanoBanana (西瓜皮) 作为唯一的图片生成 API
- ✅ 保留 Gemini 用于文字理解类型的功能（视频分析、语音转文字等）

## 修改内容

### 1. 节点模型选择 (components/Node.tsx)

**修改前：**
```typescript
models = [
    {l: 'Nano Banana Pro (推荐)', v: 'nanobananapro'},
    {l: 'Gemini 2.5 (备用)', v: 'gemini-2.5-flash-image'},
    {l: 'Gemini 3 Pro (备用)', v: 'gemini-3-pro-image-preview'}
];
```

**修改后：**
```typescript
models = [
    {l: 'Nano Banana Pro', v: 'nanobananapro'}
];
```

### 2. 默认模型设置 (App.tsx)

**修改前：**
```typescript
model: type.includes('IMAGE') ? 'gemini-2.5-flash-image' : ...
```

**修改后：**
```typescript
model: type.includes('IMAGE') ? 'nanobananapro' : ...
```

**影响范围：**
- 创建新节点时的默认模型
- 从侧边栏拖入节点时的默认模型

### 3. 草图编辑器 (components/SketchEditor.tsx)

#### 3.1 Pose 生成模式
**修改前：** 使用 `generateImageFromText(..., 'gemini-2.5-flash-image', ...)`

**修改后：** 使用 `generateNanoBananaImage(...)`

#### 3.2 Sketch-to-Image 模式
**修改前：** 使用 `generateImageFromText(..., 'gemini-2.5-flash-image', [compositeBase64], ...)`

**修改后：**
1. 上传 base64 到 ImgBB 获取 URL
2. 使用 `generateNanoBananaImage(..., { referenceUrls: [url] })`
3. 下载结果并转换回 base64

#### 3.3 UI 显示
**修改前：** 显示 "Gemini 2.5 (Pose)" / "Gemini 2.5"

**修改后：** 显示 "Nano Banana (Pose)" / "Nano Banana"

### 4. 视频策略 - 图片恢复 (services/videoStrategies.ts)

**场景：** SceneDirector 模式下，恢复裁剪后的图片质量

**修改前：** 使用 `generateImageFromText(..., 'gemini-2.5-flash-image', ...)`

**修改后：**
1. 上传图片到 ImgBB
2. 使用 `generateNanoBananaImage(..., { referenceUrls: [url] })`
3. 下载并转换为 base64

### 5. 视频生成 Fallback (services/geminiService.ts)

**场景：** 视频生成失败时，降级为生成静态图片

**修改前：** 使用 `generateImageFromText(..., 'gemini-2.5-flash-image', ...)`

**修改后：**
1. 如果有参考图片，上传到 ImgBB
2. 使用 `generateNanoBananaImage(...)`
3. 下载并转换为 base64

### 6. 多角度相机 (App.tsx)

**已在之前的优化中完成：**
- 从 Gemini (Imagen 3 / Gemini Flash Image) 切换到 NanoBanana
- 通过 ImgBB 上传参考图片

## 保留的 Gemini 功能

以下功能继续使用 Gemini，因为它们是文字理解类型：

### 1. 视频分析 (Video Analyzer)
- ✅ Gemini 2.5 Flash
- ✅ Gemini 3 Pro

### 2. 语音转文字 (Sonic Studio)
- ✅ Gemini 2.5 (Transcriber)

### 3. 音频生成 (Audio Generator)
- ✅ Voice Factory (Gemini 2.0)

### 4. 文本理解和编排
- ✅ 故事创作 (Story Studio)
- ✅ 分镜生成 (Storyboard)
- ✅ 视频提示词编排 (orchestrateVideoPrompt)
- ✅ 多帧序列编排 (compileMultiFramePrompt)

## 技术影响

### 优势
1. **统一的图片生成 API**
   - 所有图片生成都使用 NanoBanana
   - 减少 API 配额管理的复杂度
   - 统一的错误处理逻辑

2. **简化的模型选择**
   - 用户不需要在多个模型之间选择
   - 减少决策疲劳
   - 更清晰的 UI

3. **明确的职责分工**
   - Gemini：文字理解、分析、编排
   - NanoBanana：图片生成
   - Veo：视频生成

### 依赖要求
**必需配置 ImgBB API Key：**

所有图生图功能现在都需要 ImgBB，因为 NanoBanana 需要 URL 而不是 base64：

1. 多角度相机
2. 草图编辑器（Sketch-to-Image）
3. 视频策略（图片恢复）
4. 视频生成 Fallback（有参考图片时）

**配置方法：**
```env
IMGBB_API_KEY=你的_api_key
```

详见 [ImgBB配置指南.md](./ImgBB配置指南.md)

## 代码变更统计

### 修改的文件
1. `App.tsx` - 2 处修改（默认模型）
2. `components/Node.tsx` - 1 处修改（模型选择列表）
3. `components/SketchEditor.tsx` - 3 处修改（Pose 生成、Sketch-to-Image、UI 显示）
4. `services/videoStrategies.ts` - 1 处修改（图片恢复）
5. `services/geminiService.ts` - 1 处修改（视频 Fallback）

### 删除的代码
- 移除了 Gemini 图片生成模型选项（2 个选项）
- 移除了 Imagen 3 和 Gemini Flash Image 的调用逻辑

### 新增的代码
- 添加了 ImgBB 上传逻辑（5 处）
- 添加了 URL 到 base64 的转换逻辑（5 处）

## 测试建议

### 1. 基础图片生成
- ✅ 创建"文字生图"节点
- ✅ 输入提示词
- ✅ 确认使用 NanoBanana 生成
- ✅ 检查生成结果

### 2. 图生图功能
- ✅ 多角度相机（需要 ImgBB）
- ✅ 草图编辑器 Sketch-to-Image（需要 ImgBB）
- ✅ 检查参考图片是否正确上传

### 3. 视频生成
- ✅ 测试 SceneDirector 模式（图片恢复）
- ✅ 测试视频生成失败时的 Fallback

### 4. 保留的 Gemini 功能
- ✅ 视频分析
- ✅ 语音转文字
- ✅ 故事创作

## 迁移指南

### 对现有用户的影响
1. **已有的节点**
   - 如果之前选择了 Gemini 模型，需要手动切换到 NanoBanana
   - 或者删除节点重新创建（会自动使用 NanoBanana）

2. **ImgBB 配置**
   - 如果之前没有配置 ImgBB，现在必须配置
   - 否则图生图功能会报错

3. **工作流兼容性**
   - 保存的工作流中的模型设置会保留
   - 建议重新测试并更新工作流

### 升级步骤
1. 拉取最新代码
2. 配置 ImgBB API Key（如果还没有）
3. 重启开发服务器
4. 测试图片生成功能
5. 更新现有的工作流（可选）

## 未来优化方向

### 1. 智能模型选择
- 根据任务类型自动选择最佳 API
- 例如：线稿生成可能需要特殊处理

### 2. 多 API 支持
- 支持其他图片生成 API（Midjourney、DALL-E 等）
- 作为 NanoBanana 的备用选项

### 3. 本地缓存
- 缓存上传到 ImgBB 的图片 URL
- 避免重复上传相同的图片

### 4. 批量处理
- 优化多张图片的上传和转换
- 并行处理提高速度

---

**架构调整完成！** 🎉

现在所有图片生成都统一使用 NanoBanana，Gemini 专注于文字理解类型的任务。
