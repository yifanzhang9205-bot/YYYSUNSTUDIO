# 3D 相机 UI 改进 - 距离控制和显示

## 修复时间
2026-01-24

## 问题描述

### 问题 1：滚轮控制距离范围错误

**用户反馈：**
> "现在还是只能通过设置里去选择大特写，最近的那个没法通过 UI 移动相机实现"

**问题分析：**
- 滚轮控制的距离范围被错误地设置为 0-14
- 实际应该是 0-10（符合需求文档）
- 导致无法通过滚轮达到极特写（0）的位置

**代码问题：**
```typescript
// ❌ 错误：范围 0-14
const newZoom = Math.max(0, Math.min(14, cameraZoom + e.deltaY * 0.01));
```

### 问题 2：UI 显示缺少距离信息

**用户反馈：**
> "另外现在左上方只显示方位和俯拍仰拍等等，不显示距离，加上会更好的选择相机位置"

**问题分析：**
- 左上角的胶囊只显示：方位（如"正面"）+ 俯仰（如"平视"）
- 缺少距离信息（如"中景"）
- 用户无法直观看到当前的距离档位

**当前显示：**
```
[正面 · 平视]
```

**期望显示：**
```
[正面 · 平视 · 中景]
```

## 解决方案

### 修复 1：统一距离范围为 0-10

**修改位置 1：滚轮控制（handleWheel）**
```typescript
// ✅ 修复后：范围 0-10
const newZoom = Math.max(0, Math.min(10, cameraZoom + e.deltaY * 0.01));
```

**修改位置 2：Shift+拖拽控制（onMove）**
```typescript
// ✅ 修复前：范围 0-14
if (e.shiftKey) {
  newZ = Math.max(0, Math.min(14, dragStateRef.current.startZ + dy * 0.05));
}

// ✅ 修复后：范围 0-10
if (e.shiftKey) {
  newZ = Math.max(0, Math.min(10, dragStateRef.current.startZ + dy * 0.05));
}
```

**修改位置 3：Shift+拖拽结束（onUp）**
```typescript
// ✅ 修复前：范围 0-14
if (e.shiftKey) {
  const newZ = Math.max(0, Math.min(14, dragStateRef.current.startZ + dy * 0.05));
  onZoomChange(newZ);
}

// ✅ 修复后：范围 0-10
if (e.shiftKey) {
  const newZ = Math.max(0, Math.min(10, dragStateRef.current.startZ + dy * 0.05));
  onZoomChange(newZ);
}
```

### 修复 2：添加距离显示

**修改位置：顶部胶囊显示**
```typescript
// ✅ 修复前：只显示方位和俯仰
<div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5">
  <span className="text-[11px] text-white/50 font-medium">{nearestAz.label}</span>
  <span className="text-white/20">·</span>
  <span className="text-[11px] text-white/50 font-medium">{nearestEl.label}</span>
</div>

// ✅ 修复后：显示方位、俯仰、距离
<div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5">
  <span className="text-[11px] text-white/50 font-medium">{nearestAz.label}</span>
  <span className="text-white/20">·</span>
  <span className="text-[11px] text-white/50 font-medium">{nearestEl.label}</span>
  <span className="text-white/20">·</span>
  <span className="text-[11px] text-white/50 font-medium">{nearestDist.label}</span>
</div>
```

## 修复效果

### 效果 1：完整的距离控制范围

**修复前：**
- ❌ 滚轮只能控制到 0-14（超出需求范围）
- ❌ 无法通过 UI 达到极特写（0）
- ❌ 需要通过设置面板手动选择

**修复后：**
- ✅ 滚轮可以控制 0-10 的完整范围
- ✅ 可以通过滚轮达到极特写（0）
- ✅ 可以通过 Shift+拖拽达到极特写（0）
- ✅ 符合需求文档的距离范围定义

### 效果 2：完整的 UI 显示

**修复前：**
```
顶部胶囊：[正面 · 平视]
右侧数值：水平 0° | 垂直 0° | 距离 5.0
```
- ❌ 顶部胶囊缺少距离信息
- ❌ 用户需要看右侧数值才能知道距离

**修复后：**
```
顶部胶囊：[正面 · 平视 · 中景]
右侧数值：水平 0° | 垂直 0° | 距离 5.0
```
- ✅ 顶部胶囊显示完整信息（方位 + 俯仰 + 距离）
- ✅ 用户一眼就能看到当前的距离档位
- ✅ 更直观的相机位置反馈

