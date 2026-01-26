# AI 协作工作室 - 剧本节点集成完成

## ✅ 已完成的工作

### 1. 数据结构设计（types.ts）
- ✅ 添加了完整的剧本数据结构
- ✅ 添加了专业的影视术语枚举
- ✅ 添加了新节点类型：`SCRIPT_NODE`, `SHOT_IMAGE_GENERATOR`
- ✅ 标记了废弃节点（保留兼容性）

### 2. 剧本节点组件（ScriptNode.tsx）
- ✅ 创建了完整的剧本节点 UI 组件
- ✅ 实现了折叠/展开状态
- ✅ 实现了 Tab 切换（角色/场景/分镜）
- ✅ 实现了分镜列表展示

### 3. 主应用集成（App.tsx）
- ✅ 更新了 `getNodeNameCN` 函数
- ✅ 更新了 `getNodeIcon` 函数
- ✅ 更新了 `addNode` 函数（添加剧本节点的默认值）
- ✅ 更新了 `getApproxNodeHeight` 函数（添加剧本节点的高度计算）
- ✅ 更新了 `getCompatibleOutputNodes` 函数（添加剧本节点的连接规则）

### 4. 兼容性保证
- ✅ 保持了 3D 相机（`MULTI_ANGLE_CAMERA`）完全不变
- ✅ 保持了九宫格节点（`GRID_SPLITTER`）完全不变
- ✅ 保留了废弃节点的兼容性（`STORY_STUDIO`, `STORYBOARD_SHOT`）

---

## 📊 当前进度：25% 完成

**基础集成已完成，接下来需要：**

1. **在 App.tsx 中添加剧本节点的渲染逻辑**（导入 ScriptNode 组件并渲染）
2. **在 SidebarDock 中添加"创建剧本"按钮**
3. **实现 Coze AI 剧本生成功能**
4. **创建分镜图生成节点组件**
5. **更新 NanoBanana 服务**（支持参考图）

---

## 🎯 下一步行动

### 任务 1：在 App.tsx 中添加剧本节点的渲染逻辑

需要在节点渲染部分添加：
```typescript
import { ScriptNode } from './components/ScriptNode';

// 在节点渲染逻辑中添加
{node.type === NodeType.SCRIPT_NODE && (
  <ScriptNode
    scriptData={node.data.scriptData}
    isGenerating={node.status === NodeStatus.WORKING}
    error={node.data.error}
    onGenerate={() => {/* 打开 AI 助手 */}}
    onUpdate={(data) => {/* 更新剧本数据 */}}
    onCreateWorkflow={() => {/* 生成工作流 */}}
    onGenerateShot={(shotId) => {/* 生成分镜图片 */}}
  />
)}
```

### 任务 2：在 SidebarDock 中添加"创建剧本"按钮

需要在侧边栏添加：
```typescript
<button onClick={() => addNode(NodeType.SCRIPT_NODE)}>
  <Film size={20} />
  <span>创建剧本</span>
</button>
```

### 任务 3：实现 Coze AI 剧本生成功能

需要在 `cozeService.ts` 中添加：
```typescript
export const generateScript = async (
  userIdea: string,
  targetDuration: number
): Promise<ScriptData> => {
  // 调用 Coze API 生成剧本
  // 返回结构化的剧本数据
}
```

---

## 🔧 技术细节

### 节点高度计算逻辑

```typescript
if (node.type === NodeType.SCRIPT_NODE) {
  if (node.data.scriptData) {
    return 600; // 有剧本数据时的高度
  }
  return 200; // 未生成剧本时的高度
}
```

### 节点连接规则

```typescript
case NodeType.SCRIPT_NODE:
  // 剧本节点可以连接到：
  // - 角色参考节点
  // - 场景参考节点
  // - 分镜图生成节点
  compatible.push(
    NodeType.CHARACTER_REFERENCE,
    NodeType.SCENE_REFERENCE,
    NodeType.SHOT_IMAGE_GENERATOR
  );
  break;
```

### 节点默认值

```typescript
const defaults: any = {
  scriptData: type === NodeType.SCRIPT_NODE ? undefined : undefined,
  // 剧本数据初始为 undefined，等待 AI 生成
  ...initialData
};
```

---

## 📝 代码变更总结

