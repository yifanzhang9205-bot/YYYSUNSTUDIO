# 架构重构 - 第 4 步：useViewport 集成完成

**日期**：2026-01-27  
**阶段**：架构重构 - 阶段 A - 第 4 步（第一阶段）  
**状态**：✅ 完成

---

## 📋 完成内容

### 集成的 Hook

✅ **useViewport Hook**（缩放/平移逻辑）
- 处理画布缩放（滚轮、快捷键）
- 处理画布平移（拖拽、空格+拖拽）
- 处理适应视图（Fit View）
- 提供放大/缩小/重置视图功能

### 修改的文件

✅ **App.tsx**
- 添加了 `useViewport` Hook
- 注释了旧的 Viewport 状态（保留以便回滚）
- 注释了旧的 scaleRef 和 panRef（保留以便回滚）
- 更新了 useEffect 依赖项

---

## 📊 修改详情

### 1. 添加 useViewport Hook

**位置**：第 193 行附近

**添加的代码**：
```typescript
// === 架构重构：使用 useViewport Hook（阶段 A - 第 4 步）===
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
  getNodeHeight: (node: AppNode) => {
    // 计算节点高度的逻辑
    ...
  },
});
```

### 2. 注释旧的 Viewport 状态

**注释的代码**：
```typescript
// === 旧代码（已被 useViewport 替换，保留以便回滚）===
// const [scale, setScale] = useState<number>(1);
// const [pan, setPan] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
// const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
// const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
// const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
```

### 3. 注释旧的 scaleRef 和 panRef

**注释的代码**：
```typescript
// === 旧代码（已被 useViewport 替换）===
// const scaleRef = useRef(scale);
// const panRef = useRef(pan);
```

### 4. 更新 useEffect 依赖项

**修改前**：
```typescript
}, [nodes, connections, groups, history, historyIndex, connectionStart, scale, pan]);
```

**修改后**：
```typescript
}, [nodes, connections, groups, history, historyIndex, connectionStart]);
```

---

## 🎯 下一步：测试和验证

### 需要测试的功能

- [ ] **滚轮缩放**：Ctrl/Cmd + 滚轮
- [ ] **滚轮平移**：滚轮
- [ ] **拖拽平移**：空格 + 拖拽（或中键拖拽）
- [ ] **适应视图**：自动计算缩放和平移
- [ ] **缩放中心点**：缩放时中心点正确
- [ ] **无卡顿、无闪烁**

### 测试步骤

1. **启动开发服务器**
   ```bash
   npm run dev
   ```

2. **测试滚轮缩放**
   - 按住 Ctrl/Cmd，滚动滚轮
   - 检查缩放是否正常
   - 检查缩放中心点是否正确

3. **测试滚轮平移**
   - 滚动滚轮（不按 Ctrl/Cmd）
   - 检查平移是否正常

4. **测试拖拽平移**
   - 按住空格键，拖拽画布
   - 或使用中键拖拽
   - 检查平移是否正常

5. **测试适应视图**
   - 点击适应视图按钮（如果有）
   - 或调用 `fitView()` 函数
   - 检查是否正确居中和缩放

6. **测试性能**
   - 检查是否有卡顿
   - 检查是否有闪烁
   - 检查 FPS 是否达到 60

---

## ⚠️ 注意事项

### 1. 旧代码已注释，未删除

- 所有旧代码都已注释，未删除
- 如果出现问题，可以快速回滚
- 测试无误后，可以删除注释的代码

### 2. 需要添加事件监听

**当前状态**：useViewport Hook 已集成，但事件监听尚未添加

**需要添加的事件监听**：
1. 滚轮事件监听（`handleWheel`）
2. 画布拖拽事件监听（`startCanvasDrag`, `updateCanvasDrag`, `endCanvasDrag`）

**添加位置**：在 useEffect 部分

**示例代码**：
```typescript
// === 架构重构：监听滚轮事件 ===
useEffect(() => {
  window.addEventListener('wheel', handleWheel, { passive: false });
  return () => window.removeEventListener('wheel', handleWheel);
}, [handleWheel]);

// === 架构重构：监听画布拖拽 ===
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
```

### 3. 需要更新画布点击事件

**需要找到画布的 `onMouseDown` 事件**，替换为：
```typescript
onMouseDown={(e) => {
  if (e.button === 1 || e.button === 2 || e.spaceKey) {
    startCanvasDrag(e);
  }
}}
```

### 4. 需要更新适应视图按钮

**需要找到适应视图按钮**，替换为：
```typescript
<button onClick={fitView}>适应视图</button>
```

---

## 📊 预计改动统计

| 类别 | 删除行数 | 添加行数 | 净变化 |
|------|---------|---------|--------|
| 状态定义 | 5 行（注释） | 30 行 | +25 行 |
| Ref 定义 | 2 行（注释） | 0 行 | -2 行 |
| useEffect | 2 行（注释） | 0 行 | -2 行 |
| **总计** | **9 行** | **30 行** | **+21 行** |

**App.tsx 行数变化**：2617 行 → 约 2638 行（临时增加，测试无误后会减少）

---

## 🎯 下一步行动

### 立即行动

1. **添加事件监听**（滚轮、画布拖拽）
2. **更新画布点击事件**
3. **更新适应视图按钮**
4. **测试所有功能**

### 测试无误后

1. **删除注释的旧代码**
2. **继续集成其他 Hooks**（useSelection, useDrag, useConnection, useGroup, useHistory）

---

## ✅ 验收标准

### 功能验收
- [ ] 滚轮缩放正常工作
- [ ] 滚轮平移正常工作
- [ ] 拖拽平移正常工作
- [ ] 适应视图正常工作
- [ ] 缩放中心点正确
- [ ] 无崩溃、无白屏

### 性能验收
- [ ] 无卡顿、无闪烁
- [ ] FPS 达到 60
- [ ] 内存占用正常

### 代码质量验收
- [ ] 无编译错误
- [ ] 无 TypeScript 错误
- [ ] 无控制台警告

---

## 🎉 总结

成功集成了 useViewport Hook 到 App.tsx，这是架构重构的第一步。

**优势**：
- ✅ 代码更清晰，职责分明
- ✅ 易于测试（独立模块）
- ✅ 易于扩展（通过回调函数解耦）
- ✅ 保留了旧代码，方便回滚

**下一步**：
- 添加事件监听
- 测试所有功能
- 继续集成其他 Hooks

---

**文档版本**：v1.0  
**创建日期**：2026-01-27  
**作者**：Kiro AI  
**状态**：✅ 完成（等待测试）
