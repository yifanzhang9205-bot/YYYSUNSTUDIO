# 3D 相机提示词 - 方案 A+D 实施

## 实施时间
2026-01-24

## 问题分析

### 用户反馈
- **Panel 1-3（上排）**：有变化，AI 理解了
- **Panel 4-9（中排 + 下排）**：基本是原图，没变化

### 原因分析

**Row 1（上排）有明显变化：**
- 距离变化：`Medium Shot`（比基准近）
- 高度变化：`High Angle`（比基准高）
- 位置变化：`camera panned left/right`
- **三个维度都变了，AI 觉得"必须有明显变化"**

**Row 2（中排）几乎没变化：**
- 距离：`Medium Full Shot`（基准）
- 高度：`Eye Level`（基准）
- 位置：`camera panned left/right`
- **只有一个维度变，且 `panned` 描述太弱，AI 觉得"可以不变"**

**Row 3（下排）也没变化：**
- 理论上应该变（距离 + 高度都变了）
- 但 AI 可能觉得"变化不够明显"

## 解决方案：方案 A+D

### 核心改进

1. **添加位置标签**（方案 D）
   - 使用 `[Top-Left]`, `[Left Pan]`, `[BASE ANCHOR]` 等标签
   - 明确标识每个 Panel 的位置

2. **强化位置描述**（方案 A）
   - 使用 `rotated` 替代 `panned`（更明确）
   - 添加视觉提示：`viewing from left side`, `looking down from right side` 等

3. **结合高度和位置的视觉提示**
   - `looking down from left side`（俯视 + 左侧）
   - `looking up from right side`（仰视 + 右侧）
   - 让每个 Panel 的描述更独特

## 代码变更

### 1. 修改的函数

**改进前：**
```typescript
const getCameraPositionDesc = (offset: -1 | 0 | 1): string => {
    if (offset === -1) return 'camera panned left';
    if (offset === 1) return 'camera panned right';
    return 'camera centered';
};
```

**改进后：**
```typescript
const getCameraPositionDesc = (offset: -1 | 0 | 1, heightOffset: -1 | 0 | 1): string => {
    let position = '';
    let viewDesc = '';
    
    // 位置标签
    if (offset === -1) {
        position = 'camera rotated left';
        viewDesc = 'viewing from left side';
    } else if (offset === 1) {
        position = 'camera rotated right';
        viewDesc = 'viewing from right side';
    } else {
        position = 'camera centered';
        viewDesc = 'direct front view';
    }
    
    // 添加高度视觉提示
    if (heightOffset === 1) {
        viewDesc = viewDesc.replace('viewing', 'looking down');
        viewDesc = viewDesc.replace('direct front view', 'looking down from front');
    } else if (heightOffset === -1) {
        viewDesc = viewDesc.replace('viewing', 'looking up');
        viewDesc = viewDesc.replace('direct front view', 'looking up from front');
    }
    
    return `${position} - ${viewDesc}`;
};
```

### 2. 新增的函数

```typescript
// 位置标签生成
const getPositionLabel = (row: number, col: number): string => {
    const labels = [
        '[Top-Left]', '[Top-Center]', '[Top-Right]',
        '[Left Pan]', '[BASE ANCHOR]', '[Right Pan]',
        '[Bottom-Left]', '[Bottom-Center]', '[Bottom-Right]'
    ];
    return labels[row * 3 + col];
};
```

### 3. 修改的生成逻辑

**改进前：**
```typescript
for (let i = 0; i < 9; i++) {
    const panelNum = i + 1;
    const distance = getDistanceVariation(zoom, distanceOffsets[i] as -1 | 0 | 1);
    const height = getHeightVariation(vAngle, heightOffsets[i] as -1 | 0 | 1);
    const cameraPos = getCameraPositionDesc(cameraOffsets[i] as -1 | 0 | 1);
    
    if (panelNum === 5) {
        panels.push(`Panel 5: ★ BASE ANCHOR ★ ${baseDistance}, ${baseHeight}, ${cameraPos}`);
    } else {
        panels.push(`Panel ${panelNum}: ${distance}, ${height}, ${cameraPos}`);
    }
}
```

**改进后：**
```typescript
for (let i = 0; i < 9; i++) {
    const row = Math.floor(i / 3);
    const col = i % 3;
    const panelNum = i + 1;
    
    const distance = getDistanceVariation(zoom, distanceOffsets[i] as -1 | 0 | 1);
    const height = getHeightVariation(vAngle, heightOffsets[i] as -1 | 0 | 1);
    const cameraPos = getCameraPositionDesc(cameraOffsets[i] as -1 | 0 | 1, heightOffsets[i] as -1 | 0 | 1);
    const label = getPositionLabel(row, col);
    
    if (panelNum === 5) {
        panels.push(`Panel 5: ${label} ${baseDistance}, ${baseHeight}, camera centered - direct front view`);
    } else {
        panels.push(`Panel ${panelNum}: ${label} ${distance}, ${height}, ${cameraPos}`);
    }
}
```

## 新的提示词输出

### 示例 1：中景正面平视

**UI 设置：**
- horizontalAngle: 0°
- verticalAngle: 0°
- cameraZoom: 5

