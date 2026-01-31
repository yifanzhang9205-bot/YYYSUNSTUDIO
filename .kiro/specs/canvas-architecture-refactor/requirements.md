# Canvas 架构重构 - 需求文档 v2.0

## 🎯 核心目标（最重要）

### 这次重构只做一件事：
**让以后加功能时，不再碰 App.tsx，不再到处乱改**

### 不是为了：
- ❌ 换技术栈
- ❌ 重写所有代码
- ❌ 追求极致性能

### 而是为了：
- ✅ **结构清晰**：底层是底层，交互是交互，UI 是 UI
- ✅ **易于扩展**：加新节点不改旧代码
- ✅ **不会塌方**：改东边不影响西边
- ✅ **功能不变**：所有现有功能完整保留

---

## 1. 项目背景

### 1.1 当前问题（致命）

**问题 1：Map/Array 混用导致崩溃**
```typescript
// 定义是 Map
const [nodes, setNodes] = useState<Map<string, AppNode>>(new Map());

// 使用时当 Array
setNodes(prev => [...prev, newNode]); // ❌ 崩溃
```

**问题 2：代码全在 App.tsx（2700+ 行）**
- 添加新功能 → 改 App.tsx
- 修复 Bug → 改 App.tsx
- 优化性能 → 改 App.tsx
- 结果：改一处，崩三处

**问题 3：逻辑混在一起**
- 拖拽逻辑 + UI 渲染 + 数据管理 + 几何计算 = 一团乱麻
- 无法测试，无法复用，无法维护

### 1.2 重构目标

#### 核心目标（必须达成）
1. **结构分离**：底层/交互/UI 彻底分开
2. **唯一入口**：新增功能有明确的添加位置
3. **隔离复杂**：拖拽/多选/Group 等复杂逻辑独立成模块
4. **预留扩展**：节点类型/交互方式可以无限扩展

#### 性能目标（次要）
- 100 节点：60fps（当前已达成）
- 500 节点：不卡顿（RAF 优化后可达成）
- 1000 节点：流畅（暂不追求，未来优化）

#### 功能目标（必须）
- ✅ 所有现有功能完整保留
- ✅ 3D 相机功能不变
- ✅ 九宫格功能不变
- ✅ 无崩溃、无白屏

### 1.3 核心原则

#### 原则 1：先隔离，再优化
- 不追求完美代码，先把模块分开
- 拖拽逻辑可以丑，但必须独立成 Hook
- 几何计算可以慢，但必须移出 UI 文件

#### 原则 2：功能不变，结构变
- 不改业务逻辑
- 不改交互方式
- 只改代码组织方式

#### 原则 3：渐进式重构
- 不推倒重来
- 一个模块一个模块地抽离
- 每一步都能运行

#### 原则 4：为未来预留结构
- 节点类型可扩展 → NodeRegistry
- 交互方式可扩展 → Hook 分层
- 数据结构不会被推翻 → Store 管理

---

## 2. 什么叫"从根源解决"？

### 2.1 定义

**不是**：
- ❌ 换技术栈（React → Vue）
- ❌ 重写所有代码
- ❌ 追求完美架构

**而是**：

#### ① 给"新增功能"一个唯一合法入口

**现状**：
- 想加新节点 → 改 App.tsx 的 switch case
- 想加新交互 → 在 Node.tsx 塞点逻辑
- 想加新功能 → 到处乱改

**目标**：
- 想加新节点 → 只改 `NodeRegistry.ts`（注册一次）
- 想加新交互 → 只改对应的 Hook（如 `useDrag.ts`）
- 想加新功能 → 明确知道改哪个文件

**规则**：
```
交互逻辑 → Hook（如 useDrag.ts）
数据管理 → Store（如 nodeStore.ts）
几何计算 → Core（如 geometry.ts）
UI 展示 → Component（如 Node.tsx）
```

#### ② 把"不可避免会变复杂的东西"先隔离

**哪些东西一定会变复杂？**
- 拖拽（单选、多选、Group、碰撞检测）
- 连接线（绘制、交互、动画）
- 多选（框选、Shift 多选、全选）
- Group（嵌套、拖拽、调整大小）

**现状**：
- 这些逻辑全在 App.tsx 里，2700+ 行
- 改一处，崩三处

**目标**：
- 拖拽逻辑 → `useDrag.ts`（哪怕很丑，但独立）
- 连接线逻辑 → `useConnection.ts`
- 多选逻辑 → `useSelection.ts`
- Group 逻辑 → `useGroup.ts`

**原则**：
- 先丑，但隔离
- 不追求完美，先分开
- 以后优化只改对应文件

#### ③ 为"未来功能"预留结构，而不是代码

**你担心的**：
- 以后还要加功能
- 以后还要改逻辑
- 以后还要优化性能

**真正该做的**：
- 节点类型可以新增 → `NodeRegistry` 解决
- 画布交互可以新增 → Hook 分层解决
- 数据结构不会被推翻 → Store 管理解决

