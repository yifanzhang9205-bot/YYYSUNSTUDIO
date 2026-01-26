# AI 协作工作室 - 快速参考

## 📋 节点类型

### 新增节点
- `SCRIPT_NODE` - 剧本节点
- `SHOT_IMAGE_GENERATOR` - 分镜图生成节点

### 废弃节点（保留兼容性）
- `STORY_STUDIO` - 创意工作室（已废弃）
- `STORYBOARD_SHOT` - 分镜生成（已废弃）

### 保持不变的节点
- `MULTI_ANGLE_CAMERA` - 多角度相机（不动）
- `GRID_SPLITTER` - 九宫格处理（不动）

---

## 🔗 节点连接规则

```
剧本节点 (SCRIPT_NODE)
  ├─→ 角色参考 (CHARACTER_REFERENCE)
  ├─→ 场景参考 (SCENE_REFERENCE)
  └─→ 分镜图生成 (SHOT_IMAGE_GENERATOR)

角色参考 (CHARACTER_REFERENCE)
  └─→ 分镜图生成 (SHOT_IMAGE_GENERATOR)

场景参考 (SCENE_REFERENCE)
  └─→ 分镜图生成 (SHOT_IMAGE_GENERATOR)

分镜图生成 (SHOT_IMAGE_GENERATOR)
  └─→ 多角度相机 (MULTI_ANGLE_CAMERA)
```

---

## 📊 数据结构

### ScriptData
```typescript
interface ScriptData {
  title: string;              // 剧本标题
  logline: string;            // 一句话概述
  theme: string;              // 主题/情绪
  targetDuration: number;     // 目标时长（秒）
  characters: Character[];    // 角色列表
  scenes: Scene[];            // 场景列表
  shots: Shot[];              // 分镜列表
  createdAt: number;
  updatedAt: number;
  version: number;
}
```

### Character
```typescript
interface Character {
  id: string;
  name: string;               // 角色名
  description: string;        // 外貌描述
  personality: string;        // 性格特点
  visualKeywords: string[];   // 视觉关键词
  referenceNodeId?: string;   // 关联的参考节点 ID
}
```

### Scene
```typescript
interface Scene {
  id: string;
  sceneNumber: number;
  location: string;           // 地点
  timeOfDay: string;          // 时间
  mood: string;               // 情绪
  description: string;        // 场景描述
  visualKeywords: string[];
  referenceNodeId?: string;
}
```

### Shot
```typescript
interface Shot {
  id: string;
  shotNumber: number;
  sceneId: string;
  shotType: ShotType;         // 镜头类型
  cameraAngle: CameraAngle;   // 机位角度
  cameraMovement: CameraMovement; // 运镜方式
  duration: number;
  characters: string[];       // 角色名列表
  action: string;             // 动作描述
  dialogue?: string;          // 台词
  visualDescription: string;  // 视觉描述
  imagePrompt: string;        // AI 生成的提示词
  generatedImageNodeId?: string;
}
```

---

## 🎬 专业术语

### 镜头类型（ShotType）
- `Extreme Wide Shot` - 极远景
- `Wide Shot` - 远景
- `Full Shot` - 全景
- `Medium Shot` - 中景
- `Close-Up` - 特写
- `Extreme Close-Up` - 大特写

### 机位角度（CameraAngle）
- `Eye Level` - 平视
- `High Angle` - 俯视
- `Low Angle` - 仰视
- `Bird's Eye View` - 鸟瞰
- `Dutch Angle` - 荷兰角

### 运镜方式（CameraMovement）
- `Static` - 静止
- `Pan` - 摇镜
- `Tilt` - 俯仰
- `Dolly` - 推拉
- `Track` - 跟随
- `Crane` - 升降
- `Handheld` - 手持

---

## 🎨 UI 组件

### ScriptNode 组件
```typescript
interface ScriptNodeProps {
  scriptData?: ScriptData;
  isGenerating: boolean;
  error?: string;
  
  onGenerate: () => void;
  onUpdate: (data: ScriptData) => void;
  onCreateWorkflow: () => void;
  onGenerateShot: (shotId: string) => void;
}
```

### 视图模式
- `overview` - 概览（折叠状态）
- `characters` - 角色列表
- `scenes` - 场景列表
- `shots` - 分镜列表

---

## 🔧 API 接口

### Coze AI 剧本生成
```typescript
export const generateScript = async (
  userIdea: string,
  targetDuration: number
): Promise<ScriptData> => {
  // TODO: 实现
}
```

### NanoBanana Pro 图片生成（支持参考图）
```typescript
export const generateImage = async (
  prompt: string,
  referenceImages?: string[] // 最多 2 张
): Promise<string> => {
  // TODO: 更新
}
```

---

## 📝 待实现功能

