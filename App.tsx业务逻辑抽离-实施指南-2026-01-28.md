# App.tsx 业务逻辑抽离 - 实施指南

## 🎯 目标

将 App.tsx 中的业务逻辑抽离到专门的 Hooks，让 App.tsx 只作为"地基"。

---

## 📋 实施步骤

### 步骤 1：在 App.tsx 顶部导入新的 Hooks

在 App.tsx 的 import 区域添加：

```typescript
// 引入新的业务逻辑 Hooks
import { useNodeHelpers } from './hooks/useNodeHelpers';
import { useAssetHistory } from './hooks/useAssetHistory';
import { useUIState } from './hooks/useUIState';
```

---

### 步骤 2：在 App 组件中使用新的 Hooks

在 `export const App = () => {` 之后，添加：

```typescript
// === 使用新的业务逻辑 Hooks ===
const { 
  getApproxNodeHeight, 
  getNodeBounds, 
  getNodeNameCN, 
  getNodeIcon 
} = useNodeHelpers();

const { 
  handleAssetGenerated, 
  downloadSelectedImagesAndClear 
} = useAssetHistory();

const { 
  contextMenu, 
  contextMenuTarget, 
  openContextMenu, 
  closeContextMenu,
  expandedMedia, 
  openMedia, 
  closeMedia,
  croppingNodeId, 
  imageToCrop, 
  startCrop, 
  endCrop 
} = useUIState();
```

---

### 步骤 3：删除已抽离的代码

#### 3.1 删除 `getApproxNodeHeight` 的定义

**删除这段代码**（约 40 行）：

```typescript
// === 辅助函数：必须在 useGroup 之前定义 ===
// 注意：不能依赖 useSelection 的 selectedNodeIds，因为 useSelection 在 useGroup 之后调用
const getApproxNodeHeight = useCallback((node: AppNode) => {
    if (node.height) return node.height;
    const width = node.width || 420;
    if (['PROMPT_INPUT', 'VIDEO_ANALYZER', 'IMAGE_EDITOR'].includes(node.type)) return 360;
    if (node.type === NodeType.AUDIO_GENERATOR) return 200;
    
    // 新增：故事创作节点的高度
    if (node.type === NodeType.STORY_STUDIO) {
        // 创意工作室：选中时展开，未选中时收起
        // 从 Store 直接获取 selectedNodeIds（避免循环依赖）
        const selectedNodeIds = useSelectionStore.getState().selectedNodeIds;
        const isSelected = selectedNodeIds.includes(node.id);
        return isSelected ? 500 : 120;
    }
    if (node.type === NodeType.CHARACTER_REFERENCE || node.type === NodeType.SCENE_REFERENCE) {
        return 400;
    }
    if (node.type === NodeType.STORYBOARD_SHOT) {
        return 450;
    }
    if (node.type === NodeType.MULTI_ANGLE_CAMERA) {
        // 多角度相机：始终展开，大尺寸显示
        return 800;
    }
    if (node.type === NodeType.GRID_SPLITTER) {
        // 九宫格处理节点
        return 480;
    }
    
    const [w, h] = (node.data.aspectRatio || '16:9').split(':').map(Number);
    const extra = (node.type === NodeType.VIDEO_GENERATOR && node.data.generationMode === 'CUT') ? 36 : 0;
    return ((width * h / w) + extra);
}, []); // 移除 selectedNodeIds 依赖，改为从 Store 直接获取
```

**替换为**：从 `useNodeHelpers()` 获取

---

#### 3.2 删除 `getNodeBounds` 的定义

**删除这段代码**（约 5 行）：

```typescript
const getNodeBounds = (node: AppNode) => {
    const h = node.height || getApproxNodeHeight(node);
    const w = node.width || 420;
    return { x: node.x, y: node.y, width: w, height: h, r: node.x + w, b: node.y + h };
};
```

**替换为**：从 `useNodeHelpers()` 获取

---

#### 3.3 删除 `getNodeNameCN` 和 `getNodeIcon` 的定义

**删除这段代码**（约 30 行）：

