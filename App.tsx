

import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  // --- Global App State ---
  const [workflows, setWorkflows] = useState<Workflow[]>([]); 
  const [assetHistory, setAssetHistory] = useState<any[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false); 
  
  // Sketch Editor State
  const [isSketchEditorOpen, setIsSketchEditorOpen] = useState(false);

  // Multi-Frame Dock State
  const [isMultiFrameOpen, setIsMultiFrameOpen] = useState(false);

  // Sonic Studio (Music) State
  const [isSonicStudioOpen, setIsSonicStudioOpen] = useState(false);
  
  // Settings State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // --- Canvas State ---
  const [nodes, setNodes] = useState<AppNode[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [clipboard, setClipboard] = useState<AppNode | null>(null); 
  
  // History
  const [history, setHistory] = useState<any[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Viewport
  const [scale, setScale] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Interaction / Selection
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]); // Changed to Array for multi-select
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [draggingNodeParentGroupId, setDraggingNodeParentGroupId] = useState<string | null>(null);
  const [draggingGroup, setDraggingGroup] = useState<any>(null); 
  const [resizingGroupId, setResizingGroupId] = useState<string | null>(null);
  const [activeGroupNodeIds, setActiveGroupNodeIds] = useState<string[]>([]);
  const [connectionStart, setConnectionStart] = useState<{ id: string, x: number, y: number, portType?: 'input' | 'output' } | null>(null);
  const [selectionRect, setSelectionRect] = useState<any>(null);
  
  // Node Resizing
  const [resizingNodeId, setResizingNodeId] = useState<string | null>(null);
  const [initialSize, setInitialSize] = useState<{width: number, height: number} | null>(null);
  const [resizeStartPos, setResizeStartPos] = useState<{x: number, y: number} | null>(null);

  // Context Menu
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [contextMenuTarget, setContextMenuTarget] = useState<any>(null);

  // Media Overlays
  const [expandedMedia, setExpandedMedia] = useState<any>(null);
  const [croppingNodeId, setCroppingNodeId] = useState<string | null>(null);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);

  // Refs for closures
  const nodesRef = useRef(nodes);
  const connectionsRef = useRef(connections);
  const groupsRef = useRef(groups);
  const historyRef = useRef(history);
  const historyIndexRef = useRef(historyIndex);
  const connectionStartRef = useRef(connectionStart);
  const rafRef = useRef<number | null>(null); // For RAF Throttling
  
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
      nodeHeight: number
  } | null>(null);

  const resizeContextRef = useRef<{
      nodeId: string,
      initialWidth: number,
      initialHeight: number,
      startX: number,
      startY: number,
      parentGroupId: string | null,
      siblingNodeIds: string[]
  } | null>(null);

  const dragGroupRef = useRef<{
      id: string, 
      startX: number, 
      startY: number, 
      mouseStartX: number, 
      mouseStartY: number,
      childNodes: {id: string, startX: number, startY: number}[]
  } | null>(null);

  useEffect(() => {
      nodesRef.current = nodes; connectionsRef.current = connections; groupsRef.current = groups;
      historyRef.current = history; historyIndexRef.current = historyIndex; connectionStartRef.current = connectionStart;
  }, [nodes, connections, groups, history, historyIndex, connectionStart]);

  // --- Persistence ---
  useEffect(() => {
      if (window.aistudio) window.aistudio.hasSelectedApiKey().then(hasKey => { if (!hasKey) window.aistudio.openSelectKey(); });
      const loadData = async () => {
          try {
            const sAssets = await loadFromStorage<any[]>('assets'); if (sAssets) setAssetHistory(sAssets);
            const sWfs = await loadFromStorage<Workflow[]>('workflows'); if (sWfs) setWorkflows(sWfs);
            const sNodes = await loadFromStorage<AppNode[]>('nodes'); if (sNodes) setNodes(sNodes);
            const sConns = await loadFromStorage<Connection[]>('connections'); if (sConns) setConnections(sConns);
            const sGroups = await loadFromStorage<Group[]>('groups'); if (sGroups) setGroups(sGroups);
          } catch (e) {
            console.error("Failed to load storage", e);
          } finally {
            setIsLoaded(true); 
          }
      };
      loadData();
  }, []);

  useEffect(() => {
      if (!isLoaded) return; 
      
      saveToStorage('assets', assetHistory);
      saveToStorage('workflows', workflows);
      saveToStorage('nodes', nodes);
      saveToStorage('connections', connections);
      saveToStorage('groups', groups);
  }, [assetHistory, workflows, nodes, connections, groups, isLoaded]);

  
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

  const getNodeNameCN = (t: string) => {
      switch(t) {
          case NodeType.PROMPT_INPUT: return '创意描述';
          case NodeType.IMAGE_GENERATOR: return '文字生图';
          case NodeType.VIDEO_GENERATOR: return '文生视频';
          case NodeType.AUDIO_GENERATOR: return '灵感音乐';
          case NodeType.VIDEO_ANALYZER: return '视频分析';
          case NodeType.IMAGE_EDITOR: return '图像编辑';
          case NodeType.STORY_STUDIO: return '创意工作室';
          case NodeType.CHARACTER_REFERENCE: return '角色参考';
          case NodeType.SCENE_REFERENCE: return '场景参考';
          case NodeType.STORYBOARD_SHOT: return '分镜生成';
          case NodeType.MULTI_ANGLE_CAMERA: return '多角度相机';
          case NodeType.GRID_SPLITTER: return '九宫格处理';
          default: return t;
      }
  };
  const getNodeIcon = (t: string) => {
      switch(t) {
          case NodeType.PROMPT_INPUT: return Type;
          case NodeType.IMAGE_GENERATOR: return ImageIcon;
          case NodeType.VIDEO_GENERATOR: return Film;
          case NodeType.AUDIO_GENERATOR: return Mic2;
          case NodeType.VIDEO_ANALYZER: return ScanFace;
          case NodeType.IMAGE_EDITOR: return Brush;
          case NodeType.STORY_STUDIO: return Sparkles;
          case NodeType.CHARACTER_REFERENCE: return ScanFace;
          case NodeType.SCENE_REFERENCE: return LayoutTemplate;
          case NodeType.STORYBOARD_SHOT: return Film;
          case NodeType.MULTI_ANGLE_CAMERA: return LayoutTemplate;
          case NodeType.GRID_SPLITTER: return Grid3X3;
          default: return Plus;
      }
  };

  const handleFitView = useCallback(() => {
      if (nodes.length === 0) {
          setPan({ x: 0, y: 0 });
          setScale(1);
          return;
      }

      const padding = 100;
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

      nodes.forEach(n => {
          const h = n.height || getApproxNodeHeight(n);
          const w = n.width || 420;
          if (n.x < minX) minX = n.x;
          if (n.y < minY) minY = n.y;
          if (n.x + w > maxX) maxX = n.x + w;
          if (n.y + h > maxY) maxY = n.y + h;
      });

      const contentW = maxX - minX;
      const contentH = maxY - minY;
      
      const scaleX = (window.innerWidth - padding * 2) / contentW;
      const scaleY = (window.innerHeight - padding * 2) / contentH;
      let newScale = Math.min(scaleX, scaleY, 1); 
      newScale = Math.max(0.2, newScale); 

      const contentCenterX = minX + contentW / 2;
      const contentCenterY = minY + contentH / 2;

      const newPanX = (window.innerWidth / 2) - (contentCenterX * newScale);
      const newPanY = (window.innerHeight / 2) - (contentCenterY * newScale);

      setPan({ x: newPanX, y: newPanY });
      setScale(newScale);
  }, [nodes]);

  const saveHistory = useCallback(() => {
      try {
          const currentStep = { nodes: JSON.parse(JSON.stringify(nodesRef.current)), connections: JSON.parse(JSON.stringify(connectionsRef.current)), groups: JSON.parse(JSON.stringify(groupsRef.current)) };
          const newHistory = historyRef.current.slice(0, historyIndexRef.current + 1);
          newHistory.push(currentStep); if (newHistory.length > 50) newHistory.shift(); 
          setHistory(newHistory); setHistoryIndex(newHistory.length - 1);
      } catch (e) {
          console.warn("History save failed:", e);
      }
  }, []);

  const undo = useCallback(() => {
      const idx = historyIndexRef.current; if (idx > 0) { const prev = historyRef.current[idx - 1]; setNodes(prev.nodes); setConnections(prev.connections); setGroups(prev.groups); setHistoryIndex(idx - 1); }
  }, []);

  const deleteNodes = useCallback((ids: string[]) => { 
      if (ids.length === 0) return;
      saveHistory(); 
      setNodes(p => p.filter(n => !ids.includes(n.id)).map(n => ({...n, inputs: n.inputs.filter(i => !ids.includes(i))}))); 
      setConnections(p => p.filter(c => !ids.includes(c.from) && !ids.includes(c.to))); 
      setSelectedNodeIds([]); 
  }, [saveHistory]);

  const addNode = useCallback((type: NodeType, x?: number, y?: number, initialData?: any) => {
      if (type === NodeType.IMAGE_EDITOR) {
          setIsSketchEditorOpen(true);
          return;
      }

      try { saveHistory(); } catch (e) { }

      const defaults: any = { 
          model: type === NodeType.VIDEO_GENERATOR ? 'veo-3.1-fast-generate-preview' :
                 type === NodeType.VIDEO_ANALYZER ? 'gemini-3-pro-preview' :
                 type === NodeType.AUDIO_GENERATOR ? 'gemini-2.5-flash-preview-tts' :
                 type.includes('IMAGE') ? 'gemini-2.5-flash-image' :
                 'gemini-3-pro-preview',
          generationMode: type === NodeType.VIDEO_GENERATOR ? 'DEFAULT' : undefined,
          // 创意工作室默认值
          storyStyle: type === NodeType.STORY_STUDIO ? '科幻' : undefined,
          targetDuration: type === NodeType.STORY_STUDIO ? 30 : undefined,
          shotCount: type === NodeType.STORY_STUDIO ? 6 : undefined,
          // 多角度相机默认值
          horizontalAngle: type === NodeType.MULTI_ANGLE_CAMERA ? 0 : undefined,
          verticalAngle: type === NodeType.MULTI_ANGLE_CAMERA ? 0 : undefined,
          cameraZoom: type === NodeType.MULTI_ANGLE_CAMERA ? 5 : undefined,
          ...initialData
      };
      
      const typeMap: Record<string, string> = {
          [NodeType.PROMPT_INPUT]: '创意描述',
          [NodeType.IMAGE_GENERATOR]: '文字生图',
          [NodeType.VIDEO_GENERATOR]: '文生视频',
          [NodeType.AUDIO_GENERATOR]: '灵感音乐',
          [NodeType.VIDEO_ANALYZER]: '视频分析',
          [NodeType.IMAGE_EDITOR]: '图像编辑',
          [NodeType.STORY_STUDIO]: '创意工作室',
          [NodeType.CHARACTER_REFERENCE]: '角色参考',
          [NodeType.SCENE_REFERENCE]: '场景参考',
          [NodeType.STORYBOARD_SHOT]: '分镜生成',
          [NodeType.MULTI_ANGLE_CAMERA]: '多角度相机',
          [NodeType.GRID_SPLITTER]: '九宫格处理',
      };

      const safeX = x !== undefined ? x : (-pan.x + window.innerWidth/2)/scale - 210;
      const safeY = y !== undefined ? y : (-pan.y + window.innerHeight/2)/scale - 180;

      const newNode: AppNode = {
        id: `n-${Date.now()}-${Math.floor(Math.random()*1000)}`,
        type,
        x: isNaN(safeX) ? 100 : safeX,
        y: isNaN(safeY) ? 100 : safeY,
        width: 420, 
        title: typeMap[type] || '未命名节点', 
        status: NodeStatus.IDLE, 
        data: defaults, 
        inputs: []
      };
      
      setNodes(prev => [...prev, newNode]); 
  }, [pan, scale, saveHistory]);

  // 获取节点输出可以连接的目标节点类型（智能连接菜单）
  const getCompatibleOutputNodes = useCallback((sourceNode: AppNode): NodeType[] => {
      const compatible: NodeType[] = [];

      // 根据节点类型判断可以连接的目标
      switch (sourceNode.type) {
          case NodeType.STORY_STUDIO:
              // 创意工作室 → 角色参考、场景参考、分镜生成
              compatible.push(NodeType.CHARACTER_REFERENCE, NodeType.SCENE_REFERENCE, NodeType.STORYBOARD_SHOT);
              break;
          case NodeType.CHARACTER_REFERENCE:
              // 角色参考 → 分镜生成
              compatible.push(NodeType.STORYBOARD_SHOT);
              break;
          case NodeType.SCENE_REFERENCE:
              // 场景参考 → 分镜生成
              compatible.push(NodeType.STORYBOARD_SHOT);
              break;
          case NodeType.STORYBOARD_SHOT:
              // 分镜 → 序列编排（暂未实现）
              break;
          case NodeType.MULTI_ANGLE_CAMERA:
              // 多角度相机 → 图片生成、视频生成
              compatible.push(NodeType.IMAGE_GENERATOR, NodeType.VIDEO_GENERATOR);
              break;
          case NodeType.IMAGE_GENERATOR:
          case NodeType.IMAGE_EDITOR:
              // 图片 → 视频生成、图像编辑、视频分析、多角度相机
              compatible.push(NodeType.VIDEO_GENERATOR, NodeType.IMAGE_EDITOR, NodeType.VIDEO_ANALYZER, NodeType.MULTI_ANGLE_CAMERA);
              break;
          case NodeType.VIDEO_GENERATOR:
              // 视频 → 视频分析
              compatible.push(NodeType.VIDEO_ANALYZER);
              break;
          case NodeType.PROMPT_INPUT:
              // 文本 → 图片生成、视频生成、音频生成
              compatible.push(NodeType.IMAGE_GENERATOR, NodeType.VIDEO_GENERATOR, NodeType.AUDIO_GENERATOR);
              break;
          case NodeType.AUDIO_GENERATOR:
              // 音频暂无下游节点
              break;
          case NodeType.VIDEO_ANALYZER:
              // 分析结果暂无下游节点
              break;
      }

      return Array.from(new Set(compatible));
  }, []);

  // 获取节点输入可以接收的源节点类型（智能连接菜单）
  const getCompatibleInputNodes = useCallback((targetNode: AppNode): NodeType[] => {
      const compatible: NodeType[] = [];

      switch (targetNode.type) {
          case NodeType.VIDEO_GENERATOR:
              // 视频生成可以接收：文本、图片
              compatible.push(NodeType.PROMPT_INPUT, NodeType.IMAGE_GENERATOR, NodeType.IMAGE_EDITOR);
              break;
          case NodeType.IMAGE_GENERATOR:
              // 图片生成可以接收：文本
              compatible.push(NodeType.PROMPT_INPUT);
              break;
          case NodeType.VIDEO_ANALYZER:
              // 视频分析可以接收：视频、图片
              compatible.push(NodeType.VIDEO_GENERATOR, NodeType.IMAGE_GENERATOR, NodeType.IMAGE_EDITOR);
              break;
          case NodeType.IMAGE_EDITOR:
              // 图像编辑可以接收：图片
              compatible.push(NodeType.IMAGE_GENERATOR, NodeType.IMAGE_EDITOR);
              break;
          case NodeType.AUDIO_GENERATOR:
              // 音频生成可以接收：文本
              compatible.push(NodeType.PROMPT_INPUT);
              break;
          case NodeType.CHARACTER_REFERENCE:
              // 角色参考可以接收：剧本数据
              compatible.push(NodeType.STORY_STUDIO);
              break;
          case NodeType.SCENE_REFERENCE:
              // 场景参考可以接收：剧本数据
              compatible.push(NodeType.STORY_STUDIO);
              break;
          case NodeType.STORYBOARD_SHOT:
              // 分镜生成可以接收：剧本数据、角色参考、场景参考
              compatible.push(NodeType.STORY_STUDIO, NodeType.CHARACTER_REFERENCE, NodeType.SCENE_REFERENCE);
              break;
          case NodeType.MULTI_ANGLE_CAMERA:
              // 多角度相机可以接收：图片
              compatible.push(NodeType.IMAGE_GENERATOR, NodeType.IMAGE_EDITOR);
              break;
      }

      return compatible;
  }, []);

  const handleAssetGenerated = useCallback((type: 'image' | 'video' | 'audio', src: string, title: string) => {
      setAssetHistory(h => {
          const exists = h.find(a => a.src === src);
          if (exists) return h;
          return [{ id: `a-${Date.now()}`, type, src, title, timestamp: Date.now() }, ...h];
      });
  }, []);
  
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
      
      const group = groupsRef.current.find(g => g.id === selectedGroupId);
      if (!group) return;
      
      // 获取组内所有节点
      const groupNodes = nodesRef.current.filter(n => group.nodeIds.includes(n.id));
      if (groupNodes.length === 0) return;
      
      saveHistory();
      
      // 保持节点原有位置顺序，只对齐排列
      // 按照从左到右、从上到下的顺序排序
      const sortedNodes = [...groupNodes].sort((a, b) => {
          // 先按 Y 坐标排序（从上到下）
          const yDiff = a.y - b.y;
          if (Math.abs(yDiff) > 50) return yDiff; // Y 差距大于 50px 认为是不同行
          // Y 坐标相近时，按 X 坐标排序（从左到右）
          return a.x - b.x;
      });
      
      // 网格布局参数
      const NODE_WIDTH = 420;
      const SPACING_X = 60; // 节点间水平间距
      const SPACING_Y = 40; // 节点间垂直间距
      const PADDING = 40; // 组边距
      
      // 计算每行的节点
      const rows: AppNode[][] = [];
      let currentRow: AppNode[] = [];
      let lastY = sortedNodes[0]?.y || 0;
      
      sortedNodes.forEach(node => {
          // 如果 Y 坐标差距大于 50px，认为是新的一行
          if (Math.abs(node.y - lastY) > 50 && currentRow.length > 0) {
              rows.push(currentRow);
              currentRow = [node];
              lastY = node.y;
          } else {
              currentRow.push(node);
              lastY = node.y;
          }
      });
      if (currentRow.length > 0) rows.push(currentRow);
      
      // 计算新位置
      const newPositions: { [key: string]: { x: number, y: number } } = {};
      let currentY = group.y + PADDING;
      let maxWidth = 0;
      
      rows.forEach((row, rowIndex) => {
          let currentX = group.x + PADDING;
          let maxRowHeight = 0;
          
          row.forEach((node, colIndex) => {
              const nodeHeight = node.height || getApproxNodeHeight(node);
              maxRowHeight = Math.max(maxRowHeight, nodeHeight);
              
              newPositions[node.id] = {
                  x: currentX,
                  y: currentY
              };
              
              currentX += NODE_WIDTH + SPACING_X;
          });
          
          // 更新最大宽度
          const rowWidth = row.length * NODE_WIDTH + (row.length - 1) * SPACING_X;
          maxWidth = Math.max(maxWidth, rowWidth);
          
          // 移动到下一行
          currentY += maxRowHeight + SPACING_Y;
      });
      
      // 计算组的新尺寸
      const totalWidth = maxWidth + PADDING * 2;
      const totalHeight = currentY - group.y - SPACING_Y + PADDING;
      
      // 更新节点位置
      setNodes(prev => prev.map(n => {
          if (newPositions[n.id]) {
              return { ...n, x: newPositions[n.id].x, y: newPositions[n.id].y };
          }
          return n;
      }));
      
      // 更新组尺寸
      setGroups(prev => prev.map(g => {
          if (g.id === selectedGroupId) {
              return { ...g, width: totalWidth, height: totalHeight };
          }
          return g;
      }));
  }, [selectedGroupId, saveHistory]);


  const handleWheel = (e: React.WheelEvent) => {
      if (e.shiftKey) {
        // Shift + 滚轮 = 平移画布
        setPan(p => ({ x: p.x - e.deltaX, y: p.y - e.deltaY }));
      } else {
        // 默认滚轮 = 缩放画布
        e.preventDefault(); 
        const newScale = Math.min(Math.max(0.2, scale - e.deltaY * 0.001), 3);
        const rect = e.currentTarget.getBoundingClientRect(); 
        const x = e.clientX - rect.left; 
        const y = e.clientY - rect.top;
        const scaleDiff = newScale - scale;
        setPan(p => ({ x: p.x - (x - p.x) * (scaleDiff / scale), y: p.y - (y - p.y) * (scaleDiff / scale) }));
        setScale(newScale);
      }
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
      if (contextMenu) setContextMenu(null); setSelectedGroupId(null);
      if (e.button === 0 && !e.shiftKey) { 
          // 不阻止双击事件，让 onDoubleClick 处理
          if (e.detail === 1) {
              setSelectedNodeIds([]); 
              setSelectionRect({ startX: e.clientX, startY: e.clientY, currentX: e.clientX, currentY: e.clientY }); 
          }
      }
      if (e.button === 1 || (e.button === 0 && e.shiftKey)) { setIsDraggingCanvas(true); setLastMousePos({ x: e.clientX, y: e.clientY }); }
  };

  const handleGlobalMouseMove = useCallback((e: MouseEvent) => {
      const { clientX, clientY } = e;
      
      // 立即更新鼠标位置（用于连接线绘制）
      setMousePos({ x: clientX, y: clientY });
      
      if (selectionRect) { setSelectionRect((prev:any) => prev ? ({ ...prev, currentX: clientX, currentY: clientY }) : null); return; }
      
      if (dragGroupRef.current) {
          const { id, startX, startY, mouseStartX, mouseStartY, childNodes } = dragGroupRef.current;
          const dx = (clientX - mouseStartX) / scale;
          const dy = (clientY - mouseStartY) / scale;
          setGroups(prev => prev.map(g => g.id === id ? { ...g, x: startX + dx, y: startY + dy } : g));
          if (childNodes.length > 0) { 
              setNodes(prev => prev.map(n => { 
                  const child = childNodes.find(c => c.id === n.id); 
                  return child ? { ...n, x: child.startX + dx, y: child.startY + dy } : n; 
              })); 
          } 
          return;
      }

      if (isDraggingCanvas) { 
          const dx = clientX - lastMousePos.x; 
          const dy = clientY - lastMousePos.y; 
          setPan(p => ({ x: p.x + dx, y: p.y + dy })); 
          setLastMousePos({ x: clientX, y: clientY }); 
      }
      
      if (draggingNodeId && dragNodeRef.current && dragNodeRef.current.id === draggingNodeId) {
         const { startX, startY, mouseStartX, mouseStartY, nodeWidth, nodeHeight } = dragNodeRef.current;
         let dx = (clientX - mouseStartX) / scale;
         let dy = (clientY - mouseStartY) / scale;
         let proposedX = startX + dx;
         let proposedY = startY + dy;
         
         // Snap Logic
         const SNAP = SNAP_THRESHOLD / scale; 
         const myL = proposedX; const myC = proposedX + nodeWidth / 2; const myR = proposedX + nodeWidth;
         const myT = proposedY; const myM = proposedY + nodeHeight / 2; const myB = proposedY + nodeHeight;
         let snappedX = false; let snappedY = false;
         
         nodesRef.current.forEach(other => {
             if (other.id === draggingNodeId) return;
             const otherBounds = getNodeBounds(other);
             if (!snappedX) {
                 if (Math.abs(myL - otherBounds.x) < SNAP) { proposedX = otherBounds.x; snappedX = true; }
                 else if (Math.abs(myL - otherBounds.r) < SNAP) { proposedX = otherBounds.r; snappedX = true; }
                 else if (Math.abs(myR - otherBounds.x) < SNAP) { proposedX = otherBounds.x - nodeWidth; snappedX = true; }
                 else if (Math.abs(myR - otherBounds.r) < SNAP) { proposedX = otherBounds.r - nodeWidth; snappedX = true; }
                 else if (Math.abs(myC - (otherBounds.x+otherBounds.width/2)) < SNAP) { proposedX = (otherBounds.x+otherBounds.width/2) - nodeWidth/2; snappedX = true; }
             }
             if (!snappedY) {
                 if (Math.abs(myT - otherBounds.y) < SNAP) { proposedY = otherBounds.y; snappedY = true; }
                 else if (Math.abs(myT - otherBounds.b) < SNAP) { proposedY = otherBounds.b; snappedY = true; }
                 else if (Math.abs(myB - otherBounds.y) < SNAP) { proposedY = otherBounds.y - nodeHeight; snappedY = true; }
                 else if (Math.abs(myB - otherBounds.b) < SNAP) { proposedY = otherBounds.b - nodeHeight; snappedY = true; }
                 else if (Math.abs(myM - (otherBounds.y+otherBounds.height/2)) < SNAP) { proposedY = (otherBounds.y+otherBounds.height/2) - nodeHeight/2; snappedY = true; }
             }
         });

         setNodes(prev => prev.map(n => n.id === draggingNodeId ? { ...n, x: proposedX, y: proposedY } : n));
         
      } else if (draggingNodeId) {
          const dx = (clientX - lastMousePos.x) / scale; 
          const dy = (clientY - lastMousePos.y) / scale; 
          setNodes(prev => prev.map(n => n.id === draggingNodeId ? { ...n, x: n.x + dx, y: n.y + dy } : n));
          setLastMousePos({ x: clientX, y: clientY });
      }
      
      if (resizingNodeId && initialSize && resizeStartPos) {
          const dx = (clientX - resizeStartPos.x) / scale; const dy = (clientY - resizeStartPos.y) / scale;
          setNodes(prev => prev.map(n => n.id === resizingNodeId ? { ...n, width: Math.max(360, initialSize.width + dx), height: Math.max(240, initialSize.height + dy) } : n));
      }
  }, [selectionRect, isDraggingCanvas, draggingNodeId, resizingNodeId, initialSize, resizeStartPos, scale, lastMousePos]);

  const handleGlobalMouseUp = useCallback(() => {
      if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
      
      // 处理连接线拖拽结束 - 如果没有连接到目标，弹出智能菜单
      if (connectionStartRef.current) {
          const startConnection = connectionStartRef.current;
          const startNode = nodesRef.current.find(n => n.id === startConnection.id);
          
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
                  setContextMenu({ 
                      visible: true, 
                      x: mousePos.x, 
                      y: mousePos.y, 
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
          
          setConnectionStart(null);
      }
      
      if (selectionRect) {
          const x = Math.min(selectionRect.startX, selectionRect.currentX); const y = Math.min(selectionRect.startY, selectionRect.currentY);
          const w = Math.abs(selectionRect.currentX - selectionRect.startX); const h = Math.abs(selectionRect.currentY - selectionRect.startY);
          if (w > 10) {
              const rect = { x: (x - pan.x) / scale, y: (y - pan.y) / scale, w: w / scale, h: h / scale };
              const enclosed = nodesRef.current.filter(n => { const cx = n.x + (n.width||420)/2; const cy = n.y + 160; return cx>rect.x && cx<rect.x+rect.w && cy>rect.y && cy<rect.y+rect.h; });
              if (enclosed.length > 0) { saveHistory(); 
                  const freeNodes = enclosed.filter(n => {
                      const cx = n.x + (n.width || 420) / 2; const cy = n.y + 160;
                      return !groupsRef.current.some(g => cx > g.x && cx < g.x + g.width && cy > g.y && cy < g.y + g.height);
                  });
                  if (freeNodes.length > 0) {
                      const fMinX=Math.min(...freeNodes.map(n=>n.x)), fMinY=Math.min(...freeNodes.map(n=>n.y)), fMaxX=Math.max(...freeNodes.map(n=>n.x+(n.width||420))), fMaxY=Math.max(...freeNodes.map(n=>n.y+320));
                      setGroups(prev => [...prev, { id: `g-${Date.now()}`, title: '新建分组', x: fMinX-32, y: fMinY-32, width: (fMaxX-fMinX)+64, height: (fMaxY-fMinY)+64 }]);
                  }
              }
          }
          setSelectionRect(null);
      }
      
      // Collision logic for dropped node
      if (draggingNodeId) {
          const draggedNode = nodesRef.current.find(n => n.id === draggingNodeId);
          if (draggedNode) {
              const myBounds = getNodeBounds(draggedNode);
              const otherNodes = nodesRef.current.filter(n => n.id !== draggingNodeId);
              
              // Simple Iterative Solver for Collision
              // We check against all nodes. If we collide, we move out the shortest distance.
              // To handle multiple collisions, a physics engine iterates this, but for UI, one pass usually suffices 
              // or we check the 'closest' collision. Here we iterate all to clear overlaps.
              
              for (const other of otherNodes) {
                  const otherBounds = getNodeBounds(other);
                  
                  // AABB Collision Check
                  const isOverlapping = (
                      myBounds.x < otherBounds.r && 
                      myBounds.r > otherBounds.x &&
                      myBounds.y < otherBounds.b && 
                      myBounds.b > otherBounds.y
                  );

                  if (isOverlapping) {
                       // Calculate overlap amounts on all 4 sides
                       const overlapLeft = myBounds.r - otherBounds.x;
                       const overlapRight = otherBounds.r - myBounds.x;
                       const overlapTop = myBounds.b - otherBounds.y;
                       const overlapBottom = otherBounds.b - myBounds.y;

                       // Find the smallest overlap (shortest path to separate)
                       const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

                       if (minOverlap === overlapLeft) {
                           draggedNode.x = otherBounds.x - myBounds.width - COLLISION_PADDING;
                       } else if (minOverlap === overlapRight) {
                           draggedNode.x = otherBounds.r + COLLISION_PADDING;
                       } else if (minOverlap === overlapTop) {
                           draggedNode.y = otherBounds.y - myBounds.height - COLLISION_PADDING;
                       } else if (minOverlap === overlapBottom) {
                           draggedNode.y = otherBounds.b + COLLISION_PADDING;
                       }

                       // Update temporary bounds for next iteration in loop
                       myBounds.x = draggedNode.x;
                       myBounds.y = draggedNode.y;
                       myBounds.r = draggedNode.x + myBounds.width;
                       myBounds.b = draggedNode.y + myBounds.height;
                  }
              }

              // Update State
              setNodes(prev => prev.map(n => n.id === draggingNodeId ? { ...n, x: draggedNode.x, y: draggedNode.y } : n));
          }
      }

      if (draggingNodeId || resizingNodeId || dragGroupRef.current) saveHistory();
      setIsDraggingCanvas(false); setDraggingNodeId(null); setDraggingNodeParentGroupId(null); setDraggingGroup(null); setResizingGroupId(null); setActiveGroupNodeIds([]); setResizingNodeId(null); setInitialSize(null); setResizeStartPos(null);
      dragNodeRef.current = null; resizeContextRef.current = null; dragGroupRef.current = null;
  }, [selectionRect, pan, scale, saveHistory, draggingNodeId, resizingNodeId, mousePos, getCompatibleOutputNodes, getCompatibleInputNodes]);

  useEffect(() => { window.addEventListener('mousemove', handleGlobalMouseMove); window.addEventListener('mouseup', handleGlobalMouseUp); return () => { window.removeEventListener('mousemove', handleGlobalMouseMove); window.removeEventListener('mouseup', handleGlobalMouseUp); }; }, [handleGlobalMouseMove, handleGlobalMouseUp]);

  const handleNodeUpdate = useCallback((id: string, data: any, size?: any, title?: string) => {
      setNodes(prev => prev.map(n => {
          if (n.id === id) {
              const updated = { ...n, data: { ...n.data, ...data }, title: title || n.title };
              if (size) { if (size.width) updated.width = size.width; if (size.height) updated.height = size.height; }
              
              if (data.image) handleAssetGenerated('image', data.image, updated.title);
              if (data.videoUri) handleAssetGenerated('video', data.videoUri, updated.title);
              if (data.audioUri) handleAssetGenerated('audio', data.audioUri, updated.title);

              return updated;
          }
          return n;
      }));
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
      const node = nodesRef.current.find(n => n.id === id); if (!node) return;
      handleNodeUpdate(id, { error: undefined });
      setNodes(p => p.map(n => n.id === id ? { ...n, status: NodeStatus.WORKING } : n));

      try {
          const inputs = node.inputs.map(i => nodesRef.current.find(n => n.id === i)).filter(Boolean) as AppNode[];
          
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

                          setGroups(prev => [...prev, { id: `g-${Date.now()}`, title: '分镜生成组', x: startX - groupPadding, y: startY - groupPadding, width: groupWidth, height: groupHeight }]);
                          setNodes(prev => [...prev, ...newNodes]);
                          setConnections(prev => [...prev, ...newConnections]);
                          handleNodeUpdate(id, { status: NodeStatus.SUCCESS });

                          newNodes.forEach(async (n) => {
                               try {
                                   const res = await generateImageFromText(n.data.prompt!, n.data.model!, inputImages, { aspectRatio: n.data.aspectRatio, resolution: n.data.resolution, count: 1 });
                                   handleNodeUpdate(n.id, { image: res[0], images: res, status: NodeStatus.SUCCESS });
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
              handleNodeUpdate(id, { image: res[0], images: res });

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
             handleNodeUpdate(id, { image: res });
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
✅ Output ONE single 21:9 image with 9 panels inside
✅ Panel 5 (center) = exact target: ${baseDistanceEN}, ${baseAzimuthEN}, ${baseElevationEN}
✅ All panels show angles NEAR ${baseAzimuthEN} (±20° variation)
✅ Character appearance identical in all panels
✅ Art style and visual aesthetic IDENTICAL in all panels (same as reference)
✅ Color palette and grading IDENTICAL in all panels
✅ Rendering technique IDENTICAL in all panels
✅ Thin dividing lines between panels

❌ Do NOT generate 9 separate images
❌ Do NOT use the reference image's viewing angle
❌ Do NOT show front view if target is side view
❌ Do NOT change art style, colors, or rendering between panels
❌ Do NOT apply different filters or effects to different panels`;
             
             if (userPrompt) {
                 geminiPrompt += `\n\n**【额外风格要求】：**\n${userPrompt}`;
             }
             
             console.log('[MultiAngleCamera] 使用 Gemini API 生成九宫格:', {
                 angle: cameraAngleDesc,
                 hasInputImage: !!inputImage,
                 cameraPositions,
                 prompt: geminiPrompt
             });
             
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
                     console.log('[MultiAngleCamera] Imagen 3 生成成功');
                 } catch (imagenError) {
                     console.warn('[MultiAngleCamera] Imagen 3 失败，尝试 Gemini Flash Image:', imagenError);
                     res = await generateImageFromText(
                         geminiPrompt,
                         'gemini-2.5-flash-image',
                         [inputImage],
                         { aspectRatio: '21:9', count: 1 }
                     );
                     console.log('[MultiAngleCamera] Gemini Flash Image 生成成功');
                 }
                 
                 console.log('[MultiAngleCamera] 生成成功:', res.length, '张图片');
                 
                 // 更新节点数据 - 九宫格图片会传递给下游节点
                 handleNodeUpdate(id, { 
                     gridImages: res,
                     image: res[0]  // 输出九宫格图片给下游节点（九宫格处理节点会自动切割）
                 });
                 
                 console.log('[MultiAngleCamera] 节点数据已更新');
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
          setNodes(p => p.map(n => n.id === id ? { ...n, status: NodeStatus.SUCCESS } : n));
      } catch (e: any) {
          handleNodeUpdate(id, { error: e.message });
          setNodes(p => p.map(n => n.id === id ? { ...n, status: NodeStatus.ERROR } : n));
      }
  }, [handleNodeUpdate]);

  
  const saveCurrentAsWorkflow = () => {
      const thumbnailNode = nodes.find(n => n.data.image);
      const thumbnail = thumbnailNode?.data.image || '';
      const newWf: Workflow = { id: `wf-${Date.now()}`, title: `工作流 ${new Date().toLocaleDateString()}`, thumbnail, nodes: JSON.parse(JSON.stringify(nodes)), connections: JSON.parse(JSON.stringify(connections)), groups: JSON.parse(JSON.stringify(groups)) };
      setWorkflows(prev => [newWf, ...prev]);
  };
  
  const saveGroupAsWorkflow = (groupId: string) => {
      const group = groups.find(g => g.id === groupId);
      if (!group) return;
      const nodesInGroup = nodes.filter(n => { const w = n.width || 420; const h = n.height || getApproxNodeHeight(n); const cx = n.x + w/2; const cy = n.y + h/2; return cx > group.x && cx < group.x + group.width && cy > group.y && cy < group.y + group.height; });
      const nodeIds = new Set(nodesInGroup.map(n => n.id));
      const connectionsInGroup = connections.filter(c => nodeIds.has(c.from) && nodeIds.has(c.to));
      const thumbNode = nodesInGroup.find(n => n.data.image);
      const thumbnail = thumbNode ? thumbNode.data.image : '';
      const newWf: Workflow = { id: `wf-${Date.now()}`, title: group.title || '未命名工作流', thumbnail: thumbnail || '', nodes: JSON.parse(JSON.stringify(nodesInGroup)), connections: JSON.parse(JSON.stringify(connectionsInGroup)), groups: [JSON.parse(JSON.stringify(group))] };
      setWorkflows(prev => [newWf, ...prev]);
  };

  const loadWorkflow = (id: string) => {
      const wf = workflows.find(w => w.id === id);
      if (wf) { saveHistory(); setNodes(JSON.parse(JSON.stringify(wf.nodes))); setConnections(JSON.parse(JSON.stringify(wf.connections))); setGroups(JSON.parse(JSON.stringify(wf.groups))); setSelectedWorkflowId(id); }
  };

  const deleteWorkflow = (id: string) => { setWorkflows(prev => prev.filter(w => w.id !== id)); if (selectedWorkflowId === id) setSelectedWorkflowId(null); };
  const renameWorkflow = (id: string, newTitle: string) => { setWorkflows(prev => prev.map(w => w.id === id ? { ...w, title: newTitle } : w)); };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'a') { e.preventDefault(); setSelectedNodeIds(nodesRef.current.map(n => n.id)); return; }
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); undo(); return; }
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'c') { const lastSelected = selectedNodeIds[selectedNodeIds.length - 1]; if (lastSelected) { const nodeToCopy = nodesRef.current.find(n => n.id === lastSelected); if (nodeToCopy) { e.preventDefault(); setClipboard(JSON.parse(JSON.stringify(nodeToCopy))); } } return; }
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'v') { if (clipboard) { e.preventDefault(); saveHistory(); const newNode: AppNode = { ...clipboard, id: `n-${Date.now()}-${Math.floor(Math.random()*1000)}`, x: clipboard.x + 50, y: clipboard.y + 50, status: NodeStatus.IDLE, inputs: [] }; setNodes(prev => [...prev, newNode]); setSelectedNodeIds([newNode.id]); } return; }
        if (e.key === 'Delete' || e.key === 'Backspace') { 
            if (selectedGroupId) { 
                e.preventDefault();
                saveHistory(); 
                
                // 找到组
                const group = groupsRef.current.find(g => g.id === selectedGroupId);
                if (group) {
                    // 找到组内的所有节点
                    const nodesInGroup = nodesRef.current.filter(n => { 
                        const w = n.width || 420; 
                        const h = getApproxNodeHeight(n); 
                        const cx = n.x + w/2; 
                        const cy = n.y + h/2; 
                        return cx > group.x && cx < group.x + group.width && cy > group.y && cy < group.y + group.height; 
                    });
                    
                    const nodeIdsToDelete = nodesInGroup.map(n => n.id);
                    
                    console.log('[批量删除] 删除组及其内部节点:', {
                        groupId: selectedGroupId,
                        groupTitle: group.title,
                        nodeCount: nodeIdsToDelete.length,
                        nodeIds: nodeIdsToDelete
                    });
                    
                    // 删除节点和相关连接
                    if (nodeIdsToDelete.length > 0) {
                        deleteNodes(nodeIdsToDelete);
                    }
                    
                    // 删除组
                    setGroups(prev => prev.filter(g => g.id !== selectedGroupId)); 
                    setSelectedGroupId(null); 
                }
                
                return; 
            } 
            
            if (selectedNodeIds.length > 0) { 
                deleteNodes(selectedNodeIds); 
            } 
        }
    };
    const handleKeyDownSpace = (e: KeyboardEvent) => { if (e.code === 'Space' && (e.target as HTMLElement).tagName !== 'INPUT' && (e.target as HTMLElement).tagName !== 'TEXTAREA') { document.body.classList.add('cursor-grab-override'); } };
    const handleKeyUpSpace = (e: KeyboardEvent) => { if (e.code === 'Space') { document.body.classList.remove('cursor-grab-override'); } };
    window.addEventListener('keydown', handleKeyDown); window.addEventListener('keydown', handleKeyDownSpace); window.addEventListener('keyup', handleKeyUpSpace);
    return () => { window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keydown', handleKeyDownSpace); window.removeEventListener('keyup', handleKeyUpSpace); };
  }, [selectedWorkflowId, selectedNodeIds, selectedGroupId, deleteNodes, undo, saveHistory, clipboard]);

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
              setNodes(prev => [...prev, ...newNodes]); setConnections(prev => [...prev, ...newConnections]); setGroups(prev => [...prev, ...newGroups]);
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
          className={`w-full h-full overflow-hidden text-slate-200 selection:bg-cyan-500/30 ${isDraggingCanvas ? 'cursor-grabbing' : 'cursor-default'}`}
          onMouseDown={handleCanvasMouseDown} onWheel={handleWheel} 
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
                      key={g.id} className={`absolute rounded-[32px] border transition-all ${(draggingGroup?.id === g.id || draggingNodeParentGroupId === g.id) ? 'duration-0' : 'duration-300'} ${selectedGroupId === g.id ? 'border-cyan-500/30 bg-cyan-500/5' : 'border-white/10 bg-white/5'}`} style={{ left: g.x, top: g.y, width: g.width, height: g.height }} 
                      onMouseDown={(e) => { 
                          e.stopPropagation(); setSelectedGroupId(g.id); 
                          const childNodes = nodes.filter(n => { const b = getNodeBounds(n); const cx = b.x + b.width/2; const cy = b.y + b.height/2; return cx>g.x && cx<g.x+g.width && cy>g.y && cy<g.y+g.height; }).map(n=>({id:n.id, startX:n.x, startY:n.y}));
                          dragGroupRef.current = { id: g.id, startX: g.x, startY: g.y, mouseStartX: e.clientX, mouseStartY: e.clientY, childNodes };
                          setActiveGroupNodeIds(childNodes.map(c => c.id)); setDraggingGroup({ id: g.id }); 
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
                      const f = nodes.find(n => n.id === conn.from), t = nodes.find(n => n.id === conn.to);
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
                          const startNode = nodes.find(n => n.id === connectionStart.id); 
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

              {nodes.map(node => (
              <Node
                  key={node.id} node={node} onUpdate={handleNodeUpdate} onAction={handleNodeAction} onDelete={(id) => deleteNodes([id])} onExpand={setExpandedMedia} onCrop={(id, img) => { setCroppingNodeId(id); setImageToCrop(img); }}
                  onNodeMouseDown={(e, id) => { 
                      e.stopPropagation(); 
                      if (e.shiftKey || e.metaKey || e.ctrlKey) { setSelectedNodeIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]); } else { setSelectedNodeIds([id]); }
                      const n = nodes.find(x => x.id === id);
                      if (n) {
                          const w = n.width || 420; const h = n.height || getApproxNodeHeight(n); const cx = n.x + w/2; const cy = n.y + 160; 
                          const pGroup = groups.find(g => { return cx > g.x && cx < g.x + g.width && cy > g.y && cy < g.y + g.height; });
                          let siblingNodeIds: string[] = [];
                          if (pGroup) { siblingNodeIds = nodes.filter(other => { if (other.id === id) return false; const b = getNodeBounds(other); const ocx = b.x + b.width/2; const ocy = b.y + b.height/2; return ocx > pGroup.x && ocx < pGroup.x + pGroup.width && ocy > pGroup.y && ocy < pGroup.y + pGroup.height; }).map(s => s.id); }
                          dragNodeRef.current = { id, startX: n.x, startY: n.y, mouseStartX: e.clientX, mouseStartY: e.clientY, parentGroupId: pGroup?.id, siblingNodeIds, nodeWidth: w, nodeHeight: h };
                          setDraggingNodeParentGroupId(pGroup?.id || null); setDraggingNodeId(id); 
                      }
                  }}
                  onPortMouseDown={(e, id, type) => { e.stopPropagation(); setConnectionStart({ id, x: e.clientX, y: e.clientY, portType: type }); }}
                  onPortMouseUp={(e, id, type) => { 
                      e.stopPropagation(); 
                      const start = connectionStartRef.current; 
                      if (start && start.id !== id) {
                          if (start.id === 'smart-sequence-dock') { 
                              // Smart sequence dock 连接逻辑
                              setConnectionStart(null);
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
                                  setConnections(p => [...p, { from: fromId, to: toId }]); 
                                  setNodes(p => p.map(n => n.id === toId ? { ...n, inputs: [...n.inputs, fromId] } : n)); 
                                  // 成功连接后清除状态
                                  setConnectionStart(null);
                              }
                          }
                      } 
                      // 注意：不要在这里清除 connectionStart，让 handleGlobalMouseUp 处理未连接的情况
                  }}
                  onNodeContextMenu={(e, id) => { e.stopPropagation(); e.preventDefault(); setContextMenu({ visible: true, x: e.clientX, y: e.clientY, id }); setContextMenuTarget({ type: 'node', id }); }}
                  onResizeMouseDown={(e, id, w, h) => { 
                      e.stopPropagation(); const n = nodes.find(x => x.id === id);
                      if (n) {
                          const cx = n.x + w/2; const cy = n.y + 160; 
                          const pGroup = groups.find(g => { return cx > g.x && cx < g.x + g.width && cy > g.y && cy < g.y + g.height; });
                          setDraggingNodeParentGroupId(pGroup?.id || null);
                          let siblingNodeIds: string[] = [];
                          if (pGroup) { siblingNodeIds = nodes.filter(other => { if (other.id === id) return false; const b = getNodeBounds(other); const ocx = b.x + b.width/2; const ocy = b.y + b.height/2; return ocx > pGroup.x && ocx < pGroup.x + pGroup.width && ocy > pGroup.y && ocy < pGroup.y + pGroup.height; }).map(s => s.id); }
                          resizeContextRef.current = { nodeId: id, initialWidth: w, initialHeight: h, startX: e.clientX, startY: e.clientY, parentGroupId: pGroup?.id || null, siblingNodeIds };
                      }
                      setResizingNodeId(id); setInitialSize({ width: w, height: h }); setResizeStartPos({ x: e.clientX, y: e.clientY }); 
                  }}
                  isSelected={selectedNodeIds.includes(node.id)} 
                  inputAssets={node.inputs.map(i => nodes.find(n => n.id === i)).filter(n => n && (n.data.image || n.data.videoUri || n.data.croppedFrame)).slice(0, 6).map(n => ({ id: n!.id, type: (n!.data.croppedFrame || n!.data.image) ? 'image' : 'video', src: n!.data.croppedFrame || n!.data.image || n!.data.videoUri! }))}
                  onInputReorder={(nodeId, newOrder) => { const node = nodes.find(n => n.id === nodeId); if (node) { setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, inputs: newOrder } : n)); } }}
                  isDragging={draggingNodeId === node.id} isResizing={resizingNodeId === node.id} isConnecting={!!connectionStart} isGroupDragging={activeGroupNodeIds.includes(node.id)}
              />
              ))}

              {selectionRect && <div className="absolute border border-cyan-500/40 bg-cyan-500/10 rounded-lg pointer-events-none" style={{ left: (Math.min(selectionRect.startX, selectionRect.currentX) - pan.x) / scale, top: (Math.min(selectionRect.startY, selectionRect.currentY) - pan.y) / scale, width: Math.abs(selectionRect.currentX - selectionRect.startX) / scale, height: Math.abs(selectionRect.currentY - selectionRect.startY) / scale }} />}
          </div>

          {contextMenu && (
              <div className="fixed z-[100] bg-[#2c2c2e]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-1 min-w-[140px] animate-in fade-in zoom-in-95 duration-200 origin-top-left" style={{ top: contextMenu.y, left: contextMenu.x }} onMouseDown={(e) => e.stopPropagation()}>
                  {contextMenuTarget?.type === 'node' && (
                      <>
                          <button className="w-full text-left px-3 py-1.5 text-[11px] font-medium text-white/90 hover:bg-cyan-500/20 hover:text-cyan-300 rounded-lg flex items-center gap-2 transition-colors" onClick={() => { const targetNode = nodes.find(n => n.id === contextMenu.id); if (targetNode) setClipboard(JSON.parse(JSON.stringify(targetNode))); setContextMenu(null); }}>
                              <Copy size={12} /> 复制节点
                          </button>
                          {(() => { const targetNode = nodes.find(n => n.id === contextMenu.id); if (targetNode) { const isVideo = targetNode.type === NodeType.VIDEO_GENERATOR || targetNode.type === NodeType.VIDEO_ANALYZER; const isImage = targetNode.type === NodeType.IMAGE_GENERATOR || targetNode.type === NodeType.IMAGE_EDITOR; if (isVideo || isImage) { return ( <button className="w-full text-left px-3 py-1.5 text-[11px] font-medium text-white/90 hover:bg-purple-500/20 hover:text-purple-300 rounded-lg flex items-center gap-2 transition-colors" onClick={() => { replacementTargetRef.current = contextMenu.id; if (isVideo) replaceVideoInputRef.current?.click(); else replaceImageInputRef.current?.click(); setContextMenu(null); }}> <RefreshCw size={12} /> 替换素材 </button> ); } } return null; })()}
                          <button className="w-full text-left px-3 py-1.5 text-[11px] font-medium text-red-400 hover:bg-red-500/20 rounded-lg flex items-center gap-2 transition-colors mt-0.5" onClick={() => { deleteNodes([contextMenuTarget.id]); setContextMenu(null); }}><Trash2 size={12} /> 删除节点</button>
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
                                          
                                          // 创建新节点
                                          const newNodeId = `n-${Date.now()}-${Math.floor(Math.random()*1000)}`;
                                          const defaults: any = { 
                                              model: t === NodeType.VIDEO_GENERATOR ? 'veo-3.1-fast-generate-preview' :
                                                     t === NodeType.VIDEO_ANALYZER ? 'gemini-3-pro-preview' :
                                                     t === NodeType.AUDIO_GENERATOR ? 'gemini-2.5-flash-preview-tts' :
                                                     t.includes('IMAGE') ? 'gemini-2.5-flash-image' :
                                                     'gemini-3-pro-preview',
                                              generationMode: t === NodeType.VIDEO_GENERATOR ? 'DEFAULT' : undefined,
                                          };
                                          
                                          const typeMap: Record<string, string> = {
                                              [NodeType.PROMPT_INPUT]: '创意描述',
                                              [NodeType.IMAGE_GENERATOR]: '文字生图',
                                              [NodeType.VIDEO_GENERATOR]: '文生视频',
                                              [NodeType.AUDIO_GENERATOR]: '灵感音乐',
                                              [NodeType.VIDEO_ANALYZER]: '视频分析',
                                              [NodeType.IMAGE_EDITOR]: '图像编辑'
                                          };
                                          
                                          const newNode: AppNode = {
                                              id: newNodeId,
                                              type: t,
                                              x: nodeX,
                                              y: nodeY,
                                              width: 420,
                                              title: typeMap[t] || '未命名节点',
                                              status: NodeStatus.IDLE,
                                              data: defaults,
                                              inputs: []
                                          };
                                          
                                          // 根据拖拽方向建立连接
                                          if (contextMenuTarget.portType === 'output') {
                                              // 从输出拖拽 → 源节点连接到新节点
                                              newNode.inputs = [contextMenuTarget.sourceNodeId];
                                              setConnections(prev => [...prev, { from: contextMenuTarget.sourceNodeId, to: newNodeId }]);
                                          } else {
                                              // 从输入拖拽 → 新节点连接到源节点
                                              setConnections(prev => [...prev, { from: newNodeId, to: contextMenuTarget.sourceNodeId }]);
                                              setNodes(prev => prev.map(n => 
                                                  n.id === contextMenuTarget.sourceNodeId 
                                                      ? { ...n, inputs: [...n.inputs, newNodeId] }
                                                      : n
                                              ));
                                          }
                                          
                                          setNodes(prev => [...prev, newNode]);
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
                           <button className="w-full text-left px-3 py-1.5 text-[11px] font-medium text-red-400 hover:bg-red-500/20 rounded-lg flex items-center gap-2 transition-colors" onClick={() => { setGroups(p => p.filter(g => g.id !== contextMenu.id)); setContextMenu(null); }}> <Trash2 size={12} /> 删除分组 </button>
                      </>
                  )}
                  {contextMenuTarget?.type === 'connection' && (
                      <button className="w-full text-left px-3 py-1.5 text-[11px] font-medium text-red-400 hover:bg-red-500/20 rounded-lg flex items-center gap-2 transition-colors" onClick={() => { setConnections(prev => prev.filter(c => c.from !== contextMenuTarget.from || c.to !== contextMenuTarget.to)); setNodes(prev => prev.map(n => n.id === contextMenuTarget.to ? { ...n, inputs: n.inputs.filter(i => i !== contextMenuTarget.from) } : n)); setContextMenu(null); }}> <Unplug size={12} /> 删除连接线 </button>
                  )}
              </div>
          )}
          
          {croppingNodeId && imageToCrop && <ImageCropper imageSrc={imageToCrop} onCancel={() => {setCroppingNodeId(null); setImageToCrop(null);}} onConfirm={(b) => {handleNodeUpdate(croppingNodeId, {croppedFrame: b}); setCroppingNodeId(null); setImageToCrop(null);}} />}
          <ExpandedView media={expandedMedia} onClose={() => setExpandedMedia(null)} />
          {isSketchEditorOpen && <SketchEditor onClose={() => setIsSketchEditorOpen(false)} onGenerate={handleSketchResult} />}
          <SmartSequenceDock 
             isOpen={isMultiFrameOpen} 
             onClose={() => setIsMultiFrameOpen(false)} 
             onGenerate={handleMultiFrameGenerate}
             onConnectStart={(e, type) => { e.preventDefault(); e.stopPropagation(); setConnectionStart({ id: 'smart-sequence-dock', x: e.clientX, y: e.clientY }); }}
          />
          <SonicStudio 
            isOpen={isSonicStudioOpen}
            onClose={() => setIsSonicStudioOpen(false)}
            history={assetHistory.filter(a => a.type === 'audio')}
            onGenerate={(src, prompt) => handleAssetGenerated('audio', src, prompt)}
          />
          <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

          <SidebarDock 
              onAddNode={addNode}
              onUndo={undo}
              isChatOpen={isChatOpen}
              onToggleChat={() => setIsChatOpen(!isChatOpen)}
              isMultiFrameOpen={isMultiFrameOpen}
              onToggleMultiFrame={() => setIsMultiFrameOpen(!isMultiFrameOpen)}
              isSonicStudioOpen={isSonicStudioOpen}
              onToggleSonicStudio={() => setIsSonicStudioOpen(!isSonicStudioOpen)}
              assetHistory={assetHistory}
              onHistoryItemClick={(item) => { const type = item.type.includes('image') ? NodeType.IMAGE_GENERATOR : NodeType.VIDEO_GENERATOR; const data = item.type === 'image' ? { image: item.src } : { videoUri: item.src }; addNode(type, undefined, undefined, data); }}
              onDeleteAsset={(id) => setAssetHistory(prev => prev.filter(a => a.id !== id))}
              workflows={workflows}
              selectedWorkflowId={selectedWorkflowId}
              onSelectWorkflow={loadWorkflow}
              onSaveWorkflow={saveCurrentAsWorkflow}
              onDeleteWorkflow={deleteWorkflow}
              onRenameWorkflow={renameWorkflow}
              onOpenSettings={() => setIsSettingsOpen(true)}
              selectedGroupId={selectedGroupId}
              onArrangeGroup={handleArrangeGroup}
          />

          <AssistantPanel isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

          <div className="absolute bottom-8 right-8 flex items-center gap-3 px-4 py-2 bg-[#1c1c1e]/80 backdrop-blur-2xl border border-white/10 rounded-full shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <button onClick={() => setScale(s => Math.max(0.2, s - 0.1))} className="p-1.5 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-white/10"><Minus size={14} strokeWidth={3} /></button>
              <div className="flex items-center gap-2 min-w-[100px]">
                   <input type="range" min="0.2" max="3" step="0.1" value={scale} onChange={(e) => setScale(parseFloat(e.target.value))} className="w-24 h-1 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-lg hover:[&::-webkit-slider-thumb]:scale-125 transition-all" />
                   <span className="text-[10px] font-bold text-slate-400 w-8 text-right tabular-nums cursor-pointer hover:text-white" onClick={() => setScale(1)} title="Reset Zoom">{Math.round(scale * 100)}%</span>
              </div>
              <button onClick={() => setScale(s => Math.min(3, s + 0.1))} className="p-1.5 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-white/10"><Plus size={14} strokeWidth={3} /></button>
              <button onClick={handleFitView} className="p-1.5 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-white/10 ml-2 border-l border-white/10 pl-3" title="适配视图">
                  <Scan size={14} strokeWidth={3} />
              </button>
          </div>
      </div>
    </div>
  );
};
