# 架构重构 - 第 4 步 - useSelection 完全集成完成

**日期**: 2026-01-27  
**状态**: ✅ 完成  
**耗时**: 约 10 分钟

---

## 📋 任务概述

将 `useSelection` Hook 完全集成到 App.tsx，替换所有选择相关的逻辑。

---

## ✅ 已完成的工作

### 1. 在 App.tsx 中调用 useSelection Hook

```typescript
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
  cancelBoxSelection,
  deleteSelected,
} = useSelection({
  nodes,
  onDeleteNodes: deleteNodes,
});
```

### 2. 注释旧的状态声明

```typescript
// === 旧代码（已被 useSelection 替换，保留以便回滚）===
// const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);
// const [selectionRect, setSelectionRect] = useState<any>(null);
```

### 3. 更新画布交互逻辑

#### 3.1 画布点击清空选择
```typescript
const handleCanvasMouseDown = (e: React.MouseEvent) => {
  if (e.button === 1 || e.button === 2) return;
  
  if (e.button === 0) {
    clearSelection(); // 使用 useSelection 的 clearSelection
    startBoxSelection(e.clientX, e.clientY); // 使用 useSelection 的 startBoxSelection
  }
};
```

#### 3.2 框选更新
```typescript
const handleGlobalMouseMove = (e: MouseEvent) => {
  // ...
  if (selectionRect) {
    updateBoxSelection(e.clientX, e.clientY); // 使用 useSelection 的 updateBoxSelection
  }
};
```

#### 3.3 框选结束
```typescript
const handleGlobalMouseUp = (e: MouseEvent) => {
  // ...
  if (selectionRect) {
    endBoxSelection(scale, pan); // 使用 useSelection 的 endBoxSelection
    
    // 保留自动创建分组的逻辑
    if (selectedNodeIds.length > 1) {
      // ...自动创建分组...
    }
  }
};
```

### 4. 更新节点选择逻辑

```typescript
const onNodeMouseDown = (e: React.MouseEvent) => {
  e.stopPropagation();
  
  if (e.button === 0) {
    selectNode(node.id, e.ctrlKey || e.metaKey); // 使用 useSelection 的 selectNode
  }
};
```

### 5. 更新快捷键处理

#### 5.1 全选（Ctrl+A）
```typescript
if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'a') {
  e.preventDefault();
  selectAll(); // 使用 useSelection 的 selectAll
  return;
}
```

#### 5.2 粘贴（Ctrl+V）
```typescript
if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'v') {
  if (clipboard) {
    e.preventDefault();
    saveHistory();
    const newNode: AppNode = { ...clipboard, id: `n-${Date.now()}-${Math.floor(Math.random()*1000)}`, x: clipboard.x + 50, y: clipboard.y + 50, status: NodeStatus.IDLE, inputs: [] };
    setNodes(prev => new Map(prev).set(newNode.id, newNode));
    selectNode(newNode.id, false); // 使用 useSelection 的 selectNode
  }
  return;
}
```

#### 5.3 删除（Delete/Backspace）
```typescript
if (e.key === 'Delete' || e.key === 'Backspace') {
  if (selectedGroupId) {
    // ...删除分组逻辑...
    if (nodeIdsToDelete.length > 0) {
      deleteNodes(nodeIdsToDelete);
      clearSelection(); // 清空选择
    }
    return;
  }
  
  // 使用 useSelection 的 deleteSelected（内部会调用 deleteNodes 并清空选择）
  if (selectedNodeIds.length > 0) {
    e.preventDefault();
    deleteSelected();
  }
}
```

### 6. 清理 deleteNodes 函数

```typescript
const deleteNodes = useCallback((ids: string[]) => {
  // ...删除逻辑...
  
  // === 选择状态由 useSelection Hook 管理，不再手动清空 ===
  // setSelectedNodeIds([]);
}, [saveHistory, nodes]);
```

### 7. 更新依赖数组

#### 7.1 快捷键处理的依赖
```typescript
}, [selectedWorkflowId, selectedNodeIds, selectedGroupId, deleteNodes, deleteSelected, clearSelection, undo, saveHistory, clipboard, selectNode, selectAll]);
```

#### 7.2 useMemo 的依赖（移除 setSelectedNodeIds）
```typescript
}, [nodes, selectedNodeIds, draggingNodeId, resizingNodeId, connectionStart, activeGroupNodeIds, handleNodeUpdate, handleNodeAction, createWorkflowFromScript, deleteNodes, setExpandedMedia, setCroppingNodeId, setImageToCrop, setConnectionStart, setConnections, setNodes, setContextMenu, setContextMenuTarget, setDraggingNodeParentGroupId, setDraggingNodeId, setResizingNodeId, setInitialSize, setResizeStartPos, groups])
```

---

## 🎯 功能完整性检查

### ✅ 已实现的功能

- [x] 单选节点（点击节点）
- [x] 多选节点（Ctrl/Cmd + 点击）
- [x] 框选节点（拖拽画布）
- [x] 全选节点（Ctrl/Cmd + A）
- [x] 清空选择（点击画布空白处）
- [x] 删除选中节点（Delete/Backspace）
- [x] 复制粘贴后选中新节点（Ctrl/Cmd + V）
- [x] 删除分组时清空选择
- [x] 框选后自动创建分组

### ✅ 状态管理

- [x] `selectedNodeIds` - 由 useSelection 管理
- [x] `selectionRect` - 由 useSelection 管理
- [x] 选择状态与 deleteNodes 解耦（不再手动清空）

---

## 📊 代码改动统计

- **修改文件**: `App.tsx`
- **修改行数**: 约 15 处
- **删除代码**: 约 5 行（注释的旧状态声明 + setSelectedNodeIds）
- **新增代码**: 约 10 行（useSelection 调用 + 函数调用）

---

## 🔍 关键改进

### 1. 职责分离
- **之前**: 选择逻辑散落在 App.tsx 的多个地方
- **现在**: 所有选择逻辑集中在 useSelection Hook

### 2. 状态管理
- **之前**: 手动管理 `selectedNodeIds` 和 `selectionRect`
- **现在**: 由 useSelection Hook 统一管理

### 3. 代码复用
- **之前**: 选择逻辑无法复用
- **现在**: useSelection Hook 可以在其他组件中复用

### 4. 可测试性
- **之前**: 选择逻辑与 App.tsx 耦合，难以测试
- **现在**: useSelection Hook 可以独立测试

---

## 🚀 下一步

继续集成剩余的 Hooks：

1. ✅ useViewport - 已完成
2. ✅ useSelection - 已完成
3. ⏳ useDrag - 待集成（下一个）
4. ⏳ useConnection - 待集成
5. ⏳ useGroup - 待集成
6. ⏳ useHistory - 待集成

---

## 📝 注意事项

1. **保留旧代码**: 旧的状态声明已注释，方便回滚
2. **功能不变**: 只改代码组织方式，不改业务逻辑
3. **渐进式重构**: 一个 Hook 一个 Hook 地集成，每一步都能运行

---

**完成时间**: 2026-01-27  
**下一步**: 集成 useDrag Hook
