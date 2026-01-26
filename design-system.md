# SunStudio 设计系统 v2.0
## Enhanced Glassmorphism + Dark Mode

### 核心原则
- 深度层次：通过透明度和模糊创建视觉层级
- 一致性：所有组件使用统一的玻璃效果和间距
- 流畅性：Apple Physics Curve 动效贯穿始终
- 专业性：精致的细节和微妙的视觉反馈

---

## 配色方案

### 主色调
```css
--bg-primary: #0a0a0c        /* 主背景 */
--bg-elevated: #12121a       /* 提升层背景 */
--glass-base: rgba(255, 255, 255, 0.08)    /* 玻璃基础 */
--glass-hover: rgba(255, 255, 255, 0.12)   /* 玻璃悬停 */
--glass-active: rgba(255, 255, 255, 0.16)  /* 玻璃激活 */
```

### 强调色
```css
--accent-primary: #06b6d4    /* cyan-500 - 主要操作 */
--accent-secondary: #94a3b8  /* slate-400 - 次要操作 */
--accent-success: #10b981    /* emerald-500 - 成功状态 */
--accent-warning: #f59e0b    /* amber-500 - 警告状态 */
--accent-danger: #fb7185     /* rose-400 - 危险操作 */
```

### 边框
```css
--border-subtle: rgba(255, 255, 255, 0.05)   /* 微妙边框 */
--border-default: rgba(255, 255, 255, 0.10)  /* 默认边框 */
--border-strong: rgba(255, 255, 255, 0.20)   /* 强调边框 */
```

### 文字
```css
--text-primary: rgba(255, 255, 255, 0.95)    /* 主要文字 */
--text-secondary: rgba(255, 255, 255, 0.70)  /* 次要文字 */
--text-tertiary: rgba(255, 255, 255, 0.50)   /* 三级文字 */
--text-disabled: rgba(255, 255, 255, 0.30)   /* 禁用文字 */
```

---

## 组件规范

### 1. 卡片/节点
```css
基础状态:
  bg-white/8
  border border-white/10
  backdrop-blur-xl
  rounded-2xl
  shadow-lg

悬停状态:
  bg-white/12
  border-white/15
  shadow-xl shadow-cyan-500/10
  transition-all duration-200

选中状态:
  border-cyan-400
  ring-2 ring-cyan-500/20
  shadow-2xl shadow-cyan-500/20
```

### 2. 按钮

**主要按钮 (Primary)**
```css
bg-cyan-500
hover:bg-cyan-400
text-white
shadow-lg shadow-cyan-500/30
hover:shadow-xl hover:shadow-cyan-500/40
```

**次要按钮 (Secondary)**
```css
bg-white/10
hover:bg-white/15
border border-white/20
text-white/90
```

**危险按钮 (Danger)**
```css
bg-rose-500/20
hover:bg-rose-500/30
border border-rose-400/30
text-rose-300
```

### 3. 输入框
```css
bg-white/5
border border-white/10
focus:border-cyan-400
focus:ring-2 focus:ring-cyan-500/20
backdrop-blur-xl
```

### 4. 工具栏/面板
```css
bg-[#2c2c2e]/70
backdrop-blur-xl
border border-white/5
rounded-3xl (侧边栏)
rounded-2xl (浮动面板)
```

### 5. 模态框/对话框
```css
背景遮罩: bg-black/90 backdrop-blur-xl
内容区: bg-[#1a1a1f]/95 backdrop-blur-2xl
边框: border-white/10
```

---

## 间距系统

```css
--spacing-xs: 4px    /* 0.5 */
--spacing-sm: 8px    /* 1 */
--spacing-md: 16px   /* 2 */
--spacing-lg: 24px   /* 3 */
--spacing-xl: 32px   /* 4 */
--spacing-2xl: 48px  /* 6 */
```

---

## 圆角系统

```css
--radius-sm: 8px     /* rounded-lg */
--radius-md: 12px    /* rounded-xl */
--radius-lg: 16px    /* rounded-2xl */
--radius-xl: 24px    /* rounded-3xl */
--radius-full: 9999px /* rounded-full */
```

---

## 阴影系统

```css
--shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.1)
--shadow-md: 0 4px 16px rgba(0, 0, 0, 0.15)
--shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.2)
--shadow-xl: 0 16px 48px rgba(0, 0, 0, 0.25)

/* 发光阴影 */
--shadow-glow-cyan: 0 8px 32px rgba(6, 182, 212, 0.2)
--shadow-glow-rose: 0 8px 32px rgba(251, 113, 133, 0.2)
```

---

## 动效系统

```css
--ease-spring: cubic-bezier(0.32, 0.72, 0, 1)  /* Apple Physics */
--duration-fast: 150ms
--duration-normal: 200ms
--duration-slow: 300ms
```

**标准过渡**
```css
transition: all 200ms cubic-bezier(0.32, 0.72, 0, 1)
```

---

## 层级系统 (z-index)

```css
--z-base: 0           /* 基础层 */
--z-dropdown: 10      /* 下拉菜单 */
--z-sticky: 20        /* 固定元素 */
--z-overlay: 30       /* 遮罩层 */
--z-modal: 40         /* 模态框 */
--z-popover: 50       /* 弹出层 */
--z-tooltip: 60       /* 提示框 */
--z-notification: 70  /* 通知 */
```

---

## 状态颜色

```css
空闲 (Idle): text-white/70
生成中 (Generating): text-cyan-400 + 脉冲动画
成功 (Success): text-emerald-400
错误 (Error): text-rose-400
警告 (Warning): text-amber-400
```

---

## 图标规范

- 使用 Lucide React 图标库
- 默认尺寸: 20px (size={20})
- 小图标: 16px (size={16})
- 大图标: 24px (size={24})
- 描边宽度: strokeWidth={2}

---

## 无障碍规范

- 最小对比度: 4.5:1 (WCAG AA)
- 焦点状态: ring-2 ring-cyan-500/50
- 键盘导航: 所有交互元素可聚焦
- 动画: 支持 prefers-reduced-motion

---

## 响应式断点

```css
sm: 640px   /* 手机横屏 */
md: 768px   /* 平板 */
lg: 1024px  /* 笔记本 */
xl: 1280px  /* 桌面 */
2xl: 1536px /* 大屏 */
```
