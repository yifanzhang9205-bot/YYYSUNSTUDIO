# SunStudio 设计系统 - 最终版本

**创建时间**: 2026-01-25  
**状态**: ✅ 已确认  
**适用范围**: 所有后续功能开发

---

## 🎨 核心设计原则

### 产品定位
- **类型**: 专业视频制作工具
- **参考**: DaVinci Resolve, Premiere Pro, Final Cut Pro
- **用户**: 自媒体创作者，高频使用（每天都用）
- **风格**: 深色专业界面，简洁直接，无多余装饰

### 设计哲学
1. **功能优先** - 每个元素都有明确目的
2. **视觉清晰** - 高对比度，易于识别
3. **交互直接** - 无需学习，符合直觉
4. **性能优先** - 流畅响应，无卡顿

---

## 🎨 配色方案

### 背景层级
```css
--bg-canvas: #0a0a0a;      /* 画布背景 */
--bg-node: #0a0a0a;        /* 节点背景（无边框时） */
--bg-card: #1a1a1a;        /* 卡片背景 */
--bg-hover: #242424;       /* 悬停背景 */
--bg-active: #2a2a2a;      /* 激活背景 */
```

### 文字颜色
```css
--text-primary: #ffffff;   /* 主要文字 (100%) */
--text-secondary: #a0a0a0; /* 次要文字 (65%) */
--text-tertiary: #666666;  /* 辅助文字 (40%) */
--text-disabled: #444444;  /* 禁用文字 (27%) */
```

### 强调色
```css
--accent-primary: #3b82f6;   /* 蓝色 - 主要操作 */
--accent-primary-hover: #2563eb; /* 蓝色悬停 */
--accent-success: #10b981;   /* 绿色 - 成功 */
--accent-warning: #f59e0b;   /* 橙色 - 警告 */
--accent-error: #ef4444;     /* 红色 - 错误 */
```

### 边框颜色
```css
--border-primary: #3b82f6;   /* 蓝色边框（选中） */
--border-secondary: #333333; /* 次要边框 */
--border-divider: #222222;   /* 分隔线 */
```

---

## 📐 尺寸规范

### 字体大小
```css
--text-xs: 11px;    /* 标签、辅助信息 */
--text-sm: 12px;    /* 次要文字 */
--text-base: 14px;  /* 正文 */
--text-lg: 16px;    /* 标题 */
--text-xl: 20px;    /* 大数字 */
```

### 字重
```css
--font-normal: 400;   /* 正文 */
--font-medium: 500;   /* 按钮、标签 */
--font-semibold: 600; /* 标题 */
```

### 间距（8px 倍数）
```css
--space-1: 4px;    /* 微小间距 */
--space-2: 8px;    /* 小间距 */
--space-3: 12px;   /* 中间距 */
--space-4: 16px;   /* 大间距 */
--space-6: 24px;   /* 超大间距 */
```

### 圆角
```css
--radius-sm: 4px;   /* 标签 */
--radius-md: 6px;   /* 按钮 */
--radius-lg: 8px;   /* 卡片 */
--radius-xl: 12px;  /* 节点 */
```

---

## 🧩 组件规范

### 按钮

#### 主要按钮（Primary）
```tsx
<button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm font-medium transition-colors active:scale-95">
  主要操作
</button>
```

#### 次要按钮（Secondary）
```tsx
<button className="px-4 py-2 bg-[#242424] hover:bg-[#2a2a2a] text-gray-400 rounded-md text-sm font-medium transition-colors active:scale-95">
  次要操作
</button>
```

#### 图标按钮
```tsx
<button className="p-1.5 hover:bg-[#242424] rounded-md transition-colors active:scale-95">
  <Icon size={14} strokeWidth={2} className="text-white/60" />
</button>
```

### 输入框

#### 文本输入
```tsx
<input
  type="text"
  className="px-3 py-1.5 bg-[#1a1a1a] border border-[#333333] rounded-md text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
  placeholder="输入内容"
/>
```

#### 多行文本
```tsx
<textarea
  className="w-full px-4 py-3 bg-[#242424] border border-[#333333] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors resize-none"
  placeholder="输入内容"
/>
```

### 卡片

#### 基础卡片
```tsx
<div className="p-4 bg-[#1a1a1a] rounded-lg hover:bg-[#242424] transition-colors">
  内容
</div>
```

#### 统计卡片
```tsx
<div className="flex flex-col items-center py-3 bg-[#1a1a1a] rounded-lg cursor-pointer hover:bg-[#242424] transition-colors">
  <Icon size={18} strokeWidth={2} className="text-white/40 mb-1.5" />
  <div className="text-xl font-medium text-white">数字</div>
  <div className="text-[11px] text-gray-500 mt-0.5">标签</div>
</div>
```

### 标签（Tag）

```tsx
<span className="px-2.5 py-0.5 bg-[#242424] rounded text-xs text-gray-500">
  标签
</span>
```

### Tab 切换