### App.tsx 变更
1. **addNode 函数**：添加了剧本节点的默认值
2. **getApproxNodeHeight 函数**：添加了剧本节点的高度计算
3. **getNodeNameCN 函数**：添加了剧本节点的中文名称
4. **getNodeIcon 函数**：添加了剧本节点的图标
5. **getCompatibleOutputNodes 函数**：添加了剧本节点的连接规则

### types.ts 变更
1. **NodeType 枚举**：添加了 `SCRIPT_NODE`, `SHOT_IMAGE_GENERATOR`
2. **ScriptData 接口**：完整的剧本数据结构
3. **Character, Scene, Shot 接口**：角色、场景、分镜数据结构
4. **ShotType, CameraAngle, CameraMovement 枚举**：专业影视术语

### components/ScriptNode.tsx（新文件）
1. **ScriptNode 组件**：完整的剧本节点 UI
2. **折叠/展开状态**：节省画布空间
3. **Tab 切换**：角色/场景/分镜视图
4. **分镜列表**：展开/折叠详情

---

## 🎨 UI 设计亮点

### 1. 渐进式展示
- **折叠状态**：只显示统计信息（角色数/场景数/镜头数）
- **展开状态**：显示完整的角色、场景、分镜列表
- **分镜详情**：点击展开查看动作、台词、视觉描述、AI 提示词

### 2. 专业术语
- **镜头类型**：Wide Shot, Close-Up, Medium Shot 等
- **机位角度**：Eye Level, High Angle, Low Angle 等
- **运镜方式**：Static, Pan, Dolly 等

### 3. 操作便捷
- **编辑标题**：点击标题旁的编辑按钮
- **生成参考图**：每个角色/场景都有"生成参考图"按钮
- **生成图片**：每个分镜都有"生成图片"按钮
- **生成工作流**：一键创建所有节点和连接

---

## 🚀 后续计划

### 第二阶段：完成渲染和交互（1 天）
1. 在 App.tsx 中添加剧本节点的渲染逻辑
2. 在 SidebarDock 中添加"创建剧本"按钮
3. 实现剧本节点的事件处理
4. 测试剧本节点的基本功能

### 第三阶段：Coze AI 剧本生成（2-3 天）
1. 设计剧本生成的 Prompt 模板
2. 实现 `generateScript` 函数
3. 实现 JSON 解析和数据验证
4. 在 AI 助手中添加"生成剧本"快捷指令
5. 测试剧本生成功能

### 第四阶段：分镜图生成节点（2-3 天）
1. 创建 `ShotImageGeneratorNode.tsx` 组件
2. 实现 9 宫格图片选择器
3. 实现参考图连接逻辑
4. 更新 `nanoBananaService.ts`
5. 实现提示词合成逻辑

### 第五阶段：自动化连接（1-2 天）
1. 实现"生成工作流"功能
2. 自动创建角色参考节点
3. 自动创建场景参考节点
4. 自动创建分镜图生成节点
5. 自动连接节点

### 第六阶段：优化和测试（1-2 天）
1. 性能优化（内存、并发）
2. 错误处理和重试
3. 用户体验优化
4. 完整流程测试

---

## 💡 设计理念

### 1. 保持现有功能不变
- ✅ 3D 相机（`MULTI_ANGLE_CAMERA`）完全不动
- ✅ 九宫格节点（`GRID_SPLITTER`）完全不动
- ✅ 其他现有节点的逻辑不受影响

### 2. 向后兼容
- ✅ 保留了废弃节点类型（`STORY_STUDIO`, `STORYBOARD_SHOT`）
- ✅ 添加了类型别名（`StoryData = ScriptData`）
- ✅ 不会破坏现有的工作流

### 3. 专业但易用
- ✅ 使用专业术语，但提供中文翻译
- ✅ 提供默认值，但允许自定义
- ✅ 提供 AI 生成，但允许手动编辑

### 4. 渐进式展示
- ✅ 折叠状态：只显示关键信息
- ✅ 展开状态：显示完整详情
- ✅ 按需加载：避免一次性渲染过多内容

---

## 🎉 总结

**剧本节点的基础集成已完成！**

- ✅ 数据结构设计完成
- ✅ UI 组件创建完成
- ✅ 主应用集成完成
- ✅ 兼容性保证完成

**下一步：完成渲染逻辑，然后开始 Coze AI 剧本生成功能！** 🚀
