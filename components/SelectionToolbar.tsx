/**
 * SelectionToolbar - 临时工具栏
 * 
 * 功能：
 * - 框选节点后显示
 * - 提供"创建资产"和"打组"两个选项
 * - 不点击按钮时，只是临时选中状态
 * 
 * 架构：UI Layer
 * - 只负责渲染，不管逻辑
 * - 通过 props 接收回调函数
 */

import React from 'react';
import { FolderHeart, Package } from 'lucide-react';

interface SelectionToolbarProps {
  selectedNodeIds: string[];
  selectionBounds: { x: number; y: number; width: number; height: number };
  scale: number;
  pan: { x: number; y: number };
  onCreateAsset: () => void;
  onCreateGroup: () => void;
}

export const SelectionToolbar: React.FC<SelectionToolbarProps> = ({
  selectedNodeIds,
  selectionBounds,
  scale,
  pan,
  onCreateAsset,
  onCreateGroup,
}) => {
  // 计算工具栏位置（选区上方中心）
  const toolbarX = selectionBounds.x * scale + pan.x + (selectionBounds.width * scale) / 2;
  const toolbarY = selectionBounds.y * scale + pan.y - 60; // 上方 60px

  return (
    <div
      className="fixed z-[9999] flex items-center gap-2 bg-white border border-gray-200 rounded-lg shadow-lg px-2 py-1.5 pointer-events-auto"
      style={{
        left: `${toolbarX}px`,
        top: `${toolbarY}px`,
        transform: 'translateX(-50%)',
      }}
    >
      {/* 创建资产按钮 */}
      <button
        onMouseDown={(e) => {
          // 🔥 阻止 mousedown 冒泡，防止触发画布的拖动
          e.stopPropagation();
          console.log('[SelectionToolbar] 创建资产按钮 mousedown 被阻止');
        }}
        onClick={(e) => {
          console.log('[SelectionToolbar] 创建资产按钮被点击');
          e.stopPropagation(); // 🔥 阻止事件冒泡
          onCreateAsset();
        }}
        className="flex items-center gap-2 h-9 px-3 py-2 rounded-lg bg-blue-500 text-white text-[12px] font-medium hover:bg-blue-600 transition-all hover:scale-[1.02] active:scale-[0.98]"
        title="将选中的节点保存为资产"
      >
        <FolderHeart size={16} />
        <span>创建资产</span>
      </button>

      {/* 打组按钮 */}
      <button
        onMouseDown={(e) => {
          // 🔥 阻止 mousedown 冒泡，防止触发画布的拖动
          e.stopPropagation();
          console.log('[SelectionToolbar] 打组按钮 mousedown 被阻止');
        }}
        onClick={(e) => {
          console.log('[SelectionToolbar] 打组按钮被点击');
          e.stopPropagation(); // 🔥 阻止事件冒泡
          onCreateGroup();
        }}
        className="flex items-center gap-2 h-9 px-3 py-2 rounded-lg bg-gray-100 text-gray-700 text-[12px] font-medium hover:bg-gray-200 transition-all hover:scale-[1.02] active:scale-[0.98]"
        title="将选中的节点打组"
      >
        <Package size={16} />
        <span>打组</span>
      </button>

      {/* 选中数量提示 */}
      <div className="ml-1 text-[11px] text-gray-400 font-medium">
        {selectedNodeIds.length} 个节点
      </div>
    </div>
  );
};
