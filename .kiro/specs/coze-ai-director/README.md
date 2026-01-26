# Coze AI 导演助手 - 项目总览

## 📖 项目简介

将 Coze（扣子）智能体集成到 SunStudio，打造专业的 AI 导演助手，帮助用户从灵感到成片的全流程创作。

**核心理念**：AI 协作而非 AI 替代（F1 赛车模式）

---

## 🎯 核心功能

### 1. 智能提示词工程师 ⭐ 最重要
- 将简单描述转化为专业的 AI 生成提示词
- 提供 3 个版本：简洁版、标准版、电影级
- 自动生成负面提示词和参数建议
- **用户痛点**：不知道如何写好提示词

### 2. 剧本分解助手
- 将故事分解为角色、场景、镜头
- 自动生成专业的分镜列表
- 每个镜头包含详细的视觉描述和提示词
- **用户痛点**：不了解专业影视制作流程

### 3. 工作流规划师
- 根据剧本自动创建节点和连接
- 智能分组和排列
- 一键生成完整的制作工作流
- **用户痛点**：手动创建节点太繁琐

### 4. 批量优化工具
- 统一多个节点的风格/色调/镜头语言
- 预览变更后一键应用
- **用户痛点**：重复操作太多

---

## 📚 文档结构

```
.kiro/specs/coze-ai-director/
├── README.md                      # 本文件 - 项目总览
├── requirements.md                # 需求文档 - 详细的功能规格
├── COZE_CONFIGURATION_GUIDE.md    # Coze 配置指南 - 智能体设置
├── MODEL_SELECTION_GUIDE.md       # 模型选择指南 - 快速参考 ⭐ 新增
├── HOW_TO_GET_BOT_ID.md          # Bot ID 获取教程 - 图文说明 ⭐ 新增
└── API_SPECIFICATION.md           # API 接口规范 - 技术实现
```

### 阅读顺序

1. **产品经理/用户** → 先读 `README.md`（本文件）
2. **配置智能体** → 读 `MODEL_SELECTION_GUIDE.md`（5 分钟快速配置）
3. **获取凭证** → 读 `HOW_TO_GET_BOT_ID.md`（图文教程）
4. **详细配置** → 读 `COZE_CONFIGURATION_GUIDE.md`（完整指南）
5. **开发集成** → 读 `API_SPECIFICATION.md`（技术规范）
2. **配置智能体** → 读 `COZE_CONFIGURATION_GUIDE.md`
3. **开发人员** → 读 `requirements.md` + `API_SPECIFICATION.md`

---

## 🚀 快速开始

### 第一步：配置 Coze 智能体

