# GroupToolbar 定位修复 - 2026-01-28

**问题**：GroupToolbar 随着画布拖动、缩放而乱动

**原因**：
- GroupToolbar 在画布的 `transform` 容器内部渲染
- 受到 `transform: translate() scale()` 的影响
- 导致位置不稳定

---

## 修复方案

### 1. 将 GroupToolbar 移到 transform 容器外部

**之前**：
```tsx
<div style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})` }}>
  {/* Groups */}
  {groups.map(...)}
  
  {/* GroupToolbar - 在 transform 容器内 ❌ */}
  <GroupToolbar ... />
  
  {/* Connections */}
</div>
```

**之后**：
```tsx
{/* GroupToolbar - 在 transform 容器外 ✅ */}
<GroupToolbar ... />

<div style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})` }}>
  {/* Groups */}
  {groups.map(...)}
  
  {/* Connections */}
</div>
```

### 2. 修改 GroupToolbar 使用 fixed 定位

**之前**：
```tsx
<div
  className="absolute ..."  // ❌ absolute 定位
  style={{
    left: `${toolbarX}px`,
    top: `${toolbarY}px`,
    transform: 'translateX(-50%)',
  }}
>
```

**之后**：
```tsx
<div
  className="fixed ..."  // ✅ fixed 定位
  style={{
    left: `${toolbarX}px`,
    top: `${toolbarY}px`,
    transform: 'translateX(-50%)',
  }}
>
```

---

## 定位计算

工具栏位置计算保持不变，但现在使用 `fixed` 定位：

```typescript
// 计算工具栏位置（使用 fixed 定位，不受画布变换影响）
const toolbarX = groupX * scale + panX + (groupWidth * scale) / 2;
const toolbarY = groupY * scale + panY + 12; // 距离组顶部 12px
```

**说明**：
- `groupX * scale + panX`：组的屏幕 X 坐标
- `(groupWidth * scale) / 2`：组宽度的一半（居中）
- `groupY * scale + panY + 12`：组的屏幕 Y 坐标 + 12px 偏移
- `transform: translateX(-50%)`：水平居中

---

## 效果

✅ **工具栏始终显示在组的顶部中央偏上位置**  
✅ **不受画布拖动影响**  
✅ **不受画布缩放影响**  
✅ **跟随组移动（因为计算了 groupX/Y）**  
✅ **跟随缩放正确显示（因为计算了 scale）**  

---

## 代码修改清单

### 1. `App.tsx`
- ✅ 将 GroupToolbar 从 transform 容器内移到外部
- ✅ 放在 `<input>` 元素之后，transform 容器之前

### 2. `components/GroupToolbar.tsx`
- ✅ 将 `className` 中的 `absolute` 改为 `fixed`
- ✅ 添加注释说明使用 fixed 定位的原因

---

## 测试场景

- [x] 拖动画布 → 工具栏跟随组移动
- [x] 缩放画布 → 工具栏大小和位置正确
- [x] 拖动组 → 工具栏跟随组移动
- [x] 选中不同的组 → 工具栏切换到新组
- [x] 取消选中 → 工具栏消失

---

## 总结

通过将 GroupToolbar 移到 transform 容器外部，并使用 `fixed` 定位，成功解决了工具栏位置不稳定的问题。现在工具栏始终稳定地显示在组的顶部中央偏上位置。
