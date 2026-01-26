# 3D 相机基准角度修复 - 设计文档

## 1. 设计概述

### 1.1 核心思路

**固定 2 个维度，让角度维度发散**

- **固定维度 1：距离**（严格按照 UI 选择的 `cameraZoom`）
- **固定维度 2：高度**（严格按照 UI 选择的 `verticalAngle`）
- **发散维度：角度**（围绕 UI 选择的 `horizontalAngle` 展开 9 个细分）

**示例：**
```
用户选择：
- horizontalAngle = 45°（右前方）
- verticalAngle = 0°（平视）
- cameraZoom = 5（中景）

生成的九宫格：
所有 9 张图片：
- 距离：固定为 Medium Full Shot (MFS)
- 高度：固定为 Eye Level
- 角度：围绕 45° 在 30-60° 范围内发散
  - Panel 1: 偏向前方
  - Panel 2: 略偏前方
  - Panel 3: 略偏侧面
  - Panel 4: 偏向前方
  - Panel 5: 基准（45°）★
  - Panel 6: 偏向侧面
  - Panel 7: 偏向前方
  - Panel 8: 略偏前方
  - Panel 9: 略偏侧面
```

### 1.2 设计原则

1. **严格锁定距离和高度**：9 张图片的距离和高度术语完全一致
2. **角度发散**：围绕用户选择的角度，生成 9 个细分描述
3. **Panel 5 是基准**：中心格子就是用户选择的角度
4. **参考 Gemini 建议**：使用 Nano Banana 熟悉的术语和结构

## 2. 技术设计

### 2.1 角度分段系统（16 个主方向）

