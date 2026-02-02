# 废弃节点清理 - 需求文档

## 1. 功能概述

清理 SunStudio 中已废弃的 4 个故事创作节点，简化节点系统，为后续节点重构做准备。

## 2. 商业价值

### 解决的问题
- **节点冗余**：当前有 4 个已废弃的节点占用侧边栏空间和代码库
- **维护成本高**：废弃节点增加代码维护难度和 Bug 风险
- **代码混乱**：废弃代码影响代码可读性和可维护性
- **为重构铺路**：清理废弃代码，为后续节点重构创造干净的基础

### 目标用户
- 开发团队（降低维护成本）
- 未来的代码维护者（更清晰的代码结构）

### 成功指标
- 节点数量从 14 个减少到 10 个（减少 29%）
- 代码量减少约 2000 行（删除 4 个组件文件）
- 侧边栏更简洁
- 编译速度提升

## 3. 用户场景

### 主场景：开发者清理废弃代码
1. 开发者执行删除操作
2. 系统删除 4 个废弃节点的所有相关代码
3. 侧边栏不再显示这 4 个节点
4. 应用正常运行，其他节点不受影响

### 边界场景
- **场景 A：旧工作流处理**
  - 用户打开包含废弃节点的旧工作流
  - 系统显示警告："此工作流包含已删除的节点，无法完全加载"
  - 用户可以选择：关闭工作流 / 继续加载（忽略废弃节点）
  
- **场景 B：空工作流**
  - 用户创建新工作流
  - 侧边栏不显示废弃节点
  - 一切正常

## 4. 功能规格

### 4.1 待删除节点

| 节点类型 | 节点名称 | 状态 | 删除原因 |
|---------|---------|------|---------|
| `STORY_STUDIO` | 创意工作室 | 已废弃 | 功能已被"剧本节点"替代 |
| `CHARACTER_REFERENCE` | 角色参考 | 已废弃 | 不再需要 |
| `SCENE_REFERENCE` | 场景参考 | 已废弃 | 不再需要 |
| `STORYBOARD_SHOT` | 分镜生成 | 已废弃 | 不再需要 |

### 4.2 保留节点（不受影响）

| 节点类型 | 节点名称 | 说明 |
|---------|---------|------|
| `PROMPT_INPUT` | 创意描述 | 基础文字输入节点 |
| `IMAGE_GENERATOR` | 文字生图 | 基础图片生成节点 |
| `VIDEO_GENERATOR` | 文生视频 | 基础视频生成节点 |
| `VIDEO_ANALYZER` | 视频分析 | 视频分析工具 |
| `IMAGE_EDITOR` | 图片编辑 | 图片编辑工具 |
| `AUDIO_GENERATOR` | 音频生成 | 音频生成工具 |
| `SCRIPT_NODE` | 剧本节点 | 专业剧本创作工具 |
| `SHOT_IMAGE_GENERATOR` | 分镜图生成 | 分镜图生成工具 |
| `MULTI_ANGLE_CAMERA` | 多角度相机 | 特殊 3D 视角工具 |
| `GRID_SPLITTER` | 九宫格处理 | 特殊图片处理工具 |

### 4.3 删除影响分析

#### 代码文件删除
```
✅ 可以安全删除：
- components/StoryStudioNode.tsx（约 300 行）
- components/CharacterReferenceNode.tsx（约 250 行）
- components/SceneReferenceNode.tsx（约 250 行）
- components/StoryboardShotNode.tsx（约 300 行）

⚠️ 需要修改：
- types.ts（删除 4 个枚举值）
- core/registry/NodeRegistry.ts（删除 4 个节点注册）
- components/Node.tsx（删除 4 个节点的渲染逻辑）
- components/SidebarDock.tsx（删除侧边栏按钮）
- hooks/useNodeHelpers.ts（删除高度计算逻辑）
- hooks/useConnection.ts（删除连接规则）
- services/cozeService.ts（删除类型引用）
```

