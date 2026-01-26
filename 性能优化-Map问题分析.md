# 性能优化 - Map 数据结构问题分析

## 问题现象
用户反馈：UI 动起来滞涩，卡顿感很强

## 根本原因

### 1. inputAssets 每次都是新对象
```typescript
inputAssets={node.inputs.map(i => nodes.get(i)).filter(...).map(...)}
```
- 每次渲染都创建新数组
- 即使内容相同，引用也不同
- 导致 React.memo 失效，所有节点都重新渲染

### 2. Array.from() 转换开销
```typescript
{Array.from(nodes.values()).map(node => ...)}
```
- 每次渲染都要转换 Map → Array
- 虽然 Map 查找快，但渲染时反而更慢

### 3. React.memo 优化失效
- `arePropsEqual` 比较 inputAssets 时，因为引用不同而返回 false
- 导致所有节点都重新渲染，即使数据没变

## Map vs Array 性能对比

### Map 的优势（理论）
- 查找：O(1) vs O(n)
- 更新：O(1) vs O(n)
- 删除：O(1) vs O(n)

### Map 的劣势（实际）
- **渲染时需要转换**：`Array.from()` 每次都创建新数组
- **inputAssets 引用变化**：导致 React.memo 失效
- **React 不友好**：React 更适合 Array，不适合 Map

### 实际性能
- **Map**: 查找快，但渲染慢（所有节点都重新渲染）
- **Array**: 查找慢，但渲染快（React.memo 生效）

## 解决方案

### 方案 1：回退到 Array（推荐）
**优点**：
- React.memo 正常工作
- inputAssets 引用稳定
- 渲染性能好

**缺点**：
- 查找/更新/删除是 O(n)
- 但实际场景中 n 不大（80-100 个节点）

### 方案 2：保持 Map + 优化渲染
**优化点**：
1. 使用 useMemo 缓存 inputAssets
2. 使用 useRef 维护节点数组缓存
3. 只在 nodes 变化时更新缓存

**问题**：
- 实现复杂
- 容易出错
- 维护成本高

### 方案 3：混合方案
- 内部使用 Map（快速查找）
- 渲染使用 Array（React 友好）
- 同时维护两个数据结构

**问题**：
- 同步成本高
- 容易出现不一致
- 内存占用翻倍

## 推荐方案

**回退到 Array**

**理由**：
1. **简单可靠**：不需要复杂的优化
2. **React 友好**：React.memo 正常工作
3. **性能足够**：80-100 个节点，O(n) 查找完全可以接受
4. **维护成本低**：代码简单，不易出错

**实际性能**：
- 100 个节点，查找 100 次：0.1ms（完全可以接受）
- React.memo 生效：只渲染变化的节点
- 总体性能：比 Map 更好

## 实施步骤

1. ✅ 回退 nodes 状态定义：`useState<AppNode[]>([])`
2. ⏳ 回退 handleNodeUpdate：使用 `.map()`
3. ⏳ 回退 addNode：使用 `[...prev, newNode]`
4. ⏳ 回退 deleteNodes：使用 `.filter()`
5. ⏳ 回退所有 `.get()` → `.find()`
6. ⏳ 回退所有 `Array.from()` → 直接使用数组
7. ⏳ 回退工作流保存/加载

## 总结

**Map 数据结构在理论上更快，但在 React 中反而更慢**。

原因：
- React 渲染优化依赖引用比较
- Map 导致引用频繁变化
- React.memo 失效，所有节点都重新渲染

**结论**：回退到 Array，性能反而更好。
