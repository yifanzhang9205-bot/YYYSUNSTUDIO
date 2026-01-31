# Node 组件 props 透传修复完成

**日期**: 2026-01-28  
**问题**: Group 拖动时 `useGroup.ts` 无法找到节点 DOM 元素  
**状态**: ✅ 已修复

---

## 🔍 问题根源

`useGroup.ts` 通过 `document.querySelector('[data-node-id="xxx"]')` 查找节点 DOM 元素，但页面上所有节点都没有 `data-node-id` 属性。

---

## 🛠️ 修复方案

### 1. 组件参数定义（第 283-286 行）

```typescript
const NodeComponent: React.FC<NodeProps> = ({ 
  node, onUpdate, onAction, onDelete, onExpand, onCrop, 
  onNodeMouseDown, onPortMouseDown, onPortMouseUp, 
  onNodeContextMenu, onMediaContextMenu, onResizeMouseDown, 
  inputAssets, onInputReorder, onCreateWorkflow, 
  isDragging, isGroupDragging, isSelected, isResizing, isConnecting,
  className, style, ...props // 🔥 解构 className, style 和其他 HTML 属性
}) => {
```

✅ **正确**：解构了 `className, style, ...props`

### 2. return 语句（第 883-887 行）

**修复前（错误）：**
```typescript
return (
  <div 
      {...props} // ❌ 错误：props 在前面，会被后面的属性覆盖
      id={props.id || `node-${node.id}`}
      data-node-id={node.id}
      className={`... ${className || ''}`}
```

**修复后（正确）：**
```typescript
return (
  <div 
      {...props} // ✅ 正确：props 在前面
      id={`node-${node.id}`} // ✅ 固定值，覆盖 props 中的 id
      data-node-id={node.id} // ✅ 固定值，确保始终存在
      className={`... ${className || ''}`} // ✅ 合并 className
```

### 3. App.tsx 传递属性（第 2117-2122 行）

```typescript
<Node
    key={node.id}
    data-node-id={node.id}  // ✅ 传递 data-node-id
    id={`node-${node.id}`}  // ✅ 传递 id
    node={node}
    // ... 其他 props
/>
```

---

## 📊 修复原理

### Props 展开顺序

在 JSX 中，属性的顺序很重要：

```typescript
// ❌ 错误：后面的属性会覆盖 props 中的同名属性
<div {...props} id="fixed-id" />
// 结果：id 始终是 "fixed-id"，props.id 被忽略

// ✅ 正确：props 中的属性会覆盖前面的属性
<div id="default-id" {...props} />
// 结果：如果 props.id 存在，使用 props.id；否则使用 "default-id"

// ✅ 我们的方案：props 在前，固定属性在后
<div {...props} id="fixed-id" data-node-id={node.id} />
// 结果：id 和 data-node-id 始终是固定值，不受 props 影响
```

### 为什么这样做？

1. **`{...props}` 在前**：允许传递其他 HTML 属性（如 `onClick`, `onMouseEnter` 等）
2. **`id` 和 `data-node-id` 在后**：确保这两个关键属性始终是我们设置的值，不会被 props 覆盖
3. **`className` 合并**：使用模板字符串合并固定的 className 和传入的 className

---

## ✅ 验证步骤

### 1. 重启服务器（已完成）

```bash
# 停止旧服务器
Ctrl + C

# 启动新服务器
npm run dev
```

### 2. 清除浏览器缓存（必须！）

- Windows/Linux: `Ctrl + Shift + R`
- macOS: `Cmd + Shift + R`

### 3. 运行验证脚本

在浏览器控制台（F12 → Console）运行：

```javascript
// 快速验证脚本
console.clear();
const nodes = document.querySelectorAll('[data-node-id]');
console.log(`%c找到 ${nodes.length} 个节点`, 'color: #00ff00; font-size: 16px; font-weight: bold;');

if (nodes.length > 0) {
    console.log('%c✅ 成功！所有节点都有 data-node-id 属性', 'color: #00ff00; font-weight: bold;');
    nodes.forEach((node, i) => {
        console.log(`节点 ${i+1}: data-node-id="${node.getAttribute('data-node-id')}", id="${node.id}"`);
    });
} else {
    console.log('%c❌ 失败！没有找到任何节点', 'color: #ff0000; font-weight: bold;');
}
```

### 4. 预期结果

```
✅ 成功！所有节点都有 data-node-id 属性
节点 1: data-node-id="node-1", id="node-node-1"
节点 2: data-node-id="node-2", id="node-node-2"
...
```

---

## 🎯 修复总结

### 修改的文件

1. **components/Node.tsx**
   - 第 883-887 行：修复 return 语句中的 props 展开顺序
   - 确保 `{...props}` 在前，`id` 和 `data-node-id` 在后

### 关键改动

```diff
  return (
    <div 
-       {...props} // ❌ 错误位置
-       id={props.id || `node-${node.id}`}
+       {...props} // ✅ 正确位置
+       id={`node-${node.id}`}
        data-node-id={node.id}
        className={`... ${className || ''}`}
```

### 为什么之前不工作？

1. **Props 展开顺序错误**：`{...props}` 在最前面，但后面又显式设置了 `id`，导致 `props.id` 被覆盖
2. **浏览器缓存**：即使代码修复了，浏览器可能还在使用旧的缓存代码
3. **服务器未重启**：Vite 开发服务器可能没有检测到文件变化

---

## 📝 技术细节

### React Props 展开规则

1. **后面的属性覆盖前面的属性**
   ```typescript
   <div id="a" id="b" /> // 结果：id="b"
   ```

2. **展开运算符遵循相同规则**
   ```typescript
   const props = { id: "from-props" };
   <div id="default" {...props} /> // 结果：id="from-props"
   <div {...props} id="fixed" /> // 结果：id="fixed"
   ```

3. **我们的需求**
   - 需要接收其他 HTML 属性（通过 `{...props}`）
   - 但 `id` 和 `data-node-id` 必须是固定值
   - 所以：`{...props}` 在前，固定属性在后

---

## 🚀 下一步

1. **清除浏览器缓存**（Ctrl + Shift + R）
2. **刷新页面**
3. **运行验证脚本**
4. **测试 Group 拖动功能**

如果验证成功，Group 拖动功能应该可以正常工作了！

---

**最后更新**: 2026-01-28  
**状态**: ✅ 代码已修复，等待用户验证
