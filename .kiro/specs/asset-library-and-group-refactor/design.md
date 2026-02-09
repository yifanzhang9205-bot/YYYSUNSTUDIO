# 资产库 + 组功能重构 - 设计文档

**日期**: 2026-02-08  
**版本**: 1.0

---

## 🎨 UI 设计规范

### 1. 临时工具栏（SelectionToolbar）

#### 视觉设计
```
┌─────────────────────────────────────────┐
│  🎨 创建资产         📦 打组            │
└─────────────────────────────────────────┘
```

#### 样式规范
- **容器**：
  - 背景：`bg-white`
  - 边框：`border border-gray-200`
  - 圆角：`rounded-lg`
  - 阴影：`shadow-lg`
  - 内边距：`px-2 py-1.5`
  - 间距：`gap-2`

- **按钮**：
  - 高度：`h-9`
  - 内边距：`px-3 py-2`
  - 圆角：`rounded-lg`
  - 字体：`text-[12px] font-medium`
  - 图标大小：`size={16}`
  - 过渡：`transition-all`
  - 悬停：`hover:scale-[1.02]`
  - 点击：`active:scale-[0.98]`

- **创建资产按钮**：
  - 背景：`bg-blue-500`
  - 文字：`text-white`
  - 悬停：`hover:bg-blue-600`
  - 图标：`FolderHeart`

- **打组按钮**：
  - 背景：`bg-gray-100`
  - 文字：`text-gray-700`
  - 悬停：`hover:bg-gray-200`
  - 图标：`Package`

---

### 2. 创建资产对话框（CreateAssetDialog）

#### 视觉设计
```
┌──────────────────────────────────────────┐
│  创建资产                           [X]   │
├──────────────────────────────────────────┤
│                                          │
│  资产名称 *                               │
│  ┌────────────────────────────────────┐  │
│  │ 请输入资产名称                      │  │
│  └────────────────────────────────────┘  │
│                                          │
│  选择分类 *                               │
│  ┌────────────────────────────────────┐  │
│  │ ○ 人物  ○ 场景  ○ 物品             │  │
│  │ ○ 风格  ○ 其他                      │  │
│  └────────────────────────────────────┘  │
│                                          │
│  缩略图                                   │
│  ┌────────────────────────────────────┐  │
│  │                                    │  │
│  │        [预览图 / 上传按钮]          │  │
│  │                                    │  │
│  └────────────────────────────────────┘  │
│                                          │
│              [取消]      [确认创建]       │
└──────────────────────────────────────────┘
```

#### 样式规范
- **对话框容器**：
  - 宽度：`w-[480px]`
  - 背景：`bg-white`
  - 边框：`border border-gray-200`
  - 圆角：`rounded-2xl`
  - 阴影：`shadow-2xl`
  - 内边距：`p-6`

- **标题**：
  - 字体：`text-lg font-semibold text-gray-900`
  - 底部边框：`border-b border-gray-200`
  - 内边距：`pb-4 mb-6`

- **输入框**：
  - 高度：`h-10`
  - 背景：`bg-white`
  - 边框：`border border-gray-300`
  - 圆角：`rounded-lg`
  - 内边距：`px-3`
  - 焦点：`focus:border-blue-500 focus:ring-2 focus:ring-blue-200`

- **分类选择**：
  - 布局：`grid grid-cols-3 gap-2`
  - 单选按钮：
    - 未选中：`bg-gray-100 text-gray-700 border-gray-200`
    - 选中：`bg-blue-500 text-white border-blue-500`
    - 悬停：`hover:bg-gray-200`（未选中时）

- **缩略图预览**：
  - 尺寸：`aspect-square`
  - 最大高度：`max-h-48`
  - 背景：`bg-gray-100`
  - 边框：`border-2 border-dashed border-gray-300`
  - 圆角：`rounded-xl`

- **按钮**：
  - 取消：`bg-gray-100 text-gray-700 hover:bg-gray-200`
  - 确认：`bg-blue-500 text-white hover:bg-blue-600`
  - 高度：`h-10`
  - 内边距：`px-6`
  - 圆角：`rounded-lg`

