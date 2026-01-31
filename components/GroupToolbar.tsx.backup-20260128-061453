/**
 * GroupToolbar - 组工具栏 UI
 * 
 * 职责：
 * - 浮动在组顶部的工具栏
 * - 两个折叠菜单（对齐、分布/排列）
 * - 调用 useGroup Hook 的方法
 * 
 * 架构重构 - UI Layer：
 * - 只负责渲染，不包含业务逻辑
 * - 通过 props 接收 Hook 的方法
 */

import React, { useState } from 'react';
import { 
  AlignLeft, AlignCenter, AlignRight, 
  AlignVerticalJustifyCenter, AlignHorizontalJustifyCenter,
  AlignVerticalSpaceAround, AlignHorizontalSpaceAround,
  Grid3X3
} from 'lucide-react';

interface GroupToolbarProps {
  groupId: string;
  groupX: number;
  groupY: number;
  groupWidth: number;
  scale: number;
  panX: number;
  panY: number;
  onAlignLeft: (groupId: string) => void;
  onAlignCenterH: (groupId: string) => void;
  onAlignRight: (groupId: string) => void;
  onAlignTop: (groupId: string) => void;
  onAlignCenterV: (groupId: string) => void;
  onAlignBottom: (groupId: string) => void;
  onDistributeH: (groupId: string) => void;
  onDistributeV: (groupId: string) => void;
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
  onAlignLeft,
  onAlignCenterH,
  onAlignRight,
  onAlignTop,
  onAlignCenterV,
  onAlignBottom,
  onDistributeH,
  onDistributeV,
  onArrangeTopology,
}) => {
  const [isAlignMenuOpen, setIsAlignMenuOpen] = useState(false);
  const [isDistributeMenuOpen, setIsDistributeMenuOpen] = useState(false);

  // 计算工具栏位置（使用 fixed 定位，显示在组框外部顶部）
  // 工具栏显示在组框上方，不遮挡内容
  const toolbarX = groupX * scale + panX + (groupWidth * scale) / 2;
  const toolbarY = groupY * scale + panY - 32; // 在组框上方 32px

  return (
    <div
      className="fixed z-50 flex items-center gap-0.5 px-1.5 py-1 bg-white/80 dark:bg-[#2c2c2e]/90 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-md shadow-lg pointer-events-auto"
      style={{
        left: `${toolbarX}px`,
        top: `${toolbarY}px`,
        transform: 'translateX(-50%)',
      }}
      onMouseDown={(e) => e.stopPropagation()} // 防止触发画布拖动
    >
      {/* 对齐菜单 */}
      <div className="relative">
        <button
          className="p-1 text-slate-600 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 hover:bg-cyan-500/10 rounded transition-colors flex items-center gap-0.5"
          onClick={() => {
            setIsAlignMenuOpen(!isAlignMenuOpen);
            setIsDistributeMenuOpen(false);
          }}
          title="对齐"
        >
          <AlignLeft size={12} />
          <svg width="6" height="6" viewBox="0 0 8 8" fill="currentColor">
            <path d="M4 5L2 3h4z" />
          </svg>
        </button>

        {isAlignMenuOpen && (
          <div className="absolute top-full left-0 mt-1 bg-white dark:bg-[#2c2c2e] border border-white/20 dark:border-white/10 rounded-lg shadow-2xl p-1 min-w-[140px] animate-in fade-in zoom-in-95 duration-200">
            <button
              className="w-full text-left px-2 py-1.5 text-[10px] font-medium text-slate-700 dark:text-white/90 hover:bg-cyan-500/10 hover:text-cyan-600 dark:hover:text-cyan-400 rounded flex items-center gap-1.5 transition-colors"
              onClick={() => {
                onAlignLeft(groupId);
                setIsAlignMenuOpen(false);
              }}
            >
              <AlignLeft size={12} />
              <span>左对齐</span>
              <span className="ml-auto text-[8px] text-slate-400">Alt+A</span>
            </button>

            <button
              className="w-full text-left px-2 py-1.5 text-[10px] font-medium text-slate-700 dark:text-white/90 hover:bg-cyan-500/10 hover:text-cyan-600 dark:hover:text-cyan-400 rounded flex items-center gap-1.5 transition-colors"
              onClick={() => {
                onAlignCenterH(groupId);
                setIsAlignMenuOpen(false);
              }}
            >
              <AlignHorizontalJustifyCenter size={12} />
              <span>水平居中</span>
              <span className="ml-auto text-[8px] text-slate-400">Alt+H</span>
            </button>

            <button
              className="w-full text-left px-2 py-1.5 text-[10px] font-medium text-slate-700 dark:text-white/90 hover:bg-cyan-500/10 hover:text-cyan-600 dark:hover:text-cyan-400 rounded flex items-center gap-1.5 transition-colors"
              onClick={() => {
                onAlignRight(groupId);
                setIsAlignMenuOpen(false);
              }}
            >
              <AlignRight size={12} />
              <span>右对齐</span>
              <span className="ml-auto text-[8px] text-slate-400">Alt+D</span>
            </button>

            <div className="h-px bg-white/10 my-0.5" />

            <button
              className="w-full text-left px-2 py-1.5 text-[10px] font-medium text-slate-700 dark:text-white/90 hover:bg-cyan-500/10 hover:text-cyan-600 dark:hover:text-cyan-400 rounded flex items-center gap-1.5 transition-colors"
              onClick={() => {
                onAlignTop(groupId);
                setIsAlignMenuOpen(false);
              }}
            >
              <AlignLeft size={12} style={{ transform: 'rotate(90deg)' }} />
              <span>顶部对齐</span>
              <span className="ml-auto text-[8px] text-slate-400">Alt+W</span>
            </button>

            <button
              className="w-full text-left px-2 py-1.5 text-[10px] font-medium text-slate-700 dark:text-white/90 hover:bg-cyan-500/10 hover:text-cyan-600 dark:hover:text-cyan-400 rounded flex items-center gap-1.5 transition-colors"
              onClick={() => {
                onAlignCenterV(groupId);
                setIsAlignMenuOpen(false);
              }}
            >
              <AlignVerticalJustifyCenter size={12} />
              <span>垂直居中</span>
              <span className="ml-auto text-[8px] text-slate-400">Alt+V</span>
            </button>

            <button
              className="w-full text-left px-2 py-1.5 text-[10px] font-medium text-slate-700 dark:text-white/90 hover:bg-cyan-500/10 hover:text-cyan-600 dark:hover:text-cyan-400 rounded flex items-center gap-1.5 transition-colors"
              onClick={() => {
                onAlignBottom(groupId);
                setIsAlignMenuOpen(false);
              }}
            >
              <AlignRight size={12} style={{ transform: 'rotate(90deg)' }} />
              <span>底部对齐</span>
              <span className="ml-auto text-[8px] text-slate-400">Alt+S</span>
            </button>
          </div>
        )}
      </div>

      {/* 分隔线 */}
      <div className="w-px h-3 bg-white/20 dark:bg-white/10" />

      {/* 分布/排列菜单 */}
      <div className="relative">
        <button
          className="p-1 text-slate-600 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 hover:bg-cyan-500/10 rounded transition-colors flex items-center gap-0.5"
          onClick={() => {
            setIsDistributeMenuOpen(!isDistributeMenuOpen);
            setIsAlignMenuOpen(false);
          }}
          title="分布/排列"
        >
          <Grid3X3 size={12} />
          <svg width="6" height="6" viewBox="0 0 8 8" fill="currentColor">
            <path d="M4 5L2 3h4z" />
          </svg>
        </button>

        {isDistributeMenuOpen && (
          <div className="absolute top-full left-0 mt-1 bg-white dark:bg-[#2c2c2e] border border-white/20 dark:border-white/10 rounded-lg shadow-2xl p-1 min-w-[140px] animate-in fade-in zoom-in-95 duration-200">
            <button
              className="w-full text-left px-2 py-1.5 text-[10px] font-medium text-slate-700 dark:text-white/90 hover:bg-cyan-500/10 hover:text-cyan-600 dark:hover:text-cyan-400 rounded flex items-center gap-1.5 transition-colors"
              onClick={() => {
                onDistributeH(groupId);
                setIsDistributeMenuOpen(false);
              }}
            >
              <AlignHorizontalSpaceAround size={12} />
              <span>水平间距</span>
              <span className="ml-auto text-[8px] text-slate-400">Shift+H</span>
            </button>

            <button
              className="w-full text-left px-2 py-1.5 text-[10px] font-medium text-slate-700 dark:text-white/90 hover:bg-cyan-500/10 hover:text-cyan-600 dark:hover:text-cyan-400 rounded flex items-center gap-1.5 transition-colors"
              onClick={() => {
                onDistributeV(groupId);
                setIsDistributeMenuOpen(false);
              }}
            >
              <AlignVerticalSpaceAround size={12} />
              <span>垂直间距</span>
              <span className="ml-auto text-[8px] text-slate-400">Shift+V</span>
            </button>

            <div className="h-px bg-white/10 my-0.5" />

            <button
              className="w-full text-left px-2 py-1.5 text-[10px] font-medium text-slate-700 dark:text-white/90 hover:bg-cyan-500/10 hover:text-cyan-600 dark:hover:text-cyan-400 rounded flex items-center gap-1.5 transition-colors"
              onClick={() => {
                onArrangeTopology(groupId);
                setIsDistributeMenuOpen(false);
              }}
            >
              <Grid3X3 size={12} />
              <span>自动排列</span>
              <span className="ml-auto text-[8px] text-slate-400">Shift+A</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
