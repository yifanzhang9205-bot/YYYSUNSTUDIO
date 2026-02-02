/**
 * useDrag Hook - 拖拽逻辑（Transform + 连线补偿方案 + Helper Lines）
 * 
 * 职责：
 * - 处理节点拖拽（单选、多选）
 * - 使用 RAF + Transform 优化性能
 * - 通过 CSS 变量传递 transform 偏移，让连线能读取
 * - 提供辅助线检测和吸附功能
 * 
 * 性能优化：
 * - 拖拽时：直接操作 DOM（跳过 React 渲染）
 * - 松手时：更新 Store（同步最终位置）
 * - 使用 RAF 节流，避免每次 mousemove 触发渲染
 * - 使用 CSS 变量传递偏移量，连线可以读取
 */

import React, { useRef, useCallback, useState, useEffect } from 'react';
import { AppNode } from '../types';

/**
 * 辅助线类型定义
 */
export interface HelperLine {
  type: 'horizontal' | 'vertical';
  position: number; // y 坐标（水平线）或 x 坐标（垂直线）
  start: number; // 线的起点
  end: number; // 线的终点
}

interface DragContext {
  id: string;
  startX: number;
  startY: number;
  mouseStartX: number;
  mouseStartY: number;
  parentGroupId?: string | null;
  siblingNodeIds: string[];
  nodeWidth: number;
  nodeHeight: number;
  element: HTMLElement | null;
}

interface UseDragOptions {
  scale: number;
  onUpdateNode: (id: string, updates: Partial<AppNode>) => void;
  onSaveHistory: () => void;
  nodes?: Map<string, AppNode>; // 🆕 用于辅助线检测
}

