/**
 * useNodeActions Hook
 * 
 * 职责：处理所有节点类型的业务逻辑
 * 
 * 架构位置：Hooks Layer（交互层）
 * 依赖：Core Layer（Stores、Utils）
 * 被依赖：UI Layer（App.tsx）
 * 
 * 包含的节点类型：
 * - IMAGE_GENERATOR：图片生成（包括分镜扩展）
 * - VIDEO_GENERATOR：视频生成
 * - AUDIO_GENERATOR：音频生成
 * - VIDEO_ANALYZER：视频分析
 * - IMAGE_EDITOR：图片编辑
 * - SCRIPT_NODE：剧本节点
 * - MULTI_ANGLE_CAMERA：3D 相机（多角度相机）
 * 
 * 重构说明：
 * - 从 App.tsx 的 handleNodeAction 函数（880-1450 行）抽离
 * - 拆分成独立的处理函数，每个节点类型一个
 * - 使用 Stores 管理状态，不直接操作 DOM
 * - 遵循单一职责原则
 */

import { useCallback, useRef } from 'react';
import { AppNode, NodeType, NodeStatus, Connection } from '../types';
import { useNodeStore } from '../core/stores/nodeStore';
import { useConnectionStore } from '../core/stores/connectionStore';
import { useGroupStore } from '../core/stores/groupStore';
import { 
    generateImageFromText, 
    generateVideo, 
    analyzeVideo, 
    editImageWithText, 
    planStoryboard, 
    generateAudio 
} from '../services/geminiService';
import { urlToBase64 } from '../services/blobStorage';
import { getGenerationStrategy } from '../services/videoStrategies';
import { findNonOverlappingPosition, Rect } from '../core/utils/geometry';

/**
 * useNodeActions Hook
 * 
 * @returns handleNodeAction - 统一的节点操作处理函数
 */
