/**
 * TextNodeInitial 组件
 * 
 * 职责：显示初始状态的功能选项列表
 * 
 * UI 规格（遵循 UI 设计规则）：
 * - 专业工具风格（参考 Linear、Figma）
 * - 清晰的图标（20px SVG）
 * - 可读的文字（gray-700）
 * - 合理的间距（gap-4, px-3 py-2）
 * - 明确的悬停反馈（背景色 + 文字色）
 * - 圆角和过渡动画
 */

import React, { memo, useCallback } from 'react';
import { Edit3, Image, Wand2, Sparkles } from 'lucide-react';
import { useTextNodeActions } from '../../hooks/useTextNodeActions';
import { TextNodeMode } from '../../types';

interface TextNodeInitialProps {
  nodeId: string;
}

/**
 * 功能选项配置
 */
const FUNCTION_OPTIONS = [
  {
    mode: TextNodeMode.MANUAL,
    icon: Edit3,
    label: '自己编写内容'
  },
  {
    mode: TextNodeMode.REVERSE,
    icon: Image,
    label: '图片反推提示词'
  },
  {
    mode: TextNodeMode.TEXT_TO_IMAGE,
    icon: Wand2,
    label: '文生图'
  },
  {
    mode: TextNodeMode.PROMPT_GENERATOR,
    icon: Sparkles,
    label: '提示词生成'
  }
];

/**
 * TextNodeInitial 组件
 */
export const TextNodeInitial = memo<TextNodeInitialProps>(({ nodeId }) => {
  const { switchMode } = useTextNodeActions();
  
  // 处理选项点击
  const handleOptionClick = useCallback((mode: TextNodeMode) => {
    switchMode(nodeId, mode);
  }, [nodeId, switchMode]);
  
  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-6 py-4">
      {/* 标题 */}
      <div className="text-gray-500 text-xs font-medium mb-4 self-start">
        尝试:
      </div>
      
      {/* 功能选项列表 - 专业工具风格 */}
      <div className="flex flex-col gap-2 w-full max-w-xs">
        {FUNCTION_OPTIONS.map((option) => {
          const Icon = option.icon;
          return (
            <button
              key={option.mode}
              onClick={() => handleOptionClick(option.mode)}
              className="flex items-center gap-3 text-left
                       text-gray-700 hover:text-gray-900
                       hover:bg-gray-50
                       px-3 py-2 rounded-lg
                       transition-colors duration-150
                       cursor-pointer
                       group"
            >
              {/* 图标 - 20px，符合规范 */}
              <Icon 
                size={20} 
                className="text-gray-400 group-hover:text-gray-600 transition-colors flex-shrink-0" 
              />
              
              {/* 文字 - gray-700，清晰可读 */}
              <span className="text-sm font-medium">
                {option.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
});

TextNodeInitial.displayName = 'TextNodeInitial';
