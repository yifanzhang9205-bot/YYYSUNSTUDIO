/**
 * useContextMenu Hook
 * 
 * 职责：
 * - 管理上下文菜单状态
 * - 提供菜单打开/关闭方法
 * - 从 NodeRegistry 获取菜单项
 * 
 * 架构：
 * - Hooks Layer（交互逻辑）
 * - 调用 Core Layer（NodeRegistry）
 */

import { useState, useCallback } from 'react';
import { NodeType } from '../types';
import { getMenuItems, type NodeDefinition } from '../core/registry/NodeRegistry';

// ============================================
// 类型定义
// ============================================

/**
 * 上下文菜单状态
 */
export interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  id: string;
}

/**
 * 上下文菜单目标
 */
export interface ContextMenuTarget {
  type: 'node' | 'create' | 'group' | 'connection' | 'smart-connect';
  id?: string;
  from?: string;
  to?: string;
  portType?: 'input' | 'output';
  compatibleTypes?: NodeType[];
}

/**
 * 菜单项分组
 */
export interface MenuItems {
  basic: NodeDefinition[];
  story: NodeDefinition[];
  advanced: NodeDefinition[];
}

// ============================================
// Hook
// ============================================

export function useContextMenu() {
  // 菜单状态
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    id: '',
  });
  
  // 菜单目标
  const [contextMenuTarget, setContextMenuTarget] = useState<ContextMenuTarget | null>(null);

  /**
   * 打开上下文菜单
   */
  const openContextMenu = useCallback((menu: ContextMenuState, target: ContextMenuTarget) => {
    setContextMenu(menu);
    setContextMenuTarget(target);
  }, []);

  /**
   * 关闭上下文菜单
   */
  const closeContextMenu = useCallback(() => {
    setContextMenu({ visible: false, x: 0, y: 0, id: '' });
    setContextMenuTarget(null);
  }, []);

  /**
   * 获取菜单项（从 NodeRegistry）
   * 
   * 架构：
   * - Hooks Layer → Core Layer
   * - 从 NodeRegistry 获取节点定义
   * - 自动同步节点变化
   */
  const menuItems = useCallback((): MenuItems => {
    return getMenuItems();
  }, []);

  return {
    contextMenu,
    contextMenuTarget,
    openContextMenu,
    closeContextMenu,
    menuItems,
  };
}
