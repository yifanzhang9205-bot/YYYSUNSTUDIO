# 需求文档：相机角度动画预览

## 简介

为 SunStudio 的多角度相机节点添加角度动画预览功能，使用户能够定义相机运动路径、实时预览动画效果，并导出为图片序列或视频。该功能将帮助用户创建产品 360° 展示、角色多角度参考和相机运镜设计。

## 术语表

- **Animation_System**: 角度动画系统，负责管理关键帧、插值计算和动画播放
- **Keyframe**: 关键帧，定义相机在特定时间点的角度参数（水平角度、垂直角度、距离）
- **Timeline**: 时间轴，用于可视化和编辑关键帧的 UI 组件
- **Interpolation**: 插值，在两个关键帧之间计算平滑过渡的算法
- **Easing_Function**: 缓动函数，控制动画速度变化的数学函数（如 linear、ease-in、ease-out）
- **Animation_Preset**: 动画预设，预定义的常用相机运动模式（如 360° 旋转、环绕）
- **Export_Sequence**: 导出序列，将动画的每一帧渲染为图片或视频的过程
- **Playback_Controls**: 播放控制器，包含播放、暂停、停止、跳转等操作
- **Camera_Path**: 相机路径，由多个关键帧组成的完整运动轨迹

## 需求

### 需求 1：关键帧管理

**用户故事：** 作为用户，我希望能够添加、编辑和删除关键帧，以便定义相机的运动路径。

#### 验收标准

1. WHEN 用户点击"添加关键帧"按钮 THEN THE Animation_System SHALL 在当前时间点创建一个新关键帧，并记录当前的相机参数（水平角度、垂直角度、距离）
2. WHEN 用户选择一个关键帧 THEN THE Timeline SHALL 高亮显示该关键帧，并在 3D 视口中显示对应的相机位置
3. WHEN 用户修改关键帧的参数 THEN THE Animation_System SHALL 更新该关键帧的数据，并实时刷新预览
4. WHEN 用户删除一个关键帧 THEN THE Animation_System SHALL 从路径中移除该关键帧，并重新计算插值
5. WHEN 用户拖拽关键帧在时间轴上的位置 THEN THE Timeline SHALL 更新关键帧的时间戳，并保持参数不变
6. THE Animation_System SHALL 支持至少 20 个关键帧
7. WHEN 关键帧数量为 0 或 1 THEN THE Animation_System SHALL 禁用播放功能

### 需求 2：动画预览播放

**用户故事：** 作为用户，我希望能够实时预览相机动画，以便验证运动效果是否符合预期。

#### 验收标准

1. WHEN 用户点击"播放"按钮 THEN THE Playback_Controls SHALL 开始播放动画，并在 3D 视口中实时更新相机位置
2. WHEN 动画播放中 THEN THE Animation_System SHALL 以至少 30 FPS 的帧率更新相机位置
3. WHEN 用户点击"暂停"按钮 THEN THE Playback_Controls SHALL 暂停动画，并保持当前帧的相机位置
4. WHEN 用户点击"停止"按钮 THEN THE Playback_Controls SHALL 停止动画，并将相机重置到第一个关键帧
5. WHEN 动画播放到最后一帧 THEN THE Playback_Controls SHALL 自动停止，或根据循环设置重新开始
6. WHEN 用户拖拽时间轴滑块 THEN THE Animation_System SHALL 跳转到指定时间点，并更新相机位置
7. THE Playback_Controls SHALL 显示当前播放时间和总时长

### 需求 3：插值和缓动

**用户故事：** 作为用户，我希望相机在关键帧之间平滑过渡，并能选择不同的缓动效果，以便创建自然流畅的动画。

#### 验收标准

1. WHEN 两个关键帧之间存在时间间隔 THEN THE Interpolation SHALL 计算中间帧的相机参数，使过渡平滑连续
2. THE Animation_System SHALL 支持线性插值（Linear）作为默认插值方式
3. THE Animation_System SHALL 支持至少 3 种缓动函数：Ease-In、Ease-Out、Ease-In-Out
4. WHEN 用户为关键帧选择缓动函数 THEN THE Animation_System SHALL 应用该缓动函数到该关键帧与下一个关键帧之间的过渡
5. WHEN 水平角度跨越 0°/360° 边界 THEN THE Interpolation SHALL 选择最短路径进行插值（例如从 350° 到 10° 应顺时针旋转 20°，而非逆时针 340°）
6. FOR ALL 关键帧对，插值计算 SHALL 在 16ms 内完成（保证 60 FPS）

### 需求 4：动画预设

**用户故事：** 作为用户，我希望能够快速应用常用的相机运动模式，以便节省设置时间。

#### 验收标准

1. THE Animation_System SHALL 提供"360° 水平旋转"预设，生成 8 个均匀分布的关键帧（每 45° 一个）
2. THE Animation_System SHALL 提供"上下环绕"预设，生成垂直角度从 -30° 到 60° 的关键帧序列
3. THE Animation_System SHALL 提供"推拉镜头"预设，生成距离从 0 到 10 的关键帧序列
4. WHEN 用户选择一个预设 THEN THE Animation_System SHALL 清除现有关键帧，并生成预设的关键帧序列
5. WHEN 用户应用预设后 THEN THE Animation_System SHALL 允许用户进一步编辑生成的关键帧

