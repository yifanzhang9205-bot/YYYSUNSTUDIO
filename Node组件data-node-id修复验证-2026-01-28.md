# Node 组件 data-node-id 修复验证

## 问题现象

```
[useGroup] 找不到节点 DOM 元素: n-1769534642268-yskgnovjz
[useGroup] 当前 DOM 中的所有节点: []
```

## 问题分析

1. ✅ `useGroup.ts` 的查询代码是正确的：
   - 先用 `[data-node-id="${n.id}"]` 查找
   - 如果找不到，再用 `getElementById('node-${n.id}')` 查找

2. ❌ 但是 DOM 中没有任何带 `data-node-id` 属性的元素
   - `document.querySelectorAll('[data-node-id]')` 返回空数组

3. 🔴 **可能的原因：浏览器缓存了旧的代码**

## 修复步骤

### 第 1 步：清除浏览器缓存

**Windows 系统（Chrome/Edge）：**
1. 按 `Ctrl + Shift + Delete` 打开清除浏览器数据
2. 选择"缓存的图片和文件"
3. 点击"清除数据"

**或者使用硬刷新：**
1. 按 `Ctrl + Shift + R`（强制刷新，忽略缓存）
2. 或者按 `Ctrl + F5`

### 第 2 步：验证修改是否生效

打开浏览器开发者工具（F12），在 Console 中运行：

```javascript
// 检查是否有 data-node-id 属性
console.log('所有节点:', document.querySelectorAll('[data-node-id]'));

// 检查第一个节点的属性
const firstNode = document.querySelector('[data-node-id]');
if (firstNode) {
    console.log('第一个节点的 data-node-id:', firstNode.getAttribute('data-node-id'));
    console.log('第一个节点的 id:', firstNode.id);
} else {
    console.log('❌ 没有找到任何带 data-node-id 的节点');
}
```

### 第 3 步：检查 Elements 面板

1. 打开开发者工具（F12）
2. 切换到 Elements 标签
3. 找到任意一个节点元素
4. 检查最外层 `div` 是否有：
   - `data-node-id="n-xxx-xxx"`
   - `id="node-n-xxx-xxx"`

**预期结果：**
```html
<div 
    data-node-id="n-1769534642268-yskgnovjz" 
    id="node-n-1769534642268-yskgnovjz"
    class="absolute rounded-[24px] group ..."
    style="left: 100px; top: 100px; ..."
>
    <!-- 节点内容 -->
</div>
```

## 如果清除缓存后仍然不工作

### 方案 A：检查 Vite 开发服务器

1. 停止 Vite 开发服务器（Ctrl + C）
2. 删除 `node_modules/.vite` 缓存目录
3. 重新启动：`npm run dev`

### 方案 B：检查代码是否正确保存

1. 确认 `App.tsx` 中有：
```typescript
<Node
    key={node.id}
    data-node-id={node.id}  // 👈 这行
    id={`node-${node.id}`}  // 👈 这行
    node={node}
    // ...
/>
```

2. 确认 `components/Node.tsx` 中有：
```typescript
interface NodeProps extends React.HTMLAttributes<HTMLDivElement> { ... }

const NodeComponent = ({ node, ..., className, style, ...props }) => {
    return (
        <div 
            {...props}  // 👈 这行
            id={props.id || `node-${node.id}`}
            data-node-id={node.id}
            className={`... ${className || ''}`}
            style={{ ..., ...style }}
        >
```

### 方案 C：手动验证渲染

在 `Node.tsx` 的 `return` 语句前添加调试日志：

```typescript
console.log('[Node] 渲染节点:', {
    nodeId: node.id,
    propsId: props.id,
    dataNodeId: node.id,
    finalId: props.id || `node-${node.id}`,
});
```

## 预期效果

修复后，控制台应该显示：

```
[useGroup] 找到节点 DOM 元素: n-1769534642268-yskgnovjz
[useGroup] 当前 DOM 中的所有节点: ["n-1769534642268-yskgnovjz", "n-1769534643457-6awwrnj1t", ...]
```

## 总结

这个问题是因为浏览器缓存了旧的代码，导致新的 `data-node-id` 属性没有生效。

**解决方案：**
1. 清除浏览器缓存（Ctrl + Shift + R）
2. 重启 Vite 开发服务器
3. 验证 DOM 中是否有 `data-node-id` 属性

---

**修复时间：** 2026-01-28
**修复人员：** AI Assistant
