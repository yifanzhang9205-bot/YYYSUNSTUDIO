# 组拖动闪动修复 - transition 控制

**日期**: 2026-02-09  
**问题**: 临时组拖动时仍然有闪动  
**状态**: ✅ 已修复

---

## 问题描述

用户报告：
- 永久组拖动正常
- **临时组拖动时仍然有闪动**

---

## 问题根源

虽然在 `hooks/useGroup.ts` 中已经实现了正确的拖动时序：
1. 先更新 Store（React 知道新位置）
2. 保持 transform（视觉不动）
3. 延迟清除 transform（等 React 渲染完）

**但是**，在 `App.tsx` 中渲染组元素时，**没有显式控制 transition 样式**。

### 代码问题

```tsx
// ❌ 旧代码：没有控制 transition
<div 
    className="absolute border group/group"
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
        // ❌ 缺少 transition 控制
    }}
>
```

### 为什么会闪动？

1. **拖动开始**：`isDraggingGroup = true`，但组元素可能有默认的 CSS transition
2. **拖动中**：使用 `transform` 移动，视觉正常
3. **拖动结束**：
   - 更新 Store：`left/top` 改变
   - 如果有 transition，元素会**从旧位置过渡到新位置**（闪动）
   - 清除 transform：元素回到 `left/top` 位置（再次闪动）

---

## 修复方案

在组元素的 `style` 中添加 `transition` 控制：

```tsx
// ✅ 新代码：根据拖动状态控制 transition
<div 
    className="absolute border group/group"
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
        transition: isThisGroupDragging ? 'none' : 'all 0.2s ease', // 🔥 关键修复
    }}
>
```

### 修复逻辑

- **拖动时**（`isThisGroupDragging = true`）：`transition: 'none'` → 禁用过渡动画
- **非拖动时**（`isThisGroupDragging = false`）：`transition: 'all 0.2s ease'` → 启用平滑过渡

---

## 修复效果

### 修复前
- 拖动临时组时有闪动
- 松开鼠标后元素会"跳"一下

### 修复后
- ✅ 拖动丝滑，无闪动
- ✅ 松开鼠标后无缝停止
- ✅ 临时组和永久组表现一致

---

## 技术细节

### 为什么需要显式控制 transition？

1. **CSS 默认行为**：
   - 某些 CSS 类（如 Tailwind 的 `group/group`）可能包含 transition
   - 浏览器可能对 `left/top` 属性有默认的过渡效果

2. **React 状态更新**：
   - 当 `left/top` 改变时，React 会重新渲染
   - 如果有 transition，元素会从旧位置过渡到新位置

3. **transform 清除时机**：
   - 我们使用 `requestAnimationFrame` 延迟清除 transform
   - 但如果有 transition，清除 transform 时元素会再次过渡

### 为什么 `isThisGroupDragging` 变量很重要？

```tsx
const isThisGroupDragging = isDraggingGroup && selectedGroupId === g.id;
```

- `isDraggingGroup`：全局状态，表示是否有组正在拖动
- `selectedGroupId === g.id`：判断是否是**当前拖动的组**
- 只有**当前拖动的组**才需要禁用 transition

---

## 相关文件

- `App.tsx`（第1720行）：组渲染，添加 transition 控制
- `hooks/useGroup.ts`（第65行）：`isDraggingGroup` 状态管理
- `hooks/useGroup.ts`（第250-310行）：`endGroupDrag` 函数，正确的拖动时序

---

## 验收标准

- [x] 拖动临时组时无闪动
- [x] 拖动永久组时无闪动
- [x] 松开鼠标后无跳动
- [x] 拖动丝滑流畅
- [x] 临时组和永久组表现一致

---

## 总结

**问题根源**：组元素没有显式控制 transition，导致拖动结束时元素会过渡动画。

**修复方案**：在组元素的 `style` 中添加 `transition` 控制，拖动时禁用，非拖动时启用。

**关键代码**：
```tsx
transition: isThisGroupDragging ? 'none' : 'all 0.2s ease'
```

**修复效果**：拖动丝滑，无闪动，无跳动。

---

**记住**：任何使用 `transform` 优化拖动的元素，都需要显式控制 `transition`，防止状态更新时的过渡动画。
