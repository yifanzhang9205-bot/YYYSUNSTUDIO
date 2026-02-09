/**
 * AIInputBar 组件
 * 
 * 职责：通用的 AI 输入框，浮动在节点下方
 * 
 * 架构位置：UI Layer（展示层）
 * 
 * 功能：
 * - 用户输入自然语言
 * - 选择 AI 模型
 * - 发送按钮
 * - Enter 发送，Shift+Enter 换行
 * - 根据功能自动显示/隐藏
 * 
 * 通用性：可用于所有节点类型（文字、图片、视频等）
 * 
 * UI 设计：遵循 SunStudio 项目风格
 * - 白色背景（bg-white）
 * - 灰色边框（border-gray-200）
 * - 圆角（rounded-lg）
 * - 阴影（shadow-lg）
 */

import React, { memo, useState, useCallback, useRef, useEffect } from 'react';
import { Send, Sparkles } from 'lucide-react';

// ============================================
// 类型定义
// ============================================

export interface AIInputBarProps {
  /** 节点 ID */
  nodeId: string;
  
  /** 节点位置和尺寸 */
  nodeX: number;
  nodeY: number;
  nodeWidth: number;
  nodeHeight: number;
  
  /** 是否显示（控制显示/隐藏） */
  isVisible: boolean;
  
  /** 发送回调 */
  onSend: (nodeId: string, prompt: string, model: string) => void;
  
  /** 占位符文字 */
  placeholder?: string;
  
  /** 可选的 AI 模型列表 */
  models?: Array<{ id: string; name: string }>;
  
  /** 默认选中的模型 */
  defaultModel?: string;
  
  /** 是否正在生成（禁用输入） */
  isGenerating?: boolean;
}

// ============================================
// 默认 AI 模型列表
// ============================================

const DEFAULT_MODELS = [
  { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash' },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro' },
  { id: 'claude-sonnet-4', name: 'Claude Sonnet 4' },
  { id: 'gpt-4o', name: 'GPT-4o' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini' },
];

// ============================================
// 组件实现
// ============================================

export const AIInputBar = memo<AIInputBarProps>(({
  nodeId,
  nodeX,
  nodeY,
  nodeWidth,
  nodeHeight,
  isVisible,
  onSend,
  placeholder = '描述你想要的内容，AI 会帮你实现...',
  models = DEFAULT_MODELS,
  defaultModel = 'gemini-2.0-flash-exp',
  isGenerating = false,
}) => {
  // ========== 状态管理 ==========
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState(defaultModel);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // ========== 自动聚焦 ==========
  useEffect(() => {
    if (isVisible && textareaRef.current) {
      // 延迟聚焦，避免与节点选中事件冲突
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [isVisible]);
  
  // ========== 🔥 实时跟随节点拖动（读取 CSS 变量）==========
  useEffect(() => {
    if (!isVisible || !containerRef.current) return;
    
    // 查找节点元素
    const nodeElement = document.getElementById(`node-${nodeId}`);
    if (!nodeElement) return;
    
    // 监听节点的 transform 变化
    const updatePosition = () => {
      if (!containerRef.current) return;
      
      // 读取节点的 CSS 变量（拖动偏移）
      const dragOffsetX = parseFloat(nodeElement.style.getPropertyValue('--drag-offset-x') || '0');
      const dragOffsetY = parseFloat(nodeElement.style.getPropertyValue('--drag-offset-y') || '0');
      
      // 应用偏移到 AI 输入框
      if (dragOffsetX !== 0 || dragOffsetY !== 0) {
        containerRef.current.style.transform = `translate(${dragOffsetX}px, ${dragOffsetY}px)`;
      } else {
        containerRef.current.style.transform = '';
      }
    };
    
    // 使用 RAF 循环检测（拖动时每帧更新）
    let rafId: number;
    const loop = () => {
      updatePosition();
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
    
    // 清理
    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [isVisible, nodeId]);
  
  // ========== 发送处理 ==========
  const handleSend = useCallback(() => {
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt || isGenerating) {
      return;
    }
    
    // 调用回调
    onSend(nodeId, trimmedPrompt, selectedModel);
    
    // 清空输入框
    setPrompt('');
    
    // 重新聚焦
    textareaRef.current?.focus();
  }, [nodeId, prompt, selectedModel, isGenerating, onSend]);
  
  // ========== 键盘事件 ==========
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter 发送，Shift+Enter 换行
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);
  
  // ========== 阻止事件冒泡（防止触发节点拖动）==========
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);
  
  // ========== 如果不显示，不渲染 ==========
  if (!isVisible) {
    return null;
  }
  
  // ========== 渲染 ==========
  return (
    <div
      ref={containerRef}
      className="absolute z-50 pointer-events-auto"
      style={{
        // 🔥 使用 absolute 定位，相对于画布容器
        // 位置：节点下方 12px，左右各多 20px
        left: `${nodeX - 20}px`,
        top: `${nodeY + nodeHeight + 12}px`,
        width: `${nodeWidth + 40}px`,
        // 🔥 拖动时会通过 useEffect 设置 transform
        transition: 'none', // 禁用过渡，避免延迟
      }}
      onMouseDown={handleMouseDown}
    >
      {/* 容器 - 使用项目标准样式 */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 space-y-2">
        {/* 顶部提示文字 */}
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-cyan-500" />
          <p className="text-xs text-gray-600">
            {placeholder}
          </p>
        </div>
        
        {/* 底部控制栏 */}
        <div className="flex items-end gap-2">
          {/* 模型选择下拉框 */}
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            disabled={isGenerating}
            className="px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            onMouseDown={handleMouseDown}
          >
            {models.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </select>
          
          {/* 输入框 */}
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入你的想法..."
            disabled={isGenerating}
            className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 resize-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            rows={2}
            style={{
              minHeight: '40px',
              maxHeight: '120px',
            }}
            onMouseDown={handleMouseDown}
          />
          
          {/* 发送按钮 */}
          <button
            onClick={handleSend}
            disabled={!prompt.trim() || isGenerating}
            className="p-2 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg text-white transition-all flex items-center justify-center shadow-sm hover:shadow-md"
            title="发送 (Enter)"
            onMouseDown={handleMouseDown}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
});

AIInputBar.displayName = 'AIInputBar';
