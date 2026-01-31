/**
 * useDrag Hook - 拖拽逻辑（Transform + 连线补偿方案）
 * 
 * 职责：
 * - 处理节点拖拽（单选、多选）
 * - 使用 RAF + Transform 优化性能
 * - 通过 CSS 变量传递 transform 偏移，让连线能读取
 * 
 * 性能优化：
 * - 拖拽时：直接操作 DOM（跳过 React 渲染）
 * - 松手时：更新 Store（同步最终位置）
 * - 使用 RAF 节流，避免每次 mousemove 触发渲染
 * - 使用 CSS 变量传递偏移量，连线可以读取
 */

import React, { useRef, useCallback, useState, useEffect } from 'react';
import { AppNode } from '../types';

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
}

export const useDrag = ({ scale, onUpdateNode, onSaveHistory }: UseDragOptions) => {
  const dragRef = useRef<DragContext | null>(null);
  const rafRef = useRef<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  /**
   * 注册全局事件监听器
   * 🔥 方案 C：Transform + CSS 变量（性能最优 + 连线跟随）
   */
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragRef.current) return;

      // 取消上一帧
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      // 下一帧执行
      rafRef.current = requestAnimationFrame(() => {
        if (!dragRef.current) return;

        const { element, mouseStartX, mouseStartY } = dragRef.current;
        
        // 🔥 关键：必须除以 scale！
        const dx = (e.clientX - mouseStartX) / scale;
        const dy = (e.clientY - mouseStartY) / scale;

        // 🔥 方案 C：同时设置 transform 和 CSS 变量
        if (element) {
          // 1. 设置 transform（节点移动，不触发 React 渲染）
          element.style.transform = `translate(${dx}px, ${dy}px)`;
          
          // 2. 设置 CSS 变量（连线可以读取这个偏移量）
          element.style.setProperty('--drag-offset-x', `${dx}`);
          element.style.setProperty('--drag-offset-y', `${dy}`);
        }
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
      } = dragRef.current;

      // 计算最终位置
      const dx = (e.clientX - mouseStartX) / scale;
      const dy = (e.clientY - mouseStartY) / scale;
      const finalX = startX + dx;
      const finalY = startY + dy;

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

      // 清理上下文
      dragRef.current = null;
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
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
  }, [isDragging, scale, onUpdateNode]);

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
    isDragging,
  };
};
