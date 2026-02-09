/**
 * TextNodeTextToImage - 文生图模式
 * 
 * 功能：
 * 1. 进入模式时自动创建图片节点并建立连接
 * 2. 显示文本输入区（输入图片生成提示词）
 * 3. 显示连接状态指示（绿点 + 图标 + 文字）
 * 4. 点击"生成"按钮传递提示词给图片节点
 * 5. 支持返回初始状态
 */

import React, { useState, useCallback, useEffect } from 'react';
import { ArrowLeft, Link2 } from 'lucide-react';
import { useTextNodeStore } from '../../core/stores/textNodeStore';
import { useTextNodeActions } from '../../hooks/useTextNodeActions';

interface TextNodeTextToImageProps {
  nodeId: string;
}

export const TextNodeTextToImage: React.FC<TextNodeTextToImageProps> = React.memo(({
  nodeId,
}) => {
  // 从 Store 获取节点数据
  const nodeData = useTextNodeStore(state => state.getNode(nodeId));
  
  // 获取操作方法
  const { createOutputNode, passPromptToDownstream, resetNode } = useTextNodeActions();
  
  // 本地状态
  const [localPrompt, setLocalPrompt] = useState(nodeData?.prompt || '');
  const [isConnected, setIsConnected] = useState(!!nodeData?.outputNodeId);
  
  // 自动创建输出节点（只在首次进入时创建）
  useEffect(() => {
    if (!nodeData?.outputNodeId) {
      createOutputNode(nodeId).then((newNodeId) => {
        if (newNodeId) {
          setIsConnected(true);
        }
      });
    } else {
      setIsConnected(true);
    }
  }, []); // 空依赖数组，只在组件挂载时执行一次
  
  // 同步 Store 中的 prompt 到本地状态
  useEffect(() => {
    if (nodeData?.prompt !== undefined) {
      setLocalPrompt(nodeData.prompt);
    }
  }, [nodeData?.prompt]);
  
  // 处理提示词输入
  const handlePromptChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newPrompt = e.target.value;
    setLocalPrompt(newPrompt);
    // 更新 Store
    useTextNodeStore.getState().updatePrompt(nodeId, newPrompt);
  }, [nodeId]);
  
  // 处理生成按钮（传递提示词给图片节点）
  const handleGenerate = useCallback(() => {
    if (!localPrompt.trim() || !isConnected) return;
    passPromptToDownstream(nodeId, localPrompt);
  }, [nodeId, localPrompt, isConnected, passPromptToDownstream]);
  
  // 处理返回按钮
  const handleBack = useCallback(() => {
    resetNode();
  }, [resetNode]);
  
  // 处理 Enter 键（Shift+Enter 换行，Enter 不触发）
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // 阻止默认换行
      // Enter 键不触发生成，只有点击按钮才触发
    }
  }, []);
  
  return (
    <div className="relative w-full h-full flex flex-col">
      {/* 返回按钮 */}
      <button
        onClick={handleBack}
        className="absolute top-2 left-2 p-1.5 rounded-lg 
                   bg-gray-50 hover:bg-gray-100 
                   border border-gray-200 
                   transition-colors z-10"
        title="返回"
      >
        <ArrowLeft size={14} className="text-gray-600" />
      </button>
      
      {/* 文本输入区域 */}
      <textarea
        className="w-full h-full bg-transparent resize-none 
                   focus:outline-none text-sm text-gray-800 
                   placeholder-gray-400 font-medium leading-relaxed 
                   custom-scrollbar selection:bg-blue-200
                   px-4 py-3 pt-12 pb-20"
        placeholder="输入图片生成提示词..."
        value={localPrompt}
        onChange={handlePromptChange}
        onKeyDown={handleKeyDown}
        maxLength={1000}
      />
      
      {/* 连接状态指示 */}
      {isConnected && (
        <div className="absolute bottom-16 left-4 flex items-center gap-2 text-[9px] text-gray-500">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <Link2 size={10} />
          <span>已连接到图片节点</span>
        </div>
      )}
      
      {/* 字数统计 */}
      <div className="absolute bottom-16 right-4 text-[9px] text-gray-500">
        {localPrompt.length}/1000
      </div>
      
      {/* 生成按钮 */}
      <button
        onClick={handleGenerate}
        disabled={!localPrompt.trim() || !isConnected}
        className="absolute bottom-4 right-4 
                   px-4 py-2 text-[11px] font-bold text-white 
                   bg-blue-500 hover:bg-blue-600 rounded-lg 
                   transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        生成
      </button>
    </div>
  );
});

TextNodeTextToImage.displayName = 'TextNodeTextToImage';