---

### 3. 资产库面板（AssetLibraryPanel）

#### 视觉设计
```
┌─────────────────────────────────────┐
│  资产库                        [+]   │
├─────────────────────────────────────┤
│  ┌───────────────────────────────┐  │
│  │ 全部 人物 场景 物品 风格 其他  │  │
│  └───────────────────────────────┘  │
├─────────────────────────────────────┤
│  ┌───────┐  ┌───────┐              │
│  │       │  │       │              │
│  │ 缩略图 │  │ 缩略图 │              │
│  │       │  │       │              │
│  └───────┘  └───────┘              │
│   资产名称    资产名称               │
│                                     │
│  ┌───────┐  ┌───────┐              │
│  │       │  │       │              │
│  │ 缩略图 │  │ 缩略图 │              │
│  │       │  │       │              │
│  └───────┘  └───────┘              │
│   资产名称    资产名称               │
└─────────────────────────────────────┘
```

#### 样式规范
- **面板容器**：
  - 宽度：`w-72`（288px）
  - 背景：`bg-white`
  - 边框：`border border-gray-200`
  - 圆角：`rounded-lg`
  - 阴影：`shadow-xl`

- **标题栏**：
  - 高度：`h-12`
  - 背景：`bg-white`
  - 边框底部：`border-b border-gray-200`
  - 内边距：`px-4`
  - 字体：`text-xs font-semibold text-gray-600 uppercase tracking-wider`

- **分类标签**：
  - 布局：`flex gap-2 overflow-x-auto`
  - 内边距：`p-2`
  - 背景：`bg-gray-100`
  - 圆角：`rounded-xl`
  - 单个标签：
    - 未选中：`text-gray-500 hover:text-gray-700`
    - 选中：`bg-white text-gray-900 shadow-sm border border-gray-200`
    - 内边距：`px-3 py-2`
    - 圆角：`rounded-lg`
    - 字体：`text-[11px] font-semibold`

- **资产网格**：
  - 布局：`grid grid-cols-2 gap-2`
  - 内边距：`p-2`
  - 滚动：`overflow-y-auto custom-scrollbar`

- **资产卡片**：
  - 尺寸：`aspect-square`
  - 背景：`bg-white`
  - 边框：`border border-gray-200`
  - 圆角：`rounded-2xl`
  - 悬停：`hover:border-gray-400 hover:scale-[1.02]`
  - 过渡：`transition-all`
  - 光标：`cursor-grab active:cursor-grabbing`

- **缩略图**：
  - 尺寸：`w-full h-full`
  - 对象适配：`object-cover`
  - 圆角：`rounded-2xl`
  - 不透明度：`opacity-80 group-hover:opacity-100`

- **资产名称**：
  - 位置：`absolute bottom-0 left-0 w-full`
  - 背景：`bg-gradient-to-t from-black/80 to-transparent`
  - 内边距：`p-2`
  - 字体：`text-[10px] text-white/90 truncate font-medium`

- **空状态**：
  - 布局：`flex flex-col items-center justify-center py-16`
  - 图标：`w-16 h-16 rounded-full bg-gray-100 text-gray-400`
  - 文字：`text-xs font-medium text-gray-400 text-center`

---

### 4. 组颜色选择器（GroupColorPicker）

#### 视觉设计
```
┌─────────────────────────────────┐
│  选择组颜色                      │
├─────────────────────────────────┤
│  ⬜ 🔵 🟢 🟡 🔴 🟣 🟠          │
│  默认 蓝色 绿色 黄色 红色 紫色 橙色 │
└─────────────────────────────────┘
```

#### 样式规范
- **容器**：
  - 背景：`bg-white`
  - 边框：`border border-gray-200`
  - 圆角：`rounded-lg`
  - 阴影：`shadow-lg`
  - 内边距：`p-3`

- **标题**：
  - 字体：`text-xs font-semibold text-gray-600`
  - 底部边距：`mb-3`

- **色卡网格**：
  - 布局：`grid grid-cols-7 gap-2`

