# UI 改版 - 阶段 2 - 功能 3：Helper Lines（辅助线 + 吸附）

> 📅 实施时间：2026-02-01  
> ⏱️ 预计耗时：4-5 小时  
> 🎯 目标：节点拖动时显示对齐辅助线，自动吸附到对齐位置

---

## 🎯 功能目标

### 核心功能

1. **水平辅助线**
   - 节点拖动时，检测与其他节点的水平对齐
   - 显示蓝色虚线
   - 自动吸附（误差 < 5px）

2. **垂直辅助线**
   - 节点拖动时，检测与其他节点的垂直对齐
   - 显示蓝色虚线
   - 自动吸附（误差 < 5px）

3. **对齐类型**
   - 左对齐：节点左边缘对齐
   - 右对齐：节点右边缘对齐
   - 中心对齐：节点中心对齐
   - 顶部对齐：节点顶部对齐
   - 底部对齐：节点底部对齐
   - 垂直中心对齐：节点垂直中心对齐

---

## 📋 实施方案

### 方案 A：在 useDrag Hook 中实现（推荐）

**优点**：
- 符合架构规范（Hooks Layer）
- 逻辑集中，易于维护
- 不影响 App.tsx

**实施步骤**：

1. 修改 `hooks/useDrag.ts`
   - 添加辅助线检测逻辑
   - 添加吸附逻辑
   - 返回辅助线数据

2. 修改 `App.tsx`
   - 渲染辅助线（SVG）
   - 从 useDrag 获取辅助线数据

---

## 🔧 详细实施

### 步骤 1：修改 useDrag.ts - 添加辅助线检测

**位置**：`hooks/useDrag.ts`

**添加类型定义**：

```typescript
interface HelperLine {
  type: 'horizontal' | 'vertical';
  position: number; // y 坐标（水平线）或 x 坐标（垂直线）
  start: number; // 线的起点
  end: number; // 线的终点
}
```

**添加辅助线检测函数**：

```typescript
const detectHelperLines = (
  draggingNode: AppNode,
  allNodes: Map<string, AppNode>,
  threshold: number = 5
): HelperLine[] => {
  const lines: HelperLine[] = [];
  const dragRect = {
    left: draggingNode.x,
    right: draggingNode.x + (draggingNode.width || 420),
    top: draggingNode.y,
    bottom: draggingNode.y + (draggingNode.height || 360),
    centerX: draggingNode.x + (draggingNode.width || 420) / 2,
    centerY: draggingNode.y + (draggingNode.height || 360) / 2,
  };

  allNodes.forEach((node) => {
    if (node.id === draggingNode.id) return;

    const nodeRect = {
      left: node.x,
      right: node.x + (node.width || 420),
      top: node.y,
      bottom: node.y + (node.height || 360),
      centerX: node.x + (node.width || 420) / 2,
      centerY: node.y + (node.height || 360) / 2,
    };

    // 检测垂直对齐（左、右、中心）
    if (Math.abs(dragRect.left - nodeRect.left) < threshold) {
      lines.push({
        type: 'vertical',
        position: nodeRect.left,
        start: Math.min(dragRect.top, nodeRect.top),
        end: Math.max(dragRect.bottom, nodeRect.bottom),
      });
    }
    if (Math.abs(dragRect.right - nodeRect.right) < threshold) {
      lines.push({
        type: 'vertical',
        position: nodeRect.right,
        start: Math.min(dragRect.top, nodeRect.top),
        end: Math.max(dragRect.bottom, nodeRect.bottom),
      });
    }
    if (Math.abs(dragRect.centerX - nodeRect.centerX) < threshold) {
      lines.push({
        type: 'vertical',
        position: nodeRect.centerX,
        start: Math.min(dragRect.top, nodeRect.top),
        end: Math.max(dragRect.bottom, nodeRect.bottom),
      });
    }

    // 检测水平对齐（顶、底、中心）
    if (Math.abs(dragRect.top - nodeRect.top) < threshold) {
      lines.push({
        type: 'horizontal',
        position: nodeRect.top,
        start: Math.min(dragRect.left, nodeRect.left),
        end: Math.max(dragRect.right, nodeRect.right),
      });
    }
    if (Math.abs(dragRect.bottom - nodeRect.bottom) < threshold) {
      lines.push({
        type: 'horizontal',
        position: nodeRect.bottom,
        start: Math.min(dragRect.left, nodeRect.left),
        end: Math.max(dragRect.right, nodeRect.right),
      });
    }
    if (Math.abs(dragRect.centerY - nodeRect.centerY) < threshold) {
      lines.push({
        type: 'horizontal',
        position: nodeRect.centerY,
        start: Math.min(dragRect.left, nodeRect.left),
        end: Math.max(dragRect.right, nodeRect.right),
      });
    }
  });

  return lines;
};
```