```typescript
interface AngleSegment {
  name: string;           // 中文名称
  baseDesc: string;       // 基础英文描述
  range: [number, number]; // 角度范围
  variations: string[];   // 9 个细分描述
}

const ANGLE_SEGMENTS: AngleSegment[] = [
  {
    name: '正面',
    baseDesc: 'front view',
    range: [348.75, 11.25],
    variations: [
      'front view, slightly from left',
      'front view, leaning left',
      'front view, leaning right',
      'front view, slightly left',
      'front view',  // Panel 5 基准
      'front view, slightly right',
      'front view, mostly left',
      'front view, centered',
      'front view, mostly right',
    ]
  },
  {
    name: '右前偏前',
    baseDesc: 'three-quarter view from front-right, closer to front',
    range: [11.25, 33.75],
    variations: [
      'three-quarter view from front-right, very close to front',
      'three-quarter view from front-right, leaning towards front',
      'three-quarter view from front-right, slightly towards side',
      'three-quarter view from front-right, closer to front',
      'three-quarter view from front-right, closer to front',  // Panel 5 基准
      'three-quarter view from front-right, balanced towards front',
      'three-quarter view from front-right, mostly front',
      'three-quarter view from front-right, approaching front',
      'three-quarter view from front-right, near side',
    ]
  },
  {
    name: '右前方',
    baseDesc: 'three-quarter view from front-right',
    range: [33.75, 56.25],
    variations: [
      'three-quarter view from front-right, closer to front',
      'three-quarter view from front-right, slightly towards front',
      'three-quarter view from front-right, slightly towards side',
      'three-quarter view from front-right, leaning towards front',
      'three-quarter view from front-right',  // Panel 5 基准
      'three-quarter view from front-right, leaning towards side',
      'three-quarter view from front-right, mostly front',
      'three-quarter view from front-right, balanced',
      'three-quarter view from front-right, mostly side',
    ]
  },
  {
    name: '右前偏右',
    baseDesc: 'three-quarter view from front-right, closer to side',
    range: [56.25, 78.75],
    variations: [
      'three-quarter view from front-right, near front',
      'three-quarter view from front-right, approaching front',
      'three-quarter view from front-right, approaching side',
      'three-quarter view from front-right, balanced towards side',
      'three-quarter view from front-right, closer to side',  // Panel 5 基准
      'three-quarter view from front-right, leaning towards side',
      'three-quarter view from front-right, mostly front',
      'three-quarter view from front-right, centered',
      'three-quarter view from front-right, very close to side',
    ]
  },
  {
    name: '右侧面',
    baseDesc: 'side view from right',
    range: [78.75, 101.25],
    variations: [
      'side view from right, slightly forward',
      'side view from right, leaning forward',
      'side view from right, leaning backward',
      'side view from right, closer to front',
      'side view from right',  // Panel 5 基准
      'side view from right, closer to back',
      'side view from right, mostly forward',
      'side view from right, perpendicular',
      'side view from right, mostly backward',
    ]
  },
  {
    name: '右后偏右',
    baseDesc: 'three-quarter view from back-right, closer to side',
    range: [101.25, 123.75],
    variations: [
      'three-quarter view from back-right, near front',
      'three-quarter view from back-right, approaching side',
      'three-quarter view from back-right, approaching back',
      'three-quarter view from back-right, balanced towards side',
      'three-quarter view from back-right, closer to side',  // Panel 5 基准
      'three-quarter view from back-right, leaning towards back',
      'three-quarter view from back-right, mostly side',
      'three-quarter view from back-right, centered',
      'three-quarter view from back-right, very close to back',
    ]
  },
  {
    name: '右后方',
    baseDesc: 'three-quarter view from back-right',
    range: [123.75, 146.25],
    variations: [
      'three-quarter view from back-right, closer to side',
      'three-quarter view from back-right, slightly towards side',
      'three-quarter view from back-right, slightly towards back',
      'three-quarter view from back-right, leaning towards side',
      'three-quarter view from back-right',  // Panel 5 基准
      'three-quarter view from back-right, leaning towards back',
      'three-quarter view from back-right, mostly side',
      'three-quarter view from back-right, balanced',
      'three-quarter view from back-right, mostly back',
    ]
  },
  {
    name: '右后偏后',
    baseDesc: 'three-quarter view from back-right, closer to back',
    range: [146.25, 168.75],
    variations: [
      'three-quarter view from back-right, near side',
      'three-quarter view from back-right, approaching side',
      'three-quarter view from back-right, approaching back',
      'three-quarter view from back-right, balanced towards back',
      'three-quarter view from back-right, closer to back',  // Panel 5 基准
      'three-quarter view from back-right, leaning towards back',
      'three-quarter view from back-right, mostly side',
      'three-quarter view from back-right, centered',
      'three-quarter view from back-right, very close to back',
    ]
  },
  {
    name: '背面',
    baseDesc: 'back view',
    range: [168.75, 191.25],
    variations: [
      'back view, slightly from right',
      'back view, leaning right',
      'back view, leaning left',
      'back view, slightly right',
      'back view',  // Panel 5 基准
      'back view, slightly left',
      'back view, mostly right',
      'back view, centered',
      'back view, mostly left',
    ]
  },
  {
    name: '左后偏后',
    baseDesc: 'three-quarter view from back-left, closer to back',
    range: [191.25, 213.75],
    variations: [
      'three-quarter view from back-left, near side',
      'three-quarter view from back-left, approaching side',
      'three-quarter view from back-left, approaching back',
      'three-quarter view from back-left, balanced towards back',
      'three-quarter view from back-left, closer to back',  // Panel 5 基准
      'three-quarter view from back-left, leaning towards back',
      'three-quarter view from back-left, mostly side',
      'three-quarter view from back-left, centered',
      'three-quarter view from back-left, very close to back',
    ]
  },
  {
    name: '左后方',
    baseDesc: 'three-quarter view from back-left',
    range: [213.75, 236.25],
    variations: [
      'three-quarter view from back-left, closer to side',
      'three-quarter view from back-left, slightly towards side',
      'three-quarter view from back-left, slightly towards back',
      'three-quarter view from back-left, leaning towards side',
      'three-quarter view from back-left',  // Panel 5 基准
      'three-quarter view from back-left, leaning towards back',
      'three-quarter view from back-left, mostly side',
      'three-quarter view from back-left, balanced',
      'three-quarter view from back-left, mostly back',
    ]
  },
  {
    name: '左后偏左',
    baseDesc: 'three-quarter view from back-left, closer to side',
    range: [236.25, 258.75],
    variations: [
      'three-quarter view from back-left, near back',
      'three-quarter view from back-left, approaching back',
      'three-quarter view from back-left, approaching side',
      'three-quarter view from back-left, balanced towards side',
      'three-quarter view from back-left, closer to side',  // Panel 5 基准
      'three-quarter view from back-left, leaning towards side',
      'three-quarter view from back-left, mostly back',
      'three-quarter view from back-left, centered',
      'three-quarter view from back-left, very close to side',
    ]
  },
  {
    name: '左侧面',
    baseDesc: 'side view from left',
    range: [258.75, 281.25],
    variations: [
      'side view from left, slightly backward',
      'side view from left, leaning backward',
      'side view from left, leaning forward',
      'side view from left, closer to back',
      'side view from left',  // Panel 5 基准
      'side view from left, closer to front',
      'side view from left, mostly backward',
      'side view from left, perpendicular',
      'side view from left, mostly forward',
    ]
  },
  {
    name: '左前偏左',
    baseDesc: 'three-quarter view from front-left, closer to side',
    range: [281.25, 303.75],
    variations: [
      'three-quarter view from front-left, near back',
      'three-quarter view from front-left, approaching side',
      'three-quarter view from front-left, approaching front',
      'three-quarter view from front-left, balanced towards side',
      'three-quarter view from front-left, closer to side',  // Panel 5 基准
      'three-quarter view from front-left, leaning towards front',
      'three-quarter view from front-left, mostly side',
      'three-quarter view from front-left, centered',
      'three-quarter view from front-left, very close to front',
    ]
  },
  {
    name: '左前方',
    baseDesc: 'three-quarter view from front-left',
    range: [303.75, 326.25],
    variations: [
      'three-quarter view from front-left, closer to side',
      'three-quarter view from front-left, slightly towards side',
      'three-quarter view from front-left, slightly towards front',
      'three-quarter view from front-left, leaning towards side',
      'three-quarter view from front-left',  // Panel 5 基准
      'three-quarter view from front-left, leaning towards front',
      'three-quarter view from front-left, mostly side',
      'three-quarter view from front-left, balanced',
      'three-quarter view from front-left, mostly front',
    ]
  },
  {
    name: '左前偏前',
    baseDesc: 'three-quarter view from front-left, closer to front',
    range: [326.25, 348.75],
    variations: [
      'three-quarter view from front-left, very close to side',
      'three-quarter view from front-left, leaning towards side',
      'three-quarter view from front-left, slightly towards front',
      'three-quarter view from front-left, closer to side',
      'three-quarter view from front-left, closer to front',  // Panel 5 基准
      'three-quarter view from front-left, balanced towards front',
      'three-quarter view from front-left, mostly side',
      'three-quarter view from front-left, approaching front',
      'three-quarter view from front-left, mostly front',
    ]
  },
];
```

