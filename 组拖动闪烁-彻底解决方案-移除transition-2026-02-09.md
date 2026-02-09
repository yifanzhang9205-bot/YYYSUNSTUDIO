# 组拖动闪烁 - 彻底解决方案 - 移除 transition（2026-02-09）

## 🎯 问题本质

经过多次尝试，我发现**根本问题不在于 RAF 的层数，而在于架构设计**：

### 致命缺陷

```typescript
// App.tsx - 组的渲染
style={{
    left: g.x,  // ❌ 使用 left/top 定位
    top: g.y,
    transition: shouldDisableTransition ? 'none' : 'all 0.2s ease', // ❌ 内联 transition
}}
```

**为什么会闪烁？**

1. **拖动时**：`transform` 偏移 → 视觉位置 = `left + transform`
2. **松手时**：清除 `transform` → 视觉位置 = `left`（旧值）
3. **Store 更新**：`left` 变为新值 → 视觉位置 = `left`（新值）
4. **React 重渲染**：`transition` 被重新计算 → 可能从 `none` 变为 `all 0.2s`
5. **结果**：从旧值过渡到新值 → **闪回！**

### 时序问题

```
Frame 1: 清除 transform, transition = 'none'
Frame 2: 恢复 transition = 'all 0.2s'
Frame 3: 更新 Store (left = 新值)
Frame 4: React 重渲染 → 重新计算 shouldDisableTransition
Frame 5: 如果 shouldDisableTransition 变化 → transition 又变了 → 闪烁！
```

## 💡 彻底解决方案

### 方案：完全移除 transition，改用 CSS 类

**核心思路：**
1. 不使用内联 `transition`
2. 使用 CSS 类控制 transition
3. CSS 类不会被 React 重渲染覆盖

### 实施步骤

#### 步骤 1：修改 App.tsx - 移除内联 transition

```typescript
// App.tsx - 组的渲染
<div 
    key={g.id} 
    data-group-id={g.id}
    className={`
        absolute border group/group
        ${!isDraggingGroup || selectedGroupId !== g.id ? 'transition-all duration-200' : ''}
    `}
    style={{ 
        left: g.x, 
        top: g.y, 
        width: g.width, 
        height: g.height,
        borderColor: colorStyle.borderColor,
        borderWidth: colorStyle.borderWidth || '2px',
        background: colorStyle.background,
        boxShadow: colorStyle.boxShadow || 'none',
        borderRadius: 0,
        // ❌ 移除：transition: shouldDisableTransition ? 'none' : 'all 0.2s ease',
    }} 
    onMouseDown={(e) => { 
        e.stopPropagation();
        selectGroup(g.id);
        startGroupDrag(e, g.id, g);
    }}
>
```

#### 步骤 2：修改 useGroup.ts - 简化 endGroupDrag

```typescript
const endGroupDrag = useCallback((e: MouseEvent, currentScale: number) => {
  if (!dragGroupRef.current) return;

  const { id, startX, startY, mouseStartX, mouseStartY, childNodes } = dragGroupRef.current;

  // 计算最终位置
  const screenDx = e.clientX - mouseStartX;
  const screenDy = e.clientY - mouseStartY;
  const worldDx = screenDx / currentScale;
  const worldDy = screenDy / currentScale;
  const finalX = startX + worldDx;
  const finalY = startY + worldDy;

  onSaveHistory();

  // 🔥 简化方案：直接清除 transform，不操作 transition
  const groupElement = document.querySelector(`[data-group-id="${id}"]`) as HTMLElement;
  
  if (groupElement) {
    // 清除 transform
    groupElement.style.transform = '';
    groupElement.style.willChange = 'auto';
  }

  // 清除子节点 transform
  childNodes.forEach((child: { id: string; startX: number; startY: number; element: HTMLElement | null }) => {
    if (child.element) {
      child.element.style.transform = '';
      child.element.style.willChange = 'auto';
    }
  });

  // 🔥 立即更新 Store（不延迟）
  onUpdateGroup(id, { x: finalX, y: finalY });
  
  childNodes.forEach((child: { id: string; startX: number; startY: number }) => {
    onUpdateNode(child.id, {
      x: child.startX + worldDx,
      y: child.startY + worldDy,
    });
  });

  // 清除拖动状态
  setIsDraggingGroup(false);
  setDraggingGroupOffset(null);
  dragGroupRef.current = null;
}, [onSaveHistory, onUpdateGroup, onUpdateNode]);
```

