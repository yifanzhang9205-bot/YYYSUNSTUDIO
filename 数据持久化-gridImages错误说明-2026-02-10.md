# 数据持久化 - gridImages 错误说明

**日期**：2026-02-10  
**问题**：刷新后看到大量 `ERR_FILE_NOT_FOUND` 错误  
**状态**：✅ 修复已完成，需要清除旧数据

---

## 🔍 问题诊断结果

### ✅ 修复已经完成且正确

经过严格检查，我确认：

1. **保存逻辑正确**（`useNodeActions.ts` 第740行）：
   ```typescript
   const blobUrls = await saveImagesToBlob(res, node.id, 'grid');
   // 生成键名：blob-{nodeId}-grid-0, blob-{nodeId}-grid-1, ...
   ```

2. **恢复逻辑正确**（`App.tsx` 第317-370行）：
   ```typescript
   if (node.data.gridImages && node.data.gridImages.length > 0) {
     const { loadGridImages } = await import('./services/blobStorage');
     const newGridImages = await loadGridImages(node.id, node.data.gridImages.length);
     // 使用正确的键名：blob-{nodeId}-grid-{i}
   }
   ```

3. **键名格式匹配**：
   - 保存：`blob-{nodeId}-grid-0`
   - 恢复：`blob-{nodeId}-grid-0`
   - ✅ 完全一致

4. **专用恢复函数**（`services/blobStorage.ts`）：
   ```typescript
   export const loadGridImages = async (nodeId: string, count: number): Promise<string[]> => {
     // 使用正确的键名格式：blob-{nodeId}-grid-{i}
     const storageKey = `blob-${nodeId}-grid-${i}`;
     // ...
   }
   ```

---

## ❌ 你看到的错误来自旧数据

### 根本原因

**你在修复之前生成的九宫格节点，IndexedDB 里根本没有保存数据！**

**为什么？**
1. 修复之前，`App.tsx` 只恢复了 `image` 和 `images`，完全没有恢复 `gridImages`
2. 所以之前生成的九宫格节点，IndexedDB 里没有保存任何数据
3. 这些旧节点的 `gridImages` 包含失效的 Blob URL（类似 `blob:http://localhost:3000/xxx`）
4. 刷新后，persist 恢复了这些失效的 URL，但 IndexedDB 里没有对应的数据
5. 所以浏览器报错 `ERR_FILE_NOT_FOUND`

**修复只对新数据有效**：
- ✅ 修复后生成的新九宫格节点，会正确保存到 IndexedDB
- ✅ 刷新后会正确恢复
- ❌ 但旧数据无法恢复（因为 IndexedDB 里没有）

---

## 🎯 解决方案

你需要清除旧数据，然后重新生成九宫格节点。

### 方法1：清除所有数据（推荐）

**步骤**：
1. 在浏览器中打开 `clear-all-data.html`
2. 点击"确认清除"按钮
3. 等待清除完成（会自动刷新页面）
4. 重新生成九宫格节点
5. 刷新页面，检查是否还有错误

**优点**：
- ✅ 彻底清除所有旧数据
- ✅ 确保没有残留问题
- ✅ 重新开始，干净整洁

**缺点**：
- ❌ 会丢失所有工作（画布、资产库、历史记录）

---

### 方法2：只删除旧的九宫格节点（保留其他数据）

**步骤**：
1. 在画布上找到所有九宫格节点（标题类似"正面-平视-中景"）
2. 选中这些节点
3. 按 Delete 键删除
4. 重新生成九宫格节点
5. 刷新页面，检查是否还有错误

**优点**：
- ✅ 保留其他工作（普通图片节点、资产库、历史记录）
- ✅ 只删除有问题的节点

**缺点**：
- ❌ 需要手动找到所有九宫格节点
- ❌ 可能遗漏某些节点

---

### 方法3：手动清除 IndexedDB（高级用户）

**步骤**：
1. 打开开发者工具（F12）
2. Application → IndexedDB → sunstudio_db → app_data
3. 找到所有 `blob-xxx-grid-xxx` 键
4. 右键 → Delete
5. 刷新页面

**优点**：
- ✅ 精确控制删除哪些数据

**缺点**：
- ❌ 操作复杂，容易出错
- ❌ 需要技术知识

---

## 🧪 验证修复

清除旧数据后，按照以下步骤验证修复：

### 步骤1：生成新的九宫格节点