**添加吸附逻辑**：

```typescript
const snapToHelperLines = (
  x: number,
  y: number,
  width: number,
  height: number,
  allNodes: Map<string, AppNode>,
  threshold: number = 5
): { x: number; y: number } => {
  let snappedX = x;
  let snappedY = y;

  const dragRect = {
    left: x,
    right: x + width,
    centerX: x + width / 2,
    top: y,
    bottom: y + height,
    centerY: y + height / 2,
  };

  allNodes.forEach((node) => {
    const nodeRect = {
      left: node.x,
      right: node.x + (node.width || 420),
      centerX: node.x + (node.width || 420) / 2,
      top: node.y,
      bottom: node.y + (node.height || 360),
      centerY: node.y + (node.height || 360) / 2,
    };

    // 吸附到垂直线
    if (Math.abs(dragRect.left - nodeRect.left) < threshold) {
      snappedX = nodeRect.left;
    } else if (Math.abs(dragRect.right - nodeRect.right) < threshold) {
      snappedX = nodeRect.right - width;
    } else if (Math.abs(dragRect.centerX - nodeRect.centerX) < threshold) {
      snappedX = nodeRect.centerX - width / 2;
    }

    // 吸附到水平线
    if (Math.abs(dragRect.top - nodeRect.top) < threshold) {
      snappedY = nodeRect.top;
    } else if (Math.abs(dragRect.bottom - nodeRect.bottom) < threshold) {
      snappedY = nodeRect.bottom - height;
    } else if (Math.abs(dragRect.centerY - nodeRect.centerY) < threshold) {
      snappedY = nodeRect.centerY - height / 2;
    }
  });

  return { x: snappedX, y: snappedY };
};
```

---

### 步骤 2：修改 useDrag.ts - 集成辅助线

**在拖动处理函数中**：

```typescript
const handleDrag = (e: MouseEvent) => {
  if (!draggingNodeId) return;

  const node = nodeStore.getState().nodes.get(draggingNodeId);
  if (!node) return;

  // 计算新位置
  let newX = (e.clientX - dragStart.x - pan.x) / scale;
  let newY = (e.clientY - dragStart.y - pan.y) / scale;

  // 🆕 吸附到辅助线
  const snapped = snapToHelperLines(
    newX,
    newY,
    node.width || 420,
    node.height || 360,
    nodeStore.getState().nodes,
    5
  );
  newX = snapped.x;
  newY = snapped.y;

  // 🆕 检测辅助线
  const lines = detectHelperLines(
    { ...node, x: newX, y: newY },
    nodeStore.getState().nodes,
    5
  );

  // 更新节点位置
  nodeStore.getState().updateNode(draggingNodeId, { x: newX, y: newY });

  // 🆕 返回辅助线数据（通过 state 或 ref）
  setHelperLines(lines);
};
```

---

### 步骤 3：修改 App.tsx - 渲染辅助线

**位置**：`App.tsx` 的 SVG 层

**添加辅助线渲染**：

```tsx
{/* Helper Lines Layer */}
{helperLines.map((line, index) => (
  line.type === 'horizontal' ? (
    <line
      key={`helper-h-${index}`}
      x1={line.start}
      y1={line.position}
      x2={line.end}
      y2={line.position}
      stroke="#3b82f6"
      strokeWidth="1"
      strokeDasharray="4 4"
      className="pointer-events-none"
    />
  ) : (
    <line
      key={`helper-v-${index}`}
      x1={line.position}
      y1={line.start}
      x2={line.position}
      y2={line.end}
      stroke="#3b82f6"
      strokeWidth="1"
      strokeDasharray="4 4"
      className="pointer-events-none"
    />
  )
))}
```

