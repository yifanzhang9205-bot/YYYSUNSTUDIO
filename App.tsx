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
import { CreateAssetDialog } from './components/CreateAssetDialog'; // 🔥 资产库重构：创建资产对话框
import { AppNode, NodeType, NodeStatus, Connection, ContextMenuState, Group, SmartSequenceItem, GroupColor } from './types';
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
import { useAssetLibrary } from './hooks/useAssetLibrary'; // 🔥 资产库重构：资产库 Hook

// 引入 Stores（架构重构 - 阶段 A - 第 2 步）
import { useNodeStore } from './core/stores/nodeStore';
import { useConnectionStore } from './core/stores/connectionStore';
import { useGroupStore } from './core/stores/groupStore';

// 引入 Stores（架构重构 - 阶段 B - Store 迁移）
import { useSelectionStore } from './core/stores/selectionStore';
import { useUIStore } from './core/stores/uiStore';
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
  
  // === 🔥 数据持久化架构升级 - 阶段1：恢复节点图片（2026-02-10）===
  useEffect(() => {
    const restoreNodeImages = async () => {
      const { getAllNodes, updateNodeData } = useNodeStore.getState();
      const nodes = getAllNodes();
      
      if (nodes.length === 0) {
        console.log('[App] 没有节点需要恢复');
        return;
      }
      
      console.log(`[App] 开始恢复 ${nodes.length} 个节点的图片...`);
      
      for (const node of nodes) {
        try {
          // 恢复单张图片（node.data.image）
          if (node.data.image && node.data.image.startsWith('blob:')) {
            const { loadNodeImageBlob } = await import('./services/blobStorage');
            const newBlobUrl = await loadNodeImageBlob(node.id);
            if (newBlobUrl) {
              updateNodeData(node.id, { image: newBlobUrl });
              console.log(`[App] 节点 ${node.id} 图片已恢复`);
            }
          }
          
          // 恢复图片数组（node.data.images）
          if (node.data.images && node.data.images.length > 0) {
            const { loadNodeImagesBlob } = await import('./services/blobStorage');
            const newImages = await loadNodeImagesBlob(node.id, node.data.images.length);
            if (newImages.length > 0) {
              updateNodeData(node.id, { images: newImages });
              console.log(`[App] 节点 ${node.id} 图片数组已恢复: ${newImages.length}/${node.data.images.length}`);
            }
          }
        } catch (error) {
          console.error(`[App] 恢复节点 ${node.id} 图片失败:`, error);
        }
      }
      
      console.log('[App] 节点图片恢复完成');
    };
    
    // 延迟执行，避免阻塞初始渲染
    const timer = setTimeout(() => {
      restoreNodeImages();
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  // === 架构重构 - 阶段 B：使用 Store 管理所有状态 ===
  
  // --- UI 面板状态（从 uiStore 获取）---
  const isChatOpen = useUIStore(state => state.isChatOpen);
  const isSketchEditorOpen = useUIStore(state => state.isSketchEditorOpen);
  const isMultiFrameOpen = useUIStore(state => state.isMultiFrameOpen);
  const isSonicStudioOpen = useUIStore(state => state.isSonicStudioOpen);
  const isSettingsOpen = useUIStore(state => state.isSettingsOpen);
  const isLoaded = useUIStore(state => state.isLoaded);
  const editingGroupId = useUIStore(state => state.editingGroupId); // 🔥 新增：正在编辑的组 ID
  const { 
    setChatOpen, 
    setSketchEditorOpen, 
    setMultiFrameOpen, 
    setSonicStudioOpen, 
    setSettingsOpen, 
    setLoaded,
    setEditingGroupId, // 🔥 新增：设置编辑状态
  } = useUIStore();
  
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
      ids.forEach(async (id) => {
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
              
              // 🔥 数据持久化：清理 IndexedDB（阶段1）
              try {
                  const { deleteNodeImageBlob } = await import('./services/blobStorage');
                  await deleteNodeImageBlob(id);
              } catch (error) {
                  console.error(`[App] 清理节点 ${id} IndexedDB 失败:`, error);
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
    draggingGroupOffset, // 🔥 新增：拖动偏移量（用于实时更新标题和 Toolbar 位置）
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
    arrangeGrid, // 🔥 新增：宫格排列
    arrangeVertical, // 🔥 新增：竖排排列
    arrangeTopology, // 保留旧版本（兼容性）
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
    renameGroup, // 🔥 新增：改名组
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
    getSelectionBounds, // 🔥 资产库重构：获取选区边界
  } = useSelection({
    nodes,
    onDeleteNodes: deleteNodesCallback,
    // 🔥 框选批量移动：框选后自动创建临时组
    onExpandOrCreateGroup: expandOrCreateGroup,
  });

  // 🔥 资产库重构：创建资产对话框状态
  const [showCreateAssetDialog, setShowCreateAssetDialog] = useState(false);
  
  // 🔥 资产库重构：保存要创建的资产数据（修复 Bug：节点数据为空）
  const [assetDataToCreate, setAssetDataToCreate] = useState<{
    nodes: AppNode[];
    connections: Connection[];
  } | null>(null);

  // 🔥 资产库重构：使用资产库 Hook
  const { createAsset, useAsset } = useAssetLibrary();

  // 🔥 资产库重构：处理创建资产对话框确认
  const handleConfirmCreateAsset = useCallback((name: string, category: any) => {
    // ✅ 使用保存的数据，而不是 selectedNodeIds（修复 Bug：节点数据为空）
    if (!assetDataToCreate) {
      console.error('[资产库] 没有要创建的资产数据');
      return;
    }
    
    // ✅ 使用保存的节点数据
    createAsset(name, category, assetDataToCreate.nodes, assetDataToCreate.connections);
    
    // 清理
    setAssetDataToCreate(null);
    setShowCreateAssetDialog(false);
    clearSelection();
    
    console.log('[资产库] 资产创建成功', { 
      name, 
      category, 
      nodesCount: assetDataToCreate.nodes.length,
      connectionsCount: assetDataToCreate.connections.length,
    });
  }, [assetDataToCreate, createAsset, clearSelection]);

  // 🔥 框选批量移动：处理"编组"按钮点击
  const handleMakePermanentGroup = useCallback(() => {
    if (!selectedGroupId) return;
    
    console.log('[App] 编组 - 把临时组变成永久组', { selectedGroupId });
    
    // 修改组的 title，去掉"临时"标记
    const group = groups.find(g => g.id === selectedGroupId);
    if (group && group.title === '临时分组') {
      updateGroup(selectedGroupId, { title: '新建分组' });
    }
    
    // 取消选中
    clearSelection();
    selectGroup(null);
  }, [selectedGroupId, groups, updateGroup, clearSelection, selectGroup]);

  // 🔥 组颜色选择：处理颜色选择（2026-02-08）
  const handleSelectGroupColor = useCallback((color: GroupColor) => {
    if (!selectedGroupId) return;
    
    console.log('[App] 选择组颜色', { selectedGroupId, color });
    
    // 更新组的颜色
    updateGroup(selectedGroupId, { color });
  }, [selectedGroupId, updateGroup]);

  // 🔥 组颜色选择：根据颜色获取样式（2026-02-08）
  // 🔥 修改：临时组用青色，永久组用用户选择的颜色（2026-02-08）
  const getGroupColorStyle = useCallback((color?: GroupColor, isSelected?: boolean, isTemporary?: boolean) => {
    // 🔥 临时组：始终使用青色边框（无论是否选中）
    if (isTemporary) {
      return {
        borderColor: '#06B6D4', // cyan-500（青色）
        borderWidth: isSelected ? '3px' : '2px', // 选中时加粗
        background: 'rgba(207, 250, 254, 0.3)', // cyan-100/30
        boxShadow: isSelected ? '0 0 0 2px rgba(6, 182, 212, 0.25)' : 'none', // 选中时外发光
      };
    }
    
    // 🔥 永久组：根据用户选择的颜色显示（使用 300 色阶，降低透明度）
    let borderColor: string;
    let background: string;
    
    switch (color) {
      case 'blue':
        borderColor = '#60A5FA'; // blue-400
        background = 'rgba(147, 197, 253, 0.5)'; // blue-300/50
        break;
      case 'green':
        borderColor = '#34D399'; // green-400
        background = 'rgba(134, 239, 172, 0.5)'; // green-300/50
        break;
      case 'yellow':
        borderColor = '#FBBF24'; // yellow-400
        background = 'rgba(253, 224, 71, 0.5)'; // yellow-300/50
        break;
      case 'red':
        borderColor = '#F87171'; // red-400
        background = 'rgba(252, 165, 165, 0.5)'; // red-300/50
        break;
      case 'purple':
        borderColor = '#C084FC'; // purple-400
        background = 'rgba(216, 180, 254, 0.5)'; // purple-300/50
        break;
      case 'orange':
        borderColor = '#FB923C'; // orange-400
        background = 'rgba(253, 186, 116, 0.5)'; // orange-300/50
        break;
      default: // 'default'
        borderColor = '#9CA3AF'; // gray-400
        background = 'rgba(209, 213, 219, 0.5)'; // gray-300/50
        break;
    }
    
    // 🔥 如果选中，只改变边框（加粗 + 外发光），背景颜色保持不变
    if (isSelected) {
      return {
        borderColor: borderColor, // 保持原颜色
        borderWidth: '3px', // 加粗边框（从2px到3px）
        background: background, // 保持原背景色
        boxShadow: `0 0 0 2px ${borderColor}40`, // 外发光（使用原颜色的25%透明度）
      };
    }
    
    return {
      borderColor,
      borderWidth: '2px',
      background,
    };
  }, []);

  // 🔥 框选批量移动：处理"添加到资产库"按钮点击
  const handleAddGroupToAssetLibrary = useCallback(() => {
    if (!selectedGroupId) return;
    
    console.log('[App] 添加到资产库', { selectedGroupId });
    
    // ✅ 在打开对话框前，保存节点数据（修复 Bug：节点数据为空）
    const groupNodes = getGroupNodes(selectedGroupId);
    const groupConnections = connections.filter(conn => 
      groupNodes.some(n => n.id === conn.from) && groupNodes.some(n => n.id === conn.to)
    );
    
    // ✅ 保存到 state，供确认时使用
    setAssetDataToCreate({ nodes: groupNodes, connections: groupConnections });
    
    // 显示创建资产对话框
    setShowCreateAssetDialog(true);
    
    console.log('[App] 准备创建资产', { nodesCount: groupNodes.length, connectionsCount: groupConnections.length });
  }, [selectedGroupId, getGroupNodes, connections]);

  // 🆕 辅助线 DOM 引用（Direct DOM 操作，不触发 React 渲染）
  const helperLineRefs = useRef<{
    verticalLines: SVGLineElement[];
    horizontalLines: SVGLineElement[];
  }>({
    verticalLines: [],
    horizontalLines: [],
  });

  // === 架构重构：使用 useDrag Hook（阶段 A - 第 4 步）===
  // 🆕 集成 Helper Lines（辅助线 + 吸附）
  const {
    handleMouseDown: handleNodeDragStart,
    cancelDrag,
    isDragging: isDraggingNode,
    draggingNodeId, // 🔥 连接线优化：获取拖动节点 ID
  } = useDrag({
    scale,
    onUpdateNode: (id, updates) => {
      // === 使用 Store 更新节点 ===
      useNodeStore.getState().updateNode(id, updates);
    },
    onSaveHistory: saveHistory,
    nodes, // 🆕 传递 nodes 用于辅助线检测
    helperLineRefs: helperLineRefs.current, // 🆕 传递辅助线 DOM 引用
    selectedNodeIds, // 🔥 新增：传递选中的节点 ID 列表（用于批量移动）
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
      // 性能优化：将 Map 转换为数组保存到 IndexedDB
      saveToStorage('nodes', Array.from(nodes.values()));
      saveToStorage('connections', connections);
      saveToStorage('groups', groups);
  }, [assetHistory, nodes, connections, groups, isLoaded]);

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
      console.log('[App] handleCanvasMouseDown', { button: e.button, shiftKey: e.shiftKey, detail: e.detail, target: e.target, selectionRect });
      
      if (contextMenu) closeContextMenu(); 
      
      // 🔥 框选批量移动：点击空白处时，只删除临时组（title === '临时分组'）
      if (selectedGroupId) {
        const selectedGroup = groups.find(g => g.id === selectedGroupId);
        if (selectedGroup && selectedGroup.title === '临时分组') {
          console.log('[App] 点击空白处，删除临时组', { selectedGroupId });
          deleteGroupFromHook(selectedGroupId);
        } else {
          console.log('[App] 点击空白处，保留永久组', { selectedGroupId, title: selectedGroup?.title });
        }
        selectGroup(null);
        clearSelection();
      } else {
        selectGroup(null); // 使用 Store 的方法
      }
      
      if (e.button === 0 && !e.shiftKey) { 
          // 左键点击：清空选择 + 开始框选
          if (e.detail === 1) {
              // 🔥 修复：如果正在进行框选（selectionRect 存在），不清空选中
              // 这是因为框选结束时（mouseup）会触发一个新的 mousedown，导致立即清空选中
              if (!selectionRect) {
                  console.log('[App] 准备清空选中和开始框选');
                  // 🔥 新增：点击空白处时，如果有选中的节点，也清空选择
                  if (selectedNodeIds.length > 0) {
                      console.log('[App] 点击空白处，清空选中的节点', { selectedNodeIds });
                  }
                  clearSelection();
                  startBoxSelection(e.clientX, e.clientY);
              } else {
                  console.log('[App] 正在框选，跳过清空选中');
              }
          }
      }
      
      if (e.button === 1 || (e.button === 0 && e.shiftKey)) { 
          // 中键 或 Shift+左键：开始拖拽画布
          startCanvasDrag(e);
      }
  }, [contextMenu, closeContextMenu, selectedGroupId, groups, deleteGroupFromHook, selectGroup, clearSelection, startBoxSelection, startCanvasDrag, selectionRect, selectedNodeIds]);

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
  }, [selectedNodeIds, selectedGroupId, deleteNodesCallback, deleteSelected, clearSelection, undo, saveHistory, clipboard, selectNode, selectAll]);

  const handleCanvasDragOver = (e: React.DragEvent) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; };
  const handleCanvasDrop = (e: React.DragEvent) => {
      e.preventDefault();
      const dropX = (e.clientX - pan.x) / scale;
      const dropY = (e.clientY - pan.y) / scale;
      const assetData = e.dataTransfer.getData('application/json');
      const assetId = e.dataTransfer.getData('application/asset-id'); // 🔥 资产库重构：检测资产ID

      // 🔥 资产库重构：处理资产拖拽
      if (assetId) {
          console.log('[App] 处理资产拖拽', { assetId, dropX, dropY });
          
          // 创建回调函数：添加节点到画布
          const onAddNodes = (nodes: AppNode[]) => {
              saveHistory();
              useNodeStore.getState().addNodes(nodes);
              console.log('[App] 添加资产节点到画布', { count: nodes.length });
          };
          
          // 创建回调函数：添加连接到画布
          const onAddConnections = (connections: Connection[]) => {
              connections.forEach(conn => {
                  useConnectionStore.getState().addConnection(conn);
              });
              console.log('[App] 添加资产连接到画布', { count: connections.length });
          };
          
          // 调用 useAsset 方法
          useAsset(assetId, { x: dropX, y: dropY }, onAddNodes, onAddConnections);
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
              backgroundColor: '#E9ECEE', // 🔥 优化：冷色调降亮度（H=203°, L=92%）
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
          {selectedGroupId && groups.find(g => g.id === selectedGroupId) && (() => {
              const selectedGroup = groups.find(g => g.id === selectedGroupId)!;
              
              // 🔥 计算拖动偏移量（如果正在拖动这个组）
              const isDraggingThis = draggingGroupOffset && draggingGroupOffset.id === selectedGroupId;
              const dragOffsetX = isDraggingThis ? draggingGroupOffset.dx * scale : 0;
              const dragOffsetY = isDraggingThis ? draggingGroupOffset.dy * scale : 0;
              
              return (
                  <GroupToolbar
                      groupId={selectedGroupId}
                      groupX={selectedGroup.x}
                      groupY={selectedGroup.y}
                      groupWidth={selectedGroup.width}
                      scale={scale}
                      panX={pan.x}
                      panY={pan.y}
                      onArrangeGrid={arrangeGrid} // 🔥 宫格排列
                      onArrangeVertical={arrangeVertical} // 🔥 竖排排列
                      // 🔥 框选批量移动：新增编组和添加到资产库功能
                      isTemporary={selectedGroup.title === '临时分组'}
                      onMakePermanent={handleMakePermanentGroup}
                      onAddToAssetLibrary={handleAddGroupToAssetLibrary}
                      // 🔥 组颜色选择：新增颜色相关props（2026-02-08）
                      groupColor={selectedGroup.color}
                      onSelectColor={handleSelectGroupColor}
                      // 🔥 拖动偏移量：实现实时跟随（2026-02-09）
                      dragOffsetX={dragOffsetX}
                      dragOffsetY={dragOffsetY}
                      // 🔥 拆组功能：删除组但保留节点（2026-02-09）
                      onUngroup={() => {
                          deleteGroupFromHook(selectedGroupId);
                          clearGroupSelection(); // 拆组后取消选中
                      }}
                  />
              );
          })()}

          {/* 🔥 组标题 - 使用 fixed 定位，不受画布变换影响（像 GroupToolbar 一样）*/}
          {groups.map(g => {
              // 🔥 计算拖动偏移量（如果正在拖动这个组）
              const isDraggingThis = draggingGroupOffset && draggingGroupOffset.id === g.id;
              const dragOffsetX = isDraggingThis ? draggingGroupOffset.dx * scale : 0;
              const dragOffsetY = isDraggingThis ? draggingGroupOffset.dy * scale : 0;
              
              // 计算标题在屏幕上的位置（世界坐标 → 屏幕坐标 + 拖动偏移）
              const titleScreenX = g.x * scale + pan.x + 16 + dragOffsetX; // 16px = left-4
              const titleScreenY = g.y * scale + pan.y - 32 + dragOffsetY; // -32px = -top-8
              
              // 🔥 标题字体大小：固定大小，不随缩放变化
              const titleFontSize = 14; // 固定14px
              
              // 🔥 是否正在编辑这个组的标题
              const isEditingTitle = editingGroupId === g.id;
              
              return (
                  <div key={`title-${g.id}`}>
                      {isEditingTitle ? (
                          <input
                              type="text"
                              defaultValue={g.title}
                              autoFocus
                              className="fixed font-medium bg-transparent border-none outline-none text-gray-500"
                              style={{
                                  left: `${titleScreenX}px`,
                                  top: `${titleScreenY}px`,
                                  fontSize: `${titleFontSize}px`,
                                  width: '200px',
                                  zIndex: 100,
                                  fontFamily: '"Source Han Sans CN", "Noto Sans SC", sans-serif',
                              }}
                              onBlur={(e) => {
                                  const newTitle = e.target.value.trim();
                                  if (newTitle && newTitle !== g.title) {
                                      renameGroup(g.id, newTitle);
                                  }
                                  setEditingGroupId(null);
                              }}
                              onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                      e.currentTarget.blur();
                                  } else if (e.key === 'Escape') {
                                      setEditingGroupId(null);
                                  }
                              }}
                              onClick={(e) => e.stopPropagation()}
                              onMouseDown={(e) => e.stopPropagation()}
                          />
                      ) : (
                          <div 
                              className="fixed font-medium text-gray-500 cursor-text"
                              style={{
                                  left: `${titleScreenX}px`,
                                  top: `${titleScreenY}px`,
                                  fontSize: `${titleFontSize}px`,
                                  zIndex: 100,
                                  fontFamily: '"Source Han Sans CN", "Noto Sans SC", sans-serif',
                              }}
                              onDoubleClick={(e) => {
                                  e.stopPropagation();
                                  setEditingGroupId(g.id);
                              }}
                          >
                              {g.title}
                          </div>
                      )}
                  </div>
              );
          })}

          {/* 🔥 资产库重构：创建资产对话框 */}
          {showCreateAssetDialog && (
              <CreateAssetDialog
                  onConfirm={handleConfirmCreateAsset}
                  onCancel={() => setShowCreateAssetDialog(false)}
              />
          )}

          <div style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`, width: '100%', height: '100%', transformOrigin: '0 0' }} className="w-full h-full">
              {/* Groups Layer */}
              {groups.map(g => {
                  // 🔥 判断当前组是否正在被拖动
                  const isThisGroupDragging = isDraggingGroup && selectedGroupId === g.id;
                  
                  // 🔥 判断是否是临时组
                  const isTemporary = g.title === '临时分组';
                  
                  // 🔥 组颜色选择：获取组的颜色样式（2026-02-08）
                  const colorStyle = getGroupColorStyle(g.color, selectedGroupId === g.id, isTemporary);
                  
                  // 🔥 圆点大小：根据缩放比例动态调整（保持视觉大小一致）
                  const dotSize = Math.max(8, 10 / scale); // 稍微大一点：最小8px，基础10px
                  const dotOffset = dotSize / 2; // 圆点偏移量（半径）
                  
                  return (
                  <div 
                      key={g.id} 
                      id={`group-${g.id}`}
                      data-group-id={g.id}
                      className={`absolute border group/group ${isThisGroupDragging ? '' : 'transition-all duration-150 ease-out'}`}
                      style={{ 
                          left: g.x, 
                          top: g.y, 
                          width: g.width, 
                          height: g.height,
                          borderColor: colorStyle.borderColor,
                          borderWidth: colorStyle.borderWidth || '2px',
                          background: colorStyle.background,
                          boxShadow: colorStyle.boxShadow || 'none',
                          borderRadius: 0, // 🔥 90度直角
                      }} 
                      onMouseDown={(e) => { 
                          e.stopPropagation();
                          selectGroup(g.id);
                          startGroupDrag(e, g.id, g);
                      }} 
                      onDoubleClick={(e) => {
                          e.stopPropagation();
                          // 🔥 双击组边框不触发编辑，只有双击标题才编辑
                      }}
                      onContextMenu={e => { 
                          e.preventDefault(); // 🔥 阻止浏览器默认右键菜单
                          e.stopPropagation(); 
                          openContextMenu({visible:true, x:e.clientX, y:e.clientY, id:g.id}, {type:'group', id:g.id}); 
                      }}
                  >
                      
                      {/* 🔥 四个角的调整大小圆点（长期显示，大小随缩放动态调整，外圈颜色跟组颜色一致）*/}
                      {/* 左上角 */}
                      <div 
                          className="absolute rounded-full bg-white cursor-nwse-resize hover:scale-150 transition-all z-50" 
                          style={{
                              width: `${dotSize}px`,
                              height: `${dotSize}px`,
                              top: `-${dotOffset}px`,
                              left: `-${dotOffset}px`,
                              border: `2px solid ${colorStyle.borderColor}`, // 🔥 外圈颜色跟组颜色一致
                          }}
                          onMouseDown={(e) => {
                              e.stopPropagation();
                              const groupElement = document.querySelector(`[data-group-id="${g.id}"]`) as HTMLElement;
                              if (groupElement) {
                                  resizeContextRef.current = {
                                      nodeId: g.id,
                                      initialWidth: g.width,
                                      initialHeight: g.height,
                                      startX: e.clientX,
                                      startY: e.clientY,
                                      parentGroupId: null,
                                      siblingNodeIds: [],
                                      element: groupElement
                                  };
                              }
                              setResizingNodeId(`group-${g.id}-tl`);
                              setInitialSize({ width: g.width, height: g.height });
                              setResizeStartPos({ x: e.clientX, y: e.clientY });
                          }}
                      />
                      
                      {/* 右上角 */}
                      <div 
                          className="absolute rounded-full bg-white cursor-nesw-resize hover:scale-150 transition-all z-50" 
                          style={{
                              width: `${dotSize}px`,
                              height: `${dotSize}px`,
                              top: `-${dotOffset}px`,
                              right: `-${dotOffset}px`,
                              border: `2px solid ${colorStyle.borderColor}`, // 🔥 外圈颜色跟组颜色一致
                          }}
                          onMouseDown={(e) => {
                              e.stopPropagation();
                              const groupElement = document.querySelector(`[data-group-id="${g.id}"]`) as HTMLElement;
                              if (groupElement) {
                                  resizeContextRef.current = {
                                      nodeId: g.id,
                                      initialWidth: g.width,
                                      initialHeight: g.height,
                                      startX: e.clientX,
                                      startY: e.clientY,
                                      parentGroupId: null,
                                      siblingNodeIds: [],
                                      element: groupElement
                                  };
                              }
                              setResizingNodeId(`group-${g.id}-tr`);
                              setInitialSize({ width: g.width, height: g.height });
                              setResizeStartPos({ x: e.clientX, y: e.clientY });
                          }}
                      />
                      
                      {/* 左下角 */}
                      <div 
                          className="absolute rounded-full bg-white cursor-nesw-resize hover:scale-150 transition-all z-50" 
                          style={{
                              width: `${dotSize}px`,
                              height: `${dotSize}px`,
                              bottom: `-${dotOffset}px`,
                              left: `-${dotOffset}px`,
                              border: `2px solid ${colorStyle.borderColor}`, // 🔥 外圈颜色跟组颜色一致
                          }}
                          onMouseDown={(e) => {
                              e.stopPropagation();
                              const groupElement = document.querySelector(`[data-group-id="${g.id}"]`) as HTMLElement;
                              if (groupElement) {
                                  resizeContextRef.current = {
                                      nodeId: g.id,
                                      initialWidth: g.width,
                                      initialHeight: g.height,
                                      startX: e.clientX,
                                      startY: e.clientY,
                                      parentGroupId: null,
                                      siblingNodeIds: [],
                                      element: groupElement
                                  };
                              }
                              setResizingNodeId(`group-${g.id}-bl`);
                              setInitialSize({ width: g.width, height: g.height });
                              setResizeStartPos({ x: e.clientX, y: e.clientY });
                          }}
                      />
                      
                      {/* 右下角 */}
                      <div 
                          className="absolute rounded-full bg-white cursor-nwse-resize hover:scale-150 transition-all z-50" 
                          style={{
                              width: `${dotSize}px`,
                              height: `${dotSize}px`,
                              bottom: `-${dotOffset}px`,
                              right: `-${dotOffset}px`,
                              border: `2px solid ${colorStyle.borderColor}`, // 🔥 外圈颜色跟组颜色一致
                          }}
                          onMouseDown={(e) => {
                              e.stopPropagation();
                              const groupElement = document.querySelector(`[data-group-id="${g.id}"]`) as HTMLElement;
                              if (groupElement) {
                                  resizeContextRef.current = {
                                      nodeId: g.id,
                                      initialWidth: g.width,
                                      initialHeight: g.height,
                                      startX: e.clientX,
                                      startY: e.clientY,
                                      parentGroupId: null,
                                      siblingNodeIds: [],
                                      element: groupElement
                                  };
                              }
                              setResizingNodeId(`group-${g.id}-br`);
                              setInitialSize({ width: g.width, height: g.height });
                              setResizeStartPos({ x: e.clientX, y: e.clientY });
                          }}
                      />
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
                      
                      // 🔥 连接线优化：只查询拖动节点的 DOM（性能提升 10-25 倍）
                      let fOffsetX = 0, fOffsetY = 0, tOffsetX = 0, tOffsetY = 0;
                      
                      // 只有拖动节点才查询 DOM
                      if (draggingNodeId === conn.from) {
                          const fElement = document.querySelector(`[data-node-id="${conn.from}"]`) as HTMLElement;
                          if (fElement) {
                              fOffsetX = parseFloat(fElement.style.getPropertyValue('--drag-offset-x') || '0');
                              fOffsetY = parseFloat(fElement.style.getPropertyValue('--drag-offset-y') || '0');
                          }
                      }
                      
                      if (draggingNodeId === conn.to) {
                          const tElement = document.querySelector(`[data-node-id="${conn.to}"]`) as HTMLElement;
                          if (tElement) {
                              tOffsetX = parseFloat(tElement.style.getPropertyValue('--drag-offset-x') || '0');
                              tOffsetY = parseFloat(tElement.style.getPropertyValue('--drag-offset-y') || '0');
                          }
                      }
                      
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
                  
                  {/* 🆕 预埋的辅助线 DOM（Direct DOM 操作，不触发 React 渲染）*/}
                  {/* 垂直辅助线（最多 6 条）*/}
                  {[0, 1, 2, 3, 4, 5].map(i => (
                      <line
                          key={`helper-v-${i}`}
                          ref={el => {
                              if (el) helperLineRefs.current.verticalLines[i] = el;
                          }}
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="0"
                          stroke="#3b82f6"
                          strokeWidth="1"
                          style={{ display: 'none', pointerEvents: 'none' }}
                      />
                  ))}
                  {/* 水平辅助线（最多 6 条）*/}
                  {[0, 1, 2, 3, 4, 5].map(i => (
                      <line
                          key={`helper-h-${i}`}
                          ref={el => {
                              if (el) helperLineRefs.current.horizontalLines[i] = el;
                          }}
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="0"
                          stroke="#3b82f6"
                          strokeWidth="1"
                          style={{ display: 'none', pointerEvents: 'none' }}
                      />
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
              }, [nodes, selectedNodeIds, resizingNodeId, connectionStart, handleNodeUpdate, handleNodeAction, deleteNodesCallback, openMedia, startCrop, startConnection, cancelConnection, setConnections, setNodes, openContextMenu, closeContextMenu, setResizingNodeId, setInitialSize, setResizeStartPos, groups])}
              {/* 🔥 性能优化：isDraggingNode 和 isDraggingGroup 不应该在 useMemo 依赖项中，因为它们会导致每次拖动都重新渲染所有节点 */}
              {selectionRect && <div className="absolute border border-cyan-500/40 bg-cyan-500/10 rounded-lg pointer-events-none" style={{ left: (Math.min(selectionRect.startX, selectionRect.currentX) - pan.x) / scale, top: (Math.min(selectionRect.startY, selectionRect.currentY) - pan.y) / scale, width: Math.abs(selectionRect.currentX - selectionRect.startX) / scale, height: Math.abs(selectionRect.currentY - selectionRect.startY) / scale }} />}
          </div>

          {contextMenu.visible && (
              <div className="fixed z-[100] bg-white/85 backdrop-blur-xl border border-gray-200/70 rounded-xl shadow-2xl p-1.5 min-w-[140px] animate-in fade-in zoom-in-95 duration-200 origin-top-left" style={{ top: contextMenu.y, left: contextMenu.x }} onMouseDown={(e) => e.stopPropagation()}>
                  {contextMenuTarget?.type === 'node' && (
                      <>
                          <button className="w-full text-left px-2.5 py-1.5 text-[10px] font-bold text-gray-600/80 hover:bg-gray-100/80 rounded-lg flex items-center gap-1.5 transition-colors" onClick={() => { const targetNode = nodes.get(contextMenu.id) as AppNode | undefined; if (targetNode) setClipboard(JSON.parse(JSON.stringify(targetNode))); closeContextMenu(); }}>
                              <Copy size={11} className="text-gray-500/70" /> 复制节点
                          </button>
                          {(() => { const targetNode = nodes.get(contextMenu.id) as AppNode | undefined; if (targetNode) { const isVideo = targetNode.type === NodeType.VIDEO_GENERATOR || targetNode.type === NodeType.VIDEO_ANALYZER; const isImage = targetNode.type === NodeType.IMAGE_GENERATOR || targetNode.type === NodeType.IMAGE_EDITOR; if (isVideo || isImage) { return ( <button className="w-full text-left px-2.5 py-1.5 text-[10px] font-bold text-gray-600/80 hover:bg-gray-100/80 rounded-lg flex items-center gap-1.5 transition-colors" onClick={() => { replacementTargetRef.current = contextMenu.id; if (isVideo) replaceVideoInputRef.current?.click(); else replaceImageInputRef.current?.click(); closeContextMenu(); }}> <RefreshCw size={11} className="text-gray-500/70" /> 替换素材 </button> ); } } return null; })()}
                          <button className="w-full text-left px-2.5 py-1.5 text-[10px] font-bold text-red-600/80 hover:bg-red-50/80 rounded-lg flex items-center gap-1.5 transition-colors mt-0.5" onClick={() => { deleteNodesCallback([contextMenuTarget.id]); closeContextMenu(); }}><Trash2 size={11} className="text-red-500/70" /> 删除节点</button>
                      </>
                  )}
                  {contextMenuTarget?.type === 'create' && (() => {
                      // 🔥 架构重构：从 NodeRegistry 获取菜单项
                      const menuItems = getMenuItemsFromRegistry();
                      
                      return (
                          <>
                              {/* 基础节点 */}
                              <div className="px-2.5 py-1 text-[8px] font-bold text-gray-400/60">基础节点</div>
                              {menuItems.basic.map(def => {
                                  const ItemIcon = getNodeIcon(def.type);
                                  return (
                                      <button
                                          key={def.type}
                                          className="w-full text-left px-2.5 py-1.5 text-[10px] font-bold text-gray-600/80 hover:bg-gray-100/80 rounded-lg flex items-center gap-1.5 transition-colors"
                                          onClick={() => {
                                              addNode(def.type, (contextMenu.x - pan.x) / scale, (contextMenu.y - pan.y) / scale);
                                              closeContextMenu();
                                          }}
                                      >
                                          <ItemIcon size={12} className="text-gray-500/70" />
                                          {def.name}
                                      </button>
                                  );
                              })}

                              {/* 故事创作 */}
                              {menuItems.story.length > 0 && (
                                  <>
                                      <div className="px-2.5 py-1 text-[8px] font-bold text-gray-400/60 mt-1 border-t border-gray-200/50 pt-1.5">故事创作</div>
                                      {menuItems.story.map(def => {
                                          const ItemIcon = getNodeIcon(def.type);
                                          return (
                                              <button
                                                  key={def.type}
                                                  className="w-full text-left px-2.5 py-1.5 text-[10px] font-bold text-gray-600/80 hover:bg-gray-100/80 rounded-lg flex items-center gap-1.5 transition-colors"
                                                  onClick={() => {
                                                      addNode(def.type, (contextMenu.x - pan.x) / scale, (contextMenu.y - pan.y) / scale);
                                                      closeContextMenu();
                                                  }}
                                              >
                                                  <ItemIcon size={12} className="text-gray-500/70" />
                                                  {def.name}
                                              </button>
                                          );
                                      })}
                                  </>
                              )}

                              {/* 高级工具 */}
                              {menuItems.advanced.length > 0 && (
                                  <>
                                      <div className="px-2.5 py-1 text-[8px] font-bold text-gray-400/60 mt-1 border-t border-gray-200/50 pt-1.5">高级工具</div>
                                      {menuItems.advanced.map(def => {
                                          const ItemIcon = getNodeIcon(def.type);
                                          return (
                                              <button
                                                  key={def.type}
                                                  className="w-full text-left px-2.5 py-1.5 text-[10px] font-bold text-gray-600/80 hover:bg-gray-100/80 rounded-lg flex items-center gap-1.5 transition-colors"
                                                  onClick={() => {
                                                      addNode(def.type, (contextMenu.x - pan.x) / scale, (contextMenu.y - pan.y) / scale);
                                                      closeContextMenu();
                                                  }}
                                              >
                                                  <ItemIcon size={12} className="text-gray-500/70" />
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
                          <div className="px-2.5 py-1 text-[8px] font-bold text-gray-400/60 flex items-center gap-1.5">
                              <Sparkles size={9} className="text-gray-500/70" />
                              {contextMenuTarget.portType === 'output' ? '连接到' : '从此连接'}
                          </div>
                          {contextMenuTarget.compatibleTypes?.map((t: NodeType) => { 
                              const ItemIcon = getNodeIcon(t); 
                              return ( 
                                  <button 
                                      key={t} 
                                      className="w-full text-left px-2.5 py-1.5 text-[10px] font-bold text-gray-600/80 hover:bg-gray-100/80 rounded-lg flex items-center gap-1.5 transition-colors" 
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
                                      <ItemIcon size={12} className="text-gray-500/70" /> 
                                      {getNodeNameCN(t)} 
                                  </button> 
                              ); 
                          })}
                      </>
                  )}
                  {contextMenuTarget?.type === 'group' && (
                      <>
                           <button className="w-full text-left px-2.5 py-1.5 text-[10px] font-bold text-red-600/80 hover:bg-red-50/80 rounded-lg flex items-center gap-1.5 transition-colors" onClick={() => { 
                               // === 使用 Store 删除分组 ===
                               useGroupStore.getState().deleteGroup(contextMenu.id); 
                               closeContextMenu(); 
                           }}> <Trash2 size={11} className="text-red-500/70" /> 删除分组 </button>
                      </>
                  )}
                  {contextMenuTarget?.type === 'connection' && (
                      <button className="w-full text-left px-2.5 py-1.5 text-[10px] font-bold text-red-600/80 hover:bg-red-50/80 rounded-lg flex items-center gap-1.5 transition-colors" onClick={() => {
                          // === 使用 Store 删除连接 ===
                          useConnectionStore.getState().deleteConnection(contextMenuTarget.from, contextMenuTarget.to);
                          
                          // === 使用 Store 更新节点输入 ===
                          const targetNode = useNodeStore.getState().getNode(contextMenuTarget.to);
                          if (targetNode) {
                              useNodeStore.getState().updateNodeInputs(contextMenuTarget.to, targetNode.inputs.filter(i => i !== contextMenuTarget.from));
                          }
                          
                          closeContextMenu();
                      }}>
                          <Unplug size={11} className="text-gray-500/70" /> 删除连接线
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
              onDeleteMultipleAssets={handleDeleteMultipleAssets}
              onDownloadSelectedAndClear={downloadSelectedImagesAndClear}
              onOpenSettings={() => setSettingsOpen(true)}
              onUseAsset={(assetId, position) => {
                console.log('[App] 使用资产（点击或拖拽）', { assetId, position });
                
                // 如果 position 是 {x: 0, y: 0}，说明是点击资产，需要计算画布中心位置
                let targetPosition = position;
                if (position.x === 0 && position.y === 0) {
                  // 计算画布中心位置（考虑缩放和平移）
                  const centerX = (window.innerWidth / 2 - pan.x) / scale;
                  const centerY = (window.innerHeight / 2 - pan.y) / scale;
                  targetPosition = { x: centerX, y: centerY };
                  console.log('[App] 使用画布中心位置', targetPosition);
                }
                
                // 创建回调函数：添加节点到画布
                const onAddNodes = (nodes: AppNode[]) => {
                  saveHistory();
                  useNodeStore.getState().addNodes(nodes);
                  console.log('[App] 添加资产节点到画布', { count: nodes.length });
                };
                
                // 创建回调函数：添加连接到画布
                const onAddConnections = (connections: Connection[]) => {
                  connections.forEach(conn => {
                    useConnectionStore.getState().addConnection(conn);
                  });
                  console.log('[App] 添加资产连接到画布', { count: connections.length });
                };
                
                // 调用 useAsset 方法
                useAsset(assetId, targetPosition, onAddNodes, onAddConnections);
              }}
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
