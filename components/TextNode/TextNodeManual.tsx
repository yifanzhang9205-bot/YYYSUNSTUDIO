/**
 * TextNodeManual 组件
 * 
 * 职责：实现手动输入文字模式（模式 1）
 * 
 * UI 规格：
 * - 大面积文本输入区（textarea）
 * - 左上角返回按钮
 * - 无字数限制
 * - 不支持直接生成（只能通过下方 AI 对话框生成）
 * - AI 生成的内容会追加到文本框（不覆盖）
 */

import React, { memo, useCallback, useState, useRef, useEffect } from 'react';
import { useTextNodeActions } from '../../hooks/useTextNodeActions';
import { useTextNodeStore } from '../../core/stores/textNodeStore';
import { ArrowLeft } from 'lucide-react';

interface TextNodeManualProps {
  nodeId: string;
}

/**
 * TextNodeManual 组件
 */
export const TextNodeManual = memo<TextNodeManualProps>(({ nodeId }) => {
  const { switchMode } = useTextNodeActions();
  const nodeData = useTextNodeStore(state => state.getNode(nodeId));
  
  // 本地状态
  const [localPrompt, setLocalPrompt] = useState(nodeData?.prompt || '');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // 同步 Store 中的 prompt 到本地状态
  useEffect(() => {
    if (nodeData?.prompt !== undefined) {
      setLocalPrompt(nodeData.prompt);
    }
  }, [nodeData?.prompt]);
  
  // 处理返回按钮点击
  const handleBack = useCallback(() => {
    switchMode(nodeId, 'initial');
  }, [nodeId, switchMode]);
  
  // 处理文本输入
  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setLocalPrompt(newValue);
    
    // 更新 Store
    useTextNodeStore.getState().updatePrompt(nodeId, newValue);
  }, [nodeId]);
  
  return (
    <div className="w-full h-full flex flex-col p-4">
      {/* 顶部工具栏 */}
      <div className="flex items-center justify-between mb-3">
        {/* 返回按钮 */}
        <button
          onClick={handleBack}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg
                   bg-gray-50 border border-gray-200
                   hover:bg-gray-100 hover:border-gray-300
                   transition-all duration-150
                   text-gray-600 hover:text-gray-800
                   text-[11px] font-medium"
        >
          <ArrowLeft size={14} />
          <span>返回</span>
        </button>
      </div>
      
      {/* 文本输入区 */}
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={localPrompt}
          onChange={handleTextChange}
          placeholder="输入您的内容 或可通过下方对话框输入您的灵感以生成"
          className="w-full h-full resize-none
                   bg-white border border-gray-200 rounded-lg
                   px-4 py-3
                   text-gray-800 text-[13px] leading-relaxed
                   placeholder-gray-400
                   focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/30
                   transition-all duration-150
                   custom-scrollbar"
          onWheel={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          autoFocus
        />
      </div>
    </div>
  );
});

TextNodeManual.displayName = 'TextNodeManual';
