/**
 * GroupToolbar - 组工具栏 UI
 * 
 * 职责：
 * - 浮动在组顶部的工具栏
 * - 提供排列功能（宫格排列、竖排排列）
 * - 调用 useGroup Hook 的方法
 * 
 * 架构重构 - UI Layer：
 * - 只负责渲染，不包含业务逻辑
 * - 通过 props 接收 Hook 的方法
 */

import React, { useState } from 'react';
import { Grid3X3, FolderHeart, Package, ChevronDown, Palette, Ungroup } from 'lucide-react';
import { GroupColor } from '../types';

interface GroupToolbarProps {
  groupId: string;
  groupX: number;
  groupY: number;
  groupWidth: number;
  scale: number;
  panX: number;
  panY: number;
  onArrangeGrid: (groupId: string) => void; // 宫格排列
  onArrangeVertical: (groupId: string) => void; // 竖排排列
  // 🔥 新增：编组和添加到资产库
  onMakePermanent?: () => void; // 把临时组变成永久组
  onAddToAssetLibrary?: () => void; // 添加到资产库
  isTemporary?: boolean; // 是否是临时组
  // 🔥 新增：颜色选择（2026-02-08）
  groupColor?: GroupColor; // 组颜色
  onSelectColor?: (color: GroupColor) => void; // 选择颜色回调
  // 🔥 新增：拖动偏移量（2026-02-09）
  dragOffsetX?: number; // 拖动时的 X 偏移量（屏幕坐标）
  dragOffsetY?: number; // 拖动时的 Y 偏移量（屏幕坐标）
  // 🔥 新增：拆组功能（2026-02-09）
  onUngroup?: () => void; // 拆组 - 删除组但保留节点
}

