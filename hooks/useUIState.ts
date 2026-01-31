/**
 * UI 状态 Hook
 * 
 * 职责：
 * - 管理临时 UI 状态（右键菜单、图片预览、图片裁剪）
 * - 这些状态不需要持久化，只在当前会话有效
 */

import { useState, useCallback } from 'react';
import { ContextMenuState } from '../types';

/**
 * UI 状态 Hook
 */
export const useUIState = () => {
  // 右键菜单
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [contextMenuTarget, setContextMenuTarget] = useState<any>(null);

  // 图片预览
  const [expandedMedia, setExpandedMedia] = useState<any>(null);

  // 图片裁剪
  const [croppingNodeId, setCroppingNodeId] = useState<string | null>(null);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);

  /**
   * 打开右键菜单
   */
  const openContextMenu = useCallback((menu: ContextMenuState, target: any) => {
    setContextMenu(menu);
    setContextMenuTarget(target);
  }, []);

  /**
   * 关闭右键菜单
   */
  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
    setContextMenuTarget(null);
  }, []);

  /**
   * 打开图片预览
   */
  const openMedia = useCallback((media: any) => {
    setExpandedMedia(media);
  }, []);

  /**
   * 关闭图片预览
   */
  const closeMedia = useCallback(() => {
    setExpandedMedia(null);
  }, []);

  /**
   * 开始裁剪图片
   */
  const startCrop = useCallback((nodeId: string, image: string) => {
    setCroppingNodeId(nodeId);
    setImageToCrop(image);
  }, []);

  /**
   * 结束裁剪图片
   */
  const endCrop = useCallback(() => {
    setCroppingNodeId(null);
    setImageToCrop(null);
  }, []);

  return {
    // 右键菜单
    contextMenu,
    contextMenuTarget,
    openContextMenu,
    closeContextMenu,
    
    // 图片预览
    expandedMedia,
    openMedia,
    closeMedia,
    
    // 图片裁剪
    croppingNodeId,
    imageToCrop,
    startCrop,
    endCrop,
  };
};
