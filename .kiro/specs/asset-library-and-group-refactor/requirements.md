# 资产库 + 组功能重构 - 需求文档

**日期**: 2026-02-08  
**版本**: 1.0  
**状态**: 设计中

---

## 📋 功能概述

将工作流功能替换为资产库，并重构组功能的交互逻辑，提供更灵活的节点管理方式。

---

## 🎯 核心目标

1. **删除工作流功能**，替换为资产库
2. **重构组功能**：框选后不自动创建组，提供"创建资产"和"打组"两个选项
3. **增强组功能**：自定义颜色、多种自动排列、解组
4. **资产库分类**：全部、人物、场景、物品、风格、其他

---

## 🔄 交互逻辑变更

### 当前逻辑（旧）
```
框选节点 → 自动创建组 → 显示组工具栏（自动排列）
```

### 新逻辑
```
框选节点 → 显示临时工具栏（创建资产 / 打组）
  ├─ 不点击 → 只是批量移动，取消选择后消失
  ├─ 点击"创建资产" → 弹出对话框（选择分类 + 命名）→ 保存到资产库
  └─ 点击"打组" → 创建组 → 显示组工具栏（自定义颜色 / 自动排列 / 解组）
```

---

## 📐 详细功能规格

### 1. 框选节点后的临时工具栏

#### 触发条件
- 用户框选 2 个或以上节点
- 或使用 Ctrl/Cmd + A 全选

#### 显示位置
- 选区上方中心位置（类似现在的组工具栏位置）
- 使用 fixed 定位，不受画布缩放影响

#### 工具栏内容
```
┌─────────────────────────────────┐
│  🎨 创建资产    📦 打组         │
└─────────────────────────────────┘
```

#### 按钮样式
- **创建资产**：
  - 图标：FolderHeart（Lucide）
  - 颜色：蓝色（bg-blue-500）
  - 文案："创建资产"

- **打组**：
  - 图标：Package（Lucide）
  - 颜色：灰色（bg-gray-100）
  - 文案："打组"

#### 行为
- 如果用户不点击任何按钮，只是临时选中状态
- 可以批量移动节点
- 取消选择后，临时状态消失
- 临时选中状态的视觉样式：与现有选中状态一致（蓝色边框）

---

### 2. 创建资产功能

#### 触发方式
- 点击临时工具栏的"创建资产"按钮

#### 弹出对话框
```
┌─────────────────────────────────────┐
│  创建资产                            │
├─────────────────────────────────────┤
│                                     │
│  资产名称：                          │
│  ┌─────────────────────────────┐   │
│  │ [输入框]                     │   │
│  └─────────────────────────────┘   │
│                                     │
│  选择分类：                          │
│  ○ 人物   ○ 场景   ○ 物品          │
│  ○ 风格   ○ 其他                    │
│                                     │
│  缩略图：                            │
│  ┌─────────────────────────────┐   │
│  │ [预览图 / 上传按钮]          │   │
│  └─────────────────────────────┘   │
│                                     │
│         [取消]      [确认创建]      │
└─────────────────────────────────────┘
```

#### 字段说明

**1. 资产名称**
- 必填
- 最大长度：50 字符
- 允许中文、英文、数字、空格、下划线、连字符
- 默认值：空（用户必须输入）

**2. 选择分类**
- 必选（单选）
- 选项：人物、场景、物品、风格、其他
- 默认选中："其他"

**3. 缩略图**
- 自动生成规则：
  - **如果资产包含图片节点**：使用第一个图片节点的图片
  - **如果没有图片节点**：显示上传按钮，允许用户自定义
  - **如果用户没有上传**：使用资产名称的首字母作为占位符（类似头像）

- 缩略图尺寸：正方形（1:1）
- 缩略图质量：中等（避免占用过多存储）

#### 确认后的行为
1. 保存资产数据到 `assetLibraryStore`
2. 生成缩略图（如果需要）
3. 显示成功提示："资产已保存"
4. 关闭对话框
5. 取消选中状态

#### 保存的数据结构
```typescript
interface Asset {
  id: string;                    // 唯一 ID
  name: string;                  // 资产名称
  category: AssetCategory;       // 分类
  thumbnail: string;             // 缩略图（Blob URL 或 Base64）
  nodes: AppNode[];              // 节点数据（深拷贝）
  connections: Connection[];     // 连接关系
  createdAt: number;             // 创建时间戳
  updatedAt: number;             // 更新时间戳
}

type AssetCategory = 'character' | 'scene' | 'object' | 'style' | 'other';
```

---

### 3. 打组功能

#### 触发方式
- 点击临时工具栏的"打组"按钮

