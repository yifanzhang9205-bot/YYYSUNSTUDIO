/**
 * ⚠️⚠️⚠️ 超级警告：App.tsx 是高优先级保护区！⚠️⚠️⚠️
 * 
 * 🚫🚫🚫 禁止在此文件添加任何业务逻辑！🚫🚫🚫
 * 
 * 📋 App.tsx 的唯一职责：
 * 1. 初始化（useEffect 初始化 Registry）
 * 2. 获取数据（从 Stores 获取）
 * 3. 使用 Hooks（调用 hooks/）
 * 4. 渲染组件（组合 components/）
 * 
 * ❌ 禁止的操作：
 * - 添加新的 useCallback（业务逻辑应该在 hooks/）
 * - 添加新的 useState（UI 状态应该在 stores/uiStore.ts）
 * - 添加新的 switch-case（节点逻辑应该在 NodeRegistry）
 * - 添加新的事件处理（应该在对应的 Hook）
 * - 修改 handleNodeAction（这是遗留代码，应该重构到 hooks/useNodeActions.ts）
 * 
 * ✅ 正确的做法：
 * - 新节点类型 → core/registry/NodeRegistry.ts
 * - 新交互逻辑 → hooks/useXxx.ts
 * - 新 UI 状态 → core/stores/uiStore.ts
 * - 新业务逻辑 → hooks/useNodeActions.ts（待创建）
 * - 新右键菜单 → hooks/useContextMenu.ts（待创建）
 * - 新图片处理 → hooks/useMediaOverlay.ts（待创建）
 * 
 * 📖 详细规则：
 * - ARCHITECTURE.md（架构文档，必读）
 * - .kiro/steering/project-onboarding.md（入职规则，必读）
 * - .kiro/specs/canvas-architecture-refactor/requirements.md（重构需求，必读）
 * 
 * 🤖 如果你是 AI，看到这个警告后：
 * 1. 立即停止修改 App.tsx
 * 2. 重新思考：这个改动应该放在哪里？
 * 3. 查看 ARCHITECTURE.md，找到正确的位置
 * 4. 如果确实需要改 App.tsx，先向用户说明原因，等待确认
 * 
 * 🔥 当前状态：
 * - 文件行数：2354 行（目标：200 行以内）
 * - 问题：包含大量业务逻辑（handleNodeAction 400+ 行）
 * - 重构进度：70%（Hooks 已抽离，但业务逻辑未抽离）
 * 
 * 🎯 下一步重构计划：
 * 1. 创建 hooks/useNodeActions.ts，抽离 handleNodeAction
 * 2. 创建 hooks/useContextMenu.ts，抽离右键菜单逻辑
 * 3. 创建 hooks/useMediaOverlay.ts，抽离图片预览/裁剪逻辑
 * 4. 创建 hooks/useGlobalEvents.ts，抽离全局事件处理
 * 5. 最终目标：App.tsx 只做组合和配置，不包含业务逻辑
 * 
 * ⚠️ 如果你要修改 App.tsx，必须回答：
 * 1. 为什么必须改 App.tsx？
 * 2. 不改 App.tsx 有其他方案吗？
 * 3. 这属于允许的情况吗？（架构调整/重构/紧急修复/用户明确要求）
 * 4. 改了会有什么影响？
 * 5. 用户同意了吗？
 * 
 * 💡 为什么 AI 总是想改 App.tsx？
 * 1. App.tsx 仍然包含大量业务逻辑（handleNodeAction 400+ 行）
 * 2. 代码模式"诱导" AI（集中式的 Handler、State、Event）
 * 3. 重构未完成（70% 完成度，业务逻辑未抽离）
 * 4. AI 的惯性思维（看到逻辑在 App.tsx，就觉得新逻辑也应该在这里）
 * 
 * 🛑 记住：App.tsx 是高优先级保护区，轻易不能动！
 *//**
 * ⚠️⚠️⚠️ 超级警告：App.tsx 是高优先级保护区！⚠️⚠️⚠️
 * 
 * 🚫🚫🚫 禁止在此文件添加任何业务逻辑！🚫🚫🚫
 * 
 * 📋 App.tsx 的唯一职责：
 * 1. 初始化（useEffect 初始化 Registry）
 * 2. 获取数据（从 Stores 获取）
 * 3. 使用 Hooks（调用 hooks/）
 * 4. 渲染组件（组合 components/）
 * 
 * ❌ 禁止的操作：
 * - 添加新的 useCallback（业务逻辑应该在 hooks/）
 * - 添加新的 useState（UI 状态应该在 stores/uiStore.ts）
 * - 添加新的 switch-case（节点逻辑应该在 NodeRegistry）
 * - 添加新的事件处理（应该在对应的 Hook）
 * - 修改 handleNodeAction（这是遗留代码，应该重构到 hooks/useNodeActions.ts）
 * 
 * ✅ 正确的做法：
 * - 新节点类型 → core/registry/NodeRegistry.ts
 * - 新交互逻辑 → hooks/useXxx.ts
 * - 新 UI 状态 → core/stores/uiStore.ts
 * - 新业务逻辑 → hooks/useNodeActions.ts（待创建）
 * - 新右键菜单 → hooks/useContextMenu.ts（待创建）
 * - 新图片处理 → hooks/useMediaOverlay.ts（待创建）
 * 
 * 📖 详细规则：
 * - ARCHITECTURE.md（架构文档，必读）
 * - .kiro/steering/project-onboarding.md（入职规则，必读）
 * - .kiro/specs/canvas-architecture-refactor/requirements.md（重构需求，必读）
 * 
 * 🤖 如果你是 AI，看到这个警告后：
 * 1. 立即停止修改 App.tsx
 * 2. 重新思考：这个改动应该放在哪里？
 * 3. 查看 ARCHITECTURE.md，找到正确的位置
 * 4. 如果确实需要改 App.tsx，先向用户说明原因，等待确认
 * 
 * 🔥 当前状态：
 * - 文件行数：2354 行（目标：200 行以内）
 * - 问题：包含大量业务逻辑（handleNodeAction 400+ 行）
 * - 重构进度：70%（Hooks 已抽离，但业务逻辑未抽离）
 * 
 * 🎯 下一步重构计划：
 * 1. 创建 hooks/useNodeActions.ts，抽离 handleNodeAction
 * 2. 创建 hooks/useContextMenu.ts，抽离右键菜单逻辑
 * 3. 创建 hooks/useMediaOverlay.ts，抽离图片预览/裁剪逻辑
 * 4. 创建 hooks/useGlobalEvents.ts，抽离全局事件处理
 * 5. 最终目标：App.tsx 只做组合和配置，不包含业务逻辑
 * 
 * ⚠️ 如果你要修改 App.tsx，必须回答：
 * 1. 为什么必须改 App.tsx？
 * 2. 不改 App.tsx 有其他方案吗？
 * 3. 这属于允许的情况吗？（架构调整/重构/紧急修复/用户明确要求）
 * 4. 改了会有什么影响？
 * 5. 用户同意了吗？
 * 
 * 💡 为什么 AI 总是想改 App.tsx？
 * 1. App.tsx 仍然包含大量业务逻辑（handleNodeAction 400+ 行）
 * 2. 代码模式"诱导" AI（集中式的 Handler、State、Event）
 * 3. 重构未完成（70% 完成度，业务逻辑未抽离）
 * 4. AI 的惯性思维（看到逻辑在 App.tsx，就觉得新逻辑也应该在这里）
 * 
 * 🛑 记住：App.tsx 是高优先级保护区，轻易不能动！
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Node } from './components/Node';
import { SidebarDock } from './components/SidebarDock';
import { AssistantPanel } from './components/AssistantPanel';
import { ImageCropper } from './components/ImageCropper';
import { SketchEditor } from './components/SketchEditor'; 
import { SmartSequenceDock } from './components/SmartSequenceDock';
import { SonicStudio } from './components/SonicStudio'; 
import { SettingsModal } from './components/SettingsModal';
import { GroupToolbar } from './components/GroupToolbar';
import { Minimap } from './components/Minimap'; // 🔥 新增：小地图组件
import { AppNode, NodeType, NodeStatus, Connection, ContextMenuState, Group, Workflow, SmartSequenceItem } from './types';
import { generateImageFromText, generateVideo, analyzeVideo, editImageWithText, planStoryboard, orchestrateVideoPrompt, compileMultiFramePrompt, extractLastFrame, generateAudio } from './services/geminiService';
import { generateImage as generateNanoBananaImage } from './services/nanoBananaService';
import { getGenerationStrategy } from './services/videoStrategies';
import { saveToStorage, loadFromStorage } from './services/storage';
import { 
    Plus, Copy, Trash2, Type, Image as ImageIcon, Video as VideoIcon, 
    ScanFace, Brush, MousePointerClick, LayoutTemplate, X, Film, Link, RefreshCw, Upload,
    Minus, FolderHeart, Unplug, Sparkles, ChevronLeft, ChevronRight, Scan, Music, Mic2, Grid3X3, Maximize2, Network
} from 'lucide-react';

// 引入 Hooks（架构重构 - 阶段 A - 第 3 步）
import { useDrag } from './hooks/useDrag';
import { useSelection } from './hooks/useSelection';
import { useViewport } from './hooks/useViewport';
import { useConnection } from './hooks/useConnection';
import { useGroup } from './hooks/useGroup';
import { useHistory } from './hooks/useHistory';

// 引入新的业务逻辑 Hooks（架构重构 - 业务逻辑抽离）
import { useNodeHelpers } from './hooks/useNodeHelpers';
import { useAssetHistory } from './hooks/useAssetHistory';
import { useUIState } from './hooks/useUIState';
import { useNodeActions } from './hooks/useNodeActions'; // 🔥 新增：节点操作 Hook
import { useContextMenu } from './hooks/useContextMenu'; // 🔥 新增：上下文菜单 Hook（架构重构）

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

  // === 使用新的业务逻辑 Hooks（架构重构 - 业务逻辑抽离）===
  // ⚠️ 必须最先调用 useNodeHelpers，因为其他 Hook 依赖 getApproxNodeHeight
  const { 
    getApproxNodeHeight, 
    getNodeBounds, 
    getNodeNameCN, 
    getNodeIcon 
  } = useNodeHelpers();

  const { 
    handleAssetGenerated, 
    handleDeleteAsset,
    handleDeleteMultipleAssets,
    downloadSelectedImagesAndClear 
  } = useAssetHistory();

  // === 架构重构：使用 useContextMenu Hook（上下文菜单逻辑抽离）===
  const { 
    contextMenu, 
    contextMenuTarget, 
    openContextMenu, 
    closeContextMenu,
    menuItems: getMenuItemsFromRegistry, // 🔥 从 NodeRegistry 获取菜单项
  } = useContextMenu();

  const { 
    expandedMedia, 
    openMedia, 
    closeMedia,
    croppingNodeId, 
    imageToCrop, 
    startCrop, 
    endCrop 
  } = useUIState();

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
    setPan, // 🔥 新增：用于小地图跳转
  } = useViewport({
    nodes,
    getNodeHeight: getApproxNodeHeight, // ✅ 直接使用 getApproxNodeHeight
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
    resizingGroupId,
    isDraggingGroup,
    getNodeGroup,
    getGroupNodes,
    startGroupDrag,
    updateGroupDrag,
    endGroupDrag,
    cancelGroupDrag,
    alignLeft,
    alignCenterH,
    alignRight,
    alignTop,
    alignCenterV,
    alignBottom,
    distributeH,
    distributeV,
    arrangeTopology,
    scaleNodes,
    createGroup,
    deleteGroup: deleteGroupFromHook,
    deleteGroupWithNodes, // 新增：删除分组及其节点
    updateGroupTitle,
    toggleCollapse,
    isCollapsed,
    startGroupResize,
    endGroupResize,
    expandOrCreateGroup, // 新增：动态扩展组或创建新组
  } = useGroup({
    groups,
    nodes,
    connections,
    scale,
    onAddGroup: (group) => {
      useGroupStore.getState().addGroup(group);
    },
    onUpdateGroup: (id, updates) => {
      useGroupStore.getState().updateGroup(id, updates);
    },
    onDeleteGroup: (id) => {
      useGroupStore.getState().deleteGroup(id);
    },
    onUpdateNode: (id, updates) => {
      useNodeStore.getState().updateNode(id, updates);
    },
    onSaveHistory: saveHistory,
    getApproxNodeHeight,
  });

  // === 架构重构：使用 useSelection Hook（必须在 useGroup 之后）===
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
    onExpandOrCreateGroup: expandOrCreateGroup, // 传递 expandOrCreateGroup 方法
  });

  // === 架构重构：使用 useDrag Hook（阶段 A - 第 4 步）===
  // 🆕 集成 Helper Lines（辅助线 + 吸附）
  const {
    handleMouseDown: handleNodeDragStart,
    cancelDrag,
    isDragging: isDraggingNode,
    helperLines, // 🆕 获取辅助线数据
  } = useDrag({
    scale,
    onUpdateNode: (id, updates) => {
      // === 使用 Store 更新节点 ===
      useNodeStore.getState().updateNode(id, updates);
    },
    onSaveHistory: saveHistory,
    nodes, // 🆕 传递 nodes 用于辅助线检测
  });

  // === 架构重构：使用 useNodeActions Hook（业务逻辑抽离）===
  // 🔥 新增：处理所有节点类型的业务逻辑
  const { handleNodeAction, handleImageFile, handleVideoFile } = useNodeActions();

  // Node Resizing
  const [resizingNodeId, setResizingNodeId] = useState<string | null>(null);
  const [initialSize, setInitialSize] = useState<{width: number, height: number} | null>(null);
  const [resizeStartPos, setResizeStartPos] = useState<{x: number, y: number} | null>(null);

  // 鼠标位置 state（用于绘制连接线）
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Refs for closures
  const nodesRef = useRef(nodes);
  const connectionsRef = useRef(connections);
  const groupsRef = useRef(groups);
  const connectionStartRef = useRef(connectionStart);
  const rafRef = useRef<number | null>(null); // For RAF Throttling
  const mousePosRafRef = useRef<number | null>(null); // For mousePos RAF Throttling
  
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

  // dragGroupRef 已移至 useGroup Hook，不再需要在这里定义

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

  // === 节点更新函数 ===
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

  // === 替换文件函数 ===
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
      e.target.value = ''; closeContextMenu(); replacementTargetRef.current = null; 
  };

  // === 节点操作函数已迁移到 hooks/useNodeActions.ts ===
  // 🔥 架构重构：handleNodeAction 函数（570 行）已完全迁移到 useNodeActions Hook
  // 现在通过 const { handleNodeAction } = useNodeActions(); 调用

  // === 画布点击事件处理（集成 useViewport + useSelection）===
  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
      if (contextMenu) closeContextMenu(); 
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
  }, [contextMenu, closeContextMenu, selectGroup, clearSelection, startBoxSelection, startCanvasDrag]);

  const handleGlobalMouseMove = useCallback((e: MouseEvent) => {
      const { clientX, clientY } = e;
      
      // 性能优化：使用 ref 存储鼠标位置，避免每次都触发 React 重渲染
      mousePosRef.current = { x: clientX, y: clientY };
      
      // 只在绘制连接线时更新 state（触发重渲染）
      // 🔥 性能优化：使用 RAF 节流，避免每次 mousemove 触发重渲染
      if (connectionStartRef.current) {
          if (mousePosRafRef.current) {
              cancelAnimationFrame(mousePosRafRef.current);
          }
          
          mousePosRafRef.current = requestAnimationFrame(() => {
              setMousePos({ x: clientX, y: clientY });
          });
      }
      
      if (selectionRect) { 
          updateBoxSelection(clientX, clientY);
          return; 
      }
      
      // === 节点/组调整大小：实时更新 ===
      if (resizingNodeId && resizeContextRef.current) {
          const { startX, startY, initialWidth, initialHeight, element, nodeId } = resizeContextRef.current;
          
          if (element) {
              // 计算新的尺寸（考虑 scale）
              const dx = (clientX - startX) / scale;
              const dy = (clientY - startY) / scale;
              const newWidth = Math.max(200, initialWidth + dx); // 最小宽度 200px
              const newHeight = Math.max(100, initialHeight + dy); // 最小高度 100px
              
              // 🔥 判断是否是组的调整大小
              if (resizingNodeId.startsWith('group-')) {
                  // 组的调整大小：按比例缩放组内所有节点
                  const scaleX = newWidth / initialWidth;
                  const scaleY = newHeight / initialHeight;
                  
                  // 更新组的尺寸
                  element.style.width = `${newWidth}px`;
                  element.style.height = `${newHeight}px`;
                  element.style.transition = 'none';
                  
                  // 🔥 实时缩放组内的节点
                  const groupId = nodeId; // nodeId 实际存储的是 groupId
                  const groupNodes = getGroupNodes(groupId);
                  const group = groups.find(g => g.id === groupId);
                  
                  if (group) {
                      groupNodes.forEach(node => {
                          const nodeElement = document.querySelector(`[data-node-id="${node.id}"]`) as HTMLElement;
                          if (nodeElement) {
                              // 计算节点相对于组的位置
                              const relativeX = node.x - group.x;
                              const relativeY = node.y - group.y;
                              
                              // 计算缩放后的新位置
                              const newX = group.x + relativeX * scaleX;
                              const newY = group.y + relativeY * scaleY;
                              
                              // 计算节点的新尺寸
                              const nodeWidth = node.width || 420;
                              const nodeHeight = getApproxNodeHeight(node);
                              const newNodeWidth = nodeWidth * scaleX;
                              const newNodeHeight = nodeHeight * scaleY;
                              
                              // 使用 CSS 直接更新（性能优化）
                              nodeElement.style.left = `${newX}px`;
                              nodeElement.style.top = `${newY}px`;
                              nodeElement.style.width = `${newNodeWidth}px`;
                              nodeElement.style.height = `${newNodeHeight}px`;
                              nodeElement.style.transition = 'none';
                          }
                      });
                  }
              } else {
                  // 节点的调整大小：直接修改尺寸
                  element.style.width = `${newWidth}px`;
                  element.style.height = `${newHeight}px`;
                  element.style.transition = 'none';
              }
          }
          return;
      }
      
      // === 节点拖拽：useDrag Hook 内部自动处理 ===
      // 注意：不需要手动调用，Hook 内部已注册全局事件监听器
      
      // === Group 拖动：useGroup Hook 内部自动处理 ===
      // 注意：不需要手动调用，Hook 内部已注册全局事件监听器
  }, [selectionRect, resizingNodeId, scale, groups, getGroupNodes, getApproxNodeHeight, updateBoxSelection]);

  const handleGlobalMouseUp = useCallback((e: MouseEvent) => {
      if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
      
      // === 节点拖拽结束：useDrag Hook 内部自动处理 ===
      // 注意：不需要手动调用，Hook 内部已注册全局事件监听器
      
      // === Group 拖拽结束：使用 useGroup Hook ===
      if (isDraggingGroup) {
          endGroupDrag(e, scale);
      }
      
      // 性能优化：处理 Resize 结束 - 更新 state 并恢复 transition
      if (resizingNodeId && resizeContextRef.current) {
          const { element, nodeId } = resizeContextRef.current;
          
          if (element) {
              const finalWidth = parseInt(element.style.width) || (initialSize?.width || 420);
              const finalHeight = parseInt(element.style.height) || (initialSize?.height || 360);
              
              // 🔥 判断是否是组的调整大小
              if (resizingNodeId.startsWith('group-')) {
                  // 组的调整大小：保存组和所有节点的新尺寸
                  const groupId = nodeId; // nodeId 实际存储的是 groupId
                  const group = groups.find(g => g.id === groupId);
                  
                  if (group && initialSize) {
                      saveHistory();
                      
                      // 计算缩放比例
                      const scaleX = finalWidth / initialSize.width;
                      const scaleY = finalHeight / initialSize.height;
                      
                      // 更新组的尺寸
                      useGroupStore.getState().updateGroup(groupId, {
                          width: finalWidth,
                          height: finalHeight
                      });
                      
                      // 更新所有节点的位置和尺寸
                      const groupNodes = getGroupNodes(groupId);
                      groupNodes.forEach(node => {
                          const nodeElement = document.querySelector(`[data-node-id="${node.id}"]`) as HTMLElement;
                          
                          // 计算节点相对于组的位置
                          const relativeX = node.x - group.x;
                          const relativeY = node.y - group.y;
                          
                          // 计算缩放后的新位置
                          const newX = group.x + relativeX * scaleX;
                          const newY = group.y + relativeY * scaleY;
                          
                          // 计算节点的新尺寸
                          const nodeWidth = node.width || 420;
                          const nodeHeight = getApproxNodeHeight(node);
                          const newNodeWidth = nodeWidth * scaleX;
                          const newNodeHeight = nodeHeight * scaleY;
                          
                          // 更新 Store
                          useNodeStore.getState().updateNode(node.id, {
                              x: newX,
                              y: newY,
                              width: newNodeWidth,
                              height: newNodeHeight
                          });
                          
                          // 清除内联样式，恢复 transition
                          if (nodeElement) {
                              nodeElement.style.transition = 'none';
                              requestAnimationFrame(() => {
                                  nodeElement.style.transition = '';
                              });
                          }
                      });
                  }
                  
                  // 清除组元素的内联样式
                  element.style.transition = 'none';
                  requestAnimationFrame(() => {
                      element.style.transition = '';
                  });
              } else {
                  // 节点的调整大小：只更新节点尺寸
                  useNodeStore.getState().updateNodeSize(resizingNodeId, finalWidth, finalHeight);
                  
                  // 清除内联样式，恢复 transition
                  element.style.transition = 'none';
                  requestAnimationFrame(() => {
                      element.style.transition = '';
                  });
              }
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
                  openContextMenu({ 
                      visible: true, 
                      x: currentMousePos.x, 
                      y: currentMousePos.y, 
                      id: startConnection.id 
                  }, { 
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
          // endBoxSelection 内部会调用 expandOrCreateGroup（动态扩展组或创建新组）
          endBoxSelection(scale, pan);
      }

      
      // 清理状态
      setResizingNodeId(null); 
      setInitialSize(null); 
      setResizeStartPos(null);
      
      // 清理 refs
      resizeContextRef.current = null;
  }, [scale, selectionRect, saveHistory, resizingNodeId, initialSize, groups, getGroupNodes, getCompatibleOutputNodes, getCompatibleInputNodes, getApproxNodeHeight, endBoxSelection, pan, cancelConnection]);

  useEffect(() => { window.addEventListener('mousemove', handleGlobalMouseMove); window.addEventListener('mouseup', handleGlobalMouseUp); return () => { window.removeEventListener('mousemove', handleGlobalMouseMove); window.removeEventListener('mouseup', handleGlobalMouseUp); }; }, [handleGlobalMouseMove, handleGlobalMouseUp]);

  // === 架构重构：注册 useViewport 的事件监听器 ===
  useEffect(() => {
    if (isDraggingCanvas) {
      window.addEventListener('mousemove', updateCanvasDrag);
      window.addEventListener('mouseup', endCanvasDrag);
      // 🔥 修复：添加 mouseleave 事件，防止鼠标移出窗口时状态未清除
      window.addEventListener('mouseleave', endCanvasDrag);
      return () => {
        window.removeEventListener('mousemove', updateCanvasDrag);
        window.removeEventListener('mouseup', endCanvasDrag);
        window.removeEventListener('mouseleave', endCanvasDrag);
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



  
  const saveCurrentAsWorkflow = () => {
      // 性能优化：使用 Array.from(nodes.values()) 转换 Map 为数组
      const nodesArray = Array.from(nodes.values());
      const thumbnailNode = nodesArray.find(n => n.data.image);
      const thumbnail = thumbnailNode?.data.image || '';
      const newWf: Workflow = { id: `wf-${Date.now()}`, title: `工作流 ${new Date().toLocaleDateString()}`, thumbnail, nodes: JSON.parse(JSON.stringify(nodesArray)), connections: JSON.parse(JSON.stringify(connections)), groups: JSON.parse(JSON.stringify(groups)) };
      addWorkflow(newWf);
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
      addWorkflow(newWf);
  };

  /**
   * 从剧本节点生成完整工作流
   * 
   * ⚠️ 注意：此功能暂时禁用
   * 原因：依赖的节点类型（CHARACTER_REFERENCE, SCENE_REFERENCE）已被删除
   * 
   * TODO: 重新设计工作流生成逻辑
   * - 使用新的节点类型
   * - 或者直接生成分镜图节点
   */
  const createWorkflowFromScript = useCallback((scriptNodeId: string) => {
      const scriptNode = nodesRef.current.get(scriptNodeId) as AppNode | undefined;
      if (!scriptNode || !scriptNode.data.scriptData) {
          console.error('[生成工作流] 剧本节点不存在或没有剧本数据');
          return;
      }
      
      // ⚠️ 暂时禁用此功能
      alert('⚠️ 工作流生成功能暂时不可用\n\n原因：此功能依赖的节点类型（角色参考、场景参考）已被移除。\n\n建议：\n1. 手动创建分镜图生成节点\n2. 或者等待功能重新设计');
      return;
      
      /* 
      // === 原有代码已注释，等待重新设计 ===
      
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
      // ❌ 已删除：NodeType.CHARACTER_REFERENCE
      
      // === 2. 创建场景参考节点 ===
      // ❌ 已删除：NodeType.SCENE_REFERENCE
      
      // === 3. 创建分镜图生成节点 ===
      // ✅ 保留：NodeType.SHOT_IMAGE_GENERATOR
      
      // TODO: 重新设计工作流生成逻辑
      */
  }, []);

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
                
                // === 使用 Hook 的 deleteGroupWithNodes 方法 ===
                deleteGroupWithNodes(selectedGroupId, deleteNodesCallback);
                clearSelection();
                selectGroup(null);
                
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
                  // 🔥 处理九宫格图片拖放
                  if (asset.type === 'grid-splitter-image') {
                      console.log('[App] 处理九宫格图片拖放:', asset);
                      
                      // 从原始图片重新切割高质量版本
                      const img = new Image();
                      img.crossOrigin = 'anonymous';
                      img.onload = () => {
                          const canvas = document.createElement('canvas');
                          const ctx = canvas.getContext('2d');
                          if (!ctx) return;

                          // 高质量切割设置
                          ctx.imageSmoothingEnabled = true;
                          ctx.imageSmoothingQuality = 'high';

                          const cellWidth = img.width / 3;
                          const cellHeight = img.height / 3;
                          canvas.width = Math.round(cellWidth);
                          canvas.height = Math.round(cellHeight);

                          // 计算选中格子的位置
                          const col = asset.selectedIndex % 3;
                          const row = Math.floor(asset.selectedIndex / 3);

                          // 切割选中的格子
                          ctx.drawImage(
                              img,
                              col * cellWidth,
                              row * cellHeight,
                              cellWidth,
                              cellHeight,
                              0,
                              0,
                              canvas.width,
                              canvas.height
                          );

                          // 🔥 使用 PNG 格式保证最高质量
                          const highQualityImage = canvas.toDataURL('image/png');

                          // 创建图片节点
                          addNode(NodeType.IMAGE_GENERATOR, dropX - 210, dropY - 180, { 
                              image: highQualityImage, 
                              prompt: `九宫格-${asset.selectedIndex + 1}`,
                              status: NodeStatus.SUCCESS
                          });

                          console.log('[App] 创建高质量图片节点');
                      };
                      img.onerror = () => {
                          console.error('[App] 图片加载失败，使用切割后的图片');
                          // 降级方案：使用切割后的图片
                          addNode(NodeType.IMAGE_GENERATOR, dropX - 210, dropY - 180, { 
                              image: asset.croppedImage, 
                              prompt: `九宫格-${asset.selectedIndex + 1}`,
                              status: NodeStatus.SUCCESS
                          });
                      };
                      img.src = asset.originalImage;
                      return;
                  }
                  // 原有的资产拖放逻辑
                  if (asset.type === 'image') addNode(NodeType.IMAGE_GENERATOR, dropX - 210, dropY - 180, { image: asset.src, prompt: asset.title });
                  else if (asset.type === 'video') addNode(NodeType.VIDEO_GENERATOR, dropX - 210, dropY - 180, { videoUri: asset.src });
              }
              return;
          } catch (err) { console.error("Drop failed", err); }
      }
      
      // Updated Multi-File Logic (9-Grid Support + 零拷贝优化)
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

                  // 🔥 零拷贝优化：使用 Hook 的新方法（不读取文件内容）
                  if (file.type.startsWith('image/')) {
                      handleImageFile(file, { x: xPos, y: yPos });
                  } else if (file.type.startsWith('video/')) {
                      handleVideoFile(file, { x: xPos, y: yPos });
                  }
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
          className={`w-full h-full overflow-hidden text-gray-900 selection:bg-blue-500/30 ${isDraggingCanvas ? 'cursor-grabbing' : 'cursor-default'}`}
          style={{
              backgroundColor: '#F4F6F7', // 优雅浅蓝灰色 - 专业清爽
              // backgroundImage: 'radial-gradient(circle, rgba(170, 180, 185, 0.12) 0.8px, transparent 0.8px)', // 浅蓝灰点点（已隐藏）
              // backgroundSize: `${20 * scale}px ${20 * scale}px`,
              // backgroundPosition: `${pan.x}px ${pan.y}px`
          }}
          onMouseDown={handleCanvasMouseDown}
          onDoubleClick={(e) => { 
              // 在画布空白处双击时弹出菜单
              e.preventDefault(); 
              e.stopPropagation();
              openContextMenu({ visible: true, x: e.clientX, y: e.clientY, id: '' }, { type: 'create' }); 
          }}
          onContextMenu={(e) => { e.preventDefault(); if(e.target === e.currentTarget) closeContextMenu(); }}
          onDragOver={handleCanvasDragOver} onDrop={handleCanvasDrop}
      >

          <input type="file" ref={replaceVideoInputRef} className="hidden" accept="video/*" onChange={(e) => handleReplaceFile(e, 'video')} />
          <input type="file" ref={replaceImageInputRef} className="hidden" accept="image/*" onChange={(e) => handleReplaceFile(e, 'image')} />

          {/* Group Toolbars - 使用 fixed 定位，不受画布变换影响 */}
          {selectedGroupId && groups.find(g => g.id === selectedGroupId) && (
              <GroupToolbar
                  groupId={selectedGroupId}
                  groupX={groups.find(g => g.id === selectedGroupId)!.x}
                  groupY={groups.find(g => g.id === selectedGroupId)!.y}
                  groupWidth={groups.find(g => g.id === selectedGroupId)!.width}
                  scale={scale}
                  panX={pan.x}
                  panY={pan.y}
                  onAlignLeft={alignLeft}
                  onAlignCenterH={alignCenterH}
                  onAlignRight={alignRight}
                  onAlignTop={alignTop}
                  onAlignCenterV={alignCenterV}
                  onAlignBottom={alignBottom}
                  onDistributeH={distributeH}
                  onDistributeV={distributeV}
                  onArrangeTopology={arrangeTopology}
              />
          )}

          <div style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`, width: '100%', height: '100%', transformOrigin: '0 0' }} className="w-full h-full">
              {/* Groups Layer */}
              {groups.map(g => {
                  // 🔥 判断当前组是否正在被拖动
                  const isThisGroupDragging = isDraggingGroup && selectedGroupId === g.id;
                  
                  return (
                  <div 
                      key={g.id} 
                      id={`group-${g.id}`}
                      data-group-id={g.id}
                      className={`absolute rounded-[32px] border group/group ${
                          selectedGroupId === g.id 
                              ? 'border-cyan-500/30 bg-cyan-500/5 shadow-[0_0_40px_rgba(34,211,238,0.3)]' 
                              : 'border-white/10 bg-white/5'
                      }`} 
                      style={{ 
                          left: g.x, 
                          top: g.y, 
                          width: g.width, 
                          height: g.height,
                          // 🔥 修复跳跃和回弹：完全移除 transition
                          // transition: isThisGroupDragging ? 'none' : 'all 0.3s cubic-bezier(0.32, 0.72, 0, 1)'
                      }} 
                      onMouseDown={(e) => { 
                          e.stopPropagation();
                          selectGroup(g.id);  // ✅ 选中 Group
                          startGroupDrag(e, g.id, g);
                      }} 
                      onDoubleClick={(e) => e.stopPropagation()}
                      onContextMenu={e => { 
                          e.stopPropagation(); 
                          openContextMenu({visible:true, x:e.clientX, y:e.clientY, id:g.id}, {type:'group', id:g.id}); 
                      }}
                  >
                      <div className="absolute -top-8 left-4 text-xs font-bold text-white/40 uppercase tracking-widest">{g.title}</div>
                      
                      {/* 🔥 新增：组的调整大小交互点（右下角） */}
                      <div 
                          className="absolute -bottom-3 -right-3 w-6 h-6 flex items-center justify-center cursor-nwse-resize text-slate-500 hover:text-white transition-colors opacity-0 group-hover/group:opacity-100 z-50" 
                          onMouseDown={(e) => {
                              e.stopPropagation();
                              
                              // 保存初始状态
                              const groupElement = document.querySelector(`[data-group-id="${g.id}"]`) as HTMLElement;
                              if (groupElement) {
                                  resizeContextRef.current = {
                                      nodeId: g.id, // 复用 nodeId 字段存储 groupId
                                      initialWidth: g.width,
                                      initialHeight: g.height,
                                      startX: e.clientX,
                                      startY: e.clientY,
                                      parentGroupId: null,
                                      siblingNodeIds: [],
                                      element: groupElement
                                  };
                              }
                              
                              setResizingNodeId(`group-${g.id}`); // 使用特殊前缀标识这是组
                              setInitialSize({ width: g.width, height: g.height });
                              setResizeStartPos({ x: e.clientX, y: e.clientY });
                          }}
                      >
                          <div className="w-1.5 h-1.5 rounded-full bg-current" />
                      </div>
                  </div>
                  );
              })}

              {/* Connections Layer */}
              <svg className="absolute top-0 left-0 w-full h-full overflow-visible pointer-events-none z-0" xmlns="http://www.w3.org/2000/svg" style={{ overflow: 'visible', pointerEvents: 'none', zIndex: 0 }}>
                  {connections.map((conn) => {
                      // 性能优化：使用 Map.get() 代替 Array.find()（O(n) → O(1)，快 100 倍）
                      const f = nodes.get(conn.from) as AppNode | undefined;
                      const t = nodes.get(conn.to) as AppNode | undefined;
                      if (!f || !t) return null;
                      const fHeight = f.height || getApproxNodeHeight(f); const tHeight = t.height || getApproxNodeHeight(t);
                      const fWidth = f.width || 420; const tWidth = t.width || 420;
                      
                      // 🔥 方案 C：读取 CSS 变量获取拖拽偏移量（连线实时跟随）
                      const fElement = document.querySelector(`[data-node-id="${conn.from}"]`) as HTMLElement;
                      const tElement = document.querySelector(`[data-node-id="${conn.to}"]`) as HTMLElement;
                      const fOffsetX = fElement ? parseFloat(fElement.style.getPropertyValue('--drag-offset-x') || '0') : 0;
                      const fOffsetY = fElement ? parseFloat(fElement.style.getPropertyValue('--drag-offset-y') || '0') : 0;
                      const tOffsetX = tElement ? parseFloat(tElement.style.getPropertyValue('--drag-offset-x') || '0') : 0;
                      const tOffsetY = tElement ? parseFloat(tElement.style.getPropertyValue('--drag-offset-y') || '0') : 0;
                      
                      // 端口精确位置计算（加上拖拽偏移）：
                      // 输出端口：-right-3 = right: -0.75rem = -12px，端口 w-4 h-4 = 16px
                      // 端口左边缘在：节点右边缘 + 12px，端口中心在：节点右边缘 + 12px - 8px = +4px
                      const fx = f.x + fOffsetX + fWidth + 4;
                      const fy = f.y + fOffsetY + fHeight/2;
                      
                      // 输入端口：-left-3 = left: -0.75rem = -12px，端口 w-4 h-4 = 16px
                      // 端口左边缘在：节点左边缘 - 12px，端口中心在：节点左边缘 - 12px + 8px = -4px
                      const tx = t.x + tOffsetX - 4;
                      let ty = t.y + tOffsetY + tHeight/2;
                      
                      if (Math.abs(fy - ty) < 0.5) ty += 0.5;
                      if (isNaN(fx) || isNaN(fy) || isNaN(tx) || isNaN(ty)) return null;
                      
                      // 计算水平距离，用于调整控制点
                      const dx = tx - fx;
                      const controlOffset = Math.min(Math.abs(dx) * 0.6, 200);
                      
                      // 贝塞尔曲线：使用更自然的控制点
                      const d = `M ${fx} ${fy} C ${fx + controlOffset} ${fy}, ${tx - controlOffset} ${ty}, ${tx} ${ty}`;
                      
                      return (
                          <g key={`${conn.from}-${conn.to}`} className="pointer-events-auto group/line">
                              {/* 主连接线 - React Flow 风格 */}
                              <path 
                                  d={d} 
                                  stroke="#b1b1b7" 
                                  strokeWidth="2" 
                                  fill="none" 
                                  strokeLinecap="round"
                                  className="transition-all duration-200 group-hover/line:stroke-[#6b7280] group-hover/line:stroke-[2.5]" 
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
                                      openContextMenu({ visible: true, x: e.clientX, y: e.clientY, id: `${conn.from}-${conn.to}` }, { type: 'connection', from: conn.from, to: conn.to }); 
                                  }} 
                              />
                          </g>
                      );
                  })}
                  
                  {/* 🆕 Helper Lines Layer - 辅助线（拖动时显示） */}
                  {helperLines.map((line, index) => (
                      line.type === 'horizontal' ? (
                          <line
                              key={`helper-h-${index}`}
                              x1={line.start}
                              y1={line.position}
                              x2={line.end}
                              y2={line.position}
                              stroke="#3b82f6"
                              strokeWidth="1"
                              strokeDasharray="4 4"
                              className="pointer-events-none"
                          />
                      ) : (
                          <line
                              key={`helper-v-${index}`}
                              x1={line.position}
                              y1={line.start}
                              x2={line.position}
                              y2={line.end}
                              stroke="#3b82f6"
                              strokeWidth="1"
                              strokeDasharray="4 4"
                              className="pointer-events-none"
                          />
                      )
                  ))}
                  
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
                              stroke="#b1b1b7" 
                              strokeWidth="2" 
                              fill="none" 
                              strokeLinecap="round"
                              strokeDasharray="5,5"
                              className="pointer-events-none animate-pulse"
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
                  // 👍 必须有这行，配合 Node.tsx 的修改
                  data-node-id={node.id}
                  // 👍 最好也有这行，作为双重保险
                  id={`node-${node.id}`}
                  node={node} 
                  onUpdate={handleNodeUpdate} 
                  onAction={handleNodeAction} 
                  onCreateWorkflow={createWorkflowFromScript}
                  onDelete={(id) => deleteNodesCallback([id])} 
                  onExpand={openMedia} 
                  onCrop={(id, img) => { startCrop(id, img); }}
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
                  onNodeContextMenu={(e, id) => { e.stopPropagation(); e.preventDefault(); openContextMenu({ visible: true, x: e.clientX, y: e.clientY, id }, { type: 'node', id }); }}
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
                  isDragging={isDraggingNode} isResizing={resizingNodeId === node.id} isConnecting={!!connectionStart} isGroupDragging={isDraggingGroup}
              />
              );
                  });
              }, [nodes, selectedNodeIds, resizingNodeId, connectionStart, handleNodeUpdate, handleNodeAction, createWorkflowFromScript, deleteNodesCallback, openMedia, startCrop, startConnection, cancelConnection, setConnections, setNodes, openContextMenu, closeContextMenu, setResizingNodeId, setInitialSize, setResizeStartPos, groups])}
              {/* 🔥 性能优化：isDraggingNode 和 isDraggingGroup 不应该在 useMemo 依赖项中，因为它们会导致每次拖动都重新渲染所有节点 */}
              {selectionRect && <div className="absolute border border-cyan-500/40 bg-cyan-500/10 rounded-lg pointer-events-none" style={{ left: (Math.min(selectionRect.startX, selectionRect.currentX) - pan.x) / scale, top: (Math.min(selectionRect.startY, selectionRect.currentY) - pan.y) / scale, width: Math.abs(selectionRect.currentX - selectionRect.startX) / scale, height: Math.abs(selectionRect.currentY - selectionRect.startY) / scale }} />}
          </div>

          {contextMenu.visible && (
              <div className="fixed z-[100] bg-[#2c2c2e]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-1 min-w-[140px] animate-in fade-in zoom-in-95 duration-200 origin-top-left" style={{ top: contextMenu.y, left: contextMenu.x }} onMouseDown={(e) => e.stopPropagation()}>
                  {contextMenuTarget?.type === 'node' && (
                      <>
                          <button className="w-full text-left px-3 py-1.5 text-[11px] font-medium text-white/90 hover:bg-cyan-500/20 hover:text-cyan-300 rounded-lg flex items-center gap-2 transition-colors" onClick={() => { const targetNode = nodes.get(contextMenu.id) as AppNode | undefined; if (targetNode) setClipboard(JSON.parse(JSON.stringify(targetNode))); closeContextMenu(); }}>
                              <Copy size={12} /> 复制节点
                          </button>
                          {(() => { const targetNode = nodes.get(contextMenu.id) as AppNode | undefined; if (targetNode) { const isVideo = targetNode.type === NodeType.VIDEO_GENERATOR || targetNode.type === NodeType.VIDEO_ANALYZER; const isImage = targetNode.type === NodeType.IMAGE_GENERATOR || targetNode.type === NodeType.IMAGE_EDITOR; if (isVideo || isImage) { return ( <button className="w-full text-left px-3 py-1.5 text-[11px] font-medium text-white/90 hover:bg-purple-500/20 hover:text-purple-300 rounded-lg flex items-center gap-2 transition-colors" onClick={() => { replacementTargetRef.current = contextMenu.id; if (isVideo) replaceVideoInputRef.current?.click(); else replaceImageInputRef.current?.click(); closeContextMenu(); }}> <RefreshCw size={12} /> 替换素材 </button> ); } } return null; })()}
                          <button className="w-full text-left px-3 py-1.5 text-[11px] font-medium text-red-400 hover:bg-red-500/20 rounded-lg flex items-center gap-2 transition-colors mt-0.5" onClick={() => { deleteNodesCallback([contextMenuTarget.id]); closeContextMenu(); }}><Trash2 size={12} /> 删除节点</button>
                      </>
                  )}
                  {contextMenuTarget?.type === 'create' && (() => {
                      // 🔥 架构重构：从 NodeRegistry 获取菜单项
                      const menuItems = getMenuItemsFromRegistry();
                      
                      return (
                          <>
                              {/* 基础节点 */}
                              <div className="px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-white/30">基础节点</div>
                              {menuItems.basic.map(def => {
                                  const ItemIcon = getNodeIcon(def.type);
                                  return (
                                      <button
                                          key={def.type}
                                          className="w-full text-left px-3 py-1.5 text-[11px] font-medium text-white/90 hover:bg-white/10 rounded-lg flex items-center gap-2 transition-colors"
                                          onClick={() => {
                                              addNode(def.type, (contextMenu.x - pan.x) / scale, (contextMenu.y - pan.y) / scale);
                                              closeContextMenu();
                                          }}
                                      >
                                          <ItemIcon size={13} className="text-cyan-400" />
                                          {def.name}
                                      </button>
                                  );
                              })}

                              {/* 故事创作 */}
                              {menuItems.story.length > 0 && (
                                  <>
                                      <div className="px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-white/30 mt-1 border-t border-white/5 pt-1.5">故事创作</div>
                                      {menuItems.story.map(def => {
                                          const ItemIcon = getNodeIcon(def.type);
                                          return (
                                              <button
                                                  key={def.type}
                                                  className="w-full text-left px-3 py-1.5 text-[11px] font-medium text-white/90 hover:bg-white/10 rounded-lg flex items-center gap-2 transition-colors"
                                                  onClick={() => {
                                                      addNode(def.type, (contextMenu.x - pan.x) / scale, (contextMenu.y - pan.y) / scale);
                                                      closeContextMenu();
                                                  }}
                                              >
                                                  <ItemIcon size={13} className="text-purple-400" />
                                                  {def.name}
                                              </button>
                                          );
                                      })}
                                  </>
                              )}

                              {/* 高级工具 */}
                              {menuItems.advanced.length > 0 && (
                                  <>
                                      <div className="px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-white/30 mt-1 border-t border-white/5 pt-1.5">高级工具</div>
                                      {menuItems.advanced.map(def => {
                                          const ItemIcon = getNodeIcon(def.type);
                                          return (
                                              <button
                                                  key={def.type}
                                                  className="w-full text-left px-3 py-1.5 text-[11px] font-medium text-white/90 hover:bg-white/10 rounded-lg flex items-center gap-2 transition-colors"
                                                  onClick={() => {
                                                      addNode(def.type, (contextMenu.x - pan.x) / scale, (contextMenu.y - pan.y) / scale);
                                                      closeContextMenu();
                                                  }}
                                              >
                                                  <ItemIcon size={13} className="text-pink-400" />
                                                  {def.name}
                                              </button>
                                          );
                                      })}
                                  </>
                              )}
                          </>
                      );
                  })()}
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
                                              closeContextMenu();
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
                                          closeContextMenu(); 
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
                           <button className="w-full text-left px-3 py-1.5 text-[11px] font-medium text-white/90 hover:bg-white/10 rounded-lg flex items-center gap-2 transition-colors mb-0.5" onClick={() => { saveGroupAsWorkflow(contextMenu.id); closeContextMenu(); }}> <FolderHeart size={12} className="text-cyan-400" /> 保存为工作流 </button>
                           <button className="w-full text-left px-3 py-1.5 text-[11px] font-medium text-red-400 hover:bg-red-500/20 rounded-lg flex items-center gap-2 transition-colors" onClick={() => { 
                               // === 使用 Store 删除分组 ===
                               useGroupStore.getState().deleteGroup(contextMenu.id); 
                               closeContextMenu(); 
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
                          
                          closeContextMenu();
                      }}>
                          <Unplug size={12} /> 删除连接线
                      </button>
                  )}
              </div>
          )}
          
          {croppingNodeId && imageToCrop && <ImageCropper imageSrc={imageToCrop} onCancel={() => {endCrop();}} onConfirm={(b) => {handleNodeUpdate(croppingNodeId, {croppedFrame: b}); endCrop();}} />}
          <ExpandedView media={expandedMedia} onClose={() => closeMedia()} />
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
              onDeleteAsset={handleDeleteAsset}
              onDeleteMultipleAssets={handleDeleteMultipleAssets} // 🔥 新增：批量删除方法
              onDownloadSelectedAndClear={downloadSelectedImagesAndClear}
              workflows={workflows}
              selectedWorkflowId={selectedWorkflowId}
              onSelectWorkflow={loadWorkflow}
              onSaveWorkflow={saveCurrentAsWorkflow}
              onDeleteWorkflow={deleteWorkflow}
              onRenameWorkflow={renameWorkflow}
              onOpenSettings={() => setSettingsOpen(true)}
          />

          <AssistantPanel isOpen={isChatOpen} onClose={() => setChatOpen(false)} />

          {/* 🔥 控制栏：缩放控制 + 小地图 */}
          <div className="absolute bottom-8 right-8 flex items-center gap-3 px-4 py-2 bg-white/95 backdrop-blur-xl border border-gray-200 rounded-full shadow-lg z-50 animate-in fade-in slide-in-from-bottom-4 duration-700">
              {/* 小地图按钮 */}
              <Minimap
                  nodes={nodes}
                  connections={connections}
                  pan={pan}
                  scale={scale}
                  viewportWidth={typeof window !== 'undefined' ? window.innerWidth : 1920}
                  viewportHeight={typeof window !== 'undefined' ? window.innerHeight : 1080}
                  onPanChange={setPan}
              />
              
              {/* 分隔线 */}
              <div className="h-5 w-px bg-gray-200" />
              
              {/* 缩放控制 */}
              <button onClick={zoomOut} className="p-1.5 text-gray-600 hover:text-gray-900 transition-colors rounded-full hover:bg-gray-100"><Minus size={14} strokeWidth={3} /></button>
              <div className="flex items-center gap-2 min-w-[100px]">
                   <input type="range" min="0.2" max="3" step="0.1" value={scale} onChange={(e) => setScale(parseFloat(e.target.value))} className="w-24 h-1 bg-gray-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:shadow-md hover:[&::-webkit-slider-thumb]:scale-125 transition-all" />
                   <span className="text-[10px] font-bold text-gray-700 w-8 text-right tabular-nums cursor-pointer hover:text-gray-900" onClick={resetView} title="Reset Zoom">{Math.round(scale * 100)}%</span>
              </div>
              <button onClick={zoomIn} className="p-1.5 text-gray-600 hover:text-gray-900 transition-colors rounded-full hover:bg-gray-100"><Plus size={14} strokeWidth={3} /></button>
              <button onClick={fitView} className="p-1.5 text-gray-600 hover:text-gray-900 transition-colors rounded-full hover:bg-gray-100 ml-2 border-l border-gray-200 pl-3" title="适配视图">
                  <Scan size={14} strokeWidth={3} />
              </button>
          </div>
      </div>
    </div>
  );
};
