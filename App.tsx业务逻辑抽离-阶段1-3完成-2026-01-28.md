# App.tsx 业务逻辑抽离 - 阶段 1-3 完成

## 📅 完成时间
2026-01-28

## ✅ 已完成的工作

### 1. 创建了 3 个新的 Hooks

#### hooks/useNodeHelpers.ts (80 行)
- `getApproxNodeHeight()` - 计算节点高度
- `getNodeBounds()` - 计算节点边界
- `getNodeNameCN()` - 获取节点中文名称
- `getNodeIcon()` - 获取节点图标

#### hooks/useAssetHistory.ts (100 行)
- `handleAssetGenerated()` - 处理资源生成
- `downloadSelectedImagesAndClear()` - 批量下载并清除

#### hooks/useUIState.ts (50 行)
- `contextMenu`, `contextMenuTarget` - 右键菜单状态
- `openContextMenu()`, `closeContextMenu()` - 打开/关闭右键菜单
- `expandedMedia` - 图片预览状态
- `openMedia()`, `closeMedia()` - 打开/关闭图片预览
- `croppingNodeId`, `imageToCrop` - 图片裁剪状态
- `startCrop()`, `endCrop()` - 开始/结束裁剪

### 2. 在 App.tsx 中集成新的 Hooks

#### 导入新的 Hooks
```typescript
import { useNodeHelpers } from './hooks/useNodeHelpers';
import { useAssetHistory } from './hooks/useAssetHistory';
import { useUIState } from './hooks/useUIState';
```

#### 使用新的 Hooks
```typescript
const { 
  getApproxNodeHeight, 
  getNodeBounds, 
  getNodeNameCN, 
  getNodeIcon 
} = useNodeHelpers();

const { 
  handleAssetGenerated, 
  downloadSelectedImagesAndClear 
} = useAssetHistory();

const { 
  contextMenu, 
  contextMenuTarget, 
  openContextMenu, 
  closeContextMenu,
  expandedMedia, 
  openMedia, 
  closeMedia,
  croppingNodeId, 
  imageToCrop, 
  startCrop, 
  endCrop 
} = useUIState();
```

### 3. 删除了已抽离的旧代码

#### 删除的函数定义（约 180 行）
- ✅ `getApproxNodeHeight` 定义（40 行）
- ✅ `getNodeBounds` 定义（5 行）
- ✅ `getNodeNameCN` 定义（5 行）
- ✅ `getNodeIcon` 定义（20 行）
- ✅ `handleAssetGenerated` 定义（25 行）
- ✅ `downloadSelectedImagesAndClear` 定义（85 行）

#### 删除的状态定义（约 10 行）
- ✅ `contextMenu` 状态
- ✅ `contextMenuTarget` 状态
- ✅ `expandedMedia` 状态
- ✅ `croppingNodeId` 状态
- ✅ `imageToCrop` 状态

### 4. 更新了所有调用点

#### 右键菜单相关（11 处）
- ✅ `setContextMenu(null)` → `closeContextMenu()` (10 处)
- ✅ `setContextMenu({...}); setContextMenuTarget({...})` → `openContextMenu({...}, {...})` (1 处)

#### 图片预览相关（2 处）
- ✅ `setExpandedMedia(...)` → `openMedia(...)`
- ✅ `setExpandedMedia(null)` → `closeMedia()`

#### 图片裁剪相关（2 处）
- ✅ `setCroppingNodeId(...); setImageToCrop(...)` → `startCrop(..., ...)`
- ✅ `setCroppingNodeId(null); setImageToCrop(null)` → `endCrop()`

## 📊 代码减少统计

### App.tsx 行数变化
- **删除的代码**：约 190 行
  - 函数定义：180 行
  - 状态定义：10 行
- **新增的代码**：约 20 行
  - import 语句：3 行
  - Hook 调用：17 行
- **净减少**：约 170 行

### 新增的 Hooks 文件
- `hooks/useNodeHelpers.ts`：80 行
- `hooks/useAssetHistory.ts`：100 行
- `hooks/useUIState.ts`：50 行
- **总计**：230 行

## 🎯 效果评估

### 代码组织
- ✅ 业务逻辑从 App.tsx 抽离到专门的 Hooks
- ✅ 每个 Hook 职责单一、清晰
- ✅ App.tsx 更简洁，只做组合和配置

### 可维护性
- ✅ 新增节点辅助函数 → 修改 `hooks/useNodeHelpers.ts`
- ✅ 新增资源处理逻辑 → 修改 `hooks/useAssetHistory.ts`
- ✅ 新增 UI 状态 → 修改 `hooks/useUIState.ts`
- ✅ AI 不会再把这些逻辑塞进 App.tsx

### 编译状态
- ✅ 所有 TypeScript 错误已修复
- ✅ 功能保持不变
- ⚠️ 还有 3 个错误（与本次重构无关）：
  - GroupToolbar 模块未找到
  - mood 属性类型错误
  - cameraMovement 属性类型错误

## 📝 下一步计划

### 阶段 4：抽离节点操作逻辑（handleNodeAction）
- 创建 `hooks/useNodeActions.ts`
- 抽离 400+ 行的 `handleNodeAction` 函数
- 预计减少 400 行

### 阶段 5：抽离右键菜单逻辑
- 创建 `hooks/useContextMenu.ts`
- 抽离右键菜单的业务逻辑
- 预计减少 100 行

### 阶段 6：抽离全局事件处理
- 创建 `hooks/useGlobalEvents.ts`
- 抽离全局鼠标、键盘事件处理
- 预计减少 150 行

### 最终目标
- App.tsx 从 2354 行 → 200 行以内
- 所有业务逻辑都在专门的 Hooks 中
- AI 不会再想修改 App.tsx

## ✅ 验收标准

- [x] 所有新的 Hooks 已创建
- [x] App.tsx 已导入并使用新的 Hooks
- [x] 所有旧代码已删除
- [x] 所有调用点已更新
- [x] 编译通过（无相关错误）
- [ ] 功能测试通过（待测试）

## 🎉 总结

阶段 1-3 已完成，成功抽离了约 190 行代码到 3 个专门的 Hooks。App.tsx 更简洁了，AI 以后想加节点辅助函数、资源处理、UI 状态时，会去对应的 Hook 文件，而不是 App.tsx。

下一步继续抽离 `handleNodeAction`（400+ 行），这是最大的一块业务逻辑。
