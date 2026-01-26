import React, { useState } from 'react';
import { 
    AlignLeft, AlignCenter, AlignRight, 
    AlignVerticalJustifyStart, AlignVerticalJustifyCenter, AlignVerticalJustifyEnd,
    Columns, Rows, Grid3x3, ChevronDown
} from 'lucide-react';

interface GroupToolbarProps {
    groupId: string;
    position: { x: number; y: number };
    onAlign: (type: 'left' | 'center-h' | 'right' | 'top' | 'center-v' | 'bottom') => void;
    onDistribute: (type: 'horizontal' | 'vertical') => void;
    onAutoArrange: () => void;
}

export const GroupToolbar: React.FC<GroupToolbarProps> = ({
    groupId,
    position,
    onAlign,
    onDistribute,
    onAutoArrange
}) => {
    const [showAlignMenu, setShowAlignMenu] = useState(false);
    const [showDistributeMenu, setShowDistributeMenu] = useState(false);

    // 点击外部关闭所有菜单
    React.useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest('.group-toolbar')) {
                setShowAlignMenu(false);
                setShowDistributeMenu(false);
            }
        };

        if (showAlignMenu || showDistributeMenu) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [showAlignMenu, showDistributeMenu]);

    const alignOptions = [
        { icon: AlignLeft, action: () => onAlign('left'), label: '左对齐', shortcut: 'Alt+A' },
        { icon: AlignCenter, action: () => onAlign('center-h'), label: '水平居中', shortcut: 'Alt+H' },
        { icon: AlignRight, action: () => onAlign('right'), label: '右对齐', shortcut: 'Alt+D' },
        { icon: AlignVerticalJustifyStart, action: () => onAlign('top'), label: '顶部对齐', shortcut: 'Alt+W' },
        { icon: AlignVerticalJustifyCenter, action: () => onAlign('center-v'), label: '垂直居中', shortcut: 'Alt+V' },
        { icon: AlignVerticalJustifyEnd, action: () => onAlign('bottom'), label: '底部对齐', shortcut: 'Alt+S' },
    ];

    const distributeOptions = [
        { icon: Columns, action: () => onDistribute('horizontal'), label: '水平间距', shortcut: 'Shift+H' },
        { icon: Rows, action: () => onDistribute('vertical'), label: '垂直间距', shortcut: 'Shift+V' },
        { icon: Grid3x3, action: onAutoArrange, label: '自动排列', shortcut: 'Shift+A' },
    ];

    return (
        <div 
            className="fixed z-[10000] pointer-events-auto group-toolbar"
            style={{
                left: position.x,
                top: position.y,
                transform: 'translate(-50%, -100%)',
                marginTop: -12
            }}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
        >
            <div className="flex items-center gap-2 px-3 py-2 bg-white/95 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-2xl">
                {/* 对齐按钮 */}
                <div className="relative">
                    <button
                        onClick={() => {
                            setShowAlignMenu(!showAlignMenu);
                            setShowDistributeMenu(false);
                        }}
                        className="flex items-center gap-1 px-2 py-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <AlignLeft size={16} className="text-gray-700" strokeWidth={2} />
                        <ChevronDown size={12} className="text-gray-500" />
                    </button>
                    
                    {/* 对齐下拉菜单 */}
                    {showAlignMenu && (
                        <div 
                            className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-[10001]"
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {alignOptions.map((option, i) => {
                                const Icon = option.icon;
                                return (
                                    <button
                                        key={i}
                                        onClick={() => {
                                            option.action();
                                            setShowAlignMenu(false);
                                        }}
                                        className="w-full flex items-center justify-between px-4 py-2 hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Icon size={16} className="text-gray-600" strokeWidth={2} />
                                            <span className="text-sm text-gray-700">{option.label}</span>
                                        </div>
                                        <span className="text-xs text-gray-400">{option.shortcut}</span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* 间距按钮 */}
                <div className="relative">
                    <button
                        onClick={() => {
                            setShowDistributeMenu(!showDistributeMenu);
                            setShowAlignMenu(false);
                        }}
                        className="flex items-center gap-1 px-2 py-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <Columns size={16} className="text-gray-700" strokeWidth={2} />
                        <ChevronDown size={12} className="text-gray-500" />
                    </button>
                    
                    {/* 间距下拉菜单 */}
                    {showDistributeMenu && (
                        <div 
                            className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-[10001]"
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {distributeOptions.map((option, i) => {
                                const Icon = option.icon;
                                return (
                                    <button
                                        key={i}
                                        onClick={() => {
                                            option.action();
                                            setShowDistributeMenu(false);
                                        }}
                                        className="w-full flex items-center justify-between px-4 py-2 hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Icon size={16} className="text-gray-600" strokeWidth={2} />
                                            <span className="text-sm text-gray-700">{option.label}</span>
                                        </div>
                                        <span className="text-xs text-gray-400">{option.shortcut}</span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