#### 行为
1. 创建组（Group）
2. 将选中的节点添加到组内
3. 显示组工具栏（替换临时工具栏）

#### 组工具栏内容
```
┌─────────────────────────────────────────────┐
│  🎨 颜色    📐 自动排列 ▼    🔓 解组       │
└─────────────────────────────────────────────┘
```

---

### 4. 组功能增强

#### 4.1 自定义颜色

**触发方式**：点击"颜色"按钮

**弹出色卡选择器**：
```
┌─────────────────────────┐
│  选择组颜色              │
├─────────────────────────┤
│  ⬜ ⬜ ⬜ ⬜ ⬜ ⬜ ⬜    │
│  默认 蓝色 绿色 黄色 红色 紫色 橙色 │
└─────────────────────────┘
```

**色卡方案**（7 种颜色）：
1. **默认**：`bg-gray-100/50` + `border-gray-400`（当前样式）
2. **蓝色**：`bg-blue-100/30` + `border-blue-500`
3. **绿色**：`bg-green-100/30` + `border-green-500`
4. **黄色**：`bg-yellow-100/30` + `border-yellow-500`
5. **红色**：`bg-red-100/30` + `border-red-500`
6. **紫色**：`bg-purple-100/30` + `border-purple-500`
7. **橙色**：`bg-orange-100/30` + `border-orange-500`

**效果**：
- 整个组的背景变为半透明颜色（30% 透明度）
- 边框变为对应颜色（100% 不透明）
- 颜色保存到组数据中

**数据结构**：
```typescript
interface Group {
  id: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  nodeIds: string[];
  color?: GroupColor;  // 🔥 新增：组颜色
}

type GroupColor = 'default' | 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'orange';
```

---

#### 4.2 自动排列（下拉菜单）

**触发方式**：点击"自动排列"按钮，显示下拉菜单

**下拉菜单内容**：
```
┌─────────────────────┐
│  水平布局            │
│  宫格布局            │
└─────────────────────┘
```

**水平布局**：
- 所有节点排成一行
- 从左到右排列
- 节点之间间距：80px
- 垂直居中对齐

**宫格布局**：
- 类似现在的拓扑排序
- 按层级排列（从上到下）
- 每层内的节点水平居中
- 层与层之间间距：100px
- 节点之间间距：80px

---

#### 4.3 解组功能

**触发方式**：点击"解组"按钮

**行为**：
1. 删除组（Group）
2. 保留组内的所有节点
3. 节点位置不变
4. 隐藏组工具栏

**确认对话框**：
```
┌─────────────────────────────────┐
│  确认解组？                      │
├─────────────────────────────────┤
│  解组后，节点将保留，但组将被删除 │
│                                 │
│         [取消]      [确认]      │
└─────────────────────────────────┘
```

---

### 5. 资产库 UI

#### 5.1 侧边栏位置
- 替换现有的"工作流"面板
- 位置：左侧侧边栏第 2 个按钮
- 图标：FolderHeart（Lucide）
- 文案："资产库"

#### 5.2 面板布局
```
┌─────────────────────────────────┐
│  资产库                    [+]   │
├─────────────────────────────────┤
│  全部 人物 场景 物品 风格 其他   │
├─────────────────────────────────┤
│  ┌───────┐  ┌───────┐           │
│  │ 缩略图 │  │ 缩略图 │           │
│  │       │  │       │           │
│  └───────┘  └───────┘           │
│   资产名称    资产名称            │
│                                 │
│  ┌───────┐  ┌───────┐           │
│  │ 缩略图 │  │ 缩略图 │           │
│  │       │  │       │           │
│  └───────┘  └───────┘           │
│   资产名称    资产名称            │
└─────────────────────────────────┘
```

#### 5.3 分类标签
- 位置：面板顶部
- 样式：类似历史记录的 Tab 样式
- 选中状态：蓝色背景 + 白色文字
- 未选中状态：灰色文字

#### 5.4 资产卡片
- 布局：2 列网格
- 卡片尺寸：正方形（aspect-square）
- 卡片样式：
  - 背景：白色
  - 边框：灰色（border-gray-200）
  - 圆角：rounded-2xl
  - 悬停：边框变深（border-gray-400）+ 轻微放大（scale-[1.02]）

#### 5.5 缩略图显示规则
1. **有图片**：显示图片
2. **无图片 + 用户上传**：显示用户上传的图片
3. **无图片 + 无上传**：显示资产名称的首字母（类似头像）
   - 背景：渐变色（根据首字母生成）
   - 文字：白色、大号字体（text-4xl）

