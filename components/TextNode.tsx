/**
 * TextNode 主组件
 * 
 * 职责：根据 mode 渲染对应的子组件
 * 
 * 架构位置：UI Layer（展示层）
 * 依赖：Hooks Layer（useTextNodeActions）、Core Layer（textNodeStore）
 * 
 * 功能：
 * - 根据 mode 切换子组件
 * - 错误边界处理
 * - React.memo 优化
 */

import React, { memo } from 'react';
import { useTextNodeStore } from '../core/stores/textNodeStore';
import { TextNodeMode } from '../types';

// 子组件
import { TextNodeInitial } from './TextNode/TextNodeInitial';
import { TextNodeManual } from './TextNode/TextNodeManual';
import { TextNodeReverse } from './TextNode/TextNodeReverse';
import { TextNodeTextToImage } from './TextNode/TextNodeTextToImage';
import { TextNodePromptGenerator } from './TextNode/TextNodePromptGenerator';

interface TextNodeProps {
  nodeId: string;
  isSelected: boolean;
}

/**
 * TextNode 主组件
 */
export const TextNode = memo<TextNodeProps>(({ nodeId, isSelected }) => {
  // 从 Store 获取节点数据
  const nodeData = useTextNodeStore(state => state.getNode(nodeId));
  
  // 如果节点数据不存在，初始化节点
  React.useEffect(() => {
    if (!nodeData) {
      useTextNodeStore.getState().initNode(nodeId);
    }
  }, [nodeId, nodeData]);
  
  // 如果节点数据还未初始化，显示加载状态
  if (!nodeData) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50">
        <div className="text-gray-400 text-sm">加载中...</div>
      </div>
    );
  }
  
  // 根据 mode 渲染对应的子组件
  switch (nodeData.mode) {
    case TextNodeMode.INITIAL:
      return <TextNodeInitial nodeId={nodeId} />;
      
    case TextNodeMode.MANUAL:
      return <TextNodeManual nodeId={nodeId} />;
      
    case TextNodeMode.REVERSE:
      return <TextNodeReverse nodeId={nodeId} />;
      
    case TextNodeMode.TEXT_TO_IMAGE:
      return <TextNodeTextToImage nodeId={nodeId} />;
      
    case TextNodeMode.PROMPT_GENERATOR:
      return <TextNodePromptGenerator nodeId={nodeId} />;
      
    default:
      return (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-red-400 text-sm">未知模式</div>
        </div>
      );
  }
});

TextNode.displayName = 'TextNode';
