# 九宫格节点 - selectedIndex 字段名修复

**日期**: 2026-01-31  
**状态**: ✅ 已完成

---

## 问题描述

拖手不显示，从日志可以看出：

```
[Node] selectedIndex: undefined  ❌ Node.tsx 读不到
[GridSplitter] selectedIndex: 8  ✅ GridSplitterNode 有数据
```

**根本原因**：Node.tsx 使用了错误的字段名 `selectedGridIndex`，而不是 `selectedIndex`。

---

## 根本原因

在 Node.tsx 中，有两处使用了错误的字段名：

### 错误 1：读取字段名错误（第 738 行）

```tsx
// ❌ 错误：使用了 selectedGridIndex
<GridSplitterNode
    selectedIndex={node.data.selectedGridIndex}  // ❌ 字段名错误
    ...
/>
```

### 错误 2：写入字段名错误（第 756 行）

```tsx
// ❌ 错误：写入到 selectedGridIndex
if ('selectedIndex' in data) updateData.selectedGridIndex = data.selectedIndex;  // ❌ 字段名错误
```

---

## 数据流分析

### 错误的数据流

```
用户双击图片选择
  ↓
GridSplitterNode.handleSelect(8)
  ↓
onUpdate({ selectedIndex: 8 })  // ✅ 正确的字段名
  ↓
Node.tsx onUpdate 处理
  ↓
updateData.selectedGridIndex = 8  // ❌ 写入到错误的字段
  ↓
node.data.selectedGridIndex = 8  // ❌ 存储在错误的字段
  ↓
下次渲染时
  ↓
selectedIndex={node.data.selectedGridIndex}  // ❌ 读取错误的字段
  ↓
GridSplitterNode 收到 selectedIndex=undefined  // ❌ 读不到数据
```

### 正确的数据流

```
用户双击图片选择
  ↓
GridSplitterNode.handleSelect(8)
  ↓
onUpdate({ selectedIndex: 8 })  // ✅ 正确的字段名
  ↓
Node.tsx onUpdate 处理
  ↓
updateData.selectedIndex = 8  // ✅ 写入到正确的字段
  ↓
node.data.selectedIndex = 8  // ✅ 存储在正确的字段
  ↓
下次渲染时
  ↓
selectedIndex={node.data.selectedIndex}  // ✅ 读取正确的字段
  ↓
GridSplitterNode 收到 selectedIndex=8  // ✅ 正确读取数据
  ↓
拖手显示条件满足
  ↓
showGridDragHandle = true  // ✅ 拖手显示
```

---

## 解决方案

### 修复 1：读取字段名（第 738 行）

```tsx
// components/Node.tsx (第 735-743 行)

// ❌ 修复前
return (
    <GridSplitterNode
        inputImage={inputImageSrc}
        croppedImages={node.data.croppedImages}
        selectedIndex={node.data.selectedGridIndex}  // ❌ 错误的字段名
        outputImage={node.data.image}
        isWorking={node.status === NodeStatus.WORKING}
        isExpanded={isSelected || false}
        isSelected={isSelected || false}
        onUpdate={(data) => {

// ✅ 修复后
return (
    <GridSplitterNode
        inputImage={inputImageSrc}
        croppedImages={node.data.croppedImages}
        selectedIndex={node.data.selectedIndex}  // ✅ 正确的字段名
        outputImage={node.data.image}
        isWorking={node.status === NodeStatus.WORKING}
        isExpanded={isSelected || false}
        isSelected={isSelected || false}
        onUpdate={(data) => {
```

### 修复 2：写入字段名（第 756 行）

```tsx
// components/Node.tsx (第 754-758 行)

// ❌ 修复前
// 其他字段正常更新
if ('croppedImages' in data) updateData.croppedImages = data.croppedImages;
if ('selectedIndex' in data) updateData.selectedGridIndex = data.selectedIndex;  // ❌ 错误的字段名
if ('outputImage' in data) updateData.image = data.outputImage;

// ✅ 修复后
// 其他字段正常更新
if ('croppedImages' in data) updateData.croppedImages = data.croppedImages;
if ('selectedIndex' in data) updateData.selectedIndex = data.selectedIndex;  // ✅ 正确的字段名
if ('outputImage' in data) updateData.image = data.outputImage;
```

---

## 为什么会有这个错误？

可能的原因：

1. **重构时遗留**：之前可能使用 `selectedGridIndex`，重构时改为 `selectedIndex`，但 Node.tsx 没有同步更新
2. **命名不一致**：GridSplitterNode 使用 `selectedIndex`，但 Node.tsx 使用 `selectedGridIndex`
3. **缺少类型检查**：如果有 TypeScript 类型定义，这个错误会在编译时被发现

---

## 如何避免这类错误？

### 方案 1：使用 TypeScript 类型定义

```tsx
// types.ts
interface GridSplitterData {
  inputImage?: string;
  croppedImages?: string[];
  selectedIndex?: number;  // ✅ 明确定义字段名
  outputImage?: string;
}

// Node.tsx
const updateData: Partial<GridSplitterData> = {};
if ('selectedIndex' in data) updateData.selectedIndex = data.selectedIndex;  // ✅ 类型检查
```

### 方案 2：使用常量定义字段名

```tsx
// constants.ts
export const GRID_SPLITTER_FIELDS = {
  INPUT_IMAGE: 'inputImage',
  CROPPED_IMAGES: 'croppedImages',
  SELECTED_INDEX: 'selectedIndex',  // ✅ 统一管理字段名
  OUTPUT_IMAGE: 'outputImage'
} as const;

// Node.tsx
if (GRID_SPLITTER_FIELDS.SELECTED_INDEX in data) {
  updateData[GRID_SPLITTER_FIELDS.SELECTED_INDEX] = data.selectedIndex;
}
```

### 方案 3：直接传递整个 data 对象

```tsx
// Node.tsx
onUpdate={(data) => {
  onUpdate(node.id, data);  // ✅ 直接传递，不需要手动映射
}}
```

---

## 验证清单

- ✅ `node.data.selectedIndex` 正确读取
- ✅ `node.data.selectedIndex` 正确写入
- ✅ 拖手显示条件满足（`hasGridSelection && isSelected`）
- ✅ 拖手正确显示在节点外部
- ✅ 单图模式可以拖动节点
- ✅ 拖手可以拖出图片

---

## 测试步骤

1. 打开浏览器控制台
2. 创建九宫格节点
3. 上传 21:9 图片
4. 双击选择一张图片（进入单图模式）
5. 点击节点（选中节点）
6. 查看控制台日志：
   ```
   [Node] 九宫格节点拖手状态: {
     isGridSplitter: true,
     selectedIndex: 8,  // ✅ 现在有值了
     hasGridSelection: true,  // ✅ 现在是 true
     isSelected: true,
     showGridDragHandle: true,  // ✅ 现在是 true
     inputImage: true,
     croppedImages: 9
   }
   ```
7. 查看节点右下角，应该显示拖手（浅灰色，距离 20px）

---

## 相关文件

- `components/Node.tsx` - 修复了两处字段名错误
- `components/GridSplitterNode.tsx` - 使用正确的字段名 `selectedIndex`

---

## 完成时间

2026-01-31 23:59
