# Node 组件 props 透传验证指南

**日期**: 2026-01-28  
**问题**: Group 拖动时 `useGroup.ts` 无法找到节点 DOM 元素  
**状态**: ✅ 代码已修复，等待浏览器验证

---

## 📋 问题分析

### 根本原因
`useGroup.ts` 通过 `document.querySelector('[data-node-id="xxx"]')` 查找节点 DOM 元素，但页面上所有节点都没有 `data-node-id` 和 `id` 属性。

### 修复方案
确保 `Node.tsx` 正确地将 props 透传到最外层 div，使得 `data-node-id` 能被渲染到 HTML 上。

---

## ✅ 代码修复确认

### 1. `components/Node.tsx` 修复

#### 接口定义（第 30 行）
```typescript
interface NodeProps extends React.HTMLAttributes<HTMLDivElement> {
  node: AppNode;
  // ... 其他 props
}
```
✅ **已正确继承 `React.HTMLAttributes<HTMLDivElement>`**

#### 组件参数（第 284-286 行）
```typescript
const NodeComponent: React.FC<NodeProps> = ({ 
  node, onUpdate, onAction, onDelete, onExpand, onCrop, 
  onNodeMouseDown, onPortMouseDown, onPortMouseUp, 
  onNodeContextMenu, onMediaContextMenu, onResizeMouseDown, 
  inputAssets, onInputReorder, onCreateWorkflow, 
  isDragging, isGroupDragging, isSelected, isResizing, isConnecting,
  className, style, ...props // 🔥 关键：解构 className, style 和其他 HTML 属性
}) => {
```
✅ **已正确解构 `className, style, ...props`**

#### return 语句（第 880-890 行）
```typescript
return (
  <div 
      {...props} // 🔥 关键：展开 props 到最外层 div
      id={props.id || `node-${node.id}`}
      data-node-id={node.id}
      className={`absolute rounded-[24px] group ... ${className || ''}`}
      style={{ ..., ...style }}
  >
```
✅ **已正确展开 `{...props}` 到最外层 div**

### 2. `App.tsx` 修复

#### Node 组件渲染（第 2117-2122 行）
```typescript
<Node
    key={node.id}
    data-node-id={node.id}  // 👈 已添加
    id={`node-${node.id}`}  // 👈 已添加
    node={node}
    // ... 其他 props
/>
```
✅ **已正确传递 `data-node-id` 和 `id` 属性**

#### useMemo 依赖（第 2238 行）
```typescript
}, [nodes, selectedNodeIds, ..., isDraggingNode, isDraggingGroup])
//                                                 ^^^^^^^^^^^^^^^^ 已添加
```
✅ **已添加 `isDraggingGroup` 到 useMemo 依赖**

---

## 🔍 浏览器验证步骤

### 步骤 1: 清除浏览器缓存（必须！）

**Windows/Linux:**
```
Ctrl + Shift + R
```

**macOS:**
```
Cmd + Shift + R
```

或者：
1. 打开开发者工具（F12）
2. 右键点击刷新按钮
3. 选择"清空缓存并硬性重新加载"

### 步骤 2: 重启 Vite 开发服务器

在终端中：
```bash
# 停止当前服务器（Ctrl + C）
# 然后重新启动
npm run dev
```

### 步骤 3: 运行验证脚本

在浏览器控制台（F12 → Console）中运行：

```javascript
// 验证脚本 1: 检查所有节点是否有 data-node-id
console.log('=== 验证 data-node-id 属性 ===');
const nodesWithDataAttr = document.querySelectorAll('[data-node-id]');
console.log('找到的节点数量:', nodesWithDataAttr.length);
console.log('节点列表:', nodesWithDataAttr);

// 验证脚本 2: 检查每个节点的属性
nodesWithDataAttr.forEach((node, index) => {
    console.log(`节点 ${index + 1}:`, {
        'data-node-id': node.getAttribute('data-node-id'),
        'id': node.id,
        'className': node.className
    });
});

// 验证脚本 3: 检查是否能找到特定节点
const testNodeId = 'node-1'; // 替换为实际的节点 ID
const foundNode = document.querySelector(`[data-node-id="${testNodeId}"]`);
console.log(`查找节点 ${testNodeId}:`, foundNode ? '✅ 找到' : '❌ 未找到');
```

