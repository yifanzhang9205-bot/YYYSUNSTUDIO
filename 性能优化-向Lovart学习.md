# 性能优化 - 向 Lovart/ComfyUI 学习

## Lovart/ComfyUI 的性能优势分析

### 核心架构差异

#### 我们的架构（当前）
```
React 前端
├── 所有数据存储在内存（useState）
├── 图片以 base64 存储在 React state
├── 每次更新触发重新渲染
└── Three.js 场景在组件内创建
```

**问题：**
- 所有数据在内存中
- React 频繁重新渲染
- 图片数据在 state 中

#### Lovart/ComfyUI 的架构
```
Python 后端（ComfyUI Server）
├── 图片存储在磁盘/临时文件
├── 只传输图片 URL 到前端
├── 前端只显示预览
└── 计算在后端进行
```

**优势：**
- 图片不占用前端内存
- 前端只负责显示
- 后端处理重任务

---

## Lovart/ComfyUI 的关键技术

### 1. 图片存储策略 ⭐⭐⭐

#### ComfyUI 的做法
```python
# 后端生成图片后
output_path = f"output/{timestamp}_{random_id}.png"
image.save(output_path)

# 返回给前端
return {
    "url": f"/view?filename={filename}",
    "preview": f"/view?filename={filename}&preview=true"  # 缩略图
}
```

**前端只存储 URL：**
```javascript
// 前端
node.data = {
    imageUrl: "/view?filename=xxx.png",  // 只存 URL，不存 base64
    previewUrl: "/view?filename=xxx.png&preview=true"
}
```

**我们的问题：**
```javascript
// 我们当前的做法
node.data = {
    image: "data:image/png;base64,iVBORw0KG..." // 5-10MB 的 base64 字符串
}
```

### 2. 懒加载和虚拟化 ⭐⭐⭐

#### ComfyUI 的做法
```javascript
// 只渲染可见节点
const visibleNodes = nodes.filter(node => {
    return isInViewport(node.position, viewport);
});

// 图片懒加载
<img 
    src={node.data.previewUrl} 
    loading="lazy"  // 浏览器原生懒加载
    onLoad={() => loadFullImage(node.data.imageUrl)}
/>
```

**我们的问题：**
```javascript
// 所有节点同时渲染
{nodes.map(node => <Node node={node} />)}

// 所有图片同时加载
<img src={node.data.image} />  // base64 立即加载
```

### 3. 增量更新 ⭐⭐

#### ComfyUI 的做法
```javascript
// 只更新变化的节点
const updateNode = (nodeId, changes) => {
    setNodes(prev => prev.map(n => 
        n.id === nodeId 
            ? { ...n, ...changes }  // 只更新这个节点
            : n  // 其他节点不变
    ));
};

// React.memo 防止不必要的重新渲染
const Node = React.memo(({ node }) => {
    // ...
}, (prev, next) => {
    return prev.node.data === next.node.data;  // 浅比较
});
```

**我们的问题：**
```javascript
// 更新一个节点，可能触发所有节点重新渲染
const handleNodeUpdate = (id, data) => {
    setNodes(prev => prev.map(n => 
        n.id === id ? { ...n, data: { ...n.data, ...data } } : n
    ));
};
// 没有 React.memo，所有节点都重新渲染
```

### 4. Web Worker 处理 ⭐⭐

#### ComfyUI 的做法
```javascript
// 图片处理在 Worker 中进行
const worker = new Worker('image-processor.js');

worker.postMessage({
    type: 'process',
    image: imageData,
    operations: ['resize', 'compress']
});

worker.onmessage = (e) => {
    updateNode(nodeId, { image: e.data.result });
};
```

**我们的做法：**
```javascript
// 我们已经有 Worker，但使用不够充分
// utils/imageUtils.ts 中有 Worker
// 但很多操作还在主线程
```

### 5. Canvas 渲染优化 ⭐⭐