### 1. 剧本节点渲染（App.tsx）
```typescript
{node.type === NodeType.SCRIPT_NODE && (
  <ScriptNode
    scriptData={node.data.scriptData}
    isGenerating={node.status === NodeStatus.WORKING}
    error={node.data.error}
    onGenerate={() => setIsChatOpen(true)}
    onUpdate={(data) => {
      setNodes(prev => {
        const newMap = new Map(prev);
        const node = newMap.get(nodeId);
        if (node) {
          newMap.set(nodeId, {
            ...node,
            data: { ...node.data, scriptData: data }
          });
        }
        return newMap;
      });
    }}
    onCreateWorkflow={() => {/* TODO */}}
    onGenerateShot={(shotId) => {/* TODO */}}
  />
)}
```

### 2. 侧边栏按钮（SidebarDock.tsx）
```typescript
<button
  onClick={() => addNode(NodeType.SCRIPT_NODE)}
  className="..."
>
  <Film size={20} />
  <span>创建剧本</span>
</button>
```

### 3. Coze AI 剧本生成（cozeService.ts）
```typescript
export const generateScript = async (
  userIdea: string,
  targetDuration: number = 60
): Promise<ScriptData> => {
  const prompt = `请根据以下创意生成一个专业的影视剧本：

创意：${userIdea}
目标时长：${targetDuration} 秒

要求：
1. 生成剧本标题、一句话概述、主题
2. 提取 2-3 个主要角色（包含外貌描述、性格特点、视觉关键词）
3. 设计 1-2 个场景（包含地点、时间、情绪、视觉关键词）
4. 分解为 6-10 个镜头（包含镜头类型、机位角度、运镜方式、动作、台词、视觉描述、图片生成提示词）

请以 JSON 格式返回，严格遵循以下结构：
{
  "title": "剧本标题",
  "logline": "一句话概述",
  "theme": "主题/情绪",
  "targetDuration": ${targetDuration},
  "characters": [
    {
      "id": "char-1",
      "name": "角色名",
      "description": "外貌描述",
      "personality": "性格特点",
      "visualKeywords": ["关键词1", "关键词2"]
    }
  ],
  "scenes": [
    {
      "id": "scene-1",
      "sceneNumber": 1,
      "location": "INT. 地点",
      "timeOfDay": "时间",
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
      "shotType": "Wide Shot",
      "cameraAngle": "Eye Level",
      "cameraMovement": "Static",
      "duration": 3,
      "characters": ["角色名"],
      "action": "动作描述",
      "dialogue": "台词（可选）",
      "visualDescription": "详细的视觉描述",
      "imagePrompt": "英文图片生成提示词"
    }
  ],
  "createdAt": ${Date.now()},
  "updatedAt": ${Date.now()},
  "version": 1
}`;

  const response = await sendCozeMessage(prompt);
  const scriptData = parseCozeResponse<ScriptData>(response);
  
  return scriptData;
};
```

---

## 🚀 快速开始

### 1. 创建剧本节点
```typescript
addNode(NodeType.SCRIPT_NODE);
```

### 2. 生成剧本
```typescript
const scriptData = await generateScript(
  "一个赛博朋克世界的孤独机器人",
  60
);
```

### 3. 更新节点数据
```typescript
setNodes(prev => {
  const newMap = new Map(prev);
  const node = newMap.get(nodeId);
  if (node) {
    newMap.set(nodeId, {
      ...node,
      data: { ...node.data, scriptData }
    });
  }
  return newMap;
});
```

### 4. 生成工作流
```typescript
// 自动创建角色参考节点
scriptData.characters.forEach(char => {
  addNode(NodeType.CHARACTER_REFERENCE, x, y, {
    scriptNodeId: scriptNodeId,
    characterId: char.id,
    characterName: char.name,
    description: char.description,
    visualKeywords: char.visualKeywords
  });
});

// 自动创建场景参考节点
scriptData.scenes.forEach(scene => {
  addNode(NodeType.SCENE_REFERENCE, x, y, {
    scriptNodeId: scriptNodeId,
    sceneId: scene.id,
    location: scene.location,
    timeOfDay: scene.timeOfDay,
    mood: scene.mood,
    visualKeywords: scene.visualKeywords
  });
});

// 自动创建分镜图生成节点
scriptData.shots.forEach(shot => {
  addNode(NodeType.SHOT_IMAGE_GENERATOR, x, y, {
    scriptNodeId: scriptNodeId,
    shotId: shot.id,
    shotNumber: shot.shotNumber,
    shotType: shot.shotType,
    cameraAngle: shot.cameraAngle,
    action: shot.action,
    visualDescription: shot.visualDescription,
    basePrompt: shot.imagePrompt
  });
});
```

---

## 📚 参考资料

- [数据结构设计文档](./AI协作工作室-数据结构设计.md)
- [实施计划文档](./AI协作工作室-实施计划.md)
- [集成完成文档](./AI协作工作室-集成完成.md)
- [Coze AI 文档](https://www.coze.cn/docs/developer_guides/chat_v3)
- [NanoBanana Pro API](https://nanobnana.com/docs/api/v2-generate)

---

**快速参考完成！开始开发吧！** 🚀
