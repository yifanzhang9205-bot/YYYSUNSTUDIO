# 3D 相机基准角度修复 - 任务列表

## 任务概述

实施角度维度发散方案，固定距离和高度，让 Panel 5 反映用户选择的角度。

---

## 1. 准备工作

### 1.1 创建角度分段常量
- [ ] 在 `App.tsx` 中添加 `ANGLE_SEGMENTS` 常量（16 个方向的完整定义）
- [ ] 每个分段包含：name（中文）、baseDesc（英文）、range（角度范围）、variations（9 个细分）
- [ ] 验证所有角度范围覆盖 0-360° 且无重叠

### 1.2 创建辅助函数
- [ ] 创建 `getAngleSegment(angle: number)` 函数
  - 输入：用户选择的角度（0-360°）
  - 输出：对应的 `AngleSegment` 对象
  - 处理角度归一化（负数、超过 360° 等）
- [ ] 创建 `getAngleVariations(angle: number)` 函数
  - 输入：用户选择的角度
  - 输出：9 个细分描述的数组
  - Panel 5（index 4）是基准描述

---

## 2. 修改距离和高度映射

### 2.1 改进高度映射函数
- [ ] 修改 `getHeightTerm()` 函数
  - 从 3 个档位改为 6 个档位
  - 新档位：Top-Down View (50-60°), High Angle (30-50°), Slightly High Angle (10-30°), Eye Level (-10-10°), Slightly Low Angle (-20--10°), Low Angle (-30--20°)
- [ ] 测试边界值（-30°, -20°, -10°, 0°, 10°, 30°, 50°, 60°）

### 2.2 验证距离映射
- [ ] 确认 `getDistanceTerm()` 函数使用 Nano Banana 标准术语
- [ ] 测试边界值（0, 1.5, 3, 4.5, 6, 7.5, 9, 10）

---

## 3. 修改提示词生成逻辑

### 3.1 修改九宫格生成函数
- [ ] 定位 `generateCameraMatrix()` 函数（App.tsx 第 1420 行左右）
- [ ] 移除当前的三维微调逻辑（距离、高度、角度同时变化）
- [ ] 实施新逻辑：
  - 获取用户选择的角度、高度、距离
  - 调用 `getAngleVariations()` 获取 9 个角度细分
  - 调用 `getDistanceTerm()` 获取距离术语（所有 Panel 相同）
  - 调用 `getHeightTerm()` 获取高度术语（所有 Panel 相同）
  - 生成 9 个 Panel 描述

### 3.2 更新 Panel 描述格式
- [ ] 修改 Panel 描述格式：
  ```
  Panel X: [Position Label] {distance}, {height}, {angleVariation}
  ```
- [ ] Panel 5 添加 ★ BASE ANCHOR 标记
- [ ] 确保所有 Panel 的 distance 和 height 完全一致

---

## 4. 修改提示词结构

### 4.1 更新提示词模板
- [ ] 修改提示词开头部分
  - 强调 "Camera Distance: LOCKED at {baseDistance}"
  - 强调 "Camera Height: LOCKED at {baseHeight}"
  - 强调 "The ONLY variable: camera angle variations"
- [ ] 修改 BASE ANCHOR POINT 部分
  - 明确标注距离和高度锁定
  - 标注基准角度描述
- [ ] 修改 CAMERA VARIATION MATRIX 部分
  - 每个 Panel 都显示完整的 {distance}, {height}, {angle}
  - 强调距离和高度在所有 Panel 中相同

### 4.2 更新 RULES 和 NEGATIVE CONSTRAINTS
- [ ] 添加规则：
  - "ALL panels use EXACT same distance: {baseDistance}"
  - "ALL panels use EXACT same height: {baseHeight}"
  - "ONLY camera angle varies slightly"
- [ ] 添加约束：
  - "Do NOT change camera distance between panels"
  - "Do NOT change camera height between panels"

---

## 5. 测试和验证

### 5.1 单元测试
- [ ] 测试 `getAngleSegment()` 函数
  - 测试所有 16 个方向的边界值
  - 测试特殊角度（0°, 90°, 180°, 270°, 360°）
  - 测试负数角度和超过 360° 的角度
- [ ] 测试 `getAngleVariations()` 函数
  - 验证返回 9 个描述
  - 验证 index 4 是基准描述
- [ ] 测试 `getHeightTerm()` 函数
  - 验证 6 个档位的边界值

### 5.2 集成测试
- [ ] 测试正面（0°）
  - horizontalAngle = 0°, verticalAngle = 0°, cameraZoom = 5
  - 验证所有 Panel 都是 "Medium Full Shot, Eye Level"
  - 验证角度围绕 "front view" 发散
- [ ] 测试右前方（45°）
  - horizontalAngle = 45°, verticalAngle = 0°, cameraZoom = 5
  - 验证所有 Panel 都是 "Medium Full Shot, Eye Level"
  - 验证角度围绕 "three-quarter view from front-right" 发散
- [ ] 测试右侧面（90°）
  - horizontalAngle = 90°, verticalAngle = 0°, cameraZoom = 5
  - 验证所有 Panel 都是 "Medium Full Shot, Eye Level"
  - 验证角度围绕 "side view from right" 发散
- [ ] 测试俯视特写（0°, 40°, 2）
  - horizontalAngle = 0°, verticalAngle = 40°, cameraZoom = 2
  - 验证所有 Panel 都是 "Close-Up (CU), High Angle"
  - 验证角度围绕 "front view" 发散

### 5.3 端到端测试
- [ ] 在 UI 中设置不同角度，生成九宫格
- [ ] 验证生成的图片距离一致
- [ ] 验证生成的图片高度一致
- [ ] 验证生成的图片角度有细微变化
- [ ] 验证 Panel 5 最接近用户选择的角度

---

## 6. 文档更新

### 6.1 更新实施文档
- [ ] 创建 `3D相机提示词-角度发散方案实施.md`
- [ ] 记录实施过程和关键决策
- [ ] 记录测试结果和用户反馈

### 6.2 更新用户文档
- [ ] 更新 `多角度相机使用说明.md`
- [ ] 说明新的工作流程：固定距离和高度，角度发散
- [ ] 说明 Panel 5 的含义：用户选择的基准角度

---

## 7. 优化和迭代

### 7.1 收集用户反馈
- [ ] 测试不同角度的生成效果
- [ ] 收集用户对 Panel 5 准确度的反馈
- [ ] 收集用户对角度发散范围的反馈

### 7.2 优化角度细分描述
- [ ] 根据生成效果调整 variations 描述
- [ ] 优化特殊角度（正面、侧面、背面）的细分
- [ ] 确保 AI 能准确理解每个细分描述

---

**任务总数：** 35  
**预计工时：** 4-6 小时  
**优先级：** 高（核心功能）