```typescript
// === 使用 NodeRegistry 获取节点名称和图标（架构重构 - 阶段 A - 第 2 步）===
const getNodeNameCN = useCallback((t: string) => {
    return getNodeName(t as NodeType);
}, []);

const getNodeIcon = useCallback((t: string) => {
    const iconName = getNodeIconName(t as NodeType);
    // 映射图标名称到实际的图标组件
    const iconMap: Record<string, any> = {
        'Type': Type,
        'Image': ImageIcon,
        'Video': Film,
        'Music': Mic2,
        'ScanFace': ScanFace,
        'Brush': Brush,
        'Sparkles': Sparkles,
        'User': ScanFace,
        'MapPin': LayoutTemplate,
        'Camera': Film,
        'LayoutTemplate': LayoutTemplate,
        'Grid3X3': Grid3X3,
        'Film': Film,
    };
    return iconMap[iconName || ''] || Plus;
}, []);
```

**替换为**：从 `useNodeHelpers()` 获取

---

#### 3.4 删除 `handleAssetGenerated` 的定义

**删除这段代码**（约 25 行）：

```typescript
const handleAssetGenerated = useCallback(async (type: 'image' | 'video' | 'audio', src: string, title: string) => {
    // 性能优化：如果是 Blob URL，将 Blob 存储到 IndexedDB（页面刷新后可恢复）
    let assetId = `a-${Date.now()}`;
    
    if (src.startsWith('blob:')) {
        try {
            // 从 Blob URL 获取 Blob
            const response = await fetch(src);
            const blob = await response.blob();
            
            // 存储到 IndexedDB
            await saveToStorage(`asset-${assetId}`, blob);
        } catch (error) {
            console.error('[AssetHistory] 保存 Blob 失败:', error);
        }
    }
    
    // 使用 Store 的 addHistory 方法
    const exists = assetHistory.find(a => a.src === src);
    if (!exists) {
        addHistory({ id: assetId, type, src, title, timestamp: Date.now() });
    }
}, []);
```

**替换为**：从 `useAssetHistory()` 获取

---

#### 3.5 删除 `downloadSelectedImagesAndClear` 的定义

**删除这段代码**（约 70 行）：