### 步骤 4: 检查 Elements 面板

1. 打开开发者工具（F12）
2. 切换到 Elements 标签
3. 找到任意一个节点的 div
4. 检查是否有以下属性：
   - `data-node-id="xxx"`
   - `id="node-xxx"`

**预期结果：**
```html
<div 
    data-node-id="node-1" 
    id="node-node-1" 
    class="absolute rounded-[24px] group ..."
    style="left: 100px; top: 100px; ..."
>
    <!-- 节点内容 -->
</div>
```

---

## 🐛 如果仍然不工作

### 可能原因 1: React 没有重新渲染

**解决方案：**
1. 在 `App.tsx` 中添加一个临时的 `console.log`：
```typescript
<Node
    key={node.id}
    data-node-id={node.id}
    id={`node-${node.id}`}
    node={node}
    ref={(el) => {
        if (el) {
            console.log('Node rendered:', {
                nodeId: node.id,
                hasDataAttr: el.hasAttribute('data-node-id'),
                dataAttrValue: el.getAttribute('data-node-id')
            });
        }
    }}
    // ... 其他 props
/>
```

### 可能原因 2: Props 被其他代码覆盖

**检查方法：**
在 `Node.tsx` 的 return 语句中添加 `console.log`：
```typescript
return (
    <div 
        {...props}
        id={props.id || `node-${node.id}`}
        data-node-id={node.id}
        ref={(el) => {
            if (el) {
                console.log('Node div rendered:', {
                    nodeId: node.id,
                    propsId: props.id,
                    finalId: el.id,
                    hasDataAttr: el.hasAttribute('data-node-id'),
                    dataAttrValue: el.getAttribute('data-node-id')
                });
            }
        }}
        // ...
    >
```

### 可能原因 3: useMemo 缓存问题

**解决方案：**
临时禁用 useMemo 缓存，看看是否是缓存问题：
```typescript
// 在 App.tsx 中，临时注释掉 useMemo
const renderedNodes = nodes.map(node => (
    <Node
        key={node.id}
        data-node-id={node.id}
        id={`node-${node.id}`}
        node={node}
        // ... 其他 props
    />
));
// 不要用 useMemo，直接渲染
```

---

## 📊 验证结果

### ✅ 成功标志
- 控制台输出：`找到的节点数量: X`（X > 0）
- Elements 面板中每个节点都有 `data-node-id` 和 `id` 属性
- `useGroup.ts` 能够成功找到节点并拖动

### ❌ 失败标志
- 控制台输出：`找到的节点数量: 0`
- Elements 面板中节点没有 `data-node-id` 属性
- `useGroup.ts` 仍然报错：`找不到节点 DOM 元素`

---

## 🎯 下一步

### 如果验证成功
1. 测试 Group 拖动功能
2. 确认节点能够跟随 Group 移动
3. 关闭此问题

### 如果验证失败
1. 运行上述"可能原因"中的调试代码
2. 截图控制台输出和 Elements 面板
3. 提供给开发者进一步分析

---

## 📝 技术总结

### 修复的核心原理
1. **接口继承**: `NodeProps extends React.HTMLAttributes<HTMLDivElement>` 允许接收所有 HTML div 属性
2. **参数解构**: `{ ..., className, style, ...props }` 提取出特殊属性和其他所有属性
3. **Props 展开**: `{...props}` 将所有额外属性展开到最外层 div
4. **属性传递**: `App.tsx` 传递 `data-node-id={node.id}` → `Node.tsx` 接收 → 展开到 DOM

### 为什么这样做
- `useGroup.ts` 需要通过 `data-node-id` 查找 DOM 元素
- React 组件默认不会自动透传 props 到 DOM
- 必须显式地使用 `{...props}` 展开到目标元素

### 关键代码位置
- `components/Node.tsx` 第 30 行：接口定义
- `components/Node.tsx` 第 284-286 行：组件参数
- `components/Node.tsx` 第 880-890 行：return 语句
- `App.tsx` 第 2117-2122 行：Node 组件渲染
- `hooks/useGroup.ts` 第 145-160 行：DOM 查询逻辑

---

**最后更新**: 2026-01-28  
**状态**: 等待用户验证
