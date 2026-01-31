# SunStudio 架构文档（项目宪法）

> ⚠️ **这是项目的宪法，所有开发者（包括 AI）都必须遵守**

---

## 🎯 核心原则

### 原则 1：逻辑分层，各司其职

**不是控制代码行数，而是控制代码职责。**

```
第 1 层：UI Layer (展示)
  - 只负责渲染，不管逻辑
  - 文件：App.tsx, Canvas.tsx, Node.tsx
  - 职责：组合组件、传递 props、显示 UI

第 2 层：Hooks Layer (交互)
  - 处理交互逻辑，调用 Store 和 Core
  - 文件：hooks/useDrag.ts, hooks/useSelection.ts, hooks/useConnection.ts
  - 职责：处理用户交互、管理局部状态、调用底层 API

第 3 层：Core Layer (底层)
  - 数据管理 + 纯计算，不依赖 React
  - 文件：core/stores/, core/utils/, core/registry/
  - 职责：全局状态、业务逻辑、纯函数计算
```

**关键：代码放在对应的层，不要跨层混用。**

---

### 原则 2：App.tsx 是高优先级保护区

**App.tsx 的定位：**
- 应用的主入口和组合器
- 只做组件组合和全局配置
- 不写业务逻辑、不写计算、不写复杂交互

**为什么要保护 App.tsx？**
1. **稳定性**：App.tsx 是整个应用的根，改它风险最大
2. **可维护性**：如果所有功能都往 App.tsx 塞，会变成垃圾场
3. **可扩展性**：新功能应该通过扩展模块实现，而不是修改 App.tsx

**修改 App.tsx 的规则：**

✅ **允许修改的情况：**
1. **架构调整**
   - 添加新的全局 Provider（如 Zustand Store Provider）
   - 调整路由结构
   - 修改应用入口逻辑

2. **重构过程中**
   - 正在实施架构重构
   - 需要抽离逻辑到 Hooks/Stores
   - 需要修复致命 Bug

3. **用户明确要求**
   - 用户说"修改 App.tsx"
   - 用户批准了修改方案

4. **紧急修复**
   - 修复崩溃问题
   - 修复数据丢失问题
   - 修复安全漏洞

⚠️ **修改前必须做到：**
1. **说清楚为什么要动**
   - 为什么必须改 App.tsx？
   - 不改会有什么问题？
   - 有没有其他方案？

2. **说清楚要怎么动**
   - 具体要改哪些行？
   - 要添加/删除/修改什么？
   - 改动的范围有多大？

3. **说清楚有什么后果**
   - 会影响哪些功能？
   - 会不会引入新的 Bug？
   - 会不会影响性能？
   - 会不会影响其他开发者？

4. **等待用户确认**
   - 不要自作主张
   - 必须得到用户明确同意
   - 如果用户说"不"，就找其他方案

❌ **禁止的操作：**
- 在 App.tsx 里写业务逻辑
- 在 App.tsx 里写复杂计算
- 在 App.tsx 里写 API 调用
- 在 App.tsx 里写复杂的状态管理
- 在 App.tsx 里"顺便优化一下"
- 在 App.tsx 里"临时加一点代码"

---

### 原则 3：给新增功能一个唯一合法入口

**以后不允许：**
- ❌ "先在 App.tsx 写一点"
- ❌ "临时在 Node.tsx 塞点逻辑"
- ❌ "这个功能比较简单，直接写在组件里"

**必须遵守：**

| 需求 | 唯一入口 | 禁止 |
|------|---------|------|
| 添加新节点类型 | `core/registry/NodeRegistry.ts` | ❌ 改 App.tsx |
| 添加新交互逻辑 | `hooks/` 对应的 Hook | ❌ 在 Node.tsx 塞逻辑 |
| 添加新数据管理 | `core/stores/` 对应的 Store | ❌ 在 App.tsx 加 useState |
| 添加新计算逻辑 | `core/utils/geometry.ts` | ❌ 在 UI 文件里写计算 |

**哪怕一开始只有 3 个文件，也要守规矩。**

---

### 原则 4：把"不可避免会变复杂的东西"先隔离

**这些东西一定会变复杂：**
- 拖拽逻辑
- 多选逻辑
- Group 逻辑
- 连接线逻辑
- 撤销/重做逻辑
- 快捷键逻辑

**你现在不隔离，后面就会反噬你。**

**正确做法：**
- 👉 **先丑，但隔离**
- 一开始可以写得很简单
- 但必须独立成模块
- 不要和其他逻辑混在一起

**示例：**
```typescript
// ❌ 错误：在 App.tsx 里写拖拽逻辑
function App() {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  const handleMouseDown = (e) => {
    setIsDragging(true);
    // ... 100 行拖拽逻辑
  };
  
  // ...
}

// ✅ 正确：抽离到 Hook
function App() {
  const { isDragging, handleMouseDown } = useDrag();
  // ...
}

// hooks/useDrag.ts
export function useDrag() {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  const handleMouseDown = (e) => {
    setIsDragging(true);
    // ... 100 行拖拽逻辑
  };
  
  return { isDragging, handleMouseDown };
}
```

