// 🔥 FORCE UPDATE: 2026-01-25 23:52:00 - 底部面板已彻底删除
// ... existing imports
import { AppNode, NodeStatus, NodeType } from '../types';
import { RefreshCw, Play, Image as ImageIcon, Video as VideoIcon, Type, AlertCircle, CheckCircle, Plus, Maximize2, Download, MoreHorizontal, Wand2, Scaling, FileSearch, Edit, Loader2, Layers, Trash2, X, Upload, Scissors, Film, MousePointerClick, Crop as CropIcon, ChevronDown, ChevronUp, GripHorizontal, Link, Copy, Monitor, Music, Pause, Volume2, Mic2 } from 'lucide-react';
import { VideoModeSelector, SceneDirectorOverlay } from './VideoNodeModules';
import { MultiAngleCameraNode } from './MultiAngleCameraNode';
import { GridSplitterNode } from './GridSplitterNode';
import { ScriptNode } from './ScriptNode';
import React, { memo, useRef, useState, useEffect, useCallback } from 'react';

// ... (keep constants and helper functions: arePropsEqual, safePlay, safePause, InputThumbnails, AudioVisualizer) ...

// Restore missing constants
interface InputAsset {
    id: string;
    type: 'image' | 'video';
    src: string;
}

// 🔥 关键修复：继承 HTMLAttributes，让 props 可以传递到最外层 div
interface NodeProps extends React.HTMLAttributes<HTMLDivElement> {
  node: AppNode;
  onUpdate: (id: string, data: Partial<AppNode['data']>, size?: { width?: number, height?: number }, title?: string) => void;
  onAction: (id: string, prompt?: string) => void;
  onDelete: (id: string) => void;
  onExpand?: (data: { type: 'image' | 'video', src: string, rect: DOMRect, images?: string[], initialIndex?: number }) => void;
  onCrop?: (id: string, imageBase64: string) => void; 
  onNodeMouseDown: (e: React.MouseEvent, id: string) => void;
  onPortMouseDown: (e: React.MouseEvent, id: string, type: 'input' | 'output') => void;
  onPortMouseUp: (e: React.MouseEvent, id: string, type: 'input' | 'output') => void;
  onNodeContextMenu: (e: React.MouseEvent, id: string) => void;
  onMediaContextMenu?: (e: React.MouseEvent, nodeId: string, type: 'image' | 'video', src: string) => void;
  onResizeMouseDown: (e: React.MouseEvent, id: string, initialWidth: number, initialHeight: number) => void;
  inputAssets?: InputAsset[];
  onInputReorder?: (nodeId: string, newOrder: string[]) => void;
  onCreateWorkflow?: (scriptNodeId: string) => void;  // 新增：生成工作流回调
  
  isDragging?: boolean;
  isGroupDragging?: boolean;
  isSelected?: boolean;
  isResizing?: boolean;
  isConnecting?: boolean; 
}

const IMAGE_ASPECT_RATIOS = ['1:1', '3:4', '4:3', '9:16', '16:9'];
const VIDEO_ASPECT_RATIOS = ['1:1', '3:4', '4:3', '9:16', '16:9'];
const IMAGE_RESOLUTIONS = ['1k', '2k', '4k'];
const VIDEO_RESOLUTIONS = ['480p', '720p', '1080p'];
const IMAGE_COUNTS = [1, 2, 3, 4];
const VIDEO_COUNTS = [1, 2, 3, 4];
const GLASS_PANEL = "bg-[#FAFBFC] border border-gray-400 shadow-[0_2px_8px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.06)]";
const DEFAULT_NODE_WIDTH = 420;
const DEFAULT_FIXED_HEIGHT = 360; 
const AUDIO_NODE_HEIGHT = 200;

// --- SECURE VIDEO COMPONENT ---
// Fetches video as blob to bypass auth/cors issues with <video src>
const SecureVideo = ({ src, className, autoPlay, muted, loop, onMouseEnter, onMouseLeave, onClick, controls, videoRef, style }: any) => {
    const [blobUrl, setBlobUrl] = useState<string | null>(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!src) return;
        if (src.startsWith('data:') || src.startsWith('blob:')) {
            setBlobUrl(src);
            return;
        }

        let active = true;
        // Fetch the video content
        fetch(src)
            .then(response => {
                if (!response.ok) throw new Error("Video fetch failed");
                return response.blob();
            })
            .then(blob => {
                if (active) {
                    // FORCE MIME TYPE TO VIDEO/MP4 to fix black screen issues with generic binary blobs
                    const mp4Blob = new Blob([blob], { type: 'video/mp4' });
                    const url = URL.createObjectURL(mp4Blob);
                    setBlobUrl(url);
                }
            })
            .catch(err => {
                console.error("SecureVideo load error:", err);
                if (active) setError(true);
            });

        return () => {
            active = false;
            if (blobUrl && !blobUrl.startsWith('data:')) {
                URL.revokeObjectURL(blobUrl);
            }
        };
    }, [src]);

    if (error) {
        return <div className={`flex items-center justify-center bg-zinc-800 text-xs text-red-400 ${className}`}>Load Error</div>;
    }

    if (!blobUrl) {
        return <div className={`flex items-center justify-center bg-gray-100 ${className}`}><Loader2 className="animate-spin text-zinc-600" /></div>;
    }

    return (
        <video 
            ref={videoRef}
            src={blobUrl} 
            className={className}
            autoPlay={autoPlay}
            muted={muted}
            loop={loop}
            controls={controls}
            playsInline
            preload="auto"
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onClick={onClick}
            style={{ backgroundColor: '#18181b', ...style }} // Force background and apply passed styles
        />
    );
};

// Helper for safe video playback
const safePlay = (e: React.SyntheticEvent<HTMLVideoElement> | HTMLVideoElement) => {
    const vid = (e as any).currentTarget || e;
    if (!vid) return;
    const p = vid.play();
    if (p !== undefined) {
        p.catch((error: any) => {
            // Ignore AbortError which happens when pausing immediately after playing
            if (error.name !== 'AbortError') {
                console.debug("Video play prevented:", error);
            }
        });
    }
};

const safePause = (e: React.SyntheticEvent<HTMLVideoElement> | HTMLVideoElement) => {
    const vid = (e as any).currentTarget || e;
    if (vid) {
        vid.pause();
        vid.currentTime = 0; // Optional: reset to start
    }
};