## 🎯 为什么这样有效？

### CSS 类 vs 内联 style

| 特性 | CSS 类 | 内联 style |
|------|--------|-----------|
| React 重渲染影响 | ✅ 不会覆盖 | ❌ 会覆盖 |
| 优先级 | 低 | 高 |
| 性能 | ✅ 更好 | ❌ 较差 |
| 可维护性 | ✅ 更好 | ❌ 较差 |

### 时序对比

**旧方案（内联 transition）：**
```
1. 清除 transform
2. 恢复 transition (RAF 1)
3. 更新 Store (RAF 2)
4. React 重渲染 → 重新计算 transition → 可能覆盖 → 闪烁！
```

**新方案（CSS 类）：**
```
1. 清除 transform
2. 更新 Store
3. React 重渲染 → CSS 类不变 → 不会闪烁！
```

## 📝 完整实施代码

### App.tsx

```typescript
// 🔥 修改前
<div 
    data-group-id={g.id}
    className="absolute border group/group"
    style={{ 
        left: g.x, 
        top: g.y,
        transition: shouldDisableTransition ? 'none' : 'all 0.2s ease', // ❌
    }} 
>

// 🔥 修改后
<div 
    data-group-id={g.id}
    className={`
        absolute border group/group
        ${!isDraggingGroup || selectedGroupId !== g.id ? 'transition-all duration-200' : ''}
    `}
    style={{ 
        left: g.x, 
        top: g.y,
        // ✅ 移除 transition
    }} 
>
```

### useGroup.ts

```typescript
const endGroupDrag = useCallback((e: MouseEvent, currentScale: number) => {
  if (!dragGroupRef.current) return;

  const { id, startX, startY, mouseStartX, mouseStartY, childNodes } = dragGroupRef.current;

  const screenDx = e.clientX - mouseStartX;
  const screenDy = e.clientY - mouseStartY;
  const worldDx = screenDx / currentScale;
  const worldDy = screenDy / currentScale;
  const finalX = startX + worldDx;
  const finalY = startY + worldDy;

  onSaveHistory();

  // 清除 transform
  const groupElement = document.querySelector(`[data-group-id="${id}"]`) as HTMLElement;
  if (groupElement) {
    groupElement.style.transform = '';
    groupElement.style.willChange = 'auto';
  }

  childNodes.forEach((child: { element: HTMLElement | null }) => {
    if (child.element) {
      child.element.style.transform = '';
      child.element.style.willChange = 'auto';
    }
  });

  // 立即更新 Store
  onUpdateGroup(id, { x: finalX, y: finalY });
  childNodes.forEach((child: { id: string; startX: number; startY: number }) => {
    onUpdateNode(child.id, {
      x: child.startX + worldDx,
      y: child.startY + worldDy,
    });
  });

  // 清除状态
  setIsDraggingGroup(false);
  setDraggingGroupOffset(null);
  dragGroupRef.current = null;
}, [onSaveHistory, onUpdateGroup, onUpdateNode]);
```

## ✅ 验收标准

- [ ] 拖动组时，组和子节点实时跟随鼠标
- [ ] 松手后，组和子节点**立即**移动到最终位置（无闪回）
- [ ] 无任何闪烁或跳动
- [ ] 性能流畅（60 FPS）

## 🚀 后续优化

如果还有问题，考虑：

1. **完全改用 transform 定位**：
   - 将组的定位从 `left/top` 改为 `transform`
   - 但需要大量重构

2. **使用 Web Animations API**：
   - 完全由 JavaScript 控制动画
   - 不依赖 CSS transition

3. **禁用所有 transition**：
   - 如果用户不需要动画效果
   - 直接移除所有 transition

---

**修复完成时间：** 2026-02-09
**修复人员：** Kiro AI
