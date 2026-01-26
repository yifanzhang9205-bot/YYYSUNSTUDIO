# 3D 相机 Shift + 拖拽不复位修复

## 问题描述

**现象：** 按住 Shift + 拖拽推进/拉远时，一点击鼠标就会复位到之前的位置

**用户需求：**
> "如果你实在没办法完成滚轮的功能，起码按 shift 的时候不要一点击鼠标就复位"

## 根本原因

### 问题代码
```typescript
const handleViewportMouseDown = (e: React.MouseEvent) => {
  dragStateRef.current = {
    isDragging: true,
    hasMoved: false,
    startX: e.clientX,
    startY: e.clientY,
    startH: horizontalAngle,  // ❌ 使用 props 值
    startV: verticalAngle,    // ❌ 使用 props 值
    startZ: cameraZoom        // ❌ 使用 props 值
  };
};
```

**问题分析：**

1. **拖动开始时**：从 props 值（`horizontalAngle`, `verticalAngle`, `cameraZoom`）开始计算
2. **拖动过程中**：直接更新 Three.js 场景，不更新 React state
3. **拖动结束时**：才更新 React state（调用 `onHorizontalAngleChange` 等）
4. **下次拖动开始时**：如果 React state 还没更新完成，就会从旧的 props 值开始，导致"复位"

### 时序问题

```
第一次拖动：
  按下鼠标 → startZ = 5 (props)
  拖动 → newZ = 8 (Three.js 更新)
  松开鼠标 → onZoomChange(8) (React state 更新，但需要时间)

第二次拖动（React state 还没更新完）：
  按下鼠标 → startZ = 5 (props 还是旧值！) ❌
  拖动 → newZ = 5 + dy * 0.025 (从 5 开始，而不是从 8 开始)
  结果：相机"复位"到 5，而不是从 8 继续
```

## 解决方案

### 核心思路

**使用 ref 存储"真实的"当前值，而不是依赖 props**

- `props` 值：通过 React state 传递，有延迟
- `ref` 值：立即更新，没有延迟

### 实现代码

#### 1. 添加 currentAnglesRef

```typescript
// 使用 ref 存储"真实的"当前角度值（拖动时实时更新，不等待 React state）
const currentAnglesRef = useRef({ h: horizontalAngle, v: verticalAngle, z: cameraZoom });

// 当 props 变化时，同步更新 currentAnglesRef
useEffect(() => {
  currentAnglesRef.current = { h: horizontalAngle, v: verticalAngle, z: cameraZoom };
}, [horizontalAngle, verticalAngle, cameraZoom]);
```

#### 2. 拖动开始时使用 ref 值

```typescript
const handleViewportMouseDown = (e: React.MouseEvent) => {
  e.stopPropagation();
  
  // ✅ 使用 currentAnglesRef 中的"真实"当前值，而不是 props
  const current = currentAnglesRef.current;
  
  dragStateRef.current = {
    isDragging: true,
    hasMoved: false,
    startX: e.clientX,
    startY: e.clientY,
    startH: current.h,  // ✅ 使用 ref 中的值
    startV: current.v,  // ✅ 使用 ref 中的值
    startZ: current.z   // ✅ 使用 ref 中的值
  };
  setIsDragging(true);
};
```

#### 3. 拖动过程中实时更新 ref

```typescript
const onMove = (e: MouseEvent) => {
  // ... 计算 newH, newV, newZ
  
  // 更新 Three.js 场景...
  
  // ✅ 实时更新 currentAnglesRef（这样下次拖动时就从正确的位置开始）
  currentAnglesRef.current = { h: newH, v: newV, z: newZ };
  
  // 立即渲染...
};
```

#### 4. 滚轮控制时也更新 ref

```typescript
const handleWheel = (e: React.WheelEvent) => {
  // ... 计算 newZoom
  
  // 更新 Three.js 场景...
  
  // ✅ 实时更新 currentAnglesRef（这样下次操作时就从正确的位置开始）
  currentAnglesRef.current.z = newZoom;
  
  // 更新 React state...
  onZoomChange(newZoom);
};
```

## 修复效果

### 修复前 ❌

```
第一次 Shift + 拖拽：
  按下 → startZ = 5 (props)
  拖动 → newZ = 8
  松开 → onZoomChange(8)

第二次 Shift + 拖拽（立即点击）：
  按下 → startZ = 5 (props 还没更新) ❌
  拖动 → 从 5 开始，相机"复位"
```