**不是**：
- ❌ 现在就写插件系统（过度设计）
- ❌ 现在就做虚拟化（过早优化）
- ❌ 现在就用 Canvas 画线（增加复杂度）

**而是**：
- ✅ 结构清晰，以后加功能不乱
- ✅ 模块独立，以后改逻辑不崩
- ✅ 接口明确，以后优化不影响其他

---

## 3. 重构方案（务实版）

### 3.1 核心架构（三层分离）

#### 架构图


```
┌─────────────────────────────────────────────────────────────┐
│                    第 1 层：UI Layer (展示)                   │
│  职责：只负责渲染，不管逻辑                                    │
│  ─────────────────────────────────────────────────────────  │
│  - App.tsx (主入口，只做组合)                                 │
│  - Canvas.tsx (画布容器)                                      │
│  - Node.tsx (节点渲染)                                        │
│  - ConnectionSVG.tsx (连接线 - 保持 SVG)                      │
│  - Toolbar.tsx (工具栏)                                       │
└─────────────────────────────────────────────────────────────┘
                            ↓ 调用 Hooks
┌─────────────────────────────────────────────────────────────┐
│                  第 2 层：Hooks Layer (交互)                  │
│  职责：处理交互逻辑，调用 Store 和 Core                        │
│  ─────────────────────────────────────────────────────────  │
│  - useDrag.ts (拖拽逻辑 - 单选/多选/Group)                    │
│  - useSelection.ts (选择逻辑 - 框选/多选)                     │
│  - useConnection.ts (连接线逻辑)                              │
│  - useGroup.ts (分组逻辑)                                     │
│  - useHistory.ts (撤销/重做)                                  │
│  - useViewport.ts (缩放/平移)                                 │
└─────────────────────────────────────────────────────────────┘
                            ↓ 调用 Store 和 Core
┌─────────────────────────────────────────────────────────────┐
│                 第 3 层：Core Layer (底层)                    │
│  职责：数据管理 + 纯计算，不依赖 React                         │
│  ─────────────────────────────────────────────────────────  │
│  【数据管理】                                                  │
│  - stores/nodeStore.ts (节点数据 - Map)                       │
│  - stores/connectionStore.ts (连接数据 - Array)               │
│  - stores/groupStore.ts (分组数据 - Array)                    │
│  - stores/viewportStore.ts (视口数据)                         │
│                                                               │
│  【纯计算】                                                    │
│  - utils/geometry.ts (几何计算 - 碰撞/距离/角度)               │
│  - utils/layout.ts (布局算法 - 自动排列)                      │
│  - registry/NodeRegistry.ts (节点注册表)                      │
└─────────────────────────────────────────────────────────────┘
```

#### 数据流（单向）
```
用户操作 → UI Layer → Hooks Layer → Core Layer (Store + Utils)
                ↓                      ↓
            触发重渲染              数据持久化
```

### 3.2 目录结构（最终）

```
src/
├── App.tsx                        # 主入口（只做组合，不写逻辑）
│
├── core/                          # 第 3 层：底层（不依赖 React）
│   ├── stores/                    # 数据管理（Zustand）
│   │   ├── nodeStore.ts           # 节点数据（Map）
│   │   ├── connectionStore.ts     # 连接数据（Array）
│   │   ├── groupStore.ts          # 分组数据（Array）
│   │   └── viewportStore.ts       # 视口数据
│   │
│   ├── utils/                     # 纯计算（无副作用）
│   │   ├── geometry.ts            # 几何计算（碰撞检测、距离计算）
│   │   ├── layout.ts              # 布局算法（自动排列）
│   │   └── idGenerator.ts         # ID 生成
│   │
│   ├── registry/                  # 注册表
│   │   └── NodeRegistry.ts        # 节点类型注册表
│   │
│   └── types/                     # 类型定义
│       ├── node.types.ts
│       ├── connection.types.ts
│       └── viewport.types.ts
│
├── hooks/                         # 第 2 层：交互逻辑（Hooks）
│   ├── useDrag.ts                 # 拖拽逻辑（单选/多选/Group）
│   ├── useSelection.ts            # 选择逻辑（框选/Shift 多选）
│   ├── useConnection.ts           # 连接线逻辑
│   ├── useGroup.ts                # 分组逻辑
│   ├── useHistory.ts              # 撤销/重做
│   └── useViewport.ts             # 缩放/平移
│
├── components/                    # 第 1 层：UI 组件（只渲染）
│   ├── Canvas.tsx                 # 画布容器
│   ├── Node.tsx                   # 节点渲染（通用）
│   ├── ConnectionSVG.tsx          # 连接线（SVG）
│   ├── Toolbar.tsx                # 工具栏
│   ├── ContextMenu.tsx            # 右键菜单
│   │
│   └── nodes/                     # 各类节点组件
│       ├── MultiAngleCameraNode.tsx   # 3D 相机
│       ├── GridSplitterNode.tsx       # 九宫格
│       ├── ImageGeneratorNode.tsx     # 图片生成
│       └── ...
│
└── services/                      # 外部服务（API 调用）
    ├── geminiService.ts
    ├── storageService.ts
    └── ...
```

