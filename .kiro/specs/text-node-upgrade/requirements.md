# 文字节点升级 - 需求文档

**日期**: 2026-02-03  
**状态**: 📝 需求设计中  
**优先级**: 🔥 高

---

## 📋 目录

1. [核心目标](#核心目标)
2. [功能概述](#功能概述)
3. [详细需求](#详细需求)
4. [交互设计](#交互设计)
5. [数据结构](#数据结构)
6. [UI 规格](#ui-规格)
7. [技术约束](#技术约束)
8. [验收标准](#验收标准)

---

## 🎯 核心目标

### 主要目标

将文字节点从单一的文本输入节点升级为**多功能智能节点**，支持：
1. ✏️ **自己编写内容** - 手动输入文字
2. 🔍 **图片反推提示词** - 从图片分析生成提示词
3. 🖼️ **文生图** - 文字生成图片
4. ✨ **提示词生成** - 用自然语言生成专业提示词（在本节点内完成）

### 核心原则

> **所有节点不自主工作，只自主生成**

- ❌ 不自动触发 AI 分析
- ❌ 不自动生成内容
- ✅ 用户必须点击"生成"按钮
- ✅ 节点可以自动生成和连接（如空图片节点）
- ✅ 提示词通过连接线传递

---

## 📖 功能概述

### 1. 初始状态

节点创建时，显示 **功能选项列表**（垂直排列，类似菜单）：

```
┌─────────────────────────────┐
│   Text                      │
├─────────────────────────────┤
│                             │
│   尝试:                     │
│                             │
│   自己编写内容              │
│                             │
│   图片反推提示词            │
│                             │
│   文生图                    │
│                             │
│   提示词生成                │
│                             │
└─────────────────────────────┘
```

**UI 特点**：
- 垂直列表布局，每个选项占一行
- **纯文字描述，不使用图标**
- 顶部有"尝试:"标签作为分类标题
- 简洁的列表式交互，类似菜单
- 参考双击菜单的排版和使用逻辑

### 2. 功能模式

#### 模式 1：自己编写内容 ✏️

**流程**:
1. 用户点击"自己编写内容"
2. 节点展开，显示文本输入区域
3. 用户在输入框输入文字
4. 用户点击"生成"按钮（不是 Enter 键）
5. 内容传递给连接的下游节点

**特点**:
- 最简单的模式
- 纯手动输入
- 不涉及 AI
- 支持 Shift+Enter 换行
- 只有点击"生成"按钮才触发

#### 模式 2：图片反推提示词 🔍

**流程**:
1. 用户点击"图片反推提示词"
2. 节点展开，显示图片上传区域
3. 检查输入连接：
   - **无输入连接** → 显示上传按钮，用户上传图片
   - **有输入连接** → 从输入节点获取图片
   - **多个输入** → 提示用户只能选择一个
4. 用户点击"生成提示词"按钮
5. AI 分析图片（画面风格、色调、构图等）
6. 生成的提示词显示在文本框
7. 用户可以编辑提示词
8. 点击"生成"按钮传递给下游节点

**特点**:
- 从图片反推提示词
- 不自动触发分析
- 用户必须点击按钮
- 支持编辑生成的提示词

#### 模式 3：文生图 🖼️

**流程**:
1. 用户点击"文生图"
2. 节点展开，显示文本输入区域
3. 自动在右侧生成空图片节点并连接
4. 用户输入图片生成提示词
5. 点击"生成"按钮
6. 提示词传递到图片节点
7. 用户在图片节点点击生成按钮
8. 图片节点生成图片

**特点**:
- 自动生成图片节点
- 自动建立连接
- 提示词通过连接线传递
- 图片节点独立生成

#### 模式 4：提示词生成 ✨

**流程**:
1. 用户点击"提示词生成"
2. 节点展开，显示输入界面
3. 用户用自然语言描述需求（如"我想要一个赛博朋克风格的机器人"）
4. 点击"生成提示词"按钮
5. AI 自动理解并生成专业提示词
6. 生成的提示词显示在文本框
7. 用户可以编辑提示词
8. **在本节点内完成，不需要输出到下游节点**

**特点**:
- 单次生成，不需要多轮对话
- 自动将自然语言转换为专业提示词
- 适用于图片和视频生成
- 在本节点内完成，用户可以直接复制使用
- 如果 AI 导演功能未实现，显示"功能开发中"提示

---

## 📐 详细需求

### 需求 1：初始状态 UI

**验收标准**:
- [ ] 节点创建时显示功能选项列表（垂直布局）
- [ ] 顶部显示"尝试:"分类标签
- [ ] 每个选项一行，**纯文字描述，不使用图标**
- [ ] 选项可点击
- [ ] 选项有悬停效果（背景变化）
- [ ] 列表式布局，类似双击菜单

**UI 规格**:
```typescript
// 容器
className="flex flex-col gap-2 p-4"

// 分类标签
className="text-[10px] font-bold text-gray-400/60 mb-1"

// 选项列表容器
className="flex flex-col gap-1"

// 单个选项按钮（水平布局）
className="w-full px-3 py-2 rounded-lg bg-transparent 
           hover:bg-white/5 border border-transparent 
           hover:border-white/10 
           flex items-center gap-2.5 
           cursor-pointer transition-all text-left"

// 文字（不使用图标）
className="text-[11px] font-medium text-gray-300"
```

**布局特点**：
- 垂直列表，每个选项占一行
- 左对齐，纯文字描述
- 简洁的菜单式交互
- 悬停时整行高亮
- 参考双击菜单的样式

---

### 需求 2：API 工具栏（节点下方外部浮动）

**位置**: 节点**下方外部浮动**（不是内部固定）

**显示逻辑**:
- 选中节点时出现
- 不选中时自动隐藏

**内容**:
- **只有 API 模型选择下拉框**
- 支持选择未来接入的所有模型
- **删除的功能**：倍数选择、历史记录按钮、左侧菱形图标

**UI 规格**:
```typescript
// 工具栏容器（节点下方外部浮动）
className="absolute top-full left-0 mt-2 
           flex items-center gap-2 
           px-3 py-2 
           bg-white/90 backdrop-blur-xl 
           border border-gray-200/80 
           rounded-lg shadow-lg"

// API 下拉框（简洁版，无图标）
<select className="px-2.5 py-1.5 text-[10px] font-medium 
                   text-gray-600 bg-transparent 
                   border border-gray-200 rounded-md 
                   hover:bg-gray-50 transition-colors
                   cursor-pointer">
  <option>Gemini 3 Pro</option>
  <option>Gemini 2 Flash</option>
  <option>Claude Sonnet</option>
  {/* 未来可添加更多模型 */}
</select>
```

**布局特点**：
- 浮动在节点下方
- 选中时出现，不选中时隐藏
- 只有 API 选择，简洁明了
- 与双击菜单风格一致

---

### 需求 3：模式 1 - 自己编写内容

**数据结构**:
```typescript
{
  mode: 'manual',  // 模式标识
  prompt: string,  // 用户输入的文字
}
```

**UI 组件**:
```typescript
// 主输入区域
<textarea 
  className="w-full h-full bg-transparent resize-none 
             focus:outline-none text-sm text-slate-200 
             placeholder-slate-500 font-medium leading-relaxed 
             custom-scrollbar selection:bg-amber-500/30
             px-4 py-3"
  placeholder="描述你想要生成的内容（Shift+Enter 换行）"
  value={localPrompt}
  onChange={(e) => setLocalPrompt(e.target.value)}
  maxLength={1000}
/>

// 生成按钮（节点内部底部）
<button 
  className="absolute bottom-4 right-4 
             px-4 py-2 text-[11px] font-bold text-white 
             bg-blue-500 hover:bg-blue-600 rounded-lg 
             transition-colors"
  onClick={handleGenerate}
>
  生成
</button>
```

**交互流程**:
1. 用户点击"自己编写内容"
2. 节点展开，显示文本输入区域
3. 用户在输入框输入文字
4. 支持 Shift+Enter 换行
5. **点击"生成"按钮触发**（不是 Enter 键）
6. 提示词传递给下游节点

**布局特点**：
- 大面积文本输入区域
- 右下角固定"生成"按钮
- 占位符提示操作方式
- 只有点击按钮才生成

---

### 需求 4：模式 2 - 提示词反推

**数据结构**:
```typescript
{
  mode: 'reverse',           // 模式标识
  inputImage: string,        // 输入图片（Base64 或 Blob URL）
  generatedPrompt: string,   // AI 生成的提示词
  editedPrompt: string,      // 用户编辑后的提示词
  isAnalyzing: boolean,      // 是否正在分析
}
```

**输入连接逻辑**:

**情况 1：无输入连接**
```typescript
// 显示上传按钮
<button onClick={handleUpload}>
  上传图片
</button>
```

**情况 2：有一个输入连接**
```typescript
// 从输入节点获取图片
const inputNode = getNode(node.inputs[0]);
const inputImage = inputNode.data.image;
```

**情况 3：多个输入连接**
```typescript
// 提示用户只能选择一个
if (node.inputs.length > 1) {
  showToast('提示词反推只能连接一个图片节点，请删除多余的连接');
  return;
}
```

**AI 分析流程**:
```typescript
// 用户点击"生成提示词"按钮
const handleAnalyze = async () => {
  // 1. 检查输入图片
  if (!inputImage) {
    showToast('请先上传或连接图片');
    return;
  }
  
  // 2. 设置分析状态
  onUpdate(node.id, { isAnalyzing: true });
  
  // 3. 调用 AI 分析
  try {
    const prompt = await analyzeImage(inputImage);
    
    // 4. 更新生成的提示词
    onUpdate(node.id, { 
      generatedPrompt: prompt,
      editedPrompt: prompt,
      isAnalyzing: false,
    });
  } catch (error) {
    onUpdate(node.id, { 
      error: error.message,
      isAnalyzing: false,
    });
  }
};
```

**UI 组件**:
```typescript
// 图片预览区
<div className="w-full h-32 rounded-xl bg-black/20 border border-white/5 
                overflow-hidden flex items-center justify-center">
  {inputImage ? (
    <img src={inputImage} className="w-full h-full object-cover" />
  ) : (
    <div className="text-slate-500 text-[10px]">
      等待图片输入...
    </div>
  )}
</div>

// 生成提示词按钮
<button 
  className="px-3 py-1.5 text-[10px] font-bold text-white 
             bg-purple-500 hover:bg-purple-600 rounded-lg 
             transition-colors"
  onClick={handleAnalyze}
  disabled={!inputImage || isAnalyzing}
>
  {isAnalyzing ? '分析中...' : '生成提示词'}
</button>

// 提示词编辑框
<textarea 
  className="w-full h-24 bg-transparent resize-none 
             focus:outline-none text-sm text-slate-200 
             placeholder-slate-500 font-medium leading-relaxed 
             custom-scrollbar"
  placeholder="AI 生成的提示词将显示在这里，您可以编辑..."
  value={editedPrompt}
  onChange={(e) => onUpdate(node.id, { editedPrompt: e.target.value })}
/>

// 生成按钮（传递给下游）
<button 
  className="px-3 py-1.5 text-[10px] font-bold text-white 
             bg-blue-500 hover:bg-blue-600 rounded-lg 
             transition-colors"
  onClick={handleGenerate}
>
  生成
</button>
```

---

### 需求 5：模式 3 - 文生图

**数据结构**:
```typescript
{
  mode: 'text-to-image',     // 模式标识
  prompt: string,            // 用户输入的提示词
  outputNodeId: string,      // 自动生成的图片节点 ID
}
```

**自动生成图片节点**:
```typescript
// 用户点击"文生图"
const handleTextToImage = () => {
  // 1. 生成空图片节点
  const newNode = nodeRegistry.createNode(NodeType.IMAGE_GENERATOR, {
    x: node.x + 500,  // 在右侧
    y: node.y,
  });
  
  // 2. 添加节点
  addNode(newNode);
  
  // 3. 建立连接
  addConnection({
    from: node.id,
    to: newNode.id,
  });
  
  // 4. 保存输出节点 ID
  onUpdate(node.id, { 
    mode: 'text-to-image',
    outputNodeId: newNode.id,
  });
};
```

**提示词传递**:
```typescript
// 用户点击"生成"按钮
const handleGenerate = () => {
  // 1. 检查提示词
  if (!prompt.trim()) {
    showToast('请输入提示词');
    return;
  }
  
  // 2. 传递给下游节点
  const outputNode = getNode(outputNodeId);
  if (outputNode) {
    updateNode(outputNodeId, { 
      prompt: prompt,
    });
  }
  
  // 3. 提示用户
  showToast('提示词已传递，请在图片节点点击生成按钮');
};
```

**UI 组件**:
```typescript
// 文本输入框
<textarea 
  className="w-full h-full bg-transparent resize-none 
             focus:outline-none text-sm text-slate-200 
             placeholder-slate-500 font-medium leading-relaxed 
             custom-scrollbar selection:bg-amber-500/30"
  placeholder="输入图片生成提示词..."
  value={prompt}
  onChange={(e) => onUpdate(node.id, { prompt: e.target.value })}
  maxLength={1000}
/>

// 连接状态指示
<div className="flex items-center gap-2 text-[9px] text-gray-500">
  <div className="w-2 h-2 rounded-full bg-green-500"></div>
  <span>已连接到图片节点</span>
</div>

// 生成按钮
<button 
  className="px-3 py-1.5 text-[10px] font-bold text-white 
             bg-blue-500 hover:bg-blue-600 rounded-lg 
             transition-colors"
  onClick={handleGenerate}
>
  生成
</button>
```

---

### 需求 6：模式 4 - 提示词生成

**数据结构**:
```typescript
{
  mode: 'prompt-generator',     // 模式标识
  userInput: string,            // 用户的自然语言描述
  generatedPrompt: string,      // AI 生成的专业提示词
  isGenerating: boolean,        // 是否正在生成
}
```

**AI 生成流程**:
```typescript
// 用户点击"生成提示词"按钮
const handleGeneratePrompt = async () => {
  // 1. 检查用户输入
  if (!userInput.trim()) {
    showToast('请输入您的需求描述');
    return;
  }
  
  // 2. 设置生成状态
  onUpdate(node.id, { isGenerating: true });
  
  // 3. 调用 AI API（Coze 或其他）
  try {
    const response = await callAIDirector({
      userMessage: userInput,
      task: 'generate_prompt',
      context: {
        nodeType: 'text',
        targetType: 'image', // 或 'video'
      }
    });
    
    // 4. 更新生成的提示词
    onUpdate(node.id, { 
      generatedPrompt: response.prompt,
      isGenerating: false,
    });
    
    // 5. 提示用户
    showToast('提示词生成成功，您可以复制使用');
  } catch (error) {
    onUpdate(node.id, { 
      error: error.message,
      isGenerating: false,
    });
  }
};
```

**UI 组件**:
```typescript
// 用户输入区域
<div className="mb-3">
  <div className="text-[9px] text-gray-400 mb-1">描述您的需求：</div>
  <textarea 
    className="w-full h-24 bg-white/5 border border-white/10 
               rounded-lg text-[11px] text-gray-200 
               placeholder-gray-500 focus:outline-none focus:border-blue-500
               px-3 py-2 resize-none custom-scrollbar"
    placeholder="例如：我想要一个赛博朋克风格的机器人，背景是霓虹灯城市..."
    value={userInput}
    onChange={(e) => onUpdate(node.id, { userInput: e.target.value })}
    maxLength={500}
  />
</div>

// 生成提示词按钮
<button 
  className="w-full px-4 py-2 mb-3 bg-purple-500 hover:bg-purple-600 
             rounded-lg text-[11px] font-bold text-white 
             transition-colors disabled:opacity-50"
  onClick={handleGeneratePrompt}
  disabled={!userInput.trim() || isGenerating}
>
  {isGenerating ? '生成中...' : '生成提示词'}
</button>

// 生成的提示词显示区域
{generatedPrompt && (
  <div className="mb-3">
    <div className="flex items-center justify-between mb-1">
      <div className="text-[9px] text-gray-400">生成的专业提示词：</div>
      <button 
        className="text-[9px] text-blue-400 hover:text-blue-300"
        onClick={() => {
          navigator.clipboard.writeText(generatedPrompt);
          showToast('已复制到剪贴板');
        }}
      >
        复制
      </button>
    </div>
    <textarea 
      className="w-full h-32 bg-white/5 border border-white/10 
                 rounded-lg text-[11px] text-gray-200 
                 px-3 py-2 resize-none custom-scrollbar"
      value={generatedPrompt}
      onChange={(e) => onUpdate(node.id, { generatedPrompt: e.target.value })}
    />
  </div>
)}

// 功能说明
<div className="text-[9px] text-gray-500 text-center">
  💡 AI 会将您的自然语言描述转换为专业的提示词
</div>
```

**交互流程**:
1. 用户点击"提示词生成"
2. 节点展开，显示输入界面
3. 用户在输入框输入自然语言描述
4. 点击"生成提示词"按钮
5. AI 分析并生成专业提示词
6. 生成的提示词显示在下方文本框
7. 用户可以编辑提示词
8. 用户可以点击"复制"按钮复制提示词
9. **在本节点内完成，不需要输出到下游节点**

**布局特点**：
- 上方：用户输入区域（自然语言描述）
- 中间：生成提示词按钮
- 下方：生成的专业提示词（可编辑、可复制）
- 底部：功能说明提示
- 简洁明了，单次生成

**特殊说明**：
- 如果 AI 导演功能（Coze API）未实现，此功能暂时显示"功能开发中"提示
- 预留 API 接口，方便后续集成
- 可以先实现 UI，API 调用部分使用 mock 数据
- **不需要多轮对话**，只需一次生成
- **不需要输出到下游节点**，用户直接在本节点复制使用

---

## 🎨 交互设计

### 1. 模式切换

**初始状态 → 选择模式**:
```
用户点击功能选项
  ↓
保存选择的模式
  ↓
切换到对应的 UI
  ↓
显示对应的输入界面
```

**切换模式**:
```
用户点击"返回"按钮
  ↓
清除当前模式数据
  ↓
返回初始状态
  ↓
显示 4 个功能选项
```

### 2. 自动生成节点

**提示词反推 - 无输入连接**:
```
用户点击"提示词反推"
  ↓
检测无输入连接
  ↓
显示上传按钮
  ↓
用户上传图片
```

**文生图 - 自动生成输出节点**:
```
用户点击"文生图"
  ↓
自动生成空图片节点（右侧）
  ↓
自动建立连接
  ↓
显示文本输入框
```

### 3. 提示词传递

**文字节点 → 图片节点**:
```
用户在文字节点输入提示词
  ↓
点击"生成"按钮
  ↓
提示词传递到图片节点
  ↓
图片节点的 prompt 字段更新
  ↓
用户在图片节点点击生成按钮
  ↓
图片节点生成图片
```

### 4. 生成触发方式

**重要**：只有点击"生成"按钮才触发生成

- ✅ 点击"生成"按钮 → 触发生成
- ❌ 按 Enter 键 → 不触发生成（除了 AI 助手模式的对话输入）
- ✅ 按 Shift+Enter → 换行

**特殊说明**：
- 在 AI 提示词助手模式中，Enter 键用于发送对话消息
- 只有点击"生成"按钮才会传递提示词给下游节点

---

## 📊 数据结构

### 节点数据结构

```typescript
interface TextNodeData {
  // 模式标识
  mode?: 'manual' | 'reverse' | 'text-to-image' | 'prompt-generator';
  
  // 通用字段
  prompt?: string;              // 用户输入的文字/提示词
  
  // 图片反推模式
  inputImage?: string;          // 输入图片（Base64 或 Blob URL）
  generatedPrompt?: string;     // AI 生成的提示词
  editedPrompt?: string;        // 用户编辑后的提示词
  isAnalyzing?: boolean;        // 是否正在分析
  
  // 文生图模式
  outputNodeId?: string;        // 自动生成的节点 ID
  
  // 提示词生成模式
  userInput?: string;           // 用户的自然语言描述
  isGenerating?: boolean;       // 是否正在生成
  
  // API 配置
  model?: string;               // 选择的 AI 模型（如 "Gemini 3 Pro"）
  
  // 错误信息
  error?: string;
}
```

### 节点类型定义

```typescript
// 在 types.ts 中添加
export enum TextNodeMode {
  INITIAL = 'initial',              // 初始状态（显示功能选项列表）
  MANUAL = 'manual',                // 自己编写内容
  REVERSE = 'reverse',              // 图片反推提示词
  TEXT_TO_IMAGE = 'text-to-image',  // 文生图
  PROMPT_GENERATOR = 'prompt-generator', // 提示词生成
}
```

---

## 🎨 UI 规格

### 1. 初始状态（功能选项列表）

**容器**:
```css
width: 420px
min-height: 280px
background: #1a1a1a (暗色背景)
border-radius: 12px
border: 1px solid rgba(255, 255, 255, 0.1)
padding: 16px
```

**分类标签**:
```css
font-size: 10px
font-weight: bold
color: rgba(156, 163, 175, 0.6)  /* gray-400/60 */
margin-bottom: 8px
```

**功能选项（列表项）**:
```css
width: 100%
padding: 8px 12px
background: transparent
border: 1px solid transparent
border-radius: 8px
cursor: pointer
display: flex
align-items: center
gap: 10px

/* 悬停 */
background: rgba(255, 255, 255, 0.05)
border: 1px solid rgba(255, 255, 255, 0.1)
```

**文字（不使用图标）**:
```css
font-size: 11px
font-weight: 500
color: #d1d5db (gray-300)
```

### 2. API 工具栏（节点下方外部浮动）

**位置**:
```css
position: absolute
top: 100%  /* 节点下方 */
left: 0
margin-top: 8px
```

**容器**:
```css
display: flex
align-items: center
gap: 8px
padding: 8px 12px
background: rgba(255, 255, 255, 0.9)
backdrop-filter: blur(20px)
border: 1px solid rgba(229, 231, 235, 0.8)
border-radius: 8px
box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1)
```

**API 下拉框（简洁版）**:
```css
padding: 6px 10px
font-size: 10px
font-weight: 500
color: #4b5563 (gray-600)
background: transparent
border: 1px solid #e5e7eb (gray-200)
border-radius: 6px
cursor: pointer

/* 悬停 */
background: #f9fafb (gray-50)
```

### 3. 编辑模式（文本输入）

**文本输入框**:
```css
width: 100%
height: calc(100% - 60px)  /* 减去按钮区域高度 */
background: transparent
resize: none
font-size: 14px
color: #e2e8f0 (slate-200)
placeholder-color: #64748b (slate-500)
font-weight: 500
line-height: 1.6
padding: 12px 16px
```

**生成按钮**:
```css
position: absolute
bottom: 16px
right: 16px
padding: 8px 16px
font-size: 11px
font-weight: bold
color: white
background: #3b82f6 (blue-500)
border-radius: 8px
cursor: pointer

/* 悬停 */
background: #2563eb (blue-600)
```

### 4. 图片反推模式

**图片预览区**:
```css
width: 100%
height: 160px
background: rgba(0, 0, 0, 0.3)
border: 1px solid rgba(255, 255, 255, 0.05)
border-radius: 8px
overflow: hidden
margin-bottom: 12px
```

**提示词编辑框**:
```css
width: 100%
height: 120px
background: transparent
resize: none
font-size: 13px
color: #e2e8f0 (slate-200)
placeholder-color: #64748b (slate-500)
font-weight: 500
line-height: 1.5
padding: 12px
border: 1px solid rgba(255, 255, 255, 0.05)
border-radius: 8px
```

---

## 🔧 技术约束

### 1. 架构规则

**必须遵守三层架构**:
- UI Layer: `components/Node.tsx`
- Hooks Layer: `hooks/useNodeActions.ts`
- Core Layer: `core/stores/nodeStore.ts`

**禁止**:
- ❌ 在 `App.tsx` 写业务逻辑
- ❌ 在 UI 组件里写 AI 调用
- ❌ 跨层混用

### 2. 节点注册

**必须在 NodeRegistry 注册**:
```typescript
// core/registry/NodeRegistry.ts
nodeRegistry.register({
  type: NodeType.PROMPT_INPUT,
  name: '文字',
  iconName: 'Type',
  defaultWidth: 420,
  defaultHeight: 200,
  defaultData: {
    mode: 'initial',  // 初始状态
    prompt: '',
  },
  category: 'basic',
  description: '多功能文字节点：手动输入、提示词反推、文生图、AI 助手',
});
```

### 3. 性能优化

**必须使用 React.memo**:
```typescript
const TextNodeComponent = React.memo(({ node, onUpdate, ... }) => {
  // ...
}, arePropsEqual);
```

**必须使用 useCallback**:
```typescript
const handleGenerate = useCallback(() => {
  // ...
}, [node.id, prompt]);
```

### 4. 数据持久化

**必须使用 IndexedDB**:
```typescript
// 保存图片到 IndexedDB
const { saveFileToIndexedDBAsync } = await import('../services/blobStorage');
await saveFileToIndexedDBAsync(node.id, file);
```

---

## ✅ 验收标准

### 功能验收

#### 初始状态
- [ ] 节点创建时显示功能选项列表（垂直布局）
- [ ] 顶部显示"尝试:"分类标签
- [ ] 每个选项一行，**纯文字描述，不使用图标**
- [ ] 4 个选项：自己编写、图片反推、文生图、提示词生成
- [ ] 选项可点击
- [ ] 选项有悬停效果（整行高亮）
- [ ] 列表式布局，类似双击菜单

#### API 工具栏
- [ ] 工具栏浮动在节点下方外部
- [ ] 选中节点时出现，不选中时隐藏
- [ ] 只显示 API 模型选择下拉框
- [ ] 无倍数选择、历史记录、菱形图标
- [ ] 与双击菜单风格一致

#### 模式 1：自己编写内容
- [ ] 点击"自己编写内容"展开节点
- [ ] 显示大面积文本输入区域
- [ ] 支持 Shift+Enter 换行
- [ ] 右下角显示"生成"按钮
- [ ] **只有点击"生成"按钮才触发**（不是 Enter 键）
- [ ] 下游节点接收到提示词

#### 模式 2：图片反推提示词
- [ ] 点击"图片反推提示词"展开节点
- [ ] 无输入连接时显示上传按钮
- [ ] 有输入连接时显示输入图片
- [ ] 多个输入连接时提示用户
- [ ] 点击"生成提示词"按钮触发 AI 分析
- [ ] AI 生成的提示词显示在编辑框
- [ ] 可以编辑生成的提示词
- [ ] 点击"生成"按钮传递提示词

#### 模式 3：文生图
- [ ] 点击"文生图"自动生成图片节点
- [ ] 图片节点在文字节点右侧
- [ ] 自动建立连接
- [ ] 显示文本输入区域
- [ ] 可以输入提示词
- [ ] 点击"生成"按钮传递提示词
- [ ] 图片节点接收到提示词

#### 模式 4：提示词生成
- [ ] 点击"提示词生成"展开节点
- [ ] 显示输入界面（用户输入区 + 生成按钮 + 结果显示区）
- [ ] 可以输入自然语言描述
- [ ] 点击"生成提示词"按钮触发 AI 生成
- [ ] 生成的专业提示词显示在下方文本框
- [ ] 可以编辑生成的提示词
- [ ] 可以点击"复制"按钮复制提示词
- [ ] **在本节点内完成，不需要输出到下游节点**
- [ ] 如果 AI 功能未实现，显示"功能开发中"提示

### 交互验收

- [ ] 模式切换流畅
- [ ] 自动生成节点位置正确
- [ ] 自动建立连接正确
- [ ] 提示词传递正确
- [ ] 错误提示清晰
- [ ] 加载状态明显
- [ ] **只有点击按钮才生成，Enter 键不触发**（除了提示词生成模式的输入框）

### UI 验收

- [ ] 初始状态 UI 符合规格（垂直列表布局，纯文字，4 个选项）
- [ ] API 工具栏 UI 符合规格（节点下方外部浮动）
- [ ] 编辑模式 UI 符合规格（大面积输入区 + 生成按钮）
- [ ] 反推模式 UI 符合规格（图片预览 + 编辑框）
- [ ] 文生图模式 UI 符合规格
- [ ] 提示词生成模式 UI 符合规格（输入区 + 生成按钮 + 结果显示）
- [ ] 与双击菜单风格一致（精致、轻盈）
- [ ] 参考截图的排版和使用逻辑

### 性能验收

- [ ] 节点渲染不卡顿
- [ ] 模式切换不卡顿
- [ ] AI 分析不阻塞 UI
- [ ] 图片上传不阻塞 UI
- [ ] 内存占用合理

---

## 📚 相关文档

- **架构文档**: `ARCHITECTURE.md`
- **重构需求**: `.kiro/specs/canvas-architecture-refactor/requirements.md`
- **节点注册表**: `core/registry/NodeRegistry.ts`
- **类型定义**: `types.ts`
- **节点组件**: `components/Node.tsx`
- **双击菜单 UI**: `双击菜单UI优化-2026-02-03.md`

---

## 🎯 下一步

1. **设计文档** - 创建 `design.md`，详细设计数据结构和 UI 组件
2. **任务列表** - 创建 `tasks.md`，分解实施任务
3. **实施** - 按照任务列表逐步实施
4. **测试** - 功能测试、交互测试、性能测试
5. **验收** - 对照验收标准验收

---

**文档版本**: v2.0  
**创建日期**: 2026-02-03  
**最后更新**: 2026-02-03  
**作者**: Kiro AI  
**审核状态**: 待审核