---

## 🎨 视觉效果

### 辅助线样式

```
颜色：蓝色（#3b82f6）
宽度：1px
样式：虚线（4px 实线 + 4px 空白）
层级：在连接线之上，节点之下
```

### 吸附效果

```
阈值：5px
当节点边缘距离其他节点边缘 < 5px 时：
1. 显示辅助线
2. 自动吸附到对齐位置
3. 节点位置微调
```

---

## ✅ 验收标准

### 功能验收

- [ ] 拖动节点时显示辅助线
- [ ] 辅助线颜色为蓝色
- [ ] 辅助线为虚线
- [ ] 支持左、右、中心对齐（垂直线）
- [ ] 支持顶、底、中心对齐（水平线）
- [ ] 自动吸附到对齐位置
- [ ] 吸附阈值为 5px
- [ ] 停止拖动时辅助线消失

### 性能验收

- [ ] 拖动流畅，无卡顿
- [ ] 大量节点时性能正常
- [ ] 不影响其他功能

### 用户体验验收

- [ ] 辅助线清晰可见
- [ ] 吸附效果自然
- [ ] 不干扰正常拖动

---

## 🎯 技术细节

### 为什么阈值是 5px？

1. **太小（< 3px）**：难以触发，用户体验差
2. **太大（> 10px）**：误触发，干扰正常拖动
3. **5px**：平衡点，既容易触发又不误触发

### 为什么用虚线？

1. **区分连接线**：实线是连接线，虚线是辅助线
2. **不干扰视线**：虚线更轻盈，不遮挡内容
3. **符合习惯**：Figma、Sketch 等工具都用虚线

### 为什么用蓝色？

1. **符合主题**：与选中状态的蓝色边框一致
2. **醒目**：蓝色在白色背景上清晰可见
3. **不刺眼**：比红色、黄色更柔和

---

## 📊 改动统计

| 文件 | 改动类型 | 预计改动量 |
|------|---------|-----------|
| `hooks/useDrag.ts` | 新增辅助线逻辑 | +150 行 |
| `App.tsx` | 渲染辅助线 | +30 行 |
| **总计** | | **+180 行** |

---

## 🚀 实施步骤总结

1. ✅ 创建实施文档（本文档）
2. ⏳ 修改 `hooks/useDrag.ts` - 添加类型定义
3. ⏳ 修改 `hooks/useDrag.ts` - 添加检测函数
4. ⏳ 修改 `hooks/useDrag.ts` - 添加吸附函数
5. ⏳ 修改 `hooks/useDrag.ts` - 集成到拖动逻辑
6. ⏳ 修改 `App.tsx` - 渲染辅助线
7. ⏳ 测试功能
8. ⏳ 修复问题（如果有）
9. ⏳ 创建完成文档

---

## 💡 可选优化

### 1. 多节点同时拖动

**目标**：选中多个节点拖动时，也显示辅助线

**实施方案**：
- 计算多个节点的包围盒
- 使用包围盒检测对齐

### 2. 辅助线颜色根据对齐类型变化

**目标**：
- 左/右对齐：蓝色
- 中心对齐：绿色
- 顶/底对齐：蓝色
- 垂直中心对齐：绿色

### 3. 显示距离提示

**目标**：在辅助线旁边显示距离数字

**实施方案**：
- 添加 SVG text 元素
- 显示节点之间的距离

---

## 📝 注意事项

### 架构原则

1. **在 Hooks Layer 实现** ✅
   - 逻辑在 `hooks/useDrag.ts`
   - 不修改 Core Layer

2. **App.tsx 只负责渲染** ✅
   - 从 Hook 获取数据
   - 渲染 SVG 辅助线

3. **性能优先** ✅
   - 只在拖动时检测
   - 使用阈值减少计算
   - 避免不必要的渲染

---

**📅 创建时间**：2026-02-01  
**⏱️ 预计耗时**：4-5 小时  
**🎯 优先级**：高  
**⚠️ 风险**：中（需要修改拖动逻辑）