export const GroupToolbar: React.FC<GroupToolbarProps> = ({
  groupId,
  groupX,
  groupY,
  groupWidth,
  scale,
  panX,
  panY,
  onArrangeGrid,
  onArrangeVertical,
  onMakePermanent,
  onAddToAssetLibrary,
  isTemporary = false,
  groupColor = 'default', // 🔥 默认颜色
  onSelectColor,
  dragOffsetX = 0, // 🔥 默认无偏移
  dragOffsetY = 0, // 🔥 默认无偏移
  onUngroup, // 🔥 拆组功能
}) => {
  // 下拉菜单状态
  const [showArrangeMenu, setShowArrangeMenu] = useState(false);
  // 🔥 新增：颜色选择器状态（2026-02-08）
  const [showColorPicker, setShowColorPicker] = useState(false);

  // 🔥 新增：颜色定义（2026-02-08）
  // 🔥 修改：降低透明度，使用实心色块（2026-02-08）
  const colors: Array<{ name: string; value: GroupColor; color: string }> = [
    { name: '默认', value: 'default', color: '#D1D5DB' },  // gray-300
    { name: '蓝色', value: 'blue', color: '#93C5FD' },     // blue-300
    { name: '绿色', value: 'green', color: '#86EFAC' },    // green-300
    { name: '黄色', value: 'yellow', color: '#FDE047' },   // yellow-300
    { name: '红色', value: 'red', color: '#FCA5A5' },      // red-300
    { name: '紫色', value: 'purple', color: '#D8B4FE' },   // purple-300
    { name: '橙色', value: 'orange', color: '#FDBA74' },   // orange-300
  ];

  // 计算工具栏位置（使用 fixed 定位，显示在组框外部顶部）
  // 🔥 修改：工具栏位置再往上移，不要遮挡组（从 -32px 改为 -48px）
  // 🔥 新增：加上拖动偏移量，实现实时跟随（2026-02-09）
  const toolbarX = groupX * scale + panX + (groupWidth * scale) / 2 + dragOffsetX;
  const toolbarY = groupY * scale + panY - 48 + dragOffsetY; // 在组框上方 48px（原来是 32px）

  return (
    <div
      className="fixed z-50 flex items-center gap-0.5 px-2 py-1.5 bg-white border border-gray-200 rounded-lg shadow-lg pointer-events-auto"
      style={{
        left: `${toolbarX}px`,
        top: `${toolbarY}px`,
        transform: 'translateX(-50%)',
      }}
      onMouseDown={(e) => e.stopPropagation()} // 防止触发画布拖动
    >
      {/* 🔥 临时组：显示"编组"和"添加到资产库"按钮 */}
      {isTemporary && (
        <>
          <button
            className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
            onClick={onMakePermanent}
            title="编组 - 保存为永久组"
            style={{ fontFamily: '"Source Han Sans CN", "Noto Sans SC", sans-serif' }}
          >
            <Package size={14} />
            <span>编组</span>
          </button>
          
          <button
            className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-medium text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
            onClick={onAddToAssetLibrary}
            title="添加到资产库"
            style={{ fontFamily: '"Source Han Sans CN", "Noto Sans SC", sans-serif' }}
          >
            <FolderHeart size={14} />
            <span>资产库</span>
          </button>
          
          {/* 分隔线 */}
          <div className="w-px h-4 bg-gray-200 mx-1" />
        </>
      )}
      
      {/* 🔥 永久组：显示颜色选择按钮（2026-02-08）*/}
      {!isTemporary && onSelectColor && (
        <div className="relative">
          <button
            className="flex items-center justify-center p-1.5 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
            onClick={() => setShowColorPicker(!showColorPicker)}
            title="选择组颜色"
          >
            <Palette size={14} />
          </button>
          
          {/* 颜色选择器弹窗 */}
          {showColorPicker && (
            <div 
              className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-1.5 z-50"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div className="flex gap-1.5">
                {colors.map(color => (
                  <button
                    key={color.value}
                    onClick={() => {
                      onSelectColor(color.value);
                      setShowColorPicker(false);
                    }}
                    className={`w-4 h-4 rounded-full hover:scale-110 transition-transform ${groupColor === color.value ? 'ring-1 ring-blue-500 ring-offset-1' : ''}`}
                    style={{ backgroundColor: color.color }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* 🔥 新增：排列按钮（带下拉菜单） */}
      <div className="relative">
        <button
          className="flex items-center justify-center p-1.5 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
          onClick={() => setShowArrangeMenu(!showArrangeMenu)}
          title="排列方式"
        >
          <Grid3X3 size={14} />
          <ChevronDown size={10} className={`ml-0.5 transition-transform ${showArrangeMenu ? 'rotate-180' : ''}`} />
        </button>
        
        {/* 下拉菜单 */}
        {showArrangeMenu && (
          <div 
            className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden min-w-[120px] z-50"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <button
              className="w-full flex items-center gap-2 px-3 py-2 text-[11px] font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors text-left"
              onClick={() => {
                onArrangeGrid(groupId);
                setShowArrangeMenu(false);
              }}
              title="宫格排列 - 每排4个，按层级关系"
              style={{ fontFamily: '"Source Han Sans CN", "Noto Sans SC", sans-serif' }}
            >
              <Grid3X3 size={14} />
              <span>宫格排列</span>
            </button>
            
            <button
              className="w-full flex items-center gap-2 px-3 py-2 text-[11px] font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors text-left"
              onClick={() => {
                onArrangeVertical(groupId);
                setShowArrangeMenu(false);
              }}
              title="竖排排列 - 从上到下一列"
              style={{ fontFamily: '"Source Han Sans CN", "Noto Sans SC", sans-serif' }}
            >
              <div className="flex flex-col gap-0.5">
                <div className="w-3 h-0.5 bg-current" />
                <div className="w-3 h-0.5 bg-current" />
                <div className="w-3 h-0.5 bg-current" />
              </div>
              <span>竖排排列</span>
            </button>
          </div>
        )}
      </div>
      
      {/* 🔥 新增：拆组按钮（2026-02-09）- 只对永久组显示 */}
      {!isTemporary && onUngroup && (
        <>
          {/* 分隔线 */}
          <div className="w-px h-4 bg-gray-200 mx-1" />
          
          <button
            className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            onClick={onUngroup}
            title="拆组 - 解散组但保留节点"
            style={{ fontFamily: '"Source Han Sans CN", "Noto Sans SC", sans-serif' }}
          >
            <Ungroup size={14} />
            <span>拆组</span>
          </button>
        </>
      )}
    </div>
  );
};
