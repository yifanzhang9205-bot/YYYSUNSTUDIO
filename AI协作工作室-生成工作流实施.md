# AI 协作工作室 - 生成工作流功能实施

## 📋 功能概述

当用户点击剧本节点的"生成工作流"按钮时，自动创建以下节点并连接：
1. **角色参考节点**（每个角色一个）
2. **场景参考节点**（每个场景一个）
3. **分镜图生成节点**（每个分镜一个）

## 🎯 实施位置

**文件**: `App.tsx`
**函数**: 需要实现 `createWorkflowFromScript` 函数

## 📐 布局设计

```
剧本节点 (420x600)
    |
    ├─→ 角色参考 1 (420x400)  ─┐
    ├─→ 角色参考 2 (420x400)  ─┤
    ├─→ 角色参考 3 (420x400)  ─┤
    |                          ├─→ 分镜图 1 (420x500)
    ├─→ 场景参考 1 (420x400)  ─┤   分镜图 2 (420x500)
    ├─→ 场景参考 2 (420x400)  ─┤   分镜图 3 (420x500)
    └─→ 场景参考 3 (420x400)  ─┘   ...
```

### 布局参数
- **节点宽度**: 420px（统一）
- **水平间距**: 150px（列间距）
- **垂直间距**: 40px（行间距）
- **列数**: 
  - 角色/场景：1 列（垂直排列）
  - 分镜：3 列（网格排列）

## 🔧 实施代码

### 1. 在 Node.tsx 中更新 onCreateWorkflow 回调

```typescript
// components/Node.tsx (renderMediaContent 函数中)
if (node.type === NodeType.SCRIPT_NODE) {
    return (
        <ScriptNode
            scriptData={node.data.scriptData}
            isGenerating={isWorking}
            error={node.data.error}
            onGenerate={() => onAction(node.id)}
            onUpdate={(data) => onUpdate(node.id, { scriptData: data })}
            onCreateWorkflow={() => {
                // 调用 App.tsx 中的函数
                onCreateWorkflow?.(node.id);
            }}
            onGenerateShot={(shotId) => {
                // TODO: 实现单个分镜生成
                console.log('[剧本节点] 生成分镜:', shotId);
            }}
        />
    );
}
```

### 2. 在 App.tsx 中实现 createWorkflowFromScript 函数

