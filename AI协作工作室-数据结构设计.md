# AI 协作工作室 - 数据结构设计

## 1. 剧本节点 (SCRIPT_NODE)

### 节点类型定义
```typescript
export enum NodeType {
  // ... 现有类型
  SCRIPT_NODE = 'SCRIPT_NODE',              // 剧本节点
  CHARACTER_REFERENCE = 'CHARACTER_REFERENCE', // 角色参考（已有）
  SCENE_REFERENCE = 'SCENE_REFERENCE',         // 场景参考（已有）
  SHOT_IMAGE_GENERATOR = 'SHOT_IMAGE_GENERATOR', // 分镜图生成
}
```

### 剧本数据结构
```typescript
interface ScriptData {
  // 基本信息
  title: string;              // 剧本标题
  logline: string;            // 一句话概述
  theme: string;              // 主题/情绪
  targetDuration: number;     // 目标时长（秒）
  
  // 角色列表
  characters: Character[];
  
  // 场景列表
  scenes: Scene[];
  
  // 分镜列表
  shots: Shot[];
  
  // 元数据
  createdAt: number;
  updatedAt: number;
  version: number;            // 版本号（支持修改历史）
}

interface Character {
  id: string;                 // 唯一 ID
  name: string;               // 角色名
  description: string;        // 外貌描述
  personality: string;        // 性格特点
  visualKeywords: string[];   // 视觉关键词（用于生成提示词）
  referenceImageId?: string;  // 关联的参考图节点 ID
}

interface Scene {
  id: string;                 // 唯一 ID
  sceneNumber: number;        // 场景编号
  location: string;           // 地点（例如："INT. 赛博朋克酒吧"）
  timeOfDay: string;          // 时间（例如："夜晚"）
  mood: string;               // 情绪（例如："神秘、紧张"）
  description: string;        // 场景描述
  visualKeywords: string[];   // 视觉关键词
  referenceImageId?: string;  // 关联的参考图节点 ID
}

interface Shot {
  id: string;                 // 唯一 ID
  shotNumber: number;         // 镜头编号
  sceneId: string;            // 所属场景 ID
  
  // 镜头参数
  shotType: ShotType;         // 镜头类型
  cameraAngle: CameraAngle;   // 机位角度
  cameraMovement: CameraMovement; // 运镜方式
  duration: number;           // 时长（秒）
  
  // 内容
  characters: string[];       // 出现的角色名列表
  action: string;             // 动作描述
  dialogue?: string;          // 台词（可选）
  visualDescription: string;  // 视觉描述（详细）
  
  // AI 生成的提示词
  imagePrompt: string;        // 图片生成提示词
  
  // 关联的生成节点
  generatedImageNodeId?: string; // 关联的分镜图生成节点 ID
}

// 镜头类型枚举
enum ShotType {
  EXTREME_WIDE = 'Extreme Wide Shot',    // 极远景
  WIDE = 'Wide Shot',                    // 远景
  FULL = 'Full Shot',                    // 全景
  MEDIUM = 'Medium Shot',                // 中景
  CLOSE_UP = 'Close-Up',                 // 特写
  EXTREME_CLOSE_UP = 'Extreme Close-Up', // 大特写
}

// 机位角度枚举
enum CameraAngle {
  EYE_LEVEL = 'Eye Level',       // 平视
  HIGH_ANGLE = 'High Angle',     // 俯视
  LOW_ANGLE = 'Low Angle',       // 仰视
  BIRDS_EYE = "Bird's Eye View", // 鸟瞰
  DUTCH = 'Dutch Angle',         // 荷兰角
}

// 运镜方式枚举
enum CameraMovement {
  STATIC = 'Static',       // 静止
  PAN = 'Pan',             // 摇镜
  TILT = 'Tilt',           // 俯仰
  DOLLY = 'Dolly',         // 推拉
  TRACK = 'Track',         // 跟随
  CRANE = 'Crane',         // 升降
  HANDHELD = 'Handheld',   // 手持
}
```

---

## 2. 剧本节点 UI 设计

### 节点状态
```typescript
interface ScriptNodeState {
  isExpanded: boolean;        // 是否展开详情
  currentView: 'overview' | 'characters' | 'scenes' | 'shots'; // 当前视图
  selectedShotId?: string;    // 选中的分镜 ID
  isEditing: boolean;         // 是否处于编辑模式
}
```

### 节点布局（折叠状态）
```
┌─────────────────────────────────────┐
│ 📝 剧本：赛博朋克短片                │
├─────────────────────────────────────┤
│ 时长：60 秒                          │
│ 角色：3 个 | 场景：2 个 | 镜头：8 个 │
│                                     │
│ [展开详情] [生成工作流]              │
└─────────────────────────────────────┘
```