### 2.2 距离映射（严格锁定）

```typescript
const getDistanceTerm = (z: number): string => {
  if (z <= 1.5) return 'Extreme Close-Up (ECU)';
  if (z <= 3) return 'Close-Up (CU)';
  if (z <= 4.5) return 'Medium Shot (MS)';
  if (z <= 6) return 'Medium Full Shot (MFS)';
  if (z <= 7.5) return 'Full Shot (FS)';
  if (z <= 9) return 'Long Shot (LS)';
  return 'Extreme Long Shot (ELS)';
};
```

**关键：** 所有 9 张图片使用相同的距离术语。

### 2.3 高度映射（严格锁定，改进版）

```typescript
const getHeightTerm = (angle: number): string => {
  if (angle >= 50) return 'Top-Down View';           // 50-60°
  if (angle >= 30) return 'High Angle';              // 30-50°
  if (angle >= 10) return 'Slightly High Angle';     // 10-30°
  if (angle >= -10) return 'Eye Level';              // -10-10°
  if (angle >= -20) return 'Slightly Low Angle';     // -20--10°
  return 'Low Angle';                                // -30--20°
};
```

**关键：** 所有 9 张图片使用相同的高度术语。

### 2.4 九宫格布局逻辑

**布局方式：从左到右渐变**

```
[偏前] [略偏前] [略偏右]
[偏前] [基准]   [偏右]
[偏前] [略偏前] [略偏右]
```

**映射关系：**
```typescript
const PANEL_VARIATION_INDICES = [
  0, 1, 2,  // 上排：variations[0], variations[1], variations[2]
  3, 4, 5,  // 中排：variations[3], variations[4], variations[5]
  6, 7, 8,  // 下排：variations[6], variations[7], variations[8]
];
```

**Panel 5（中心）= variations[4] = 基准描述**

### 2.5 提示词结构（参考 Gemini 建议）

