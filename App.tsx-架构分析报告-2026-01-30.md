# App.tsx 架构分析报告

**日期**: 2026-01-30  
**文件**: App.tsx  
**总行数**: 2700+ 行  
**目标**: 找出所有不符合三层架构的内容

---

## 📊 当前状态总览

| 指标 | 当前值 | 目标值 | 完成度 |
|------|--------|--------|--------|
| 文件行数 | 2700+ 行 | < 500 行 | 18% |
| 业务逻辑 | 在 App.tsx | 在 Hooks | 30% |
| UI 状态 | 部分在 Store | 全部在 Store | 80% |
| 节点操作 | 在 App.tsx | 在 Hooks | 0% |

---

## 🚫 不符合三层架构的内容（按优先级排序）

### 🔴 优先级 1：业务逻辑（必须迁移）

#### 1. `handleNodeAction` 函数（第 880-1450 行，约 570 行）

**问题**: 包含所有节点类型的业务逻辑，严重违反三层架构

**包含的节点类型**:
- IMAGE_GENERATOR（图片生成）- 约 120 行
- VIDEO_GENERATOR（视频生成）- 约 80 行
- AUDIO_GENERATOR（音频生成）- 约 10 行
- VIDEO_ANALYZER（视频分析）- 约 20 行
- IMAGE_EDITOR（图片编辑）- 约 20 行
- SCRIPT_NODE（剧本节点）- 约 30 行
- **MULTI_ANGLE_CAMERA（3D 相机）** - 约 290 行 ← 最大的一块

**迁移目标**: `hooks/useNodeActions.ts`

**迁移方案**:
```typescript
// hooks/useNodeActions.ts
export function useNodeActions() {
  const { updateNode, addNode } = useNodeStore();
  const { addConnection } = useConnectionStore();
  
  // 每个节点类型一个函数
  const handleImageGenerator = useCallback(async (nodeId, prompt, inputs) => {
    // 图片生成逻辑
  }, []);
  
  const handleVideoGenerator = useCallback(async (nodeId, prompt, inputs) => {
    // 视频生成逻辑
  }, []);
  
  const handleMultiAngleCameraGenerate = useCallback(async (nodeId, prompt, inputs) => {
    // 3D 相机生成逻辑
    // + 自动创建九宫格节点
  }, []);
  
  // ... 其他节点类型
  
  // 统一的入口函数
  const handleNodeAction = useCallback(async (nodeId, promptOverride) => {
    const node = useNodeStore.getState().getNode(nodeId);
    if (!node) return;
    
    // 路由到对应的处理函数
    switch (node.type) {
      case NodeType.IMAGE_GENERATOR:
        return handleImageGenerator(nodeId, promptOverride, node.inputs);
      case NodeType.VIDEO_GENERATOR:
        return handleVideoGenerator(nodeId, promptOverride, node.inputs);
      case NodeType.MULTI_ANGLE_CAMERA:
        return handleMultiAngleCameraGenerate(nodeId, promptOverride, node.inputs);
      // ... 其他节点类型
    }
  }, []);
  
  return {
    handleNodeAction,
    handleImageGenerator,
    handleVideoGenerator,
    handleMultiAngleCameraGenerate,
    // ... 导出所有处理函数
  };
}
```

**影响范围**:
- App.tsx: 删除 570 行，添加 10 行（调用 Hook）
- hooks/useNodeActions.ts: 新增 600 行（包含改进）

---

#### 2. 右键菜单逻辑（分散在多处，约 200 行）

**问题**: 右键菜单的处理逻辑分散在 App.tsx 中

**涉及的函数**:
- `openContextMenu` - 已在 useUIState
- `closeContextMenu` - 已在 useUIState
- 右键菜单的渲染逻辑 - 在 JSX 中（第 2000+ 行）
- 右键菜单的操作逻辑 - 分散在各处

**迁移目标**: `hooks/useContextMenu.ts`

**迁移方案**:
```typescript
// hooks/useContextMenu.ts
export function useContextMenu() {
  const { openContextMenu, closeContextMenu, contextMenu, contextMenuTarget } = useUIState();
  const { deleteNode } = useNodeStore();
  const { duplicateNode } = useNodeStore();
  
  const handleDuplicate = useCallback((nodeId: string) => {
    duplicateNode(nodeId, 50, 50);
    closeContextMenu();
  }, []);
  
  const handleDelete = useCallback((nodeId: string) => {
    deleteNode(nodeId);
    closeContextMenu();
  }, []);
  
  const handleReplaceImage = useCallback((nodeId: string) => {
    // 替换图片逻辑
  }, []);
  
  const handleReplaceVideo = useCallback((nodeId: string) => {
    // 替换视频逻辑
  }, []);
  
  return {
    contextMenu,
    contextMenuTarget,
    openContextMenu,
    closeContextMenu,
    handleDuplicate,
    handleDelete,
    handleReplaceImage,
    handleReplaceVideo,
  };
}
```