#### ComfyUI 的做法
```javascript
// 使用 Canvas 渲染节点，而不是 DOM
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

// 只重绘变化的区域
ctx.clearRect(dirtyRect.x, dirtyRect.y, dirtyRect.width, dirtyRect.height);
ctx.drawImage(nodeImage, node.x, node.y);
```

**我们的做法：**
```javascript
// 使用 React 渲染 DOM 节点
<div className="node" style={{ left: node.x, top: node.y }}>
    <img src={node.data.image} />
</div>
// DOM 操作比 Canvas 慢
```

### 6. 数据结构优化 ⭐

#### ComfyUI 的做法
```javascript
// 使用 Map 而不是 Array
const nodesMap = new Map();
nodesMap.set(nodeId, nodeData);

// O(1) 查找
const node = nodesMap.get(nodeId);

// 连接关系使用邻接表
const connections = new Map();
connections.set(nodeId, [connectedNodeId1, connectedNodeId2]);
```

**我们的做法：**
```javascript
// 使用 Array
const nodes = [...];

// O(n) 查找
const node = nodes.find(n => n.id === nodeId);

// 连接关系使用数组
const connections = [{ from: id1, to: id2 }];
```

---

## 我们可以立即借鉴的技术

### 优先级 1：图片 URL 化（最重要）⭐⭐⭐

#### 实施方案

**步骤 1：添加本地文件服务**
```typescript
// 新建 services/fileServer.ts
export const saveImageToFile = async (base64: string, nodeId: string): Promise<string> => {
    // 将 base64 转换为 Blob
    const blob = await fetch(base64).then(r => r.blob());
    
    // 使用 File System Access API（如果支持）
    // 或者使用 IndexedDB 存储 Blob
    const { saveToStorage } = await import('./storage');
    await saveToStorage(`image-${nodeId}`, blob);
    
    // 返回 Blob URL
    const blobUrl = URL.createObjectURL(blob);
    return blobUrl;
};

export const loadImageFromFile = async (nodeId: string): Promise<string> => {
    const { loadFromStorage } = await import('./storage');
    const blob = await loadFromStorage(`image-${nodeId}`);
    return URL.createObjectURL(blob);
};
```

**步骤 2：修改节点数据结构**
```typescript
// 修改前
interface NodeData {
    image?: string;  // base64 字符串（5-10MB）
    gridImages?: string[];  // base64 数组
}

// 修改后
interface NodeData {
    imageUrl?: string;  // Blob URL（只是个指针）
    previewUrl?: string;  // 缩略图 Blob URL
    gridImageUrls?: string[];  // Blob URL 数组
}
```

**步骤 3：修改图片存储逻辑**
```typescript
// App.tsx
const base64Images = await downloadImagesInBatch(res);

// 生成缩略图
const thumbnails = await generateThumbnailsInBatch(base64Images, 512);

// 保存原图到 IndexedDB，返回 Blob URL
const imageUrls = await Promise.all(
    base64Images.map((img, i) => saveImageToFile(img, `${id}-${i}`))
);

// 保存缩略图到 IndexedDB，返回 Blob URL
const previewUrls = await Promise.all(
    thumbnails.map((img, i) => saveImageToFile(img, `${id}-preview-${i}`))
);

handleNodeUpdate(id, { 
    gridImageUrls: previewUrls,  // 只存 URL
    image: previewUrls[0]
});
```

**效果：**
- 内存占用：从 5-10MB → 几 KB（只存 URL）
- 100 个节点：从 500MB-1GB → 几百 KB

### 优先级 2：React.memo 优化 ⭐⭐

```typescript
// components/Node.tsx
export const Node = React.memo<NodeProps>(({ node, onUpdate, ... }) => {
    // ... 组件逻辑 ...
}, (prevProps, nextProps) => {
    // 自定义比较逻辑
    return (
        prevProps.node.id === nextProps.node.id &&
        prevProps.node.x === nextProps.node.x &&
        prevProps.node.y === nextProps.node.y &&
        prevProps.node.data === nextProps.node.data &&
        prevProps.node.status === nextProps.node.status
    );
});
```