### 节点布局（展开状态）
```
┌─────────────────────────────────────┐
│ 📝 剧本：赛博朋克短片                │
├─────────────────────────────────────┤
│ [概览] [角色] [场景] [分镜]          │ ← Tab 切换
├─────────────────────────────────────┤
│                                     │
│ 【分镜视图】                         │
│                                     │
│ ┌─ 镜头 1 ─────────────────────┐   │
│ │ 类型：Wide Shot               │   │
│ │ 角度：High Angle              │   │
│ │ 时长：3 秒                    │   │
│ │ 描述：主角推门进入酒吧...      │   │
│ │ [生成图片] [查看提示词]       │   │
│ └───────────────────────────────┘   │
│                                     │
│ ┌─ 镜头 2 ─────────────────────┐   │
│ │ ...                           │   │
│ └───────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

---

## 3. 角色参考节点数据结构

### 节点数据
```typescript
interface CharacterReferenceNodeData {
  // 关联的剧本节点
  scriptNodeId: string;
  characterId: string;        // 剧本中的角色 ID
  
  // 角色信息（从剧本复制）
  characterName: string;
  description: string;
  visualKeywords: string[];
  
  // 用户上传的参考图
  referenceImage?: string;    // Blob URL 或 Base64
  
  // AI 生成的参考图（9 宫格）
  generatedImages?: string[]; // 9 张候选图
  selectedIndex?: number;     // 用户选中的索引
  finalImage?: string;        // 最终选定的图片
  
  // 生成参数
  prompt?: string;            // 用户补充的提示词
  generatedPrompt?: string;   // AI 优化后的提示词
}
```

### 节点布局
```
┌─────────────────────────────────────┐
│ 👤 角色参考：主角机器人              │
├─────────────────────────────────────┤
│ 描述：人形机器人，霓虹灯装饰...      │
│                                     │
│ [上传参考图] 或 [AI 生成]            │
│                                     │
│ ┌─────────────────────────────┐   │
│ │ [参考图预览]                 │   │
│ │                             │   │
│ └─────────────────────────────┘   │
│                                     │
│ [生成 9 宫格] [连接到分镜]           │
└─────────────────────────────────────┘
```

---

## 4. 场景参考节点数据结构

### 节点数据
```typescript
interface SceneReferenceNodeData {
  // 关联的剧本节点
  scriptNodeId: string;
  sceneId: string;            // 剧本中的场景 ID
  
  // 场景信息（从剧本复制）
  location: string;
  timeOfDay: string;
  mood: string;
  visualKeywords: string[];
  
  // 用户上传的参考图
  referenceImage?: string;
  
  // AI 生成的参考图（9 宫格）
  generatedImages?: string[];
  selectedIndex?: number;
  finalImage?: string;
  
  // 生成参数
  prompt?: string;
  generatedPrompt?: string;
}
```

---

## 5. 分镜图生成节点数据结构

### 节点数据
```typescript
interface ShotImageGeneratorNodeData {
  // 关联的剧本节点
  scriptNodeId: string;
  shotId: string;             // 剧本中的分镜 ID
  
  // 分镜信息（从剧本复制）
  shotNumber: number;
  shotType: ShotType;
  cameraAngle: CameraAngle;
  action: string;
  visualDescription: string;
  
  // 输入：参考图（最多 2 张）
  characterReferenceNodeId?: string; // 角色参考节点 ID
  sceneReferenceNodeId?: string;     // 场景参考节点 ID
  
  // 输入：参考图 URL（从关联节点获取）
  characterReferenceImage?: string;
  sceneReferenceImage?: string;
  
  // AI 生成的提示词
  basePrompt: string;         // 基础提示词（从剧本生成）
  userPrompt?: string;        // 用户补充的提示词
  finalPrompt: string;        // 最终合成的提示词
  
  // 输出：9 宫格图片
  generatedImages?: string[]; // 9 张候选图
  selectedIndex?: number;     // 用户选中的索引
  finalImage?: string;        // 最终选定的图片
  
  // 生成状态
  status: 'idle' | 'generating' | 'success' | 'error';
  error?: string;
}
```

### 节点布局
```
┌─────────────────────────────────────┐
│ 🎬 分镜 1：主角进入酒吧              │
├─────────────────────────────────────┤
│ 类型：Wide Shot | 角度：High Angle  │
│ 时长：3 秒                           │
│                                     │
│ 输入：                               │
│ ├─ 角色参考：主角机器人 ✓            │
│ └─ 场景参考：赛博朋克酒吧 ✓          │
│                                     │
│ 提示词：                             │
│ ┌─────────────────────────────┐   │
│ │ [AI 生成的提示词]            │   │
│ │ + [用户补充]                 │   │
│ └─────────────────────────────┘   │
│                                     │
│ [生成 9 宫格]                        │
│                                     │
│ ┌─────────────────────────────┐   │
│ │ [9 宫格图片选择器]           │   │
│ │ □ □ □                        │   │
│ │ □ ☑ □  ← 用户选中            │   │
│ │ □ □ □                        │   │
│ └─────────────────────────────┘   │
│                                     │
│ [重新生成] [连接到多角度相机]        │
└─────────────────────────────────────┘
```

---

## 6. 自动化连接规则

### 连接关系
```typescript
// 剧本节点 → 角色参考节点
// 自动传递：角色信息（name, description, visualKeywords）

