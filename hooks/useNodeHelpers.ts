/**
 * 节点辅助函数 Hook
 * 
 * 职责：
 * - 提供节点相关的辅助函数
 * - 计算节点边界、名称、图标等
 * - 不包含业务逻辑，只是纯计算
 */

import { useCallback } from 'react';
import { AppNode, NodeType } from '../types';
import { getNodeName, getNodeIconName } from '../core/registry/NodeRegistry';
import { 
  Type, Image as ImageIcon, Film, Mic2, ScanFace, Brush, 
  Sparkles, LayoutTemplate, Grid3X3, Plus 
} from 'lucide-react';
import { useSelectionStore } from '../core/stores/selectionStore';

/**
 * 获取图片尺寸
 */
export const getImageDimensions = (src: string): Promise<{width: number, height: number}> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({width: img.width, height: img.height});
    img.onerror = reject;
    img.src = src;
  });
};

/**
 * 节点辅助函数 Hook
 */
export const useNodeHelpers = () => {
  /**
   * 计算节点的近似高度
   * 注意：不依赖 useSelection 的 selectedNodeIds，而是从 Store 直接获取
   */
  const getApproxNodeHeight = useCallback((node: AppNode) => {
    if (node.height) return node.height;
    const width = node.width || 420;
    
    if (['PROMPT_INPUT', 'VIDEO_ANALYZER', 'IMAGE_EDITOR'].includes(node.type)) {
      return 360;
    }
    
    if (node.type === NodeType.AUDIO_GENERATOR) {
      return 200;
    }
    
    // 故事创作节点：选中时展开，未选中时收起
    if (node.type === NodeType.STORY_STUDIO) {
      const selectedNodeIds = useSelectionStore.getState().selectedNodeIds;
      const isSelected = selectedNodeIds.includes(node.id);
      return isSelected ? 500 : 120;
    }
    
    if (node.type === NodeType.CHARACTER_REFERENCE || node.type === NodeType.SCENE_REFERENCE) {
      return 400;
    }
    
    if (node.type === NodeType.STORYBOARD_SHOT) {
      return 450;
    }
    
    // 多角度相机：始终展开，大尺寸显示
    if (node.type === NodeType.MULTI_ANGLE_CAMERA) {
      return 800;
    }
    
    // 九宫格处理节点
    if (node.type === NodeType.GRID_SPLITTER) {
      return 480;
    }
    
    const [w, h] = (node.data.aspectRatio || '16:9').split(':').map(Number);
    const extra = (node.type === NodeType.VIDEO_GENERATOR && node.data.generationMode === 'CUT') ? 36 : 0;
    return ((width * h / w) + extra);
  }, []);

  /**
   * 获取节点边界
   */
  const getNodeBounds = useCallback((node: AppNode) => {
    const h = node.height || getApproxNodeHeight(node);
    const w = node.width || 420;
    return { 
      x: node.x, 
      y: node.y, 
      width: w, 
      height: h, 
      r: node.x + w, 
      b: node.y + h 
    };
  }, [getApproxNodeHeight]);

  /**
   * 获取节点中文名称
   */
  const getNodeNameCN = useCallback((type: string) => {
    return getNodeName(type as NodeType);
  }, []);

  /**
   * 获取节点图标
   */
  const getNodeIcon = useCallback((type: string) => {
    const iconName = getNodeIconName(type as NodeType);
    
    // 映射图标名称到实际的图标组件
    const iconMap: Record<string, any> = {
      'Type': Type,
      'Image': ImageIcon,
      'Video': Film,
      'Music': Mic2,
      'ScanFace': ScanFace,
      'Brush': Brush,
      'Sparkles': Sparkles,
      'User': ScanFace,
      'MapPin': LayoutTemplate,
      'Camera': Film,
      'LayoutTemplate': LayoutTemplate,
      'Grid3X3': Grid3X3,
      'Film': Film,
    };
    
    return iconMap[iconName || ''] || Plus;
  }, []);

  return {
    getApproxNodeHeight,
    getNodeBounds,
    getNodeNameCN,
    getNodeIcon,
  };
};