### 需求 5：时间轴 UI

**用户故事：** 作为用户，我希望有一个直观的时间轴界面，以便可视化和编辑关键帧。

#### 验收标准

1. THE Timeline SHALL 显示所有关键帧在时间轴上的位置
2. WHEN 用户点击时间轴上的某个位置 THEN THE Timeline SHALL 将播放头移动到该位置
3. WHEN 用户悬停在关键帧上 THEN THE Timeline SHALL 显示该关键帧的参数信息（水平角度、垂直角度、距离）
4. THE Timeline SHALL 使用不同颜色或图标区分不同类型的关键帧变化（仅水平、仅垂直、组合）
5. THE Timeline SHALL 显示当前播放头的位置
6. THE Timeline SHALL 支持缩放时间轴以查看更多或更少的细节
7. THE Timeline SHALL 遵循 iOS 风格设计，与现有 UI 保持一致

### 需求 6：导出序列

**用户故事：** 作为用户，我希望能够将动画导出为图片序列或视频，以便在其他应用中使用。

#### 验收标准

1. WHEN 用户点击"导出序列"按钮 THEN THE Export_Sequence SHALL 显示导出配置面板
2. THE Export_Sequence SHALL 允许用户选择导出格式：图片序列（PNG）或视频（MP4）
3. THE Export_Sequence SHALL 允许用户设置帧率（15、30、60 FPS）
4. THE Export_Sequence SHALL 允许用户设置输出分辨率（与当前九宫格设置一致）
5. WHEN 用户确认导出 THEN THE Export_Sequence SHALL 遍历动画的每一帧，调用 Gemini API 生成图片
6. WHEN 导出进行中 THEN THE Export_Sequence SHALL 显示进度条和当前帧数
7. WHEN 导出完成 THEN THE Export_Sequence SHALL 提供下载链接或自动下载文件
8. IF Gemini API 调用失败 THEN THE Export_Sequence SHALL 记录错误，并允许用户重试失败的帧

### 需求 7：数据持久化

**用户故事：** 作为用户，我希望动画配置能够保存到节点数据中，以便下次打开项目时恢复。

#### 验收标准

1. WHEN 用户添加或修改关键帧 THEN THE Animation_System SHALL 将关键帧数据序列化到节点的 data 属性中
2. WHEN 节点加载时 THEN THE Animation_System SHALL 从节点 data 中反序列化关键帧数据
3. THE Animation_System SHALL 保存每个关键帧的时间戳、相机参数和缓动函数
4. THE Animation_System SHALL 保存动画的总时长和循环设置
5. WHEN 序列化数据损坏或版本不兼容 THEN THE Animation_System SHALL 使用默认空动画，并记录警告

### 需求 8：性能优化

**用户故事：** 作为用户，我希望动画预览流畅不卡顿，以便获得良好的使用体验。

#### 验收标准

1. WHEN 动画播放时 THEN THE Animation_System SHALL 不阻塞主线程，保持 UI 响应
2. WHEN 关键帧数量达到 20 个 THEN THE Animation_System SHALL 仍能保持至少 30 FPS 的播放帧率
3. THE Animation_System SHALL 使用 requestAnimationFrame 进行动画循环
4. WHEN 用户切换到其他节点 THEN THE Animation_System SHALL 暂停动画播放，释放资源
5. THE Animation_System SHALL 复用 Three.js 渲染器，不创建额外的 WebGL 上下文

### 需求 9：错误处理

**用户故事：** 作为用户，我希望在出现错误时能够得到清晰的提示，以便知道如何解决问题。

#### 验收标准

1. WHEN 用户尝试添加超过 20 个关键帧 THEN THE Animation_System SHALL 显示错误提示"关键帧数量已达上限（20 个）"
2. WHEN 导出过程中 Gemini API 返回错误 THEN THE Export_Sequence SHALL 显示具体的错误信息，并提供重试选项
3. WHEN 关键帧数据无效（如时间戳重复） THEN THE Animation_System SHALL 自动修正或提示用户
4. WHEN 浏览器不支持 WebGL THEN THE Animation_System SHALL 显示降级提示，禁用 3D 预览
5. WHEN 导出文件大小超过浏览器限制 THEN THE Export_Sequence SHALL 提示用户减少帧数或分辨率

### 需求 10：UI 集成

**用户故事：** 作为用户，我希望动画功能无缝集成到现有的多角度相机节点中，以便不影响现有工作流程。

#### 验收标准

1. THE Animation_System SHALL 作为多角度相机节点的一个可选功能模块
2. WHEN 用户点击"动画"按钮 THEN THE Animation_System SHALL 显示动画编辑面板，覆盖在 3D 视口上方
3. WHEN 动画面板打开时 THEN THE Animation_System SHALL 保留现有的相机控制功能（拖拽、滚轮缩放）
4. THE Animation_System SHALL 使用与现有 UI 一致的 iOS 风格设计（毛玻璃、圆角、动画过渡）
5. WHEN 用户关闭动画面板 THEN THE Animation_System SHALL 恢复到普通相机控制模式
6. THE Animation_System SHALL 不影响现有的九宫格生成功能