export const useDrag = ({ scale, onUpdateNode, onSaveHistory, nodes }: UseDragOptions) => {
  const dragRef = useRef<DragContext | null>(null);
  const rafRef = useRef<number | null>(null);
  const helperLinesRafRef = useRef<number | null>(null); // 🔥 辅助线检测节流 RAF
  const [isDragging, setIsDragging] = useState(false);
  const [helperLines, setHelperLines] = useState<HelperLine[]>([]); // 🆕 辅助线状态

  /**
   * 🆕 检测辅助线
   * 检测拖拽节点与其他节点的对齐关系
   */
  const detectHelperLines = useCallback((
    draggingNode: AppNode,
    allNodes: Map<string, AppNode>,
    threshold: number = 5
  ): HelperLine[] => {
    const lines: HelperLine[] = [];
    const dragRect = {
      left: draggingNode.x,
      right: draggingNode.x + (draggingNode.width || 420),
      top: draggingNode.y,
      bottom: draggingNode.y + (draggingNode.height || 360),
      centerX: draggingNode.x + (draggingNode.width || 420) / 2,
      centerY: draggingNode.y + (draggingNode.height || 360) / 2,
    };

    allNodes.forEach((node) => {
      if (node.id === draggingNode.id) return;

      const nodeRect = {
        left: node.x,
        right: node.x + (node.width || 420),
        top: node.y,
        bottom: node.y + (node.height || 360),
        centerX: node.x + (node.width || 420) / 2,
        centerY: node.y + (node.height || 360) / 2,
      };

      // 检测垂直对齐（左、右、中心）
      if (Math.abs(dragRect.left - nodeRect.left) < threshold) {
        lines.push({
          type: 'vertical',
          position: nodeRect.left,
          start: Math.min(dragRect.top, nodeRect.top),
          end: Math.max(dragRect.bottom, nodeRect.bottom),
        });
      }
      if (Math.abs(dragRect.right - nodeRect.right) < threshold) {
        lines.push({
          type: 'vertical',
          position: nodeRect.right,
          start: Math.min(dragRect.top, nodeRect.top),
          end: Math.max(dragRect.bottom, nodeRect.bottom),
        });
      }
      if (Math.abs(dragRect.centerX - nodeRect.centerX) < threshold) {
        lines.push({
          type: 'vertical',
          position: nodeRect.centerX,
          start: Math.min(dragRect.top, nodeRect.top),
          end: Math.max(dragRect.bottom, nodeRect.bottom),
        });
      }

      // 检测水平对齐（顶、底、中心）
      if (Math.abs(dragRect.top - nodeRect.top) < threshold) {
        lines.push({
          type: 'horizontal',
          position: nodeRect.top,
          start: Math.min(dragRect.left, nodeRect.left),
          end: Math.max(dragRect.right, nodeRect.right),
        });
      }
      if (Math.abs(dragRect.bottom - nodeRect.bottom) < threshold) {
        lines.push({
          type: 'horizontal',
          position: nodeRect.bottom,
          start: Math.min(dragRect.left, nodeRect.left),
          end: Math.max(dragRect.right, nodeRect.right),
        });
      }
      if (Math.abs(dragRect.centerY - nodeRect.centerY) < threshold) {
        lines.push({
          type: 'horizontal',
          position: nodeRect.centerY,
          start: Math.min(dragRect.left, nodeRect.left),
          end: Math.max(dragRect.right, nodeRect.right),
        });
      }
    });

    return lines;
  }, []);

  /**
   * 🆕 吸附到辅助线
   * 自动调整节点位置以对齐到其他节点
   */
  const snapToHelperLines = useCallback((
    x: number,
    y: number,
    width: number,
    height: number,
    allNodes: Map<string, AppNode>,
    draggingNodeId: string,
    threshold: number = 5
  ): { x: number; y: number } => {
    let snappedX = x;
    let snappedY = y;

    const dragRect = {
      left: x,
      right: x + width,
      centerX: x + width / 2,
      top: y,
      bottom: y + height,
      centerY: y + height / 2,
    };

    allNodes.forEach((node) => {
      if (node.id === draggingNodeId) return;

      const nodeRect = {
        left: node.x,
        right: node.x + (node.width || 420),
        centerX: node.x + (node.width || 420) / 2,
        top: node.y,
        bottom: node.y + (node.height || 360),
        centerY: node.y + (node.height || 360) / 2,
      };

      // 吸附到垂直线
      if (Math.abs(dragRect.left - nodeRect.left) < threshold) {
        snappedX = nodeRect.left;
      } else if (Math.abs(dragRect.right - nodeRect.right) < threshold) {
        snappedX = nodeRect.right - width;
      } else if (Math.abs(dragRect.centerX - nodeRect.centerX) < threshold) {
        snappedX = nodeRect.centerX - width / 2;
      }

      // 吸附到水平线
      if (Math.abs(dragRect.top - nodeRect.top) < threshold) {
        snappedY = nodeRect.top;
      } else if (Math.abs(dragRect.bottom - nodeRect.bottom) < threshold) {
        snappedY = nodeRect.bottom - height;
      } else if (Math.abs(dragRect.centerY - nodeRect.centerY) < threshold) {
        snappedY = nodeRect.centerY - height / 2;
      }
    });

    return { x: snappedX, y: snappedY };
  }, []);

  /**
   * 注册全局事件监听器
   * 🔥 方案 C：Transform + CSS 变量（性能最优 + 连线跟随）
   * 🆕 集成辅助线检测和吸附
   */
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragRef.current || !nodes) return;

      // 取消上一帧
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      // 下一帧执行
      rafRef.current = requestAnimationFrame(() => {
        if (!dragRef.current || !nodes) return;

        const { element, mouseStartX, mouseStartY, id, startX, startY, nodeWidth, nodeHeight } = dragRef.current;
        
        // 🔥 关键：必须除以 scale！
        const dx = (e.clientX - mouseStartX) / scale;
        const dy = (e.clientY - mouseStartY) / scale;

        // 计算新位置
        let newX = startX + dx;
        let newY = startY + dy;

        // 🆕 吸附到辅助线
        const snapped = snapToHelperLines(
          newX,
          newY,
          nodeWidth,
          nodeHeight,
          nodes,
          id,
          5
        );
        newX = snapped.x;
        newY = snapped.y;

        // 计算实际的 transform 偏移（相对于起始位置）
        const transformDx = newX - startX;
        const transformDy = newY - startY;

        // 🔥 方案 C：同时设置 transform 和 CSS 变量
        if (element) {
          // 1. 设置 transform（节点移动，不触发 React 渲染）
          element.style.transform = `translate(${transformDx}px, ${transformDy}px)`;
          
          // 2. 设置 CSS 变量（连线可以读取这个偏移量）
          element.style.setProperty('--drag-offset-x', `${transformDx}`);
          element.style.setProperty('--drag-offset-y', `${transformDy}`);
        }

        // 🔥 方案 1：辅助线检测节流（每 3 帧检测一次，降低到 20 FPS）
        if (helperLinesRafRef.current) {
          cancelAnimationFrame(helperLinesRafRef.current);
        }
        
        helperLinesRafRef.current = requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              // 检测辅助线（降低频率，避免每帧都触发 React 重渲染）
              const currentNode = nodes.get(id);
              if (currentNode) {
                const lines = detectHelperLines(
                  { ...currentNode, x: newX, y: newY },
                  nodes,
                  5
                );
                setHelperLines(lines);
              }
            });
          });
        });
      });
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (!dragRef.current) return;

      const {
        id,
        startX,
        startY,
        mouseStartX,
        mouseStartY,
        element,
        nodeWidth,
        nodeHeight,
      } = dragRef.current;

      // 计算最终位置
      const dx = (e.clientX - mouseStartX) / scale;
      const dy = (e.clientY - mouseStartY) / scale;
      let finalX = startX + dx;
      let finalY = startY + dy;

      // 🆕 最终位置也要吸附
      if (nodes) {
        const snapped = snapToHelperLines(
          finalX,
          finalY,
          nodeWidth,
          nodeHeight,
          nodes,
          id,
          5
        );
        finalX = snapped.x;
        finalY = snapped.y;
      }

      // 🔥 关键修复：禁用 transition，避免闪动
      if (element) {
        const originalTransition = element.style.transition;
        element.style.transition = 'none';
        
        // 清除 transform 和 CSS 变量
        element.style.transform = '';
        element.style.removeProperty('--drag-offset-x');
        element.style.removeProperty('--drag-offset-y');
        element.style.willChange = '';
        
        // 强制浏览器重绘
        element.offsetHeight;
        
        // 恢复 transition（在下一帧）
        requestAnimationFrame(() => {
          if (element) {
            element.style.transition = originalTransition;
          }
        });
      }

      // 更新 Store
      onUpdateNode(id, { x: finalX, y: finalY });

      // 🆕 清除辅助线
      setHelperLines([]);

      // 清理上下文
      dragRef.current = null;
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      if (helperLinesRafRef.current) {
        cancelAnimationFrame(helperLinesRafRef.current);
        helperLinesRafRef.current = null;
      }
      
      // 清除拖拽状态
      setIsDragging(false);
    };

    // 注册事件监听器
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    
    // 清理函数
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, scale, onUpdateNode, nodes, snapToHelperLines, detectHelperLines]);

  /**
   * 开始拖拽
   */
  const handleMouseDown = useCallback((
    e: React.MouseEvent,
    nodeId: string,
    node: AppNode,
    parentGroupId?: string | null,
    siblingNodeIds: string[] = []
  ) => {
    e.stopPropagation();

    // 保存历史记录
    onSaveHistory();

    // 直接使用 e.currentTarget 作为元素（这就是节点的根 div）
    const element = e.currentTarget as HTMLElement;
    
    if (!element) {
      console.error('❌ [useDrag] 找不到节点元素:', nodeId);
      return;
    }

    // 初始化拖拽上下文
    dragRef.current = {
      id: nodeId,
      startX: node.x,
      startY: node.y,
      mouseStartX: e.clientX,
      mouseStartY: e.clientY,
      parentGroupId,
      siblingNodeIds,
      nodeWidth: node.width || 420,
      nodeHeight: node.height || 300,
      element,
    };

    // 🔥 性能优化：启用 GPU 加速 + 禁用过渡效果
    element.style.willChange = 'transform';
    element.style.transition = 'none';
    
    // 设置拖拽状态（这会触发 useEffect 注册事件监听器）
    setIsDragging(true);
  }, [onSaveHistory]);

  /**
   * 取消拖拽
   */
  const cancelDrag = useCallback(() => {
    if (!dragRef.current) return;

    const { element } = dragRef.current;

    // 清理 DOM
    if (element) {
      element.style.transform = '';
      element.style.removeProperty('--drag-offset-x');
      element.style.removeProperty('--drag-offset-y');
      element.style.willChange = '';
      element.style.transition = '';
    }

    // 🆕 清除辅助线
    setHelperLines([]);

    // 清理上下文
    dragRef.current = null;
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    
    // 清除拖拽状态
    setIsDragging(false);
  }, []);

  return {
    handleMouseDown,
    cancelDrag,
    isDragging, // 🔥 方案 3：暴露 isDragging 状态给 Node.tsx 使用
    helperLines, // 🆕 返回辅助线数据
  };
};
