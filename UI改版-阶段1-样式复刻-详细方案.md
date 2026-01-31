# UI 改版 - 阶段 1：样式复刻 - 详细方案

> 📅 实施时间：2026-02-01
> ⏱️ 预计耗时：5-6 小时
> 🎯 目标：100% 复刻 React Flow UI 样式

---

## 📋 改动文件清单

### 必改文件（8 个）

1. `App.tsx` - 画布、背景、连接线
2. `components/Node.tsx` - 节点卡片
3. `components/SidebarDock.tsx` - 侧边栏
4. `components/GroupToolbar.tsx` - 组工具栏
5. `components/Minimap.tsx` - 小地图
6. `components/SettingsModal.tsx` - 设置面板
7. `components/AssistantPanel.tsx` - 助手面板
8. `components/ChatWindow.tsx` - 聊天窗口

### 新建文件（2 个）

9. `styles/theme.ts` - 主题配置
10. `styles/reactflow.css` - React Flow 样式

### 修改文件（1 个）

11. `index.html` - 添加 Inter 字体

---

## 🎨 React Flow 配色方案

### 亮色主题

```typescript
export const lightTheme = {
  // 背景
  background: '#ffffff',
  backgroundPattern: '#f3f4f6',
  
  // 节点
  nodeBg: '#ffffff',
  nodeBorder: '#e5e7eb',
  nodeText: '#1f2937',
  nodeTextSecondary: '#6b7280',
  nodeShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
  
  // 连接线
  edge: '#b1b1b7',
  edgeHover: '#6b7280',
  edgeSelected: '#0041d0',
  
  // 控制栏
  controlBg: '#ffffff',
  controlBorder: '#e5e7eb',
  controlText: '#374151',
  controlHover: '#f3f4f6',
  
  // 主色
  primary: '#0041d0',
  primaryHover: '#0033a6',
  secondary: '#ff0072',
  secondaryHover: '#cc005b',
  
  // 状态色
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
};
```

### 暗色主题

```typescript
export const darkTheme = {
  // 背景
  background: '#1a1a1a',
  backgroundPattern: '#2d2d2d',
  
  // 节点
  nodeBg: '#2d2d2d',
  nodeBorder: '#404040',
  nodeText: '#ffffff',
  nodeTextSecondary: '#9ca3af',
  nodeShadow: '0 4px 6px -1px rgb(0 0 0 / 0.3)',
  
  // 连接线
  edge: '#555555',
  edgeHover: '#777777',
  edgeSelected: '#3b82f6',
  
  // 控制栏
  controlBg: '#2d2d2d',
  controlBorder: '#404040',
  controlText: '#e5e7eb',
  controlHover: '#404040',
  
  // 主色
  primary: '#3b82f6',
  primaryHover: '#2563eb',
  secondary: '#ec4899',
  secondaryHover: '#db2777',
  
  // 状态色
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
};
```

---

## 📝 详细改动说明

### 改动 1：创建主题配置文件

**文件**：`styles/theme.ts`（新建）

**内容**：完整的主题配置（见上方配色方案）

**用途**：
- 统一管理所有颜色
- 支持亮色/暗色切换
- 方便后续维护

---

### 改动 2：修改 index.html

**文件**：`index.html`

**改动位置**：`<head>` 标签内

**添加内容**：
```html
<!-- Inter 字体 -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

**CSS 全局样式**：
```css
body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
```

---

### 改动 3：修改 App.tsx

**改动内容**：

1. **背景样式**（从渐变 → 点状网格）
2. **连接线样式**（从直线 → 贝塞尔曲线）
3. **画布样式**（调整颜色）

**具体改动**：见下一份文档

---

## ⏱️ 实施时间表

### 第 1 小时：准备工作

- [ ] 创建备份（运行 backup-before-ui-redesign.bat）
- [ ] 创建 `styles/theme.ts`
- [ ] 修改 `index.html`（添加字体）
- [ ] 测试字体加载

### 第 2 小时：节点样式

- [ ] 修改 `components/Node.tsx`
- [ ] 测试所有节点类型
- [ ] 修复样式问题

### 第 3 小时：画布和连接线

- [ ] 修改 `App.tsx`（背景）
- [ ] 修改 `App.tsx`（连接线）
- [ ] 测试交互

### 第 4 小时：侧边栏和工具栏

- [ ] 修改 `components/SidebarDock.tsx`
- [ ] 修改 `components/GroupToolbar.tsx`
- [ ] 测试功能

### 第 5 小时：其他组件

- [ ] 修改 `components/Minimap.tsx`
- [ ] 修改 `components/SettingsModal.tsx`
- [ ] 修改 `components/AssistantPanel.tsx`
- [ ] 修改 `components/ChatWindow.tsx`

### 第 6 小时：测试和修复

- [ ] 全面测试所有功能
- [ ] 修复发现的问题
- [ ] 验收

---

## ✅ 验收标准

### 视觉验收

- [ ] 节点卡片样式 100% 还原
- [ ] 连接线样式 100% 还原
- [ ] 背景样式 100% 还原
- [ ] 侧边栏样式 100% 还原
- [ ] 所有组件风格统一

### 功能验收

- [ ] 所有现有功能正常
- [ ] 无新增 Bug
- [ ] 性能无下降
- [ ] 内存占用无增加

---

## 🚨 注意事项

1. **只改样式，不改逻辑**
2. **保持 className 结构**（方便后续维护）
3. **使用 Tailwind 类名**（不写内联样式）
4. **测试所有节点类型**（确保无遗漏）
5. **随时可以回滚**（如果不满意）

---

## 📞 下一步

**请确认**：
1. 是否立即运行备份脚本？
2. 是否开始修改代码？

**我会**：
1. 创建每个文件的详细改动文档
2. 逐个文件修改
3. 每改一个文件就测试一次

---

**💬 说"开始备份"，我们立即执行！**