```tsx
<button
  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
    isActive
      ? 'bg-blue-500 text-white'
      : 'bg-[#1a1a1a] text-gray-400 hover:bg-[#242424]'
  }`}
>
  <Icon size={12} strokeWidth={2} />
  <span>标签</span>
</button>
```

### 对话框

```tsx
<div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm">
  <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-6 w-[500px] max-w-[90vw] shadow-2xl">
    {/* 内容 */}
  </div>
</div>
```

---

## 🎭 图标规范

### 尺寸
- **小图标**: 12px (Tab 内)
- **中图标**: 14-16px (按钮内)
- **大图标**: 18-20px (卡片内)
- **超大图标**: 40px (空状态)

### 样式
```tsx
<Icon 
  size={16} 
  strokeWidth={2}  // 统一使用 2
  className="text-white/40"  // 根据场景调整透明度
/>
```

---

## 🎬 动画规范

### 过渡时间
```css
--transition-fast: 150ms;    /* 快速反馈 */
--transition-normal: 200ms;  /* 标准过渡 */
--transition-slow: 300ms;    /* 慢速过渡 */
```

### 常用动画
```tsx
// 颜色过渡
className="transition-colors"

// 缩放反馈
className="active:scale-95"

// 透明度过渡
className="transition-opacity"

// 全部过渡
className="transition-all"
```

---

## 📱 响应式规范

### 断点
```css
--breakpoint-sm: 640px;   /* 手机 */
--breakpoint-md: 768px;   /* 平板 */
--breakpoint-lg: 1024px;  /* 桌面 */
--breakpoint-xl: 1280px;  /* 大屏 */
```

### 节点尺寸
```css
--node-width: 420px;      /* 标准节点宽度 */
--node-min-height: 400px; /* 最小高度 */
```

---

## ✅ 实施检查清单

### 视觉检查
- [ ] 配色完全匹配（#0a0a0a, #1a1a1a, #242424）
- [ ] 文字对比度清晰（白色 vs 灰色）
- [ ] 图标大小统一（strokeWidth={2}）
- [ ] 间距使用 8px 倍数
- [ ] 圆角统一（4px/6px/8px/12px）
- [ ] 边框颜色统一（#222222/#333333）

### 交互检查
- [ ] 按钮有 hover 状态（bg-[#242424] → bg-[#2a2a2a]）
- [ ] 按钮有 active 状态（active:scale-95）
- [ ] 主要按钮使用蓝色（bg-blue-500）
- [ ] 次要按钮使用灰色（bg-[#242424]）
- [ ] 输入框有 focus 状态（border-blue-500）
- [ ] 过渡动画流畅（transition-colors）

### 功能检查
- [ ] 空状态清晰（图标 + 文字 + 按钮）
- [ ] 加载状态明确（旋转动画）
- [ ] 错误提示清晰（红色背景 + 边框）
- [ ] 成功反馈明确（绿色提示）

---

## 🚫 禁止使用

### 不要使用的样式
❌ `backdrop-blur-xl` - 过度的玻璃态效果  
❌ `bg-white/[0.04]` - 过低的透明度  
❌ `rounded-full` - 圆形按钮（除非特殊情况）  
❌ `rounded-2xl` - 过大的圆角  
❌ `font-light` - 过轻的字重  
❌ `tracking-tight` - 过紧的字间距  
❌ `strokeWidth={1.5}` - 过细的图标线条  

### 不要使用的颜色
❌ `text-white/90` - 使用 `text-white` 代替  
❌ `text-white/60` - 使用 `text-gray-400` 代替  
❌ `text-white/40` - 使用 `text-gray-600` 代替  
❌ `border-white/10` - 使用 `border-[#333333]` 代替  

---

## 📝 代码示例

### ScriptNode 空状态（标准模板）
```tsx
<div className="w-full h-full flex flex-col items-center justify-center p-12 bg-[#0a0a0a]">
  <div className="w-14 h-14 rounded-full bg-[#1a1a1a] flex items-center justify-center mb-5">
    <Film size={24} strokeWidth={2} className="text-white/40" />
  </div>
  <h3 className="text-base font-medium text-white mb-1.5">创建影视剧本</h3>
  <p className="text-sm text-gray-400 text-center mb-8 max-w-xs leading-relaxed">
    输入创意，AI 生成专业剧本结构
  </p>
  <button className="px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm font-medium transition-colors active:scale-95">
    开始创作
  </button>
</div>
```

---

## 🎯 后续开发规范

**所有新功能必须遵循这个设计系统**：

1. ✅ 使用上面定义的配色方案
2. ✅ 使用上面定义的字体和间距
3. ✅ 使用上面定义的组件样式
4. ✅ 使用上面定义的图标规范
5. ✅ 使用上面定义的动画规范
6. ✅ 通过实施检查清单验证

**如果需要偏离规范，必须先讨论并更新此文档。**

---

**最终确认时间**: 2026-01-25  
**确认人**: 用户  
**状态**: ✅ 已锁定，后续严格执行