// Custom Comparator for React.memo to prevent unnecessary re-renders during drag
const arePropsEqual = (prev: NodeProps, next: NodeProps) => {
    // 快速检查：交互状态变化
    if (prev.isDragging !== next.isDragging || 
        prev.isResizing !== next.isResizing || 
        prev.isSelected !== next.isSelected ||
        prev.isGroupDragging !== next.isGroupDragging ||
        prev.isConnecting !== next.isConnecting) {
        return false;
    }
    
    // 深度比较节点关键属性（避免引用比较导致的无效渲染）
    const prevNode = prev.node;
    const nextNode = next.node;
    
    if (prevNode.id !== nextNode.id) return false;
    if (prevNode.type !== nextNode.type) return false;
    if (prevNode.status !== nextNode.status) return false;
    if (prevNode.title !== nextNode.title) return false;
    if (prevNode.x !== nextNode.x || prevNode.y !== nextNode.y) return false;
    if (prevNode.width !== nextNode.width || prevNode.height !== nextNode.height) return false;
    
    // 比较 data 对象的关键字段（避免深度比较整个 data）
    const prevData = prevNode.data;
    const nextData = nextNode.data;
    
    // 比较常用字段
    if (prevData.prompt !== nextData.prompt) return false;
    if (prevData.image !== nextData.image) return false;
    if (prevData.videoUri !== nextData.videoUri) return false;
    if (prevData.audioUri !== nextData.audioUri) return false;
    if (prevData.error !== nextData.error) return false;
    if (prevData.model !== nextData.model) return false;
    if (prevData.aspectRatio !== nextData.aspectRatio) return false;
    
    // 比较数组字段（浅比较）
    if (prevData.images?.length !== nextData.images?.length) return false;
    if (prevData.gridImages?.length !== nextData.gridImages?.length) return false;
    if (prevData.croppedImages?.length !== nextData.croppedImages?.length) return false;
    
    // 比较 inputs 数组
    if (prevNode.inputs?.length !== nextNode.inputs?.length) return false;
    if (prevNode.inputs && nextNode.inputs) {
        for (let i = 0; i < prevNode.inputs.length; i++) {
            if (prevNode.inputs[i] !== nextNode.inputs[i]) return false;
        }
    }
    
    // 比较 inputAssets
    const prevInputs = prev.inputAssets || [];
    const nextInputs = next.inputAssets || [];
    if (prevInputs.length !== nextInputs.length) return false;
    for(let i = 0; i < prevInputs.length; i++) {
        if (prevInputs[i].id !== nextInputs[i].id || prevInputs[i].src !== nextInputs[i].src) return false;
    }
    
    return true;
};

