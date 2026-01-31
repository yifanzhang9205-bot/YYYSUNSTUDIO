# App.tsx Hooks 集成计划

**日期**：2026-01-27  
**状态**：计划中

---

## 📋 集成步骤

### 第 1 步：引入 Hooks

在 App.tsx 顶部添加：

```typescript
// 引入 Hooks
import { useDrag } from './hooks/useDrag';
import { useSelection } from './hooks/useSelection';
import { useViewport } from './hooks/useViewport';
import { useConnection } from './hooks/useConnection';
import { useGroup } from './hooks/useGroup';
import { useHistory } from './hooks/useHistory';
```

---

### 第 2 步：替换 Viewport 逻辑

**旧代码（删除）**：
```typescript
// 第 185-189 行
const [scale, setScale] = useState<number>(1);
const [pan, setPan] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
```

**新代码（添加）**：
```typescript
// 使用 useViewport Hook
const {
  scale,
  pan,
  isDraggingCanvas,
  handleWheel,
  startCanvasDrag,
  updateCanvasDrag,
  endCanvasDrag,
  fitView,
  resetView,
  zoomIn,
  zoomOut,
} = useViewport({
  nodes,
  getNodeHeight: getApproxNodeHeight,
});
```

**需要删除的函数**：
- `handleFitView`（第 455 行）→ 替换为 `fitView`

---

### 第 3 步：替换 Selection 逻辑

**旧代码（删除）**：
```typescript
// 第 193 行
const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);
```

**新代码（添加）**：
```typescript
// 使用 useSelection Hook
const {
  selectedNodeIds,
  selectionRect,
  selectNode,
  selectNodes,
  clearSelection,
  selectAll,
  startBoxSelection,
  updateBoxSelection,
  endBoxSelection,
  deleteSelected,
} = useSelection({
  nodes,
  onDeleteNodes: deleteNodes,
});
```

**需要删除的状态**：
- `selectionRect`（如果有）

---

### 第 4 步：替换 Drag 逻辑

**旧代码（删除）**：
```typescript
// 第 194-195 行
const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
const [draggingNodeParentGroupId, setDraggingNodeParentGroupId] = useState<string | null>(null);
```

**新代码（添加）**：
```typescript
// 使用 useDrag Hook
const {
  handleMouseDown: handleNodeDragStart,
  handleMouseMove: handleNodeDragMove,
  handleMouseUp: handleNodeDragEnd,
  isDragging: isDraggingNode,
} = useDrag({
  scale,
  onUpdateNode: (id, updates) => {
    setNodes(prev => {
      const newMap = new Map(prev);
      const node = newMap.get(id);
      if (node) {
        newMap.set(id, { ...node, ...updates });
      }
      return newMap;
    });
  },
  onSaveHistory: saveHistory,
});
```

**需要删除的 ref**：
- `dragNodeRef`（第 237 行）

---

### 第 5 步：替换 Connection 逻辑

**旧代码（删除）**：
```typescript
// 第 199 行
const [connectionStart, setConnectionStart] = useState<...>(null);
```

**新代码（添加）**：
```typescript
// 使用 useConnection Hook
const {
  connectionStart,
  startConnection,
  endConnection,
  cancelConnection,
  deleteConnection,
  deleteNodeConnections,
  getOutputConnections,
  getInputConnections,
  isValidConnection,
  getCompatibleOutputNodes,
  getCompatibleInputNodes,
} = useConnection({
  nodes,
  connections,
  onAddConnection: (connection) => {
    setConnections(prev => [...prev, connection]);
  },
  onDeleteConnection: (from, to) => {
    setConnections(prev => prev.filter(c => !(c.from === from && c.to === to)));
  },
  onUpdateNodeInputs: (nodeId, inputs) => {
    setNodes(prev => {
      const newMap = new Map(prev);
      const node = newMap.get(nodeId);
      if (node) {
        newMap.set(nodeId, { ...node, inputs });
      }
      return newMap;
    });
  },
});
```

**需要删除的函数**：
- `getCompatibleOutputNodes`（如果有）
- `getCompatibleInputNodes`（如果有）

---

### 第 6 步：替换 Group 逻辑

**旧代码（删除）**：
```typescript
// 第 195-197 行
const [draggingGroup, setDraggingGroup] = useState<any>(null);
const [resizingGroupId, setResizingGroupId] = useState<string | null>(null);
const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
```

**新代码（添加）**：
```typescript
// 使用 useGroup Hook
const {
  selectedGroupId,
  resizingGroupId,
  setSelectedGroupId,
  createGroup,
  deleteGroup,
  updateGroupTitle,
  updateGroupPosition,
  updateGroupSize,
  addNodeToGroup,
  removeNodeFromGroup,
  startGroupDrag,
  updateGroupDrag,
  endGroupDrag,
  cancelGroupDrag,
  startGroupResize,
  endGroupResize,
  getNodeGroup,
  isDraggingGroup,
} = useGroup({
  groups,
  nodes,
  onAddGroup: (group) => {
    setGroups(prev => [...prev, group]);
  },
  onUpdateGroup: (id, updates) => {
    setGroups(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
  },
  onDeleteGroup: (id) => {
    setGroups(prev => prev.filter(g => g.id !== id));
  },
  onUpdateNode: (id, updates) => {
    setNodes(prev => {
      const newMap = new Map(prev);
      const node = newMap.get(id);
      if (node) {
        newMap.set(id, { ...node, ...updates });
      }
      return newMap;
    });
  },
  onSaveHistory: saveHistory,
});
```

**需要删除的 ref**：
- `dragGroupRef`（第 257 行）

---

### 第 7 步：替换 History 逻辑

