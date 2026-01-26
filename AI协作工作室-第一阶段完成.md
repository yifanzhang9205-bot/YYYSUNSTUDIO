# AI 协作工作室 - 第一阶段完成

## ✅ 已完成的工作

### 1. 数据结构设计（types.ts）
- ✅ 添加了完整的剧本数据结构：`ScriptData`, `Character`, `Scene`, `Shot`
- ✅ 添加了专业影视术语枚举：`ShotType`, `CameraAngle`, `CameraMovement`
- ✅ 添加了新节点类型：`SCRIPT_NODE`, `SHOT_IMAGE_GENERATOR`
- ✅ 标记了废弃节点：`STORY_STUDIO`, `STORYBOARD_SHOT`（保留兼容性）

### 2. 剧本节点组件（components/ScriptNode.tsx）
- ✅ 创建了完整的剧本节点 UI 组件
- ✅ 实现了折叠/展开状态切换
- ✅ 实现了 Tab 切换（角色/场景/分镜）
- ✅ 实现了分镜列表的展开/折叠
- ✅ 实现了剧本标题的编辑功能
- ✅ 预留了"生成工作流"和"生成图片"按钮

### 3. 节点渲染集成（components/Node.tsx）
- ✅ 导入了 `ScriptNode` 组件
- ✅ 在 `renderMediaContent` 函数中添加了 `SCRIPT_NODE` 的渲染逻辑
- ✅ 在 `getNodeHeight` 函数中添加了剧本节点的高度计算
  - 未生成剧本：200px
  - 已生成剧本（折叠）：200px
  - 已生成剧本（展开）：600px

### 4. 主应用集成（App.tsx）
- ✅ 更新了 `getNodeNameCN` 函数，添加"剧本"节点的中文名称
- ✅ 更新了 `getNodeIcon` 函数，添加剧本节点的图标（Film）
- ✅ 更新了 `addNode` 函数，添加剧本节点的默认值
- ✅ 更新了 `getApproxNodeHeight` 函数，添加剧本节点的高度计算
- ✅ 更新了 `getCompatibleOutputNodes` 函数，添加剧本节点的连接规则
  - 剧本节点 → 角色参考、场景参考、分镜图生成

### 5. 侧边栏集成（components/SidebarDock.tsx）
- ✅ 更新了 `getNodeNameCN` 函数，添加"剧本"节点
- ✅ 更新了 `getNodeIcon` 函数，添加剧本节点图标
- ✅ 在"故事创作"部分添加了"剧本"节点（放在最前面）

### 6. 右键菜单集成（App.tsx）
- ✅ 在右键菜单的"故事创作"部分添加了"剧本"节点

---

## 🎯 当前状态

### 可以使用的功能
1. ✅ 在侧边栏点击"剧本"按钮创建剧本节点
2. ✅ 在右键菜单中创建剧本节点
3. ✅ 剧本节点显示正确的 UI（未生成状态）
4. ✅ 剧本节点可以折叠/展开
5. ✅ 剧本节点可以编辑标题

### 尚未实现的功能
1. ❌ 剧本生成功能（需要在 AI 助手中输入创意）
2. ❌ "生成工作流"功能（自动创建角色/场景/分镜节点）
3. ❌ "生成图片"功能（单个分镜生成图片）
4. ❌ Coze AI 剧本生成接口（`generateScript` 函数）

---

## 📋 下一步工作

### 第二阶段：剧本生成功能

#### 1. 在 AssistantPanel.tsx 中添加剧本生成入口
- 检测用户是否选中了剧本节点
- 如果选中，显示"生成剧本"按钮
- 点击按钮后，将用户输入发送给 Coze AI

#### 2. 在 cozeService.ts 中实现 `generateScript` 函数
```typescript
export const generateScript = async (
  userInput: string,
  preferences: {
    targetDuration?: number;
    shotCount?: number;
    style?: string;
  } = {}
): Promise<ScriptData> => {
  // 1. 构建 Prompt（包含完整的 JSON 结构示例）
  // 2. 调用 Coze AI API
  // 3. 解析返回的 JSON
  // 4. 验证数据结构
  // 5. 返回 ScriptData
}
```

#### 3. 在 App.tsx 中添加剧本生成的 Action 处理
```typescript
// 在 handleNodeAction 函数中添加
if (node.type === NodeType.SCRIPT_NODE) {
    // 调用 generateScript
    // 更新节点数据
}
```

