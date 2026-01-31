# 架构重构 - 第 4 步：Hooks 集成实施指南

**日期**：2026-01-27  
**状态**：准备实施  
**风险等级**：中等（需要修改 App.tsx）

---

## ⚠️ 重要说明

由于 App.tsx 有 2617 行代码，直接全量修改风险较大。我建议采用**渐进式集成**策略：

1. **第一阶段**：先集成最简单的 Hook（useViewport）
2. **第二阶段**：测试无误后，再集成其他 Hooks
3. **第三阶段**：全面测试，删除旧代码

---

## 📋 第一阶段：集成 useViewport（最简单）

### 为什么先集成 useViewport？

1. **最简单**：只涉及缩放和平移，逻辑清晰
2. **独立性强**：不依赖其他 Hooks
3. **易于测试**：滚轮缩放、拖拽平移、适应视图
4. **风险最小**：即使出问题，也容易回滚

### 修改步骤

#### 步骤 1：添加 useViewport Hook

在 App.tsx 的状态定义部分（第 185 行附近）添加：

```typescript
// === 架构重构：使用 useViewport Hook ===
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

#### 步骤 2：注释旧的 Viewport 状态

注释掉以下代码（不要删除）：

```typescript
// === 旧代码（已被 useViewport 替换）===
// const [scale, setScale] = useState<number>(1);
// const [pan, setPan] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
// const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
// const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
// const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
```

#### 步骤 3：注释旧的 scaleRef 和 panRef

注释掉以下代码：

```typescript
// === 旧代码（已被 useViewport 替换）===
// const scaleRef = useRef(scale);
// const panRef = useRef(pan);
```

#### 步骤 4：删除旧的 handleFitView 函数

找到 `handleFitView` 函数（约第 455 行），注释掉：

```typescript
// === 旧代码（已被 useViewport.fitView 替换）===
// const handleFitView = useCallback(() => {
//   ...
// }, [nodes]);
```

#### 步骤 5：添加滚轮事件监听

在 useEffect 部分添加：

```typescript
// === 架构重构：监听滚轮事件 ===
useEffect(() => {
  window.addEventListener('wheel', handleWheel, { passive: false });
  return () => window.removeEventListener('wheel', handleWheel);
}, [handleWheel]);
```

#### 步骤 6：添加画布拖拽事件监听

在 useEffect 部分添加：

```typescript
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

#### 步骤 7：更新画布点击事件

找到画布的 `onMouseDown` 事件，替换为：

```typescript
onMouseDown={(e) => {
  if (e.button === 1 || e.button === 2 || e.spaceKey) {
    startCanvasDrag(e);
  }
}}
```

#### 步骤 8：更新适应视图按钮

找到适应视图按钮，替换为：

```typescript
<button onClick={fitView}>适应视图</button>
```

### 测试清单

- [ ] 滚轮缩放正常工作（Ctrl/Cmd + 滚轮）
- [ ] 滚轮平移正常工作（滚轮）
- [ ] 拖拽平移正常工作（空格 + 拖拽）
- [ ] 适应视图正常工作
- [ ] 缩放中心点正确
- [ ] 无卡顿、无闪烁

---

## 📋 第二阶段：集成其他 Hooks

### 集成顺序

1. **useSelection**（选择逻辑）
2. **useDrag**（拖拽逻辑）
3. **useConnection**（连接线逻辑）
4. **useGroup**（分组逻辑）
5. **useHistory**（撤销/重做逻辑）

### 每个 Hook 的集成步骤

参考第一阶段的步骤：
1. 添加 Hook
2. 注释旧状态
3. 删除旧函数
4. 添加事件监听
5. 更新事件处理
6. 测试功能

---

## 🚨 风险和注意事项

### 风险 1：事件监听冲突

**问题**：新旧事件监听可能冲突

**缓解**：
- 先注释旧代码，不要删除
- 测试新代码无误后再删除
- 如果出现问题，立即回滚

### 风险 2：状态同步问题

**问题**：Hooks 和 App.tsx 的状态可能不同步

**缓解**：
- 使用回调函数更新状态
- 确保数据流正确
- 全面测试所有功能

### 风险 3：性能问题

**问题**：可能引入新的性能问题

**缓解**：
- 使用 RAF 优化
- 使用 ref 避免闭包问题
- 测试拖拽 FPS

---

## ✅ 验收标准

### 功能验收
- [ ] 所有功能正常工作
- [ ] 无崩溃、无白屏
- [ ] 无控制台错误

### 性能验收
- [ ] 拖拽 FPS 达到 60
- [ ] 无卡顿、无闪烁
- [ ] 内存占用正常

### 代码质量验收
- [ ] 无编译错误
- [ ] 无 TypeScript 错误
- [ ] 代码清晰，职责分明

---

## 📝 实施建议

### 建议 1：分步实施

不要一次性集成所有 Hooks，而是：
1. 先集成 useViewport
2. 测试无误后，再集成下一个
3. 每集成一个，就测试一次

### 建议 2：保留旧代码

- 先注释旧代码，不要删除
- 测试新代码无误后再删除
- 如果出现问题，可以快速回滚

### 建议 3：全面测试

- 测试所有功能
- 测试所有快捷键
- 测试所有边界情况
- 测试性能

### 建议 4：记录问题

- 记录遇到的问题
- 记录解决方案
- 更新文档

---

## 🎯 下一步行动

### 立即行动

1. **集成 useViewport**（第一阶段）
2. **测试功能**
3. **确认无误后，继续集成其他 Hooks**

### 等待用户确认

在开始修改前，请确认：
- [ ] 是否同意采用渐进式集成策略？
- [ ] 是否同意先集成 useViewport？
- [ ] 是否同意保留旧代码（注释掉）？

---

**文档版本**：v1.0  
**创建日期**：2026-01-27  
**作者**：Kiro AI  
**状态**：等待用户确认
