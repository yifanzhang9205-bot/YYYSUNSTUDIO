/**
 * useSelection Hook - 选择逻辑
 * 
 * 职责：
 * - 处理节点选择（单选、多选、框选）
 * - 管理选中状态
 * - 处理快捷键（Ctrl+A 全选、Delete 删除）
 * 
 * 架构重构 - 阶段 B：
 * - 使用 selectionStore 管理选择状态
 * - 不再使用内部 useState
 */

import { useState, useCallback } from 'react';
import { AppNode } from '../types';
import { useSelectionStore } from '../core/stores/selectionStore';

interface UseSelectionOptions {
  nodes: Map<string, AppNode>;
  onDeleteNodes: (ids: string[]) => void;
  // 🔥 框选批量移动：框选后自动创建临时组
  onExpandOrCreateGroup?: (selectedNodeIds: string[]) => void;
}

export const useSelection = ({ nodes, onDeleteNodes, onExpandOrCreateGroup }: UseSelectionOptions) => {
  // === 架构重构：使用 selectionStore 而不是 useState ===
  const selectedNodeIds = useSelectionStore(state => state.selectedNodeIds);
  const selectNodeInStore = useSelectionStore(state => state.selectNode);
  const selectNodesInStore = useSelectionStore(state => state.selectNodes);
  const clearSelectionInStore = useSelectionStore(state => state.clearNodeSelection);
  
  // 框选矩形仍然使用 useState（临时 UI 状态）
  const [selectionRect, setSelectionRect] = useState<{
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
  } | null>(null);

  /**
   * 选择单个节点
   */
  const selectNode = useCallback((nodeId: string, addToSelection: boolean = false) => {
    selectNodeInStore(nodeId, addToSelection);
  }, [selectNodeInStore]);

  /**
   * 选择多个节点
   */
  const selectNodes = useCallback((nodeIds: string[], addToSelection: boolean = false) => {
    if (addToSelection) {
      // 添加到现有选择
      const newIds = nodeIds.filter(id => !selectedNodeIds.includes(id));
      selectNodesInStore([...selectedNodeIds, ...newIds]);
    } else {
      // 替换选择
      selectNodesInStore(nodeIds);
    }
  }, [selectNodesInStore, selectedNodeIds]);

  /**
   * 清空选择
   */
  const clearSelection = useCallback(() => {
    clearSelectionInStore();
  }, [clearSelectionInStore]);

  /**
   * 全选
   */
  const selectAll = useCallback(() => {
    selectNodesInStore(Array.from(nodes.keys()));
  }, [nodes, selectNodesInStore]);

  /**
   * 开始框选
   */
  const startBoxSelection = useCallback((x: number, y: number) => {
    setSelectionRect({
      startX: x,
      startY: y,
      currentX: x,
      currentY: y,
    });
  }, []);

  /**
   * 更新框选
   */
  const updateBoxSelection = useCallback((x: number, y: number) => {
    setSelectionRect(prev => {
      if (!prev) return null;
      return {
        ...prev,
        currentX: x,
        currentY: y,
      };
    });
  }, []);

  /**
   * 结束框选
   */
  const endBoxSelection = useCallback((scale: number, pan: { x: number; y: number }) => {
    if (!selectionRect) {
      console.log('[useSelection] endBoxSelection: 没有框选区域');
      return;
    }

    console.log('[useSelection] endBoxSelection 开始', { selectionRect, scale, pan });

    // 计算框选区域（世界坐标）
    const minX = Math.min(selectionRect.startX, selectionRect.currentX);
    const maxX = Math.max(selectionRect.startX, selectionRect.currentX);
    const minY = Math.min(selectionRect.startY, selectionRect.currentY);
    const maxY = Math.max(selectionRect.startY, selectionRect.currentY);

    // 转换为世界坐标
    const worldMinX = (minX - pan.x) / scale;
    const worldMaxX = (maxX - pan.x) / scale;
    const worldMinY = (minY - pan.y) / scale;
    const worldMaxY = (maxY - pan.y) / scale;

    console.log('[useSelection] 框选区域（世界坐标）', {
      worldMinX,
      worldMaxX,
      worldMinY,
      worldMaxY,
    });

    // 查找在框选区域内的节点
    const selectedIds: string[] = [];
    nodes.forEach((node, id) => {
      const nodeRight = node.x + (node.width || 420);
      const nodeBottom = node.y + (node.height || 300);

      // AABB 碰撞检测
      const isInside =
        node.x < worldMaxX &&
        nodeRight > worldMinX &&
        node.y < worldMaxY &&
        nodeBottom > worldMinY;

      if (isInside) {
        selectedIds.push(id);
        console.log('[useSelection] 节点在框选区域内', {
          id,
          nodeX: node.x,
          nodeY: node.y,
          nodeRight,
          nodeBottom,
        });
      }
    });

    console.log('[useSelection] 框选结果', {
      selectedCount: selectedIds.length,
      selectedIds,
    });

    // 更新选择（使用 Store）
    selectNodesInStore(selectedIds);

    // 🔥 框选批量移动：框选后自动创建临时组
    if (selectedIds.length >= 2 && onExpandOrCreateGroup) {
      console.log('[useSelection] 框选后自动创建临时组', { selectedIds });
      onExpandOrCreateGroup(selectedIds);
    }

    // 清空框选区域
    setSelectionRect(null);
  }, [selectionRect, nodes, selectNodesInStore, onExpandOrCreateGroup]);

  /**
   * 取消框选
   */
  const cancelBoxSelection = useCallback(() => {
    setSelectionRect(null);
  }, []);

  /**
   * 删除选中的节点
   */
  const deleteSelected = useCallback(() => {
    if (selectedNodeIds.length > 0) {
      onDeleteNodes(selectedNodeIds);
      clearSelectionInStore();
    }
  }, [selectedNodeIds, onDeleteNodes, clearSelectionInStore]);

  /**
   * 🔥 资产库重构：计算选区边界
   * 用于显示临时工具栏的位置
   */
  const getSelectionBounds = useCallback(() => {
    if (selectedNodeIds.length === 0) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    selectedNodeIds.forEach(id => {
      const node = nodes.get(id);
      if (node) {
        minX = Math.min(minX, node.x);
        minY = Math.min(minY, node.y);
        maxX = Math.max(maxX, node.x + (node.width || 420));
        maxY = Math.max(maxY, node.y + (node.height || 300));
      }
    });

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }, [selectedNodeIds, nodes]);

  // === 快捷键处理已移至 App.tsx（避免冲突）===
  // useEffect(() => {
  //   const handleKeyDown = (e: KeyboardEvent) => {
  //     if ((e.ctrlKey || e.metaKey) && e.key === 'a') { ... }
  //     if (e.key === 'Delete' || e.key === 'Backspace') { ... }
  //     if (e.key === 'Escape') { ... }
  //   };
  //   window.addEventListener('keydown', handleKeyDown);
  //   return () => window.removeEventListener('keydown', handleKeyDown);
  // }, [selectAll, deleteSelected, clearSelection]);

  return {
    selectedNodeIds,
    selectionRect,
    selectNode,
    selectNodes,
    clearSelection,
    selectAll,
    startBoxSelection,
    updateBoxSelection,
    endBoxSelection,
    cancelBoxSelection,
    deleteSelected,
    getSelectionBounds, // 🔥 新增：计算选区边界
  };
};