#### 数据类型清理
```typescript
// types.ts 中删除：
export enum NodeType {
  // ❌ 删除这 4 个
  STORY_STUDIO = 'STORY_STUDIO',
  CHARACTER_REFERENCE = 'CHARACTER_REFERENCE',
  SCENE_REFERENCE = 'SCENE_REFERENCE',
  STORYBOARD_SHOT = 'STORYBOARD_SHOT',
  
  // ✅ 保留其他所有节点类型
}

// AppNode['data'] 中删除相关字段：
// - storyStyle, targetDuration, shotCount（STORY_STUDIO 专用）
// - characterRefs, currentCharacterIndex（CHARACTER_REFERENCE 专用）
// - sceneRefs, currentSceneIndex（SCENE_REFERENCE 专用）
// - currentShotIndex（STORYBOARD_SHOT 专用）
```

#### 连接规则清理
```typescript
// hooks/useConnection.ts 中删除：
case NodeType.STORY_STUDIO:
  compatible.push(NodeType.CHARACTER_REFERENCE, NodeType.SCENE_REFERENCE, NodeType.STORYBOARD_SHOT);
  break;
case NodeType.CHARACTER_REFERENCE:
  compatible.push(NodeType.STORYBOARD_SHOT);
  break;
case NodeType.SCENE_REFERENCE:
  compatible.push(NodeType.STORYBOARD_SHOT);
  break;
case NodeType.STORYBOARD_SHOT:
  compatible.push(NodeType.STORY_STUDIO, NodeType.CHARACTER_REFERENCE, NodeType.SCENE_REFERENCE);
  break;
```

## 5. UI 规格

### 侧边栏布局（删除后）
```
基础节点
├── 创意描述
├── 文字生图
├── 文生视频
├── 视频分析
├── 图片编辑
└── 音频生成

故事创作
├── 剧本节点
└── 分镜图生成

特殊工具
├── 多角度相机
└── 九宫格处理

[删除] 故事创作（旧）
├── [删除] 创意工作室
├── [删除] 角色参考
├── [删除] 场景参考
└── [删除] 分镜生成
```

### 删除前后对比

| 项目 | 删除前 | 删除后 | 变化 |
|-----|-------|-------|------|
| 节点总数 | 14 个 | 10 个 | -4 个 |
| 侧边栏分组 | 3 组 | 3 组 | 不变 |
| 组件文件 | 14 个 | 10 个 | -4 个 |
| 代码行数 | ~1100 行 | ~2000 行 | -900 行 |

## 6. 错误处理

| 错误类型 | 触发条件 | 提示信息 | 用户操作 |
|---------|---------|---------|---------|
| 旧工作流加载 | 打开包含废弃节点的工作流 | "此工作流包含已删除的节点（创意工作室/角色参考/场景参考/分镜生成），这些节点将被忽略" | 确认/取消 |
| 编译错误 | 删除后代码引用错误 | TypeScript 编译错误 | 修复代码 |
| 运行时错误 | 遗漏的节点引用 | Console 错误 | 修复代码 |

## 7. 性能要求

- **删除响应时间**：< 100ms
- **应用启动时间**：减少约 50ms（减少 4 个组件加载）
- **内存占用减少**：约 5-10MB（删除 4 个组件）
- **代码体积减少**：约 900 行（4 个组件文件）
- **编译时间减少**：约 5%

## 8. 兼容性

### 浏览器
- Chrome 90+
- Firefox 88+
- Safari 14+

### 数据格式
- **旧工作流**：显示警告，忽略废弃节点
- **新工作流**：不包含废弃节点，正常运行

## 9. 安全性

### 代码安全
- 删除前备份代码
- 使用 Git 版本控制
- 可以随时回滚

### 数据安全
- 不影响用户数据
- 旧工作流仍然可以打开（忽略废弃节点）

## 10. 测试用例

### 正常流程
- [ ] 删除后，应用可以正常启动
- [ ] 侧边栏不再显示 4 个废弃节点
- [ ] 其他节点可以正常创建和使用
- [ ] 其他节点之间可以正常连接
- [ ] 其他节点可以正常生成内容