const InputThumbnails = ({ assets, onReorder }: { assets: InputAsset[], onReorder: (newOrder: string[]) => void }) => {
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const [dragOffset, setDragOffset] = useState(0);
    const onReorderRef = useRef(onReorder);
    onReorderRef.current = onReorder; 
    const stateRef = useRef({ draggingId: null as string | null, startX: 0, originalAssets: [] as InputAsset[] });
    const THUMB_WIDTH = 48; 
    const GAP = 6;
    const ITEM_FULL_WIDTH = THUMB_WIDTH + GAP;

    const handleGlobalMouseMove = useCallback((e: MouseEvent) => {
        if (!stateRef.current.draggingId) return;
        const delta = e.clientX - stateRef.current.startX;
        setDragOffset(delta);
    }, []);

    const handleGlobalMouseUp = useCallback((e: MouseEvent) => {
        if (!stateRef.current.draggingId) return;
        const { draggingId, startX, originalAssets } = stateRef.current;
        const currentOffset = e.clientX - startX;
        const moveSlots = Math.round(currentOffset / ITEM_FULL_WIDTH);
        const currentIndex = originalAssets.findIndex(a => a.id === draggingId);
        const newIndex = Math.max(0, Math.min(originalAssets.length - 1, currentIndex + moveSlots));

        if (newIndex !== currentIndex) {
            const newOrderIds = originalAssets.map(a => a.id);
            const [moved] = newOrderIds.splice(currentIndex, 1);
            newOrderIds.splice(newIndex, 0, moved);
            onReorderRef.current(newOrderIds);
        }
        setDraggingId(null);
        setDragOffset(0);
        stateRef.current.draggingId = null;
        document.body.style.cursor = '';
        window.removeEventListener('mousemove', handleGlobalMouseMove);
        window.removeEventListener('mouseup', handleGlobalMouseUp);
    }, [ITEM_FULL_WIDTH]); 
    
    useEffect(() => {
        return () => {
            document.body.style.cursor = '';
            window.removeEventListener('mousemove', handleGlobalMouseMove);
            window.removeEventListener('mouseup', handleGlobalMouseUp);
        }
    }, [handleGlobalMouseMove, handleGlobalMouseUp]);

    const handleMouseDown = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        e.preventDefault();
        setDraggingId(id);
        setDragOffset(0);
        stateRef.current = { draggingId: id, startX: e.clientX, originalAssets: [...assets] };
        document.body.style.cursor = 'grabbing';
        window.addEventListener('mousemove', handleGlobalMouseMove);
        window.addEventListener('mouseup', handleGlobalMouseUp);
    };

    if (!assets || assets.length === 0) return null;

    return (
        <div className="flex items-center justify-center h-14 pointer-events-none select-none relative z-0" onMouseDown={e => e.stopPropagation()}>
            <div className="relative flex items-center gap-[6px]">
                {assets.map((asset, index) => {
                    const isItemDragging = asset.id === draggingId;
                    const originalIndex = assets.findIndex(a => a.id === draggingId);
                    let translateX = 0;
                    let scale = 1;
                    let zIndex = 10;
                    
                    if (isItemDragging) {
                        translateX = dragOffset;
                        scale = 1.15;
                        zIndex = 100;
                    } else if (draggingId) {
                        const draggingVirtualIndex = Math.max(0, Math.min(assets.length - 1, originalIndex + Math.round(dragOffset / ITEM_FULL_WIDTH)));
                        if (index > originalIndex && index <= draggingVirtualIndex) translateX = -ITEM_FULL_WIDTH;
                        else if (index < originalIndex && index >= draggingVirtualIndex) translateX = ITEM_FULL_WIDTH;
                    }
                    const isVideo = asset.type === 'video';
                    return (
                        <div 
                            key={asset.id}
                            className={`relative rounded-md overflow-hidden cursor-grab active:cursor-grabbing pointer-events-auto border border-white/20 shadow-lg bg-black/60 group`}
                            style={{
                                width: `${THUMB_WIDTH}px`, height: `${THUMB_WIDTH}px`, 
                                transform: `translateX(${translateX}px) scale(${scale})`,
                                zIndex,
                                transition: isItemDragging ? 'none' : 'transform 0.5s cubic-bezier(0.32,0.72,0,1)', 
                            }}
                            onMouseDown={(e) => handleMouseDown(e, asset.id)}
                        >
                            {isVideo ? (
                                <SecureVideo src={asset.src} className="w-full h-full object-cover pointer-events-none select-none opacity-80 group-hover:opacity-100 transition-opacity bg-gray-100" muted loop autoPlay />
                            ) : (
                                <img src={asset.src} className="w-full h-full object-cover pointer-events-none select-none opacity-80 group-hover:opacity-100 transition-opacity bg-gray-100" alt="" />
                            )}
                            <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-md"></div>
                            <div className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 z-20 shadow-sm pointer-events-none">
                                <span className="text-[9px] font-bold text-white leading-none">{index + 1}</span>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
};

const AudioVisualizer = ({ isPlaying }: { isPlaying: boolean }) => (
    <div className="flex items-center justify-center gap-[2px] h-12 w-full opacity-60">
        {[...Array(20)].map((_, i) => (
            <div key={i} className="w-1 bg-cyan-400/80 rounded-full" style={{ height: isPlaying ? `${20 + Math.random() * 80}%` : '20%', transition: 'height 0.1s ease', animation: isPlaying ? `pulse 0.5s infinite ${i * 0.05}s` : 'none' }} />
        ))}
    </div>
);

// 🔥 关键修复：接收 ...props 并展开到最外层 div
const NodeComponent: React.FC<NodeProps> = ({ 
  node, onUpdate, onAction, onDelete, onExpand, onCrop, onNodeMouseDown, onPortMouseDown, onPortMouseUp, onNodeContextMenu, onMediaContextMenu, onResizeMouseDown, inputAssets, onInputReorder, onCreateWorkflow, isDragging, isGroupDragging, isSelected, isResizing, isConnecting,
  className, style, ...props // 🔥 提取 className, style, 和其他 HTML 属性
}) => {
  const isWorking = node.status === NodeStatus.WORKING;
  const mediaRef = useRef<HTMLImageElement | HTMLVideoElement | HTMLAudioElement | null>(null);
  const playPromiseRef = useRef<Promise<void> | null>(null); 
  const isHoveringRef = useRef(false);
  const [videoBlobUrl, setVideoBlobUrl] = useState<string | null>(null);
  const [isLoadingVideo, setIsLoadingVideo] = useState(false); 
  const [showImageGrid, setShowImageGrid] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(node.title);
  const [isHovered, setIsHovered] = useState(false); 
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const generationMode = node.data.generationMode || 'CONTINUE';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localPrompt, setLocalPrompt] = useState(node.data.prompt || '');
  const [inputHeight, setInputHeight] = useState(48); 
  const isResizingInput = useRef(false);
  const inputStartDragY = useRef(0);
  const inputStartHeight = useRef(0);
  
  // 🆕 节点进入动画状态
  const [isEntering, setIsEntering] = useState(true);
  
  // 🆕 节点创建后，200ms 后移除进入动画类
  useEffect(() => {
    const timer = setTimeout(() => setIsEntering(false), 200);
    return () => clearTimeout(timer);
  }, []);
  
  useEffect(() => { setLocalPrompt(node.data.prompt || ''); }, [node.data.prompt]);
  const commitPrompt = () => { if (localPrompt !== (node.data.prompt || '')) onUpdate(node.id, { prompt: localPrompt }); };
  const handleActionClick = () => { commitPrompt(); onAction(node.id, localPrompt); };
  const handleCmdEnter = (e: React.KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); commitPrompt(); onAction(node.id, localPrompt); }};
  
  const handleInputResizeStart = (e: React.MouseEvent) => {
      e.stopPropagation(); e.preventDefault();
      isResizingInput.current = true; inputStartDragY.current = e.clientY; inputStartHeight.current = inputHeight;
      const handleGlobalMouseMove = (e: MouseEvent) => { 
          if (!isResizingInput.current) return; 
          setInputHeight(Math.max(48, Math.min(inputStartHeight.current + (e.clientY - inputStartDragY.current), 300))); 
      };
      const handleGlobalMouseUp = () => { isResizingInput.current = false; window.removeEventListener('mousemove', handleGlobalMouseMove); window.removeEventListener('mouseup', handleGlobalMouseUp); };
      window.addEventListener('mousemove', handleGlobalMouseMove); window.addEventListener('mouseup', handleGlobalMouseUp);
  };

  React.useEffect(() => {
      if (videoBlobUrl) { URL.revokeObjectURL(videoBlobUrl); setVideoBlobUrl(null); }
      if ((node.type === NodeType.VIDEO_GENERATOR || node.type === NodeType.VIDEO_ANALYZER) && node.data.videoUri) {
          if (node.data.videoUri.startsWith('data:')) { setVideoBlobUrl(node.data.videoUri); return; }
          let isActive = true; setIsLoadingVideo(true);
          // Standard fetch for local usage in analysis/display
          fetch(node.data.videoUri).then(res => res.blob()).then(blob => { 
              if (isActive) { 
                  // Force video/mp4 for local analysis blob too
                  const mp4Blob = new Blob([blob], { type: 'video/mp4' });
                  setVideoBlobUrl(URL.createObjectURL(mp4Blob)); 
                  setIsLoadingVideo(false); 
              }
          }).catch(err => { if (isActive) setIsLoadingVideo(false); });
          return () => { isActive = false; if (videoBlobUrl) URL.revokeObjectURL(videoBlobUrl); };
      }
  }, [node.data.videoUri, node.type]);

  const toggleAudio = (e: React.MouseEvent) => {
      e.stopPropagation();
      const audio = mediaRef.current as HTMLAudioElement;
      if (!audio) return;
      if (audio.paused) { audio.play(); setIsPlayingAudio(true); } else { audio.pause(); setIsPlayingAudio(false); }
  };

  useEffect(() => {
    return () => {
        if (mediaRef.current && (mediaRef.current instanceof HTMLVideoElement || mediaRef.current instanceof HTMLAudioElement)) {
            try { mediaRef.current.pause(); mediaRef.current.src = ""; mediaRef.current.load(); } catch (e) {}
        }
    }
  }, []);

  const handleMouseEnter = () => {
    isHoveringRef.current = true;
    if(node.data.images?.length > 1 || (node.data.videoUris && node.data.videoUris.length > 1)) setShowImageGrid(true);
    
    // Play Video on Hover
    if (mediaRef.current instanceof HTMLVideoElement) {
        safePlay(mediaRef.current);
    }
  };

  const handleMouseLeave = () => {
    isHoveringRef.current = false;
    setShowImageGrid(false);

    // Pause Video on Leave
    if (mediaRef.current instanceof HTMLVideoElement) {
        safePause(mediaRef.current);
    }
  };
  
  const handleExpand = (e: React.MouseEvent) => { 
      e.stopPropagation(); 
      if (onExpand && mediaRef.current) { 
          const rect = mediaRef.current.getBoundingClientRect(); 
          if (node.type.includes('IMAGE') && node.data.image) {
              onExpand({ type: 'image', src: node.data.image, rect, images: node.data.images || [node.data.image], initialIndex: (node.data.images || [node.data.image]).indexOf(node.data.image) }); 
          } else if (node.type.includes('VIDEO') && node.data.videoUri) {
              const src = node.data.videoUri;
              const videos = node.data.videoUris && node.data.videoUris.length > 0 ? node.data.videoUris : [src];
              const currentIndex = node.data.videoUris ? node.data.videoUris.indexOf(node.data.videoUri) : 0;
              const safeIndex = currentIndex >= 0 ? currentIndex : 0;
              // Pass the URIs directly; ExpandedView will use SecureVideo logic
              onExpand({ type: 'video', src: src, rect, images: videos, initialIndex: safeIndex }); 
          }
      }
  };
  const handleDownload = (e: React.MouseEvent) => { e.stopPropagation(); const a = document.createElement('a'); a.href = node.data.image || videoBlobUrl || node.data.audioUri || ''; a.download = `sunstudio-${Date.now()}`; document.body.appendChild(a); a.click(); document.body.removeChild(a); };
  
  // 🔥 零拷贝优化：上传视频（不读取文件内容，直接创建 Blob URL）
  const handleUploadVideo = async (e: React.ChangeEvent<HTMLInputElement>) => { 
      const file = e.target.files?.[0]; 
      if (file) { 
          // 1. 零拷贝：直接创建 Blob URL
          const blobUrl = URL.createObjectURL(file);
          console.log(`[Node] 上传视频，创建 Blob URL: ${blobUrl.substring(0, 50)}, 大小: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
          
          // 2. 立即更新节点（不等待保存）
          onUpdate(node.id, { videoUri: blobUrl });
          
          // 3. 异步保存到 IndexedDB（不阻塞 UI）
          const { saveFileToIndexedDBAsync } = await import('../services/blobStorage');
          saveFileToIndexedDBAsync(node.id, file).catch(error => {
              console.error('[Node] 视频异步保存失败:', error);
          });
      }
  };
  
  // 🔥 零拷贝优化：上传图片（不读取文件内容，直接创建 Blob URL）
  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => { 
      const file = e.target.files?.[0]; 
      if (file) { 
          // 1. 零拷贝：直接创建 Blob URL
          const blobUrl = URL.createObjectURL(file);
          console.log(`[Node] 上传图片，创建 Blob URL: ${blobUrl.substring(0, 50)}, 大小: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
          
          // 2. 立即更新节点（不等待保存）
          onUpdate(node.id, { image: blobUrl });
          
          // 3. 异步保存到 IndexedDB（不阻塞 UI）
          const { saveFileToIndexedDBAsync } = await import('../services/blobStorage');
          saveFileToIndexedDBAsync(node.id, file).catch(error => {
              console.error('[Node] 图片异步保存失败:', error);
          });
      }
  };
  const handleAspectRatioSelect = (newRatio: string) => {
    const [w, h] = newRatio.split(':').map(Number);
    let newSize: { width?: number, height?: number } = { height: undefined };
    if (w && h) { 
        const currentWidth = node.width || DEFAULT_NODE_WIDTH; 
        const projectedHeight = (currentWidth * h) / w; 
        if (projectedHeight > 600) newSize.width = (600 * w) / h; 
    }
    onUpdate(node.id, { aspectRatio: newRatio }, newSize);
  };
  const handleTitleSave = () => { setIsEditingTitle(false); if (tempTitle.trim() && tempTitle !== node.title) onUpdate(node.id, {}, undefined, tempTitle); else setTempTitle(node.title); };

  const getNodeConfig = () => {
      switch (node.type) {
        case NodeType.PROMPT_INPUT: return { icon: Type, color: 'text-amber-400', border: 'border-amber-500/30' };
        case NodeType.IMAGE_GENERATOR: return { icon: ImageIcon, color: 'text-cyan-400', border: 'border-cyan-500/30' };
        case NodeType.VIDEO_GENERATOR: return { icon: VideoIcon, color: 'text-purple-400', border: 'border-purple-500/30' };
        case NodeType.AUDIO_GENERATOR: return { icon: Mic2, color: 'text-pink-400', border: 'border-pink-500/30' };
        case NodeType.VIDEO_ANALYZER: return { icon: FileSearch, color: 'text-emerald-400', border: 'border-emerald-500/30' };
        case NodeType.IMAGE_EDITOR: return { icon: Edit, color: 'text-rose-400', border: 'border-rose-500/30' };
        default: return { icon: Type, color: 'text-slate-400', border: 'border-white/10' };
      }
  };
  const { icon: NodeIcon, color: iconColor } = getNodeConfig();
  
  const getNodeHeight = () => {
      if (node.height) return node.height; 
      if (node.type === NodeType.VIDEO_ANALYZER || node.type === NodeType.IMAGE_EDITOR || node.type === NodeType.PROMPT_INPUT) return DEFAULT_FIXED_HEIGHT; 
      if (node.type === NodeType.AUDIO_GENERATOR) return AUDIO_NODE_HEIGHT;
      // 剧本节点的高度
      if (node.type === NodeType.SCRIPT_NODE) {
          if (node.data.scriptData) {
              return isSelected ? 600 : 200;
          }
          return 200;
      }
      // 新节点类型的高度
      if (node.type === NodeType.STORY_STUDIO) return isSelected ? 500 : 120;
      if (node.type === NodeType.CHARACTER_REFERENCE || node.type === NodeType.SCENE_REFERENCE) return 400;
      if (node.type === NodeType.STORYBOARD_SHOT) return 450;
      if (node.type === NodeType.MULTI_ANGLE_CAMERA) return 800; // 始终大尺寸
      if (node.type === NodeType.GRID_SPLITTER) return 480; // 九宫格处理节点
      const ratio = node.data.aspectRatio || '16:9';
      const [w, h] = ratio.split(':').map(Number);
      const extra = (node.type === NodeType.VIDEO_GENERATOR && generationMode === 'CUT') ? 36 : 0;
      return ((node.width || DEFAULT_NODE_WIDTH) * h / w) + extra;
  };
  const nodeHeight = getNodeHeight();
  const nodeWidth = node.width || DEFAULT_NODE_WIDTH;
  const hasInputs = inputAssets && inputAssets.length > 0;

  const renderTopBar = () => {
    const showTopBar = isSelected || isHovered;
    return (
    <div className={`absolute -top-10 left-0 w-full flex items-center justify-between px-1 transition-all duration-300 ${showTopBar ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
        <div className="flex items-center gap-1.5 pointer-events-auto">
            {node.type === NodeType.VIDEO_GENERATOR && (<VideoModeSelector currentMode={generationMode} onSelect={(mode) => onUpdate(node.id, { generationMode: mode })} />)}
             {(node.data.image || node.data.videoUri || node.data.audioUri) && (
                <div className="flex items-center gap-1">
                    <button onClick={handleDownload} className="p-1.5 bg-white border border-gray-200 rounded-md text-gray-600 hover:text-gray-900 hover:border-gray-300 transition-colors shadow-sm" title="下载"><Download size={14} /></button>
                    <button onClick={() => fileInputRef.current?.click()} className="p-1.5 bg-white border border-gray-200 rounded-md text-gray-600 hover:text-gray-900 hover:border-gray-300 transition-colors shadow-sm" title="上传替换"><Upload size={14} /></button>
                    {node.type !== NodeType.AUDIO_GENERATOR && <button onClick={handleExpand} className="p-1.5 bg-white border border-gray-200 rounded-md text-gray-600 hover:text-gray-900 hover:border-gray-300 transition-colors shadow-sm" title="全屏预览"><Maximize2 size={14} /></button>}
                </div>
             )}
        </div>
        <div className="flex items-center gap-2 pointer-events-auto">
             {isWorking && <div className="bg-white border border-gray-200 p-1.5 rounded-full shadow-sm"><Loader2 className="animate-spin w-3 h-3 text-blue-500" /></div>}
            <div className={`px-2 py-1 flex items-center gap-2`}>
                {isEditingTitle ? (
                    <input className="bg-transparent border-none outline-none text-slate-400 text-[10px] font-bold uppercase tracking-wider w-24 text-right" value={tempTitle} onChange={(e) => setTempTitle(e.target.value)} onBlur={handleTitleSave} onKeyDown={(e) => e.key === 'Enter' && handleTitleSave()} onMouseDown={e => e.stopPropagation()} autoFocus />
                ) : (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-200 cursor-text text-right" onClick={() => setIsEditingTitle(true)}>{node.title}</span>
                )}
            </div>
        </div>
    </div>
    );
  };

  const renderMediaContent = () => {
      // 剧本节点（新）
      if (node.type === NodeType.SCRIPT_NODE) {
          return (
              <ScriptNode
                  scriptData={node.data.scriptData}
                  isGenerating={isWorking}
                  error={node.data.error}
                  onGenerate={(userIdea) => onAction(node.id, userIdea)}
                  onUpdate={(data) => onUpdate(node.id, { scriptData: data })}
                  onCreateWorkflow={() => {
                      // 调用 App.tsx 中的函数
                      if (onCreateWorkflow) {
                          onCreateWorkflow(node.id);
                      } else {
                          console.warn('[剧本节点] onCreateWorkflow 未定义');
                      }
                  }}
                  onGenerateShot={(shotId) => {
                      // TODO: 实现单个分镜生成
                      console.log('[剧本节点] 生成分镜:', shotId);
                  }}
              />
          );
      }
      
      // 多角度相机节点
      if (node.type === NodeType.MULTI_ANGLE_CAMERA) {
          // 获取输入图片（从连接的节点）
          const inputImageSrc = inputAssets && inputAssets.length > 0 && inputAssets[0].type === 'image' 
            ? inputAssets[0].src 
            : undefined;
          
          return (
              <MultiAngleCameraNode
                  horizontalAngle={node.data.horizontalAngle || 0}
                  verticalAngle={node.data.verticalAngle || 0}
                  cameraZoom={node.data.cameraZoom || 5}
                  cameraPrompt={node.data.cameraPrompt}
                  gridImages={node.data.gridImages}
                  selectedGridIndex={node.data.selectedGridIndex}
                  userPrompt={node.data.userPrompt}
                  isWorking={isWorking}
                  isExpanded={isSelected || false}
                  inputImage={inputImageSrc}
                  error={node.data.error}
                  onHorizontalAngleChange={(value) => onUpdate(node.id, { horizontalAngle: value })}
                  onVerticalAngleChange={(value) => onUpdate(node.id, { verticalAngle: value })}
                  onZoomChange={(value) => onUpdate(node.id, { cameraZoom: value })}
                  onPresetSelect={(type, value) => {
                      if (type === 'horizontal') {
                          const presets: Record<string, number> = {
                              'front': 0, 'front-right': 45, 'right': 90, 'back-right': 135,
                              'back': 180, 'back-left': 225, 'left': 270, 'front-left': 315
                          };
                          onUpdate(node.id, { horizontalAngle: presets[value] || 0 });
                      } else if (type === 'vertical') {
                          const presets: Record<string, number> = {
                              'low-angle': -30, 'eye-level': 0, 'elevated': 30, 'high-angle': 60
                          };
                          onUpdate(node.id, { verticalAngle: presets[value] || 0 });
                      } else if (type === 'distance') {
                          const presets: Record<string, number> = {
                              'close-up': 2, 'medium': 5, 'wide': 8
                          };
                          onUpdate(node.id, { cameraZoom: presets[value] || 5 });
                      }
                  }}
                  onUserPromptChange={(value) => onUpdate(node.id, { userPrompt: value })}
                  onGenerate={() => {
                      // 清除旧的生成结果，允许重新生成
                      onUpdate(node.id, { 
                          gridImages: undefined,
                          image: undefined,
                          error: undefined
                      });
                      // 触发生成
                      setTimeout(() => onAction(node.id), 0);
                  }}
                  onGridSelect={(index, croppedImageUrl) => {
                      // 同时更新 selectedGridIndex 和 image
                      // 如果有裁剪后的图片 URL，使用它；否则使用原始九宫格图片
                      const imageToUse = croppedImageUrl || node.data.gridImages?.[0];
                      onUpdate(node.id, { 
                          selectedGridIndex: index,
                          image: imageToUse // 设置裁剪后的单张图片，使其可被其他节点获取
                      });
                  }}
              />
          );
      }
      
      // 九宫格处理节点
      if (node.type === NodeType.GRID_SPLITTER) {
          // 🔥 锁定逻辑：第一次接收图片后，就锁定这个图片，后续不再自动更新
          let inputImageSrc: string | undefined;
          
          if (node.data.inputImage === null) {
              // 用户主动清除，不使用任何图片
              inputImageSrc = undefined;
          } else if (node.data.inputImage) {
              // 1. 已经有保存的图片，使用它（锁定）
              inputImageSrc = node.data.inputImage;
          } else if (inputAssets && inputAssets.length > 0 && inputAssets[0].type === 'image') {
              // 2. 第一次接收，使用输入图片（GridSplitterNode 会自动保存）
              inputImageSrc = inputAssets[0].src;
          }
          
          // 🔥 使用 useCallback 包装 onUpdate，防止无限循环
          const handleGridSplitterUpdate = React.useCallback((data: {
              inputImage?: string | null;
              croppedImages?: string[];
              selectedIndex?: number;
              outputImage?: string;
          }) => {
              const updateData: any = {};
              // inputImage: 只有明确传入 null 或有值时才更新
              if (data.inputImage === null) {
                  // 用户主动清除
                  updateData.inputImage = null;
              } else if (data.inputImage !== undefined) {
                  // 有新的图片
                  updateData.inputImage = data.inputImage;
              }
              // 其他字段正常更新
              if ('croppedImages' in data) updateData.croppedImages = data.croppedImages;
              if ('selectedIndex' in data) updateData.selectedIndex = data.selectedIndex;
              if ('outputImage' in data) updateData.image = data.outputImage;
              
              onUpdate(node.id, updateData);
          }, [node.id, onUpdate]);
          
          return (
              <GridSplitterNode
                  inputImage={inputImageSrc}
                  croppedImages={node.data.croppedImages}
                  selectedIndex={node.data.selectedIndex}
                  outputImage={node.data.image}
                  isWorking={node.status === NodeStatus.WORKING}
                  isExpanded={isSelected || false}
                  isSelected={isSelected || false}
                  onUpdate={handleGridSplitterUpdate}
              />
          );
      }
      
      if (node.type === NodeType.PROMPT_INPUT) {
          return (
            <div className="w-full h-full p-6 flex flex-col group/text">
                <div className="flex-1 bg-black/10 rounded-2xl border border-white/5 p-4 relative overflow-hidden backdrop-blur-sm transition-colors group-hover/text:bg-black/20">
                    <textarea className="w-full h-full bg-transparent resize-none focus:outline-none text-sm text-slate-200 placeholder-slate-500 font-medium leading-relaxed custom-scrollbar selection:bg-amber-500/30" placeholder="输入您的创意构想..." value={localPrompt} onChange={(e) => setLocalPrompt(e.target.value)} onBlur={commitPrompt} onKeyDown={handleCmdEnter} onWheel={(e) => e.stopPropagation()} onMouseDown={e => e.stopPropagation()} maxLength={1000} />
                </div>
            </div>
          );
      }
      if (node.type === NodeType.VIDEO_ANALYZER) {
          return (
            <div className="w-full h-full p-5 flex flex-col gap-3">
                 <div className="relative w-full h-32 rounded-xl bg-black/20 border border-white/5 overflow-hidden flex items-center justify-center cursor-pointer hover:bg-black/30 transition-colors group/upload" onClick={() => !node.data.videoUri && fileInputRef.current?.click()}>
                    {videoBlobUrl ? <video src={videoBlobUrl} className="w-full h-full object-cover opacity-80" muted onMouseEnter={safePlay} onMouseLeave={safePause} onClick={handleExpand} /> : <div className="flex flex-col items-center gap-2 text-slate-500 group-hover:upload:text-slate-300"><Upload size={20} /><span className="text-[10px] font-bold uppercase tracking-wider">上传视频</span></div>}
                    {node.data.videoUri && <button className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-slate-400 hover:text-white backdrop-blur-md" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}><Edit size={10} /></button>}
                    <input type="file" ref={fileInputRef} className="hidden" accept="video/*" onChange={handleUploadVideo} />
                 </div>
                 <div className="flex-1 bg-black/10 rounded-xl border border-white/5 overflow-hidden relative group/analysis">
                    <textarea className="w-full h-full bg-transparent p-3 resize-none focus:outline-none text-xs text-slate-300 font-mono leading-relaxed custom-scrollbar select-text placeholder:italic placeholder:text-slate-600" value={node.data.analysis || ''} placeholder="等待分析结果，或在此粘贴文本..." onChange={(e) => onUpdate(node.id, { analysis: e.target.value })} onWheel={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()} onDoubleClick={(e) => e.stopPropagation()} spellCheck={false} />
                    {node.data.analysis && <button className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 border border-white/10 rounded-md text-slate-400 hover:text-white transition-all opacity-0 group-hover/analysis:opacity-100 backdrop-blur-md z-10" onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(node.data.analysis || ''); }} title="复制全部"><Copy size={12} /></button>}
                 </div>
                 {isWorking && <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-10"><Loader2 className="animate-spin text-emerald-400" /></div>}
            </div>
          )
      }
      if (node.type === NodeType.AUDIO_GENERATOR) {
          return (
              <div className="w-full h-full p-6 flex flex-col justify-center items-center relative overflow-hidden group/audio">
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-purple-900/10 z-0"></div>
                  {node.data.audioUri ? (
                      <div className="flex flex-col items-center gap-4 w-full z-10">
                          <audio ref={mediaRef as any} src={node.data.audioUri} onEnded={() => setIsPlayingAudio(false)} onPlay={() => setIsPlayingAudio(true)} onPause={() => setIsPlayingAudio(false)} className="hidden" />
                          <div className="w-full px-4"><AudioVisualizer isPlaying={isPlayingAudio} /></div>
                          <div className="flex items-center gap-4"><button onClick={toggleAudio} className="w-12 h-12 rounded-full bg-cyan-500/20 hover:bg-cyan-500/40 border border-cyan-500/50 flex items-center justify-center transition-all hover:scale-105">{isPlayingAudio ? <Pause size={20} className="text-white" /> : <Play size={20} className="text-white ml-1" />}</button></div>
                      </div>
                  ) : (
                      <div className="flex flex-col items-center gap-3 text-slate-600 z-10 select-none">{isWorking ? <Loader2 size={32} className="animate-spin text-pink-500" /> : <Mic2 size={32} className="text-slate-500" />}<span className="text-[10px] font-bold uppercase tracking-widest">{isWorking ? '生成中...' : '准备生成'}</span></div>
                  )}
                  {node.status === NodeStatus.ERROR && <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20"><AlertCircle className="text-red-500 mb-2" /><span className="text-xs text-red-200">{node.data.error}</span></div>}
              </div>
          )
      }

      const hasContent = node.data.image || node.data.videoUri;
      return (
        <div className="w-full h-full relative group/media overflow-hidden bg-gray-100" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
            {!hasContent ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-slate-600"><div className="w-20 h-20 rounded-[28px] bg-white/5 border border-white/5 flex items-center justify-center cursor-pointer hover:bg-white/10 hover:scale-105 transition-all duration-300 shadow-inner" onClick={() => fileInputRef.current?.click()}>{isWorking ? <Loader2 className="animate-spin text-cyan-500" size={32} /> : <NodeIcon size={32} className="opacity-50" />}</div><span className="text-[11px] font-bold uppercase tracking-[0.2em] opacity-40">{isWorking ? "处理中..." : "拖拽或上传"}</span><input type="file" ref={fileInputRef} className="hidden" accept={node.type.includes('VIDEO') ? "video/*" : "image/*"} onChange={node.type.includes('VIDEO') ? handleUploadVideo : handleUploadImage} /></div>
            ) : (
                <>
                    {node.data.image ? 
                        <img 
                            ref={mediaRef as any} 
                            src={node.data.image} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover/media:scale-105 bg-gray-100" 
                            draggable={false} 
                            loading="lazy"
                            decoding="async"
                            style={{ filter: showImageGrid ? 'blur(10px)' : 'none' }} 
                            onContextMenu={(e) => onMediaContextMenu?.(e, node.id, 'image', node.data.image!)} 
                        />
                    : 
                        <SecureVideo 
                            videoRef={mediaRef} // Pass Ref to Video
                            src={node.data.videoUri} 
                            className="w-full h-full object-cover bg-gray-100" 
                            loop 
                            muted 
                            // autoPlay removed to rely on hover logic
                            onContextMenu={(e: React.MouseEvent) => onMediaContextMenu?.(e, node.id, 'video', node.data.videoUri!)} 
                            style={{ filter: showImageGrid ? 'blur(10px)' : 'none' }} // Pass Style
                        />
                    }
                    {node.status === NodeStatus.ERROR && <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20"><AlertCircle className="text-red-500 mb-2" /><span className="text-xs text-red-200">{node.data.error}</span></div>}
                    {showImageGrid && (node.data.images || node.data.videoUris) && (
                        <div className="absolute inset-0 bg-black/40 z-10 grid grid-cols-2 gap-2 p-2 animate-in fade-in duration-200">
                            {node.data.images ? node.data.images.map((img, idx) => (
                                <div key={idx} className={`relative rounded-lg overflow-hidden cursor-pointer border-2 bg-gray-100 ${img === node.data.image ? 'border-cyan-500' : 'border-transparent hover:border-white/50'}`} onClick={(e) => { e.stopPropagation(); onUpdate(node.id, { image: img }); }}>
                                    <img src={img} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                                </div>
                            )) : node.data.videoUris?.map((uri, idx) => (
                                <div key={idx} className={`relative rounded-lg overflow-hidden cursor-pointer border-2 bg-gray-100 ${uri === node.data.videoUri ? 'border-cyan-500' : 'border-transparent hover:border-white/50'}`} onClick={(e) => { e.stopPropagation(); onUpdate(node.id, { videoUri: uri }); }}>
                                    {uri ? (
                                        <SecureVideo src={uri} className="w-full h-full object-cover bg-gray-100" muted loop autoPlay />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-white/5 text-xs text-slate-500">Failed</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                    {generationMode === 'CUT' && node.data.croppedFrame && <div className="absolute top-4 right-4 w-24 aspect-video bg-black/80 rounded-lg border border-purple-500/50 shadow-xl overflow-hidden z-20 hover:scale-150 transition-transform origin-top-right opacity-0 group-hover:opacity-100 transition-opacity duration-300"><img src={node.data.croppedFrame} className="w-full h-full object-cover" loading="lazy" decoding="async" /></div>}
                    {generationMode === 'CUT' && !node.data.croppedFrame && hasInputs && inputAssets?.some(a => a.src) && (<div className="absolute top-4 right-4 w-24 aspect-video bg-black/80 rounded-lg border border-purple-500/30 border-dashed shadow-xl overflow-hidden z-20 hover:scale-150 transition-transform origin-top-right flex flex-col items-center justify-center group/preview opacity-0 group-hover:opacity-100 transition-opacity duration-300"><div className="absolute inset-0 bg-purple-500/10 z-10"></div>{(() => { const asset = inputAssets!.find(a => a.src); if (asset?.type === 'video') { return <SecureVideo src={asset.src} className="w-full h-full object-cover opacity-60 bg-gray-100" muted autoPlay />; } else { return <img src={asset?.src} className="w-full h-full object-cover opacity-60 bg-gray-100" loading="lazy" decoding="async" />; } })()}<span className="absolute z-20 text-[8px] font-bold text-purple-200 bg-black/50 px-1 rounded">分镜参考</span></div>)}
                </>
            )}
            {node.type === NodeType.VIDEO_GENERATOR && generationMode === 'CUT' && (videoBlobUrl || node.data.videoUri) && 
                <SceneDirectorOverlay 
                    visible={true} 
                    videoRef={mediaRef as React.RefObject<HTMLVideoElement>} 
                    onCrop={() => { 
                        const vid = mediaRef.current as HTMLVideoElement; 
                        if (vid) { // Safety check to prevent null access
                            const canvas = document.createElement('canvas'); 
                            canvas.width = vid.videoWidth; 
                            canvas.height = vid.videoHeight; 
                            const ctx = canvas.getContext('2d'); 
                            if (ctx) { 
                                ctx.drawImage(vid, 0, 0); 
                                onCrop?.(node.id, canvas.toDataURL('image/png')); 
                            } 
                        }
                    }} 
                    onTimeHover={() => {}} 
                />
            }
        </div>
      );
  };

  const renderBottomPanel = () => {
     // 底部面板已禁用 - 不需要输入框
     return null;
  };    

  // 🔥 性能优化：交互时禁用昂贵的 CSS 属性
  // 🔥 方案 3：使用传入的 isDragging prop（来自 useDrag Hook 的实时状态）
  const isInteracting = isDragging || isResizing || isGroupDragging;
  
  // 🔥 九宫格节点拖手逻辑
  const isGridSplitter = node.type === NodeType.GRID_SPLITTER;
  const hasGridSelection = isGridSplitter && node.data.selectedIndex !== undefined && node.data.selectedIndex >= 0;
  const showGridDragHandle = hasGridSelection && isSelected;
  
  // 🔥 强制重新编译 - 2026-01-28 15:30
  return (
    <div 
        {...props}
        id={`node-${node.id}`}
        data-node-id={node.id}
        className={`absolute rounded-lg group ${isSelected ? 'ring-2 ring-blue-500 shadow-lg z-30' : 'ring-1 ring-gray-200 hover:ring-gray-300 z-10'} ${isEntering ? 'node-enter' : ''} ${className || ''}`}
        style={{ 
            left: node.x, 
            top: node.y, 
            width: nodeWidth, 
            height: nodeHeight,
            background: '#ffffff',
            // 🔥 交互时禁用 transition 和昂贵的 CSS
            transition: isInteracting ? 'none' : 'all 0.2s cubic-bezier(0.32, 0.72, 0, 1)',
            backdropFilter: 'none',
            boxShadow: isInteracting ? 'none' : '0 1px 3px 0 rgb(0 0 0 / 0.1)',
            willChange: isInteracting ? 'transform' : 'auto',
            ...style, // 🔥 合并传入�?style
        }}
        onMouseDown={(e) => onNodeMouseDown(e, node.id)} 
        onDoubleClick={(e) => {
            // 🔥 修复：允许九宫格节点的双击事件传播
            if (node.type === 'gridSplitter') {
                // 不阻止九宫格节点的双击事件
                return;
            }
            e.stopPropagation();
        }} 
        onMouseEnter={() => setIsHovered(true)} 
        onMouseLeave={() => setIsHovered(false)} 
        onContextMenu={(e) => onNodeContextMenu(e, node.id)}
    >
        {/* 🔥 九宫格节点拖�?- 在节点外部，不被裁剪 */}
        {showGridDragHandle && (
          <div 
            className="absolute -bottom-5 -right-5 h-8 px-3 rounded-full bg-gray-100/95 backdrop-blur-md border border-gray-300 flex items-center gap-1.5 cursor-grab active:cursor-grabbing hover:bg-gray-200 hover:border-gray-400 active:scale-95 transition-all shadow-md z-[60]"
            draggable={true}
            onDragStart={(e) => {
              if (!node.data.inputImage || node.data.selectedIndex === undefined) {
                e.preventDefault();
                return;
              }
              e.stopPropagation();
              const dragData = {
                type: 'grid-splitter-image',
                originalImage: node.data.inputImage,
                selectedIndex: node.data.selectedIndex,
                croppedImage: node.data.croppedImages?.[node.data.selectedIndex]
              };
              e.dataTransfer.setData('application/json', JSON.stringify(dragData));
              e.dataTransfer.effectAllowed = 'copy';
              if (e.currentTarget instanceof HTMLElement) {
                e.currentTarget.style.opacity = '0.5';
              }
            }}
            onDragEnd={(e) => {
              e.stopPropagation();
              if (e.currentTarget instanceof HTMLElement) {
                e.currentTarget.style.opacity = '1';
              }
            }}
            onMouseDown={(e) => e.stopPropagation()}
            title="拖动创建新图片节点"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600">
              <circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/>
            </svg>
            <span className="text-[11px] font-medium text-gray-700">拖出</span>
          </div>
        )}
        {renderTopBar()}
        <div className={`absolute -left-3 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-gray-300 bg-white flex items-center justify-center transition-all duration-200 hover:border-blue-500 cursor-crosshair z-50 ${isConnecting ? 'ring-2 ring-blue-400 animate-pulse' : ''}`} onMouseDown={(e) => onPortMouseDown(e, node.id, 'input')} onMouseUp={(e) => onPortMouseUp(e, node.id, 'input')} title="Input"></div>
        <div className={`absolute -right-3 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-gray-300 bg-white flex items-center justify-center transition-all duration-200 hover:border-blue-500 cursor-crosshair z-50 ${isConnecting ? 'ring-2 ring-blue-400 animate-pulse' : ''}`} onMouseDown={(e) => onPortMouseDown(e, node.id, 'output')} onMouseUp={(e) => onPortMouseUp(e, node.id, 'output')} title="Output"></div>
        <div className="w-full h-full flex flex-col relative rounded-lg overflow-hidden bg-white"><div className="flex-1 min-h-0 relative bg-gray-50">{renderMediaContent()}</div></div>
        {/* 底部面板已彻底删�?- 用户不需要这个功�?*/}
        {/* {renderBottomPanel()} */}
        <div className="absolute -bottom-2 -right-2 w-4 h-4 flex items-center justify-center cursor-nwse-resize text-gray-400 hover:text-blue-500 transition-colors opacity-0 group-hover:opacity-100 z-50" onMouseDown={(e) => onResizeMouseDown(e, node.id, nodeWidth, nodeHeight)}><div className="w-1 h-1 rounded-full bg-current" /></div>
    </div>
  );
};

export const Node = memo(NodeComponent, arePropsEqual);

