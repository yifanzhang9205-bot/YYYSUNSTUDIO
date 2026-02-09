/**
 * GroupToolbar - 组工具栏 UI
 * 
 * 职责：
 * - 浮动在组顶部的工具栏
 * - 只保留自动排列功能
 * - 调用 useGroup Hook 的方法
 * 
 * 架构重构 - UI Layer：
 * - 只负责渲染，不包含业务逻辑
 * - 通过 props 接收 Hook 的方法
 */

import React from 'react';
import { Grid3X3 } from 'lucide-react';

interface GroupToolbarProps {
  groupId: string;
  groupX: number;
  groupY: number;
  groupWidth: number;
  scale: number;
  panX: number;
  panY: number;
  onArrangeTopology: (groupId: string) => void;
}

export const GroupToolbar: React.FC<GroupToolbarProps> = ({
  groupId,
  groupX,
  groupY,
  groupWidth,
  scale,
  panX,
  panY,
  onArrangeTopology,
}) => {
  // 计算工具栏位置（使用 fixed 定位，显示在组框外部顶部）
  // 工具栏显示在组框上方，不遮挡内容
  const toolbarX = groupX * scale + panX + (groupWidth * scale) / 2;
  const toolbarY = groupY * scale + panY - 32; // 在组框上方 32px

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
      {/* 自动排列按钮 */}
      <button
        className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
        onClick={() => onArrangeTopology(groupId)}
        title="自动排列 (Shift+A)"
      >
        <Grid3X3 size={14} />
        <span>自动排列</span>
      </button>
    </div>
  );
};
