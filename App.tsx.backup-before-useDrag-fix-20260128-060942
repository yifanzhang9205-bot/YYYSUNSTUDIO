

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Node } from './components/Node';
import { SidebarDock } from './components/SidebarDock';
import { AssistantPanel } from './components/AssistantPanel';
import { ImageCropper } from './components/ImageCropper';
import { SketchEditor } from './components/SketchEditor'; 
import { SmartSequenceDock } from './components/SmartSequenceDock';
import { SonicStudio } from './components/SonicStudio'; 
import { SettingsModal } from './components/SettingsModal';
import { AppNode, NodeType, NodeStatus, Connection, ContextMenuState, Group, Workflow, SmartSequenceItem } from './types';
import { generateImageFromText, generateVideo, analyzeVideo, editImageWithText, planStoryboard, orchestrateVideoPrompt, compileMultiFramePrompt, urlToBase64, extractLastFrame, generateAudio } from './services/geminiService';
import { generateImage as generateNanoBananaImage } from './services/nanoBananaService';
import { getGenerationStrategy } from './services/videoStrategies';
import { saveToStorage, loadFromStorage } from './services/storage';
import { 
    Plus, Copy, Trash2, Type, Image as ImageIcon, Video as VideoIcon, 
    ScanFace, Brush, MousePointerClick, LayoutTemplate, X, Film, Link, RefreshCw, Upload,
    Minus, FolderHeart, Unplug, Sparkles, ChevronLeft, ChevronRight, Scan, Music, Mic2, Grid3X3
} from 'lucide-react';

// 引入 Hooks（架构重构 - 阶段 A - 第 3 步）
import { useDrag } from './hooks/useDrag';
import { useSelection } from './hooks/useSelection';
import { useViewport } from './hooks/useViewport';
import { useConnection } from './hooks/useConnection';
import { useGroup } from './hooks/useGroup';
import { useHistory } from './hooks/useHistory';

// 引入 Stores（架构重构 - 阶段 A - 第 2 步）
import { useNodeStore } from './core/stores/nodeStore';
import { useConnectionStore } from './core/stores/connectionStore';
import { useGroupStore } from './core/stores/groupStore';

// 引入 Stores（架构重构 - 阶段 B - Store 迁移）
import { useSelectionStore } from './core/stores/selectionStore';
import { useUIStore } from './core/stores/uiStore';
import { useWorkflowStore } from './core/stores/workflowStore';
import { useAssetHistoryStore } from './core/stores/assetHistoryStore';

// 引入 NodeRegistry（架构重构 - 阶段 A - 第 2 步）
import { nodeRegistry, initializeNodeRegistry, getNodeName, getNodeIconName } from './core/registry/NodeRegistry';

// Apple Physics Curve
const SPRING = "cubic-bezier(0.32, 0.72, 0, 1)";
const SNAP_THRESHOLD = 8; // Pixels for magnetic snap
const COLLISION_PADDING = 24; // Spacing when nodes bounce off each other

// Helper to get image dimensions
const getImageDimensions = (src: string): Promise<{width: number, height: number}> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve({width: img.width, height: img.height});
        img.onerror = reject;
        img.src = src;
    });
};

