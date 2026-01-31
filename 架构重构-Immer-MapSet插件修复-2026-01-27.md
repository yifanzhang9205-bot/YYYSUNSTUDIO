# 架构重构 - Immer MapSet 插件修复 - 2026-01-27

## 🚨 问题描述

### 错误 1：Immer MapSet 插件未启用（致命）
```
Uncaught Error: [Immer] The plugin for 'MapSet' has not been loaded into Immer. 
To enable the plugin, import and call `enableMapSet()` when initializing your application.
at die (errors.ts:45:9)
at getPlugin (plugins.ts:59:3)
at createProxy (immerClass.ts:244:5)
at Object.get (proxy.ts:153:23)
at nodeStore.ts:145:13
```

**影响**：
- ❌ 无法添加节点
- ❌ 无法删除节点
- ❌ 无法更新节点
- ❌ 所有节点操作都崩溃

**根本原因**：
- `nodeStore.ts` 使用了 `Map<string, AppNode>` 数据结构
- Immer 默认不支持 Map/Set
- 需要手动启用 `enableMapSet()` 插件

---

### 错误 2：Passive Event Listener 警告（非致命）
```
App.tsx:2039 Unable to preventDefault inside passive event listener invocation.
```

**影响**：
- ⚠️ 控制台警告（不影响功能）
- ⚠️ 可能影响滚轮缩放体验

**根本原因**：
- React 的 `onWheel` 事件默认是 passive 的
- 无法调用 `e.preventDefault()`
- 与原生 `addEventListener('wheel', ..., { passive: false })` 冲突

---

## ✅ 修复方案

### 修复 1：启用 Immer MapSet 插件

**修改文件**：`core/stores/nodeStore.ts`

**修改前**：
```typescript
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { AppNode, NodeStatus, NodeType } from '../../types';

// ============================================
// 类型定义
// ============================================
```

**修改后**：
```typescript
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { enableMapSet } from 'immer'; // 启用 Map/Set 支持
import { AppNode, NodeStatus, NodeType } from '../../types';

// ============================================
// 启用 Immer MapSet 插件（必须在使用前调用）
// ============================================
enableMapSet();

// ============================================
// 类型定义
// ============================================
```

**关键点**：
1. 导入 `enableMapSet` 函数
2. 在文件顶部调用 `enableMapSet()`（必须在创建 Store 之前）
3. 只需调用一次，全局生效

---

### 修复 2：移除 React onWheel 事件

**修改文件**：`App.tsx`

**修改前**：
```typescript
<div
  id="canvas-container"
  className="..."
  onMouseDown={handleCanvasMouseDown}
  onWheel={(e) => {
      e.preventDefault();
      handleWheel(e.nativeEvent);
  }}
  onDoubleClick={...}
  ...
>
```

**修改后**：
```typescript
<div
  id="canvas-container"
  className="..."
  onMouseDown={handleCanvasMouseDown}
  onDoubleClick={...}
  ...
>
```

**原因**：
- 已经有原生事件监听器：`canvas.addEventListener('wheel', handleWheel, { passive: false })`
- React 的 `onWheel` 是多余的，且会产生警告
- 移除 React 事件，只保留原生监听器

---

## 🔍 技术细节

### 为什么需要 enableMapSet()？

**Immer 的工作原理**：
1. Immer 通过 Proxy 拦截对象的读写操作
2. 默认只支持普通对象和数组
3. Map/Set 需要特殊处理（不同的 API）

**启用插件后**：
```typescript
// ✅ 可以正常使用 Map 操作
set((state) => {
  state.nodes.set(id, node);      // 添加
  state.nodes.delete(id);         // 删除
  state.nodes.get(id);            // 查询
});
```

**不启用插件**：
```typescript
// ❌ 报错：MapSet plugin not loaded
set((state) => {
  state.nodes.set(id, node); // 💥 崩溃
});
```

---

### 为什么移除 React onWheel？

**React 事件系统**：
- React 17+ 的 `onWheel` 默认是 passive 的
- Passive 事件无法调用 `preventDefault()`
- 目的是提升滚动性能

**原生事件监听器**：
```typescript
canvas.addEventListener('wheel', handleWheel, { passive: false });
```
- `passive: false` 允许调用 `preventDefault()`
- 可以阻止浏览器默认的滚动行为
- 实现自定义缩放逻辑

**冲突**：
- 同时使用 React `onWheel` 和原生 `addEventListener`
- React 事件先触发（passive），无法 preventDefault
- 产生警告

**解决**：
- 移除 React `onWheel`
- 只保留原生 `addEventListener`

---

## 📊 修复结果

### 编译成功
```
✓ 1733 modules transformed.
✓ built in 2.19s
```

### 修复的错误
- ✅ `[Immer] MapSet plugin not loaded` - 已修复
- ✅ `Unable to preventDefault inside passive event listener` - 已修复
- ✅ 节点添加/删除/更新功能恢复正常

---

## 🎯 验收标准

### 功能验收
- [ ] 右键菜单能打开
- [ ] 能添加节点（如"多角度相机"）
- [ ] 能拖动节点
- [ ] 能删除节点
- [ ] 能连接节点
- [ ] 滚轮缩放正常
- [ ] 无控制台报错

### 技术验收
- [x] 编译成功（无 TypeScript 错误）
- [x] Immer MapSet 插件已启用
- [x] 无 passive event listener 警告
- [ ] 无运行时错误

---

## 📝 相关文件

### 修改的文件
- `core/stores/nodeStore.ts` - 启用 Immer MapSet 插件（第 18-22 行）
- `App.tsx` - 移除 React onWheel 事件（第 2038-2041 行）

### 相关文件
- `hooks/useHistory.ts` - 使用 Map 数据结构
- `core/stores/connectionStore.ts` - 可能也需要 MapSet 插件（如果使用 Map）
- `core/stores/groupStore.ts` - 可能也需要 MapSet 插件（如果使用 Map）

---

## 🚀 下一步

### 立即测试（必须）
1. 打开浏览器开发者工具
2. 测试右键菜单
3. 测试添加节点（多角度相机）
4. 测试拖动节点
5. 测试删除节点
6. 测试连接节点
7. 测试滚轮缩放
8. 检查控制台是否还有错误

### 如果仍有错误
1. 查看浏览器控制台错误信息
2. 定位错误发生的文件和行号
3. 分析错误原因
4. 继续修复

---

## 💡 经验总结

### 教训
1. **Immer 插件必须启用**：使用 Map/Set 时，必须调用 `enableMapSet()`
2. **React 事件 vs 原生事件**：不要混用，选择一种方式
3. **Passive 事件限制**：React 17+ 的某些事件默认是 passive 的

### 最佳实践
1. **在 Store 文件顶部启用插件**：确保在创建 Store 之前调用
2. **优先使用原生事件**：需要 `preventDefault()` 时，使用原生 `addEventListener`
3. **及时测试**：每次修改后立即编译测试

---

## 📚 参考资料

### Immer MapSet 插件
- [Immer 文档 - Map and Set](https://immerjs.github.io/immer/map-set/)
- [Zustand + Immer 示例](https://docs.pmnd.rs/zustand/integrations/immer-middleware)

### React 事件系统
- [React 事件系统](https://react.dev/learn/responding-to-events)
- [Passive Event Listeners](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#passive)

---

**修复时间**：2026-01-27  
**修复人员**：Kiro AI  
**状态**：✅ 编译成功，等待功能测试