### 3.3 核心模块设计

#### 3.3.1 NodeStore（数据管理）

**职责**：
- 管理所有节点数据（Map 结构）
- 提供增删改查接口
- 不包含任何 UI 逻辑

**实现**：
```typescript
// core/stores/nodeStore.ts
import create from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface NodeStore {
  // 数据（Map 结构，查找 O(1)）
  nodes: Map<string, AppNode>;
  
  // 操作（统一接口）
  addNode: (node: AppNode) => void;
  updateNode: (id: string, updates: Partial<AppNode>) => void;
  deleteNodes: (ids: string[]) => void;
  
  // 查询
  getNode: (id: string) => AppNode | undefined;
  getAllNodes: () => AppNode[];
}

export const useNodeStore = create<NodeStore>()(
  immer((set, get) => ({
    nodes: new Map(),
    
    // ✅ 正确的 Map 操作
    addNode: (node) => set((state) => {
      state.nodes.set(node.id, node);
    }),
    
    updateNode: (id, updates) => set((state) => {
      const node = state.nodes.get(id);
      if (node) {
        state.nodes.set(id, { ...node, ...updates });
      }
    }),
    
    deleteNodes: (ids) => set((state) => {
      ids.forEach(id => state.nodes.delete(id));
    }),
    
    getNode: (id) => get().nodes.get(id),
    
    getAllNodes: () => Array.from(get().nodes.values()),
  }))
);
```

#### 3.3.2 NodeRegistry（节点注册表）

**职责**：
- 统一管理所有节点类型
- 提供节点定义（名称、图标、组件、默认值）
- 新增节点只需注册一次

**实现**：
```typescript
// core/registry/NodeRegistry.ts
interface NodeDefinition {
  type: NodeType;
  name: string;
  icon: React.ComponentType;
  component: React.ComponentType<{ node: AppNode }>;
  defaultData: any;
  defaultSize: { width: number; height: number };
}

class NodeRegistry {
  private registry = new Map<NodeType, NodeDefinition>();
  
  register(definition: NodeDefinition) {
    this.registry.set(definition.type, definition);
  }
  
  get(type: NodeType): NodeDefinition | undefined {
    return this.registry.get(type);
  }
  
  getAll(): NodeDefinition[] {
    return Array.from(this.registry.values());
  }
}

export const nodeRegistry = new NodeRegistry();

// 注册节点（只需一次）
nodeRegistry.register({
  type: NodeType.MULTI_ANGLE_CAMERA,
  name: '多角度相机',
  icon: LayoutTemplate,
  component: MultiAngleCameraNode,
  defaultData: {
    horizontalAngle: 0,
    verticalAngle: 0,
    cameraZoom: 5,
  },
  defaultSize: { width: 420, height: 800 },
});

nodeRegistry.register({
  type: NodeType.GRID_SPLITTER,
  name: '九宫格处理',
  icon: Grid3X3,
  component: GridSplitterNode,
  defaultData: {},
  defaultSize: { width: 420, height: 480 },
});
```

**使用**：
```typescript
// 添加节点（不再需要 switch case）
const addNode = (type: NodeType, x: number, y: number) => {
  const definition = nodeRegistry.get(type);
  if (!definition) return;
  
  const newNode: AppNode = {
    id: generateId(),
    type,
    x,
    y,
    width: definition.defaultSize.width,
    height: definition.defaultSize.height,
    title: definition.name,
    data: definition.defaultData,
    // ...
  };
  
  useNodeStore.getState().addNode(newNode);
};
```

#### 3.3.3 useDrag（拖拽逻辑）

**职责**：
- 处理所有拖拽逻辑（单选、多选、Group）
- 使用 RAF + Transform 优化性能
- 调用 Store 更新数据

**实现**：
```typescript
// hooks/useDrag.ts
export const useDrag = () => {
  const updateNode = useNodeStore(state => state.updateNode);
  const dragRef = useRef<DragContext | null>(null);
  const rafRef = useRef<number | null>(null);
  
  const handleMouseDown = (e: React.MouseEvent, nodeId: string) => {
    const node = useNodeStore.getState().getNode(nodeId);
    if (!node) return;
    
    const element = document.getElementById(`node-${nodeId}`);
    
    dragRef.current = {
      id: nodeId,
      startX: node.x,
      startY: node.y,
      mouseStartX: e.clientX,
      mouseStartY: e.clientY,
      element,
    };
    
    // GPU 加速
    if (element) {
      element.style.willChange = 'transform';
    }
  };
  
  const handleMouseMove = (e: MouseEvent) => {
    if (!dragRef.current) return;
    
    // RAF 节流
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    
    rafRef.current = requestAnimationFrame(() => {
      const { element, mouseStartX, mouseStartY } = dragRef.current!;
      const dx = e.clientX - mouseStartX;
      const dy = e.clientY - mouseStartY;
      
      // 直接操作 DOM（不触发 React 渲染）
      if (element) {
        element.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
      }
    });
  };
  
  const handleMouseUp = (e: MouseEvent) => {
    if (!dragRef.current) return;
    
    const { id, startX, startY, mouseStartX, mouseStartY, element } = dragRef.current;
    const scale = useViewportStore.getState().scale;
    
    // 计算最终位置
    const dx = (e.clientX - mouseStartX) / scale;
    const dy = (e.clientY - mouseStartY) / scale;
    const finalX = startX + dx;
    const finalY = startY + dy;
    
    // 更新 Store
    updateNode(id, { x: finalX, y: finalY });
    
    // 清理 DOM
    if (element) {
      element.style.transform = '';
      element.style.willChange = '';
    }
    
    dragRef.current = null;
  };
  
  return { handleMouseDown, handleMouseMove, handleMouseUp };
};
```