1. 访问 [Coze 平台](https://www.coze.com/)
2. 创建新智能体，命名为"SunStudio AI 导演"
3. 复制 `COZE_CONFIGURATION_GUIDE.md` 中的系统提示词
4. 选择模型（推荐 GPT-4o 或豆包）
5. 发布智能体并获取 API 密钥

**详细步骤**：见 `COZE_CONFIGURATION_GUIDE.md`

---

### 第二步：测试智能体

使用 Postman 或 curl 测试：

```bash
curl -X POST https://api.coze.com/v1/chat \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "bot_id": "YOUR_BOT_ID",
    "user_id": "test_user",
    "stream": false,
    "messages": [{
      "role": "user",
      "content": "{\"function\":\"optimize_prompt\",\"userInput\":\"一只猫\",\"nodeType\":\"IMAGE_GENERATOR\",\"context\":{\"aspectRatio\":\"1:1\"}}"
    }]
  }'
```

**预期结果**：返回 3 个版本的提示词

---

### 第三步：集成到 SunStudio

开发团队需要：

1. 创建 `services/cozeService.ts`
2. 实现 API 调用函数
3. 创建聊天窗口组件
4. 添加节点上的 AI 按钮
5. 实现批量优化功能

**详细规格**：见 `requirements.md` 和 `API_SPECIFICATION.md`

---

## 🎬 专业影视制作工作流

基于行业最佳实践，我们设计了以下标准流程：

```
1. 创意开发 (Development)
   └─ 用户输入灵感/故事大纲

2. 剧本分解 (Script Breakdown) ⭐ AI 核心能力
   ├─ 提取角色、场景、道具
   ├─ 分析技术需求
   └─ 生成资产列表

3. 分镜设计 (Storyboarding) ⭐ AI 核心能力
   ├─ 生成镜头列表 (Shot List)
   ├─ 定义镜头类型（特写/中景/全景）
   ├─ 设计机位角度（平视/俯视/仰视）
   ├─ 规划运镜方式（静止/推进/跟随）
   └─ 编写视觉描述

4. 资产生成 (Asset Creation)
   ├─ 生成角色参考图 ⭐ AI 优化提示词
   ├─ 生成场景参考图 ⭐ AI 优化提示词
   └─ 生成道具/氛围图

5. 镜头生成 (Shot Production)
   ├─ 按分镜生成图片 ⭐ AI 优化提示词
   ├─ 图片转视频
   └─ 多角度相机调整

6. 后期制作 (Post-Production)
   ├─ 视频剪辑/拼接
   ├─ 音频添加
   └─ 特效/调色
```

**参考来源**：
- [Film Pre-Production Guide 2025](https://blog.studiovity.com/film-pre-production-guide-2025/)
- [Professional Script Breakdown](https://nofilmschool.com/pre-production-in-film)
- [ComfyUI Video Production Workflow](https://comfyui.org/en/video-generation-pipeline-features-models-optimization)

---

## 💡 设计亮点

### 1. 结合现有节点系统

AI 功能完全融入现有的节点工作流：

- **STORY_STUDIO** - 存储剧本数据
- **CHARACTER_REFERENCE** - 角色参考图
- **SCENE_REFERENCE** - 场景参考图
- **STORYBOARD_SHOT** - 分镜节点
- **IMAGE_GENERATOR** - 图片生成
- **VIDEO_GENERATOR** - 视频生成
- **MULTI_ANGLE_CAMERA** - 多角度相机

### 2. 渐进式增强

- **新手**：AI 生成完整工作流 → 一键创建所有节点
- **进阶**：AI 优化单个提示词 → 点击节点上的 AI 按钮
- **专业**：AI 批量优化 → 选中多个节点统一风格

### 3. 教育性

- AI 不仅给出结果，还解释原因（reasoning 字段）
- 用户可以学习专业的镜头语言和提示词技巧
- 逐步提升用户的创作能力

### 4. 可控性

- 用户始终掌控最终决策
- AI 只提供建议，不强制应用
- 支持预览和撤销

---

## 🔧 技术架构

### 前端

```
components/
├── ChatWindow.tsx           # 聊天窗口（右侧侧边栏）
├── AIOptimizeButton.tsx     # 节点上的 AI 按钮
├── BatchOptimizeMenu.tsx    # 批量优化菜单
└── WorkflowPreview.tsx      # 工作流预览对话框

services/
└── cozeService.ts           # Coze API 封装
```

### API 调用流程

```
用户操作
  ↓
前端组件
  ↓
cozeService.ts
  ↓
Coze API (HTTPS)
  ↓
智能体处理
  ↓
返回 JSON
  ↓
前端解析并应用
```

---

## 📊 成功指标

### 用户体验指标
- 提示词优化后的图片质量提升 **50%+**
- 完成项目的时间缩短 **30%+**
- AI 建议的采纳率 **> 60%**

### 技术指标
- API 响应时间 **< 3 秒**
- 错误率 **< 1%**
- 用户满意度 **> 4.5/5**

---

## 🛠️ 开发计划

### Phase 1：核心功能（2 周）
- [ ] 创建 `cozeService.ts`
- [ ] 实现提示词优化功能
- [ ] 创建聊天窗口组件
- [ ] 添加节点上的 AI 按钮

### Phase 2：高级功能（2 周）
- [ ] 实现剧本分解功能
- [ ] 实现工作流生成功能
- [ ] 实现批量优化功能

### Phase 3：优化和测试（1 周）
- [ ] 性能优化
- [ ] 错误处理完善
- [ ] 用户测试和反馈

---

## 🤝 协作流程

### 用户 → 配置智能体
1. 阅读 `COZE_CONFIGURATION_GUIDE.md`
2. 在 Coze 平台创建智能体
3. 测试智能体功能
4. 提供 API 密钥和 bot_id

### 开发团队 → 集成 API
1. 阅读 `requirements.md` 和 `API_SPECIFICATION.md`
2. 实现 `cozeService.ts`
3. 创建 UI 组件
4. 测试和调试

### 产品团队 → 验收测试
1. 测试所有功能
2. 收集用户反馈
3. 迭代优化

---

## 📞 联系方式

- **技术问题**：查看 `API_SPECIFICATION.md`
- **配置问题**：查看 `COZE_CONFIGURATION_GUIDE.md`
- **功能需求**：查看 `requirements.md`

---

## 📝 更新日志

### v1.0 (2025-01-24)
- ✅ 完成需求文档
- ✅ 完成 Coze 配置指南
- ✅ 完成 API 接口规范
- ⏳ 等待智能体配置
- ⏳ 等待 API 集成

---

**项目状态**：需求设计完成，等待实施  
**下一步**：配置 Coze 智能体并测试  
**预计完成时间**：5 周

---

**文档版本**：v1.0  
**创建日期**：2025-01-24  
**作者**：Kiro AI + 用户协作
