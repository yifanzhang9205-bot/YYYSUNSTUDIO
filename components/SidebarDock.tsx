import React, { useState, useRef, useEffect } from 'react';
import { 
    Plus, RotateCcw, History, MessageSquare, FolderHeart, X, 
    ImageIcon, Video as VideoIcon, Film, Save, 
    Edit, Trash2, Type, Workflow as WorkflowIcon,
    Clapperboard, Mic2, Settings, ScanFace, Brush, AlignJustify, Grid3X3, Camera, Sparkles
} from 'lucide-react';
import { NodeType, Workflow } from '../types';

interface SidebarDockProps {
    onAddNode: (type: NodeType) => void;
    onUndo: () => void;
    isChatOpen: boolean;
    onToggleChat: () => void;
    isMultiFrameOpen: boolean;
    onToggleMultiFrame: () => void;
    isSonicStudioOpen?: boolean;
    onToggleSonicStudio?: () => void;
    assetHistory: any[];
    onHistoryItemClick: (item: any) => void;
    onDeleteAsset: (id: string) => void;
    workflows: Workflow[];
    selectedWorkflowId: string | null;
    onSelectWorkflow: (id: string | null) => void;
    onSaveWorkflow: () => void;
    onDeleteWorkflow: (id: string) => void;
    onRenameWorkflow: (id: string, title: string) => void;
    onOpenSettings: () => void;
    selectedGroupId: string | null;
    onArrangeGroup: () => void;
}

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
        case NodeType.SCENE_REFERENCE: return ImageIcon;
        case NodeType.STORYBOARD_SHOT: return Film;
        case NodeType.MULTI_ANGLE_CAMERA: return Camera;
        case NodeType.GRID_SPLITTER: return Grid3X3;
        default: return Plus;
    }
};