### 异常流程
- [ ] 打开包含废弃节点的旧工作流，显示警告
- [ ] 忽略废弃节点后，工作流可以部分加载
- [ ] 没有编译错误
- [ ] 没有运行时错误

### 边界情况
- [ ] 空工作流（无影响）
- [ ] 只有废弃节点的工作流（显示警告，无法加载）
- [ ] 混合新旧节点的工作流（部分加载，显示警告）

## 11. 验收标准

### 功能验收
- [ ] 4 个废弃节点已从代码中完全删除
- [ ] 侧边栏不再显示废弃节点
- [ ] 其他节点功能正常
- [ ] 其他节点之间可以正常连接
- [ ] 应用可以正常启动和运行

### 结构验收
- [ ] 代码符合三层架构规范
- [ ] 节点注册表已更新
- [ ] 类型定义已更新
- [ ] 连接规则已更新
- [ ] 没有遗留的废弃代码引用

### 性能验收
- [ ] 应用启动速度提升
- [ ] 内存占用减少
- [ ] 代码体积减少
- [ ] 编译时间减少

## 12. 风险和依赖

### 风险
- **风险 1：遗漏的代码引用**
  - 缓解方案：使用全局搜索检查所有引用，确保完全删除
  
- **风险 2：旧工作流无法打开**
  - 缓解方案：显示友好的警告信息，说明哪些节点已被删除
  
- **风险 3：意外删除重要代码**
  - 缓解方案：删除前备份代码，使用 Git 版本控制

### 依赖
- **依赖 1：Git 版本控制**
  - 描述：必须使用 Git 管理代码，以便回滚
  - 备选方案：手动备份代码
  
- **依赖 2：TypeScript 编译器**
  - 描述：依赖 TypeScript 检查类型错误
  - 备选方案：手动检查代码

## 13. 未来扩展

### 扩展 1：节点重构
- 在干净的代码基础上，重新设计节点架构
- 实现更灵活的节点系统

### 扩展 2：工作流迁移工具
- 提供工具自动迁移旧工作流
- 将废弃节点替换为新节点

### 扩展 3：节点版本管理
- 为节点添加版本号
- 支持节点升级和降级

## 14. 实施计划

### 阶段 1：准备工作（0.5 天）
- [ ] 备份当前代码（Git commit）
- [ ] 全局搜索所有废弃节点引用
- [ ] 创建删除清单

### 阶段 2：删除组件文件（0.5 天）
- [ ] 删除 `components/StoryStudioNode.tsx`
- [ ] 删除 `components/CharacterReferenceNode.tsx`
- [ ] 删除 `components/SceneReferenceNode.tsx`
- [ ] 删除 `components/StoryboardShotNode.tsx`

### 阶段 3：清理类型定义（0.5 天）
- [ ] 删除 `types.ts` 中的 4 个枚举值
- [ ] 删除 `types.ts` 中的相关数据字段
- [ ] 删除 `core/registry/NodeRegistry.ts` 中的 4 个节点注册

### 阶段 4：清理渲染逻辑（0.5 天）
- [ ] 删除 `components/Node.tsx` 中的 4 个节点渲染逻辑
- [ ] 删除 `components/Node.tsx` 中的 import 语句
- [ ] 删除 `components/SidebarDock.tsx` 中的侧边栏按钮

### 阶段 5：清理 Hooks 和服务（0.5 天）
- [ ] 删除 `hooks/useNodeHelpers.ts` 中的高度计算逻辑
- [ ] 删除 `hooks/useConnection.ts` 中的连接规则
- [ ] 删除 `services/cozeService.ts` 中的类型引用

### 阶段 6：测试验证（0.5 天）
- [ ] 编译检查（无 TypeScript 错误）
- [ ] 运行时检查（无 Console 错误）
- [ ] 功能测试（其他节点正常工作）
- [ ] 旧工作流测试（显示警告）

### 阶段 7：文档更新（0.5 天）
- [ ] 更新开发文档
- [ ] 记录删除的节点列表
- [ ] 说明如何处理旧工作流

