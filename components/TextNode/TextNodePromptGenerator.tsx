/**
 * 文字节点 - 提示词生成模式
 * 
 * 功能：
 * - 用户输入自然语言描述
 * - AI 生成专业提示词
 * - 可编辑生成结果
 * - 复制到剪贴板
 * - 如果 AI 功能未实现，显示"功能开发中"提示
 */

import React, { useState, useCallback, useMemo } from 'react';
import { ArrowLeft, Sparkles, Copy, Check } from 'lucide-react';
import { isCozeAvailable } from '../../services/cozeService';
import { useTextNodeStore } from '../../core/stores/textNodeStore';
import { useTextNodeActions } from '../../hooks/useTextNodeActions';

interface TextNodePromptGeneratorProps {
  nodeId: string;
}

export const TextNodePromptGenerator: React.FC<TextNodePromptGeneratorProps> = React.memo(({
  nodeId,
}) => {
  // 从 Store 获取数据
  const nodeData = useTextNodeStore(state => state.getNode(nodeId));
  const userInput = nodeData?.userInput || '';
  const generatedPrompt = nodeData?.generatedPrompt || '';
  const isGenerating = nodeData?.isGenerating || false;
  const error = nodeData?.error;

  // 从 Hook 获取操作方法
  const actions = useTextNodeActions();

  const [isCopied, setIsCopied] = useState(false);

  // 检查 AI 功能是否可用
  const aiAvailable = useMemo(() => isCozeAvailable(), []);

  // 更新用户输入
  const handleUserInputChange = useCallback((input: string) => {
    useTextNodeStore.getState().updateUserInput(nodeId, input);
  }, [nodeId]);

  // 更新生成的提示词
  const handleGeneratedPromptChange = useCallback((prompt: string) => {
    useTextNodeStore.getState().updateGeneratedPrompt(nodeId, prompt);
  }, [nodeId]);

  // 生成提示词
  const handleGenerate = useCallback(async () => {
    if (!userInput.trim()) {
      return;
    }

    if (userInput.length > 500) {
      return;
    }

    await actions.generatePrompt(nodeId);
  }, [nodeId, userInput, actions]);

  // 复制到剪贴板
  const handleCopy = useCallback(async () => {
    if (!generatedPrompt) return;

    try {
      await navigator.clipboard.writeText(generatedPrompt);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('[TextNodePromptGenerator] 复制失败:', err);
    }
  }, [generatedPrompt]);

  // 返回初始状态
  const handleBack = useCallback(() => {
    actions.resetNode(nodeId);
  }, [nodeId, actions]);

  // 如果 AI 功能不可用，显示开发中提示
  if (!aiAvailable) {
    return (
      <div className="flex flex-col h-full">
        {/* 返回按钮 */}
        <button
          onClick={handleBack}
          className="absolute top-2 left-2 p-1.5 
                     text-gray-400 hover:text-gray-600 
                     hover:bg-white/5 rounded-md 
                     transition-colors z-10"
          title="返回"
        >
          <ArrowLeft size={14} />
        </button>

        {/* 功能开发中提示 */}
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6">
          <div className="text-[11px] text-gray-400 text-center">
            🚧 功能开发中
          </div>
          <div className="text-[9px] text-gray-500 text-center max-w-xs leading-relaxed">
            提示词生成功能需要 AI 导演（Coze API）支持，
            该功能正在开发中，敬请期待。
          </div>
        </div>
      </div>
    );
  }

  // AI 功能可用，显示完整界面
  return (
    <div className="flex flex-col h-full">
      {/* 返回按钮 */}
      <button
        onClick={handleBack}
        className="absolute top-2 left-2 p-1.5 
                   text-gray-400 hover:text-gray-600 
                   hover:bg-white/5 rounded-md 
                   transition-colors z-10"
        title="返回"
      >
        <ArrowLeft size={14} />
      </button>

      {/* 用户输入区 */}
      <div className="flex-1 flex flex-col gap-2 p-4 pt-10">
        <div className="text-[10px] font-medium text-gray-600">
          描述您的需求
        </div>
        <textarea
          value={userInput}
          onChange={(e) => handleUserInputChange(e.target.value)}
          placeholder="例如：一个赛博朋克风格的城市夜景，霓虹灯闪烁，雨后的街道反射着光芒..."
          className="flex-1 px-3 py-2 
                     text-[11px] text-gray-700 
                     bg-white/50 
                     border border-gray-200/80 
                     rounded-lg 
                     placeholder:text-gray-400 
                     focus:outline-none focus:border-purple-400 
                     resize-none transition-colors"
          maxLength={500}
        />
        <div className="flex items-center justify-between">
          <div className="text-[9px] text-gray-400">
            {userInput.length}/500
          </div>
          {error && (
            <div className="text-[9px] text-red-500">
              {error}
            </div>
          )}
        </div>

        {/* 生成提示词按钮 */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !userInput.trim()}
          className="w-full px-4 py-2.5 
                     text-[10px] font-bold text-white 
                     bg-purple-500 hover:bg-purple-600 
                     disabled:bg-gray-300 disabled:cursor-not-allowed 
                     rounded-lg 
                     flex items-center justify-center gap-2 
                     transition-colors"
        >
          <Sparkles size={12} />
          {isGenerating ? '生成中...' : '生成提示词'}
        </button>
      </div>

      {/* 生成结果显示区 */}
      {generatedPrompt && (
        <div className="flex flex-col gap-2 p-4 pt-0">
          <div className="flex items-center justify-between">
            <div className="text-[10px] font-medium text-gray-600">
              生成的提示词
            </div>
            <button
              onClick={handleCopy}
              className="px-2 py-1 
                         text-[9px] font-medium 
                         text-purple-600 hover:text-purple-700 
                         bg-purple-50 hover:bg-purple-100 
                         rounded-md 
                         flex items-center gap-1 
                         transition-colors"
            >
              {isCopied ? (
                <>
                  <Check size={10} />
                  已复制
                </>
              ) : (
                <>
                  <Copy size={10} />
                  复制
                </>
              )}
            </button>
          </div>
          <textarea
            value={generatedPrompt}
            onChange={(e) => handleGeneratedPromptChange(e.target.value)}
            className="h-32 px-3 py-2 
                       text-[11px] text-gray-700 
                       bg-white/50 
                       border border-gray-200/80 
                       rounded-lg 
                       focus:outline-none focus:border-purple-400 
                       resize-none transition-colors"
          />
        </div>
      )}
    </div>
  );
});

TextNodePromptGenerator.displayName = 'TextNodePromptGenerator';
