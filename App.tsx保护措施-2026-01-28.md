# App.tsx 保护措施实施完成 - 2026-01-28

## 🎯 目标

解决 AI 总是想修改 App.tsx 的问题。

---

## 🔍 问题分析

### 根本原因

1. **App.tsx 仍然包含大量业务逻辑**
   - `handleNodeAction`：400+ 行的 switch-case
   - `handleAssetGenerated`：资源生成处理
   - `downloadSelectedImagesAndClear`：下载图片逻辑
   - `handleArrangeGroup`：组内节点整理
   - `handleGlobalMouseMove`：全局鼠标移动
   - `handleGlobalMouseUp`：全局鼠标抬起
   - `createWorkflowFromScript`：从剧本创建工作流

2. **代码模式"诱导" AI**
   - 集中式的 Handler 函数（所有节点操作都在 handleNodeAction）
   - 集中式的 State（contextMenu、expandedMedia、croppingNodeId）
   - 集中式的 Event Handlers（handleGlobalMouseMove、handleGlobalMouseUp）

3. **重构未完成**
   - 当前进度：70%
   - Hooks 已抽离，但业务逻辑未抽离
   - App.tsx 仍有 2354 行（目标：200 行以内）

4. **AI 的惯性思维**
   - 看到逻辑在 App.tsx，就觉得新逻辑也应该在这里
   - 看到 handleNodeAction 处理所有节点，就觉得新节点也应该加 case

---

## ✅ 实施的解决方案

### 方案 1：在 App.tsx 顶部添加超级警告

**位置**：`App.tsx` 第 1 行

**内容**：
- 🚫 禁止在此文件添加任何业务逻辑
- 📋 App.tsx 的唯一职责（初始化、获取数据、使用 Hooks、渲染组件）
- ❌ 禁止的操作（添加 useCallback、useState、switch-case、事件处理）
- ✅ 正确的做法（新节点 → NodeRegistry、新交互 → Hooks、新状态 → Stores）
- 📖 详细规则（ARCHITECTURE.md、project-onboarding.md、requirements.md）
- 🤖 AI 看到警告后的步骤（停止、重新思考、查看文档、等待确认）
- 🔥 当前状态（2354 行，包含大量业务逻辑）
- 🎯 下一步重构计划（抽离 handleNodeAction、contextMenu、mediaOverlay、globalEvents）
- ⚠️ 修改前必须回答的问题（为什么、怎么动、有什么后果、用户同意了吗）
- 💡 为什么 AI 总是想改 App.tsx（4 个原因）

**效果**：
- AI 每次打开 App.tsx 都会看到警告
- 提醒 AI "这是禁区，不能随便改"
- 提供明确的替代方案

---

### 方案 2：修改 project-onboarding.md，架构文档放第一位

**修改内容**：

#### 1. 调整阅读顺序

**之前**：
```
第 0 步：阅读重构需求文档（requirements.md）
第 1 步：阅读架构文档（ARCHITECTURE.md）
```

**之后**：
```
第 0 步：阅读架构文档（ARCHITECTURE.md）🔴🔴🔴 最高优先级
第 1 步：阅读重构需求文档（requirements.md）🔴 第二优先级
```

**原因**：
- 架构文档告诉 AI "什么能改、什么不能改"
- 架构文档告诉 AI "新功能应该加在哪里"
- 先知道规则，再看需求，才不会乱改

#### 2. 强化架构文档的重要性

添加了：
- ⚠️ 强制要求：必须从头到尾完整阅读，不能只读部分
- 📋 阅读后必须回答 7 个问题（确保真的理解了）
- 💡 为什么这份文档最重要（4 个原因）

#### 3. 更新检查清单

**之前**：
```
- [ ] 🔴 已完整阅读 requirements.md（最高优先级）
- [ ] 已完整阅读 ARCHITECTURE.md
```

**之后**：
```
- [ ] 🔴🔴🔴 已完整阅读 ARCHITECTURE.md（最高优先级，必须最先阅读）
- [ ] 🔴 已完整阅读 requirements.md（第二优先级）
```

#### 4. 更新快速参考

**之前**：
```
1. 重构需求文档（最高优先级）
2. 架构文档（第二个阅读）
```

**之后**：
```
1. 架构文档（最高优先级，必须最先阅读）🔴🔴🔴
2. 重构需求文档（第二优先级）🔴
```

---

## 📊 预期效果

### 短期效果（立即生效）

1. **AI 打开 App.tsx 时会看到警告**
   - 提醒 AI "这是禁区"
   - 提供明确的替代方案
   - 减少 AI 直接修改 App.tsx 的冲动

2. **AI 入职时会先读架构文档**
   - 知道什么能改、什么不能改
   - 知道新功能应该加在哪里
   - 减少因不了解规则而乱改代码

### 长期效果（需要继续重构）