// 剧本节点 → 场景参考节点
// 自动传递：场景信息（location, timeOfDay, mood, visualKeywords）

// 剧本节点 → 分镜图生成节点
// 自动传递：分镜信息（shotType, cameraAngle, action, visualDescription）

// 角色参考节点 → 分镜图生成节点
// 自动传递：角色参考图（finalImage）

// 场景参考节点 → 分镜图生成节点
// 自动传递：场景参考图（finalImage）

// 分镜图生成节点 → 多角度相机节点
// 自动传递：选定的图片（finalImage）
```

### 连接验证
```typescript
// 分镜图生成节点必须连接：
// 1. 剧本节点（必须）
// 2. 角色参考节点（可选，但推荐）
// 3. 场景参考节点（可选，但推荐）

// 如果缺少连接，显示警告：
// "⚠️ 未连接角色参考，人物一致性可能不佳"
// "⚠️ 未连接场景参考，场景一致性可能不佳"
```

---

## 7. 提示词合成策略（人物一致性核心）

### 提示词模板
```typescript
function generateShotPrompt(
  shot: Shot,
  characterRef?: string,  // 角色参考图 URL
  sceneRef?: string,      // 场景参考图 URL
  userPrompt?: string     // 用户补充
): string {
  // 基础结构：镜头类型 + 角度 + 动作 + 视觉描述
  let prompt = `${shot.shotType}, ${shot.cameraAngle}. ${shot.action}. ${shot.visualDescription}`;
  
  // 如果有角色参考，强调"same character as reference"
  if (characterRef) {
    prompt += `. Character appearance must match the reference image exactly (same face, same clothing, same hairstyle).`;
  }
  
  // 如果有场景参考，强调"same scene as reference"
  if (sceneRef) {
    prompt += `. Scene environment must match the reference image exactly (same lighting, same atmosphere, same color palette).`;
  }
  
  // 添加质量控制关键词
  prompt += `. Cinematic lighting, high detail, 8K resolution, professional photography.`;
  
  // 用户补充（放在最后，优先级最高）
  if (userPrompt) {
    prompt += ` ${userPrompt}`;
  }
  
  return prompt;
}
```

### NanoBanana Pro API 调用
```typescript
async function generateShotImage(
  prompt: string,
  characterRef?: string,
  sceneRef?: string
): Promise<string> {
  const images: string[] = [];
  
  // 添加参考图（最多 2 张）
  if (characterRef) images.push(characterRef);
  if (sceneRef) images.push(sceneRef);
  
  const response = await fetch('https://nanobnana.com/api/v2/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      prompt,
      aspect_ratio: '16:9',
      size: '2K',
      format: 'png',
      images: images.length > 0 ? images : undefined
    })
  });
  
  const { data } = await response.json();
  return data.task_id;
}
```

---

## 8. 工作流自动生成

### 生成策略
```typescript
async function generateWorkflowFromScript(scriptData: ScriptData) {
  const nodes: AppNode[] = [];
  const connections: Connection[] = [];
  
  // 1. 创建剧本节点（中心位置）
  const scriptNode = createScriptNode(scriptData, { x: 100, y: 100 });
  nodes.push(scriptNode);
  
  // 2. 创建角色参考节点（左侧）
  let yOffset = 100;
  scriptData.characters.forEach((character, index) => {
    const charNode = createCharacterReferenceNode(
      scriptNode.id,
      character,
      { x: -400, y: yOffset }
    );
    nodes.push(charNode);
    connections.push({ from: scriptNode.id, to: charNode.id });
    yOffset += 500;
  });
  
  // 3. 创建场景参考节点（右侧）
  yOffset = 100;
  scriptData.scenes.forEach((scene, index) => {
    const sceneNode = createSceneReferenceNode(
      scriptNode.id,
      scene,
      { x: 600, y: yOffset }
    );
    nodes.push(sceneNode);
    connections.push({ from: scriptNode.id, to: sceneNode.id });
    yOffset += 500;
  });
  
  // 4. 创建分镜图生成节点（下方，横向排列）
  let xOffset = 100;
  scriptData.shots.forEach((shot, index) => {
    const shotNode = createShotImageGeneratorNode(
      scriptNode.id,
      shot,
      { x: xOffset, y: 800 }
    );
    nodes.push(shotNode);
    connections.push({ from: scriptNode.id, to: shotNode.id });
    
    // 自动连接角色参考（如果分镜中有该角色）
    shot.characters.forEach(charName => {
      const charNode = nodes.find(n => 
        n.type === NodeType.CHARACTER_REFERENCE && 
        n.data.characterName === charName
      );
      if (charNode) {
        connections.push({ from: charNode.id, to: shotNode.id });
      }
    });
    
    // 自动连接场景参考
    const sceneNode = nodes.find(n => 
      n.type === NodeType.SCENE_REFERENCE && 
      n.data.sceneId === shot.sceneId
    );
    if (sceneNode) {
      connections.push({ from: sceneNode.id, to: shotNode.id });
    }
    
    xOffset += 500;
  });
  
  return { nodes, connections };
}
```

---

## 9. 性能优化策略

### 9.1 内存管理
```typescript
// 使用 Blob URL 存储图片（避免 Base64 占用内存）
// 使用 IndexedDB 存储大文件
// 及时清理不再使用的 Blob URL