#### 5.6 空状态
```
┌─────────────────────────────────┐
│                                 │
│         ┌─────────┐             │
│         │  图标   │             │
│         └─────────┘             │
│                                 │
│      暂无资产                    │
│   框选节点后创建资产              │
│                                 │
└─────────────────────────────────┘
```

#### 5.7 使用资产
- **拖拽到画布**：在鼠标位置创建节点
- **点击卡片**：在画布中心创建节点
- **右键菜单**：
  - 重命名
  - 删除
  - 导出（未来功能）

---

## 🗂️ 数据结构设计

### Asset（资产）
```typescript
interface Asset {
  id: string;                    // 唯一 ID（uuid）
  name: string;                  // 资产名称
  category: AssetCategory;       // 分类
  thumbnail: string;             // 缩略图（Blob URL）
  thumbnailType: 'auto' | 'custom' | 'text';  // 缩略图类型
  nodes: AppNode[];              // 节点数据（深拷贝）
  connections: Connection[];     // 连接关系
  createdAt: number;             // 创建时间戳
  updatedAt: number;             // 更新时间戳
}

type AssetCategory = 'character' | 'scene' | 'object' | 'style' | 'other';
```

### Group（组）- 新增字段
```typescript
interface Group {
  id: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  nodeIds: string[];
  color?: GroupColor;  // 🔥 新增：组颜色
}

type GroupColor = 'default' | 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'orange';
```

---

## 🏗️ 架构设计

### 新增 Store
```typescript
// core/stores/assetLibraryStore.ts
interface AssetLibraryState {
  assets: Asset[];
  selectedCategory: AssetCategory | 'all';
  
  // Actions
  addAsset: (asset: Asset) => void;
  updateAsset: (id: string, updates: Partial<Asset>) => void;
  deleteAsset: (id: string) => void;
  getAssetsByCategory: (category: AssetCategory | 'all') => Asset[];
  setSelectedCategory: (category: AssetCategory | 'all') => void;
}
```

### 新增 Hook
```typescript
// hooks/useAssetLibrary.ts
export const useAssetLibrary = () => {
  // 创建资产
  const createAsset = (nodes: AppNode[], connections: Connection[]) => { ... };
  
  // 使用资产（拖拽到画布）
  const useAsset = (assetId: string, position: { x: number; y: number }) => { ... };
  
  // 生成缩略图
  const generateThumbnail = (nodes: AppNode[]) => { ... };
  
  return { createAsset, useAsset, generateThumbnail };
};
```

### 修改现有 Hook
```typescript
// hooks/useSelection.ts
// 🔥 修改：框选后不自动创建组
// 🔥 新增：显示临时工具栏的逻辑

// hooks/useGroup.ts
// 🔥 新增：自定义颜色功能
// 🔥 新增：水平布局功能
// 🔥 修改：宫格布局（原拓扑排序）
// 🔥 新增：解组功能
```

---

## 🎨 UI 组件设计

### 新增组件

#### 1. SelectionToolbar（临时工具栏）
```typescript
interface SelectionToolbarProps {
  selectedNodeIds: string[];
  selectionRect: { x: number; y: number; width: number; height: number };
  scale: number;
  pan: { x: number; y: number };
  onCreateAsset: () => void;
  onCreateGroup: () => void;
}
```

#### 2. CreateAssetDialog（创建资产对话框）
```typescript
interface CreateAssetDialogProps {
  nodes: AppNode[];
  connections: Connection[];
  onConfirm: (asset: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}
```

#### 3. AssetLibraryPanel（资产库面板）
```typescript
interface AssetLibraryPanelProps {
  assets: Asset[];
  selectedCategory: AssetCategory | 'all';
  onSelectCategory: (category: AssetCategory | 'all') => void;
  onUseAsset: (assetId: string) => void;
  onDeleteAsset: (assetId: string) => void;
  onRenameAsset: (assetId: string, newName: string) => void;
}
```

#### 4. GroupColorPicker（组颜色选择器）
```typescript
interface GroupColorPickerProps {
  currentColor: GroupColor;
  onSelectColor: (color: GroupColor) => void;
}
```

### 修改组件

#### GroupToolbar（组工具栏）
```typescript
// 🔥 删除：对齐、分布功能
// 🔥 新增：自定义颜色按钮
// 🔥 修改：自动排列改为下拉菜单（水平 / 宫格）
// 🔥 新增：解组按钮

interface GroupToolbarProps {
  groupId: string;
  groupX: number;
  groupY: number;
  groupWidth: number;
  groupColor: GroupColor;
  scale: number;
  panX: number;
  panY: number;
  onSelectColor: (color: GroupColor) => void;
  onArrangeHorizontal: (groupId: string) => void;
  onArrangeGrid: (groupId: string) => void;
  onUngroup: (groupId: string) => void;
}
```