#### 3.3.4 geometry.ts（几何计算）

**职责**：
- 纯函数，无副作用
- 碰撞检测、距离计算、角度计算
- 不依赖 React，可独立测试

**实现**：
```typescript
// core/utils/geometry.ts

// AABB 碰撞检测
export const checkCollision = (
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number }
): boolean => {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
};

// 计算两点距离
export const distance = (
  p1: { x: number; y: number },
  p2: { x: number; y: number }
): number => {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
};

// 计算点到矩形的最近距离
export const distanceToRect = (
  point: { x: number; y: number },
  rect: { x: number; y: number; width: number; height: number }
): number => {
  const closestX = Math.max(rect.x, Math.min(point.x, rect.x + rect.width));
  const closestY = Math.max(rect.y, Math.min(point.y, rect.y + rect.height));
  return distance(point, { x: closestX, y: closestY });
};
```

---

## 4. 实施计划（阶段 A：结构重构）

### 4.1 目标

**唯一目标**：以后加功能，不再碰 App.tsx

### 4.2 三步走

#### 第 1 步：修复致命 Bug（1 天）
**目标**：让代码能跑起来

**任务**：
- [ ] 修复 Map/Array 混用（统一用 Map 操作）
- [ ] 修复拖拽正则匹配 Bug
- [ ] 修复 key 属性问题

**验收**：
- 添加节点不崩溃
- 拖拽节点不瞬移
- 无控制台报错

#### 第 2 步：抽离底层（3 天）
**目标**：把数据和计算移出 App.tsx

**任务**：
- [ ] 创建 `core/stores/nodeStore.ts`（Zustand + Immer）
- [ ] 创建 `core/stores/connectionStore.ts`
- [ ] 创建 `core/stores/groupStore.ts`
- [ ] 创建 `core/utils/geometry.ts`（几何计算）
- [ ] 创建 `core/registry/NodeRegistry.ts`（节点注册表）
- [ ] 迁移所有节点类型到注册表

**验收**：
- App.tsx 不再直接操作 nodes/connections/groups
- 所有数据操作通过 Store
- 所有几何计算在 geometry.ts

#### 第 3 步：抽离交互（3 天）
**目标**：把交互逻辑移出 App.tsx

**任务**：
- [ ] 创建 `hooks/useDrag.ts`（拖拽逻辑）
- [ ] 创建 `hooks/useSelection.ts`（选择逻辑）
- [ ] 创建 `hooks/useConnection.ts`（连接线逻辑）
- [ ] 创建 `hooks/useGroup.ts`（分组逻辑）
- [ ] 创建 `hooks/useHistory.ts`（撤销/重做）
- [ ] 创建 `hooks/useViewport.ts`（缩放/平移）

**验收**：
- App.tsx 只做组合，不写逻辑
- 所有交互逻辑在 Hooks
- 代码行数 < 500 行

### 4.3 时间表

| 阶段 | 时间 | 产出 |
|------|------|------|
| 第 1 步 | 1 天 | 代码能跑，无崩溃 |
| 第 2 步 | 3 天 | 底层分离，数据管理清晰 |
| 第 3 步 | 3 天 | 交互分离，App.tsx 瘦身 |
| **总计** | **7 天** | **结构清晰，易于扩展** |

---

## 5. 技术选型（务实版）

### 5.1 状态管理：Zustand + Immer

**为什么用 Zustand？**
- ✅ 轻量级（2KB）
- ✅ 性能好（不触发不必要渲染）
- ✅ API 简单（比 Redux 简单 10 倍）
- ✅ TypeScript 友好

**为什么用 Immer？**
- ✅ 不可变数据更新（避免 Bug）
- ✅ 代码简洁（不用手动展开）
- ✅ 性能好（结构共享）

### 5.2 连接线：保持 SVG（不用 Canvas）

**原因**：
- ✅ SVG 支持交互（右键删除、悬停变色）
- ✅ 实现简单，不易出 Bug
- ✅ 2000 根线以内不会卡

**Canvas 的问题**：
- ❌ 需要手动计算鼠标点击哪根线（复杂）
- ❌ 交互逻辑容易出 Bug
- ❌ 过早优化

**结论**：先用 SVG，等真的卡了再升级

### 5.3 虚拟化：暂不实现

**原因**：
- ❌ 实现复杂（连接线、框选都会出 Bug）
- ❌ 过早优化
- ✅ RAF 拖拽优化后，500 节点不会卡