- **色卡按钮**：
  - 尺寸：`w-8 h-8`
  - 圆角：`rounded-lg`
  - 边框：`border-2`
  - 未选中：`border-transparent`
  - 选中：`border-gray-900 ring-2 ring-gray-300`
  - 悬停：`hover:scale-110`
  - 过渡：`transition-all`

- **颜色方案**：
  1. 默认：`bg-gray-200`
  2. 蓝色：`bg-blue-500`
  3. 绿色：`bg-green-500`
  4. 黄色：`bg-yellow-500`
  5. 红色：`bg-red-500`
  6. 紫色：`bg-purple-500`
  7. 橙色：`bg-orange-500`

---

### 5. 组工具栏（GroupToolbar）- 重新设计

#### 视觉设计
```
┌──────────────────────────────────────────────┐
│  🎨 颜色    📐 自动排列 ▼    🔓 解组        │
└──────────────────────────────────────────────┘
```

#### 样式规范
- **容器**：
  - 背景：`bg-white`
  - 边框：`border border-gray-200`
  - 圆角：`rounded-lg`
  - 阴影：`shadow-lg`
  - 内边距：`px-2 py-1.5`
  - 间距：`gap-0.5`

- **按钮**：
  - 高度：`h-8`
  - 内边距：`px-2 py-1`
  - 圆角：`rounded-lg`
  - 字体：`text-[11px] font-medium`
  - 图标大小：`size={14}`
  - 颜色：`text-gray-700 hover:text-blue-600 hover:bg-blue-50`
  - 过渡：`transition-colors`

- **自动排列下拉菜单**：
  - 背景：`bg-white`
  - 边框：`border border-gray-200`
  - 圆角：`rounded-lg`
  - 阴影：`shadow-lg`
  - 内边距：`p-1`
  - 最小宽度：`min-w-[140px]`
  - 菜单项：
    - 内边距：`px-4 py-2.5`
    - 字体：`text-xs text-gray-700`
    - 悬停：`hover:bg-gray-100`
    - 圆角：`rounded-lg`
    - 图标：`size={14}`
    - 间距：`gap-3`

---

## 🎨 组颜色效果

### 颜色方案详细规范

#### 1. 默认（灰色）
```css
background: rgba(243, 244, 246, 0.5);  /* bg-gray-100/50 */
border: 2px solid rgb(156, 163, 175);  /* border-gray-400 */
```

#### 2. 蓝色
```css
background: rgba(219, 234, 254, 0.3);  /* bg-blue-100/30 */
border: 2px solid rgb(59, 130, 246);   /* border-blue-500 */
```

#### 3. 绿色
```css
background: rgba(220, 252, 231, 0.3);  /* bg-green-100/30 */
border: 2px solid rgb(34, 197, 94);    /* border-green-500 */
```

#### 4. 黄色
```css
background: rgba(254, 249, 195, 0.3);  /* bg-yellow-100/30 */
border: 2px solid rgb(234, 179, 8);    /* border-yellow-500 */
```

#### 5. 红色
```css
background: rgba(254, 226, 226, 0.3);  /* bg-red-100/30 */
border: 2px solid rgb(239, 68, 68);    /* border-red-500 */
```

#### 6. 紫色
```css
background: rgba(243, 232, 255, 0.3);  /* bg-purple-100/30 */
border: 2px solid rgb(168, 85, 247);   /* border-purple-500 */
```

#### 7. 橙色
```css
background: rgba(255, 237, 213, 0.3);  /* bg-orange-100/30 */
border: 2px solid rgb(249, 115, 22);   /* border-orange-500 */
```

---

## 🎨 缩略图生成规则

### 规则 1：有图片节点
```typescript
// 使用第一个图片节点的图片
const imageNode = nodes.find(n => 
  n.type === NodeType.IMAGE_GENERATOR || 
  n.data.image || 
  n.data.images?.length > 0
);

if (imageNode) {
  thumbnail = imageNode.data.image || imageNode.data.images[0];
}
```