1. **继续抽离业务逻辑**
   - 创建 `hooks/useNodeActions.ts`，抽离 handleNodeAction
   - 创建 `hooks/useContextMenu.ts`，抽离右键菜单逻辑
   - 创建 `hooks/useMediaOverlay.ts`，抽离图片预览/裁剪逻辑
   - 创建 `hooks/useGlobalEvents.ts`，抽离全局事件处理

2. **App.tsx 最终状态**
   - 行数：200 行以内
   - 职责：只做组合和配置
   - 内容：初始化 + 获取数据 + 使用 Hooks + 渲染组件

---

## 🔧 下一步重构计划

### 阶段 1：抽离 handleNodeAction（优先级最高）

**目标**：把 400+ 行的 handleNodeAction 移到 `hooks/useNodeActions.ts`

**步骤**：
1. 创建 `hooks/useNodeActions.ts`
2. 把 handleNodeAction 移过去
3. 在 App.tsx 中使用 `const { handleNodeAction } = useNodeActions()`
4. 测试所有节点操作是否正常

**预期效果**：
- App.tsx 减少 400+ 行
- 节点操作逻辑集中管理
- 以后添加新节点类型，改 useNodeActions.ts，不改 App.tsx

---

### 阶段 2：抽离右键菜单逻辑

**目标**：把右键菜单逻辑移到 `hooks/useContextMenu.ts`

**步骤**：
1. 创建 `hooks/useContextMenu.ts`
2. 把 contextMenu、contextMenuTarget 移过去
3. 把右键菜单的打开/关闭逻辑移过去
4. 在 App.tsx 中使用 `const { contextMenu, openContextMenu, closeContextMenu } = useContextMenu()`

**预期效果**：
- App.tsx 减少 50+ 行
- 右键菜单逻辑集中管理

---

### 阶段 3：抽离图片预览/裁剪逻辑

**目标**：把图片预览/裁剪逻辑移到 `hooks/useMediaOverlay.ts`

**步骤**：
1. 创建 `hooks/useMediaOverlay.ts`
2. 把 expandedMedia、croppingNodeId、imageToCrop 移过去
3. 把图片预览/裁剪的打开/关闭逻辑移过去
4. 在 App.tsx 中使用 `const { expandedMedia, openMedia, closeMedia } = useMediaOverlay()`

**预期效果**：
- App.tsx 减少 50+ 行
- 图片处理逻辑集中管理

---

### 阶段 4：抽离全局事件处理

**目标**：把全局事件处理移到 `hooks/useGlobalEvents.ts`

**步骤**：
1. 创建 `hooks/useGlobalEvents.ts`
2. 把 handleGlobalMouseMove、handleGlobalMouseUp 移过去
3. 把事件监听的注册/注销移过去
4. 在 App.tsx 中使用 `useGlobalEvents()`

**预期效果**：
- App.tsx 减少 100+ 行
- 全局事件逻辑集中管理

---

### 最终目标

**App.tsx 应该只有：**

```typescript
export const App = () => {
  // 1. 初始化
  useEffect(() => {
    initializeNodeRegistry();
  }, []);
  
  // 2. 获取 Stores 数据
  const nodes = useNodeStore(state => state.nodes);
  const connections = useConnectionStore(state => state.connections);
  // ...
  
  // 3. 使用 Hooks
  const viewport = useViewport({ nodes });
  const selection = useSelection({ nodes });
  const drag = useDrag({ scale });
  const connection = useConnection({ nodes, connections });
  const group = useGroup({ groups, nodes });
  const nodeActions = useNodeActions();
  const contextMenu = useContextMenu();
  const mediaOverlay = useMediaOverlay();
  useGlobalEvents();
  
  // 4. 渲染
  return (
    <div>
      <Canvas />
      <Sidebar />
      {/* ... */}
    </div>
  );
};
```

**目标行数**：200 行以内

---

## 📝 总结

### 已完成

1. ✅ 在 App.tsx 顶部添加超级警告
2. ✅ 修改 project-onboarding.md，架构文档放第一位
3. ✅ 强化架构文档的重要性
4. ✅ 更新检查清单和快速参考

### 待完成

1. ⏳ 创建 `hooks/useNodeActions.ts`，抽离 handleNodeAction
2. ⏳ 创建 `hooks/useContextMenu.ts`，抽离右键菜单逻辑
3. ⏳ 创建 `hooks/useMediaOverlay.ts`，抽离图片预览/裁剪逻辑
4. ⏳ 创建 `hooks/useGlobalEvents.ts`，抽离全局事件处理
5. ⏳ 最终目标：App.tsx 减少到 200 行以内

### 预期效果

- **短期**：AI 看到警告后，会先思考"这个改动应该放在哪里"，而不是直接改 App.tsx
- **长期**：App.tsx 只做组合和配置，业务逻辑都在 Hooks 里，以后加功能不再碰 App.tsx

---

**记住：这不是建议，这是规则。**