**总计：3.5 天**

## 15. 关键决策

### 决策 1：是否完全删除？
- **选项 A**：完全删除（推荐）✅
  - 优点：代码更简洁，维护成本低
  - 缺点：旧工作流无法完全加载
  
- **选项 B**：标记为"已废弃"，保留代码
  - 优点：旧工作流可以直接打开
  - 缺点：代码冗余，维护成本高

**最终决策：选项 A（完全删除）**
- 理由：这些节点已经废弃，用户应该已经迁移
- 为后续节点重构创造干净的基础

### 决策 2：如何处理旧工作流？
- **选项 A**：显示警告，忽略废弃节点（推荐）✅
  - 优点：实现简单，用户可以继续使用其他节点
  - 缺点：部分功能丢失
  
- **选项 B**：禁止打开
  - 优点：强制用户迁移
  - 缺点：用户体验差

**最终决策：选项 A（显示警告）**
- 理由：平衡用户体验和实现成本

### 决策 3：是否需要迁移工具？
- **选项 A**：不需要（推荐）✅
  - 优点：实现简单，节省时间
  - 缺点：用户需要手动重建工作流
  
- **选项 B**：提供迁移工具
  - 优点：用户体验好
  - 缺点：实现复杂，且功能未定义

**最终决策：选项 A（不需要）**
- 理由：用户对剩余节点有其他规划，不需要自动迁移

## 16. 附录

### 附录 A：旧节点功能清单

#### STORY_STUDIO（创意工作室）
- 创意输入
- 风格选择
- 时长设置
- 镜头数设置
- 剧本生成
- 角色列表
- 场景列表
- 镜头列表

#### CHARACTER_REFERENCE（角色参考）
- 角色选择
- 角色信息展示
- 九宫格生成
- 参考图选择
- 提示词优化

#### SCENE_REFERENCE（场景参考）
- 场景选择
- 场景信息展示
- 九宫格生成
- 参考图选择
- 提示词优化

#### STORYBOARD_SHOT（分镜生成）
- 镜头选择
- 镜头信息展示
- 九宫格生成
- 分镜图选择
- 提示词优化
- 负面提示词

### 附录 B：新节点功能映射

| 旧功能 | 新节点 | 新功能位置 |
|-------|-------|-----------|
| 创意输入 | PROMPT_INPUT | 基础模式 |
| 剧本生成 | PROMPT_INPUT | 剧本模式 |
| 角色参考 | IMAGE_GENERATOR | 角色模式 |
| 场景参考 | IMAGE_GENERATOR | 场景模式 |
| 分镜生成 | IMAGE_GENERATOR | 分镜模式 |
| 九宫格生成 | IMAGE_GENERATOR | 所有模式 |
| 提示词优化 | PROMPT_INPUT | 工具功能 |

### 附录 C：代码删除清单

```bash
# 删除组件文件
rm components/StoryStudioNode.tsx
rm components/CharacterReferenceNode.tsx
rm components/SceneReferenceNode.tsx
rm components/StoryboardShotNode.tsx

# 修改类型定义
# types.ts: 删除 STORY_STUDIO, CHARACTER_REFERENCE, SCENE_REFERENCE, STORYBOARD_SHOT

# 修改节点注册表
# core/registry/NodeRegistry.ts: 删除 4 个节点注册

# 修改节点渲染
# components/Node.tsx: 删除 4 个节点的渲染逻辑

# 修改侧边栏
# components/SidebarDock.tsx: 删除 4 个节点的按钮

# 修改 Hooks
# hooks/useNodeHelpers.ts: 删除 4 个节点的高度计算
# hooks/useConnection.ts: 删除 4 个节点的连接规则

# 修改服务
# services/cozeService.ts: 删除 CHARACTER_REFERENCE, SCENE_REFERENCE 类型引用
```

---

**文档版本：** 1.0  
**创建日期：** 2026-02-03  
**最后更新：** 2026-02-03  
**作者：** Kiro AI  
**审核状态：** 待审核