### 规则 2：无图片 + 用户上传
```typescript
// 用户在对话框中上传自定义缩略图
thumbnail = uploadedImage;
thumbnailType = 'custom';
```

### 规则 3：无图片 + 无上传
```typescript
// 使用资产名称的首字母作为占位符
const firstLetter = assetName.charAt(0).toUpperCase();
const backgroundColor = generateColorFromLetter(firstLetter);

// 渲染为 Canvas，转换为 Blob URL
thumbnail = generateTextThumbnail(firstLetter, backgroundColor);
thumbnailType = 'text';
```

#### 首字母颜色生成算法
```typescript
const generateColorFromLetter = (letter: string): string => {
  const colors = [
    '#3B82F6', // 蓝色
    '#10B981', // 绿色
    '#F59E0B', // 黄色
    '#EF4444', // 红色
    '#8B5CF6', // 紫色
    '#F97316', // 橙色
    '#06B6D4', // 青色
  ];
  
  const charCode = letter.charCodeAt(0);
  const index = charCode % colors.length;
  return colors[index];
};
```

#### 文字缩略图渲染
```typescript
const generateTextThumbnail = (letter: string, bgColor: string): string => {
  const canvas = document.createElement('canvas');
  canvas.width = 200;
  canvas.height = 200;
  
  const ctx = canvas.getContext('2d')!;
  
  // 背景
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, 200, 200);
  
  // 文字
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 100px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(letter, 100, 100);
  
  // 转换为 Blob URL
  return canvas.toDataURL('image/png');
};
```

---

## 🔧 自动排列算法

### 水平布局（Horizontal Layout）

```typescript
const arrangeHorizontal = (groupId: string) => {
  const group = groups.find(g => g.id === groupId);
  if (!group) return;

  const groupNodes = getGroupNodes(groupId);
  if (groupNodes.length === 0) return;

  onSaveHistory();

  // 参数
  const horizontalGap = 80;
  const padding = 40;

  // 计算总宽度
  let totalWidth = 0;
  groupNodes.forEach(node => {
    totalWidth += (node.width || 420);
  });
  totalWidth += (groupNodes.length - 1) * horizontalGap;

  // 计算起始 X 位置（居中）
  let currentX = group.x + padding + (group.width - padding * 2 - totalWidth) / 2;

  // 计算所有节点的平均 Y 位置（垂直居中）
  const avgY = groupNodes.reduce((sum, n) => sum + n.y, 0) / groupNodes.length;

  // 排列节点
  groupNodes.forEach(node => {
    const nodeWidth = node.width || 420;
    const nodeHeight = getApproxNodeHeight(node);
    
    onUpdateNode(node.id, {
      x: currentX,
      y: avgY - nodeHeight / 2,  // 垂直居中
    });

    currentX += nodeWidth + horizontalGap;
  });

  // 更新组边界
  updateGroupBounds(groupId);
};
```

### 宫格布局（Grid Layout）

```typescript
const arrangeGrid = (groupId: string) => {
  // 使用现有的拓扑排序算法
  // 已在 hooks/useGroup.ts 中实现
  arrangeTopology(groupId);
};
```

---

## 📊 数据流设计

### 创建资产流程

```
用户框选节点
  ↓
显示临时工具栏
  ↓
点击"创建资产"
  ↓
弹出 CreateAssetDialog
  ↓
用户输入名称、选择分类、上传缩略图（可选）
  ↓
点击"确认创建"
  ↓
useAssetLibrary.createAsset()
  ├─ 深拷贝节点数据
  ├─ 深拷贝连接关系
  ├─ 生成缩略图（如果需要）
  └─ 保存到 assetLibraryStore
  ↓
显示成功提示
  ↓
关闭对话框
  ↓
取消选中状态
```

### 使用资产流程

```
用户拖拽资产卡片到画布
  ↓
useAssetLibrary.useAsset(assetId, position)
  ├─ 从 assetLibraryStore 获取资产数据
  ├─ 深拷贝节点数据
  ├─ 生成新的节点 ID
  ├─ 调整节点位置（相对于鼠标位置）
  ├─ 添加节点到 nodeStore
  └─ 添加连接到 connectionStore
  ↓
节点显示在画布上
```