// 9 宫格图片：只保留缩略图在内存，原图存 IndexedDB
interface GridImageData {
  thumbnail: string;  // Blob URL（小尺寸，用于显示）
  originalKey: string; // IndexedDB 键（大尺寸，用于下载）
}
```

### 9.2 并发控制
```typescript
// API 并发限制：最多 4 个请求
const queue = new PQueue({ concurrency: 4 });

// 批量生成分镜图时，使用队列
async function generateAllShots(shots: Shot[]) {
  const tasks = shots.map(shot => 
    () => generateShotImage(shot.imagePrompt, ...)
  );
  
  return await queue.addAll(tasks);
}
```

### 9.3 防抖和节流
```typescript
// 生成按钮：防抖 500ms
const handleGenerate = debounce(() => {
  generateImage();
}, 500);

// 重新生成按钮：防抖 1000ms（避免疯狂点击）
const handleRegenerate = debounce(() => {
  regenerateImage();
}, 1000);
```

---

## 10. 错误处理和重试

### 错误类型
```typescript
enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',       // 网络错误
  API_ERROR = 'API_ERROR',               // API 错误
  INSUFFICIENT_CREDITS = 'INSUFFICIENT_CREDITS', // 余额不足
  TIMEOUT = 'TIMEOUT',                   // 超时
  INVALID_INPUT = 'INVALID_INPUT',       // 输入无效
}

interface GenerationError {
  type: ErrorType;
  message: string;
  retryable: boolean;  // 是否可重试
}
```

### 重试策略
```typescript
async function generateWithRetry(
  fn: () => Promise<any>,
  maxRetries: number = 3
): Promise<any> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      // 指数退避：1s, 2s, 4s
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
}
```

---

## 11. 用户体验优化

### 11.1 加载状态
```typescript
// 生成中：显示进度提示
<div className="generating">
  <Loader2 className="animate-spin" />
  <span>正在生成中...</span>
  <span className="text-xs text-white/50">
    预计需要 30-60 秒
  </span>
</div>
```

### 11.2 空状态
```typescript
// 未连接参考图：显示提示
<div className="empty-state">
  <AlertCircle />
  <span>未连接角色参考</span>
  <span className="text-xs">
    连接角色参考可提升人物一致性
  </span>
  <button>连接节点</button>
</div>
```

### 11.3 成功反馈
```typescript
// 生成成功：显示动画
<div className="success-animation">
  <CheckCircle className="animate-bounce" />
  <span>生成成功！</span>
</div>
```

---

## 12. 下一步实施计划

### 阶段 1：核心流程（2-3 天）
- [ ] 创建剧本节点组件
- [ ] 集成 Coze AI 剧本生成
- [ ] 创建分镜图生成节点组件
- [ ] 集成 NanoBanana Pro API
- [ ] 实现提示词合成逻辑

### 阶段 2：资产管理（1-2 天）
- [ ] 创建角色参考节点组件
- [ ] 创建场景参考节点组件
- [ ] 实现参考图上传功能
- [ ] 实现 9 宫格选择器

### 阶段 3：自动化连接（1 天）
- [ ] 实现自动连接逻辑
- [ ] 实现工作流自动生成
- [ ] 实现节点数据同步

### 阶段 4：优化和测试（1-2 天）
- [ ] 性能优化（内存、并发）
- [ ] 错误处理和重试
- [ ] 用户体验优化
- [ ] 完整流程测试

---

**总计：5-8 天完成 MVP**
