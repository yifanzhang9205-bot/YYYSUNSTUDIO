# 资产库 + 组功能重构 - 任务分解

**日期**: 2026-02-08  
**版本**: 1.0  
**预计时间**: 8-12 天

---

## 📋 任务总览

| 阶段 | 任务数 | 预计时间 | 状态 |
|------|--------|---------|------|
| 阶段 1：重构选择逻辑 | 5 | 2-3 天 | ⏳ 待开始 |
| 阶段 2：资产库功能 | 8 | 3-4 天 | ⏳ 待开始 |
| 阶段 3：组功能增强 | 7 | 2-3 天 | ⏳ 待开始 |
| 阶段 4：数据迁移和优化 | 4 | 1-2 天 | ⏳ 待开始 |
| **总计** | **24** | **8-12 天** | **0%** |

---

## 🎯 阶段 1：重构选择逻辑（2-3 天）

### 任务 1.1：修改 useSelection Hook
**文件**: `hooks/useSelection.ts`  
**预计时间**: 4 小时

**修改内容**：
- [ ] 删除自动创建组的逻辑
- [ ] 框选后只设置选中状态，不创建组
- [ ] 添加 `showSelectionToolbar` 状态
- [ ] 添加 `getSelectionBounds()` 方法（计算选区边界）

**代码示例**：
```typescript
// ❌ 删除这段代码
if (selectedNodeIds.length >= 2) {
  expandOrCreateGroup(selectedNodeIds);
}

// ✅ 改为
if (selectedNodeIds.length >= 2) {
  setShowSelectionToolbar(true);
}
```

---

### 任务 1.2：创建 SelectionToolbar 组件
**文件**: `components/SelectionToolbar.tsx`  
**预计时间**: 3 小时

**功能**：
- [ ] 显示"创建资产"和"打组"两个按钮
- [ ] 计算工具栏位置（选区上方中心）
- [ ] 使用 fixed 定位，不受画布缩放影响
- [ ] 点击"创建资产"触发 `onCreateAsset`
- [ ] 点击"打组"触发 `onCreateGroup`

**Props**：
```typescript
interface SelectionToolbarProps {
  selectedNodeIds: string[];
  selectionBounds: { x: number; y: number; width: number; height: number };
  scale: number;
  pan: { x: number; y: number };
  onCreateAsset: () => void;
  onCreateGroup: () => void;
}
```

---

### 任务 1.3：集成 SelectionToolbar 到 App.tsx
**文件**: `App.tsx`  
**预计时间**: 2 小时

**修改内容**：
- [ ] 导入 `SelectionToolbar` 组件
- [ ] 添加 `showSelectionToolbar` 状态
- [ ] 添加 `handleCreateAsset` 回调
- [ ] 添加 `handleCreateGroup` 回调
- [ ] 渲染 `SelectionToolbar`（条件渲染）

**代码示例**：
```typescript
{showSelectionToolbar && selectedNodeIds.length >= 2 && (
  <SelectionToolbar
    selectedNodeIds={selectedNodeIds}
    selectionBounds={getSelectionBounds()}
    scale={scale}
    pan={pan}
    onCreateAsset={handleCreateAsset}
    onCreateGroup={handleCreateGroup}
  />
)}
```

---

### 任务 1.4：测试临时选中状态
**预计时间**: 2 小时

**测试用例**：
- [ ] 框选 2 个节点，显示临时工具栏
- [ ] 不点击按钮，可以批量移动节点
- [ ] 取消选择后，工具栏消失
- [ ] 临时选中状态的视觉样式正确（蓝色边框）
- [ ] 工具栏位置正确（选区上方中心）
- [ ] 缩放画布时，工具栏位置正确

---

### 任务 1.5：修复可能的 Bug
**预计时间**: 2 小时

**可能的问题**：
- [ ] 工具栏位置计算错误
- [ ] 选中状态不正确
- [ ] 批量移动节点时，工具栏不跟随
- [ ] 取消选择后，工具栏没有消失

---

## 🎯 阶段 2：资产库功能（3-4 天）

### 任务 2.1：创建 assetLibraryStore
**文件**: `core/stores/assetLibraryStore.ts`  
**预计时间**: 3 小时

**功能**：
- [ ] 定义 `Asset` 类型
- [ ] 定义 `AssetCategory` 类型
- [ ] 创建 Zustand Store
- [ ] 实现 `addAsset` 方法
- [ ] 实现 `updateAsset` 方法
- [ ] 实现 `deleteAsset` 方法
- [ ] 实现 `getAssetsByCategory` 方法
- [ ] 实现 `setSelectedCategory` 方法
- [ ] 持久化到 IndexedDB