#### 4. Prompt 设计（关键！）
```
你是一个专业的影视编剧和导演。请根据用户的创意，生成一个完整的剧本。

用户创意：{userInput}

目标时长：{targetDuration} 秒
镜头数量：{shotCount} 个
风格：{style}

请返回以下 JSON 格式：
{
  "title": "剧本标题",
  "logline": "一句话概述",
  "theme": "主题/情绪",
  "targetDuration": 60,
  "characters": [
    {
      "id": "char-1",
      "name": "角色名",
      "description": "外貌描述（详细，用于生成图片）",
      "personality": "性格特点",
      "visualKeywords": ["关键词1", "关键词2"]
    }
  ],
  "scenes": [
    {
      "id": "scene-1",
      "sceneNumber": 1,
      "location": "INT. 地点",
      "timeOfDay": "白天/夜晚",
      "mood": "情绪",
      "description": "场景描述",
      "visualKeywords": ["关键词1", "关键词2"]
    }
  ],
  "shots": [
    {
      "id": "shot-1",
      "shotNumber": 1,
      "sceneId": "scene-1",
      "shotType": "Medium Shot",
      "cameraAngle": "Eye Level",
      "cameraMovement": "Static",
      "duration": 5,
      "characters": ["角色名"],
      "action": "动作描述",
      "dialogue": "台词（可选）",
      "visualDescription": "视觉描述（详细）",
      "imagePrompt": "图片生成提示词（英文，详细）"
    }
  ]
}

要求：
1. imagePrompt 必须是英文，包含完整的视觉细节
2. 确保角色外貌一致性（同一个人在所有镜头中应该有相同的特征）
3. 场景描述要详细，便于生成参考图
4. 镜头之间要有逻辑连贯性
```

---

### 第三阶段：自动化工作流

#### 1. 实现"生成工作流"功能
- 自动创建角色参考节点（每个角色一个）
- 自动创建场景参考节点（每个场景一个）
- 自动创建分镜图生成节点（每个镜头一个）
- 自动连接节点（剧本 → 角色/场景 → 分镜）
- 自动布局节点（避免重叠）

#### 2. 实现"生成图片"功能
- 单个分镜生成图片
- 支持参考图（角色参考 + 场景参考）
- 使用 NanoBanana Pro 的 `images` 参数

---

### 第四阶段：NanoBanana 参考图支持

#### 1. 更新 nanoBananaService.ts
```typescript
export const generateImage = async (
  prompt: string,
  options: {
    aspectRatio?: string;
    count?: number;
    referenceImages?: string[]; // 最多 2 张
  } = {}
): Promise<string[]> => {
  // 添加 images 参数支持
}
```

#### 2. 提示词合成策略
```
主提示词：{shot.imagePrompt}

参考图 1（角色）：{characterReferenceImage}
参考图 2（场景）：{sceneReferenceImage}

合成提示词：
"same character as reference image 1, {shot.imagePrompt}, in the style of reference image 2"
```

---

## 🚀 测试计划

### 基础功能测试
1. ✅ 创建剧本节点
2. ✅ 剧本节点 UI 显示正确
3. ❌ 生成剧本（等待 Coze AI 集成）
4. ❌ 查看剧本详情（角色/场景/分镜）
5. ❌ 编辑剧本标题
6. ❌ 生成工作流
7. ❌ 生成单个分镜图片

### 边界情况测试
1. ❌ 剧本生成失败（网络错误）
2. ❌ 剧本生成超时
3. ❌ 剧本 JSON 格式错误
4. ❌ 角色/场景/分镜数量为 0
5. ❌ 角色/场景/分镜数量过多（>100）

### 性能测试
1. ❌ 大型剧本（100+ 镜头）的渲染性能
2. ❌ 批量生成图片的并发控制
3. ❌ 内存占用（剧本数据 + 图片数据）

---

## 📝 技术债务

### 已知问题
1. App.tsx 中有大量 TypeScript 类型错误（已存在，非本次引入）
2. 剧本节点的高度计算可能需要优化（根据实际内容动态调整）
3. 剧本数据的持久化（目前依赖 localStorage，未来需要迁移到服务器）

### 优化建议
1. 剧本节点的 UI 可以进一步优化（添加更多交互细节）
2. 剧本生成的 Prompt 需要反复测试和优化
3. 考虑添加剧本导出功能（PDF/Word）
4. 考虑添加剧本版本管理（支持修改历史）

---

## 🎉 总结

第一阶段的核心工作已经完成：
- ✅ 数据结构设计完成
- ✅ 剧本节点 UI 完成
- ✅ 节点集成完成
- ✅ 侧边栏和右键菜单集成完成

下一步的重点是：
1. 实现 Coze AI 剧本生成功能
2. 实现自动化工作流
3. 实现参考图支持

**预计完成时间：**
- 第二阶段（剧本生成）：2-3 小时
- 第三阶段（自动化工作流）：3-4 小时
- 第四阶段（参考图支持）：2-3 小时

**总计：7-10 小时**

---

## 📚 相关文档

- `AI协作工作室-数据结构设计.md` - 完整的技术规范
- `AI协作工作室-实施计划.md` - 开发计划
- `AI协作工作室-快速参考.md` - 快速参考指南
- `Coze-AI导演助手-集成完成.md` - Coze API 集成文档
- `文字API架构-最终版.md` - API 架构说明