**影响范围**:
- App.tsx: 删除 200 行，添加 5 行
- hooks/useContextMenu.ts: 新增 150 行

---

#### 3. 图片预览/裁剪逻辑（约 100 行）

**问题**: 图片预览和裁剪的逻辑在 App.tsx 中

**涉及的组件**:
- `ExpandedView` 组件（第 200-350 行）
- `ImageCropper` 组件（已独立）

**迁移目标**: `hooks/useMediaOverlay.ts`

**迁移方案**:
```typescript
// hooks/useMediaOverlay.ts
export function useMediaOverlay() {
  const { expandedMedia, openMedia, closeMedia } = useUIState();
  const { croppingNodeId, imageToCrop, startCrop, endCrop } = useUIState();
  
  const handleOpenImage = useCallback((src: string, images?: string[], initialIndex?: number) => {
    openMedia({ type: 'image', src, images, initialIndex });
  }, []);
  
  const handleOpenVideo = useCallback((src: string) => {
    openMedia({ type: 'video', src });
  }, []);
  
  const handleStartCrop = useCallback((nodeId: string, imageSrc: string) => {
    startCrop(nodeId, imageSrc);
  }, []);
  
  const handleEndCrop = useCallback((croppedImage: string) => {
    // 更新节点数据
    endCrop();
  }, []);
  
  return {
    expandedMedia,
    croppingNodeId,
    imageToCrop,
    handleOpenImage,
    handleOpenVideo,
    handleStartCrop,
    handleEndCrop,
    closeMedia,
  };
}
```

**影响范围**:
- App.tsx: 删除 100 行，添加 5 行
- hooks/useMediaOverlay.ts: 新增 80 行

---

### 🟡 优先级 2：UI 状态（部分已迁移，需完善）

#### 4. 节点调整大小逻辑（约 150 行）

**问题**: 节点调整大小的逻辑在 App.tsx 中

**涉及的变量**:
- `resizingNodeId`
- `initialSize`
- `resizeStartPos`
- `resizeContextRef`

**迁移目标**: `hooks/useNodeResize.ts`（新建）

**迁移方案**:
```typescript
// hooks/useNodeResize.ts
export function useNodeResize() {
  const [resizingNodeId, setResizingNodeId] = useState<string | null>(null);
  const { updateNodeSize } = useNodeStore();
  
  const startResize = useCallback((nodeId: string, initialWidth: number, initialHeight: number, startX: number, startY: number) => {
    setResizingNodeId(nodeId);
    // ... 调整大小逻辑
  }, []);
  
  const updateResize = useCallback((clientX: number, clientY: number) => {
    // ... 更新大小逻辑
  }, []);
  
  const endResize = useCallback(() => {
    setResizingNodeId(null);
    // ... 结束调整大小逻辑
  }, []);
  
  return {
    resizingNodeId,
    startResize,
    updateResize,
    endResize,
  };
}
```

**影响范围**:
- App.tsx: 删除 150 行，添加 5 行
- hooks/useNodeResize.ts: 新增 120 行

---

#### 5. 全局事件处理（约 100 行）

**问题**: 全局键盘事件、鼠标事件的处理逻辑在 App.tsx 中

**涉及的事件**:
- 键盘事件（Ctrl+Z, Ctrl+A, Delete, Escape）
- 鼠标移动事件（用于绘制连接线）
- 鼠标抬起事件（结束拖拽）

**迁移目标**: `hooks/useGlobalEvents.ts`（新建）

**迁移方案**:
```typescript
// hooks/useGlobalEvents.ts
export function useGlobalEvents() {
  const { undo, redo } = useHistory();
  const { selectAll, deleteSelected, clearSelection } = useSelection();
  const { endDrag } = useDrag();
  const { endCanvasDrag } = useViewport();
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
      if (e.key === 'a' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        selectAll();
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        deleteSelected();
      }
      if (e.key === 'Escape') {
        clearSelection();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  useEffect(() => {
    const handleMouseUp = () => {
      endDrag();
      endCanvasDrag();
    };
    
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);
}
```

**影响范围**:
- App.tsx: 删除 100 行，添加 2 行
- hooks/useGlobalEvents.ts: 新增 80 行

---

### 🟢 优先级 3：辅助函数（可选迁移）

#### 6. 工具函数（约 50 行）

**问题**: 一些工具函数在 App.tsx 中

**涉及的函数**:
- `getImageDimensions` - 已在 useNodeHelpers
- 其他辅助函数