---

### 原则 5：为"未来功能"预留结构，而不是代码

**你现在担心的是："以后还要加功能"**

**真正该做的是：**
- 节点类型可以新增 → `NodeRegistry` 解决"节点扩展焦虑"
- 画布交互可以新增 → `Hook 分层` 解决"交互堆叠焦虑"
- 数据结构不会被推翻 → `Zustand Store` 解决"状态管理焦虑"

**不是写一堆"以后可能用到"的代码，而是设计一个"以后可以扩展"的结构。**

---

## 📁 目录结构（目标）

```
src/
├── App.tsx                        # 主入口（只做组合）
│
├── components/                    # UI 组件（只做展示）
│   ├── Node.tsx                   # 节点组件
│   ├── Canvas.tsx                 # 画布组件
│   ├── SidebarDock.tsx            # 侧边栏
│   └── ...
│
├── hooks/                         # 交互逻辑（处理用户操作）
│   ├── useDrag.ts                 # 拖拽逻辑
│   ├── useSelection.ts            # 多选逻辑
│   ├── useConnection.ts           # 连接线逻辑
│   ├── useGroup.ts                # 组逻辑
│   └── ...
│
├── core/                          # 底层（不依赖 React）
│   ├── stores/                    # 数据管理（Zustand）
│   │   ├── canvasStore.ts         # 画布状态
│   │   ├── nodeStore.ts           # 节点状态
│   │   └── ...
│   │
│   ├── utils/                     # 纯计算
│   │   ├── geometry.ts            # 几何计算
│   │   ├── collision.ts           # 碰撞检测
│   │   └── ...
│   │
│   └── registry/                  # 注册表
│       └── NodeRegistry.ts        # 节点类型注册
│
├── services/                      # 外部服务
│   ├── geminiService.ts           # Gemini API
│   ├── cozeService.ts             # Coze API
│   └── ...
│
└── types.ts                       # 类型定义
```

---

## 🔄 数据流（单向）

```
用户操作
  ↓
UI 组件（触发事件）
  ↓
Hook（处理交互逻辑）
  ↓
Store（更新状态）
  ↓
UI 组件（重新渲染）
```

**禁止反向流动：**
- ❌ UI 组件直接修改 Store
- ❌ Store 直接调用 UI 组件
- ❌ Hook 直接操作 DOM

---

## 🎯 实施路径（既是根治，又不自杀）

### 阶段 A（当前）：建立规则

**目标：以后加功能，不再随意碰 App.tsx**

**做 3 件事就够：**
1. 把节点定义抽到 `NodeRegistry`
2. 把拖拽逻辑抽成 `useDrag`（哪怕很丑）
3. 把几何/碰撞彻底移出 UI 文件

**功能不变，结构开始变。**

---

### 阶段 B（下一步）：完善底层

**目标：数据管理清晰，性能可控**

**做 3 件事：**
1. 实施 Zustand + Immer（状态管理）
2. 优化拖拽性能（RAF + Transform）
3. 完善类型定义（TypeScript 严格模式）

**功能增强，性能提升。**

---

### 阶段 C（未来）：扩展能力

**目标：轻松添加新功能**

**做 3 件事：**
1. 实施插件系统（节点可插拔）
2. 实施命令系统（撤销/重做）
3. 实施快捷键系统（可配置）

**功能爆炸，架构稳定。**

---

## 📋 开发检查清单

### 添加新功能前，问自己：

- [ ] 这个功能属于哪一层？（UI / Hooks / Core）
- [ ] 这个功能的唯一入口是什么？
- [ ] 需要修改 App.tsx 吗？如果需要，为什么？
- [ ] 有没有其他方案不修改 App.tsx？
- [ ] 这个功能会影响哪些现有功能？
- [ ] 这个功能未来会变复杂吗？需要隔离吗？

### 修改 App.tsx 前，问自己：

- [ ] 为什么必须改 App.tsx？
- [ ] 不改会有什么问题？
- [ ] 有没有其他方案？
- [ ] 具体要改哪些行？
- [ ] 会影响哪些功能？
- [ ] 会不会引入新的 Bug？
- [ ] 用户同意了吗？

### 提交代码前，问自己：

- [ ] 代码放在正确的层了吗？
- [ ] 有没有跨层混用？
- [ ] 有没有在 UI 组件里写业务逻辑？
- [ ] 有没有在 UI 组件里写计算？
- [ ] 有没有违反单向数据流？
- [ ] 编译通过了吗？
- [ ] 功能测试通过了吗？

---

## 🚫 反面案例（不要这样做）

### 案例 1：在 App.tsx 里写业务逻辑