**效果：**
- 更新一个节点，其他节点不重新渲染
- 减少 90% 的渲染次数

### 优先级 3：虚拟滚动 ⭐⭐

```typescript
// App.tsx
const [visibleNodeIds, setVisibleNodeIds] = useState<Set<string>>(new Set());

useEffect(() => {
    const updateVisibleNodes = () => {
        const viewportRect = {
            left: -pan.x / scale,
            top: -pan.y / scale,
            right: (-pan.x + window.innerWidth) / scale,
            bottom: (-pan.y + window.innerHeight) / scale,
        };
        
        const visible = new Set<string>();
        nodes.forEach(node => {
            if (isNodeInViewport(node, viewportRect)) {
                visible.add(node.id);
            }
        });
        
        setVisibleNodeIds(visible);
    };
    
    updateVisibleNodes();
    
    // 监听滚动和缩放
    const throttledUpdate = throttle(updateVisibleNodes, 100);
    window.addEventListener('scroll', throttledUpdate);
    return () => window.removeEventListener('scroll', throttledUpdate);
}, [nodes, pan, scale]);

// 只渲染可见节点
{nodes.map(node => {
    const isVisible = visibleNodeIds.has(node.id);
    if (!isVisible) return null;  // 不可见的不渲染
    
    return <Node key={node.id} node={node} ... />;
})}
```

**效果：**
- 只渲染可见节点
- 100 个节点，只渲染 10-20 个
- 减少 80-90% 的 DOM 节点

### 优先级 4：数据结构优化 ⭐

```typescript
// App.tsx
// 使用 Map 而不是 Array
const [nodesMap, setNodesMap] = useState<Map<string, AppNode>>(new Map());
const [connectionsMap, setConnectionsMap] = useState<Map<string, string[]>>(new Map());

// O(1) 查找
const node = nodesMap.get(nodeId);

// O(1) 更新
const updateNode = (nodeId: string, data: any) => {
    setNodesMap(prev => {
        const newMap = new Map(prev);
        const node = newMap.get(nodeId);
        if (node) {
            newMap.set(nodeId, { ...node, data: { ...node.data, ...data } });
        }
        return newMap;
    });
};
```

**效果：**
- 查找速度：O(n) → O(1)
- 100 个节点，查找速度提升 100 倍

---

## 完整的性能优化路线图

### 第一阶段：紧急修复（已完成）✅
1. ✅ 图片压缩 - 缩略图
2. ✅ Three.js 清理
3. ✅ 延迟创建

### 第二阶段：核心优化（1-2 周）⭐⭐⭐
4. **图片 URL 化** - 使用 Blob URL 而不是 base64
5. **React.memo** - 防止不必要的重新渲染
6. **虚拟滚动** - 只渲染可见节点

### 第三阶段：深度优化（1-2 月）⭐⭐
7. **数据结构优化** - 使用 Map 而不是 Array
8. **Canvas 渲染** - 使用 Canvas 渲染节点
9. **Web Worker** - 更多操作移到 Worker

### 第四阶段：架构升级（3-6 月）⭐
10. **后端服务** - 添加本地后端服务
11. **流式传输** - 图片流式加载
12. **增量更新** - 只更新变化的部分

---

## 立即可实施的代码

### 1. 图片 URL 化（最重要）

```typescript
// services/fileServer.ts（新建）
export const saveImageToFile = async (base64: string, nodeId: string): Promise<string> => {
    const blob = await fetch(base64).then(r => r.blob());
    const { saveToStorage } = await import('./storage');
    await saveToStorage(`image-${nodeId}`, blob);
    const blobUrl = URL.createObjectURL(blob);
    return blobUrl;
};

export const loadImageFromFile = async (nodeId: string): Promise<string> => {
    const { loadFromStorage } = await import('./storage');
    const blob = await loadFromStorage(`image-${nodeId}`);
    if (!blob) throw new Error('Image not found');
    return URL.createObjectURL(blob);
};

export const deleteImageFile = async (nodeId: string): Promise<void> => {
    const { deleteFromStorage } = await import('./storage');
    await deleteFromStorage(`image-${nodeId}`);
};
```