### 修复后 ✅

```
第一次 Shift + 拖拽：
  按下 → startZ = 5 (ref)
  拖动 → newZ = 8
         currentAnglesRef.z = 8 (立即更新 ref) ✅
  松开 → onZoomChange(8)

第二次 Shift + 拖拽（立即点击）：
  按下 → startZ = 8 (ref 已更新) ✅
  拖动 → 从 8 继续，不会复位
```

## 数据流对比

### 修复前的数据流

```
用户拖动
  ↓
计算新值 (newH, newV, newZ)
  ↓
更新 Three.js 场景 (立即)
  ↓
松开鼠标
  ↓
更新 React state (有延迟)
  ↓
props 更新 (有延迟)
  ↓
下次拖动开始 → 使用旧的 props 值 ❌
```

### 修复后的数据流

```
用户拖动
  ↓
计算新值 (newH, newV, newZ)
  ↓
更新 Three.js 场景 (立即)
  ↓
更新 currentAnglesRef (立即) ✅
  ↓
松开鼠标
  ↓
更新 React state (有延迟)
  ↓
props 更新 (有延迟)
  ↓
下次拖动开始 → 使用 ref 中的最新值 ✅
```

## 测试步骤

### 测试 1：连续 Shift + 拖拽不复位
1. 打开多角度相机节点
2. 按住 Shift + 拖拽推进到距离 8
3. 松开鼠标
4. **立即**再次按住 Shift + 拖拽
5. **预期：** 从距离 8 继续推进/拉远，不会跳回 5

### 测试 2：快速连续操作不复位
1. Shift + 拖拽推进到距离 8
2. 松开鼠标
3. **立即**普通拖拽旋转相机
4. **立即**再次 Shift + 拖拽
5. **预期：** 距离保持在 8，不会复位

### 测试 3：拖拽 + 滚轮混合操作
1. Shift + 拖拽推进到距离 8
2. 松开鼠标
3. 滚轮推进到距离 10
4. **立即** Shift + 拖拽
5. **预期：** 从距离 10 继续，不会跳回 8 或 5

### 测试 4：普通拖拽不复位
1. 普通拖拽旋转到 90°
2. 松开鼠标
3. **立即**再次拖拽
4. **预期：** 从 90° 继续旋转，不会跳回 0°

## 技术细节

### 为什么需要 currentAnglesRef？

**React state 更新有延迟：**
```typescript
// 拖动结束时
onZoomChange(8); // 调用父组件的回调

// 父组件中
setNodes(prev => prev.map(n => 
  n.id === nodeId ? { ...n, data: { ...n.data, cameraZoom: 8 } } : n
)); // 需要时间

// 子组件重新渲染
<MultiAngleCameraNode cameraZoom={8} /> // props 更新需要时间
```

**ref 更新立即生效：**
```typescript
// 拖动过程中
currentAnglesRef.current.z = 8; // 立即更新，没有延迟

// 下次拖动开始时
const current = currentAnglesRef.current; // 立即获取最新值
```

### 为什么需要同步 props 到 ref？

```typescript
useEffect(() => {
  currentAnglesRef.current = { h: horizontalAngle, v: verticalAngle, z: cameraZoom };
}, [horizontalAngle, verticalAngle, cameraZoom]);
```

**原因：**
1. 用户可能通过其他方式改变角度（比如点击预设按钮）
2. 这时 props 会变化，但 ref 不会自动更新
3. 需要手动同步 props 到 ref

## 总结

这次修复解决了"Shift + 拖拽复位"的问题：

1. ✅ **添加 currentAnglesRef**
   - 存储"真实的"当前角度值
   - 拖动时立即更新，不等待 React state

2. ✅ **拖动开始时使用 ref 值**
   - 从 ref 中获取最新值，而不是 props
   - 避免使用过时的 props 值

3. ✅ **拖动过程中实时更新 ref**
   - 每次计算新值后立即更新 ref
   - 确保下次操作时使用最新值

4. ✅ **同步 props 到 ref**
   - 当 props 变化时（比如点击预设按钮），同步更新 ref
   - 保持 ref 和 props 的一致性

**核心原则：** 使用 ref 存储"真实的"当前值，避免依赖有延迟的 React state！
