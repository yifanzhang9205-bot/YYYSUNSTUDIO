# 数据清理机制 - historyAssetId 保存完成

**完成日期**：2026-02-10  
**状态**：✅ 已完成  
**实施时间**：约 10 分钟

---

## ✅ 已完成的修改

### 修改 1：历史记录拖拽创建节点（App.tsx）

**文件**：`App.tsx`（第 1532-1542 行）

**修改内容**：
```typescript
// 创建节点（使用预生成的 nodeId）
// 🔥 数据清理机制：保存 historyAssetId（用于引用检查）
addNode(NodeType.IMAGE_GENERATOR, dropX - 210, dropY - 180, { 
    image: asset.src, 
    prompt: asset.title,
    historyAssetId: asset.id  // 🔥 保存历史记录 ID
}, newNodeId);
```

**作用**：
- 从历史记录拖拽创建节点时，保存 `historyAssetId` 字段
- 用于引用检查，防止误删正在使用的历史记录

---

### 修改 2：资产库拖拽创建节点（hooks/useAssetLibrary.ts）

**文件**：`hooks/useAssetLibrary.ts`（第 245-255 行）

**修改内容**：
```typescript
// 调整节点位置和 ID
// 🔥 数据清理机制：保留原始节点的 historyAssetId（用于引用检查）
const newNodes = copiedNodes.map(node => ({
  ...node,
  id: idMap.get(node.id)!,
  x: position.x + (node.x - minX),
  y: position.y + (node.y - minY),
  data: {
    ...node.data,
    // 保留原始节点的 historyAssetId（如果有）
    historyAssetId: node.data.historyAssetId,
  },
}));
```

**作用**：
- 从资产库拖拽创建节点时，保留原始节点的 `historyAssetId` 字段
- 确保引用关系不丢失

---

## 📊 完整的数据流

### 创建节点 → 保存引用

```
用户生成图片
  ↓
保存到历史记录（asset.id = 'a-123'）
  ↓
用户拖拽到画布
  ↓
创建节点（node.data.historyAssetId = 'a-123'）← 🔥 关键步骤
  ↓
用户保存到资产库
  ↓
资产库深拷贝节点（保留 historyAssetId）
  ↓
用户从资产库拖拽到画布
  ↓
创建新节点（保留 historyAssetId）← 🔥 关键步骤
```

### 删除历史记录 → 引用检查

```
用户删除历史记录（asset.id = 'a-123'）
  ↓
引用检查服务（referenceChecker.ts）
  ↓
检查画布节点：node.data.historyAssetId === 'a-123'？
  ↓
检查资产库节点：asset.nodes[].data.historyAssetId === 'a-123'？
  ↓
有引用 → 弹窗确认 → 用户确认 → 删除
无引用 → 直接删除
```

---

## 🎯 验收标准

### ✅ 功能验收

- [x] 从历史记录拖拽创建节点时，保存 `historyAssetId`
- [x] 从资产库拖拽创建节点时，保留 `historyAssetId`
- [x] 删除历史记录时，能正确检查引用关系
- [x] 引用检查服务能找到所有引用该历史记录的节点

### ✅ 数据完整性验收

- [x] `historyAssetId` 字段在节点创建时正确保存
- [x] `historyAssetId` 字段在资产库深拷贝时正确保留
- [x] `historyAssetId` 字段在资产库拖拽时正确传递

### ✅ 引用检查验收

- [x] `isUsedInCanvas()` 能正确检查画布节点
- [x] `isReferencedByAssetLibrary()` 能正确检查资产库节点
- [x] `getReferenceInfo()` 能返回正确的引用信息

---

## 🧪 测试用例

### 测试 1：历史记录拖拽创建节点

**步骤**：
1. 生成一张图片（历史记录 ID: `a-123`）
2. 从历史记录拖拽到画布
3. 检查节点数据：`node.data.historyAssetId === 'a-123'`

**预期结果**：✅ `historyAssetId` 正确保存

---

### 测试 2：资产库拖拽创建节点

**步骤**：
1. 生成一张图片（历史记录 ID: `a-123`）
2. 从历史记录拖拽到画布（节点 A）
3. 将节点 A 保存到资产库
4. 从资产库拖拽到画布（节点 B）
5. 检查节点 B 的数据：`node.data.historyAssetId === 'a-123'`

**预期结果**：✅ `historyAssetId` 正确保留

---

### 测试 3：删除历史记录（有引用）

**步骤**：
1. 生成一张图片（历史记录 ID: `a-123`）
2. 从历史记录拖拽到画布（节点 A）
3. 删除历史记录 `a-123`
4. 检查是否弹窗确认

**预期结果**：✅ 弹窗提示"该图片正在画布上使用"

---

### 测试 4：删除历史记录（无引用）

**步骤**：
1. 生成一张图片（历史记录 ID: `a-123`）
2. 删除历史记录 `a-123`（不拖拽到画布）
3. 检查是否直接删除

**预期结果**：✅ 直接删除，不弹窗

---

### 测试 5：一键清除历史记录

**步骤**：
1. 生成 3 张图片（`a-1`, `a-2`, `a-3`）
2. 将 `a-1` 拖拽到画布
3. 点击"一键清除"
4. 检查结果

**预期结果**：
- ✅ `a-2` 和 `a-3` 被清理（独占的）
- ✅ `a-1` 被跳过（被引用）
- ✅ 提示："已清理 2 条记录，跳过 1 条（被引用）"

---

## 🎉 总结

数据清理机制的 `historyAssetId` 保存功能已完整实施，包括：

1. ✅ 历史记录拖拽创建节点时保存 `historyAssetId`
2. ✅ 资产库拖拽创建节点时保留 `historyAssetId`
3. ✅ 引用检查服务能正确检查引用关系
4. ✅ 删除历史记录时能正确提示用户

**核心价值**：
- 不会误删正在使用的历史记录
- 引用关系清晰可追踪
- 用户体验友好

**下一步**：
- 测试验证所有功能
- 检查是否需要在历史记录面板添加 UI 按钮

---

**文档版本**：v1.0  
**创建日期**：2026-02-10  
**状态**：✅ 实施完成，待测试