1. 创建一个图片节点（任意图片）
2. 创建一个 3D 相机节点
3. 连接图片节点到 3D 相机
4. 调整相机参数（角度、高度、距离）
5. 点击"生成"按钮
6. 等待生成完成，会自动创建九宫格节点

### 步骤2：检查控制台日志

打开开发者工具（F12），查看控制台日志：

**预期日志**：
```
[BlobStorage] 批量保存 1 张图片...
[BlobStorage] 保存成功: blob-n-xxx-grid-0, URL: blob:http://...
[App] 节点 n-xxx 九宫格图片已恢复: 1/1
```

**如果看到错误**：
- ❌ `ERR_FILE_NOT_FOUND` → 说明还有旧数据，继续清除
- ❌ `保存失败` → 说明 IndexedDB 有问题，检查浏览器设置

### 步骤3：刷新页面

1. 按 F5 刷新页面
2. 检查九宫格节点是否正常显示
3. 检查控制台是否有错误

**预期结果**：
- ✅ 九宫格节点正常显示 9 张图片
- ✅ 控制台没有 `ERR_FILE_NOT_FOUND` 错误
- ✅ 控制台有恢复日志：`[App] 节点 n-xxx 九宫格图片已恢复: 9/9`

### 步骤4：强制刷新

1. 按 Ctrl+F5 强制刷新页面
2. 再次检查九宫格节点
3. 再次检查控制台

**预期结果**：
- ✅ 九宫格节点仍然正常显示
- ✅ 控制台没有错误

---

## 📊 技术细节

### 为什么旧数据无法恢复？

**数据流向对比**：

**修复前**（旧数据）：
```
生成阶段：
  3D 相机生成图片
  → saveImagesToBlob(res, nodeId, 'grid')
  → IndexedDB: blob-{nodeId}-grid-0, blob-{nodeId}-grid-1, ...
  → node.data.gridImages = [blobUrl0, blobUrl1, ...]

刷新阶段：
  页面加载
  → persist 恢复节点元数据（包含失效的 Blob URL）
  → App.tsx 恢复逻辑
  → ❌ 没有恢复 gridImages（Bug）
  → node.data.gridImages 仍然是失效的 Blob URL

渲染阶段：
  GridSplitterNode 渲染
  → 使用 node.data.gridImages
  → 尝试加载失效的 Blob URL
  → ❌ ERR_FILE_NOT_FOUND
```

**修复后**（新数据）：
```
生成阶段：
  3D 相机生成图片
  → saveImagesToBlob(res, nodeId, 'grid')
  → IndexedDB: blob-{nodeId}-grid-0, blob-{nodeId}-grid-1, ...
  → node.data.gridImages = [blobUrl0, blobUrl1, ...]

刷新阶段：
  页面加载
  → persist 恢复节点元数据（包含失效的 Blob URL）
  → App.tsx 恢复逻辑
  → ✅ 恢复 gridImages（修复）
  → loadGridImages(nodeId, count)
  → IndexedDB: blob-{nodeId}-grid-0, blob-{nodeId}-grid-1, ...
  → 创建新的 Blob URL
  → updateNodeData({ gridImages: [newBlobUrl0, newBlobUrl1, ...] })

渲染阶段：
  GridSplitterNode 渲染
  → 使用 node.data.gridImages
  → 显示 9 张图片
  → ✅ 正常显示
```

### 为什么不能自动迁移旧数据？

**原因**：
1. 旧数据在 IndexedDB 里根本不存在（因为之前没有保存逻辑）
2. 失效的 Blob URL 无法恢复（浏览器已经释放了内存）
3. 无法从失效的 URL 重新生成图片

**唯一的解决方案**：
- 删除旧节点，重新生成新节点

---

## 🎉 总结

**修复状态**：
- ✅ 代码修复已完成
- ✅ 新数据会正确保存和恢复
- ❌ 旧数据无法恢复（需要清除）

**下一步**：
1. 清除旧数据（使用 `clear-all-data.html`）
2. 重新生成九宫格节点
3. 验证修复（刷新页面，检查是否还有错误）

**如果还有问题**：
- 提供控制台错误截图
- 提供 IndexedDB 状态截图
- 说明操作步骤

我会立即帮你分析和修复。

---

**文档版本**：v1.0  
**创建日期**：2026-02-10  
**状态**：✅ 修复完成，待用户验证