**结论**：先做 RAF 优化，等真的需要再加虚拟化

### 5.4 拖拽优化：RAF + Transform

**原因**：
- ✅ 性能提升明显（10fps → 60fps）
- ✅ 实现相对简单
- ✅ 不影响其他功能

**实现**：
- 拖拽时：直接操作 DOM（跳过 React）
- 松手时：更新 Store（同步数据）

---

## 6. 保留功能迁移

### 6.1 3D 相机节点

**现状**：`components/MultiAngleCameraNode.tsx`

**迁移**：
1. 移动到 `components/nodes/MultiAngleCameraNode.tsx`
2. 注册到 NodeRegistry
3. 保留所有功能（角度控制、缩放、提示词生成）

**改动**：最小化，只调整导入路径

### 6.2 九宫格处理节点

**现状**：`components/GridSplitterNode.tsx`

**迁移**：
1. 移动到 `components/nodes/GridSplitterNode.tsx`
2. 注册到 NodeRegistry
3. 保留所有功能

**改动**：最小化，只调整导入路径

### 6.3 其他节点

**迁移策略**：
- 所有节点组件移到 `components/nodes/`
- 统一注册到 NodeRegistry
- 保留所有现有功能

---

## 7. 验收标准

### 7.1 功能验收
- [ ] 所有现有功能正常工作
- [ ] 3D 相机功能完整保留
- [ ] 九宫格功能完整保留
- [ ] 无崩溃、无白屏
- [ ] 无控制台报错

### 7.2 结构验收
- [ ] App.tsx < 500 行
- [ ] 数据管理在 Store
- [ ] 交互逻辑在 Hooks
- [ ] 几何计算在 Core
- [ ] 节点定义在 Registry

### 7.3 扩展性验收
- [ ] 添加新节点类型 < 10 分钟（只需注册）
- [ ] 修改拖拽逻辑不影响其他功能
- [ ] 修改连接线逻辑不影响其他功能

### 7.4 性能验收
- [ ] 100 节点：60fps
- [ ] 500 节点：不卡顿
- [ ] 拖拽丝滑

---

## 8. 风险控制

### 8.1 风险 1：重构过程中功能丢失

**缓解**：
- 保留旧代码（重命名为 `App.old.tsx`）
- 分模块迁移，逐步替换
- 每一步都能运行

### 8.2 风险 2：时间超期

**缓解**：
- 优先实现核心功能（Store + Registry）
- 非核心功能可延后
- 每天同步进度

### 8.3 风险 3：性能不达标

**缓解**：
- 每个阶段都做性能测试
- 提前验证 RAF 拖拽效果
- 准备降级方案（保留旧代码）

---

## 9. 后续规划

### 9.1 阶段 B（性能优化）
- 实现虚拟化渲染（如果需要）
- 优化连接线渲染（如果需要）
- 优化内存占用

### 9.2 阶段 C（功能扩展）
- 实现插件系统
- 支持自定义节点
- 支持协同编辑

---

## 10. 附录