### 打组流程

```
用户框选节点
  ↓
显示临时工具栏
  ↓
点击"打组"
  ↓
useGroup.createGroup()
  ├─ 计算选中节点的边界
  ├─ 创建组数据
  └─ 保存到 groupStore
  ↓
显示组工具栏
  ↓
用户可以：
  ├─ 自定义颜色
  ├─ 自动排列（水平 / 宫格）
  └─ 解组
```

---

## 🗂️ 文件结构

```
src/
├── core/
│   ├── stores/
│   │   ├── assetLibraryStore.ts       # 🔥 新增：资产库 Store
│   │   ├── groupStore.ts              # 🔥 修改：添加 color 字段
│   │   └── ...
│   └── ...
├── hooks/
│   ├── useAssetLibrary.ts             # 🔥 新增：资产库 Hook
│   ├── useSelection.ts                # 🔥 修改：框选后不自动创建组
│   ├── useGroup.ts                    # 🔥 修改：添加颜色、排列、解组功能
│   └── ...
├── components/
│   ├── SelectionToolbar.tsx           # 🔥 新增：临时工具栏
│   ├── CreateAssetDialog.tsx          # 🔥 新增：创建资产对话框
│   ├── AssetLibraryPanel.tsx          # 🔥 新增：资产库面板
│   ├── GroupColorPicker.tsx           # 🔥 新增：组颜色选择器
│   ├── GroupToolbar.tsx               # 🔥 修改：重新设计
│   ├── SidebarDock.tsx                # 🔥 修改：替换工作流为资产库
│   └── ...
└── ...
```

---

## 🎯 关键技术点

### 1. 深拷贝节点数据
```typescript
const deepCopyNodes = (nodes: AppNode[]): AppNode[] => {
  return nodes.map(node => ({
    ...node,
    id: node.id,  // 保持原 ID（创建资产时）
    data: JSON.parse(JSON.stringify(node.data)),  // 深拷贝 data
    inputs: [...node.inputs],  // 浅拷贝数组
  }));
};
```

### 2. 生成新 ID（使用资产时）
```typescript
const generateNewIds = (nodes: AppNode[]): Map<string, string> => {
  const idMap = new Map<string, string>();
  nodes.forEach(node => {
    idMap.set(node.id, `node-${Date.now()}-${Math.random()}`);
  });
  return idMap;
};
```

### 3. 调整节点位置
```typescript
const adjustNodePositions = (
  nodes: AppNode[], 
  offset: { x: number; y: number }
): AppNode[] => {
  return nodes.map(node => ({
    ...node,
    x: node.x + offset.x,
    y: node.y + offset.y,
  }));
};
```

### 4. Blob URL 管理
```typescript
// 保存资产时，将 Blob URL 转换为持久化存储
const saveBlobUrl = async (url: string, assetId: string, index: number) => {
  const blob = await fetch(url).then(r => r.blob());
  await saveToStorage(`asset-${assetId}-${index}`, blob);
};

// 加载资产时，恢复 Blob URL
const loadBlobUrl = async (assetId: string, index: number): Promise<string> => {
  const blob = await loadFromStorage<Blob>(`asset-${assetId}-${index}`);
  if (blob) {
    return URL.createObjectURL(blob);
  }
  return '';
};
```

---

## ✅ 设计验收清单

- [ ] 所有 UI 组件的视觉设计已定义
- [ ] 所有颜色、字体、间距已规范化
- [ ] 所有交互流程已明确
- [ ] 所有数据结构已定义
- [ ] 所有算法已设计
- [ ] 所有技术难点已解决
- [ ] 文件结构已规划
- [ ] 符合现有 UI 风格（亮色、极简、专业）

---

## 📝 总结

这份设计文档定义了：
- 5 个新增 UI 组件的详细样式
- 7 种组颜色方案
- 3 种缩略图生成规则
- 2 种自动排列算法
- 完整的数据流和技术实现

下一步：开始实施！🚀