```typescript
// App.tsx - 修改图片存储
const base64Images = await downloadImagesInBatch(res);
const thumbnails = await generateThumbnailsInBatch(base64Images, 512);

// 保存到 IndexedDB，返回 Blob URL
const { saveImageToFile } = await import('./services/fileServer');
const previewUrls = await Promise.all(
    thumbnails.map((img, i) => saveImageToFile(img, `${id}-preview-${i}`))
);

handleNodeUpdate(id, { 
    gridImageUrls: previewUrls,  // 只存 URL
    imageUrl: previewUrls[0]
});
```

### 2. React.memo 优化

```typescript
// components/Node.tsx
export const Node = React.memo<NodeProps>(({ node, onUpdate, ... }) => {
    // ... 组件逻辑 ...
}, (prevProps, nextProps) => {
    // 只比较必要的属性
    return (
        prevProps.node.id === nextProps.node.id &&
        prevProps.node.x === nextProps.node.x &&
        prevProps.node.y === nextProps.node.y &&
        prevProps.node.width === nextProps.node.width &&
        prevProps.node.height === nextProps.node.height &&
        prevProps.node.data === nextProps.node.data &&
        prevProps.node.status === nextProps.node.status
    );
});
```

---

## 预期效果对比

### 当前（第一阶段修复后）
| 节点数 | 内存占用 | 渲染性能 |
|--------|---------|---------|
| 10 | 5-10MB | 流畅 |
| 50 | 25-50MB | 可接受 |
| 100 | 50-100MB | 有点卡 |

### 实施第二阶段后
| 节点数 | 内存占用 | 渲染性能 |
|--------|---------|---------|
| 10 | < 1MB | 非常流畅 |
| 50 | < 5MB | 流畅 |
| 100 | < 10MB | 流畅 |
| 500 | < 50MB | 可接受 |

### 实施第三阶段后
| 节点数 | 内存占用 | 渲染性能 |
|--------|---------|---------|
| 100 | < 5MB | 非常流畅 |
| 500 | < 25MB | 流畅 |
| 1000 | < 50MB | 可接受 |

---

## 总结

### Lovart/ComfyUI 的核心优势

1. **图片不在内存中** - 使用文件系统/URL
2. **懒加载** - 只加载可见内容
3. **增量更新** - 只更新变化的部分
4. **Canvas 渲染** - 比 DOM 快
5. **后端处理** - 重任务在后端

### 我们的改进方向

**立即实施（第二阶段）：**
1. ⭐⭐⭐ 图片 URL 化（最重要）
2. ⭐⭐ React.memo 优化
3. ⭐⭐ 虚拟滚动

**中期实施（第三阶段）：**
4. ⭐⭐ 数据结构优化
5. ⭐ Canvas 渲染
6. ⭐ Web Worker 扩展

**长期实施（第四阶段）：**
7. ⭐ 后端服务
8. ⭐ 流式传输
9. ⭐ 增量更新

### 关键点

**最重要的优化：图片 URL 化**
- 从存储 base64 → 存储 Blob URL
- 内存占用减少 99%
- 这是 Lovart/ComfyUI 性能好的核心原因

**第二重要：虚拟滚动**
- 只渲染可见节点
- 100 个节点只渲染 10-20 个
- 性能提升 5-10 倍

**第三重要：React.memo**
- 防止不必要的重新渲染
- 更新一个节点，其他节点不动
- 性能提升 10-100 倍

---

**下一步：实施第二阶段的图片 URL 化！这是性能提升的关键。**