#### SidebarDock（侧边栏）
```typescript
// 🔥 删除：工作流面板
// 🔥 新增：资产库面板
```

---

## 📊 实施计划

### 阶段 1：重构选择逻辑（2-3 天）
- [ ] 修改 `useSelection` Hook
- [ ] 框选后不自动创建组
- [ ] 创建 `SelectionToolbar` 组件
- [ ] 实现临时选中状态
- [ ] 测试批量移动功能

### 阶段 2：资产库功能（3-4 天）
- [ ] 创建 `assetLibraryStore`
- [ ] 创建 `useAssetLibrary` Hook
- [ ] 创建 `CreateAssetDialog` 组件
- [ ] 实现缩略图生成逻辑
- [ ] 创建 `AssetLibraryPanel` 组件
- [ ] 修改 `SidebarDock`，替换工作流为资产库
- [ ] 实现资产拖拽到画布
- [ ] 实现资产右键菜单（重命名、删除）
- [ ] 测试资产创建和使用

### 阶段 3：组功能增强（2-3 天）
- [ ] 修改 `GroupToolbar` 组件
- [ ] 创建 `GroupColorPicker` 组件
- [ ] 实现自定义颜色功能
- [ ] 修改 `useGroup` Hook
- [ ] 实现水平布局功能
- [ ] 实现宫格布局功能（修改现有拓扑排序）
- [ ] 实现解组功能
- [ ] 测试组功能

### 阶段 4：数据迁移和优化（1-2 天）
- [ ] 工作流数据迁移方案（可选：转换为资产）
- [ ] 性能优化（资产库大量数据时）
- [ ] 缩略图懒加载
- [ ] 内存优化（Blob URL 管理）
- [ ] 完整测试

---

## ✅ 验收标准

### 功能验收
- [ ] 框选节点后显示临时工具栏（创建资产 / 打组）
- [ ] 不点击按钮时，只是临时选中，可以批量移动
- [ ] 点击"创建资产"后，弹出对话框，可以命名和选择分类
- [ ] 资产保存到资产库，显示在侧边栏
- [ ] 资产可以拖拽到画布使用
- [ ] 资产缩略图正确显示（有图片 / 无图片 / 自定义）
- [ ] 点击"打组"后，创建组，显示组工具栏
- [ ] 组可以自定义颜色（7 种颜色）
- [ ] 组可以自动排列（水平 / 宫格）
- [ ] 组可以解组
- [ ] 工作流功能已删除

### UI 验收
- [ ] 临时工具栏样式符合设计
- [ ] 创建资产对话框样式符合设计
- [ ] 资产库面板样式符合设计
- [ ] 组颜色选择器样式符合设计
- [ ] 组工具栏样式符合设计
- [ ] 所有交互流畅，无卡顿

### 代码验收
- [ ] 没有编译错误
- [ ] 没有 TypeScript 类型错误
- [ ] 遵循架构规范（三层架构）
- [ ] 代码逻辑清晰，易于维护
- [ ] 有适当的注释

---

## 🚨 风险和依赖

### 风险
1. **数据迁移**：现有工作流数据如何处理？
   - 缓解方案：提供转换工具，或保留工作流数据但不显示

2. **性能问题**：资产库数据量大时，渲染性能
   - 缓解方案：虚拟化渲染、懒加载缩略图

3. **内存泄漏**：大量 Blob URL 未释放
   - 缓解方案：使用 `blobStorage` 服务管理 Blob URL

### 依赖
1. **现有架构**：依赖 `useSelection`、`useGroup` Hook
2. **存储服务**：依赖 `blobStorage`、`indexedDBStorage`
3. **UI 组件**：依赖 Lucide 图标库

---

## 🔮 未来扩展

1. **公共资产库**：官方提供的模板资产
2. **资产导入导出**：分享资产给其他用户
3. **资产搜索**：按名称、标签搜索
4. **资产排序**：按创建时间、使用频率排序
5. **资产标签**：支持多标签分类
6. **资产预览**：悬停显示详细信息
7. **资产版本管理**：保存资产的多个版本

---

## 📝 总结

这是一个**重大功能重构**，涉及：
- 删除工作流功能
- 新增资产库功能
- 重构组功能交互逻辑
- 增强组功能（颜色、排列、解组）

预计开发时间：**8-12 天**

核心价值：
- 提供更灵活的节点管理方式
- 提高用户的工作效率
- 增强资产复用能力
