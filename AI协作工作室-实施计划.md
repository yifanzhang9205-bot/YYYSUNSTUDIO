# AI 协作工作室 - 实施计划

## ✅ 已完成

### 1. 数据结构设计
- [x] 更新 `types.ts`：添加 `ScriptData`, `Shot`, `Character`, `Scene` 等类型
- [x] 添加枚举：`ShotType`, `CameraAngle`, `CameraMovement`
- [x] 添加新节点类型：`SCRIPT_NODE`, `SHOT_IMAGE_GENERATOR`

### 2. 剧本节点组件
- [x] 创建 `components/ScriptNode.tsx`
- [x] 实现折叠/展开状态
- [x] 实现 Tab 切换（角色/场景/分镜）
- [x] 实现分镜列表展示

---

## 🚧 进行中

### 3. 集成到主应用
- [ ] 在 `App.tsx` 中添加 `SCRIPT_NODE` 的创建逻辑
- [ ] 在 `App.tsx` 中添加 `SCRIPT_NODE` 的渲染逻辑
- [ ] 更新 `getNodeNameCN` 和 `getNodeIcon` 函数

### 4. Coze AI 剧本生成
- [ ] 在 `cozeService.ts` 中添加 `generateScript` 函数
- [ ] 实现剧本生成的 JSON 解析
- [ ] 在 AI 助手中添加"生成剧本"快捷指令

### 5. 分镜图生成节点
- [ ] 创建 `components/ShotImageGeneratorNode.tsx`
- [ ] 实现 9 宫格图片选择器
- [ ] 实现参考图连接逻辑

### 6. NanoBanana Pro 集成
- [ ] 更新 `nanoBananaService.ts`：支持 `images` 参数
- [ ] 实现提示词合成逻辑（角色参考 + 场景参考）
- [ ] 实现 9 宫格生成（调用 API 9 次）

---

## 📝 待办事项

### 7. 角色/场景参考节点
- [ ] 更新 `CHARACTER_REFERENCE` 节点组件
- [ ] 更新 `SCENE_REFERENCE` 节点组件
- [ ] 实现参考图上传功能
- [ ] 实现 AI 生成参考图功能

### 8. 自动化连接
- [ ] 实现"生成工作流"功能
- [ ] 自动创建角色参考节点
- [ ] 自动创建场景参考节点
- [ ] 自动创建分镜图生成节点
- [ ] 自动连接节点

### 9. 性能优化
- [ ] 实现 Blob URL 存储
- [ ] 实现 IndexedDB 存储
- [ ] 实现并发控制（最多 4 个请求）
- [ ] 实现防抖和节流

### 10. 错误处理
- [ ] 实现重试机制
- [ ] 实现友好的错误提示
- [ ] 实现加载状态显示

---

## 🎯 下一步行动

**立即开始：集成剧本节点到主应用**

1. 更新 `App.tsx`：添加 `SCRIPT_NODE` 的创建和渲染逻辑
2. 更新 AI 助手：添加"生成剧本"功能
3. 测试剧本节点的基本功能

**预计时间：30 分钟**