```typescript
// ❌ 错误
function App() {
  const [nodes, setNodes] = useState([]);
  
  const handleAddNode = (type: string) => {
    const newNode = {
      id: Date.now().toString(),
      type,
      x: Math.random() * 800,
      y: Math.random() * 600,
      // ... 50 行业务逻辑
    };
    setNodes([...nodes, newNode]);
  };
  
  // ...
}

// ✅ 正确
function App() {
  const { addNode } = useNodeStore();
  // ...
}

// core/stores/nodeStore.ts
export const useNodeStore = create((set) => ({
  nodes: [],
  addNode: (type: string) => {
    const newNode = createNode(type);
    set((state) => ({ nodes: [...state.nodes, newNode] }));
  },
}));
```

---

### 案例 2：在 UI 组件里写计算

```typescript
// ❌ 错误
function Node({ node }) {
  const distance = Math.sqrt(
    Math.pow(node.x - targetX, 2) + Math.pow(node.y - targetY, 2)
  );
  
  const isColliding = distance < node.width / 2 + target.width / 2;
  
  // ...
}

// ✅ 正确
function Node({ node }) {
  const distance = calculateDistance(node, target);
  const isColliding = checkCollision(node, target);
  
  // ...
}

// core/utils/geometry.ts
export function calculateDistance(a, b) {
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}

export function checkCollision(a, b) {
  const distance = calculateDistance(a, b);
  return distance < a.width / 2 + b.width / 2;
}
```

---

### 案例 3：跨层混用

```typescript
// ❌ 错误：UI 组件直接操作 Store
function Node({ node }) {
  const { setNodes } = useNodeStore();
  
  const handleDrag = (e) => {
    setNodes((nodes) =>
      nodes.map((n) =>
        n.id === node.id ? { ...n, x: e.clientX, y: e.clientY } : n
      )
    );
  };
  
  // ...
}

// ✅ 正确：通过 Hook 操作 Store
function Node({ node }) {
  const { handleDrag } = useDrag(node.id);
  
  // ...
}

// hooks/useDrag.ts
export function useDrag(nodeId: string) {
  const { updateNodePosition } = useNodeStore();
  
  const handleDrag = (e) => {
    updateNodePosition(nodeId, e.clientX, e.clientY);
  };
  
  return { handleDrag };
}
```

---

## ✅ 正面案例（要这样做）

### 案例 1：添加新节点类型

```typescript
// core/registry/NodeRegistry.ts
export const NodeRegistry = {
  'text-input': {
    name: '文本输入',
    icon: '📝',
    defaultWidth: 300,
    defaultHeight: 200,
    component: TextInputNode,
  },
  'image-gen': {
    name: '图片生成',
    icon: '🖼️',
    defaultWidth: 400,
    defaultHeight: 300,
    component: ImageGenNode,
  },
  // 添加新节点：只需要在这里添加一行
  'video-gen': {
    name: '视频生成',
    icon: '🎬',
    defaultWidth: 500,
    defaultHeight: 400,
    component: VideoGenNode,
  },
};
```

---

### 案例 2：添加新交互逻辑

```typescript
// hooks/useKeyboard.ts
export function useKeyboard() {
  const { deleteSelectedNodes, duplicateSelectedNodes } = useNodeStore();
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete') {
        deleteSelectedNodes();
      } else if (e.key === 'd' && e.ctrlKey) {
        e.preventDefault();
        duplicateSelectedNodes();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deleteSelectedNodes, duplicateSelectedNodes]);
}

// App.tsx
function App() {
  useKeyboard(); // 只需要一行
  // ...
}
```

---

### 案例 3：添加新数据管理

```typescript
// core/stores/historyStore.ts
export const useHistoryStore = create((set, get) => ({
  past: [],
  future: [],
  
  undo: () => {
    const { past, future } = get();
    if (past.length === 0) return;
    
    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);
    
    set({
      past: newPast,
      future: [get().present, ...future],
      present: previous,
    });
  },
  
  redo: () => {
    const { future } = get();
    if (future.length === 0) return;
    
    const next = future[0];
    const newFuture = future.slice(1);
    
    set({
      past: [...get().past, get().present],
      future: newFuture,
      present: next,
    });
  },
}));
```

---

## 📚 相关文档

- **入职规则**：`.kiro/steering/project-onboarding.md`
- **工作规范**：`AI工作规范-必读.md`
- **重构计划**：`.kiro/specs/canvas-architecture-refactor/requirements.md`
- **快速参考**：`.kiro/QUICK_REFERENCE.md`

---

## 🎯 核心目标（永远记住）

**不是控制代码行数，而是控制代码职责。**

**App.tsx 是高优先级保护区，轻易不能动。**

**如果要动，必须说清楚：为什么、怎么动、有什么后果。**

**以后加功能，通过扩展模块实现，而不是修改 App.tsx。**

---

**记住：这不是建议，这是规则。**

---

**文档版本**：v1.0  
**创建日期**：2026-01-27  
**状态**：✅ 生效中
