# SunStudio UI 优化实施计划
## Enhanced Glassmorphism 全面升级

### 优化目标
✅ 统一视觉语言
✅ 增强深度层次
✅ 提升交互反馈
✅ 保持性能优化

---

## 第一阶段：核心组件优化

### 1. Node.tsx - 节点组件 ⭐ 最高优先级
**当前状态：** 基础玻璃效果
**优化内容：**
- 卡片背景：`bg-zinc-900/50` → `bg-white/8 backdrop-blur-xl`
- 边框：`border-white/5` → `border-white/10`
- 悬停：添加 `shadow-xl shadow-cyan-500/10`
- 选中：添加 `ring-2 ring-cyan-500/20 shadow-2xl shadow-cyan-500/20`
- 按钮：统一使用设计系统的按钮样式
- 输入框：统一玻璃效果

### 2. GroupToolbar.tsx - 组工具栏
**当前状态：** 基础样式
**优化内容：**
- 容器：`bg-[#2c2c2e]/70` → `bg-[#2c2c2e]/80 backdrop-blur-xl`
- 边框：`border-white/5` → `border-white/10`
- 按钮：统一悬停效果
- 下拉菜单：增强玻璃效果

### 3. SidebarDock.tsx - 侧边栏
**当前状态：** ✅ 已经很好
**微调内容：**
- 保持当前设计
- 微调边框透明度 5% → 10%
- 统一按钮悬停效果

---

## 第二阶段：面板和模态框

### 4. SettingsModal.tsx - 设置面板
**优化内容：**
- 背景遮罩：`bg-black/80` → `bg-black/90 backdrop-blur-xl`
- 面板：增强玻璃效果
- 输入框：统一样式
- 按钮：统一设计系统

### 5. ChatWindow.tsx - 聊天窗口
**优化内容：**
- 容器：增强玻璃效果
- 消息气泡：统一圆角和阴影
- 输入框：统一样式

### 6. SmartSequenceDock.tsx - 智能序列面板
**优化内容：**
- 统一玻璃效果
- 卡片样式一致化

---

## 第三阶段：特殊节点组件

### 7. MultiAngleCameraNode.tsx - 多角度相机
**注意：** 不改变功能，只优化视觉
**优化内容：**
- 控制面板：统一玻璃效果
- 按钮：统一样式
- 滑块：统一样式

### 8. StoryStudioNode.tsx - 创意工作室
**优化内容：**
- 卡片：统一玻璃效果
- 按钮：统一样式

### 9. GridSplitterNode.tsx - 九宫格处理
**优化内容：**
- 网格卡片：统一样式
- 按钮：统一样式

---

## 第四阶段：辅助组件

### 10. Minimap.tsx - 小地图
**优化内容：**
- 容器：增强玻璃效果
- 节点缩略图：统一样式

### 11. ImageCropper.tsx - 图片裁剪
**优化内容：**
- 工具栏：统一玻璃效果
- 按钮：统一样式

### 12. SketchEditor.tsx - 草图编辑器
**优化内容：**
- 工具栏：统一玻璃效果
- 按钮：统一样式

---

## 统一的 CSS 类名

### 玻璃卡片
```tsx
// 基础卡片
className="bg-white/8 backdrop-blur-xl border border-white/10 rounded-2xl shadow-lg"

// 悬停卡片
className="bg-white/8 backdrop-blur-xl border border-white/10 rounded-2xl shadow-lg hover:bg-white/12 hover:border-white/15 hover:shadow-xl hover:shadow-cyan-500/10 transition-all duration-200"

// 选中卡片
className="bg-white/8 backdrop-blur-xl border-2 border-cyan-400 rounded-2xl shadow-2xl shadow-cyan-500/20 ring-2 ring-cyan-500/20"
```

### 按钮样式
```tsx
// 主要按钮
className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-white rounded-xl shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40 transition-all duration-200"

// 次要按钮
className="px-4 py-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white/90 rounded-xl transition-all duration-200"

// 危险按钮
className="px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/30 text-rose-300 rounded-xl transition-all duration-200"

// 图标按钮
className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/15 flex items-center justify-center text-white/70 hover:text-white transition-all duration-200"
```

### 输入框
```tsx
className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none backdrop-blur-xl transition-all duration-200"
```

### 下拉菜单
```tsx
className="absolute mt-2 bg-[#2c2c2e]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
```

---

## 实施步骤

1. ✅ 创建设计系统文档
2. ⏳ 优化 Node.tsx（核心组件）
3. ⏳ 优化 GroupToolbar.tsx
4. ⏳ 优化其他面板组件
5. ⏳ 优化特殊节点组件
6. ⏳ 全局测试和微调

---

## 注意事项

- ⚠️ 不改变 3D 相机的功能逻辑
- ⚠️ 保持所有现有功能
- ⚠️ 只优化视觉效果
- ⚠️ 确保性能不受影响
- ⚠️ 保持响应式设计
