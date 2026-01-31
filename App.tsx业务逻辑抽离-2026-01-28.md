# App.tsx 业务逻辑抽离 - 2026-01-28

## 🎯 目标

彻底解决 AI 总是想修改 App.tsx 的问题，让 App.tsx 只作为"地基"，不包含任何业务逻辑。

---

## 📊 抽离计划

### ✅ 阶段 1：抽离辅助函数（已完成）

**创建文件**：`hooks/useNodeHelpers.ts`

**抽离内容**：
- `getImageDimensions` - 获取图片尺寸
- `getApproxNodeHeight` - 计算节点近似高度
- `getNodeBounds` - 获取节点边界
- `getNodeNameCN` - 获取节点中文名称
- `getNodeIcon` - 获取节点图标

**App.tsx 减少行数**：约 80 行

---

### ✅ 阶段 2：抽离资源历史逻辑（已完成）

**创建文件**：`hooks/useAssetHistory.ts`

**抽离内容**：
- `handleAssetGenerated` - 处理资源生成（图片、视频、音频）
- `downloadSelectedImagesAndClear` - 批量下载选中的图片并清除

**App.tsx 减少行数**：约 100 行

---

### ✅ 阶段 3：抽离 UI 状态逻辑（已完成）

**创建文件**：`hooks/useUIState.ts`

**抽离内容**：
- 右键菜单：`contextMenu`、`contextMenuTarget`、`openContextMenu`、`closeContextMenu`
- 图片预览：`expandedMedia`、`openMedia`、`closeMedia`
- 图片裁剪：`croppingNodeId`、`imageToCrop`、`startCrop`、`endCrop`

**App.tsx 减少行数**：约 50 行

---

### ⏳ 阶段 4：抽离画布交互逻辑（待实施）

**创建文件**：`hooks/useCanvasInteraction.ts`

**抽离内容**：
- `handleSketchResult` - 处理草图结果
- `handleMultiFrameGenerate` - 处理多帧生成
- `handleCanvasMouseDown` - 画布鼠标按下
- `handleCanvasDragOver` - 画布拖拽悬停
- `handleCanvasDrop` - 画布拖拽放下

**预计减少行数**：约 100 行

---

### ⏳ 阶段 5：抽离全局事件处理（待实施）

**创建文件**：`hooks/useGlobalEvents.ts`

**抽离内容**：
- `handleGlobalMouseMove` - 全局鼠标移动（RAF 节流）
- `handleGlobalMouseUp` - 全局鼠标抬起

**预计减少行数**：约 150 行

---

### ⏳ 阶段 6：抽离节点操作逻辑（待实施，最高风险）

**创建文件**：`hooks/useNodeActions.ts`

**抽离内容**：
- `handleNodeUpdate` - 更新节点数据
- `handleNodeAction` - 节点操作（400+ 行的 switch-case）
- `handleReplaceFile` - 替换文件
- `createWorkflowFromScript` - 从剧本创建工作流

**预计减少行数**：约 600 行

---

## 📈 进度统计

### 当前状态

| 阶段 | 状态 | 减少行数 | 累计减少 |
|------|------|---------|---------|
| 阶段 1：辅助函数 | ✅ 已完成 | 80 行 | 80 行 |
| 阶段 2：资源历史 | ✅ 已完成 | 100 行 | 180 行 |
| 阶段 3：UI 状态 | ✅ 已完成 | 50 行 | 230 行 |
| 阶段 4：画布交互 | ⏳ 待实施 | 100 行 | 330 行 |
| 阶段 5：全局事件 | ⏳ 待实施 | 150 行 | 480 行 |
| 阶段 6：节点操作 | ⏳ 待实施 | 600 行 | 1080 行 |

**当前 App.tsx 行数**：2354 行
**已减少**：230 行（估算）
**预计最终行数**：约 1274 行（仍需继续抽离）

**目标行数**：200 行以内

---

## 🔄 下一步

### 立即执行：修改 App.tsx，使用新的 Hooks

需要在 App.tsx 中：
1. 导入新的 Hooks
2. 替换原有的函数和状态
3. 删除已抽离的代码

### 然后继续：阶段 4-6

继续抽离剩余的业务逻辑，直到 App.tsx 只有 200 行左右。

---

## ✅ 验收标准

### 功能验收
- [ ] 所有节点操作正常
- [ ] 右键菜单正常
- [ ] 图片预览/裁剪正常
- [ ] 资源历史记录正常
- [ ] 拖拽、框选、连线正常

### 架构验收
- [ ] App.tsx 只有 200 行左右
- [ ] App.tsx 只包含：初始化、获取数据、使用 Hooks、渲染组件
- [ ] 所有业务逻辑都在专门的 Hook 里
- [ ] 每个 Hook 职责单一、清晰

### AI 行为验收
- [ ] AI 打开 App.tsx 时，能立即看出"这里不是加功能的地方"
- [ ] AI 想加新功能时，能自然地去正确的 Hook
- [ ] AI 不再频繁修改 App.tsx

---

## 📝 注意事项

1. **渐进式抽离**：一次抽离一个模块，测试通过后再继续
2. **保持接口不变**：对外接口不变，只改实现位置
3. **保持数据流不变**：UI → Hooks → Stores，不变
4. **保持性能优化**：RAF、Blob URL 等优化，不变
5. **Git 分支管理**：每次抽离在独立分支，测试通过再合并

---

**记住：这不是重构，这是清理。我们只是把代码放到正确的位置。**