// Expanded View Component (Modal)
const ExpandedView = ({ media, onClose }: { media: any, onClose: () => void }) => {
    const [visible, setVisible] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    
    useEffect(() => {
        if (media) {
            requestAnimationFrame(() => setVisible(true));
            setCurrentIndex(media.initialIndex || 0);
        } else {
            setVisible(false);
        }
    }, [media]);

    const handleClose = useCallback(() => {
        setVisible(false);
        setTimeout(onClose, 400);
    }, [onClose]);

    const hasMultiple = media?.images && media.images.length > 1;

    const handleNext = useCallback((e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (hasMultiple) {
            setCurrentIndex((prev) => (prev + 1) % media.images.length);
        }
    }, [hasMultiple, media]);

    const handlePrev = useCallback((e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (hasMultiple) {
            setCurrentIndex((prev) => (prev - 1 + media.images.length) % media.images.length);
        }
    }, [hasMultiple, media]);

    useEffect(() => {
        if (!visible) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') handleClose();
            if (e.key === 'ArrowRight') handleNext();
            if (e.key === 'ArrowLeft') handlePrev();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [visible, handleClose, handleNext, handlePrev]);

    if (!media) return null;
    
    // Determine current source and type
    const currentSrc = hasMultiple ? media.images[currentIndex] : media.src;
    const isVideo = (media.type === 'video') && !(currentSrc && currentSrc.startsWith('data:image'));

    return (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center transition-all duration-500 ease-[${SPRING}] ${visible ? 'bg-black/90 backdrop-blur-xl' : 'bg-transparent pointer-events-none opacity-0'}`} onClick={handleClose}>
             <div className={`relative w-full h-full flex items-center justify-center p-8 transition-all duration-500 ease-[${SPRING}] ${visible ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`} onClick={e => e.stopPropagation()}>
                
                {hasMultiple && (
                    <button 
                        onClick={handlePrev}
                        className="absolute left-4 md:left-8 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-all hover:scale-110 z-[110]"
                    >
                        <ChevronLeft size={32} />
                    </button>
                )}

                <div className="relative max-w-full max-h-full flex flex-col items-center">
                    {!isVideo ? (
                        <img 
                            key={currentSrc} 
                            src={currentSrc} 
                            className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl animate-in fade-in duration-300 bg-[#0a0a0c]" 
                            draggable={false} 
                        />
                    ) : (
                        <video 
                            key={currentSrc} 
                            src={currentSrc} 
                            className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl animate-in fade-in duration-300 bg-[#0a0a0c]" 
                            controls 
                            autoPlay 
                            muted
                            loop
                            playsInline
                            preload="auto"
                        />
                    )}
                    
                    {hasMultiple && (
                        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex gap-2">
                            {media.images.map((_:any, i:number) => (
                                <div 
                                    key={i} 
                                    onClick={(e) => { e.stopPropagation(); setCurrentIndex(i); }} 
                                    className={`w-2.5 h-2.5 rounded-full cursor-pointer transition-all ${i === currentIndex ? 'bg-cyan-500 scale-125' : 'bg-white/30 hover:bg-white/50'}`} 
                                />
                            ))}
                        </div>
                    )}
                </div>

                {hasMultiple && (
                    <button 
                        onClick={handleNext}
                        className="absolute right-4 md:right-8 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-all hover:scale-110 z-[110]"
                    >
                        <ChevronRight size={32} />
                    </button>
                )}

             </div>
             <button onClick={handleClose} className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-colors z-[110]"><X size={24} /></button>
        </div>
    );
};

export const App = () => {
  // === 初始化 NodeRegistry（架构重构 - 阶段 A - 第 2 步）===
  useEffect(() => {
    initializeNodeRegistry();
  }, []);
  
  // === 架构重构 - 阶段 B：使用 Store 管理所有状态 ===
  
  // --- UI 面板状态（从 uiStore 获取）---
  const isChatOpen = useUIStore(state => state.isChatOpen);
  const isSketchEditorOpen = useUIStore(state => state.isSketchEditorOpen);
  const isMultiFrameOpen = useUIStore(state => state.isMultiFrameOpen);
  const isSonicStudioOpen = useUIStore(state => state.isSonicStudioOpen);
  const isSettingsOpen = useUIStore(state => state.isSettingsOpen);
  const isLoaded = useUIStore(state => state.isLoaded);
  const { 
    setChatOpen, 
    setSketchEditorOpen, 
    setMultiFrameOpen, 
    setSonicStudioOpen, 
    setSettingsOpen, 
    setLoaded 
  } = useUIStore();
  
  // --- 工作流状态（从 workflowStore 获取）---
  const workflows = useWorkflowStore(state => state.workflows);
  const selectedWorkflowId = useWorkflowStore(state => state.selectedWorkflowId);
  const { 
    addWorkflow, 
    updateWorkflow, 
    deleteWorkflow, 
    selectWorkflow, 
    setWorkflows 
  } = useWorkflowStore();
  
  // --- 资源历史状态（从 assetHistoryStore 获取）---
  const assetHistory = useAssetHistoryStore(state => state.assetHistory);
  const { 
    addHistory, 
    clearHistory, 
    setHistory: setAssetHistory 
  } = useAssetHistoryStore();
  
  // --- 选择状态（从 selectionStore 获取）---
  const selectedGroupId = useSelectionStore(state => state.selectedGroupId);
  const { 
    selectGroup, 
    clearGroupSelection 
  } = useSelectionStore();

  // --- Canvas State ---
  // === 架构重构：使用 Zustand Store 管理数据（阶段 B - 第 2 步）===
  // 从 Store 获取数据和操作方法
  const nodes = useNodeStore(state => state.nodes);
  const connections = useConnectionStore(state => state.connections);
  const groups = useGroupStore(state => state.groups);
  
  // 从 Store 获取操作方法
  const { addNode: addNodeToStore, updateNode, deleteNode, setNodes } = useNodeStore();
  const { addConnection, deleteConnection, setConnections } = useConnectionStore();
  const { addGroup, updateGroup, deleteGroup: deleteGroupFromStore, setGroups } = useGroupStore();
  
  // 剪贴板状态（临时 UI 状态，保留在 App.tsx）
  const [clipboard, setClipboard] = useState<AppNode | null>(null); 
  
  // === 架构重构：使用 useHistory Hook（阶段 A - 第 4 步）===
  const {
    saveHistory: saveHistoryToHook,
    undo,
    canUndo,
    canRedo,
  } = useHistory({ 
    maxHistorySize: 50,
    onRestore: (state) => {
      // 恢复历史状态到 Store
      setNodes(state.nodes); // setNodes 会自动处理 Array → Map 转换
      setConnections(state.connections);
      setGroups(state.groups);
    }
  });

  // 创建 saveHistory 包装函数
  const saveHistory = useCallback(() => {
    // 传递三个独立参数给 Hook（修复类型错误）
    saveHistoryToHook(nodes, connections, groups);
  }, [nodes, connections, groups, saveHistoryToHook]);

  // === 定义 deleteNodes 函数（必须在 useSelection 之前）===
  const deleteNodesCallback = useCallback((ids: string[]) => { 
      if (ids.length === 0) return;
      saveHistory();
      
      // 性能优化：清理 Blob URL（避免内存泄漏）
      ids.forEach(id => {
          const node = nodes.get(id);
          if (node) {
              // 清理 gridImages
              if (node.data.gridImages && Array.isArray(node.data.gridImages)) {
                  node.data.gridImages.forEach((url: string) => {
                      if (url && url.startsWith('blob:')) {
                          URL.revokeObjectURL(url);
                      }
                  });
              }
              // 清理 images
              if (node.data.images && Array.isArray(node.data.images)) {
                  node.data.images.forEach((url: string) => {
                      if (url && url.startsWith('blob:')) {
                          URL.revokeObjectURL(url);
                      }
                  });
              }
              // 清理 image
              if (node.data.image && node.data.image.startsWith('blob:')) {
                  URL.revokeObjectURL(node.data.image);
              }
          }
      });
      
      // === 使用 Store 删除节点 ===
      useNodeStore.getState().deleteNodes(ids);
      
      // 清理被删除节点的输入连接
      const allNodes = useNodeStore.getState().getAllNodes();
      allNodes.forEach(node => {
          const filteredInputs = node.inputs.filter(i => !ids.includes(i));
          if (filteredInputs.length !== node.inputs.length) {
              useNodeStore.getState().updateNodeInputs(node.id, filteredInputs);
          }
      });
      
      // === 使用 Store 删除连接 ===
      useConnectionStore.getState().deleteNodesConnections(ids);
  }, [saveHistory, nodes]);

  // === 辅助函数（必须在 useGroup 之前定义）===
  
  const getApproxNodeHeight = (node: AppNode) => {
      if (node.height) return node.height;
      const width = node.width || 420;
      if (['PROMPT_INPUT', 'VIDEO_ANALYZER', 'IMAGE_EDITOR'].includes(node.type)) return 360;
      if (node.type === NodeType.AUDIO_GENERATOR) return 200;
      
      // 新增：故事创作节点的高度
      if (node.type === NodeType.STORY_STUDIO) {
          // 创意工作室：选中时展开，未选中时收起
          const isSelected = selectedNodeIds.includes(node.id);
          return isSelected ? 500 : 120;
      }
      if (node.type === NodeType.CHARACTER_REFERENCE || node.type === NodeType.SCENE_REFERENCE) {
          return 400;
      }
      if (node.type === NodeType.STORYBOARD_SHOT) {
          return 450;
      }
      if (node.type === NodeType.MULTI_ANGLE_CAMERA) {
          // 多角度相机：始终展开，大尺寸显示
          return 800;
      }
      if (node.type === NodeType.GRID_SPLITTER) {
          // 九宫格处理节点
          return 480;
      }
      
      const [w, h] = (node.data.aspectRatio || '16:9').split(':').map(Number);
      const extra = (node.type === NodeType.VIDEO_GENERATOR && node.data.generationMode === 'CUT') ? 36 : 0;
      return ((width * h / w) + extra);
  };

  
  const getNodeBounds = (node: AppNode) => {
      const h = node.height || getApproxNodeHeight(node);
      const w = node.width || 420;
      return { x: node.x, y: node.y, width: w, height: h, r: node.x + w, b: node.y + h };
  };


  // === 架构重构：使用 useSelection Hook（阶段 A - 第 4 步）===
  const {
    selectedNodeIds,
    selectionRect,
    selectNode,
    selectNodes,
    clearSelection,
    selectAll,
    startBoxSelection,
    updateBoxSelection,
    endBoxSelection,
    cancelBoxSelection,
    deleteSelected,
  } = useSelection({
    nodes,
    onDeleteNodes: deleteNodesCallback,
  });

  // === 架构重构：使用 useViewport Hook（阶段 A - 第 4 步）===
  const {
    scale,
    pan,
    isDraggingCanvas,
    handleWheel,
    startCanvasDrag,
    updateCanvasDrag,
    endCanvasDrag,
    fitView,
    resetView,
    zoomIn,
    zoomOut,
    setScale,
  } = useViewport({
    nodes,
    getNodeHeight: (node: AppNode) => {
      if (node.height) return node.height;
      const width = node.width || 420;
      if (['PROMPT_INPUT', 'VIDEO_ANALYZER', 'IMAGE_EDITOR'].includes(node.type)) return 360;
      if (node.type === NodeType.AUDIO_GENERATOR) return 200;
      if (node.type === NodeType.STORY_STUDIO) {
        const isSelected = selectedNodeIds.includes(node.id);
        return isSelected ? 500 : 120;
      }
      if (node.type === NodeType.CHARACTER_REFERENCE || node.type === NodeType.SCENE_REFERENCE) return 400;
      if (node.type === NodeType.STORYBOARD_SHOT) return 450;
      if (node.type === NodeType.MULTI_ANGLE_CAMERA) return 800;
      if (node.type === NodeType.GRID_SPLITTER) return 480;
      const [w, h] = (node.data.aspectRatio || '16:9').split(':').map(Number);
      const extra = (node.type === NodeType.VIDEO_GENERATOR && node.data.generationMode === 'CUT') ? 36 : 0;
      return ((width * h / w) + extra);
    },
  });

  // === 架构重构：使用 useConnection Hook（阶段 A - 第 4 步）===
  const {
    connectionStart,
    startConnection,
    endConnection,
    cancelConnection,
    deleteConnection: deleteConnectionFromHook,
    deleteNodeConnections,
    getOutputConnections,
    getInputConnections,
    isValidConnection,
    getCompatibleOutputNodes,
    getCompatibleInputNodes,
  } = useConnection({
    nodes,
    connections,
    onAddConnection: (connection) => {
      // === 使用 Store 添加连接 ===
      useConnectionStore.getState().addConnection(connection);
    },
    onDeleteConnection: (from, to) => {
      // === 使用 Store 删除连接 ===
      useConnectionStore.getState().deleteConnection(from, to);
    },
    onUpdateNodeInputs: (nodeId, inputs) => {
      // === 使用 Store 更新节点输入 ===
      useNodeStore.getState().updateNodeInputs(nodeId, inputs);
    },
  });

  // === 架构重构：使用 useGroup Hook（阶段 A - 第 4 步）===
  const {
    // selectedGroupId 已从 selectionStore 获取，不再从 Hook 返回
    resizingGroupId,
    selectGroup: selectGroupFromHook, // 从 Hook 获取（实际上调用 Store）
    createGroup,
    deleteGroup: deleteGroupFromHook,
    updateGroupTitle,
    updateGroupPosition,
    updateGroupSize,
    addNodeToGroup,
    removeNodeFromGroup,
    startGroupDrag,
    updateGroupDrag,
    endGroupDrag,
    cancelGroupDrag,
    startGroupResize,
    endGroupResize,
    getNodeGroup,
    isDraggingGroup,
    arrangeTopology, // 新增：一键整理功能
  } = useGroup({
    groups,
    nodes,
    connections,
    scale,
    onAddGroup: (group) => {
      // === 使用 Store 添加分组 ===
      useGroupStore.getState().addGroup(group);
    },
    onUpdateGroup: (id, updates) => {
      // === 使用 Store 更新分组 ===
      useGroupStore.getState().updateGroup(id, updates);
    },
    onDeleteGroup: (id) => {
      // === 使用 Store 删除分组 ===
      useGroupStore.getState().deleteGroup(id);
    },
    onUpdateNode: (id, updates) => {
      // === 使用 Store 更新节点 ===
      useNodeStore.getState().updateNode(id, updates);
    },
    onSaveHistory: saveHistory,
    getApproxNodeHeight,
    onSaveHistory: saveHistory,
  });

  // === 架构重构：使用 useDrag Hook（阶段 A - 第 4 步）===
  // 注意：碰撞检测和磁吸逻辑暂时保留在 App.tsx 中
  const {
    handleMouseDown: handleNodeDragStart,
    handleMouseMove: handleNodeDragMove,
    handleMouseUp: handleNodeDragEnd,
    cancelDrag,
    isDragging: isDraggingNode,
  } = useDrag({
    scale,
    onUpdateNode: (id, updates) => {
      // === 使用 Store 更新节点 ===
      useNodeStore.getState().updateNode(id, updates);
    },
    onSaveHistory: saveHistory,
    getApproxNodeHeight,
    onSaveHistory: saveHistory,
  });

  // Node Resizing
  const [resizingNodeId, setResizingNodeId] = useState<string | null>(null);
  const [initialSize, setInitialSize] = useState<{width: number, height: number} | null>(null);
  const [resizeStartPos, setResizeStartPos] = useState<{x: number, y: number} | null>(null);

  // Context Menu
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [contextMenuTarget, setContextMenuTarget] = useState<any>(null);
  
  // 鼠标位置 state（用于绘制连接线）
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Media Overlays
  const [expandedMedia, setExpandedMedia] = useState<any>(null);
  const [croppingNodeId, setCroppingNodeId] = useState<string | null>(null);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);

  // Refs for closures
  const nodesRef = useRef(nodes);
  const connectionsRef = useRef(connections);
  const groupsRef = useRef(groups);
  const connectionStartRef = useRef(connectionStart);
  const rafRef = useRef<number | null>(null); // For RAF Throttling
  
  // 鼠标位置 ref（用于性能优化，避免频繁触发重渲染）
  const mousePosRef = useRef({ x: 0, y: 0 });
  
  // Replacement Input Refs
  const replaceVideoInputRef = useRef<HTMLInputElement>(null);
  const replaceImageInputRef = useRef<HTMLInputElement>(null);
  const replacementTargetRef = useRef<string | null>(null);
  
  // Interaction Refs
  const dragNodeRef = useRef<{
      id: string, 
      startX: number, 
      startY: number, 
      mouseStartX: number, 
      mouseStartY: number,
      parentGroupId?: string | null,
      siblingNodeIds: string[],
      nodeWidth: number,
      nodeHeight: number,
      element: HTMLElement | null  // 缓存 DOM 元素，避免重复查询
  } | null>(null);

  const resizeContextRef = useRef<{
      nodeId: string,
      initialWidth: number,
      initialHeight: number,
      startX: number,
      startY: number,
      parentGroupId: string | null,
      siblingNodeIds: string[],
      element: HTMLElement | null  // 保留：Resize 需要 DOM 操作
  } | null>(null);

  useEffect(() => {
      nodesRef.current = nodes; connectionsRef.current = connections; groupsRef.current = groups;
      connectionStartRef.current = connectionStart;
  }, [nodes, connections, groups, connectionStart]);

  // --- Persistence ---
  useEffect(() => {
      if (window.aistudio) window.aistudio.hasSelectedApiKey().then(hasKey => { if (!hasKey) window.aistudio.openSelectKey(); });
      const loadData = async () => {
          try {
            // 加载历史记录并恢复 Blob URL
            const sAssets = await loadFromStorage<any[]>('assets'); 
            if (sAssets) {
                // 恢复历史记录中的 Blob URL
                const restoredAssets = await Promise.all(
                    sAssets.map(async (asset) => {
                        // 如果 src 是 Blob URL（已失效），从 IndexedDB 恢复
                        if (asset.src && asset.src.startsWith('blob:')) {
                            try {
                                const blob = await loadFromStorage<Blob>(`asset-${asset.id}`);
                                if (blob) {
                                    const newUrl = URL.createObjectURL(blob);
                                    return { ...asset, src: newUrl };
                                }
                            } catch (error) {
                                console.error(`[AssetHistory] 恢复 ${asset.id} 失败:`, error);
                            }
                        }
                        return asset;
                    })
                );
                setAssetHistory(restoredAssets);
            }
            
            const sWfs = await loadFromStorage<Workflow[]>('workflows'); if (sWfs) setWorkflows(sWfs);
            
            // 性能优化：将数组转换为 Map
            const sNodes = await loadFromStorage<AppNode[]>('nodes'); 
            if (sNodes) {
                // 恢复 Blob URL（页面刷新后 Blob URL 会失效）
                const { loadImageFromBlob, isBlobUrl } = await import('./services/blobStorage');
                
                const restoredNodes = await Promise.all(
                    sNodes.map(async (node) => {
                        const restoredData = { ...node.data };
                        
                        // 恢复 image
                        if (restoredData.image && isBlobUrl(restoredData.image)) {
                            const newUrl = await loadImageFromBlob(node.id, 'image-0');
                            if (newUrl) restoredData.image = newUrl;
                        }
                        
                        // 恢复 images 数组
                        if (restoredData.images && Array.isArray(restoredData.images)) {
                            const newImages = await Promise.all(
                                restoredData.images.map(async (url: string, index: number) => {
                                    if (isBlobUrl(url)) {
                                        const newUrl = await loadImageFromBlob(node.id, `image-${index}`);
                                        return newUrl || url;
                                    }
                                    return url;
                                })
                            );
                            restoredData.images = newImages;
                        }
                        
                        // 恢复 gridImages 数组
                        if (restoredData.gridImages && Array.isArray(restoredData.gridImages)) {
                            const newGridImages = await Promise.all(
                                restoredData.gridImages.map(async (url: string, index: number) => {
                                    if (isBlobUrl(url)) {
                                        const newUrl = await loadImageFromBlob(node.id, `grid-${index}`);
                                        return newUrl || url;
                                    }
                                    return url;
                                })
                            );
                            restoredData.gridImages = newGridImages;
                        }
                        
                        return { ...node, data: restoredData };
                    })
                );
                
                const nodesMap = new Map(restoredNodes.map(n => [n.id, n]));
                // === 使用 Store 设置节点 ===
                useNodeStore.getState().setNodes(nodesMap);
            }
            const sConns = await loadFromStorage<Connection[]>('connections');
            if (sConns) {
                // === 使用 Store 设置连接 ===
                useConnectionStore.getState().setConnections(sConns);
            }
            const sGroups = await loadFromStorage<Group[]>('groups');
            if (sGroups) {
                // === 使用 Store 设置分组 ===
                useGroupStore.getState().setGroups(sGroups);
            }
          } catch (e) {
            console.error("Failed to load storage", e);
          } finally {
            setLoaded(true); 
          }
      };
      loadData();
  }, []);

  useEffect(() => {
      if (!isLoaded) return; 
      
      saveToStorage('assets', assetHistory);
      saveToStorage('workflows', workflows);
      // 性能优化：将 Map 转换为数组保存到 IndexedDB
      saveToStorage('nodes', Array.from(nodes.values()));
      saveToStorage('connections', connections);
      saveToStorage('groups', groups);
  }, [assetHistory, workflows, nodes, connections, groups, isLoaded]);

  
  

  // === 使用 NodeRegistry 获取节点名称和图标（架构重构 - 阶段 A - 第 2 步）===
  const getNodeNameCN = useCallback((t: string) => {
      return getNodeName(t as NodeType);
  }, []);
  
  const getNodeIcon = useCallback((t: string) => {
      const iconName = getNodeIconName(t as NodeType);
      // 映射图标名称到实际的图标组件
      const iconMap: Record<string, any> = {
          'Type': Type,
          'Image': ImageIcon,
          'Video': Film,
          'Music': Mic2,
          'ScanFace': ScanFace,
          'Brush': Brush,
          'Sparkles': Sparkles,
          'User': ScanFace,
          'MapPin': LayoutTemplate,
          'Camera': Film,
          'LayoutTemplate': LayoutTemplate,
          'Grid3X3': Grid3X3,
          'Film': Film,
      };
      return iconMap[iconName || ''] || Plus;
  }, []);

  // === 使用 NodeRegistry 创建节点（架构重构 - 阶段 A - 第 2 步）===
  const addNode = useCallback((type: NodeType, x?: number, y?: number, initialData?: any) => {
      if (type === NodeType.IMAGE_EDITOR) {
          setSketchEditorOpen(true);
          return;
      }

      try { saveHistory(); } catch (e) { }

      // 计算节点位置
      const safeX = x !== undefined ? x : (-pan.x + window.innerWidth/2)/scale - 210;
      const safeY = y !== undefined ? y : (-pan.y + window.innerHeight/2)/scale - 180;

      // 使用 NodeRegistry 创建节点
      const newNode = nodeRegistry.createNode(type, {
          x: isNaN(safeX) ? 100 : safeX,
          y: isNaN(safeY) ? 100 : safeY,
          data: initialData,
      });
      
      if (!newNode) {
          console.error(`无法创建节点: ${type}`);
          return;
      }
      
      // === 使用 Store 添加节点 ===
      useNodeStore.getState().addNode(newNode);
  }, [pan, scale, saveHistory]);

  const handleAssetGenerated = useCallback(async (type: 'image' | 'video' | 'audio', src: string, title: string) => {
      // 性能优化：如果是 Blob URL，将 Blob 存储到 IndexedDB（页面刷新后可恢复）
      let assetId = `a-${Date.now()}`;
      
      if (src.startsWith('blob:')) {
          try {
              // 从 Blob URL 获取 Blob
              const response = await fetch(src);
              const blob = await response.blob();
              
              // 存储到 IndexedDB
              await saveToStorage(`asset-${assetId}`, blob);
          } catch (error) {
              console.error('[AssetHistory] 保存 Blob 失败:', error);
          }
      }
      
      setAssetHistory(h => {
          const exists = h.find(a => a.src === src);
          if (exists) return h;
          return [{ id: assetId, type, src, title, timestamp: Date.now() }, ...h];
      });
  }, []);

  // 批量下载选中的图片并清除
  const downloadSelectedImagesAndClear = useCallback(async (selectedIds: Set<string>) => {
      if (selectedIds.size === 0) return;
      
      // 收集要下载的图片
      const assetsToDownload = assetHistory.filter(a => selectedIds.has(a.id));
      
      if (assetsToDownload.length === 0) return;
      
      try {
          if (assetsToDownload.length === 1) {
              // 单张图片：直接下载
              const asset = assetsToDownload[0];
              const a = document.createElement('a');
              a.href = asset.src;
              a.download = `${asset.title || 'image'}.png`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
          } else {
              // 多张图片：打包成 ZIP 下载
              const JSZip = (await import('jszip')).default;
              const zip = new JSZip();
              
              // 将所有图片添加到 ZIP
              for (let i = 0; i < assetsToDownload.length; i++) {
                  const asset = assetsToDownload[i];
                  try {
                      const response = await fetch(asset.src);
                      const blob = await response.blob();
                      const filename = `${i + 1}-${asset.title || 'image'}.png`;
                      zip.file(filename, blob);
                  } catch (error) {
                      console.error(`[下载] 获取图片失败: ${asset.title}`, error);
                  }
              }
              
              // 生成并下载 ZIP 文件
              const zipBlob = await zip.generateAsync({ type: 'blob' });
              const a = document.createElement('a');
              a.href = URL.createObjectURL(zipBlob);
              a.download = `历史记录-${new Date().toISOString().slice(0, 10)}.zip`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              
              // 清理 ZIP 的 Blob URL
              setTimeout(() => URL.revokeObjectURL(a.href), 1000);
          }
          
          // 从历史记录中删除
          const newAssetHistory = assetHistory.filter(a => !selectedIds.has(a.id));
          setAssetHistory(newAssetHistory);
          
          // 立即保存到 localStorage（不等待 useEffect）
          await saveToStorage('assets', newAssetHistory);
          
          // 清除 Blob URL
          for (const asset of assetsToDownload) {
              if (asset.src.startsWith('blob:')) {
                  URL.revokeObjectURL(asset.src);
              }
          }
          
          alert(`? 已下载 ${assetsToDownload.length} 张图片\n\n历史记录已清除！`);
      } catch (error) {
          console.error('[下载] 批量下载失败:', error);
          alert('? 下载失败，请重试');
      }
  }, [assetHistory]);
  
  const handleSketchResult = (type: 'image' | 'video', result: string, prompt: string) => {
      const centerX = (-pan.x + window.innerWidth/2)/scale - 210;
      const centerY = (-pan.y + window.innerHeight/2)/scale - 180;
      
      if (type === 'image') {
          addNode(NodeType.IMAGE_GENERATOR, centerX, centerY, { image: result, prompt, status: NodeStatus.SUCCESS });
      } else {
          addNode(NodeType.VIDEO_GENERATOR, centerX, centerY, { videoUri: result, prompt, status: NodeStatus.SUCCESS });
      }
      
      handleAssetGenerated(type, result, prompt || 'Sketch Output');
  };

  const handleMultiFrameGenerate = async (frames: SmartSequenceItem[]): Promise<string> => {
      const complexPrompt = compileMultiFramePrompt(frames as any[]);

      try {
          const res = await generateVideo(
              complexPrompt, 
              'veo-3.1-generate-preview', 
              { aspectRatio: '16:9', count: 1 },
              frames[0].src, 
              null,
              frames.length > 1 ? frames.map(f => f.src) : undefined 
          );
          
          if (res.isFallbackImage) {
              handleAssetGenerated('image', res.uri, 'Smart Sequence Preview (Fallback)');
          } else {
              handleAssetGenerated('video', res.uri, 'Smart Sequence');
          }
          return res.uri;
      } catch (e: any) {
          throw new Error(e.message || "Smart Sequence Generation Failed");
      }
  };

  // 一键整理组内节点
  const handleArrangeGroup = useCallback(() => {
      if (!selectedGroupId) return;
      
      // === 使用 useGroup Hook 的 arrangeTopology 方法 ===
      arrangeTopology(selectedGroupId);
  }, [selectedGroupId, arrangeTopology]);

  // === 画布点击事件处理（集成 useViewport + useSelection）===
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
      if (contextMenu) setContextMenu(null); 
      selectGroup(null); // 使用 Store 的方法
      
      if (e.button === 0 && !e.shiftKey) { 
          // 左键点击：清空选择 + 开始框选
          if (e.detail === 1) {
              clearSelection();
              startBoxSelection(e.clientX, e.clientY);
          }
      }
      
      if (e.button === 1 || (e.button === 0 && e.shiftKey)) { 
          // 中键 或 Shift+左键：开始拖拽画布
          startCanvasDrag(e);
      }
  };

  const handleGlobalMouseMove = useCallback((e: MouseEvent) => {
      const { clientX, clientY } = e;
      
      // 性能优化：使用 ref 存储鼠标位置，避免每次都触发 React 重渲染
      mousePosRef.current = { x: clientX, y: clientY };
      
      // 只在绘制连接线时更新 state（触发重渲染）
      if (connectionStartRef.current) {
          setMousePos({ x: clientX, y: clientY });
      }
      
      if (selectionRect) { 
          updateBoxSelection(clientX, clientY);
          return; 
      }
      
      // === 节点拖拽：使用 useDrag Hook ===
      if (isDraggingNode) {
          handleNodeDragMove(e);
          return;
      }
      
      // === Group 拖动：使用 useGroup Hook ===
      if (isDraggingGroup) {
          updateGroupDrag(e, scale);
          return;
      }
  }, [selectionRect, isDraggingNode, isDraggingGroup, scale, updateBoxSelection, updateGroupDrag, handleNodeDragMove]);

  const handleGlobalMouseUp = useCallback((e: MouseEvent) => {
      if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
      
      // === 节点拖拽结束：使用 useDrag Hook ===
      if (isDraggingNode) {
          handleNodeDragEnd(e);
      }
      
      // === Group 拖拽结束：使用 useGroup Hook ===
      if (isDraggingGroup) {
          endGroupDrag(e, scale);
      }
      
      // 性能优化：处理 Resize 结束 - 更新 state 并恢复 transition
      if (resizingNodeId && resizeContextRef.current) {
          const { element } = resizeContextRef.current;
          
          if (element) {
              const finalWidth = parseInt(element.style.width) || (initialSize?.width || 420);
              const finalHeight = parseInt(element.style.height) || (initialSize?.height || 360);
              
              // === 使用 Store 更新节点尺寸 ===
              useNodeStore.getState().updateNodeSize(resizingNodeId, finalWidth, finalHeight);
              
              // 清除内联样式，恢复 transition
              element.style.transition = 'none';
              requestAnimationFrame(() => {
                  element.style.transition = '';
              });
          }
      }
      
      // === 处理连接线拖拽结束：使用 useConnection Hook ===
      if (connectionStartRef.current) {
          const startConnection = connectionStartRef.current;
          const startNode = nodesRef.current.get(startConnection.id) as AppNode | undefined;
          
          if (startNode) {
              let compatibleTypes: NodeType[] = [];
              
              // 根据拖拽方向确定兼容的节点类型
              if (startConnection.portType === 'output') {
                  // 从输出端口拖拽 → 显示可以接收此输出的节点
                  compatibleTypes = getCompatibleOutputNodes(startNode);
              } else {
                  // 从输入端口拖拽 → 显示可以提供输入的节点
                  compatibleTypes = getCompatibleInputNodes(startNode);
              }
              
              // 如果有兼容的节点类型，弹出菜单
              if (compatibleTypes.length > 0) {
                  const currentMousePos = mousePosRef.current;
                  setContextMenu({ 
                      visible: true, 
                      x: currentMousePos.x, 
                      y: currentMousePos.y, 
                      id: startConnection.id 
                  });
                  setContextMenuTarget({ 
                      type: 'smart-connect', 
                      sourceNodeId: startConnection.id,
                      portType: startConnection.portType || 'output',
                      compatibleTypes 
                  });
              }
          }
          
          // 使用 Hook 的 cancelConnection 方法
          cancelConnection();
      }
      
      // === 框选结束：使用 useSelection Hook ===
      if (selectionRect) {
          // 调用 useSelection 的 endBoxSelection 来选择节点
          endBoxSelection(scale, pan);
          
          // 保留原有的自动创建分组逻辑
          const currentPan = pan;
          const currentScale = scale;
          const x = Math.min(selectionRect.startX, selectionRect.currentX); 
          const y = Math.min(selectionRect.startY, selectionRect.currentY);
          const w = Math.abs(selectionRect.currentX - selectionRect.startX); 
          const h = Math.abs(selectionRect.currentY - selectionRect.startY);
          if (w > 10) {
              const rect = { x: (x - currentPan.x) / currentScale, y: (y - currentPan.y) / currentScale, w: w / currentScale, h: h / currentScale };
              const enclosed = Array.from(nodesRef.current.values()).filter(n => { const cx = n.x + (n.width||420)/2; const cy = n.y + 160; return cx>rect.x && cx<rect.x+rect.w && cy>rect.y && cy<rect.y+rect.h; });
              if (enclosed.length > 0) { saveHistory(); 
                  const freeNodes = enclosed.filter(n => {
                      const cx = n.x + (n.width || 420) / 2; const cy = n.y + 160;
                      return !groupsRef.current.some(g => cx > g.x && cx < g.x + g.width && cy > g.y && cy < g.y + g.height);
                  });
                  if (freeNodes.length > 0) {
                      const fMinX=Math.min(...freeNodes.map(n=>n.x)), fMinY=Math.min(...freeNodes.map(n=>n.y)), fMaxX=Math.max(...freeNodes.map(n=>n.x+(n.width||420))), fMaxY=Math.max(...freeNodes.map(n=>n.y+320));
                      // 使用 Store 的 addGroup 而不是 React 的 setGroups
                      addGroup({ id: `g-${Date.now()}`, title: '新建分组', x: fMinX-32, y: fMinY-32, width: (fMaxX-fMinX)+64, height: (fMaxY-fMinY)+64, nodeIds: freeNodes.map(n=>n.id) });
                  }
              }
          }
      }

      
      // 清理状态
      setResizingNodeId(null); 
      setInitialSize(null); 
      setResizeStartPos(null);
      
      // 清理 refs
      resizeContextRef.current = null;
  }, [isDraggingGroup, endGroupDrag, scale, selectionRect, saveHistory, resizingNodeId, initialSize, getCompatibleOutputNodes, getCompatibleInputNodes, getApproxNodeHeight, endBoxSelection, pan, cancelConnection]);

  useEffect(() => { window.addEventListener('mousemove', handleGlobalMouseMove); window.addEventListener('mouseup', handleGlobalMouseUp); return () => { window.removeEventListener('mousemove', handleGlobalMouseMove); window.removeEventListener('mouseup', handleGlobalMouseUp); }; }, [handleGlobalMouseMove, handleGlobalMouseUp]);

  // === 架构重构：注册 useViewport 的事件监听器 ===
  useEffect(() => {
    if (isDraggingCanvas) {
      window.addEventListener('mousemove', updateCanvasDrag);
      window.addEventListener('mouseup', endCanvasDrag);
      return () => {
        window.removeEventListener('mousemove', updateCanvasDrag);
        window.removeEventListener('mouseup', endCanvasDrag);
      };
    }
  }, [isDraggingCanvas, updateCanvasDrag, endCanvasDrag]);

  // 注册 wheel 事件监听器（非 passive 模式，允许 preventDefault）
  useEffect(() => {
    const canvas = document.getElementById('canvas-container');
    if (canvas) {
      canvas.addEventListener('wheel', handleWheel, { passive: false });
      return () => {
        canvas.removeEventListener('wheel', handleWheel);
      };
    }
  }, [handleWheel]);

  const handleNodeUpdate = useCallback((id: string, data: any, size?: any, title?: string) => {
      // === 使用 Store 更新节点 ===
      const node = useNodeStore.getState().getNode(id);
      if (node) {
          const updates: Partial<AppNode> = {
              data: { ...node.data, ...data },
              title: title || node.title,
          };
          
          if (size) {
              if (size.width) updates.width = size.width;
              if (size.height) updates.height = size.height;
          }
          
          // 生成资产历史记录
          if (data.image) handleAssetGenerated('image', data.image, updates.title || node.title);
          if (data.videoUri) handleAssetGenerated('video', data.videoUri, updates.title || node.title);
          if (data.audioUri) handleAssetGenerated('audio', data.audioUri, updates.title || node.title);
          
          useNodeStore.getState().updateNode(id, updates);
      }
  }, [handleAssetGenerated]);

  const handleReplaceFile = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
      const file = e.target.files?.[0];
      const targetId = replacementTargetRef.current;
      if (file && targetId) {
          const reader = new FileReader();
          reader.onload = (e) => {
              const result = e.target?.result as string;
              if (type === 'image') handleNodeUpdate(targetId, { image: result });
              else handleNodeUpdate(targetId, { videoUri: result });
          };
          reader.readAsDataURL(file);
      }
      e.target.value = ''; setContextMenu(null); replacementTargetRef.current = null; 
  };

  const handleNodeAction = useCallback(async (id: string, promptOverride?: string) => {
      const node = nodesRef.current.get(id) as AppNode | undefined; if (!node) return;
      handleNodeUpdate(id, { error: undefined });
      
      // === 使用 Store 更新节点状态 ===
      useNodeStore.getState().updateNodeStatus(id, NodeStatus.WORKING);

      try {
          const inputs = node.inputs.map(i => nodesRef.current.get(i) as AppNode | undefined).filter(Boolean) as AppNode[];
          
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

          if (node.type === NodeType.IMAGE_GENERATOR) {
               const inputImages: string[] = [];
               inputs.forEach(n => { if (n?.data.image) inputImages.push(n.data.image); });

               const isStoryboard = /分镜|storyboard|sequence|shots|frames|json/i.test(prompt);

               if (isStoryboard) {
                  try {
                      const storyboard = await planStoryboard(prompt, upstreamTexts.join('\n'));
                      if (storyboard.length > 1) {
                          // ... (storyboard expansion logic preserved) ...
                          const newNodes: AppNode[] = [];
                          const newConnections: Connection[] = [];
                          const COLUMNS = 3;
                          const gapX = 40; const gapY = 40;
                          const childWidth = node.width || 420;
                          const ratio = node.data.aspectRatio || '16:9';
                          const [rw, rh] = ratio.split(':').map(Number);
                          const childHeight = (childWidth * rh / rw); 
                          const startX = node.x + (node.width || 420) + 150;
                          const startY = node.y; 
                          const totalRows = Math.ceil(storyboard.length / COLUMNS);
                          
                          storyboard.forEach((shotPrompt, index) => {
                              const col = index % COLUMNS;
                              const row = Math.floor(index / COLUMNS);
                              const posX = startX + col * (childWidth + gapX);
                              const posY = startY + row * (childHeight + gapY);
                              const newNodeId = `n-${Date.now()}-${index}`;
                              newNodes.push({
                                  id: newNodeId, type: NodeType.IMAGE_GENERATOR, x: posX, y: posY, width: childWidth, height: childHeight,
                                  title: `分镜 ${index + 1}`, status: NodeStatus.WORKING,
                                  data: { ...node.data, aspectRatio: ratio, prompt: shotPrompt, image: undefined, images: undefined, imageCount: 1 },
                                  inputs: [node.id] 
                              });
                              newConnections.push({ from: node.id, to: newNodeId });
                          });
                          
                          const groupPadding = 30;
                          const groupWidth = (Math.min(storyboard.length, COLUMNS) * childWidth) + ((Math.min(storyboard.length, COLUMNS) - 1) * gapX) + (groupPadding * 2);
                          const groupHeight = (totalRows * childHeight) + ((totalRows - 1) * gapY) + (groupPadding * 2);

                          // === 使用 Store 创建分组 ===
                          useGroupStore.getState().addGroup({ 
                              id: `g-${Date.now()}`, 
                              title: '分镜生成组', 
                              x: startX - groupPadding, 
                              y: startY - groupPadding, 
                              width: groupWidth, 
                              height: groupHeight 
                          });
                          
                          // === 使用 Store 批量添加节点 ===
                          useNodeStore.getState().addNodes(newNodes);
                          
                          // === 使用 Store 批量添加连接 ===
                          newConnections.forEach(conn => {
                              useConnectionStore.getState().addConnection(conn);
                          });
                          
                          handleNodeUpdate(id, { status: NodeStatus.SUCCESS });

                          newNodes.forEach(async (n) => {
                               try {
                                   const res = await generateImageFromText(n.data.prompt!, n.data.model!, inputImages, { aspectRatio: n.data.aspectRatio, resolution: n.data.resolution, count: 1 });
                                   
                                   // 性能优化：将 base64 转换为 Blob URL
                                   const { saveImagesToBlob } = await import('./services/blobStorage');
                                   const blobUrls = await saveImagesToBlob(res, n.id, 'image');
                                   
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
              const res = await generateImageFromText(prompt, node.data.model, inputImages, { aspectRatio: node.data.aspectRatio || '16:9', resolution: node.data.resolution, count: node.data.imageCount });
              
              // 性能优化：将 base64 转换为 Blob URL（内存减少 99%）
              const { saveImagesToBlob } = await import('./services/blobStorage');
              const blobUrls = await saveImagesToBlob(res, id, 'image');
              
              handleNodeUpdate(id, { image: blobUrls[0], images: blobUrls });

          } else if (node.type === NodeType.VIDEO_GENERATOR) {
              
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
                   handleNodeUpdate(id, { 
                       image: res.uri, 
                       videoUri: undefined, 
                       videoMetadata: undefined,
                       error: "Region restricted: Generated preview image instead.", 
                       status: NodeStatus.SUCCESS 
                   });
              } else {
                   handleNodeUpdate(id, { videoUri: res.uri, videoMetadata: res.videoMetadata, videoUris: res.uris });
              }

          } else if (node.type === NodeType.AUDIO_GENERATOR) {
              const audioUri = await generateAudio(prompt);
              handleNodeUpdate(id, { audioUri: audioUri });

          } else if (node.type === NodeType.VIDEO_ANALYZER) {
             const vid = node.data.videoUri || inputs.find(n => n?.data.videoUri)?.data.videoUri;
             if (!vid) throw new Error("未找到视频输入");
             let vidData = vid;
             if (vid.startsWith('http')) vidData = await urlToBase64(vid);
             const txt = await analyzeVideo(vidData, prompt, node.data.model);
             handleNodeUpdate(id, { analysis: txt });
          } else if (node.type === NodeType.IMAGE_EDITOR) {
             const inputImages: string[] = [];
             inputs.forEach(n => { if (n?.data.image) inputImages.push(n.data.image); });
             const img = node.data.image || inputImages[0];
             const res = await editImageWithText(img, prompt, node.data.model);
             
             // 性能优化：将 base64 转换为 Blob URL
             const { saveImageToBlob } = await import('./services/blobStorage');
             const blobUrl = await saveImageToBlob(res, id, 'edited');
             
             handleNodeUpdate(id, { image: blobUrl });
          } else if (node.type === NodeType.SCRIPT_NODE) {
             // 剧本节点：使用 Coze AI 生成剧本
             const userIdea = promptOverride || prompt;
             if (!userIdea || userIdea.trim().length === 0) {
                 throw new Error('请输入您的创意');
             }
             
             // 调用 Coze AI 生成剧本
             const { generateScript } = await import('./services/cozeService');
             const scriptData = await generateScript(userIdea, node.data.targetDuration || 60);
             
             // 更新节点数据
             handleNodeUpdate(id, { scriptData });
          } else if (node.type === NodeType.MULTI_ANGLE_CAMERA) {
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
             
             // 根据仰角生成描述
             const getElevationDescCN = (angle: number): string => {
                 if (angle <= -20) return '仰拍';
                 if (angle <= 10) return '平视';
                 if (angle <= 40) return '俯拍';
                 return '高角度俯拍';
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
             
             const azimuthDesc = getAzimuthDescCN(hAngle);
             const elevationDesc = getElevationDescCN(vAngle);
             const distanceDesc = getDistanceDescCN(zoom);
             
             // 英文参数化描述（给 AI 用）- 重新规划距离层次
             const getDistanceDescEN = (z: number): string => {
                 if (z <= 0.5) return 'extreme close-up (face only, very tight framing)';
                 if (z <= 1.5) return 'close-up (head and shoulders)';
                 if (z <= 3) return 'medium close-up (chest up)';
                 if (z <= 4.5) return 'medium shot (waist up)';
                 if (z <= 6) return 'medium full shot (knees up)';
                 if (z <= 7.5) return 'full shot (entire body visible)';
                 if (z <= 9) return 'wide shot (body with environment)';
                 return 'extreme wide shot (small figure in large environment)';
             };
             
             const getElevationDescEN = (angle: number): string => {
                 if (angle >= 80) return 'directly overhead top-down';
                 if (angle >= 40) return 'high-angle bird\'s-eye view';
                 if (angle >= 10) return 'slightly elevated angle';
                 if (angle >= -10) return 'eye-level';
                 if (angle >= -30) return 'slightly low angle';
                 if (angle >= -60) return 'low-angle worm\'s-eye view';
                 return 'directly underneath looking straight up';
             };
             
             const getAzimuthDescEN = (angle: number): string => {
                 const normalized = ((angle % 360) + 360) % 360;
                 if (normalized < 22.5 || normalized >= 337.5) return 'direct front view';
                 if (normalized < 67.5) return 'front three-quarter view';
                 if (normalized < 112.5) return 'side profile view';
                 if (normalized < 157.5) return 'rear three-quarter view';
                 if (normalized < 202.5) return 'direct back view';
                 if (normalized < 247.5) return 'rear three-quarter view';
                 if (normalized < 292.5) return 'side profile view';
                 return 'front three-quarter view';
             };
             
             // 构建提示词 - 生成九宫格布局
             const cameraAngleDesc = `${distanceDesc}，${azimuthDesc}，${elevationDesc}`;
             const baseDistanceEN = getDistanceDescEN(zoom);
             const baseElevationEN = getElevationDescEN(vAngle);
             const baseAzimuthEN = getAzimuthDescEN(hAngle);
             
             // 生成 3x3 网格的相机位置（在用户选择的角度周围做小范围变化）
             const generateCameraGrid = (centerH: number, centerV: number, centerZ: number) => {
                 const positions = [];
                 // 水平偏移：-20°, 0°, +20°（左、中、右）
                 const hOffsets = [-20, 0, 20];
                 // 垂直偏移：+15°, 0°, -15°（上、中、下）
                 const vOffsets = [15, 0, -15];
                 // 距离偏移：-1, 0, +1（近、中、远）- 调小偏移，因为层次更细了
                 const zOffsets = [-1, 0, 1];
                 
                 for (let row = 0; row < 3; row++) {
                     for (let col = 0; col < 3; col++) {
                         const h = ((centerH + hOffsets[col]) % 360 + 360) % 360;
                         const v = Math.max(-90, Math.min(90, centerV + vOffsets[row]));
                         const z = Math.max(0, Math.min(10, centerZ + zOffsets[col]));
                         
                         const hDescEN = getAzimuthDescEN(h);
                         const vDescEN = getElevationDescEN(v);
                         const zDescEN = getDistanceDescEN(z);
                         
                         positions.push(`Panel ${row * 3 + col + 1}: ${zDescEN}, ${hDescEN}, ${vDescEN}`);
                     }
                 }
                 return positions;
             };
             
             const cameraPositions = generateCameraGrid(hAngle, vAngle, zoom);
             
             // Gemini 提示词 - 强调单张九宫格图片 + 明确主视角
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
? Same art style (realistic/anime/cartoon/painting etc.)
? Same rendering technique (cel-shaded/painterly/photorealistic etc.)
? Same color grading and palette
? Same lighting mood and atmosphere
? Same level of detail and texture quality
? Same background aesthetic

? Do NOT change art style between panels
? Do NOT add different filters or effects
? Do NOT alter color grading or saturation
? Do NOT change rendering quality or technique

**TARGET VIEWING ANGLE (This is what you MUST render):**
Primary angle: **${baseAzimuthEN}**
Distance: **${baseDistanceEN}**
Height: **${baseElevationEN}**

ALL 9 panels must be rendered from angles CLOSE TO "${baseAzimuthEN}".

**SPECIFIC INSTRUCTION FOR "${baseAzimuthEN}":**
${baseAzimuthEN === 'side profile view' ? `
- Show the character from the SIDE (90° from front)
- You should see the character's profile (side of face)
- NOT from the front, NOT from three-quarter view
- Pure side view as the base angle
` : baseAzimuthEN === 'direct back view' ? `
- Show the character from BEHIND (180° from front)
- You should see the back of the head and back of body
- NOT from the front, NOT from three-quarter view
` : baseAzimuthEN === 'front three-quarter view' ? `
- Show the character from 45° angle (between front and side)
- You should see most of the face but also some side
` : baseAzimuthEN === 'rear three-quarter view' ? `
- Show the character from 135° angle (between side and back)
- You should see mostly the back but also some side of face
` : `
- Show the character from: ${baseAzimuthEN}
`}

**9 PANEL CONFIGURATIONS (small variations around ${baseAzimuthEN}):**
${cameraPositions.join('\n')}

**RULES:**
? Output ONE single 21:9 image with 9 panels inside
? Panel 5 (center) = exact target: ${baseDistanceEN}, ${baseAzimuthEN}, ${baseElevationEN}
? All panels show angles NEAR ${baseAzimuthEN} (±20° variation)
? Character appearance identical in all panels
? Art style and visual aesthetic IDENTICAL in all panels (same as reference)
? Color palette and grading IDENTICAL in all panels
? Rendering technique IDENTICAL in all panels
? Thin dividing lines between panels

? Do NOT generate 9 separate images
? Do NOT use the reference image's viewing angle
? Do NOT show front view if target is side view
? Do NOT change art style, colors, or rendering between panels
? Do NOT apply different filters or effects to different panels`;
             
             if (userPrompt) {
                 geminiPrompt += `\n\n**【额外风格要求】：**\n${userPrompt}`;
             }
             
             // 保存生成的提示词
             handleNodeUpdate(id, { cameraPrompt: geminiPrompt });
             
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
                 const { saveImagesToBlob } = await import('./services/blobStorage');
                 const blobUrls = await saveImagesToBlob(res, id, 'grid');
                 
                 // 更新节点数据 - 只存储 Blob URL（每个只有几十字节）
                 handleNodeUpdate(id, { 
                     gridImages: blobUrls,  // Blob URL 数组（内存占用减少 99%）
                     image: blobUrls[0]  // 输出九宫格图片给下游节点
                 });
                 
                 } catch (geminiError: any) {
                 console.error('[MultiAngleCamera] Gemini API 失败:', geminiError);
                 
                 // 提供更友好的错误信息
                 let errorMessage = geminiError.message || '图片生成失败';
                 if (errorMessage.includes('quota') || errorMessage.includes('429')) {
                     errorMessage = 'API 配额已用完，请稍后再试或升级到付费计划';
                 }
                 
                 throw new Error(errorMessage);
             }
          }
          // === 使用 Store 更新节点状态为成功 ===
          useNodeStore.getState().updateNodeStatus(id, NodeStatus.SUCCESS);
      } catch (e: any) {
          handleNodeUpdate(id, { error: e.message });
          // === 使用 Store 更新节点状态为错误 ===
          useNodeStore.getState().updateNodeStatus(id, NodeStatus.ERROR);
      }
  }, [handleNodeUpdate]);

  
  const saveCurrentAsWorkflow = () => {
      // 性能优化：使用 Array.from(nodes.values()) 转换 Map 为数组
      const nodesArray = Array.from(nodes.values());
      const thumbnailNode = nodesArray.find(n => n.data.image);
      const thumbnail = thumbnailNode?.data.image || '';
      const newWf: Workflow = { id: `wf-${Date.now()}`, title: `工作流 ${new Date().toLocaleDateString()}`, thumbnail, nodes: JSON.parse(JSON.stringify(nodesArray)), connections: JSON.parse(JSON.stringify(connections)), groups: JSON.parse(JSON.stringify(groups)) };
      setWorkflows(prev => [newWf, ...prev]);
  };
  
  const saveGroupAsWorkflow = (groupId: string) => {
      const group = groups.find(g => g.id === groupId);
      if (!group) return;
      const nodesInGroup = Array.from(nodes.values()).filter(n => { const w = n.width || 420; const h = n.height || getApproxNodeHeight(n); const cx = n.x + w/2; const cy = n.y + h/2; return cx > group.x && cx < group.x + group.width && cy > group.y && cy < group.y + group.height; });
      const nodeIds = new Set(nodesInGroup.map(n => n.id));
      const connectionsInGroup = connections.filter(c => nodeIds.has(c.from) && nodeIds.has(c.to));
      const thumbNode = nodesInGroup.find(n => n.data.image);
      const thumbnail = thumbNode ? thumbNode.data.image : '';
      const newWf: Workflow = { id: `wf-${Date.now()}`, title: group.title || '未命名工作流', thumbnail: thumbnail || '', nodes: JSON.parse(JSON.stringify(nodesInGroup)), connections: JSON.parse(JSON.stringify(connectionsInGroup)), groups: [JSON.parse(JSON.stringify(group))] };
      setWorkflows(prev => [newWf, ...prev]);
  };

  /**
   * 从剧本节点生成完整工作流
   */
  const createWorkflowFromScript = useCallback((scriptNodeId: string) => {
      const scriptNode = nodesRef.current.get(scriptNodeId) as AppNode | undefined;
      if (!scriptNode || !scriptNode.data.scriptData) {
          console.error('[生成工作流] 剧本节点不存在或没有剧本数据');
          return;
      }
      
      const scriptData = scriptNode.data.scriptData;
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
      scriptData.characters.forEach((char: any, index: number) => {
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
      scriptData.scenes.forEach((scene: any, index: number) => {
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
      
      scriptData.shots.forEach((shot: any, index: number) => {
          const col = index % shotColumns;
          const row = Math.floor(index / shotColumns);
          const nodeId = `shot-img-${Date.now()}-${index}`;
          
          const posX = shotStartX + col * (nodeWidth + colGap);
          const posY = shotStartY + row * (shotNodeHeight + rowGap);
          
          // 找到该分镜关联的角色参考节点和场景参考节点
          const characterNodeIds = shot.characters
              .map((charName: string) => {
                  const charIndex = scriptData.characters.findIndex((c: any) => c.name === charName);
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
      const newGroups: Group[] = [];
      
      // 角色参考组
      if (scriptData.characters.length > 0) {
          const charNodes = newNodes.filter(n => n.type === NodeType.CHARACTER_REFERENCE);
          const groupPadding = 30;
          const groupHeight = charNodes.reduce((sum, n) => sum + (n.height || 400) + rowGap, 0) - rowGap + groupPadding * 2;
          
          newGroups.push({
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
          
          newGroups.push({
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
          
          newGroups.push({
              id: `group-shots-${Date.now()}`,
              title: '分镜图生成',
              x: shotStartX - groupPadding,
              y: shotStartY - groupPadding,
              width: groupWidth,
              height: groupHeight,
              nodeIds: shotNodes.map(n => n.id)
          });
      }
      
      // === 5. 使用 Store 更新状态 ===
      useNodeStore.getState().addNodes(newNodes);
      newConnections.forEach(conn => {
          useConnectionStore.getState().addConnection(conn);
      });
      newGroups.forEach(group => {
          useGroupStore.getState().addGroup(group);
      });
      
      // 提示用户
      alert(`? 工作流生成成功！\n\n已创建：\n- ${scriptData.characters.length} 个角色参考节点\n- ${scriptData.scenes.length} 个场景参考节点\n- ${scriptData.shots.length} 个分镜图生成节点`);
  }, [saveHistory]);

  const loadWorkflow = (id: string) => {
      const wf = workflows.find(w => w.id === id);
      if (wf) { 
          saveHistory(); 
          // === 使用 Store 加载工作流 ===
          const nodesMap = new Map(wf.nodes.map(n => [n.id, n]));
          useNodeStore.getState().setNodes(nodesMap);
          useConnectionStore.getState().setConnections(JSON.parse(JSON.stringify(wf.connections)));
          useGroupStore.getState().setGroups(JSON.parse(JSON.stringify(wf.groups)));
          selectWorkflow(id); // 使用 Store 的方法
      }
  };

  const deleteWorkflowFunc = (id: string) => { 
    deleteWorkflow(id); // 使用 Store 的方法（会自动清空选择）
  };
  const renameWorkflow = (id: string, newTitle: string) => { 
    updateWorkflow(id, { title: newTitle }); // 使用 Store 的方法
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;
        
        // === 使用 useSelection Hook 的 selectAll ===
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'a') { e.preventDefault(); selectAll(); return; }
        
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); undo(); return; }
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'c') { const lastSelected = selectedNodeIds[selectedNodeIds.length - 1]; if (lastSelected) { const nodeToCopy = nodesRef.current.get(lastSelected) as AppNode | undefined; if (nodeToCopy) { e.preventDefault(); setClipboard(JSON.parse(JSON.stringify(nodeToCopy))); } } return; }
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'v') { 
            if (clipboard) { 
                e.preventDefault(); 
                saveHistory(); 
                const newNode: AppNode = { 
                    ...clipboard, 
                    id: `n-${Date.now()}-${Math.floor(Math.random()*1000)}`, 
                    x: clipboard.x + 50, 
                    y: clipboard.y + 50, 
                    status: NodeStatus.IDLE, 
                    inputs: [] 
                }; 
                // === 使用 Store 添加节点 ===
                useNodeStore.getState().addNode(newNode); 
                selectNode(newNode.id, false); 
            } 
            return; 
        }
        // === 使用 useSelection Hook 的 deleteSelected ===
        if (e.key === 'Delete' || e.key === 'Backspace') { 
            if (selectedGroupId) { 
                e.preventDefault();
                saveHistory(); 
                
                // 找到组
                const group = groupsRef.current.find(g => g.id === selectedGroupId);
                if (group) {
                    // 找到组内的所有节点
                    // 性能优化：使用 Array.from(nodesRef.current.values()) 代替 nodesRef.current.filter()
                    const nodesInGroup = Array.from(nodesRef.current.values()).filter(n => { 
                        const w = n.width || 420; 
                        const h = getApproxNodeHeight(n); 
                        const cx = n.x + w/2; 
                        const cy = n.y + h/2; 
                        return cx > group.x && cx < group.x + group.width && cy > group.y && cy < group.y + group.height; 
                    });
                    
                    const nodeIdsToDelete = nodesInGroup.map(n => n.id);
                    
                    // 删除节点和相关连接
                    if (nodeIdsToDelete.length > 0) {
                        deleteNodesCallback(nodeIdsToDelete);
                        clearSelection(); // 清空选择
                    }
                    
                    // === 使用 Store 删除组 ===
                    useGroupStore.getState().deleteGroup(selectedGroupId); 
                    selectGroup(null); // 使用 Store 的方法
                }
                
                return; 
            } 
            
            // 使用 useSelection 的 deleteSelected（内部会调用 deleteNodes 并清空选择）
            if (selectedNodeIds.length > 0) { 
                e.preventDefault();
                deleteSelected(); 
            } 
        }
    };
    const handleKeyDownSpace = (e: KeyboardEvent) => { if (e.code === 'Space' && (e.target as HTMLElement).tagName !== 'INPUT' && (e.target as HTMLElement).tagName !== 'TEXTAREA') { document.body.classList.add('cursor-grab-override'); } };
    const handleKeyUpSpace = (e: KeyboardEvent) => { if (e.code === 'Space') { document.body.classList.remove('cursor-grab-override'); } };
    window.addEventListener('keydown', handleKeyDown); window.addEventListener('keydown', handleKeyDownSpace); window.addEventListener('keyup', handleKeyUpSpace);
    return () => { window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keydown', handleKeyDownSpace); window.removeEventListener('keyup', handleKeyUpSpace); };
  }, [selectedWorkflowId, selectedNodeIds, selectedGroupId, deleteNodesCallback, deleteSelected, clearSelection, undo, saveHistory, clipboard, selectNode, selectAll]);

  const handleCanvasDragOver = (e: React.DragEvent) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; };
  const handleCanvasDrop = (e: React.DragEvent) => {
      e.preventDefault();
      const dropX = (e.clientX - pan.x) / scale;
      const dropY = (e.clientY - pan.y) / scale;
      const assetData = e.dataTransfer.getData('application/json');
      const workflowId = e.dataTransfer.getData('application/workflow-id');

      if (workflowId && workflows) {
          const wf = workflows.find(w => w.id === workflowId);
          if (wf) {
              saveHistory();
              const minX = Math.min(...wf.nodes.map(n => n.x));
              const minY = Math.min(...wf.nodes.map(n => n.y));
              const width = Math.max(...wf.nodes.map(n => n.x + (n.width||420))) - minX;
              const height = Math.max(...wf.nodes.map(n => n.y + 320)) - minY;
              const offsetX = dropX - (minX + width/2);
              const offsetY = dropY - (minY + height/2);
              const idMap = new Map<string, string>();
              const newNodes = wf.nodes.map(n => { const newId = `n-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`; idMap.set(n.id, newId); return { ...n, id: newId, x: n.x + offsetX, y: n.y + offsetY, status: NodeStatus.IDLE, inputs: [] }; });
              newNodes.forEach((n, i) => { const original = wf.nodes[i]; n.inputs = original.inputs.map(oldId => idMap.get(oldId)).filter(Boolean) as string[]; });
              const newConnections = wf.connections.map(c => ({ from: idMap.get(c.from)!, to: idMap.get(c.to)! })).filter(c => c.from && c.to);
              const newGroups = (wf.groups || []).map(g => ({ ...g, id: `g-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, x: g.x + offsetX, y: g.y + offsetY }));
              // === 使用 Store 批量添加节点、连接和分组 ===
              useNodeStore.getState().addNodes(newNodes);
              newConnections.forEach(conn => {
                  useConnectionStore.getState().addConnection(conn);
              });
              newGroups.forEach(group => {
                  useGroupStore.getState().addGroup(group);
              });
          }
          return;
      }
      if (assetData) {
          try {
              const asset = JSON.parse(assetData);
              if (asset && asset.type) {
                  if (asset.type === 'image') addNode(NodeType.IMAGE_GENERATOR, dropX - 210, dropY - 180, { image: asset.src, prompt: asset.title });
                  else if (asset.type === 'video') addNode(NodeType.VIDEO_GENERATOR, dropX - 210, dropY - 180, { videoUri: asset.src });
              }
              return;
          } catch (err) { console.error("Drop failed", err); }
      }
      
      // Updated Multi-File Logic (9-Grid Support)
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          const files = Array.from(e.dataTransfer.files) as File[];
          const validFiles = files.filter(f => f.type.startsWith('image/') || f.type.startsWith('video/'));
          
          if (validFiles.length > 0) {
              const COLS = 3; 
              const GAP = 40;
              const BASE_WIDTH = 420;
              const BASE_HEIGHT = 450; 
              
              const startX = dropX - 210; 
              const startY = dropY - 180;

              validFiles.forEach((file, index) => {
                  const col = index % COLS;
                  const row = Math.floor(index / COLS);
                  
                  const xPos = startX + (col * (BASE_WIDTH + GAP));
                  const yPos = startY + (row * BASE_HEIGHT);

                  const reader = new FileReader();
                  reader.onload = (event) => {
                      const res = event.target?.result as string;
                      if (file.type.startsWith('image/')) {
                          addNode(NodeType.IMAGE_GENERATOR, xPos, yPos, { image: res, prompt: file.name, status: NodeStatus.SUCCESS });
                      } else if (file.type.startsWith('video/')) {
                          addNode(NodeType.VIDEO_GENERATOR, xPos, yPos, { videoUri: res, prompt: file.name, status: NodeStatus.SUCCESS });
                      }
                  };
                  reader.readAsDataURL(file);
              });
          }
      }
  };
  
  useEffect(() => {
      const style = document.createElement('style');
      style.innerHTML = ` .cursor-grab-override, .cursor-grab-override * { cursor: grab !important; } .cursor-grab-override:active, .cursor-grab-override:active * { cursor: grabbing !important; } `;
      document.head.appendChild(style);
      return () => { document.head.removeChild(style); };
  }, []);

  return (
    <div className="w-screen h-screen overflow-hidden bg-[#0a0a0c]">
      <div 
          id="canvas-container"
          className={`w-full h-full overflow-hidden text-slate-200 selection:bg-cyan-500/30 ${isDraggingCanvas ? 'cursor-grabbing' : 'cursor-default'}`}
          onMouseDown={handleCanvasMouseDown}
          onDoubleClick={(e) => { 
              // 在画布空白处双击时弹出菜单
              e.preventDefault(); 
              e.stopPropagation();
              setContextMenu({ visible: true, x: e.clientX, y: e.clientY, id: '' }); 
              setContextMenuTarget({ type: 'create' }); 
          }}
          onContextMenu={(e) => { e.preventDefault(); if(e.target === e.currentTarget) setContextMenu(null); }}
          onDragOver={handleCanvasDragOver} onDrop={handleCanvasDrop}
      >
          <div className="absolute inset-0 noise-bg" />
          <div className="absolute inset-0 pointer-events-none opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(circle, #aaa 1px, transparent 1px)', backgroundSize: `${32 * scale}px ${32 * scale}px`, backgroundPosition: `${pan.x}px ${pan.y}px` }} />

          <input type="file" ref={replaceVideoInputRef} className="hidden" accept="video/*" onChange={(e) => handleReplaceFile(e, 'video')} />
          <input type="file" ref={replaceImageInputRef} className="hidden" accept="image/*" onChange={(e) => handleReplaceFile(e, 'image')} />

          <div style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`, width: '100%', height: '100%', transformOrigin: '0 0' }} className="w-full h-full">
              {/* Groups Layer */}
              {groups.map(g => (
                  <div 
                      key={g.id} 
                      data-group-id={g.id}
                      className={`absolute rounded-[32px] border ${selectedGroupId === g.id ? 'border-cyan-500/30 bg-cyan-500/5' : 'border-white/10 bg-white/5'}`} 
                      style={{ 
                          left: g.x, 
                          top: g.y, 
                          width: g.width, 
                          height: g.height,
                          transition: 'all 0.3s cubic-bezier(0.32, 0.72, 0, 1)'
                      }} 
                      onMouseDown={(e) => {
                          e.stopPropagation();
                          selectGroup(g.id); // 使用 Store 的方法
                          startGroupDrag(e, g.id, g); // ✅ 调用 useGroup Hook 的方法
                      }}
                      onDoubleClick={(e) => e.stopPropagation()}
                      onContextMenu={e => { e.stopPropagation(); setContextMenu({visible:true, x:e.clientX, y:e.clientY, id:g.id}); setContextMenuTarget({type:'group', id:g.id}); }}
                  >
                      <div className="absolute -top-8 left-4 text-xs font-bold text-white/40 uppercase tracking-widest">{g.title}</div>
                  </div>
              ))}

              {/* Connections Layer */}
              <svg className="absolute top-0 left-0 w-full h-full overflow-visible pointer-events-none z-0" xmlns="http://www.w3.org/2000/svg" style={{ overflow: 'visible', pointerEvents: 'none', zIndex: 0 }}>
                  {connections.map((conn) => {
                      // 性能优化：使用 Map.get() 代替 Array.find()（O(n) → O(1)，快 100 倍）
                      const f = nodes.get(conn.from) as AppNode | undefined;
                      const t = nodes.get(conn.to) as AppNode | undefined;
                      if (!f || !t) return null;
                      const fHeight = f.height || getApproxNodeHeight(f); const tHeight = t.height || getApproxNodeHeight(t);
                      const fWidth = f.width || 420; const tWidth = t.width || 420;
                      
                      // 端口精确位置计算：
                      // 输出端口：-right-3 = right: -0.75rem = -12px，端口 w-4 h-4 = 16px
                      // 端口左边缘在：节点右边缘 + 12px，端口中心在：节点右边缘 + 12px - 8px = +4px
                      const fx = f.x + fWidth + 4;
                      const fy = f.y + fHeight/2;
                      
                      // 输入端口：-left-3 = left: -0.75rem = -12px，端口 w-4 h-4 = 16px
                      // 端口左边缘在：节点左边缘 - 12px，端口中心在：节点左边缘 - 12px + 8px = -4px
                      const tx = t.x - 4;
                      let ty = t.y + tHeight/2;
                      
                      if (Math.abs(fy - ty) < 0.5) ty += 0.5;
                      if (isNaN(fx) || isNaN(fy) || isNaN(tx) || isNaN(ty)) return null;
                      
                      // 计算水平距离，用于调整控制点
                      const dx = tx - fx;
                      const controlOffset = Math.min(Math.abs(dx) * 0.6, 200);
                      
                      // 贝塞尔曲线：使用更自然的控制点
                      const d = `M ${fx} ${fy} C ${fx + controlOffset} ${fy}, ${tx - controlOffset} ${ty}, ${tx} ${ty}`;
                      
                      return (
                          <g key={`${conn.from}-${conn.to}`} className="pointer-events-auto group/line">
                              {/* 主连接线 */}
                              <path 
                                  d={d} 
                                  stroke="rgba(255,255,255,0.25)" 
                                  strokeWidth="2.5" 
                                  fill="none" 
                                  strokeLinecap="round"
                                  className="transition-all duration-200 group-hover/line:stroke-white group-hover/line:stroke-opacity-70 group-hover/line:stroke-[3]" 
                              />
                              {/* 透明的宽线用于鼠标交互 */}
                              <path 
                                  d={d} 
                                  stroke="transparent" 
                                  strokeWidth="20" 
                                  fill="none" 
                                  style={{ cursor: 'pointer' }} 
                                  onContextMenu={(e) => { 
                                      e.preventDefault(); 
                                      e.stopPropagation(); 
                                      setContextMenu({ visible: true, x: e.clientX, y: e.clientY, id: `${conn.from}-${conn.to}` }); 
                                      setContextMenuTarget({ type: 'connection', from: conn.from, to: conn.to }); 
                                  }} 
                              />
                          </g>
                      );
                  })}
                  {connectionStart && (() => {
                      let startX = 0, startY = 0;
                      if (connectionStart.id === 'smart-sequence-dock') {
                          startX = (connectionStart.x - pan.x) / scale; 
                          startY = (connectionStart.y - pan.y) / scale;
                      } else {
                          // 性能优化：使用 Map.get() 代替 Array.find()
                          const startNode = nodes.get(connectionStart.id) as AppNode | undefined;
                          if (!startNode) return null;
                          const startHeight = startNode.height || getApproxNodeHeight(startNode);
                          const startWidth = startNode.width || 420;
                          
                          // 根据 portType 确定起点位置（精确到端口中心）
                          if (connectionStart.portType === 'input') {
                              // 输入端口中心：节点左边缘 - 4px
                              startX = startNode.x - 4;
                              startY = startNode.y + startHeight / 2;
                          } else {
                              // 输出端口中心：节点右边缘 + 4px
                              startX = startNode.x + startWidth + 4;
                              startY = startNode.y + startHeight / 2;
                          }
                      }
                      
                      const endX = (mousePos.x - pan.x) / scale; 
                      const endY = (mousePos.y - pan.y) / scale;
                      
                      // 计算控制点偏移
                      const dx = endX - startX;
                      const controlOffset = Math.min(Math.abs(dx) * 0.6, 200);
                      
                      // 使用贝塞尔曲线让连接线更流畅
                      const d = `M ${startX} ${startY} C ${startX + controlOffset} ${startY}, ${endX - controlOffset} ${endY}, ${endX} ${endY}`;
                      
                      return (
                          <path 
                              d={d} 
                              stroke="rgba(255,255,255,0.4)" 
                              strokeWidth="2.5" 
                              fill="none" 
                              strokeLinecap="round"
                              className="pointer-events-none"
                          />
                      );
                  })()}
              </svg>

              {/* 性能优化：使用 useMemo 缓存 inputAssets，让 React.memo 生效 */}
              {useMemo(() => {
                  const nodeArray = Array.from(nodes.values());
                  
                  // 为每个节点预计算 inputAssets（缓存引用）
                  const nodeInputAssetsCache = new Map<string, any[]>();
                  nodeArray.forEach(node => {
                      const inputAssets = node.inputs
                          .map(i => nodes.get(i) as AppNode | undefined)
                          .filter(n => n && (n.data.image || n.data.videoUri || n.data.croppedFrame))
                          .slice(0, 6)
                          .map(n => ({ 
                              id: n!.id, 
                              type: (n!.data.croppedFrame || n!.data.image) ? 'image' as const : 'video' as const, 
                              src: n!.data.croppedFrame || n!.data.image || n!.data.videoUri! 
                          }));
                      nodeInputAssetsCache.set(node.id, inputAssets);
                  });
                  
                  return nodeArray.map(node => {
                      return (
              <Node
                  key={node.id} 
                  node={node} 
                  onUpdate={handleNodeUpdate} 
                  onAction={handleNodeAction} 
                  onCreateWorkflow={createWorkflowFromScript}
                  onDelete={(id) => deleteNodesCallback([id])} 
                  onExpand={setExpandedMedia} 
                  onCrop={(id, img) => { setCroppingNodeId(id); setImageToCrop(img); }}
                  onNodeMouseDown={(e, id) => { 
                      e.stopPropagation(); 
                      // === 使用 useSelection Hook 的 selectNode ===
                      selectNode(id, e.shiftKey || e.metaKey || e.ctrlKey);
                      
                      // === 使用 useDrag Hook 的 handleMouseDown ===
                      const node = nodes.get(id);
                      if (node) {
                          // 计算父 Group 和兄弟节点
                          const w = node.width || 420;
                          const h = node.height || getApproxNodeHeight(node);
                          const cx = node.x + w / 2;
                          const cy = node.y + 160;
                          const parentGroup = groups.find(g => {
                              return cx > g.x && cx < g.x + g.width && cy > g.y && cy < g.y + g.height;
                          });
                          
                          let siblingNodeIds: string[] = [];
                          if (parentGroup) {
                              siblingNodeIds = Array.from(nodes.values())
                                  .filter(other => {
                                      if (other.id === id) return false;
                                      const ow = other.width || 420;
                                      const oh = getApproxNodeHeight(other);
                                      const ocx = other.x + ow / 2;
                                      const ocy = other.y + oh / 2;
                                      return ocx > parentGroup.x && ocx < parentGroup.x + parentGroup.width &&
                                             ocy > parentGroup.y && ocy < parentGroup.y + parentGroup.height;
                                  })
                                  .map(s => s.id);
                          }
                          
                          handleNodeDragStart(e, id, node, parentGroup?.id, siblingNodeIds);
                      }
                  }}
                  onPortMouseDown={(e, id, type) => { 
                      e.stopPropagation(); 
                      // 使用 Hook 的 startConnection 方法
                      startConnection(id, e.clientX, e.clientY, type); 
                  }}
                  onPortMouseUp={(e, id, type) => { 
                      e.stopPropagation(); 
                      const start = connectionStartRef.current; 
                      if (start && start.id !== id) {
                          if (start.id === 'smart-sequence-dock') { 
                              // Smart sequence dock 连接逻辑
                              cancelConnection();
                          } else { 
                              // 建立连接：根据拖拽方向确定 from 和 to
                              let fromId = start.id;
                              let toId = id;
                              
                              // 如果从输入端口拖拽，需要反转方向
                              if (start.portType === 'input') {
                                  // 从输入端口拖拽到输出端口：反转连接方向
                                  if (type === 'output') {
                                      fromId = id;
                                      toId = start.id;
                                  }
                              }
                              
                              const isValidConnection = 
                                  (start.portType === 'output' && type === 'input') ||
                                  (start.portType === 'input' && type === 'output');
                              
                              if (isValidConnection) {
                                  // === 使用 Store 添加连接 ===
                                  useConnectionStore.getState().addConnection({ from: fromId, to: toId });
                                  
                                  // === 使用 Store 更新节点输入 ===
                                  const targetNode = useNodeStore.getState().getNode(toId);
                                  if (targetNode) {
                                      useNodeStore.getState().updateNodeInputs(toId, [...targetNode.inputs, fromId]);
                                  }
                                  
                                  // 成功连接后清除状态
                                  cancelConnection();
                              }
                          }
                      } 
                      // 注意：不要在这里清除 connectionStart，让 handleGlobalMouseUp 处理未连接的情况
                  }}
                  onNodeContextMenu={(e, id) => { e.stopPropagation(); e.preventDefault(); setContextMenu({ visible: true, x: e.clientX, y: e.clientY, id }); setContextMenuTarget({ type: 'node', id }); }}
                  onResizeMouseDown={(e, id, w, h) => { 
                      e.stopPropagation(); const n = nodes.get(id) as AppNode | undefined; // 使用 Map.get() 代替 Array.find()
                      if (n) {
                          const cx = n.x + w/2; const cy = n.y + 160; 
                          const pGroup = groups.find(g => { return cx > g.x && cx < g.x + g.width && cy > g.y && cy < g.y + g.height; });
                          let siblingNodeIds: string[] = [];
                          if (pGroup) { siblingNodeIds = Array.from(nodes.values()).filter(other => { if (other.id === id) return false; const b = getNodeBounds(other); const ocx = b.x + b.width/2; const ocy = b.y + b.height/2; return ocx > pGroup.x && ocx < pGroup.x + pGroup.width && ocy > pGroup.y && ocy < pGroup.y + pGroup.height; }).map(s => s.id); }
                          
                          // 性能优化：缓存 DOM 元素
                          const element = document.querySelector(`[data-node-id="${id}"]`) as HTMLElement;
                          resizeContextRef.current = { nodeId: id, initialWidth: w, initialHeight: h, startX: e.clientX, startY: e.clientY, parentGroupId: pGroup?.id || null, siblingNodeIds, element };
                      }
                      setResizingNodeId(id); setInitialSize({ width: w, height: h }); setResizeStartPos({ x: e.clientX, y: e.clientY }); 
                  }}
                  isSelected={selectedNodeIds.includes(node.id)} 
                  inputAssets={nodeInputAssetsCache.get(node.id) || []}
                  onInputReorder={(nodeId, newOrder) => { 
                      // === 使用 Store 更新节点输入顺序 ===
                      useNodeStore.getState().updateNodeInputs(nodeId, newOrder);
                  }}
                  isDragging={isDraggingNode} isResizing={resizingNodeId === node.id} isConnecting={!!connectionStart} isGroupDragging={false}
              />
              );
                  });
              }, [nodes, selectedNodeIds, resizingNodeId, connectionStart, handleNodeUpdate, handleNodeAction, createWorkflowFromScript, deleteNodesCallback, setExpandedMedia, setCroppingNodeId, setImageToCrop, startConnection, cancelConnection, setConnections, setNodes, setContextMenu, setContextMenuTarget, setResizingNodeId, setInitialSize, setResizeStartPos, groups, isDraggingNode, isDraggingGroup])}

              {selectionRect && <div className="absolute border border-cyan-500/40 bg-cyan-500/10 rounded-lg pointer-events-none" style={{ left: (Math.min(selectionRect.startX, selectionRect.currentX) - pan.x) / scale, top: (Math.min(selectionRect.startY, selectionRect.currentY) - pan.y) / scale, width: Math.abs(selectionRect.currentX - selectionRect.startX) / scale, height: Math.abs(selectionRect.currentY - selectionRect.startY) / scale }} />}
          </div>

          {contextMenu && (
              <div className="fixed z-[100] bg-[#2c2c2e]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-1 min-w-[140px] animate-in fade-in zoom-in-95 duration-200 origin-top-left" style={{ top: contextMenu.y, left: contextMenu.x }} onMouseDown={(e) => e.stopPropagation()}>
                  {contextMenuTarget?.type === 'node' && (
                      <>
                          <button className="w-full text-left px-3 py-1.5 text-[11px] font-medium text-white/90 hover:bg-cyan-500/20 hover:text-cyan-300 rounded-lg flex items-center gap-2 transition-colors" onClick={() => { const targetNode = nodes.get(contextMenu.id) as AppNode | undefined; if (targetNode) setClipboard(JSON.parse(JSON.stringify(targetNode))); setContextMenu(null); }}>
                              <Copy size={12} /> 复制节点
                          </button>
                          {(() => { const targetNode = nodes.get(contextMenu.id) as AppNode | undefined; if (targetNode) { const isVideo = targetNode.type === NodeType.VIDEO_GENERATOR || targetNode.type === NodeType.VIDEO_ANALYZER; const isImage = targetNode.type === NodeType.IMAGE_GENERATOR || targetNode.type === NodeType.IMAGE_EDITOR; if (isVideo || isImage) { return ( <button className="w-full text-left px-3 py-1.5 text-[11px] font-medium text-white/90 hover:bg-purple-500/20 hover:text-purple-300 rounded-lg flex items-center gap-2 transition-colors" onClick={() => { replacementTargetRef.current = contextMenu.id; if (isVideo) replaceVideoInputRef.current?.click(); else replaceImageInputRef.current?.click(); setContextMenu(null); }}> <RefreshCw size={12} /> 替换素材 </button> ); } } return null; })()}
                          <button className="w-full text-left px-3 py-1.5 text-[11px] font-medium text-red-400 hover:bg-red-500/20 rounded-lg flex items-center gap-2 transition-colors mt-0.5" onClick={() => { deleteNodesCallback([contextMenuTarget.id]); setContextMenu(null); }}><Trash2 size={12} /> 删除节点</button>
                      </>
                  )}
                  {contextMenuTarget?.type === 'create' && (
                      <>
                          <div className="px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-white/30">基础节点</div>
                          {[NodeType.PROMPT_INPUT, NodeType.IMAGE_GENERATOR, NodeType.VIDEO_GENERATOR].map(t => { const ItemIcon = getNodeIcon(t); return ( <button key={t} className="w-full text-left px-3 py-1.5 text-[11px] font-medium text-white/90 hover:bg-white/10 rounded-lg flex items-center gap-2 transition-colors" onClick={() => { addNode(t, (contextMenu.x-pan.x)/scale, (contextMenu.y-pan.y)/scale); setContextMenu(null); }}> <ItemIcon size={13} className="text-cyan-400" /> {getNodeNameCN(t)} </button> ); })}
                          <div className="px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-white/30 mt-1 border-t border-white/5 pt-1.5">故事创作</div>
                          {[NodeType.STORY_STUDIO, NodeType.CHARACTER_REFERENCE, NodeType.SCENE_REFERENCE, NodeType.STORYBOARD_SHOT].map(t => { const ItemIcon = getNodeIcon(t); return ( <button key={t} className="w-full text-left px-3 py-1.5 text-[11px] font-medium text-white/90 hover:bg-white/10 rounded-lg flex items-center gap-2 transition-colors" onClick={() => { addNode(t, (contextMenu.x-pan.x)/scale, (contextMenu.y-pan.y)/scale); setContextMenu(null); }}> <ItemIcon size={13} className="text-purple-400" /> {getNodeNameCN(t)} </button> ); })}
                          <div className="px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-white/30 mt-1 border-t border-white/5 pt-1.5">高级工具</div>
                          {[NodeType.MULTI_ANGLE_CAMERA, NodeType.GRID_SPLITTER].map(t => { const ItemIcon = getNodeIcon(t); return ( <button key={t} className="w-full text-left px-3 py-1.5 text-[11px] font-medium text-white/90 hover:bg-white/10 rounded-lg flex items-center gap-2 transition-colors" onClick={() => { addNode(t, (contextMenu.x-pan.x)/scale, (contextMenu.y-pan.y)/scale); setContextMenu(null); }}> <ItemIcon size={13} className="text-pink-400" /> {getNodeNameCN(t)} </button> ); })}
                      </>
                  )}
                  {contextMenuTarget?.type === 'smart-connect' && (
                      <>
                          <div className="px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-white/30 flex items-center gap-1.5">
                              <Sparkles size={9} className="text-cyan-400" />
                              {contextMenuTarget.portType === 'output' ? '连接到' : '从此连接'}
                          </div>
                          {contextMenuTarget.compatibleTypes?.map((t: NodeType) => { 
                              const ItemIcon = getNodeIcon(t); 
                              return ( 
                                  <button 
                                      key={t} 
                                      className="w-full text-left px-3 py-1.5 text-[11px] font-medium text-white/90 hover:bg-cyan-500/20 hover:text-cyan-300 rounded-lg flex items-center gap-2 transition-colors" 
                                      onClick={() => { 
                                          const nodeX = (contextMenu.x - pan.x) / scale;
                                          const nodeY = (contextMenu.y - pan.y) / scale;
                                          
                                          // === 使用 NodeRegistry 创建节点 ===
                                          const newNode = nodeRegistry.createNode(t, {
                                              x: nodeX,
                                              y: nodeY,
                                          });
                                          
                                          if (!newNode) {
                                              console.error(`无法创建节点类型: ${t}`);
                                              setContextMenu(null);
                                              return;
                                          }
                                          
                                          // === 使用 Store 添加节点 ===
                                          useNodeStore.getState().addNode(newNode);
                                          
                                          // 根据拖拽方向建立连接
                                          if (contextMenuTarget.portType === 'output') {
                                              // 从输出拖拽 → 源节点连接到新节点
                                              useConnectionStore.getState().addConnection({ from: contextMenuTarget.sourceNodeId, to: newNode.id });
                                          } else {
                                              // 从输入拖拽 → 新节点连接到源节点
                                              useConnectionStore.getState().addConnection({ from: newNode.id, to: contextMenuTarget.sourceNodeId });
                                              
                                              // === 使用 Store 更新源节点的输入 ===
                                              const sourceNode = useNodeStore.getState().getNode(contextMenuTarget.sourceNodeId);
                                              if (sourceNode) {
                                                  useNodeStore.getState().updateNodeInputs(contextMenuTarget.sourceNodeId, [...sourceNode.inputs, newNode.id]);
                                              }
                                          }
                                          
                                          saveHistory();
                                          setContextMenu(null); 
                                      }}
                                  > 
                                      <ItemIcon size={13} className="text-cyan-400" /> 
                                      {getNodeNameCN(t)} 
                                  </button> 
                              ); 
                          })}
                      </>
                  )}
                  {contextMenuTarget?.type === 'group' && (
                      <>
                           <button className="w-full text-left px-3 py-1.5 text-[11px] font-medium text-white/90 hover:bg-white/10 rounded-lg flex items-center gap-2 transition-colors mb-0.5" onClick={() => { saveGroupAsWorkflow(contextMenu.id); setContextMenu(null); }}> <FolderHeart size={12} className="text-cyan-400" /> 保存为工作流 </button>
                           <button className="w-full text-left px-3 py-1.5 text-[11px] font-medium text-red-400 hover:bg-red-500/20 rounded-lg flex items-center gap-2 transition-colors" onClick={() => { 
                               // === 使用 Store 删除分组 ===
                               useGroupStore.getState().deleteGroup(contextMenu.id); 
                               setContextMenu(null); 
                           }}> <Trash2 size={12} /> 删除分组 </button>
                      </>
                  )}
                  {contextMenuTarget?.type === 'connection' && (
                      <button className="w-full text-left px-3 py-1.5 text-[11px] font-medium text-red-400 hover:bg-red-500/20 rounded-lg flex items-center gap-2 transition-colors" onClick={() => {
                          // === 使用 Store 删除连接 ===
                          useConnectionStore.getState().deleteConnection(contextMenuTarget.from, contextMenuTarget.to);
                          
                          // === 使用 Store 更新节点输入 ===
                          const targetNode = useNodeStore.getState().getNode(contextMenuTarget.to);
                          if (targetNode) {
                              useNodeStore.getState().updateNodeInputs(contextMenuTarget.to, targetNode.inputs.filter(i => i !== contextMenuTarget.from));
                          }
                          
                          setContextMenu(null);
                      }}>
                          <Unplug size={12} /> 删除连接线
                      </button>
                  )}
              </div>
          )}
          
          {croppingNodeId && imageToCrop && <ImageCropper imageSrc={imageToCrop} onCancel={() => {setCroppingNodeId(null); setImageToCrop(null);}} onConfirm={(b) => {handleNodeUpdate(croppingNodeId, {croppedFrame: b}); setCroppingNodeId(null); setImageToCrop(null);}} />}
          <ExpandedView media={expandedMedia} onClose={() => setExpandedMedia(null)} />
          {isSketchEditorOpen && <SketchEditor onClose={() => setSketchEditorOpen(false)} onGenerate={handleSketchResult} />}
          <SmartSequenceDock 
             isOpen={isMultiFrameOpen} 
             onClose={() => setMultiFrameOpen(false)} 
             onGenerate={handleMultiFrameGenerate}
             onConnectStart={(e, type) => { 
                 e.preventDefault(); 
                 e.stopPropagation(); 
                 // 使用 Hook 的 startConnection 方法
                 startConnection('smart-sequence-dock', e.clientX, e.clientY); 
             }}
          />
          <SonicStudio 
            isOpen={isSonicStudioOpen}
            onClose={() => setSonicStudioOpen(false)}
            history={assetHistory.filter(a => a.type === 'audio')}
            onGenerate={(src, prompt) => handleAssetGenerated('audio', src, prompt)}
          />
          <SettingsModal isOpen={isSettingsOpen} onClose={() => setSettingsOpen(false)} />

          <SidebarDock 
              onAddNode={addNode}
              onUndo={undo}
              isChatOpen={isChatOpen}
              onToggleChat={() => setChatOpen(!isChatOpen)}
              isMultiFrameOpen={isMultiFrameOpen}
              onToggleMultiFrame={() => setMultiFrameOpen(!isMultiFrameOpen)}
              isSonicStudioOpen={isSonicStudioOpen}
              onToggleSonicStudio={() => setSonicStudioOpen(!isSonicStudioOpen)}
              assetHistory={assetHistory}
              onHistoryItemClick={(item) => { const type = item.type.includes('image') ? NodeType.IMAGE_GENERATOR : NodeType.VIDEO_GENERATOR; const data = item.type === 'image' ? { image: item.src } : { videoUri: item.src }; addNode(type, undefined, undefined, data); }}
              onDeleteAsset={(id) => setAssetHistory(prev => prev.filter(a => a.id !== id))}
              onDownloadSelectedAndClear={downloadSelectedImagesAndClear}
              workflows={workflows}
              selectedWorkflowId={selectedWorkflowId}
              onSelectWorkflow={loadWorkflow}
              onSaveWorkflow={saveCurrentAsWorkflow}
              onDeleteWorkflow={deleteWorkflow}
              onRenameWorkflow={renameWorkflow}
              onOpenSettings={() => setSettingsOpen(true)}
              selectedGroupId={selectedGroupId}
              onArrangeGroup={handleArrangeGroup}
          />

          <AssistantPanel isOpen={isChatOpen} onClose={() => setChatOpen(false)} />

          <div className="absolute bottom-8 right-8 flex items-center gap-3 px-4 py-2 bg-[#1c1c1e]/80 backdrop-blur-2xl border border-white/10 rounded-full shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <button onClick={zoomOut} className="p-1.5 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-white/10"><Minus size={14} strokeWidth={3} /></button>
              <div className="flex items-center gap-2 min-w-[100px]">
                   <input type="range" min="0.2" max="3" step="0.1" value={scale} onChange={(e) => setScale(parseFloat(e.target.value))} className="w-24 h-1 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-lg hover:[&::-webkit-slider-thumb]:scale-125 transition-all" />
                   <span className="text-[10px] font-bold text-slate-400 w-8 text-right tabular-nums cursor-pointer hover:text-white" onClick={resetView} title="Reset Zoom">{Math.round(scale * 100)}%</span>
              </div>
              <button onClick={zoomIn} className="p-1.5 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-white/10"><Plus size={14} strokeWidth={3} /></button>
              <button onClick={fitView} className="p-1.5 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-white/10 ml-2 border-l border-white/10 pl-3" title="适配视图">
                  <Scan size={14} strokeWidth={3} />
              </button>
          </div>
      </div>
    </div>
  );
};
