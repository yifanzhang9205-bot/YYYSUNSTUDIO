# UI 优化 - 样式替换清单

## 全局替换规则

### 1. 背景色优化
```
bg-zinc-900/50 → bg-white/8 backdrop-blur-xl
bg-zinc-900 → bg-white/5
bg-black/10 → bg-white/5
bg-black/20 → bg-white/8
bg-white/5 → bg-white/8 (卡片)
```

### 2. 边框优化
```
border-white/5 → border-white/10
border border-white/5 → border border-white/10
```

### 3. 悬停状态
```
hover:bg-white/10 → hover:bg-white/12
hover:bg-black/30 → hover:bg-white/12
```

### 4. 按钮样式统一

**主要按钮 (生成/执行)**
```
旧: bg-cyan-500 hover:bg-cyan-600
新: bg-cyan-500 hover:bg-cyan-400 shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40
```

**次要按钮**
```
旧: bg-white/10 hover:bg-white/20
新: bg-white/10 hover:bg-white/15 border border-white/20
```

**危险按钮 (删除)**
```
旧: bg-red-500/20 hover:bg-red-500/30
新: bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/30 text-rose-300
```

### 5. 输入框统一
```
旧: bg-white/5 border-white/10
新: bg-white/5 border border-white/10 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 backdrop-blur-xl
```

### 6. 下拉菜单
```
旧: bg-[#2c2c2e]/90
新: bg-[#2c2c2e]/95 backdrop-blur-2xl border border-white/10 shadow-2xl
```

### 7. 圆角统一
```
rounded-lg → rounded-xl (小元素)
rounded-xl → rounded-2xl (卡片)
rounded-2xl → rounded-3xl (大面板)
```

---

## 组件级优化

### Node.tsx

**节点容器 (主卡片)**
```tsx
// 当前
className="relative bg-zinc-900/50 backdrop-blur-md border border-white/5 rounded-2xl shadow-xl overflow-hidden"

// 优化后
className="relative bg-white/8 backdrop-blur-xl border border-white/10 rounded-2xl shadow-lg hover:shadow-xl hover:shadow-cyan-500/10 transition-all duration-200 overflow-hidden"

// 选中状态添加
className="... border-2 border-cyan-400 ring-2 ring-cyan-500/20 shadow-2xl shadow-cyan-500/20"
```

**标题栏**
```tsx
// 当前
className="px-4 py-2 bg-gradient-to-r from-slate-800/50 to-transparent"

// 优化后
className="px-4 py-2 bg-white/5 backdrop-blur-sm border-b border-white/10"
```

**生成按钮**
```tsx
// 当前
className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg"

// 优化后
className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-white rounded-xl shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40 transition-all duration-200"
```

**删除按钮**
```tsx
// 当前
className="p-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg"

// 优化后
className="p-1.5 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/30 text-rose-300 rounded-xl transition-all duration-200"
```

**输入框 (Prompt)**
```tsx
// 当前
className="w-full h-full bg-transparent resize-none focus:outline-none"

// 优化后 (父容器)
className="flex-1 bg-white/5 rounded-2xl border border-white/10 p-4 backdrop-blur-xl hover:bg-white/8 transition-colors"
```

**下拉菜单**
```tsx
// 当前
className="absolute mt-1 bg-[#2c2c2e]/90 backdrop-blur-xl rounded-lg"

// 优化后
className="absolute mt-2 bg-[#2c2c2e]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
```

**图片/视频容器**
```tsx
// 当前
className="w-full h-full relative group/media overflow-hidden bg-zinc-900"

// 优化后
className="w-full h-full relative group/media overflow-hidden bg-white/5"
```

---

### GroupToolbar.tsx

**工具栏容器**
```tsx
// 当前
className="fixed bg-[#2c2c2e]/70 backdrop-blur-xl border border-white/5 rounded-2xl"

// 优化后
className="fixed bg-[#2c2c2e]/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl"
```

**按钮**
```tsx
// 当前
className="p-2 hover:bg-white/10 rounded-lg"

// 优化后
className="p-2 hover:bg-white/15 rounded-xl transition-all duration-200"
```

**下拉菜单**
```tsx
// 当前
className="absolute mt-2 bg-[#2c2c2e]/90 backdrop-blur-xl rounded-lg"

// 优化后
className="absolute mt-2 bg-[#2c2c2e]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl"
```

---

### SidebarDock.tsx

**容器 (已经很好，微调)**
```tsx
// 当前
className="fixed left-2 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1 p-px bg-[#2c2c2e]/70 backdrop-blur-xl border border-white/5 rounded-3xl"

// 优化后
className="fixed left-2 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1 p-px bg-[#2c2c2e]/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl"
```

---

### SettingsModal.tsx

**遮罩**
```tsx
// 当前
className="fixed inset-0 bg-black/80 backdrop-blur-sm"

// 优化后
className="fixed inset-0 bg-black/90 backdrop-blur-xl"
```

**面板**
```tsx
// 当前
className="bg-[#1a1a1f] border border-white/10 rounded-2xl"

// 优化后
className="bg-[#1a1a1f]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl"
```

---

## 实施顺序

1. ✅ 创建设计系统文档
2. ✅ 创建样式替换清单
3. ⏳ 优化 Node.tsx (分批次)
4. ⏳ 优化 GroupToolbar.tsx
5. ⏳ 优化 SidebarDock.tsx
6. ⏳ 优化 SettingsModal.tsx
7. ⏳ 优化其他组件
8. ⏳ 全局测试

---

## 测试检查清单

- [ ] 节点卡片悬停效果流畅
- [ ] 选中状态清晰可见
- [ ] 按钮悬停有明显反馈
- [ ] 输入框焦点状态清晰
- [ ] 下拉菜单层级正确
- [ ] 玻璃效果在深色背景下可见
- [ ] 所有动画使用 Apple Physics Curve
- [ ] 响应式布局正常
- [ ] 性能无明显下降