export const useNodeActions = () => {
    // 使用 ref 保存最新的 nodes，避免闭包问题
    const nodesRef = useRef<Map<string, AppNode>>(new Map());
    
    // 订阅 Store 的 nodes 变化
    const nodes = useNodeStore(state => state.nodes);
    nodesRef.current = nodes;
    
    // 🔥 全局计数器：记录已创建的九宫格节点数量
    const gridNodeCounterRef = useRef(0);
    
    /**
     * 获取所有节点的矩形（用于防遮挡检测）
     */
    const getAllNodeRects = useCallback((): Rect[] => {
        return Array.from(nodesRef.current.values()).map((node: AppNode) => ({
            x: node.x,
            y: node.y,
            width: node.width || 420,
            height: node.height || 300,
        }));
    }, []);
    
    /**
     * 更新节点数据的辅助函数
     */
    const handleNodeUpdate = useCallback((id: string, updates: Partial<AppNode['data']> & { status?: NodeStatus; error?: string }) => {
        const { status, error, ...dataUpdates } = updates;
        
        // 更新节点数据
        if (Object.keys(dataUpdates).length > 0) {
            useNodeStore.getState().updateNodeData(id, dataUpdates);
        }
        
        // 更新节点状态
        if (status !== undefined) {
            useNodeStore.getState().updateNodeStatus(id, status);
        }
        
        // 更新错误信息
        if (error !== undefined) {
            useNodeStore.getState().updateNodeData(id, { error });
        }
    }, []);
    
    /**
     * 处理图片生成节点
     */
    const handleImageGenerator = useCallback(async (
        node: AppNode, 
        inputs: AppNode[], 
        prompt: string
    ) => {
        const inputImages: string[] = [];
        inputs.forEach(n => { if (n?.data.image) inputImages.push(n.data.image); });

        const isStoryboard = /分镜|storyboard|sequence|shots|frames|json/i.test(prompt);

        if (isStoryboard) {
            try {
                const upstreamTexts = inputs.map(n => {
                    if (n?.type === NodeType.PROMPT_INPUT) return n.data.prompt;
                    if (n?.type === NodeType.VIDEO_ANALYZER) return n.data.analysis;
                    return null;
                }).filter(t => t && t.trim().length > 0) as string[];
                
                const storyboard = await planStoryboard(prompt, upstreamTexts.join('\n'));
                if (storyboard.length > 1) {
                    // 分镜扩展逻辑 - 使用防遮挡布局
                    const newNodes: AppNode[] = [];
                    const newConnections: Connection[] = [];
                    const COLUMNS = 3;
                    const gapX = 40; 
                    const gapY = 40;
                    const childWidth = node.width || 420;
                    const ratio = node.data.aspectRatio || '16:9';
                    const [rw, rh] = ratio.split(':').map(Number);
                    const childHeight = (childWidth * rh / rw); 
                    
                    // 🔥 使用防遮挡算法计算起始位置
                    const preferredStartX = node.x + (node.width || 420) + 150;
                    const preferredStartY = node.y;
                    
                    // 获取所有现有节点的矩形
                    const existingRects = getAllNodeRects();
                    
                    // 计算第一个节点的位置（防遮挡）
                    const firstNodePos = findNonOverlappingPosition(
                        { x: preferredStartX, y: preferredStartY },
                        { width: childWidth, height: childHeight },
                        existingRects,
                        { gap: 40 }
                    );
                    
                    const startX = firstNodePos.x;
                    const startY = firstNodePos.y;
                    
                    storyboard.forEach((shotPrompt, index) => {
                        const col = index % COLUMNS;
                        const row = Math.floor(index / COLUMNS);
                        const posX = startX + col * (childWidth + gapX);
                        const posY = startY + row * (childHeight + gapY);
                        const newNodeId = `n-${Date.now()}-${index}`;
                        newNodes.push({
                            id: newNodeId, 
                            type: NodeType.IMAGE_GENERATOR, 
                            x: posX, 
                            y: posY, 
                            width: childWidth, 
                            height: childHeight,
                            title: `分镜 ${index + 1}`, 
                            status: NodeStatus.WORKING,
                            data: { 
                                ...node.data, 
                                aspectRatio: ratio, 
                                prompt: shotPrompt, 
                                image: undefined, 
                                images: undefined, 
                                imageCount: 1 
                            },
                            inputs: [node.id] 
                        });
                        newConnections.push({ from: node.id, to: newNodeId });
                    });
                    
                    const totalRows = Math.ceil(storyboard.length / COLUMNS);
                    const groupPadding = 30;
                    const groupWidth = (Math.min(storyboard.length, COLUMNS) * childWidth) + ((Math.min(storyboard.length, COLUMNS) - 1) * gapX) + (groupPadding * 2);
                    const groupHeight = (totalRows * childHeight) + ((totalRows - 1) * gapY) + (groupPadding * 2);

                    // 使用 Store 创建分组
                    useGroupStore.getState().addGroup({ 
                        id: `g-${Date.now()}`, 
                        title: '分镜生成组', 
                        x: startX - groupPadding, 
                        y: startY - groupPadding, 
                        width: groupWidth, 
                        height: groupHeight 
                    });
                    
                    // 使用 Store 批量添加节点
                    useNodeStore.getState().addNodes(newNodes);
                    
                    // 使用 Store 批量添加连接
                    newConnections.forEach(conn => {
                        useConnectionStore.getState().addConnection(conn);
                    });
                    
                    handleNodeUpdate(node.id, { status: NodeStatus.SUCCESS });

                    // 异步生成每个分镜的图片
                    newNodes.forEach(async (n) => {
                        try {
                            const res = await generateImageFromText(
                                n.data.prompt!, 
                                n.data.model!, 
                                inputImages, 
                                { aspectRatio: n.data.aspectRatio, resolution: n.data.resolution, count: 1 }
                            );
                            
                            // 性能优化：将 base64 转换为 Blob URL
                            const { saveImagesToBlob, saveNodeImageBlob } = await import('../services/blobStorage');
                            const blobUrls = await saveImagesToBlob(res, n.id, 'image');
                            
                            // 🔥 数据持久化：保存到 IndexedDB（阶段1）
                            if (blobUrls[0]) {
                                await saveNodeImageBlob(n.id, blobUrls[0]);
                            }
                            
                            handleNodeUpdate(n.id, { image: blobUrls[0], images: blobUrls, status: NodeStatus.SUCCESS });
                        } catch (e: any) {
                            handleNodeUpdate(n.id, { error: e.message, status: NodeStatus.ERROR });
                        }
                    });
                    return; 
                }
            } catch (e) {
                console.warn("Storyboard planning failed", e);
            }
        }
        
        // 普通图片生成
        const res = await generateImageFromText(
            prompt, 
            node.data.model, 
            inputImages, 
            { 
                aspectRatio: node.data.aspectRatio || '16:9', 
                resolution: node.data.resolution, 
                count: node.data.imageCount 
            }
        );
        
        // 性能优化：将 base64 转换为 Blob URL（内存减少 99%）
        const { saveImagesToBlob, saveNodeImageBlob, saveNodeImagesBlob } = await import('../services/blobStorage');
        const blobUrls = await saveImagesToBlob(res, node.id, 'image');
        
        // 🔥 数据持久化：保存到 IndexedDB（阶段1）
        if (blobUrls[0]) {
            await saveNodeImageBlob(node.id, blobUrls[0]);
        }
        if (blobUrls.length > 0) {
            await saveNodeImagesBlob(node.id, blobUrls);
        }
        
        handleNodeUpdate(node.id, { image: blobUrls[0], images: blobUrls });
    }, [handleNodeUpdate]);
    
    /**
     * 处理视频生成节点
     */
    const handleVideoGenerator = useCallback(async (
        node: AppNode, 
        inputs: AppNode[], 
        prompt: string
    ) => {
        const strategy = await getGenerationStrategy(node, inputs, prompt);
        
        const res = await generateVideo(
            strategy.finalPrompt,
            node.data.model, 
            { 
                aspectRatio: node.data.aspectRatio || '16:9', 
                count: node.data.videoCount || 1, 
                generationMode: strategy.generationMode,
                resolution: node.data.resolution 
            }, 
            strategy.inputImageForGeneration, 
            strategy.videoInput, 
            strategy.referenceImages
        );
        
        if (res.isFallbackImage) {
            handleNodeUpdate(node.id, { 
                image: res.uri, 
                videoUri: undefined, 
                videoMetadata: undefined,
                error: "Region restricted: Generated preview image instead.", 
                status: NodeStatus.SUCCESS 
            });
        } else {
            handleNodeUpdate(node.id, { 
                videoUri: res.uri, 
                videoMetadata: res.videoMetadata, 
                videoUris: res.uris 
            });
        }
    }, [handleNodeUpdate]);
    
    /**
     * 处理音频生成节点
     */
    const handleAudioGenerator = useCallback(async (
        node: AppNode, 
        inputs: AppNode[], 
        prompt: string
    ) => {
        const audioUri = await generateAudio(prompt);
        handleNodeUpdate(node.id, { audioUri: audioUri });
    }, [handleNodeUpdate]);
    
    /**
     * 处理视频分析节点
     */
    const handleVideoAnalyzer = useCallback(async (
        node: AppNode, 
        inputs: AppNode[], 
        prompt: string
    ) => {
        const vid = node.data.videoUri || inputs.find(n => n?.data.videoUri)?.data.videoUri;
        if (!vid) throw new Error("未找到视频输入");
        
        let vidData = vid;
        if (vid.startsWith('http')) {
            vidData = await urlToBase64(vid);
        }
        
        const txt = await analyzeVideo(vidData, prompt, node.data.model);
        handleNodeUpdate(node.id, { analysis: txt });
    }, [handleNodeUpdate]);
    
    /**
     * 处理图片编辑节点
     */
    const handleImageEditor = useCallback(async (
        node: AppNode, 
        inputs: AppNode[], 
        prompt: string
    ) => {
        const inputImages: string[] = [];
        inputs.forEach(n => { if (n?.data.image) inputImages.push(n.data.image); });
        const img = node.data.image || inputImages[0];
        
        const res = await editImageWithText(img, prompt, node.data.model);
        
        // 性能优化：将 base64 转换为 Blob URL
        const { saveImageToBlob, saveNodeImageBlob } = await import('../services/blobStorage');
        const blobUrl = await saveImageToBlob(res, node.id, 'edited');
        
        // 🔥 数据持久化：保存到 IndexedDB（阶段1）
        if (blobUrl) {
            await saveNodeImageBlob(node.id, blobUrl);
        }
        
        handleNodeUpdate(node.id, { image: blobUrl });
    }, [handleNodeUpdate]);
    
    /**
     * 处理剧本节点
     */
    const handleScriptNode = useCallback(async (
        node: AppNode, 
        inputs: AppNode[], 
        prompt: string,
        promptOverride?: string
    ) => {
        // 剧本节点：使用 Coze AI 生成剧本
        const userIdea = promptOverride || prompt;
        if (!userIdea || userIdea.trim().length === 0) {
            throw new Error('请输入您的创意');
        }
        
        // 调用 Coze AI 生成剧本
        const { generateScript } = await import('../services/cozeService');
        const scriptData = await generateScript(userIdea, node.data.targetDuration || 60);
        
        // 更新节点数据
        handleNodeUpdate(node.id, { scriptData });
    }, [handleNodeUpdate]);

    /**
     * 处理多角度相机节点（3D 相机）
     */
    const handleMultiAngleCameraGenerate = useCallback(async (
        node: AppNode, 
        inputs: AppNode[], 
        prompt: string
    ) => {
        // 🔥 在生成开始时清空旧图，为新生成做准备
        handleNodeUpdate(node.id, { 
            gridImages: undefined,
            image: undefined
        });
        
        // 多角度相机：使用 Gemini API 生成图片
        const inputImages: string[] = [];
        inputs.forEach(n => { if (n?.data.image) inputImages.push(n.data.image); });
        const inputImage = inputImages[0];
        
        if (!inputImage) throw new Error("请先连接一张图片作为输入");
        
        // 获取相机参数
        const hAngle = node.data.horizontalAngle || 0;
        const vAngle = node.data.verticalAngle || 0;
        const zoom = node.data.cameraZoom || 5;
        const userPrompt = node.data.userPrompt || '';
        
        // 根据角度生成方位描述（中文）
        const getAzimuthDescCN = (angle: number): string => {
            const normalized = ((angle % 360) + 360) % 360;
            if (normalized < 22.5 || normalized >= 337.5) return '正面';
            if (normalized < 67.5) return '右前方45度';
            if (normalized < 112.5) return '右侧面';
            if (normalized < 157.5) return '右后方';
            if (normalized < 202.5) return '背面';
            if (normalized < 247.5) return '左后方';
            if (normalized < 292.5) return '左侧面';
            return '左前方45度';
        };
        
        // 🔥 强化版：根据角度难度和是否为中心面板，使用不同强度的描述
        const getAzimuthDescEN = (angle: number, isCenter: boolean): string => {
            const normalized = ((angle % 360) + 360) % 360;
            
            // 🎯 中心面板（用户选择的精确角度）：使用最强描述
            if (isCenter) {
                if (normalized < 22.5 || normalized >= 337.5) {
                    return 'direct front view, facing camera, looking straight ahead';
                }
                if (normalized >= 67.5 && normalized < 112.5) {
                    return 'strictly side profile view, 90-degree side angle, from the side, no front or back visible, pure lateral view';
                }
                if (normalized >= 157.5 && normalized < 202.5) {
                    return 'direct back view, from behind, rear view, back of head visible, no face visible, dorsal view';
                }
                if (normalized >= 247.5 && normalized < 292.5) {
                    return 'strictly side profile view, 90-degree side angle, from the side, no front or back visible, pure lateral view';
                }
                // 3/4视图
                if (normalized >= 22.5 && normalized < 67.5) {
                    return 'front three-quarter view, 45-degree angle, slightly turned to the right';
                }
                if (normalized >= 112.5 && normalized < 157.5) {
                    return 'rear three-quarter view, 135-degree angle, mostly back with some side visible';
                }
                if (normalized >= 202.5 && normalized < 247.5) {
                    return 'rear three-quarter view, 225-degree angle, mostly back with some side visible';
                }
                if (normalized >= 292.5 && normalized < 337.5) {
                    return 'front three-quarter view, 315-degree angle, slightly turned to the left';
                }
            }
            
            // 🎯 周围面板：使用标准描述
            if (normalized < 22.5 || normalized >= 337.5) return 'front view';
            if (normalized < 67.5) return 'front three-quarter view';
            if (normalized < 112.5) return 'side profile view';
            if (normalized < 157.5) return 'rear three-quarter view';
            if (normalized < 202.5) return 'back view';
            if (normalized < 247.5) return 'rear three-quarter view';
            if (normalized < 292.5) return 'side profile view';
            return 'front three-quarter view';
        };
        
        // 根据仰角生成描述
        const getElevationDescCN = (angle: number): string => {
            if (angle <= -20) return '仰拍';
            if (angle <= 10) return '平视';
            if (angle <= 40) return '俯拍';
            return '高角度俯拍';
        };
        
        // 🔥 强化版：仰角描述更精确
        const getElevationDescEN = (angle: number, isCenter: boolean): string => {
            if (isCenter) {
                // 中心面板：使用最精确的描述
                if (angle >= 80) return 'directly overhead top-down view, bird\'s eye perspective';
                if (angle >= 40) return 'high-angle view, elevated camera position, looking down';
                if (angle >= 10) return 'slightly elevated angle, subtle downward tilt';
                if (angle >= -10) return 'eye-level view, straight-on perspective, horizontal camera';
                if (angle >= -30) return 'slightly low angle, subtle upward tilt';
                if (angle >= -60) return 'low-angle view, camera positioned below, looking up';
                return 'directly underneath looking straight up, worm\'s eye perspective';
            }
            
            // 周围面板：使用简化描述
            if (angle >= 80) return 'top-down view';
            if (angle >= 40) return 'high-angle view';
            if (angle >= 10) return 'slightly elevated';
            if (angle >= -10) return 'eye-level';
            if (angle >= -30) return 'slightly low angle';
            if (angle >= -60) return 'low-angle view';
            return 'looking straight up';
        };
        
        // 根据距离生成描述
        const getDistanceDescCN = (z: number): string => {
            if (z <= 0.5) return '极近特写';
            if (z <= 1.5) return '特写';
            if (z <= 3) return '近景';
            if (z <= 4.5) return '半身';
            if (z <= 6) return '中景';
            if (z <= 7.5) return '全身';
            if (z <= 9) return '远景';
            return '全景';
        };
        
        // 🔥 强化版：距离描述更精确
        const getDistanceDescEN = (z: number, isCenter: boolean): string => {
            if (isCenter) {
                // 中心面板：使用最精确的描述
                if (z <= 0.5) return 'extreme close-up shot, face only, very tight framing, macro detail';
                if (z <= 1.5) return 'close-up shot, head and shoulders, portrait framing';
                if (z <= 3) return 'medium close-up shot, chest up, upper body visible';
                if (z <= 4.5) return 'medium shot, waist up, half-body framing';
                if (z <= 6) return 'medium full shot, knees up, three-quarter body';
                if (z <= 7.5) return 'full shot, entire body visible, head to toe';
                if (z <= 9) return 'wide shot, full body with environment context';
                return 'extreme wide shot, small figure in large environment, establishing shot';
            }
            
            // 周围面板：使用简化描述
            if (z <= 0.5) return 'extreme close-up';
            if (z <= 1.5) return 'close-up';
            if (z <= 3) return 'medium close-up';
            if (z <= 4.5) return 'medium shot';
            if (z <= 6) return 'medium full shot';
            if (z <= 7.5) return 'full shot';
            if (z <= 9) return 'wide shot';
            return 'extreme wide shot';
        };
        
        const azimuthDesc = getAzimuthDescCN(hAngle);
        const elevationDesc = getElevationDescCN(vAngle);
        const distanceDesc = getDistanceDescCN(zoom);
        
        // 英文参数化描述（给 AI 用）- 中心面板使用强化描述
        const baseDistanceEN = getDistanceDescEN(zoom, true);
        const baseElevationEN = getElevationDescEN(vAngle, true);
        const baseAzimuthEN = getAzimuthDescEN(hAngle, true);
        
        // 🎯 智能发散策略：根据用户选择的参数，决定九宫格的变化方式
        const generateCameraGrid = (centerH: number, centerV: number, centerZ: number) => {
            const positions = [];
            
            // 🎯 策略判断：是否为特殊角度（背面、侧面）
            const isSpecialAngle = (
                (centerH >= 67.5 && centerH < 112.5) ||   // 右侧面
                (centerH >= 157.5 && centerH < 202.5) ||  // 背面
                (centerH >= 247.5 && centerH < 292.5)     // 左侧面
            );
            
            // 🎯 策略判断：是否为极端距离（特写/全景）
            const isExtremeDistance = centerZ < 2 || centerZ > 8;
            
            if (isSpecialAngle) {
                // 特殊角度：固定距离，变化角度（±15°）和高度
                // 目的：提高角度精确度，让用户看到精确的侧面/背面
                const hOffsets = [-15, 0, 15];
                const vOffsets = [10, 0, -10];
                
                for (let row = 0; row < 3; row++) {
                    for (let col = 0; col < 3; col++) {
                        const h = ((centerH + hOffsets[col]) % 360 + 360) % 360;
                        const v = Math.max(-90, Math.min(90, centerV + vOffsets[row]));
                        const z = centerZ;  // ✅ 距离固定
                        
                        const isCenter = (row === 1 && col === 1);
                        const hDescEN = getAzimuthDescEN(h, isCenter);
                        const vDescEN = getElevationDescEN(v, isCenter);
                        const zDescEN = getDistanceDescEN(z, isCenter);
                        
                        positions.push(`Panel ${row * 3 + col + 1}: ${zDescEN}, ${hDescEN}, ${vDescEN}${isCenter ? ' ← USER SELECTED (MOST IMPORTANT)' : ''}`);
                    }
                }
            } else if (isExtremeDistance) {
                // 极端距离：固定角度，变化距离（±0.5）和高度
                // 目的：提高距离精确度，让用户看到精确的特写/全景
                const zOffsets = [-0.5, 0, 0.5];
                const vOffsets = [10, 0, -10];
                
                for (let row = 0; row < 3; row++) {
                    for (let col = 0; col < 3; col++) {
                        const h = centerH;  // ✅ 角度固定
                        const v = Math.max(-90, Math.min(90, centerV + vOffsets[row]));
                        const z = Math.max(0, Math.min(10, centerZ + zOffsets[col]));
                        
                        const isCenter = (row === 1 && col === 1);
                        const hDescEN = getAzimuthDescEN(h, isCenter);
                        const vDescEN = getElevationDescEN(v, isCenter);
                        const zDescEN = getDistanceDescEN(z, isCenter);
                        
                        positions.push(`Panel ${row * 3 + col + 1}: ${zDescEN}, ${hDescEN}, ${vDescEN}${isCenter ? ' ← USER SELECTED (MOST IMPORTANT)' : ''}`);
                    }
                }
            } else {
                // 常规情况：固定距离，变化角度（±20°）和高度
                // 目的：让用户看到角色在不同角度下的样子（推荐方案）
                const hOffsets = [-20, 0, 20];
                const vOffsets = [15, 0, -15];
                
                for (let row = 0; row < 3; row++) {
                    for (let col = 0; col < 3; col++) {
                        const h = ((centerH + hOffsets[col]) % 360 + 360) % 360;
                        const v = Math.max(-90, Math.min(90, centerV + vOffsets[row]));
                        const z = centerZ;  // ✅ 距离固定
                        
                        const isCenter = (row === 1 && col === 1);
                        const hDescEN = getAzimuthDescEN(h, isCenter);
                        const vDescEN = getElevationDescEN(v, isCenter);
                        const zDescEN = getDistanceDescEN(z, isCenter);
                        
                        positions.push(`Panel ${row * 3 + col + 1}: ${zDescEN}, ${hDescEN}, ${vDescEN}${isCenter ? ' ← USER SELECTED (MOST IMPORTANT)' : ''}`);
                    }
                }
            }
            
            return positions;
        };
        
        const cameraPositions = generateCameraGrid(hAngle, vAngle, zoom);
        
        // Gemini 提示词 - 强调单张九宫格图片 + 明确主视角 + 强化中心面板
        let geminiPrompt = `Create ONE SINGLE IMAGE in 21:9 aspect ratio containing a 3×3 grid layout (9 panels arranged in 3 rows and 3 columns).

**CRITICAL - OUTPUT FORMAT:**
Generate ONE image that looks like this:
┌─────┬─────┬─────┐
│  1  │  2  │  3  │  (top row)
├─────┼─────┼─────┤
│  4  │  5  │  6  │  (middle row)
├─────┼─────┼─────┤
│  7  │  8  │  9  │  (bottom row)
└─────┴─────┴─────┘

NOT 9 separate images. ONE image with 9 panels inside.

**REFERENCE IMAGE USAGE:**
The reference image shows a character. Extract and preserve:
- Character appearance: face, hair, clothing, body type
- Art style: illustration style, rendering technique, line work, shading
- Color palette: exact colors, saturation, tone
- Lighting style: light direction, contrast, mood
- Background style: environment design, detail level
- Overall aesthetic: DO NOT change the visual style

DO NOT copy the viewing angle from the reference image.

**CRITICAL - STYLE CONSISTENCY:**
All 9 panels MUST match the reference image's visual style EXACTLY:
✅ Same art style (realistic/anime/cartoon/painting etc.)
✅ Same rendering technique (cel-shaded/painterly/photorealistic etc.)
✅ Same color grading and palette
✅ Same lighting mood and atmosphere
✅ Same level of detail and texture quality
✅ Same background aesthetic

❌ Do NOT change art style between panels
❌ Do NOT add different filters or effects
❌ Do NOT alter color grading or saturation
❌ Do NOT change rendering quality or technique

**PRIMARY TARGET (Panel 5 - Center) - HIGHEST PRIORITY:**
This is the EXACT angle the user requested. Pay maximum attention to this panel:
- Horizontal angle: **${baseAzimuthEN}**
- Vertical angle: **${baseElevationEN}**
- Distance/Framing: **${baseDistanceEN}**

Panel 5 MUST be rendered with MAXIMUM ACCURACY to these specifications.

**SPECIFIC INSTRUCTION FOR "${baseAzimuthEN}":**
${baseAzimuthEN.includes('side profile') ? `
- Show the character from the SIDE (90° from front)
- You should see the character's profile (side of face)
- NOT from the front, NOT from three-quarter view
- Pure side view as the base angle
- Only ONE eye should be visible
` : baseAzimuthEN.includes('back view') ? `
- Show the character from BEHIND (180° from front)
- You should see the back of the head and back of body
- NOT from the front, NOT from three-quarter view
- NO FACE should be visible
- This is a rear view, dorsal perspective
` : baseAzimuthEN.includes('three-quarter') ? `
- Show the character from 45° or 135° angle (between front/side or side/back)
- You should see most of one side but also some of the other
- This is NOT a pure front or pure side view
` : `
- Show the character from: ${baseAzimuthEN}
- Follow the angle description precisely
`}

**9 PANEL CONFIGURATIONS:**
${cameraPositions.join('\n')}

**RENDERING RULES:**
✅ Use orthographic camera projection (no perspective distortion)
✅ Panel 5 (center) = EXACT user request, HIGHEST PRIORITY
✅ All panels show variations around the user's selected angle
✅ Character appearance identical in all panels
✅ Art style and visual aesthetic IDENTICAL in all panels (same as reference)
✅ Color palette and grading IDENTICAL in all panels
✅ Rendering technique IDENTICAL in all panels
✅ Thin dividing lines between panels
✅ Consistent lighting across all panels

❌ Do NOT generate 9 separate images
❌ Do NOT use the reference image's viewing angle
❌ Do NOT change art style, colors, or rendering between panels
❌ Do NOT apply different filters or effects to different panels
❌ Do NOT ignore Panel 5's specifications - it is the most important`;
        
        if (userPrompt) {
            geminiPrompt += `\n\n**【额外风格要求】：**\n${userPrompt}`;
        }
        
        // 保存生成的提示词
        handleNodeUpdate(node.id, { cameraPrompt: geminiPrompt });
        
        try {
            // 使用 Gemini 生成九宫格图片
            // 尝试使用 Imagen 3，如果失败则使用 Gemini Flash Image
            let res: string[];
            try {
                res = await generateImageFromText(
                    geminiPrompt,
                    'imagen-3.0-generate-002',  // 先尝试 Imagen 3
                    [inputImage],
                    { aspectRatio: '21:9', count: 1 }
                );
            } catch (imagenError) {
                console.warn('[MultiAngleCamera] Imagen 3 失败，尝试 Gemini Flash Image:', imagenError);
                res = await generateImageFromText(
                    geminiPrompt,
                    'gemini-2.5-flash-image',
                    [inputImage],
                    { aspectRatio: '21:9', count: 1 }
                );
            }
            
            // 性能优化：将 base64 转换为 Blob URL（内存减少 99%）
            const { saveImagesToBlob } = await import('../services/blobStorage');
            const blobUrls = await saveImagesToBlob(res, node.id, 'grid');
            
            // 更新节点数据 - 只存储 Blob URL（每个只有几十字节）
            handleNodeUpdate(node.id, { 
                gridImages: blobUrls,  // Blob URL 数组（内存占用减少 99%）
                image: blobUrls[0]  // 输出九宫格图片给下游节点
            });
            
            console.log('[MultiAngleCamera] 生成完成，输出数据:', {
                nodeId: node.id,
                blobUrlsCount: blobUrls.length,
                firstBlobUrl: blobUrls[0]?.substring(0, 50),
                imageOutput: blobUrls[0]?.substring(0, 50),
            });
            
            // 🔥 自动创建九宫格节点（新功能 - 2026-01-30）
            // 1. 增加计数器
            gridNodeCounterRef.current++;
            const gridNodeIndex = gridNodeCounterRef.current;
            
            // 2. 生成智能命名（基于角度、高度、景别）
            const getAzimuthName = (angle: number): string => {
                const normalized = ((angle % 360) + 360) % 360;
                if (normalized < 22.5 || normalized >= 337.5) return '正面';
                if (normalized < 67.5) return '右前';
                if (normalized < 112.5) return '右侧';
                if (normalized < 157.5) return '右后';
                if (normalized < 202.5) return '背面';
                if (normalized < 247.5) return '左后';
                if (normalized < 292.5) return '左侧';
                return '左前';
            };
            
            const getElevationName = (angle: number): string => {
                if (angle >= 40) return '俯拍';
                if (angle >= 10) return '高角度';
                if (angle >= -10) return '平视';
                if (angle >= -30) return '低角度';
                return '仰拍';
            };
            
            const getDistanceName = (z: number): string => {
                if (z <= 1.5) return '特写';
                if (z <= 3) return '近景';
                if (z <= 4.5) return '半身';
                if (z <= 6) return '中景';
                if (z <= 7.5) return '全身';
                if (z <= 9) return '远景';
                return '全景';
            };
            
            const azimuthName = getAzimuthName(hAngle);
            const elevationName = getElevationName(vAngle);
            const distanceName = getDistanceName(zoom);
            const gridNodeTitle = `${azimuthName}-${elevationName}-${distanceName}`;
            
            // 3. 🔥 固定 21:9 比例（不依赖图片加载）
            const nodeSize = {
                width: 630,
                height: 270
            };
            
            console.log(`[MultiAngleCamera] 创建九宫格节点，尺寸: ${nodeSize.width}×${nodeSize.height}`);
            
            // 4. 计算九宫格节点的位置（防遮挡）
            const preferredX = node.x + (node.width || 420) + 300;
            const preferredY = node.y + ((gridNodeIndex - 1) * 150);  // 每次向下偏移 150px
            
            const existingRects = getAllNodeRects();
            const gridNodePos = findNonOverlappingPosition(
                { x: preferredX, y: preferredY },
                { width: nodeSize.width, height: nodeSize.height },
                existingRects,
                { gap: 40 }
            );
            
            // 5. 创建九宫格节点
            const gridNodeId = `grid-${Date.now()}-${gridNodeIndex}`;
            const newGridNode: AppNode = {
                id: gridNodeId,
                type: NodeType.GRID_SPLITTER,
                x: gridNodePos.x,
                y: gridNodePos.y,
                width: nodeSize.width,   // 🔥 自动适应图片尺寸
                height: nodeSize.height, // 🔥 自动适应图片尺寸
                title: gridNodeTitle,  // 🔥 使用智能命名
                status: NodeStatus.SUCCESS,
                data: {
                    inputImage: blobUrls[0],  // 21:9 九宫格图片
                    croppedImages: [],
                    selectedIndex: -1,
                },
                inputs: [node.id],
            };
            
            console.log('[MultiAngleCamera] 创建九宫格节点数据:', {
                gridNodeId,
                inputImage: blobUrls[0]?.substring(0, 50),
                inputImageType: typeof blobUrls[0],
                hasCroppedImages: false,
                selectedIndex: -1,
            });
            
            // 5. 添加节点到 Store
            useNodeStore.getState().addNode(newGridNode);
            
            // 6. 自动连接
            useConnectionStore.getState().addConnection({
                from: node.id,
                to: gridNodeId,
            });
            
            console.log(`[MultiAngleCamera] 自动创建九宫格节点 "${gridNodeTitle}"，位置: (${gridNodePos.x}, ${gridNodePos.y})，尺寸: ${nodeSize.width}×${nodeSize.height}`);
            
            
        } catch (geminiError: any) {
            console.error('[MultiAngleCamera] Gemini API 失败:', geminiError);
            
            // 提供更友好的错误信息
            let errorMessage = geminiError.message || '图片生成失败';
            if (errorMessage.includes('quota') || errorMessage.includes('429')) {
                errorMessage = 'API 配额已用完，请稍后再试或升级到付费计划';
            }
            
            throw new Error(errorMessage);
        }
    }, [handleNodeUpdate, getAllNodeRects]);
    
    /**
     * 统一的节点操作处理函数（路由函数）
     * 
     * @param id - 节点 ID
     * @param promptOverride - 可选的提示词覆盖
     */
    const handleNodeAction = useCallback(async (id: string, promptOverride?: string) => {
        const node = nodesRef.current.get(id) as AppNode | undefined; 
        if (!node) return;
        
        // 清除错误信息
        handleNodeUpdate(id, { error: undefined });
        
        // 更新节点状态为工作中
        useNodeStore.getState().updateNodeStatus(id, NodeStatus.WORKING);

        try {
            // 获取输入节点
            const inputs = node.inputs
                .map(i => nodesRef.current.get(i) as AppNode | undefined)
                .filter(Boolean) as AppNode[];
            
            // 合并上游文本
            const upstreamTexts = inputs.map(n => {
                if (n?.type === NodeType.PROMPT_INPUT) return n.data.prompt;
                if (n?.type === NodeType.VIDEO_ANALYZER) return n.data.analysis;
                return null;
            }).filter(t => t && t.trim().length > 0) as string[];

            let prompt = promptOverride || node.data.prompt || '';
            if (upstreamTexts.length > 0) {
                const combinedUpstream = upstreamTexts.join('\n');
                prompt = prompt ? `${combinedUpstream}\n${prompt}` : combinedUpstream;
            }

            // 根据节点类型路由到对应的处理函数
            switch (node.type) {
                case NodeType.IMAGE_GENERATOR:
                    await handleImageGenerator(node, inputs, prompt);
                    break;
                    
                case NodeType.VIDEO_GENERATOR:
                    await handleVideoGenerator(node, inputs, prompt);
                    break;
                    
                case NodeType.AUDIO_GENERATOR:
                    await handleAudioGenerator(node, inputs, prompt);
                    break;
                    
                case NodeType.VIDEO_ANALYZER:
                    await handleVideoAnalyzer(node, inputs, prompt);
                    break;
                    
                case NodeType.IMAGE_EDITOR:
                    await handleImageEditor(node, inputs, prompt);
                    break;
                    
                case NodeType.SCRIPT_NODE:
                    await handleScriptNode(node, inputs, prompt, promptOverride);
                    break;
                    
                case NodeType.MULTI_ANGLE_CAMERA:
                    await handleMultiAngleCameraGenerate(node, inputs, prompt);
                    break;
                    
                default:
                    throw new Error(`未知的节点类型: ${node.type}`);
            }
            
            // 更新节点状态为成功
            useNodeStore.getState().updateNodeStatus(id, NodeStatus.SUCCESS);
            
        } catch (e: any) {
            handleNodeUpdate(id, { error: e.message });
            // 更新节点状态为错误
            useNodeStore.getState().updateNodeStatus(id, NodeStatus.ERROR);
        }
    }, [
        handleNodeUpdate,
        handleImageGenerator,
        handleVideoGenerator,
        handleAudioGenerator,
        handleVideoAnalyzer,
        handleImageEditor,
        handleScriptNode,
        handleMultiAngleCameraGenerate
    ]);
    
    /**
     * 处理图片文件（零拷贝 + 异步保存）
     * @param file - File 对象
     * @param position - 节点位置 { x, y }
     */
    const handleImageFile = useCallback(async (file: File, position: { x: number, y: number }) => {
        try {
            // 1. 零拷贝：直接创建 Blob URL（不读取文件内容）
            const blobUrl = URL.createObjectURL(file);
            console.log(`[ImageFile] 创建 Blob URL: ${blobUrl.substring(0, 50)}, 大小: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
            
            // 2. 立即创建节点（不等待保存）
            const nodeId = `n-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const newNode: AppNode = {
                id: nodeId,
                type: NodeType.IMAGE_GENERATOR,
                x: position.x,
                y: position.y,
                width: 420,
                height: 360,
                title: file.name || '图片',
                status: NodeStatus.SUCCESS,
                data: {
                    image: blobUrl,  // 使用 Blob URL（只有几十字节）
                    prompt: file.name || '上传的图片',
                },
                inputs: [],
            };
            
            // 3. 添加节点到 Store
            useNodeStore.getState().addNode(newNode);
            
            // 4. 🔥 修复：直接保存 File 对象（零拷贝，键名匹配）
            (async () => {
                try {
                    const storageKey = `blob-node-${nodeId}-image`;
                    const { saveToStorage } = await import('../services/storage');
                    await saveToStorage(storageKey, file); // 直接保存 File，不读取内容
                    console.log(`[ImageFile] 图片已保存到 IndexedDB: ${storageKey}, 大小: ${(file.size / 1024).toFixed(2)}KB`);
                } catch (error) {
                    console.error('[ImageFile] 保存到 IndexedDB 失败:', error);
                }
            })();
            
            console.log(`[ImageFile] 节点创建完成: ${nodeId}`);
        } catch (error) {
            console.error('[ImageFile] 处理失败:', error);
            throw error;
        }
    }, []);
    
    /**
     * 处理视频文件（零拷贝 + 异步保存）
     * @param file - File 对象
     * @param position - 节点位置 { x, y }
     */
    const handleVideoFile = useCallback(async (file: File, position: { x: number, y: number }) => {
        try {
            // 1. 零拷贝：直接创建 Blob URL（不读取文件内容）
            const blobUrl = URL.createObjectURL(file);
            console.log(`[VideoFile] 创建 Blob URL: ${blobUrl.substring(0, 50)}, 大小: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
            
            // 2. 立即创建节点（不等待保存）
            const nodeId = `n-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const newNode: AppNode = {
                id: nodeId,
                type: NodeType.VIDEO_GENERATOR,
                x: position.x,
                y: position.y,
                width: 420,
                height: 360,
                title: file.name || '视频',
                status: NodeStatus.SUCCESS,
                data: {
                    videoUri: blobUrl,  // 使用 Blob URL（只有几十字节）
                    prompt: file.name || '上传的视频',
                },
                inputs: [],
            };
            
            // 3. 添加节点到 Store
            useNodeStore.getState().addNode(newNode);
            
            // 4. 异步保存到 IndexedDB（不阻塞 UI）
            const { saveFileToIndexedDBAsync } = await import('../services/blobStorage');
            saveFileToIndexedDBAsync(nodeId, file).catch(error => {
                console.error('[VideoFile] 异步保存失败:', error);
            });
            
            console.log(`[VideoFile] 节点创建完成: ${nodeId}`);
        } catch (error) {
            console.error('[VideoFile] 处理失败:', error);
            throw error;
        }
    }, []);
    
    return {
        handleNodeAction,
        handleImageFile,
        handleVideoFile,
    };
};