**旧代码（删除）**：
```typescript
// 第 180-181 行
const [history, setHistory] = useState<any[]>([]);
const [historyIndex, setHistoryIndex] = useState(-1);
```

**新代码（添加）**：
```typescript
// 使用 useHistory Hook
const {
  history,
  historyIndex,
  saveHistory,
  undo,
  redo,
  clearHistory,
  canUndo,
  canRedo,
} = useHistory({ maxHistorySize: 50 });

// 监听 history 事件
useEffect(() => {
  const handleUndo = (e: CustomEvent) => {
    const previousState = e.detail;
    // 将数组转换为 Map
    const nodesMap = new Map(previousState.nodes.map((n: AppNode) => [n.id, n]));
    setNodes(nodesMap);
    setConnections(previousState.connections);
    setGroups(previousState.groups);
  };

  const handleRedo = (e: CustomEvent) => {
    const nextState = e.detail;
    // 将数组转换为 Map
    const nodesMap = new Map(nextState.nodes.map((n: AppNode) => [n.id, n]));
    setNodes(nodesMap);
    setConnections(nextState.connections);
    setGroups(nextState.groups);
  };

  window.addEventListener('history:undo', handleUndo as EventListener);
  window.addEventListener('history:redo', handleRedo as EventListener);

  return () => {
    window.removeEventListener('history:undo', handleUndo as EventListener);
    window.removeEventListener('history:redo', handleRedo as EventListener);
  };
}, []);
```

**需要删除的函数**：
- `saveHistory`（第 481 行）
- `undo`（第 493 行）

---

### 第 8 步：更新全局事件监听

**添加拖拽事件监听**：
```typescript
// 监听节点拖拽
useEffect(() => {
  if (isDraggingNode) {
    window.addEventListener('mousemove', handleNodeDragMove);
    window.addEventListener('mouseup', handleNodeDragEnd);
    return () => {
      window.removeEventListener('mousemove', handleNodeDragMove);
      window.removeEventListener('mouseup', handleNodeDragEnd);
    };
  }
}, [isDraggingNode, handleNodeDragMove, handleNodeDragEnd]);

// 监听分组拖拽
useEffect(() => {
  if (isDraggingGroup) {
    const handleMove = (e: MouseEvent) => updateGroupDrag(e, scale);
    const handleUp = (e: MouseEvent) => endGroupDrag(e, scale);
    
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }
}, [isDraggingGroup, updateGroupDrag, endGroupDrag, scale]);

// 监听画布拖拽
useEffect(() => {
  if (isDraggingCanvas) {
    window.addEventListener('mousemove', updateCanvasDrag);
    window.addEventListener('mouseup', endCanvasDrag);
    return () => {
      window.removeEventListener('mousemove', updateCanvasDrag);
      window.removeEventListener('mouseup', endCanvasDrag);
    };
  }
}, [isDraggingCanvas, updateCanvasDrag, endCanvasDrag]);

// 监听滚轮事件
useEffect(() => {
  window.addEventListener('wheel', handleWheel, { passive: false });
  return () => window.removeEventListener('wheel', handleWheel);
}, [handleWheel]);
```

---

### 第 9 步：更新 saveHistory 调用

**需要更新的地方**：
- `addNode` 函数中的 `saveHistory()` 调用
- `deleteNodes` 函数中的 `saveHistory()` 调用
- 其他需要保存历史记录的地方

**新的 saveHistory 调用**：
```typescript
// 在需要保存历史记录的地方调用
saveHistory(nodes, connections, groups);
```

---

## 📊 预计改动统计

| 类别 | 删除行数 | 添加行数 | 净变化 |
|------|---------|---------|--------|
| 状态定义 | ~30 行 | ~150 行 | +120 行 |
| 事件监听 | ~50 行 | ~80 行 | +30 行 |
| 函数定义 | ~200 行 | 0 行 | -200 行 |
| **总计** | **~280 行** | **~230 行** | **-50 行** |

**App.tsx 行数变化**：2617 行 → 约 2567 行

---

## ✅ 验收标准

### 功能验收
- [ ] 节点拖拽正常工作
- [ ] 节点选择正常工作（单选、多选、框选）
- [ ] 画布缩放/平移正常工作
- [ ] 连接线创建/删除正常工作
- [ ] 分组创建/拖拽/调整大小正常工作
- [ ] 撤销/重做正常工作
- [ ] 快捷键正常工作

### 性能验收
- [ ] 拖拽 FPS 达到 60
- [ ] 无卡顿、无闪烁
- [ ] 内存占用正常

### 代码质量验收
- [ ] 无编译错误
- [ ] 无控制台警告
- [ ] 代码清晰，职责分明

---

## 🚨 风险和注意事项

### 风险 1：事件监听冲突
- **问题**：新旧事件监听可能冲突
- **缓解**：先注释旧代码，测试新代码，确认无误后再删除

### 风险 2：状态同步问题
- **问题**：Hooks 和 App.tsx 的状态可能不同步
- **缓解**：使用回调函数更新状态，确保数据流正确

### 风险 3：边界情况遗漏
- **问题**：可能有遗漏的边界情况
- **缓解**：全面测试所有功能，包括边界情况

---

## 📝 实施建议

### 建议 1：分步实施
1. 先集成 useViewport（最简单）
2. 再集成 useSelection
3. 再集成 useDrag
4. 再集成 useConnection
5. 再集成 useGroup
6. 最后集成 useHistory

### 建议 2：保留旧代码
- 先注释旧代码，不要删除
- 测试新代码无误后再删除
- 如果出现问题，可以快速回滚

### 建议 3：全面测试
- 测试所有功能
- 测试所有快捷键
- 测试所有边界情况
- 测试性能

---

**文档版本**：v1.0  
**创建日期**：2026-01-27  
**作者**：Kiro AI  
**状态**：计划中