```typescript
// 批量下载选中的图片并清除
const downloadSelectedImagesAndClear = useCallback(async (selectedIds: Set<string>) => {
    if (selectedIds.size === 0) return;
    
    // 收集要下载的图片
    const assetsToDownload = assetHistory.filter(a => selectedIds.has(a.id));
    
    if (assetsToDownload.length === 0) return;
    
    try {
        if (assetsToDownload.length === 1) {
            // 单张图片：直接下载
            const asset = assetsToDownload[0];
            const a = document.createElement('a');
            a.href = asset.src;
            a.download = `${asset.title || 'image'}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } else {
            // 多张图片：打包成 ZIP 下载
            const JSZip = (await import('jszip')).default;
            const zip = new JSZip();
            
            // 将所有图片添加到 ZIP
            for (let i = 0; i < assetsToDownload.length; i++) {
                const asset = assetsToDownload[i];
                try {
                    const response = await fetch(asset.src);
                    const blob = await response.blob();
                    const filename = `${i + 1}-${asset.title || 'image'}.png`;
                    zip.file(filename, blob);
                } catch (error) {
                    console.error(`[AssetHistory] 下载 ${asset.title} 失败:`, error);
                }
            }
            
            // 生成 ZIP 并下载
            const zipBlob = await zip.generateAsync({ type: 'blob' });
            const zipUrl = URL.createObjectURL(zipBlob);
            const a = document.createElement('a');
            a.href = zipUrl;
            a.download = `images-${Date.now()}.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(zipUrl);
        }
        
        // 下载完成后，清除选中的图片
        const newAssetHistory = assetHistory.filter(a => !selectedIds.has(a.id));
        setAssetHistory(newAssetHistory);
        
        // 立即保存到 localStorage（不等待 useEffect）
        await saveToStorage('assets', newAssetHistory);
        
        // 清理 Blob URL（避免内存泄漏）
        assetsToDownload.forEach(asset => {
            if (asset.src && asset.src.startsWith('blob:')) {
                URL.revokeObjectURL(asset.src);
            }
        });
    } catch (error) {
        console.error('[AssetHistory] 批量下载失败:', error);
    }
}, [assetHistory]);
```

**替换为**：从 `useAssetHistory()` 获取

---

#### 3.6 删除 UI 状态的定义

**删除这段代码**（约 10 行）：

```typescript
// Context Menu
const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
const [contextMenuTarget, setContextMenuTarget] = useState<any>(null);

// Media Overlays
const [expandedMedia, setExpandedMedia] = useState<any>(null);
const [croppingNodeId, setCroppingNodeId] = useState<string | null>(null);
const [imageToCrop, setImageToCrop] = useState<string | null>(null);
```

**替换为**：从 `useUIState()` 获取

---

#### 3.7 更新 `setContextMenu` 的调用

**查找并替换**：

```typescript
// 之前
if (contextMenu) setContextMenu(null);

// 之后
if (contextMenu) closeContextMenu();
```

```typescript
// 之前
setContextMenu({ x: e.clientX, y: e.clientY, type: 'node', nodeId: id });
setContextMenuTarget(node);

// 之后
openContextMenu({ x: e.clientX, y: e.clientY, type: 'node', nodeId: id }, node);
```

---

#### 3.8 更新 `setExpandedMedia` 的调用

**查找并替换**：

```typescript
// 之前
setExpandedMedia({ src: node.data.image, type: 'image' });

// 之后
openMedia({ src: node.data.image, type: 'image' });
```

```typescript
// 之前
setExpandedMedia(null);

// 之后
closeMedia();
```

---

#### 3.9 更新 `setCroppingNodeId` 和 `setImageToCrop` 的调用

**查找并替换**：

```typescript
// 之前
setCroppingNodeId(nodeId);
setImageToCrop(image);

// 之后
startCrop(nodeId, image);
```

```typescript
// 之前
setCroppingNodeId(null);
setImageToCrop(null);

// 之后
endCrop();
```

---

### 步骤 4：测试功能

#### 4.1 测试节点辅助函数
- [ ] 节点高度计算正确
- [ ] 节点边界计算正确
- [ ] 节点名称显示正确
- [ ] 节点图标显示正确

#### 4.2 测试资源历史
- [ ] 生成图片后，历史记录正常
- [ ] 批量下载图片正常
- [ ] 下载后清除历史记录正常
- [ ] Blob URL 存储和恢复正常

#### 4.3 测试 UI 状态
- [ ] 右键菜单打开/关闭正常
- [ ] 图片预览打开/关闭正常
- [ ] 图片裁剪开始/结束正常

---

### 步骤 5：提交代码

```bash
git add hooks/useNodeHelpers.ts hooks/useAssetHistory.ts hooks/useUIState.ts App.tsx
git commit -m "重构：抽离 App.tsx 业务逻辑到专门的 Hooks（阶段 1-3）

- 创建 useNodeHelpers：节点辅助函数
- 创建 useAssetHistory：资源历史管理
- 创建 useUIState：UI 状态管理
- App.tsx 减少约 230 行代码
- 功能保持不变，只是代码位置调整"
```

---

## 📊 预期效果

### App.tsx 行数变化

- **之前**：2354 行
- **之后**：约 2124 行（减少 230 行）
- **目标**：200 行以内（还需继续抽离阶段 4-6）

### AI 行为变化

- AI 打开 App.tsx → 看到代码更简洁
- AI 想加节点辅助函数 → 去 `hooks/useNodeHelpers.ts`
- AI 想加资源处理 → 去 `hooks/useAssetHistory.ts`
- AI 想加 UI 状态 → 去 `hooks/useUIState.ts`

---

## ⚠️ 注意事项

1. **不要一次性删除所有代码**：先导入 Hooks，确认能用，再删除旧代码
2. **保持功能不变**：抽离后，所有功能应该和之前一样
3. **测试充分**：每个功能都要测试，确保没有遗漏
4. **Git 分支**：在独立分支上操作，测试通过再合并

---

**下一步**：继续抽离阶段 4-6，直到 App.tsx 只有 200 行左右。