```typescript
// App.tsx

/**
 * 从剧本节点生成完整工作流
 */
const createWorkflowFromScript = useCallback((scriptNodeId: string) => {
    const scriptNode = nodesRef.current.get(scriptNodeId);
    if (!scriptNode || !scriptNode.data.scriptData) {
        console.error('[生成工作流] 剧本节点不存在或没有剧本数据');
        return;
    }
    
    const scriptData = scriptNode.data.scriptData;
    console.log('[生成工作流] 开始生成...', {
        characters: scriptData.characters.length,
        scenes: scriptData.scenes.length,
        shots: scriptData.shots.length
    });
    
    saveHistory(); // 保存历史记录
    
    const newNodes: AppNode[] = [];
    const newConnections: Connection[] = [];
    
    // 布局参数
    const nodeWidth = 420;
    const colGap = 150;
    const rowGap = 40;
    const startX = scriptNode.x + nodeWidth + colGap;
    const startY = scriptNode.y;
    
    // === 1. 创建角色参考节点 ===
    let currentY = startY;
    scriptData.characters.forEach((char, index) => {
        const nodeId = `char-ref-${Date.now()}-${index}`;
        const nodeHeight = 400;
        
        newNodes.push({
            id: nodeId,
            type: NodeType.CHARACTER_REFERENCE,
            x: startX,
            y: currentY,
            width: nodeWidth,
            height: nodeHeight,
            title: `角色：${char.name}`,
            status: NodeStatus.IDLE,
            data: {
                characterId: char.id,
                characterName: char.name,
                description: char.description,
                personality: char.personality,
                visualKeywords: char.visualKeywords,
                scriptNodeId: scriptNodeId
            },
            inputs: [scriptNodeId]
        });
        
        newConnections.push({
            from: scriptNodeId,
            to: nodeId
        });
        
        currentY += nodeHeight + rowGap;
    });
    
    // === 2. 创建场景参考节点 ===
    scriptData.scenes.forEach((scene, index) => {
        const nodeId = `scene-ref-${Date.now()}-${index}`;
        const nodeHeight = 400;
        
        newNodes.push({
            id: nodeId,
            type: NodeType.SCENE_REFERENCE,
            x: startX,
            y: currentY,
            width: nodeWidth,
            height: nodeHeight,
            title: `场景 ${scene.sceneNumber}：${scene.location}`,
            status: NodeStatus.IDLE,
            data: {
                sceneId: scene.id,
                sceneNumber: scene.sceneNumber,
                location: scene.location,
                timeOfDay: scene.timeOfDay,
                mood: scene.mood,
                description: scene.description,
                visualKeywords: scene.visualKeywords,
                scriptNodeId: scriptNodeId
            },
            inputs: [scriptNodeId]
        });
        
        newConnections.push({
            from: scriptNodeId,
            to: nodeId
        });
        
        currentY += nodeHeight + rowGap;
    });
    
    // === 3. 创建分镜图生成节点（网格布局）===
    const shotStartX = startX + nodeWidth + colGap;
    const shotStartY = startY;
    const shotColumns = 3;
    const shotNodeHeight = 500;
    
    scriptData.shots.forEach((shot, index) => {
        const col = index % shotColumns;
        const row = Math.floor(index / shotColumns);
        const nodeId = `shot-img-${Date.now()}-${index}`;
        
        const posX = shotStartX + col * (nodeWidth + colGap);
        const posY = shotStartY + row * (shotNodeHeight + rowGap);
        
        // 找到该分镜关联的角色参考节点和场景参考节点
        const characterNodeIds = shot.characters
            .map(charName => {
                const charIndex = scriptData.characters.findIndex(c => c.name === charName);
                return charIndex >= 0 ? newNodes[charIndex].id : null;
            })
            .filter(Boolean) as string[];
        
        const sceneNodeId = newNodes.find(n => 
            n.type === NodeType.SCENE_REFERENCE && 
            n.data.sceneId === shot.sceneId
        )?.id;
        
        // 输入节点：剧本节点 + 角色参考 + 场景参考
        const inputNodeIds = [
            scriptNodeId,
            ...characterNodeIds,
            ...(sceneNodeId ? [sceneNodeId] : [])
        ];
        
        newNodes.push({
            id: nodeId,
            type: NodeType.SHOT_IMAGE_GENERATOR,
            x: posX,
            y: posY,
            width: nodeWidth,
            height: shotNodeHeight,
            title: `镜头 ${shot.shotNumber}`,
            status: NodeStatus.IDLE,
            data: {
                shotId: shot.id,
                shotNumber: shot.shotNumber,
                shotType: shot.shotType,
                cameraAngle: shot.cameraAngle,
                cameraMovement: shot.cameraMovement,
                duration: shot.duration,
                characters: shot.characters,
                action: shot.action,
                dialogue: shot.dialogue,
                visualDescription: shot.visualDescription,
                basePrompt: shot.imagePrompt,
                scriptNodeId: scriptNodeId,
                sceneId: shot.sceneId
            },
            inputs: inputNodeIds
        });
        
        // 创建连接
        inputNodeIds.forEach(inputId => {
            newConnections.push({
                from: inputId,
                to: nodeId
            });
        });
    });
    
    // === 4. 创建分组 ===
    const groups: Group[] = [];
    
    // 角色参考组
    if (scriptData.characters.length > 0) {
        const charNodes = newNodes.filter(n => n.type === NodeType.CHARACTER_REFERENCE);
        const groupPadding = 30;
        const groupHeight = charNodes.reduce((sum, n) => sum + (n.height || 400) + rowGap, 0) - rowGap + groupPadding * 2;
        
        groups.push({
            id: `group-chars-${Date.now()}`,
            title: '角色参考',
            x: startX - groupPadding,
            y: startY - groupPadding,
            width: nodeWidth + groupPadding * 2,
            height: groupHeight,
            nodeIds: charNodes.map(n => n.id)
        });
    }
    
    // 场景参考组
    if (scriptData.scenes.length > 0) {
        const sceneNodes = newNodes.filter(n => n.type === NodeType.SCENE_REFERENCE);
        const groupPadding = 30;
        const firstSceneY = sceneNodes[0].y;
        const groupHeight = sceneNodes.reduce((sum, n) => sum + (n.height || 400) + rowGap, 0) - rowGap + groupPadding * 2;
        
        groups.push({
            id: `group-scenes-${Date.now()}`,
            title: '场景参考',
            x: startX - groupPadding,
            y: firstSceneY - groupPadding,
            width: nodeWidth + groupPadding * 2,
            height: groupHeight,
            nodeIds: sceneNodes.map(n => n.id)
        });
    }
    
    // 分镜图生成组
    if (scriptData.shots.length > 0) {
        const shotNodes = newNodes.filter(n => n.type === NodeType.SHOT_IMAGE_GENERATOR);
        const groupPadding = 30;
        const totalRows = Math.ceil(scriptData.shots.length / shotColumns);
        const groupWidth = (Math.min(scriptData.shots.length, shotColumns) * nodeWidth) + 
                          ((Math.min(scriptData.shots.length, shotColumns) - 1) * colGap) + 
                          (groupPadding * 2);
        const groupHeight = (totalRows * shotNodeHeight) + ((totalRows - 1) * rowGap) + (groupPadding * 2);
        
        groups.push({
            id: `group-shots-${Date.now()}`,
            title: '分镜图生成',
            x: shotStartX - groupPadding,
            y: shotStartY - groupPadding,
            width: groupWidth,
            height: groupHeight,
            nodeIds: shotNodes.map(n => n.id)
        });
    }
    
    // === 5. 更新状态 ===
    setNodes(prev => {
        const newMap = new Map(prev);
        newNodes.forEach(node => newMap.set(node.id, node));
        return newMap;
    });
    setConnections(prev => [...prev, ...newConnections]);
    setGroups(prev => [...prev, ...groups]);
    
    console.log('[生成工作流] 完成！', {
        newNodesCount: newNodes.length,
        newConnectionsCount: newConnections.length,
        groupsCount: groups.length
    });
    
    // 提示用户
    alert(`✅ 工作流生成成功！\n\n已创建：\n- ${scriptData.characters.length} 个角色参考节点\n- ${scriptData.scenes.length} 个场景参考节点\n- ${scriptData.shots.length} 个分镜图生成节点`);
}, [saveHistory]);
```

