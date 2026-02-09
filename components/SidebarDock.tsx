import React, { useState, useRef, useEffect } from 'react';
import { 
    Plus, RotateCcw, History, MessageSquare, FolderHeart, X, 
    ImageIcon, Video as VideoIcon, Film, Save, 
    Edit, Trash2, Type,
    Clapperboard, Mic2, Settings, ScanFace, Brush, AlignJustify, Grid3X3, Camera, Sparkles, Check
} from 'lucide-react';
import { NodeType } from '../types';
import { AssetLibraryPanel } from './AssetLibraryPanel';

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
    onDeleteMultipleAssets?: (ids: string[]) => Promise<void>; // 🔥 新增：批量删除方法
    onDownloadSelectedAndClear?: (selectedIds: Set<string>) => void;
    onOpenSettings: () => void;
    // 🔥 新增：资产库相关
    onUseAsset: (assetId: string, position: { x: number; y: number }) => void;
}

const getNodeNameCN = (t: string) => {
    switch(t) {
        case NodeType.PROMPT_INPUT: return '创意描述';
        case NodeType.IMAGE_GENERATOR: return '文字生图';
        case NodeType.VIDEO_GENERATOR: return '文生视频';
        case NodeType.AUDIO_GENERATOR: return '灵感音乐';
        case NodeType.VIDEO_ANALYZER: return '视频分析';
        case NodeType.IMAGE_EDITOR: return '图像编辑';
        case NodeType.SCRIPT_NODE: return '剧本';
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
        case NodeType.SCRIPT_NODE: return AlignJustify;
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
    onDeleteMultipleAssets, // 🔥 新增：批量删除方法
    onDownloadSelectedAndClear,
    onOpenSettings,
    onUseAsset, // 🔥 新增：使用资产
}) => {
    const [activePanel, setActivePanel] = useState<'history' | 'asset-library' | 'add' | null>(null);
    const [activeHistoryTab, setActiveHistoryTab] = useState<'image' | 'video'>('image');
    const [selectedImageIds, setSelectedImageIds] = useState<Set<string>>(new Set());
    const [contextMenu, setContextMenu] = useState<{ visible: boolean, x: number, y: number, id: string, type: 'history' } | null>(null);
    const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleSidebarHover = (id: string) => {
        if (['add', 'history', 'asset-library'].includes(id)) {
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
            
            const hasImages = filteredAssets.length > 0;
            const allSelected = hasImages && filteredAssets.every(a => selectedImageIds.has(a.id));

            return (
                <>
                    <div className="p-1 border-b border-gray-200 flex flex-col gap-2 bg-white">
                        <div className="flex justify-between items-center">
                            <button onClick={() => setActivePanel(null)} className="w-8 h-8 rounded-full bg-white hover:bg-gray-100 border border-gray-200 flex items-center justify-center transition-all active:scale-95">
                                <X size={14} className="text-gray-600" />
                            </button>
                            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">历史记录</span>
                        </div>
                        {/* Tabs */}
                        <div className="flex bg-gray-100 p-1 rounded-xl">
                            <button 
                                onClick={() => setActiveHistoryTab('image')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 text-[11px] font-semibold rounded-lg transition-all ${activeHistoryTab === 'image' ? 'bg-white text-gray-900 shadow-sm border border-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <ImageIcon size={12} /> 图片
                            </button>
                            <button 
                                onClick={() => setActiveHistoryTab('video')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 text-[11px] font-semibold rounded-lg transition-all ${activeHistoryTab === 'video' ? 'bg-white text-gray-900 shadow-sm border border-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <VideoIcon size={12} /> 视频
                            </button>
                        </div>
                        {/* 操作按钮 */}
                        {hasImages && (
                            <div className="flex gap-2">
                                {/* 清除缓存（红色，左侧） */}
                                <button 
                                    onClick={async () => {
                                        const unselectedCount = filteredAssets.length - selectedImageIds.size;
                                        if (unselectedCount === 0) {
                                            alert('没有未选中的图片');
                                            return;
                                        }
                                        
                                        const confirmed = window.confirm(
                                            `⚠️ 确认删除？\n\n将永久删除 ${unselectedCount} 张未选中的图片\n\n此操作不可恢复！`
                                        );
                                        
                                        if (confirmed) {
                                            const unselectedIds = filteredAssets
                                                .filter(img => !selectedImageIds.has(img.id))
                                                .map(img => img.id);
                                            
                                            // 🔥 修复：使用批量删除方法，一次性更新 Store
                                            if (onDeleteMultipleAssets) {
                                                try {
                                                    await onDeleteMultipleAssets(unselectedIds);
                                                    setSelectedImageIds(new Set());
                                                    alert(`✅ 已删除 ${unselectedCount} 张图片\n\n内存和磁盘空间已释放！`);
                                                } catch (error) {
                                                    console.error('[SidebarDock] 批量删除失败:', error);
                                                    alert(`❌ 删除失败：${error instanceof Error ? error.message : '未知错误'}`);
                                                }
                                            } else {
                                                // 降级方案：逐个删除（不推荐）
                                                for (const id of unselectedIds) {
                                                    try {
                                                        await onDeleteAsset(id);
                                                    } catch (error) {
                                                        console.error('[SidebarDock] 删除失败:', id, error);
                                                    }
                                                }
                                                setSelectedImageIds(new Set());
                                                alert(`✅ 已删除 ${unselectedCount} 张图片\n\n内存已释放！`);
                                            }
                                        }
                                    }}
                                    className="flex-1 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg flex items-center justify-center gap-1.5 transition-all active:scale-95 text-[11px] font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={!hasImages || selectedImageIds.size === filteredAssets.length}
                                    title="删除所有未选中的图片（不下载）"
                                >
                                    <Trash2 size={12} />
                                    清除缓存
                                </button>
                                
                                {/* 全选（白色，中间） */}
                                <button 
                                    onClick={() => {
                                        if (allSelected) {
                                            setSelectedImageIds(new Set());
                                        } else {
                                            setSelectedImageIds(new Set(filteredAssets.map(a => a.id)));
                                        }
                                    }}
                                    className="px-3 py-2 bg-white hover:bg-gray-100 text-gray-900 border border-gray-200 rounded-lg flex items-center justify-center gap-1.5 transition-all active:scale-95 text-[11px] font-semibold"
                                    title={allSelected ? "取消全选" : "全选"}
                                >
                                    <Check size={12} />
                                    {allSelected ? '取消' : '全选'}
                                </button>
                                
                                {/* 下载并清除（绿色，右侧） */}
                                <button 
                                    onClick={() => {
                                        if (selectedImageIds.size === 0) {
                                            alert('请先勾选要下载的图片');
                                            return;
                                        }
                                        
                                        if (onDownloadSelectedAndClear) {
                                            onDownloadSelectedAndClear(selectedImageIds);
                                            setSelectedImageIds(new Set());
                                        }
                                    }}
                                    className="flex-1 px-3 py-2 bg-green-50 hover:bg-green-100 text-green-600 border border-green-200 rounded-lg flex items-center justify-center gap-1.5 transition-all active:scale-95 text-[11px] font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={selectedImageIds.size === 0}
                                    title="下载选中的图片并清除缓存"
                                >
                                    <Save size={12} />
                                    下载并清空
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="flex-1 overflow-y-auto p-1 custom-scrollbar space-y-2 relative">
                        {filteredAssets.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                                    {activeHistoryTab === 'image' ? <ImageIcon size={24} /> : <Film size={24} />}
                                </div>
                                <span className="text-xs font-medium">暂无{activeHistoryTab === 'image' ? '图片' : '视频'}</span>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-2">
                                {filteredAssets.map(a => {
                                    const isSelected = selectedImageIds.has(a.id);
                                    return (
                                        <div 
                                            key={a.id} 
                                            className={`aspect-square rounded-2xl overflow-hidden cursor-grab active:cursor-grabbing border transition-all group relative bg-white hover:scale-[1.02] active:scale-[0.98] ${
                                                isSelected ? 'border-green-500 ring-2 ring-green-200' : 'border-gray-200 hover:border-gray-400'
                                            }`}
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
                                            {/* 复选框 */}
                                            <div 
                                                className="absolute top-2 left-2 z-10 w-5 h-5 rounded-md bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const newSelected = new Set(selectedImageIds);
                                                    if (isSelected) {
                                                        newSelected.delete(a.id);
                                                    } else {
                                                        newSelected.add(a.id);
                                                    }
                                                    setSelectedImageIds(newSelected);
                                                }}
                                            >
                                                {isSelected && <Check size={14} className="text-green-400" />}
                                            </div>
                                            
                                            {a.type.includes('image') ? (
                                                <img 
                                                    src={a.src} 
                                                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" 
                                                    draggable={false}
                                                    onError={(e) => {
                                                        // Blob URL 失效时显示占位符
                                                        const target = e.currentTarget;
                                                        target.style.display = 'none';
                                                        const parent = target.parentElement;
                                                        if (parent) {
                                                            const placeholder = parent.querySelector('.error-placeholder');
                                                            if (placeholder) (placeholder as HTMLElement).style.display = 'flex';
                                                        }
                                                    }}
                                                />
                                            ) : (
                                                <video 
                                                    src={a.src} 
                                                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" 
                                                    draggable={false}
                                                    onError={(e) => {
                                                        // Blob URL 失效时显示占位符
                                                        const target = e.currentTarget;
                                                        target.style.display = 'none';
                                                        const parent = target.parentElement;
                                                        if (parent) {
                                                            const placeholder = parent.querySelector('.error-placeholder');
                                                            if (placeholder) (placeholder as HTMLElement).style.display = 'flex';
                                                        }
                                                    }}
                                                />
                                            )}
                                            {/* Blob URL 失效占位符 */}
                                            <div className="error-placeholder absolute inset-0 bg-red-500/10 backdrop-blur-sm hidden flex-col items-center justify-center text-red-300 text-[10px] font-medium">
                                                <ImageIcon size={20} className="mb-1 opacity-50" />
                                                <span>图片已失效</span>
                                                <span className="text-[8px] mt-1 opacity-60">请重新生成</span>
                                            </div>
                                            <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[9px] font-semibold text-white/80">
                                                {a.type.includes('image') ? 'IMG' : 'MOV'}
                                            </div>
                                            <div className="absolute bottom-0 left-0 w-full p-2 bg-gradient-to-t from-black/80 to-transparent text-[10px] text-white/90 truncate font-medium">
                                                {a.title || 'Untitled'}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </>
            );
        }

        if (activePanel === 'asset-library') {
            return <AssetLibraryPanel onUseAsset={onUseAsset} />;
        }

        // Default: Add Node
        return (
            <>
                <div className="p-1 border-b border-gray-200 flex justify-between items-center bg-white">
                    <button onClick={() => setActivePanel(null)} className="w-8 h-8 rounded-full bg-white hover:bg-gray-100 border border-gray-200 flex items-center justify-center transition-all active:scale-95">
                        <X size={14} className="text-gray-600" />
                    </button>
                    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">添加节点</span>
                </div>
                <div className="flex-1 overflow-y-auto p-1 custom-scrollbar space-y-2">
                    {/* 基础节点 */}
                    <div className="space-y-2">
                        <div className="px-1 text-[9px] font-bold uppercase tracking-wider text-gray-400">基础节点</div>
                        {[NodeType.PROMPT_INPUT, NodeType.IMAGE_GENERATOR, NodeType.VIDEO_GENERATOR].map(t => {
                            const ItemIcon = getNodeIcon(t);
                            return (
                                <button 
                                    key={t} 
                                    onClick={(e) => { e.stopPropagation(); onAddNode(t); setActivePanel(null); }} 
                                    className="w-full text-left p-2 rounded-xl bg-white hover:bg-gray-50 flex items-center gap-2.5 text-sm text-gray-900 transition-all border border-gray-200 hover:border-gray-400 active:scale-[0.98]"
                                >
                                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600">
                                        <ItemIcon size={15} />
                                    </div> 
                                    <span className="font-medium text-[12px]">{getNodeNameCN(t)}</span>
                                </button>
                            );
                        })}
                    </div>
                    
                    {/* 故事创作 */}
                    <div className="space-y-2 pt-2 border-t border-gray-200">
                        <div className="px-1 text-[9px] font-bold uppercase tracking-wider text-gray-400">故事创作</div>
                        {[NodeType.SCRIPT_NODE].map(t => {
                            const ItemIcon = getNodeIcon(t);
                            return (
                                <button 
                                    key={t} 
                                    onClick={(e) => { e.stopPropagation(); onAddNode(t); setActivePanel(null); }} 
                                    className="w-full text-left p-2 rounded-xl bg-white hover:bg-gray-50 flex items-center gap-2.5 text-sm text-gray-900 transition-all border border-gray-200 hover:border-gray-400 active:scale-[0.98]"
                                >
                                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600">
                                        <ItemIcon size={15} />
                                    </div> 
                                    <span className="font-medium text-[12px]">{getNodeNameCN(t)}</span>
                                </button>
                            );
                        })}
                    </div>
                    
                    {/* 高级工具 */}
                    <div className="space-y-2 pt-2 border-t border-gray-200">
                        <div className="px-1 text-[9px] font-bold uppercase tracking-wider text-gray-400">高级工具</div>
                        {[NodeType.MULTI_ANGLE_CAMERA, NodeType.GRID_SPLITTER].map(t => {
                            const ItemIcon = getNodeIcon(t);
                            return (
                                <button 
                                    key={t} 
                                    onClick={(e) => { e.stopPropagation(); onAddNode(t); setActivePanel(null); }} 
                                    className="w-full text-left p-2 rounded-xl bg-white hover:bg-gray-50 flex items-center gap-2.5 text-sm text-gray-900 transition-all border border-gray-200 hover:border-gray-400 active:scale-[0.98]"
                                >
                                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600">
                                        <ItemIcon size={15} />
                                    </div> 
                                    <span className="font-medium text-[12px]">{getNodeNameCN(t)}</span>
                                </button>
                            );
                        })}
                    </div>
                    
                    {/* 特殊功能 */}
                    <div className="space-y-2 pt-2 border-t border-white/5">
                        <div className="px-1 text-[9px] font-bold uppercase tracking-wider text-white/30">特殊功能</div>
                        <button 
                            onClick={(e) => { e.stopPropagation(); onToggleMultiFrame(); setActivePanel(null); }} 
                            className="w-full text-left p-2 rounded-xl bg-white/5 hover:bg-white/10 flex items-center gap-2.5 text-sm text-white/80 transition-all border border-transparent hover:border-white/10 active:scale-[0.98]"
                        >
                            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-white/70">
                                <Clapperboard size={15} />
                            </div> 
                            <span className="font-medium text-[12px]">智能多帧</span>
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); onToggleSonicStudio?.(); setActivePanel(null); }} 
                            className="w-full text-left p-2 rounded-xl bg-white/5 hover:bg-white/10 flex items-center gap-2.5 text-sm text-white/80 transition-all border border-transparent hover:border-white/10 active:scale-[0.98]"
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
                className="fixed left-6 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1 p-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
                onMouseLeave={handleSidebarLeave}
            >
                {[
                    { id: 'add', icon: Plus, tooltip: '添加节点', disabled: false },
                    { id: 'asset-library', icon: FolderHeart, tooltip: '资产库', disabled: false }, 
                    { id: 'history', icon: History, tooltip: '历史记录', disabled: false },
                    { id: 'chat', icon: MessageSquare, action: onToggleChat, active: isChatOpen, tooltip: 'AI 助手', disabled: false },
                    { id: 'undo', icon: RotateCcw, action: onUndo, tooltip: '撤销', disabled: false },
                ].map(item => (
                    <div key={item.id} className="relative group">
                        <button 
                            onMouseEnter={() => handleSidebarHover(item.id)}
                            onClick={() => item.action ? item.action() : setActivePanel(item.id as any)}
                            disabled={item.disabled}
                            className={`relative w-10 h-10 rounded-md flex items-center justify-center transition-all active:scale-95 ${
                                item.disabled 
                                    ? 'opacity-30 cursor-not-allowed' 
                                    : activePanel === item.id || item.active 
                                        ? 'bg-blue-500 text-white shadow-sm' 
                                        : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            <item.icon size={18} strokeWidth={2} />
                        </button>
                        {/* Tooltip */}
                        <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-800 rounded-md text-[10px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 font-medium">
                            {item.tooltip}
                        </div>
                    </div>
                ))}
                
                {/* Divider */}
                <div className="w-7 h-px bg-gray-200 my-1"></div>
                
                {/* Settings */}
                <div className="relative group">
                    <button 
                        onClick={onOpenSettings}
                        className="w-10 h-10 rounded-md flex items-center justify-center transition-all active:scale-95 hover:bg-gray-100 text-gray-600 hover:text-gray-900"
                    >
                        <Settings size={18} strokeWidth={2} />
                    </button>
                    <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-800 rounded-md text-[10px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 font-medium">
                        设置
                    </div>
                </div>
            </div>

            {/* Slide-out Panels - iOS Style */}
            <div 
                className={`fixed left-20 top-1/2 -translate-y-1/2 max-h-[75vh] h-auto w-72 bg-white border border-gray-200 rounded-lg shadow-xl transition-all duration-300 ease-out z-40 flex flex-col overflow-hidden ${activePanel ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0 pointer-events-none scale-95'}`}
                onMouseEnter={handlePanelEnter}
                onMouseLeave={handlePanelLeave}
                onMouseDown={(e) => e.stopPropagation()}
                onWheel={(e) => e.stopPropagation()}
            >
                {activePanel && renderPanelContent()}
            </div>

            {/* Context Menu - React Flow Style */}
            {contextMenu && (
                <div 
                    className="fixed z-[100] bg-white border border-gray-200 rounded-lg shadow-lg p-1 min-w-[140px]"
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                    onMouseDown={e => e.stopPropagation()}
                    onMouseLeave={() => setContextMenu(null)}
                >
                    {contextMenu.type === 'history' && (
                         <button 
                            className="w-full text-left px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-3 transition-colors" 
                            onClick={() => { onDeleteAsset(contextMenu.id); setContextMenu(null); }}
                         >
                             <Trash2 size={14} /> 删除
                         </button>
                    )}
                </div>
            )}
        </>
    );
};