**数据结构**：
```typescript
interface Asset {
  id: string;
  name: string;
  category: AssetCategory;
  thumbnail: string;
  thumbnailType: 'auto' | 'custom' | 'text';
  nodes: AppNode[];
  connections: Connection[];
  createdAt: number;
  updatedAt: number;
}

type AssetCategory = 'character' | 'scene' | 'object' | 'style' | 'other';
```

---

### 任务 2.2：创建 useAssetLibrary Hook
**文件**: `hooks/useAssetLibrary.ts`  
**预计时间**: 4 小时

**功能**：
- [ ] 实现 `createAsset` 方法（深拷贝节点数据）
- [ ] 实现 `useAsset` 方法（拖拽到画布）
- [ ] 实现 `generateThumbnail` 方法（3 种规则）
- [ ] 实现 `generateTextThumbnail` 方法（首字母占位符）
- [ ] 实现 `saveBlobUrl` 方法（持久化 Blob URL）
- [ ] 实现 `loadBlobUrl` 方法（恢复 Blob URL）

**关键方法**：
```typescript
const createAsset = async (
  name: string,
  category: AssetCategory,
  nodes: AppNode[],
  connections: Connection[],
  customThumbnail?: string
) => {
  // 1. 深拷贝节点数据
  const copiedNodes = deepCopyNodes(nodes);
  
  // 2. 生成缩略图
  const thumbnail = customThumbnail || await generateThumbnail(nodes);
  
  // 3. 保存到 Store
  addAsset({
    id: `asset-${Date.now()}`,
    name,
    category,
    thumbnail,
    thumbnailType: customThumbnail ? 'custom' : 'auto',
    nodes: copiedNodes,
    connections,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
};
```

---

### 任务 2.3：创建 CreateAssetDialog 组件
**文件**: `components/CreateAssetDialog.tsx`  
**预计时间**: 5 小时

**功能**：
- [ ] 资产名称输入框（必填，最大 50 字符）
- [ ] 分类选择（单选，5 个选项）
- [ ] 缩略图预览和上传
- [ ] 表单验证
- [ ] 确认和取消按钮
- [ ] 成功提示

**Props**：
```typescript
interface CreateAssetDialogProps {
  nodes: AppNode[];
  connections: Connection[];
  onConfirm: (asset: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}
```

---

### 任务 2.4：创建 AssetLibraryPanel 组件
**文件**: `components/AssetLibraryPanel.tsx`  
**预计时间**: 5 小时

**功能**：
- [ ] 分类标签（全部、人物、场景、物品、风格、其他）
- [ ] 资产网格（2 列）
- [ ] 资产卡片（缩略图 + 名称）
- [ ] 拖拽到画布
- [ ] 点击在画布中心创建
- [ ] 右键菜单（重命名、删除）
- [ ] 空状态

**Props**：
```typescript
interface AssetLibraryPanelProps {
  assets: Asset[];
  selectedCategory: AssetCategory | 'all';
  onSelectCategory: (category: AssetCategory | 'all') => void;
  onUseAsset: (assetId: string, position: { x: number; y: number }) => void;
  onDeleteAsset: (assetId: string) => void;
  onRenameAsset: (assetId: string, newName: string) => void;
}
```

---

### 任务 2.5：修改 SidebarDock 组件
**文件**: `components/SidebarDock.tsx`  
**预计时间**: 3 小时

**修改内容**：
- [ ] 删除工作流按钮和面板
- [ ] 添加资产库按钮（FolderHeart 图标）
- [ ] 添加资产库面板（渲染 AssetLibraryPanel）
- [ ] 更新按钮顺序

**代码示例**：
```typescript
// ❌ 删除
{ id: 'workflow', icon: FolderHeart, tooltip: '工作流', disabled: false },

// ✅ 改为
{ id: 'asset-library', icon: FolderHeart, tooltip: '资产库', disabled: false },
```

---

### 任务 2.6：实现资产拖拽到画布
**文件**: `App.tsx`, `hooks/useAssetLibrary.ts`  
**预计时间**: 4 小时

**功能**：
- [ ] 监听资产卡片的 `onDragStart` 事件
- [ ] 设置 `dataTransfer` 数据（资产 ID）
- [ ] 监听画布的 `onDrop` 事件
- [ ] 获取鼠标位置（世界坐标）
- [ ] 调用 `useAsset` 方法创建节点
- [ ] 调整节点位置（相对于鼠标位置）