```
IMPORTANT: Generate ONE SINGLE 21:9 image containing a 3×3 contact sheet grid.

[ROLE & TASK]
You are an expert CGI artist creating a character consistency contact sheet based on the provided INPUT IMAGE. Your task is to generate a single 21:9 image divided into 9 panels showing slight camera angle variations around the base position.

[CRITICAL CONSTRAINT: IMG2IMG FEATURE LOCKING]
Based strictly on the INPUT IMAGE, maintain perfect consistency across all 9 panels:
- Character Identity: LOCKED. EXACT same face, features, and expression.
- Outfit & Accessories: LOCKED. EXACT same clothing, colors, and textures.
- Lighting & Environment: LOCKED. Consistent lighting direction and mood.
- Camera Distance: LOCKED at {baseDistance}
- Camera Height: LOCKED at {baseHeight}
- The ONLY variable: camera angle variations around {baseAngleDesc}

[OUTPUT FORMAT]
- ONE single 21:9 image containing a 3×3 grid (9 panels with thin dividing lines)
- Style: Contact sheet / camera test

[BASE ANCHOR POINT - Panel 5]
Distance: {baseDistance} - LOCKED for all panels
Camera Height: {baseHeight} - LOCKED for all panels
Camera Angle: {baseAngleDesc} - BASE REFERENCE

This is your absolute reference. The character remains stationary; only the camera angle varies slightly.

[CAMERA ANGLE VARIATION MATRIX]

Row 1:
Panel 1: {baseDistance}, {baseHeight}, {variation[0]}
Panel 2: {baseDistance}, {baseHeight}, {variation[1]}
Panel 3: {baseDistance}, {baseHeight}, {variation[2]}

Row 2:
Panel 4: {baseDistance}, {baseHeight}, {variation[3]}
Panel 5: {baseDistance}, {baseHeight}, {variation[4]} ★ BASE ANCHOR
Panel 6: {baseDistance}, {baseHeight}, {variation[5]}

Row 3:
Panel 7: {baseDistance}, {baseHeight}, {variation[6]}
Panel 8: {baseDistance}, {baseHeight}, {variation[7]}
Panel 9: {baseDistance}, {baseHeight}, {variation[8]}

[SPATIAL LOGIC]
- Distance: LOCKED at {baseDistance} for ALL panels
- Height: LOCKED at {baseHeight} for ALL panels
- Angle: Subtle variations around {baseAngleDesc}
- The character stays in the same pose; the camera orbits horizontally around them

[RULES]
✅ Generate ONE image with 9 panels
✅ ALL panels use EXACT same distance: {baseDistance}
✅ ALL panels use EXACT same height: {baseHeight}
✅ ONLY camera angle varies slightly around {baseAngleDesc}
✅ Maintain the illusion of a camera orbiting horizontally around a stationary character

[NEGATIVE CONSTRAINTS]
❌ Do NOT change character pose between panels
❌ Do NOT change lighting direction between panels
❌ Do NOT change camera distance between panels
❌ Do NOT change camera height between panels
❌ Do NOT generate 9 separate images
❌ Do NOT introduce new elements not in input image
```

## 3. 实施计划

### 3.1 代码修改位置

**文件：** `App.tsx`（第 1300-1600 行）

**修改内容：**
1. 添加 `ANGLE_SEGMENTS` 常量（16 个方向的完整定义）
2. 添加 `getAngleSegment()` 函数（根据角度查找对应的分段）
3. 修改 `getHeightTerm()` 函数（改进高度映射）
4. 修改提示词生成逻辑（使用角度发散）
5. 更新提示词结构（强调距离和高度锁定）

### 3.2 测试用例

**测试 1：正面（0°）**
- horizontalAngle = 0°
- verticalAngle = 0°
- cameraZoom = 5
- 预期：9 张图片都是 "Medium Full Shot, Eye Level"，角度围绕 "front view" 发散

**测试 2：右前方（45°）**
- horizontalAngle = 45°
- verticalAngle = 0°
- cameraZoom = 5
- 预期：9 张图片都是 "Medium Full Shot, Eye Level"，角度围绕 "three-quarter view from front-right" 发散

**测试 3：右侧面（90°）**
- horizontalAngle = 90°
- verticalAngle = 0°
- cameraZoom = 5
- 预期：9 张图片都是 "Medium Full Shot, Eye Level"，角度围绕 "side view from right" 发散

**测试 4：俯视特写（0°, 40°, 2）**
- horizontalAngle = 0°
- verticalAngle = 40°
- cameraZoom = 2
- 预期：9 张图片都是 "Close-Up (CU), High Angle"，角度围绕 "front view" 发散

## 4. 验收标准

### 4.1 功能验收

- ✅ Panel 5 的角度描述反映用户在 UI 中选择的 `horizontalAngle`
- ✅ 所有 9 张图片的距离术语完全一致（基于 `cameraZoom`）
- ✅ 所有 9 张图片的高度术语完全一致（基于 `verticalAngle`）
- ✅ 周围 8 张图片的角度描述围绕 Panel 5 发散
- ✅ 提示词明确强调距离和高度锁定

### 4.2 质量验收

- ✅ 生成的 9 张图片距离一致（如都是中景）
- ✅ 生成的 9 张图片高度一致（如都是平视）
- ✅ 生成的 9 张图片角度有细微变化（围绕基准角度）
- ✅ Panel 5 的角度最接近用户选择的角度

### 4.3 用户体验验收

- ✅ 用户在 UI 中设置 45°，生成的 Panel 5 就是右前方视角
- ✅ 用户能从 9 张图片中找到"想要的那张"（Panel 5 或其周围）
- ✅ 不再出现"纯靠发散"的情况

---

**文档版本：** 1.0  
**创建日期：** 2026-01-24  
**状态：** 待实施