export const SidebarDock: React.FC<SidebarDockProps> = ({
    onAddNode,
    onUndo,
    isChatOpen,
    onToggleChat,
    isMultiFrameOpen,
    onToggleMultiFrame,
    isSonicStudioOpen,
    onToggleSonicStudio,
    assetHistory,
    onHistoryItemClick,
    onDeleteAsset,
    workflows,
    selectedWorkflowId,
    onSelectWorkflow,
    onSaveWorkflow,
    onDeleteWorkflow,
    onRenameWorkflow,
    onOpenSettings,
    selectedGroupId,
    onArrangeGroup
}) => {
    const [activePanel, setActivePanel] = useState<'history' | 'workflow' | 'add' | null>(null);
    const [activeHistoryTab, setActiveHistoryTab] = useState<'image' | 'video'>('image');
    const [editingWorkflowId, setEditingWorkflowId] = useState<string | null>(null);
    const [contextMenu, setContextMenu] = useState<{ visible: boolean, x: number, y: number, id: string, type: 'workflow' | 'history' } | null>(null);
    const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleSidebarHover = (id: string) => {
        if (['add', 'history', 'workflow'].includes(id)) {
            if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
            setActivePanel(id as any);
        } else {
            closeTimeoutRef.current = setTimeout(() => setActivePanel(null), 100);
        }
    };

    const handleSidebarLeave = () => {
        closeTimeoutRef.current = setTimeout(() => setActivePanel(null), 500);
    };

    const handlePanelEnter = () => {
        if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };

    const handlePanelLeave = () => {
        closeTimeoutRef.current = setTimeout(() => setActivePanel(null), 500);
    };

    useEffect(() => {
        const handleClick = () => setContextMenu(null);
        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, []);

    const renderPanelContent = () => {
        if (activePanel === 'history') {
            const filteredAssets = assetHistory.filter(a => {
                if (activeHistoryTab === 'image') return a.type === 'image' || a.type.includes('image') || a.type.includes('image_generator');
                if (activeHistoryTab === 'video') return a.type === 'video' || a.type.includes('video');
                return false;
            });

            return (
                <>
                    <div className="p-4 border-b border-white/5 flex flex-col gap-3 bg-white/5 backdrop-blur-xl">
                        <div className="flex justify-between items-center">
                            <button onClick={() => setActivePanel(null)} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all active:scale-95">
                                <X size={14} className="text-white/60" />
                            </button>
                            <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">历史记录</span>
                        </div>
                        {/* Tabs */}
                        <div className="flex bg-white/5 p-1 rounded-xl">
                            <button 
                                onClick={() => setActiveHistoryTab('image')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 text-[11px] font-semibold rounded-lg transition-all ${activeHistoryTab === 'image' ? 'bg-white text-black shadow-lg' : 'text-white/50 hover:text-white/80'}`}
                            >
                                <ImageIcon size={12} /> 图片
                            </button>
                            <button 
                                onClick={() => setActiveHistoryTab('video')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 text-[11px] font-semibold rounded-lg transition-all ${activeHistoryTab === 'video' ? 'bg-white text-black shadow-lg' : 'text-white/50 hover:text-white/80'}`}
                            >
                                <VideoIcon size={12} /> 视频
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-3 custom-scrollbar space-y-2 relative">
                        {filteredAssets.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-white/30">
                                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                    {activeHistoryTab === 'image' ? <ImageIcon size={24} /> : <Film size={24} />}
                                </div>
                                <span className="text-xs font-medium">暂无{activeHistoryTab === 'image' ? '图片' : '视频'}</span>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-2">
                                {filteredAssets.map(a => (
                                    <div 
                                        key={a.id} 
                                        className="aspect-square rounded-2xl overflow-hidden cursor-grab active:cursor-grabbing border border-white/10 hover:border-white/30 transition-all group relative bg-white/5 hover:scale-[1.02] active:scale-[0.98]"
                                        draggable={true}
                                        onDragStart={(e) => {
                                            e.dataTransfer.setData('application/json', JSON.stringify(a));
                                            e.dataTransfer.effectAllowed = 'copy';
                                        }}
                                        onClick={() => onHistoryItemClick(a)}
                                        onContextMenu={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setContextMenu({ visible: true, x: e.clientX, y: e.clientY, id: a.id, type: 'history' });
                                        }}
                                    >
                                        {a.type.includes('image') ? (
                                            <img src={a.src} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" draggable={false} />
                                        ) : (
                                            <video src={a.src} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" draggable={false} />
                                        )}
                                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[9px] font-semibold text-white/80">
                                            {a.type.includes('image') ? 'IMG' : 'MOV'}
                                        </div>
                                        <div className="absolute bottom-0 left-0 w-full p-2 bg-gradient-to-t from-black/80 to-transparent text-[10px] text-white/90 truncate font-medium">
                                            {a.title || 'Untitled'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            );
        }

        if (activePanel === 'workflow') {
            return (
                <>
                    <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5 backdrop-blur-xl">
                        <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">我的工作流</span>
                        <button 
                            onClick={onSaveWorkflow} 
                            className="w-9 h-9 bg-white hover:bg-white/90 text-black rounded-xl flex items-center justify-center transition-all active:scale-95 shadow-lg"
                            title="保存当前工作流"
                        >
                            <Save size={14} />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-3 custom-scrollbar space-y-3 relative">
                        {workflows.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-white/30">
                                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                    <FolderHeart size={24} />
                                </div>
                                <span className="text-xs font-medium text-center">空空如也<br/>保存您的第一个工作流</span>
                            </div>
                        ) : (
                            workflows.map(wf => (
                                <div 
                                    key={wf.id} 
                                    className={`
                                        relative p-3 rounded-2xl border bg-white/5 group transition-all cursor-grab active:cursor-grabbing hover:bg-white/10 hover:scale-[1.01] active:scale-[0.99]
                                        ${selectedWorkflowId === wf.id ? 'border-white/40 ring-1 ring-white/20' : 'border-white/10 hover:border-white/20'}
                                    `}
                                    draggable={true}
                                    onDragStart={(e) => {
                                        e.dataTransfer.setData('application/workflow-id', wf.id);
                                        e.dataTransfer.effectAllowed = 'copy';
                                    }}
                                    onClick={(e) => { e.stopPropagation(); onSelectWorkflow(wf.id); }}
                                    onDoubleClick={(e) => { e.stopPropagation(); setEditingWorkflowId(wf.id); }}
                                    onContextMenu={(e) => { 
                                        e.preventDefault(); 
                                        e.stopPropagation(); 
                                        setContextMenu({visible: true, x: e.clientX, y: e.clientY, id: wf.id, type: 'workflow'}); 
                                    }}
                                >
                                    <div className="aspect-[2/1] bg-black/30 rounded-xl mb-3 overflow-hidden relative">
                                        {wf.thumbnail ? (
                                            <img src={wf.thumbnail} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" draggable={false} />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-white/20">
                                                <WorkflowIcon size={24} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between px-1">
                                        {editingWorkflowId === wf.id ? (
                                            <input 
                                                className="bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-xs text-white w-full outline-none focus:border-white/40"
                                                defaultValue={wf.title}
                                                autoFocus
                                                onBlur={(e) => { onRenameWorkflow(wf.id, e.target.value); setEditingWorkflowId(null); }}
                                                onKeyDown={(e) => { if(e.key === 'Enter') { onRenameWorkflow(wf.id, e.currentTarget.value); setEditingWorkflowId(null); } }}
                                            />
                                        ) : (
                                            <span className="text-xs font-medium text-white/80 truncate group-hover:text-white transition-colors">{wf.title}</span>
                                        )}
                                        <span className="text-[10px] text-white/40 font-mono">{wf.nodes.length} 节点</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </>
            );
        }

        // Default: Add Node
        return (
            <>
                <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5 backdrop-blur-xl">
                    <button onClick={() => setActivePanel(null)} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all active:scale-95">
                        <X size={14} className="text-white/60" />
                    </button>
                    <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">添加节点</span>
                </div>
                <div className="flex-1 overflow-y-auto p-3 custom-scrollbar space-y-3">
                    {/* 基础节点 */}
                    <div className="space-y-2">
                        <div className="px-2 text-[9px] font-bold uppercase tracking-wider text-white/30">基础节点</div>
                        {[NodeType.PROMPT_INPUT, NodeType.IMAGE_GENERATOR, NodeType.VIDEO_GENERATOR].map(t => {
                            const ItemIcon = getNodeIcon(t);
                            return (
                                <button 
                                    key={t} 
                                    onClick={(e) => { e.stopPropagation(); onAddNode(t); setActivePanel(null); }} 
                                    className="w-full text-left p-2.5 rounded-xl bg-white/5 hover:bg-white/10 flex items-center gap-2.5 text-sm text-white/80 transition-all border border-transparent hover:border-white/10 active:scale-[0.98]"
                                >
                                    <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-white/70">
                                        <ItemIcon size={15} />
                                    </div> 
                                    <span className="font-medium text-[12px]">{getNodeNameCN(t)}</span>
                                </button>
                            );
                        })}
                    </div>
                    
                    {/* 故事创作 */}
                    <div className="space-y-2 pt-2 border-t border-white/5">
                        <div className="px-2 text-[9px] font-bold uppercase tracking-wider text-white/30">故事创作</div>
                        {[NodeType.STORY_STUDIO, NodeType.CHARACTER_REFERENCE, NodeType.SCENE_REFERENCE, NodeType.STORYBOARD_SHOT].map(t => {
                            const ItemIcon = getNodeIcon(t);
                            return (
                                <button 
                                    key={t} 
                                    onClick={(e) => { e.stopPropagation(); onAddNode(t); setActivePanel(null); }} 
                                    className="w-full text-left p-2.5 rounded-xl bg-white/5 hover:bg-white/10 flex items-center gap-2.5 text-sm text-white/80 transition-all border border-transparent hover:border-white/10 active:scale-[0.98]"
                                >
                                    <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-white/70">
                                        <ItemIcon size={15} />
                                    </div> 
                                    <span className="font-medium text-[12px]">{getNodeNameCN(t)}</span>
                                </button>
                            );
                        })}
                    </div>
                    
                    {/* 高级工具 */}
                    <div className="space-y-2 pt-2 border-t border-white/5">
                        <div className="px-2 text-[9px] font-bold uppercase tracking-wider text-white/30">高级工具</div>
                        {[NodeType.MULTI_ANGLE_CAMERA, NodeType.GRID_SPLITTER].map(t => {
                            const ItemIcon = getNodeIcon(t);
                            return (
                                <button 
                                    key={t} 
                                    onClick={(e) => { e.stopPropagation(); onAddNode(t); setActivePanel(null); }} 
                                    className="w-full text-left p-2.5 rounded-xl bg-white/5 hover:bg-white/10 flex items-center gap-2.5 text-sm text-white/80 transition-all border border-transparent hover:border-white/10 active:scale-[0.98]"
                                >
                                    <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-white/70">
                                        <ItemIcon size={15} />
                                    </div> 
                                    <span className="font-medium text-[12px]">{getNodeNameCN(t)}</span>
                                </button>
                            );
                        })}
                    </div>
                    
                    {/* 特殊功能 */}
                    <div className="space-y-2 pt-2 border-t border-white/5">
                        <div className="px-2 text-[9px] font-bold uppercase tracking-wider text-white/30">特殊功能</div>
                        <button 
                            onClick={(e) => { e.stopPropagation(); onToggleMultiFrame(); setActivePanel(null); }} 
                            className="w-full text-left p-2.5 rounded-xl bg-white/5 hover:bg-white/10 flex items-center gap-2.5 text-sm text-white/80 transition-all border border-transparent hover:border-white/10 active:scale-[0.98]"
                        >
                            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-white/70">
                                <Clapperboard size={15} />
                            </div> 
                            <span className="font-medium text-[12px]">智能多帧</span>
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); onToggleSonicStudio?.(); setActivePanel(null); }} 
                            className="w-full text-left p-2.5 rounded-xl bg-white/5 hover:bg-white/10 flex items-center gap-2.5 text-sm text-white/80 transition-all border border-transparent hover:border-white/10 active:scale-[0.98]"
                        >
                            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-white/70">
                                <Mic2 size={15} />
                            </div> 
                            <span className="font-medium text-[12px]">音频中心</span>
                        </button>
                    </div>
                </div>
            </>
        );
    };

    return (
        <>
            {/* Left Vertical Dock - iOS Style */}
            <div 
                className="fixed left-6 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2 p-2 bg-[#2c2c2e]/80 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl z-50"
                onMouseLeave={handleSidebarLeave}
            >
                {[
                    { id: 'add', icon: Plus, tooltip: '添加节点' },
                    { id: 'workflow', icon: FolderHeart, tooltip: '工作流' }, 
                    { id: 'history', icon: History, tooltip: '历史记录' },
                    { id: 'chat', icon: MessageSquare, action: onToggleChat, active: isChatOpen, tooltip: 'AI 助手' },
                    { id: 'undo', icon: RotateCcw, action: onUndo, tooltip: '撤销' },
                    { id: 'arrange', icon: AlignJustify, action: onArrangeGroup, disabled: !selectedGroupId, tooltip: '一键整理' },
                ].map(item => (
                    <div key={item.id} className="relative group">
                        <button 
                            onMouseEnter={() => handleSidebarHover(item.id)}
                            onClick={() => item.action ? item.action() : setActivePanel(item.id as any)}
                            disabled={item.disabled}
                            className={`relative w-11 h-11 rounded-2xl flex items-center justify-center transition-all active:scale-90 ${
                                item.disabled 
                                    ? 'opacity-30 cursor-not-allowed' 
                                    : activePanel === item.id || item.active 
                                        ? 'bg-white text-black shadow-lg shadow-white/20' 
                                        : 'hover:bg-white/10 text-white/60 hover:text-white'
                            }`}
                        >
                            <item.icon size={20} strokeWidth={1.8} />
                        </button>
                        {/* Tooltip */}
                        <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#2c2c2e]/95 backdrop-blur-xl rounded-lg border border-white/10 text-[11px] text-white/90 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 font-medium">
                            {item.tooltip}
                            {item.id === 'arrange' && !selectedGroupId && <span className="text-white/50 ml-1">(需选中组)</span>}
                        </div>
                    </div>
                ))}
                
                {/* Divider */}
                <div className="w-8 h-px bg-white/10 my-1"></div>
                
                {/* Settings */}
                <div className="relative group">
                    <button 
                        onClick={onOpenSettings}
                        className="w-11 h-11 rounded-2xl flex items-center justify-center transition-all active:scale-90 hover:bg-white/10 text-white/60 hover:text-white"
                    >
                        <Settings size={20} strokeWidth={1.8} />
                    </button>
                    <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#2c2c2e]/95 backdrop-blur-xl rounded-lg border border-white/10 text-[11px] text-white/90 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 font-medium">
                        设置
                    </div>
                </div>
            </div>

            {/* Slide-out Panels - iOS Style */}
            <div 
                className={`fixed left-24 top-1/2 -translate-y-1/2 max-h-[75vh] h-auto w-72 bg-[#1c1c1e]/90 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] z-40 flex flex-col overflow-hidden ${activePanel ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0 pointer-events-none scale-95'}`}
                onMouseEnter={handlePanelEnter}
                onMouseLeave={handlePanelLeave}
                onMouseDown={(e) => e.stopPropagation()}
                onWheel={(e) => e.stopPropagation()}
            >
                {activePanel && renderPanelContent()}
            </div>

            {/* Context Menu - iOS Style */}
            {contextMenu && (
                <div 
                    className="fixed z-[100] bg-[#2c2c2e]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-1.5 min-w-[140px]"
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                    onMouseDown={e => e.stopPropagation()}
                    onMouseLeave={() => setContextMenu(null)}
                >
                    {contextMenu.type === 'history' && (
                         <button 
                            className="w-full text-left px-4 py-2.5 text-xs text-red-400 hover:bg-red-500/20 rounded-xl flex items-center gap-3 transition-colors" 
                            onClick={() => { onDeleteAsset(contextMenu.id); setContextMenu(null); }}
                         >
                             <Trash2 size={14} /> 删除
                         </button>
                    )}
                    {contextMenu.type === 'workflow' && (
                        <>
                            <button 
                                className="w-full text-left px-4 py-2.5 text-xs text-white/80 hover:bg-white/10 rounded-xl flex items-center gap-3 transition-colors" 
                                onClick={() => { setEditingWorkflowId(contextMenu.id); setContextMenu(null); }}
                            >
                                <Edit size={14} /> 重命名
                            </button>
                            <button 
                                className="w-full text-left px-4 py-2.5 text-xs text-red-400 hover:bg-red-500/20 rounded-xl flex items-center gap-3 transition-colors" 
                                onClick={() => { onDeleteWorkflow(contextMenu.id); setContextMenu(null); }}
                            >
                                <Trash2 size={14} /> 删除
                            </button>
                        </>
                    )}
                </div>
            )}
        </>
    );
};