## 距离档位映射

**完整的距离范围（0-10）：**

| cameraZoom 值 | 距离术语 | 中文标签 |
|--------------|---------|---------|
| 0 - 1.5 | Extreme Close-Up (ECU) | 极特写 |
| 1.5 - 3 | Close-Up (CU) | 特写 |
| 3 - 4.5 | Medium Shot (MS) | 近景 |
| 4.5 - 6 | Medium Full Shot (MFS) | 中景 |
| 6 - 7.5 | Full Shot (FS) | 全身 |
| 7.5 - 9 | Long Shot (LS) | 远景 |
| 9 - 10 | Extreme Long Shot (ELS) | 大远景 |

**预设按钮：**
- 极特写：0
- 特写：1.5
- 近景：3
- 中景：5
- 全身：7
- 远景：9
- 大远景：10

## 操作方式

### 方式 1：滚轮控制（推荐）

1. 点击选中节点（确保 `isExpanded = true`）
2. 在 3D 视口上滚动鼠标滚轮
   - 向上滚：相机推进（距离减小，更近）
   - 向下滚：相机拉远（距离增大，更远）
3. 范围：0-10（可以达到极特写）

### 方式 2：Shift+拖拽控制

1. 点击选中节点
2. 按住 Shift 键
3. 在 3D 视口上拖拽鼠标
   - 向上拖：相机推进（距离减小，更近）
   - 向下拖：相机拉远（距离增大，更远）
4. 范围：0-10（可以达到极特写）

### 方式 3：设置面板预设按钮

1. 点击"设置"按钮打开设置面板
2. 在"距离"区域点击预设按钮
   - 极特写、特写、近景、中景、全身、远景、大远景
3. 或使用精确调整滑块（0-10，步长 0.5）

## 文件变更

### 修改的文件
- `components/MultiAngleCameraNode.tsx`：
  - 第 710 行：修复滚轮控制范围（14 → 10）
  - 第 596 行：修复 Shift+拖拽控制范围（14 → 10）
  - 第 679 行：修复 Shift+拖拽结束范围（14 → 10）
  - 第 806 行：添加距离显示到顶部胶囊

### 新增的文档
- `3D相机UI改进-距离控制和显示.md`：本文档

## 测试验证

### 测试 1：滚轮控制范围

**步骤：**
1. 选中多角度相机节点
2. 在 3D 视口上向上滚动滚轮（推进）
3. 观察右侧数值和顶部胶囊

**预期结果：**
- ✅ 距离值可以达到 0.0（极特写）
- ✅ 顶部胶囊显示"极特写"
- ✅ 相机在 3D 场景中非常接近卡片

### 测试 2：Shift+拖拽控制范围

**步骤：**
1. 选中多角度相机节点
2. 按住 Shift 键，在 3D 视口上向上拖拽
3. 观察右侧数值和顶部胶囊

**预期结果：**
- ✅ 距离值可以达到 0.0（极特写）
- ✅ 顶部胶囊显示"极特写"
- ✅ 相机在 3D 场景中非常接近卡片

### 测试 3：UI 显示完整性

**步骤：**
1. 选中多角度相机节点
2. 调整不同的距离值（0, 2, 5, 7, 10）
3. 观察顶部胶囊显示

**预期结果：**
- ✅ 距离 0：[正面 · 平视 · 极特写]
- ✅ 距离 2：[正面 · 平视 · 特写]
- ✅ 距离 5：[正面 · 平视 · 中景]
- ✅ 距离 7：[正面 · 平视 · 全身]
- ✅ 距离 10：[正面 · 平视 · 大远景]

## 相关文档

- `3D相机距离范围修复.md`：之前的距离范围修复（预设按钮和滑块）
- `.kiro/specs/camera-animation-preview/requirements.md`：需求文档（距离范围定义）
- `3D相机提示词-角度发散方案实施.md`：最新的提示词方案

---

**修复完成！** 🎉

现在的 3D 相机 UI：
- ✅ 滚轮可以控制 0-10 的完整距离范围
- ✅ Shift+拖拽可以控制 0-10 的完整距离范围
- ✅ 顶部胶囊显示完整信息（方位 + 俯仰 + 距离）
- ✅ 用户可以通过 UI 达到极特写（0）

**可以开始测试了！**