**代码示例**：
```typescript
// AssetLibraryPanel.tsx
<div
  draggable={true}
  onDragStart={(e) => {
    e.dataTransfer.setData('application/asset-id', asset.id);
    e.dataTransfer.effectAllowed = 'copy';
  }}
>
  {/* 资产卡片 */}
</div>

// App.tsx
const handleCanvasDrop = (e: React.DragEvent) => {
  const assetId = e.dataTransfer.getData('application/asset-id');
  if (assetId) {
    const worldX = (e.clientX - pan.x) / scale;
    const worldY = (e.clientY - pan.y) / scale;
    useAsset(assetId, { x: worldX, y: worldY });
  }
};
```

---

### 任务 2.7：实现资产右键菜单
**文件**: `components/AssetLibraryPanel.tsx`  
**预计时间**: 2 小时

**功能**：
- [ ] 右键点击资产卡片，显示菜单
- [ ] 重命名：弹出输入框
- [ ] 删除：确认对话框

---

### 任务 2.8：测试资产库功能
**预计时间**: 3 小时

**测试用例**：
- [ ] 创建资产（有图片节点）
- [ ] 创建资产（无图片节点 + 自定义缩略图）
- [ ] 创建资产（无图片节点 + 无自定义）→ 显示首字母
- [ ] 资产保存到 Store
- [ ] 资产显示在侧边栏
- [ ] 分类筛选正确
- [ ] 拖拽资产到画布
- [ ] 点击资产在画布中心创建
- [ ] 重命名资产
- [ ] 删除资产
- [ ] 刷新页面后，资产仍然存在

---

## 🎯 阶段 3：组功能增强（2-3 天）

### 任务 3.1：修改 Group 类型
**文件**: `types.ts`  
**预计时间**: 0.5 小时

**修改内容**：
- [ ] 添加 `color?: GroupColor` 字段

**代码示例**：
```typescript
interface Group {
  id: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  nodeIds: string[];
  color?: GroupColor;  // 🔥 新增
}

type GroupColor = 'default' | 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'orange';
```

---

### 任务 3.2：创建 GroupColorPicker 组件
**文件**: `components/GroupColorPicker.tsx`  
**预计时间**: 2 小时

**功能**：
- [ ] 显示 7 种颜色的色卡
- [ ] 点击色卡选择颜色
- [ ] 选中状态（边框 + ring）
- [ ] 悬停效果（放大）

**Props**：
```typescript
interface GroupColorPickerProps {
  currentColor: GroupColor;
  onSelectColor: (color: GroupColor) => void;
}
```

---

### 任务 3.3：修改 GroupToolbar 组件
**文件**: `components/GroupToolbar.tsx`  
**预计时间**: 4 小时

**修改内容**：
- [ ] 删除对齐和分布按钮
- [ ] 添加"颜色"按钮（点击显示 GroupColorPicker）
- [ ] 修改"自动排列"为下拉菜单（水平 / 宫格）
- [ ] 添加"解组"按钮

**Props**：
```typescript
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

---

### 任务 3.4：修改 useGroup Hook
**文件**: `hooks/useGroup.ts`  
**预计时间**: 5 小时

**新增功能**：
- [ ] `setGroupColor(groupId, color)` - 设置组颜色
- [ ] `arrangeHorizontal(groupId)` - 水平布局
- [ ] `arrangeGrid(groupId)` - 宫格布局（复用 arrangeTopology）
- [ ] `ungroup(groupId)` - 解组

**代码示例**：
```typescript
const setGroupColor = useCallback((groupId: string, color: GroupColor) => {
  onSaveHistory();
  onUpdateGroup(groupId, { color });
}, [onSaveHistory, onUpdateGroup]);

const ungroup = useCallback((groupId: string) => {
  const confirmed = window.confirm('确认解组？\n\n解组后，节点将保留，但组将被删除');
  if (confirmed) {
    onSaveHistory();
    onDeleteGroup(groupId);
  }
}, [onSaveHistory, onDeleteGroup]);
```

---

### 任务 3.5：修改 App.tsx 中的组渲染
**文件**: `App.tsx`  
**预计时间**: 2 小时

**修改内容**：
- [ ] 根据 `group.color` 动态设置组的背景和边框颜色
- [ ] 更新 GroupToolbar 的 props

**代码示例**：
```typescript
const getGroupStyle = (color: GroupColor = 'default') => {
  const styles = {
    default: 'bg-gray-100/50 border-gray-400',
    blue: 'bg-blue-100/30 border-blue-500',
    green: 'bg-green-100/30 border-green-500',
    yellow: 'bg-yellow-100/30 border-yellow-500',
    red: 'bg-red-100/30 border-red-500',
    purple: 'bg-purple-100/30 border-purple-500',
    orange: 'bg-orange-100/30 border-orange-500',
  };
  return styles[color];
};

<div className={`... ${getGroupStyle(group.color)}`}>
  {/* 组内容 */}