**生成的九宫格矩阵：**
```
Row 1 (Closer Distance + Elevated Camera):
Panel 1: [Top-Left] Medium Shot, High Angle, camera rotated left - looking down from left side
Panel 2: [Top-Center] Medium Shot, High Angle, camera centered - looking down from front
Panel 3: [Top-Right] Medium Shot, High Angle, camera rotated right - looking down from right side

Row 2 (Base Distance + Base Height):
Panel 4: [Left Pan] Medium Full Shot, Eye Level, camera rotated left - viewing from left side
Panel 5: [BASE ANCHOR] Medium Full Shot (MFS), Eye Level, camera centered - direct front view
Panel 6: [Right Pan] Medium Full Shot, Eye Level, camera rotated right - viewing from right side

Row 3 (Farther Distance + Lowered Camera):
Panel 7: [Bottom-Left] Full Shot, Low Angle, camera rotated left - looking up from left side
Panel 8: [Bottom-Center] Full Shot, Low Angle, camera centered - looking up from front
Panel 9: [Bottom-Right] Full Shot, Low Angle, camera rotated right - looking up from right side
```

### 示例 2：特写俯视

**UI 设置：**
- horizontalAngle: 0°
- verticalAngle: 30°
- cameraZoom: 2

**生成的九宫格矩阵：**
```
Row 1 (Closer Distance + Elevated Camera):
Panel 1: [Top-Left] Extreme Close-Up (ECU), High Angle, camera rotated left - looking down from left side
Panel 2: [Top-Center] Extreme Close-Up (ECU), High Angle, camera centered - looking down from front
Panel 3: [Top-Right] Extreme Close-Up (ECU), High Angle, camera rotated right - looking down from right side

Row 2 (Base Distance + Base Height):
Panel 4: [Left Pan] Close-Up (CU), Eye Level, camera rotated left - viewing from left side
Panel 5: [BASE ANCHOR] Close-Up (CU), High Angle, camera centered - direct front view
Panel 6: [Right Pan] Close-Up (CU), Eye Level, camera rotated right - viewing from right side

Row 3 (Farther Distance + Lowered Camera):
Panel 7: [Bottom-Left] Medium Shot (MS), Low Angle, camera rotated left - looking up from left side
Panel 8: [Bottom-Center] Medium Shot (MS), Low Angle, camera centered - looking up from front
Panel 9: [Bottom-Right] Medium Shot (MS), Low Angle, camera rotated right - looking up from right side
```

## 关键改进点

### 1. 位置标签（方案 D）

**添加明确的标签：**
- `[Top-Left]`, `[Top-Center]`, `[Top-Right]`
- `[Left Pan]`, `[BASE ANCHOR]`, `[Right Pan]`
- `[Bottom-Left]`, `[Bottom-Center]`, `[Bottom-Right]`

**优势：**
- 让 AI 一眼看出每个 Panel 的位置
- 类似 Gemini 原始提示词的风格
- 增强空间感

### 2. 强化位置描述（方案 A）

**使用 `rotated` 替代 `panned`：**
- `camera rotated left`（相机向左旋转）
- `camera rotated right`（相机向右旋转）
- 比 `panned` 更明确

**添加视觉提示：**
- `viewing from left side`（从左侧观看）
- `viewing from right side`（从右侧观看）
- `direct front view`（正面直视）

### 3. 结合高度和位置

**上排（俯视）：**
- `looking down from left side`
- `looking down from front`
- `looking down from right side`

**中排（平视）：**
- `viewing from left side`
- `direct front view`
- `viewing from right side`

**下排（仰视）：**
- `looking up from left side`
- `looking up from front`
- `looking up from right side`

**优势：**
- 每个 Panel 的描述都是独特的
- 结合了两个维度的信息
- AI 更容易理解空间关系

## 预期效果

### 解决 Row 2-3 没变化的问题

**改进前：**
```
Panel 4: Medium Full Shot, Eye Level, camera panned left
```
- 描述太弱，AI 觉得"可以不变"

**改进后：**
```
Panel 4: [Left Pan] Medium Full Shot, Eye Level, camera rotated left - viewing from left side
```
- 添加标签 `[Left Pan]`
- 使用 `rotated` 替代 `panned`
- 添加视觉提示 `viewing from left side`
- **描述更强，AI 必须生成变化**

### 增强每个 Panel 的独特性

**改进前：**
- Panel 4, 5, 6 的描述很相似
- 只有 `panned left/centered/right` 的区别

**改进后：**
- Panel 4: `[Left Pan] ... viewing from left side`
- Panel 5: `[BASE ANCHOR] ... direct front view`
- Panel 6: `[Right Pan] ... viewing from right side`
- **每个 Panel 都有明确的标签和视觉提示**

## 测试建议

### 重点测试 Row 2-3

1. **测试 Panel 4-6（中排）**
   - 看是否有明显的左中右变化
   - 对比改进前后的效果

2. **测试 Panel 7-9（下排）**
   - 看是否有明显的仰视 + 左中右变化
   - 对比改进前后的效果

3. **测试不同场景**
   - 正面照
   - 侧面照
   - 特写、中景、远景

## 文件变更

### 修改的文件
- `App.tsx`：提示词生成逻辑（第 1380-1450 行）

### 新增的文档
- `3D相机提示词-方案A+D实施.md`：本文档

### 参考的文档
- `3D相机提示词-方案1实施.md`：方案 1 实施总结
- `3D相机提示词-最终方案.md`：原始设计方案

---

**方案 A+D 实施完成！** 🎉

现在的提示词：
- ✅ 添加位置标签（`[Top-Left]`, `[Left Pan]` 等）
- ✅ 使用 `rotated` 替代 `panned`
- ✅ 添加视觉提示（`viewing from left side` 等）
- ✅ 结合高度和位置的描述（`looking down from left side` 等）

**等待测试反馈！特别关注 Row 2-3 是否有变化。**
