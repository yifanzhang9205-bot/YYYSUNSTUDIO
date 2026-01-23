# 多角度相机 - Gemini 参数化升级

## 更新时间
2026-01-21

## 问题背景
之前的多角度相机使用模糊的角度描述（如"右侧面"、"俯拍"），AI 模型难以精确理解三维空间的相机位置，导致生成结果不稳定。

## Gemini 的建议
Gemini 模型指出：AI 并没有真实的 3D XYZ 坐标系，对"角度"的理解建立在对大量摄影作品的学习之上。需要使用**参数化相机语法**，将用户操作翻译成 AI 能精确理解的三个维度组合关键词。

## 核心改进：三维参数化

### 1. 景别/距离 (Distance)
控制人物在画面中的大小

| 数值范围 | 英文术语 | 说明 |
|---------|---------|------|
| 0-1 | extreme close-up | 极近（只看脸/眼睛）|
| 1-2.5 | close-up | 近景（头部和肩膀）|
| 2.5-4.5 | medium shot | 中景（腰部以上）|
| 4.5-6.5 | American shot | 中远景（膝盖以上）|
| 6.5-8.5 | full body shot | 全身 |
| 8.5-10 | extreme wide shot | 极远（人物很小，环境很大）|

### 2. 垂直角度/俯仰 (Elevation)
控制相机在人物上方还是下方

| 数值范围 | 英文术语 | 说明 |
|---------|---------|------|
| 80-90° | directly overhead top-down | 正上方（上帝视角）|
| 40-80° | high-angle bird's-eye view | 高角度俯拍 |
| 10-40° | slightly elevated angle | 略高 |
| -10-10° | eye-level | 平视 |
| -30 - -10° | slightly low angle | 略低 |
| -60 - -30° | low-angle worm's-eye view | 低角度仰拍 |
| -90 - -60° | directly underneath looking straight up | 正下方（极端仰视）|

### 3. 水平方位/环绕 (Azimuth)
控制相机围绕人物的位置

| 角度范围 | 英文术语 | 说明 |
|---------|---------|------|
| 337.5-22.5° | direct front view | 正面 |
| 22.5-67.5° | front three-quarter view | 前侧面 |
| 67.5-112.5° | side profile view | 正侧面 |
| 112.5-157.5° | rear three-quarter view | 后侧面 |
| 157.5-202.5° | direct back view | 背面 |
| 202.5-247.5° | rear three-quarter view | 后侧面 |
| 247.5-292.5° | side profile view | 正侧面 |
| 292.5-337.5° | front three-quarter view | 前侧面 |

## 新提示词模板

```
A 21:9 aspect ratio, precise 3x3 grid collage image.

**ABSOLUTE CONSISTENCY LOCK:**
Across all 9 panels, the character and scene must be strictly identical to the provided reference image. Do not alter features, clothing, pose, or background elements.

**PARAMETRIC CAMERA RIG:**
All 9 panels must be captured using one unified, precise camera perspective defined by the following parameters:

A **[景别描述]** photograph, captured from an extreme **[垂直角度描述]** perspective, viewing the subject from the **[水平方位描述]**.

**ATMOSPHERE:**
Consistent lighting and style with the reference, allowing only minor variations in shade across the grid.

**ADDITIONAL STYLE NOTES:**
[用户自定义风格要求]
```

## 实际示例

### 示例 1：远景 + 仰拍 + 左后方
**用户操作：** 距离=8, 垂直=-30°, 水平=225°

**生成的提示词：**
```
A full body shot photograph, captured from an extreme low-angle worm's-eye view perspective, viewing the subject from the rear three-quarter view.
```

### 示例 2：特写 + 平视 + 正面
**用户操作：** 距离=1, 垂直=0°, 水平=0°

**生成的提示词：**
```
An extreme close-up photograph, captured from an extreme eye-level perspective, viewing the subject from the direct front view.
```

### 示例 3：中景 + 俯拍 + 侧面
**用户操作：** 距离=4, 垂直=30°, 水平=90°

**生成的提示词：**
```
A medium shot photograph, captured from an extreme slightly elevated angle perspective, viewing the subject from the side profile view.
```

## 代码实现

### 映射函数
```typescript
// 1. 距离/景别映射
const getDistanceDescription = (zoom: number): string => {
    if (zoom <= 1) return "extreme close-up";
    if (zoom <= 2.5) return "close-up";
    if (zoom <= 4.5) return "medium shot";
    if (zoom <= 6.5) return "American shot";
    if (zoom <= 8.5) return "full body shot";
    return "extreme wide shot";
};

// 2. 垂直角度/俯仰映射
const getElevationDescription = (angle: number): string => {
    if (angle >= 80) return "directly overhead top-down";
    if (angle >= 40) return "high-angle bird's-eye view";
    if (angle >= 10) return "slightly elevated angle";
    if (angle >= -10) return "eye-level";
    if (angle >= -30) return "slightly low angle";
    if (angle >= -60) return "low-angle worm's-eye view";
    return "directly underneath looking straight up";
};

// 3. 水平方位/环绕映射
const getAzimuthDescription = (angle: number): string => {
    const normalized = ((angle % 360) + 360) % 360;
    if (normalized < 22.5 || normalized >= 337.5) return "direct front view";
    if (normalized < 67.5) return "front three-quarter view";
    if (normalized < 112.5) return "side profile view";
    if (normalized < 157.5) return "rear three-quarter view";
    if (normalized < 202.5) return "direct back view";
    if (normalized < 247.5) return "rear three-quarter view";
    if (normalized < 292.5) return "side profile view";
    return "front three-quarter view";
};
```

## 优势对比

### 旧方案（模糊描述）
```
Camera position: Horizontal 90°, Vertical 30°.
Medium shot, horizontal rotation 90 degrees, high-angle view (30 degrees from above)
```
❌ 数字和文字混合，AI 难以理解
❌ 描述不够标准化
❌ 缺乏摄影术语的精确性

### 新方案（参数化）
```
A medium shot photograph, captured from an extreme slightly elevated angle perspective, viewing the subject from the side profile view.
```
✅ 使用标准摄影术语
✅ 三个维度独立清晰
✅ AI 模型更容易理解
✅ 符合摄影作品的描述习惯

## 预期效果
- ✅ 角度控制更精确
- ✅ 生成结果更稳定
- ✅ 九宫格一致性更好
- ✅ 符合 AI 模型的理解方式

## 测试建议
1. 测试极端角度（正上方、正下方）
2. 测试标准角度（正面、侧面、背面）
3. 测试不同距离（特写、全身、远景）
4. 对比新旧方案的生成质量

---

**升级完成！** 🎉

基于 Gemini 模型的专业建议，使用参数化相机语法，让 AI 更精确地理解三维空间的相机位置。