</div>
```

---

### 任务 3.6：实现水平布局算法
**文件**: `hooks/useGroup.ts`  
**预计时间**: 3 小时

**算法**：
- [ ] 获取组内所有节点
- [ ] 计算总宽度
- [ ] 计算起始 X 位置（居中）
- [ ] 计算平均 Y 位置（垂直居中）
- [ ] 从左到右排列节点
- [ ] 更新组边界

---

### 任务 3.7：测试组功能增强
**预计时间**: 2 小时

**测试用例**：
- [ ] 打组后，显示组工具栏
- [ ] 点击"颜色"按钮，显示色卡选择器
- [ ] 选择颜色后，组的背景和边框变色
- [ ] 点击"自动排列"，显示下拉菜单
- [ ] 选择"水平布局"，节点排成一行
- [ ] 选择"宫格布局"，节点按层级排列
- [ ] 点击"解组"，组被删除，节点保留
- [ ] 刷新页面后，组的颜色仍然保留

---

## 🎯 阶段 4：数据迁移和优化（1-2 天）

### 任务 4.1：工作流数据迁移
**文件**: `App.tsx`, `core/stores/workflowStore.ts`  
**预计时间**: 2 小时

**方案**：
- [ ] 检测是否有现有工作流数据
- [ ] 提示用户：工作流功能已替换为资产库
- [ ] 提供转换选项：将工作流转换为资产（可选）
- [ ] 删除 `workflowStore`（或保留但不使用）

---

### 任务 4.2：性能优化
**文件**: `components/AssetLibraryPanel.tsx`, `hooks/useAssetLibrary.ts`  
**预计时间**: 3 小时

**优化内容**：
- [ ] 资产库大量数据时，使用虚拟化渲染
- [ ] 缩略图懒加载（IntersectionObserver）
- [ ] 资产数据分页加载
- [ ] 缩略图压缩（降低质量）

---

### 任务 4.3：内存优化
**文件**: `hooks/useAssetLibrary.ts`, `services/blobStorage.ts`  
**预计时间**: 2 小时

**优化内容**：
- [ ] Blob URL 统一管理（避免泄漏）
- [ ] 删除资产时，清理 Blob URL
- [ ] 删除资产时，清理 IndexedDB 数据
- [ ] 监控内存占用

---

### 任务 4.4：完整测试
**预计时间**: 3 小时

**测试用例**：
- [ ] 创建 100 个资产，性能正常
- [ ] 拖拽资产到画布，性能正常
- [ ] 删除资产，内存释放
- [ ] 刷新页面，数据恢复正常
- [ ] 所有功能正常工作
- [ ] 没有控制台错误
- [ ] 没有内存泄漏

---

## 📊 进度跟踪

### 阶段 1：重构选择逻辑
- [ ] 任务 1.1：修改 useSelection Hook
- [ ] 任务 1.2：创建 SelectionToolbar 组件
- [ ] 任务 1.3：集成 SelectionToolbar 到 App.tsx
- [ ] 任务 1.4：测试临时选中状态
- [ ] 任务 1.5：修复可能的 Bug

### 阶段 2：资产库功能
- [ ] 任务 2.1：创建 assetLibraryStore
- [ ] 任务 2.2：创建 useAssetLibrary Hook
- [ ] 任务 2.3：创建 CreateAssetDialog 组件
- [ ] 任务 2.4：创建 AssetLibraryPanel 组件
- [ ] 任务 2.5：修改 SidebarDock 组件
- [ ] 任务 2.6：实现资产拖拽到画布
- [ ] 任务 2.7：实现资产右键菜单
- [ ] 任务 2.8：测试资产库功能

### 阶段 3：组功能增强
- [ ] 任务 3.1：修改 Group 类型
- [ ] 任务 3.2：创建 GroupColorPicker 组件
- [ ] 任务 3.3：修改 GroupToolbar 组件
- [ ] 任务 3.4：修改 useGroup Hook
- [ ] 任务 3.5：修改 App.tsx 中的组渲染
- [ ] 任务 3.6：实现水平布局算法
- [ ] 任务 3.7：测试组功能增强

### 阶段 4：数据迁移和优化
- [ ] 任务 4.1：工作流数据迁移
- [ ] 任务 4.2：性能优化
- [ ] 任务 4.3：内存优化
- [ ] 任务 4.4：完整测试

---

## 🎯 下一步

请确认是否开始实施，我将按照以下顺序进行：

1. **阶段 1**：重构选择逻辑（最基础，必须先完成）
2. **阶段 2**：资产库功能（核心功能）
3. **阶段 3**：组功能增强（依赖阶段 1）
4. **阶段 4**：数据迁移和优化（收尾工作）

准备好了吗？🚀