### 10.1 参考资料
- [Zustand 文档](https://docs.pmnd.rs/zustand)
- [Immer 文档](https://immerjs.github.io/immer/)
- [React Flow 架构](https://reactflow.dev/learn)

### 10.2 核心原则（再次强调）

1. **先隔离，再优化**
2. **功能不变，结构变**
3. **渐进式重构**
4. **为未来预留结构**

---

**文档版本**：v2.0（务实版）  
**创建日期**：2026-01-27  
**作者**：Kiro AI  
**审核状态**：待审核


**核心思想**：只渲染用户能看到的节点，其他节点不渲染。

**类比**：
- Excel：只渲染可见单元格，不渲染 100 万行
- Google Maps：只加载当前视口的地图瓦片
- Figma：只渲染画布可见区域的图层

### 4.2 实现步骤

#### 步骤 1：计算可见区域
```typescript
// 计算屏幕可见区域（世界坐标）
const getVisibleBounds = (pan, scale, padding = 500) => {
  return {
    left: (-pan.x - padding) / scale,
    top: (-pan.y - padding) / scale,
    right: (window.innerWidth - pan.x + padding) / scale,
    bottom: (window.innerHeight - pan.y + padding) / scale,
  };
};
```

#### 步骤 2：过滤可见节点
```typescript
const useVisibleNodes = (nodes: Map<string, AppNode>, pan, scale) => {
  return useMemo(() => {
    const bounds = getVisibleBounds(pan, scale);
    const visible: AppNode[] = [];
    
    nodes.forEach(node => {
      const nodeRight = node.x + (node.width || 420);
      const nodeBottom = node.y + (node.height || 300);
      
      // AABB 碰撞检测
      if (
        node.x < bounds.right &&
        nodeRight > bounds.left &&
        node.y < bounds.bottom &&
        nodeBottom > bounds.top
      ) {
        visible.push(node);
      }
    });
    
    return visible;
  }, [nodes, pan, scale]);
};
```

#### 步骤 3：只渲染可见节点
```typescript
const Canvas = () => {
  const allNodes = useNodeStore(state => state.nodes);
  const { pan, scale } = useViewportStore();
  
  // 虚拟化：只获取可见节点
  const visibleNodes = useVisibleNodes(allNodes, pan, scale);
  
  return (
    <div>
      {visibleNodes.map(node => (
        <Node key={node.id} node={node} />
      ))}
    </div>
  );
};
```

### 4.3 性能提升

| 节点总数 | 无虚拟化 | 有虚拟化 | 提升倍数 |
|---------|---------|---------|---------|
| 100     | 60 fps  | 60 fps  | 1x      |
| 500     | 30 fps  | 60 fps  | 2x      |
| 1000    | 15 fps  | 60 fps  | 4x      |
| 5000    | 3 fps   | 60 fps  | 20x     |

### 4.4 注意事项

**问题 1**：连接线怎么办？
- **解决**：连接线也要虚拟化，只绘制可见节点之间的连接

**问题 2**：拖拽时节点移出视口怎么办？
- **解决**：拖拽中的节点强制渲染（添加到 visibleNodes）

**问题 3**：框选时怎么办？
- **解决**：框选时临时禁用虚拟化，或者只检测可见节点

---

## 5. 拖拽优化详细设计

### 5.1 拖拽性能瓶颈

**问题**：每次 mousemove 都触发 React 重渲染，导致卡顿。

**原因**：
```typescript
// ❌ 错误做法：每次 mousemove 都 setState
const handleMouseMove = (e) => {
  setNodes(prev => {
    const newMap = new Map(prev);
    const node = newMap.get(draggingId);
    newMap.set(draggingId, { ...node, x: e.clientX, y: e.clientY });
    return newMap;
  });
};
// 结果：60fps → 10fps
```

### 5.2 正确的拖拽方案

#### 方案：RAF + Transform（GPU 加速）

**核心思想**：
1. 拖拽时：直接操作 DOM（不触发 React 渲染）
2. 松手时：更新 React State（同步最终位置）

**实现**：
```typescript
// 拖拽开始
const handleMouseDown = (e, nodeId) => {
  const node = nodes.get(nodeId);
  const element = document.getElementById(`node-${nodeId}`);
  
  dragRef.current = {
    id: nodeId,
    startX: node.x,
    startY: node.y,
    mouseStartX: e.clientX,
    mouseStartY: e.clientY,
    element,
  };
  
  // 启用 GPU 加速
  element.style.willChange = 'transform';
};

// 拖拽中（RAF 节流）
const handleMouseMove = (e) => {
  if (!dragRef.current) return;
  
  // 取消上一帧
  if (rafRef.current) cancelAnimationFrame(rafRef.current);
  
  // 下一帧执行
  rafRef.current = requestAnimationFrame(() => {
    const { element, mouseStartX, mouseStartY } = dragRef.current;
    const dx = e.clientX - mouseStartX;
    const dy = e.clientY - mouseStartY;
    
    // 直接操作 DOM（不触发 React 渲染）
    element.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
  });
};

// 拖拽结束
const handleMouseUp = (e) => {
  const { id, startX, startY, mouseStartX, mouseStartY, element } = dragRef.current;
  
  // 计算最终位置
  const dx = (e.clientX - mouseStartX) / scale;
  const dy = (e.clientY - mouseStartY) / scale;
  const finalX = startX + dx;
  const finalY = startY + dy;
  
  // 更新 React State
  updateNode(id, { x: finalX, y: finalY });
  
  // 清理 DOM
  element.style.transform = '';
  element.style.willChange = '';
  
  dragRef.current = null;
};
```

### 5.3 性能对比

| 方案 | FPS | 原理 |
|------|-----|------|
| setState 每次更新 | 10-15 fps | 每次触发 React 渲染 |
| RAF + Transform | 60 fps | 跳过 React，直接操作 DOM |

---

## 6. 模块化设计

### 6.1 目录结构


```
src/
├── core/                          # 核心层（不依赖 React）
│   ├── types/                     # 类型定义
│   │   ├── node.types.ts
│   │   ├── connection.types.ts
│   │   └── viewport.types.ts
│   ├── stores/                    # 状态管理（Zustand）
│   │   ├── nodeStore.ts           # 节点数据
│   │   ├── connectionStore.ts     # 连接数据
│   │   ├── groupStore.ts          # 分组数据
│   │   └── viewportStore.ts       # 视口数据
│   ├── services/                  # 业务逻辑
│   │   ├── nodeService.ts         # 节点操作
│   │   ├── connectionService.ts   # 连接操作
│   │   ├── layoutService.ts       # 布局算法
│   │   └── storageService.ts      # 存储服务
│   └── utils/                     # 工具函数
│       ├── geometry.ts            # 几何计算
│       ├── collision.ts           # 碰撞检测
│       └── performance.ts         # 性能工具
│
├── features/                      # 功能模块
│   ├── canvas/                    # 画布功能
│   │   ├── Canvas.tsx
│   │   ├── useVirtualization.ts   # 虚拟化 Hook
│   │   ├── useDragAndDrop.ts      # 拖拽 Hook
│   │   └── useSelection.ts        # 选择 Hook
│   ├── nodes/                     # 节点功能
│   │   ├── Node.tsx               # 通用节点组件
│   │   ├── NodeRegistry.ts        # 节点注册表
│   │   └── types/                 # 各类节点
│   │       ├── MultiAngleCameraNode.tsx  # 3D 相机
│   │       ├── GridSplitterNode.tsx      # 九宫格
│   │       └── ...
│   ├── connections/               # 连接线功能
│   │   ├── ConnectionCanvas.tsx   # Canvas 渲染
│   │   └── useConnectionDraw.ts   # 绘制逻辑
│   └── groups/                    # 分组功能
│       ├── Group.tsx
│       └── useGroupOperations.ts
│
├── components/                    # 通用组件
│   ├── Toolbar.tsx
│   ├── ContextMenu.tsx
│   └── ...
│
└── App.tsx                        # 应用入口
```

### 6.2 模块职责

#### 6.2.1 Core Layer（核心层）
- **职责**：数据管理、业务逻辑、工具函数
- **特点**：不依赖 React，可独立测试
- **原则**：纯函数，无副作用

#### 6.2.2 Features Layer（功能层）
- **职责**：UI 组件、交互逻辑、Hooks
- **特点**：依赖 Core Layer，不依赖其他 Features
- **原则**：单一职责，高内聚低耦合

#### 6.2.3 Components Layer（组件层）
- **职责**：通用 UI 组件
- **特点**：无业务逻辑，纯展示
- **原则**：可复用，可配置

---

## 7. 状态管理设计

### 7.1 为什么用 Zustand？

**对比 useState**：
- ✅ 性能更好（不触发不必要的渲染）
- ✅ 代码更清晰（集中管理）
- ✅ 易于调试（DevTools）
- ✅ 支持中间件（持久化、日志）

### 7.2 NodeStore 设计

```typescript
// core/stores/nodeStore.ts
import create from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface NodeStore {
  // 数据
  nodes: Map<string, AppNode>;
  
  // 操作
  addNode: (node: AppNode) => void;
  updateNode: (id: string, updates: Partial<AppNode>) => void;
  deleteNodes: (ids: string[]) => void;
  
  // 查询
  getNode: (id: string) => AppNode | undefined;
  getNodesByType: (type: NodeType) => AppNode[];
}

export const useNodeStore = create<NodeStore>()(
  immer((set, get) => ({
    nodes: new Map(),
    
    addNode: (node) => set((state) => {
      state.nodes.set(node.id, node);
    }),
    
    updateNode: (id, updates) => set((state) => {
      const node = state.nodes.get(id);
      if (node) {
        state.nodes.set(id, { ...node, ...updates });
      }
    }),
    
    deleteNodes: (ids) => set((state) => {
      ids.forEach(id => state.nodes.delete(id));
    }),
    
    getNode: (id) => get().nodes.get(id),
    
    getNodesByType: (type) => {
      return Array.from(get().nodes.values()).filter(n => n.type === type);
    },
  }))
);
```

### 7.3 使用示例

```typescript
// 在组件中使用
const Canvas = () => {
  // 只订阅需要的数据（性能优化）
  const nodes = useNodeStore(state => state.nodes);
  const addNode = useNodeStore(state => state.addNode);
  
  const handleAddNode = () => {
    addNode({
      id: generateId(),
      type: NodeType.IMAGE_GENERATOR,
      x: 100,
      y: 100,
      // ...
    });
  };
  
  return <div>...</div>;
};
```

---

## 8. 节点注册表设计

### 8.1 为什么需要注册表？

**问题**：现在添加新节点类型需要改很多地方：
- App.tsx 的 switch case
- getNodeIcon 函数
- getNodeNameCN 函数
- Node.tsx 的渲染逻辑

**解决**：用注册表统一管理节点类型。

### 8.2 注册表设计

```typescript
// features/nodes/NodeRegistry.ts
interface NodeDefinition {
  type: NodeType;
  name: string;
  icon: React.ComponentType;
  component: React.ComponentType<{ node: AppNode }>;
  defaultData: any;
  defaultSize: { width: number; height: number };
}

class NodeRegistry {
  private registry = new Map<NodeType, NodeDefinition>();
  
  register(definition: NodeDefinition) {
    this.registry.set(definition.type, definition);
  }
  
  get(type: NodeType): NodeDefinition | undefined {
    return this.registry.get(type);
  }
  
  getAll(): NodeDefinition[] {
    return Array.from(this.registry.values());
  }
}

export const nodeRegistry = new NodeRegistry();

// 注册节点类型
nodeRegistry.register({
  type: NodeType.MULTI_ANGLE_CAMERA,
  name: '多角度相机',
  icon: LayoutTemplate,
  component: MultiAngleCameraNode,
  defaultData: {
    horizontalAngle: 0,
    verticalAngle: 0,
    cameraZoom: 5,
  },
  defaultSize: { width: 420, height: 800 },
});

nodeRegistry.register({
  type: NodeType.GRID_SPLITTER,
  name: '九宫格处理',
  icon: Grid3X3,
  component: GridSplitterNode,
  defaultData: {},
  defaultSize: { width: 420, height: 480 },
});
```

### 8.3 使用注册表

```typescript
// 添加节点
const addNode = (type: NodeType, x: number, y: number) => {
  const definition = nodeRegistry.get(type);
  if (!definition) return;
  
  const newNode: AppNode = {
    id: generateId(),
    type,
    x,
    y,
    width: definition.defaultSize.width,
    height: definition.defaultSize.height,
    title: definition.name,
    data: definition.defaultData,
    // ...
  };
  
  nodeStore.addNode(newNode);
};

// 渲染节点
const Node = ({ node }: { node: AppNode }) => {
  const definition = nodeRegistry.get(node.type);
  if (!definition) return null;
  
  const NodeComponent = definition.component;
  return <NodeComponent node={node} />;
};
```

### 8.4 优势

✅ **易于扩展**：添加新节点只需注册一次  
✅ **类型安全**：TypeScript 自动检查  
✅ **代码清晰**：所有节点定义集中管理  
✅ **支持插件**：未来可以动态注册节点

---

## 9. 保留功能迁移方案

### 9.1 3D 相机节点

**现状**：MultiAngleCameraNode.tsx 已经是独立组件  
**迁移**：
1. 移动到 `features/nodes/types/MultiAngleCameraNode.tsx`
2. 注册到 NodeRegistry
3. 保留所有现有功能（角度控制、缩放、提示词生成）

**改动**：最小化，只调整导入路径

### 9.2 九宫格处理节点

**现状**：GridSplitterNode 在 components/  
**迁移**：
1. 移动到 `features/nodes/types/GridSplitterNode.tsx`
2. 注册到 NodeRegistry
3. 保留所有现有功能

**改动**：最小化，只调整导入路径

---

## 10. 实施计划

### 10.1 阶段划分

#### 阶段 1：基础架构（3 天）
- [ ] 创建目录结构
- [ ] 实现 Zustand Stores
- [ ] 实现 NodeRegistry
- [ ] 迁移类型定义

#### 阶段 2：核心功能（5 天）
- [ ] 实现虚拟化渲染
- [ ] 实现 RAF 拖拽
- [ ] 实现 Canvas 连接线
- [ ] 迁移节点操作逻辑

#### 阶段 3：功能迁移（3 天）
- [ ] 迁移 3D 相机节点
- [ ] 迁移九宫格节点
- [ ] 迁移其他节点类型
- [ ] 迁移 Group 功能

#### 阶段 4：测试优化（2 天）
- [ ] 性能测试（1000 节点）
- [ ] Bug 修复
- [ ] 代码审查
- [ ] 文档完善

**总计**：13 天

### 10.2 风险控制

**风险 1**：重构过程中功能丢失  
**缓解**：
- 保留旧代码（重命名为 App.old.tsx）
- 分模块迁移，逐步替换
- 每个阶段都可运行

**风险 2**：性能不达标  
**缓解**：
- 每个阶段都做性能测试
- 提前验证虚拟化效果
- 准备降级方案

**风险 3**：时间超期  
**缓解**：
- 优先实现核心功能
- 非核心功能可延后
- 每天同步进度

---

## 11. 验收标准

### 11.1 功能验收
- [ ] 所有现有功能正常工作
- [ ] 3D 相机功能完整保留
- [ ] 九宫格功能完整保留
- [ ] 无崩溃、无白屏

### 11.2 性能验收
- [ ] 100 节点：60fps
- [ ] 500 节点：60fps
- [ ] 1000 节点：60fps
- [ ] 拖拽丝滑，无卡顿

### 11.3 代码质量验收
- [ ] 无 TypeScript 错误
- [ ] 无 ESLint 警告
- [ ] 代码覆盖率 > 80%
- [ ] 文档完整

### 11.4 可维护性验收
- [ ] 添加新节点类型 < 30 分钟
- [ ] 修改现有功能不影响其他模块
- [ ] 代码易于理解，注释清晰

---

## 12. 后续规划

### 12.1 短期（1 个月）
- 完善单元测试
- 添加性能监控
- 优化内存占用

### 12.2 中期（3 个月）
- 实现插件系统
- 支持自定义节点
- 支持协同编辑

### 12.3 长期（6 个月）
- Web Worker 布局计算
- OffscreenCanvas 渲染
- 服务端渲染

---

## 13. 附录

### 13.1 参考资料
- [Figma 性能优化](https://www.figma.com/blog/building-a-professional-design-tool-on-the-web/)
- [React Flow 架构](https://reactflow.dev/learn)
- [Zustand 文档](https://docs.pmnd.rs/zustand)

### 13.2 性能基准
- Figma：10000+ 图层，60fps
- Miro：5000+ 对象，60fps
- 我们的目标：1000+ 节点，60fps

---

**文档版本**：v1.0  
**创建日期**：2026-01-26  
**作者**：Kiro AI  
**审核状态**：待审核