**迁移目标**: `core/utils/` 或保留在 Hook 中

---

## 📋 迁移计划（按顺序执行）

### 阶段 1：创建 `hooks/useNodeActions.ts`（最重要）

**时间**: 2-3 小时

**步骤**:
1. 创建 `hooks/useNodeActions.ts`
2. 复制 `handleNodeAction` 函数到新文件
3. 拆分成独立的处理函数（每个节点类型一个）
4. 添加类型定义
5. 导出所有函数
6. 在 App.tsx 中调用新 Hook
7. 测试所有节点类型

**验收标准**:
- [ ] 所有节点类型正常工作
- [ ] App.tsx 减少 570 行
- [ ] 编译无错误
- [ ] 功能无变化

---

### 阶段 2：创建 `hooks/useContextMenu.ts`

**时间**: 1 小时

**步骤**:
1. 创建 `hooks/useContextMenu.ts`
2. 移动右键菜单逻辑
3. 在 App.tsx 中调用新 Hook
4. 测试右键菜单功能

**验收标准**:
- [ ] 右键菜单正常工作
- [ ] App.tsx 减少 200 行

---

### 阶段 3：创建 `hooks/useMediaOverlay.ts`

**时间**: 1 小时

**步骤**:
1. 创建 `hooks/useMediaOverlay.ts`
2. 移动图片预览/裁剪逻辑
3. 在 App.tsx 中调用新 Hook
4. 测试图片预览和裁剪功能

**验收标准**:
- [ ] 图片预览正常
- [ ] 图片裁剪正常
- [ ] App.tsx 减少 100 行

---

### 阶段 4：创建 `hooks/useNodeResize.ts`

**时间**: 1 小时

**步骤**:
1. 创建 `hooks/useNodeResize.ts`
2. 移动节点调整大小逻辑
3. 在 App.tsx 中调用新 Hook
4. 测试节点调整大小功能

**验收标准**:
- [ ] 节点调整大小正常
- [ ] App.tsx 减少 150 行

---

### 阶段 5：创建 `hooks/useGlobalEvents.ts`

**时间**: 30 分钟

**步骤**:
1. 创建 `hooks/useGlobalEvents.ts`
2. 移动全局事件处理逻辑
3. 在 App.tsx 中调用新 Hook
4. 测试全局快捷键

**验收标准**:
- [ ] 快捷键正常工作
- [ ] App.tsx 减少 100 行

---

## 📊 迁移后的效果预测

| 指标 | 迁移前 | 迁移后 | 改善 |
|------|--------|--------|------|
| App.tsx 行数 | 2700 行 | 1580 行 | -41% |
| 业务逻辑在 App.tsx | 1120 行 | 0 行 | -100% |
| Hooks 文件数量 | 8 个 | 13 个 | +5 个 |
| 代码可维护性 | 低 | 高 | ✅ |
| 符合三层架构 | 30% | 95% | +65% |

---

## ✅ 最终目标

### App.tsx 的理想状态（约 500 行）

```typescript
export const App = () => {
  // === 初始化 ===
  useEffect(() => {
    initializeNodeRegistry();
  }, []);
  
  // === 获取数据（从 Stores）===
  const nodes = useNodeStore(state => state.nodes);
  const connections = useConnectionStore(state => state.connections);
  const groups = useGroupStore(state => state.groups);
  
  // === 使用 Hooks（调用 hooks/）===
  const { handleNodeAction } = useNodeActions();
  const { contextMenu, handleDuplicate, handleDelete } = useContextMenu();
  const { expandedMedia, handleOpenImage } = useMediaOverlay();
  const { resizingNodeId, startResize } = useNodeResize();
  const { /* ... */ } = useDrag();
  const { /* ... */ } = useSelection();
  const { /* ... */ } = useViewport();
  const { /* ... */ } = useConnection();
  const { /* ... */ } = useGroup();
  const { /* ... */ } = useHistory();
  useGlobalEvents(); // 全局事件处理
  
  // === 渲染组件（组合 components/）===
  return (
    <div>
      {/* 画布 */}
      {/* 节点 */}
      {/* 连接线 */}
      {/* 侧边栏 */}
      {/* 右键菜单 */}
      {/* 图片预览 */}
    </div>
  );
};
```

---

## 🚀 下一步行动

1. **立即备份** ✅ 已完成
2. **整理 3D 相机改动内容** ✅ 已完成
3. **完整阅读 App.tsx** ✅ 已完成
4. **开始迁移**：
   - 阶段 1：创建 `hooks/useNodeActions.ts`（最重要）
   - 阶段 2-5：逐步迁移其他逻辑

---

**状态**: ✅ 分析完成，等待用户批准开始迁移
