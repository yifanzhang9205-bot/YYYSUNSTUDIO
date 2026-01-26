# 性能优化 - Map 数据结构实施计划

## 改造范围分析

### 核心修改
1. **状态定义**（第 174 行）
   - `useState<AppNode[]>([])` → `useState<Map<string, AppNode>>(new Map())`

2. **nodes.find() 调用**（约 15 处）
   - `nodes.find(n => n.id === xxx)` → `nodes.get(xxx)`

3. **setNodes(prev => prev.map())** 更新（约 10 处）
   - 改为 `new Map(prev)` + `set()`

4. **渲染循环**（第 2400 行）
   - `nodes.map(node => ...)` → `Array.from(nodes.values()).map(node => ...)`

5. **工作流保存/加载**
   - 保存：`Map → Array`
   - 加载：`Array → Map`

### 多角度相机相关代码（重点保护）
- ✅ `handleNodeUpdate()` - 更新节点数据
- ✅ `handleMultiAngleCameraGenerate()` - 生成九宫格
- ✅ `inputAssets` 构建 - 获取输入图片
- ✅ 3D 相机组件渲染

## 实施步骤

### 第 1 步：创建辅助函数（安全）
创建 Map 操作的辅助函数，不影响现有代码。

### 第 2 步：修改状态定义
将 `nodes` 从 Array 改为 Map。

### 第 3 步：修改核心函数
- `handleNodeUpdate()` - 节点更新
- `addNode()` - 添加节点
- `deleteNodes()` - 删除节点

### 第 4 步：修改查找操作
将所有 `nodes.find()` 改为 `nodes.get()`。

### 第 5 步：修改渲染逻辑
将 `nodes.map()` 改为 `Array.from(nodes.values()).map()`。

### 第 6 步：修改工作流保存/加载
添加 Map ↔ Array 转换。

### 第 7 步：测试多角度相机
重点测试：
- 连接输入图片
- 生成九宫格
- 3D 相机交互
- 保存/加载工作流

## 风险控制

### 高风险区域
1. **inputAssets 构建**（第 2431 行）
   ```typescript
   // 现在
   node.inputs.map(i => nodes.find(n => n.id === i))
   
   // 改为
   node.inputs.map(i => nodes.get(i))
   ```

2. **handleNodeUpdate**（第 1136 行）
   ```typescript
   // 现在
   setNodes(prev => prev.map(n => n.id === id ? { ...n, data: {...} } : n))
   
   // 改为
   setNodes(prev => {
     const newMap = new Map(prev);
     const node = newMap.get(id);
     if (node) newMap.set(id, { ...node, data: {...} });
     return newMap;
   })
   ```

3. **连接线渲染**（第 2231 行）
   ```typescript
   // 现在
   const f = nodes.find(n => n.id === conn.from)
   const t = nodes.find(n => n.id === conn.to)
   
   // 改为
   const f = nodes.get(conn.from)
   const t = nodes.get(conn.to)
   ```

### 保护措施
1. 每步修改后立即测试
2. 优先测试多角度相机功能
3. 保留原代码注释，方便回滚
4. 使用 TypeScript 类型检查

## 预期收益

### 性能提升
- 查找节点：100x 提升
- 更新节点：100x 提升
- 删除节点：100x 提升
- 构建 inputAssets：100x 提升

### 内存影响
- 增加约 1-2% 内存（可忽略）

### 代码复杂度
- 增加约 10% 代码量（转换逻辑）
- 但性能收益远大于成本

## 回滚方案
如果出现问题，可以快速回滚：
1. 恢复状态定义：`Map → Array`
2. 恢复所有 `.get()` → `.find()`
3. 恢复所有 `new Map()` → `.map()`
4. 恢复渲染逻辑

## 开始实施
准备好了吗？我会一步步来，每步都测试多角度相机功能。