### 3. 在 Node 组件中传递 onCreateWorkflow

```typescript
// App.tsx (渲染节点的地方)
<Node
    key={node.id}
    node={node}
    onUpdate={handleNodeUpdate}
    onAction={handleNodeAction}
    onCreateWorkflow={createWorkflowFromScript}  // 新增
    onDelete={(id) => deleteNodes([id])}
    onExpand={setExpandedMedia}
    // ... 其他 props
/>
```

### 4. 更新 Node.tsx 的 Props 类型

```typescript
// components/Node.tsx
interface NodeProps {
    node: AppNode;
    onUpdate: (id: string, data: Partial<AppNode['data']>) => void;
    onAction: (id: string, promptOverride?: string) => void;
    onCreateWorkflow?: (scriptNodeId: string) => void;  // 新增
    onDelete: (id: string) => void;
    onExpand: (media: any) => void;
    // ... 其他 props
}
```

## 🎨 节点类型设计

### CHARACTER_REFERENCE（角色参考节点）
```typescript
{
    type: NodeType.CHARACTER_REFERENCE,
    data: {
        characterId: string;
        characterName: string;
        description: string;
        personality: string;
        visualKeywords: string[];
        scriptNodeId: string;
        image?: string;  // 生成的参考图
    }
}
```

### SCENE_REFERENCE（场景参考节点）
```typescript
{
    type: NodeType.SCENE_REFERENCE,
    data: {
        sceneId: string;
        sceneNumber: number;
        location: string;
        timeOfDay: string;
        mood: string;
        description: string;
        visualKeywords: string[];
        scriptNodeId: string;
        image?: string;  // 生成的参考图
    }
}
```

### SHOT_IMAGE_GENERATOR（分镜图生成节点）
```typescript
{
    type: NodeType.SHOT_IMAGE_GENERATOR,
    data: {
        shotId: string;
        shotNumber: number;
        shotType: string;
        cameraAngle: string;
        cameraMovement: string;
        duration: number;
        characters: string[];
        action: string;
        dialogue?: string;
        visualDescription: string;
        basePrompt: string;
        scriptNodeId: string;
        sceneId: string;
        image?: string;  // 生成的图片
        images?: string[];  // 多张候选图
    }
}
```

## ✅ 验收标准

- [ ] 点击"生成工作流"按钮后，自动创建所有节点
- [ ] 节点布局合理，不重叠
- [ ] 连接线正确连接
- [ ] 分组正确创建
- [ ] 节点数据完整
- [ ] 控制台无错误
- [ ] 提示用户生成成功

## 🚀 后续优化

1. **自动生成参考图**：角色和场景节点创建后自动调用图片生成
2. **批量生成分镜图**：一键生成所有分镜图
3. **进度提示**：显示生成进度（X/Y 已完成）
4. **失败重试**：单个节点失败时可以重新生成

---

**实施完成后，AI 协作工作室的核心功能就全部完成了！** 🎉
