# 资产库 + 组功能重构 - 快速参考

**日期**: 2026-02-08  
**状态**: 📋 设计完成，待实施

---

## 📋 项目概述

将工作流功能替换为资产库，并重构组功能的交互逻辑。

---

## 🎯 核心变更

### 1. 删除工作流功能
- 侧边栏第 2 个按钮：工作流 → 资产库
- 图标：FolderHeart
- 功能：保存和复用节点组合

### 2. 重构组功能
```
旧逻辑：框选 → 自动创建组
新逻辑：框选 → 显示工具栏（创建资产 / 打组）
```

### 3. 增强组功能
- 自定义颜色（7 种）
- 自动排列（水平 / 宫格）
- 解组

---

## 🎨 资产库分类

1. **全部** - 显示所有资产
2. **人物** - 角色、人物相关
3. **场景** - 背景、环境
4. **物品** - 道具、物体
5. **风格** - 风格化效果
6. **其他** - 其他类型

---

## 🎨 组颜色方案

| 颜色 | 背景 | 边框 |
|------|------|------|
| 默认 | `bg-gray-100/50` | `border-gray-400` |
| 蓝色 | `bg-blue-100/30` | `border-blue-500` |
| 绿色 | `bg-green-100/30` | `border-green-500` |
| 黄色 | `bg-yellow-100/30` | `border-yellow-500` |
| 红色 | `bg-red-100/30` | `border-red-500` |
| 紫色 | `bg-purple-100/30` | `border-purple-500` |
| 橙色 | `bg-orange-100/30` | `border-orange-500` |

---

## 📐 缩略图生成规则

1. **有图片节点** → 使用第一个图片
2. **无图片 + 用户上传** → 使用用户上传的图片
3. **无图片 + 无上传** → 显示资产名称的首字母（彩色背景）

---

## 🔄 交互流程

### 创建资产
```
框选节点 → 点击"创建资产" → 输入名称 + 选择分类 → 保存
```

### 打组
```
框选节点 → 点击"打组" → 创建组 → 显示组工具栏
```

### 使用资产
```
拖拽资产卡片到画布 → 在鼠标位置创建节点
```

---

## 📊 实施计划

| 阶段 | 任务 | 时间 |
|------|------|------|
| 阶段 1 | 重构选择逻辑 | 2-3 天 |
| 阶段 2 | 资产库功能 | 3-4 天 |
| 阶段 3 | 组功能增强 | 2-3 天 |
| 阶段 4 | 数据迁移和优化 | 1-2 天 |
| **总计** | **24 个任务** | **8-12 天** |

---

## 📁 文档结构

```
.kiro/specs/asset-library-and-group-refactor/
├── README.md           # 快速参考（本文件）
├── requirements.md     # 详细需求文档
├── design.md           # UI 设计规范
└── tasks.md            # 任务分解
```

---

## 🚀 开始实施

### 第一步：阅读文档
1. 阅读 `requirements.md`（了解需求）
2. 阅读 `design.md`（了解设计）
3. 阅读 `tasks.md`（了解任务）

### 第二步：开始开发
按照 `tasks.md` 的顺序，逐个完成任务。

### 第三步：测试验收
完成每个阶段后，进行测试验收。

---

## ✅ 验收标准

### 功能验收
- [ ] 框选节点后显示临时工具栏
- [ ] 创建资产功能正常
- [ ] 资产库显示正常
- [ ] 资产拖拽到画布正常
- [ ] 打组功能正常
- [ ] 组颜色功能正常
- [ ] 自动排列功能正常
- [ ] 解组功能正常

### UI 验收
- [ ] 所有 UI 符合设计规范
- [ ] 所有交互流畅
- [ ] 所有动画正常

### 代码验收
- [ ] 没有编译错误
- [ ] 没有 TypeScript 类型错误
- [ ] 遵循架构规范

---

## 📝 关键技术点

### 1. 深拷贝节点数据
```typescript
const deepCopyNodes = (nodes: AppNode[]): AppNode[] => {
  return nodes.map(node => ({
    ...node,
    data: JSON.parse(JSON.stringify(node.data)),
  }));
};
```

### 2. 生成首字母缩略图
```typescript
const generateTextThumbnail = (letter: string, bgColor: string): string => {
  const canvas = document.createElement('canvas');
  canvas.width = 200;
  canvas.height = 200;
  
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, 200, 200);
  
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 100px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(letter, 100, 100);
  
  return canvas.toDataURL('image/png');
};
```

### 3. 水平布局算法
```typescript
const arrangeHorizontal = (groupId: string) => {
  const groupNodes = getGroupNodes(groupId);
  const horizontalGap = 80;
  
  let currentX = startX;
  groupNodes.forEach(node => {
    onUpdateNode(node.id, { x: currentX, y: centerY });
    currentX += (node.width || 420) + horizontalGap;
  });
};
```

---

## 🎯 下一步

准备好开始实施了吗？

请确认：
- [ ] 已阅读所有文档
- [ ] 理解所有需求
- [ ] 理解所有设计
- [ ] 理解所有任务

确认后，我将开始实施！🚀
