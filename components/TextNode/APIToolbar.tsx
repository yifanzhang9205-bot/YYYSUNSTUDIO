/**
 * APIToolbar 组件
 * 
 * 职责：节点下方外部浮动的 API 选择工具栏
 * 
 * UI 规格：
 * - 浮动在节点下方（absolute, top-full, mt-2）
 * - 选中节点时显示，不选中时隐藏
 * - 只显示 API 模型下拉框
 * - 样式与双击菜单一致
 */

import React, { memo, useCallback } from 'react';
import { useTextNodeStore } from '../../core/stores/textNodeStore';
import { useNodeStore } from '../../core/stores/nodeStore';

interface APIToolbarProps {
  nodeId: string;
  isSelected: boolean;
}

/**
 * API 模型选项
 */
const API_MODELS = [
  { value: 'gemini-2.0-flash-exp', label: 'Gemini 2.0 Flash' },
  { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
  { value: 'gemini-3-pro', label: 'Gemini 3 Pro' },
  { value: 'claude-sonnet', label: 'Claude Sonnet' }
];

/**
 * APIToolbar 组件
 */
export const APIToolbar = memo<APIToolbarProps>(({ nodeId, isSelected }) => {
  // 获取当前模型
  const nodeData = useNodeStore(state => state.getNode(nodeId));
  const currentModel = nodeData?.data?.model || 'gemini-2.0-flash-exp';
  
  // 处理模型切换
  const handleModelChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const newModel = e.target.value;
    useNodeStore.getState().updateNodeData(nodeId, { model: newModel });
  }, [nodeId]);
  
  // 如果节点未选中，不显示工具栏
  if (!isSelected) {
    return null;
  }
  
  return (
    <div 
      className="absolute top-full left-0 right-0 mt-2 z-10
                 flex items-center justify-center"
      onClick={(e) => e.stopPropagation()} // 防止点击工具栏时触发节点事件
    >
      <div className="bg-[#1a1a1a]/95 backdrop-blur-sm
                    border border-white/10 rounded-lg
                    px-3 py-2 shadow-xl">
        {/* API 模型下拉框 */}
        <select
          value={currentModel}
          onChange={handleModelChange}
          className="bg-white/5 border border-white/10 rounded-md
                   px-3 py-1.5 text-[11px] text-white/90
                   hover:bg-white/10 hover:border-white/20
                   focus:outline-none focus:ring-1 focus:ring-blue-500/50
                   transition-all duration-150
                   cursor-pointer"
        >
          {API_MODELS.map((model) => (
            <option 
              key={model.value} 
              value={model.value}
              className="bg-[#1a1a1a] text-white/90"
            >
              {model.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
});

APIToolbar.displayName = 'APIToolbar';
