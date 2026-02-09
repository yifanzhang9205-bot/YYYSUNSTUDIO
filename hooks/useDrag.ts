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
 * - 🔥 辅助线：使用 Direct DOM 操作，不触发 React 渲染（关键优化）
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

/**
 * 🆕 辅助线 Ref 类型定义
 * 用于直接操作 DOM，不触发 React 渲染
 */
export interface HelperLineRefs {
  verticalLines: SVGLineElement[];
  horizontalLines: SVGLineElement[];
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
  // 🔥 新增：多选拖动信息
  selectedNodes?: Array<{
    id: string;
    startX: number;
    startY: number;
    element: HTMLElement | null;
  }>;
}

interface UseDragOptions {
  scale: number;
  onUpdateNode: (id: string, updates: Partial<AppNode>) => void;
  onSaveHistory: () => void;
  nodes?: Map<string, AppNode>; // 🆕 用于辅助线检测
  helperLineRefs?: HelperLineRefs; // 🆕 辅助线 DOM 引用（从 App.tsx 传入）
  selectedNodeIds?: string[]; // 🔥 新增：选中的节点 ID 列表（用于批量移动）
}

export const useDrag = ({ scale, onUpdateNode, onSaveHistory, nodes, helperLineRefs, selectedNodeIds }: UseDragOptions) => {
  const dragRef = useRef<DragContext | null>(null);
  const rafRef = useRef<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  // 🔥 移除 helperLines state，改用 Direct DOM 操作
  // const [helperLines, setHelperLines] = useState<HelperLine[]>([]);

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
   * 🆕 直接操作辅助线 DOM（不触发 React 渲染）
   * 这是性能优化的关键：绕过 React State，直接操作 DOM
   * 
   * ⚠️ 注意：使用 SVG line 元素，需要用 setAttribute 而不是 style
   */
  const updateHelperLinesDom = useCallback((lines: HelperLine[]) => {
    if (!helperLineRefs) return;

    // 分离垂直线和水平线
    const verticalLines = lines.filter(l => l.type === 'vertical');
    const horizontalLines = lines.filter(l => l.type === 'horizontal');

    // 更新垂直线（SVG line 元素）
    helperLineRefs.verticalLines.forEach((lineEl, index) => {
      if (index < verticalLines.length) {
        const line = verticalLines[index];
        lineEl.style.display = 'block';
        lineEl.setAttribute('x1', String(line.position));
        lineEl.setAttribute('y1', String(line.start));
        lineEl.setAttribute('x2', String(line.position));
        lineEl.setAttribute('y2', String(line.end));
      } else {
        lineEl.style.display = 'none';
      }
    });

    // 更新水平线（SVG line 元素）
    helperLineRefs.horizontalLines.forEach((lineEl, index) => {
      if (index < horizontalLines.length) {
        const line = horizontalLines[index];
        lineEl.style.display = 'block';
        lineEl.setAttribute('x1', String(line.start));
        lineEl.setAttribute('y1', String(line.position));
        lineEl.setAttribute('x2', String(line.end));
        lineEl.setAttribute('y2', String(line.position));
      } else {
        lineEl.style.display = 'none';
      }
    });
  }, [helperLineRefs]);

  /**
   * 🆕 隐藏所有辅助线
   */
  const hideHelperLines = useCallback(() => {
    if (!helperLineRefs) return;

    helperLineRefs.verticalLines.forEach(lineEl => {
      lineEl.style.display = 'none';
    });

    helperLineRefs.horizontalLines.forEach(lineEl => {
      lineEl.style.display = 'none';
    });
  }, [helperLineRefs]);

  /**
   * 注册全局事件监听器
   * 🔥 方案 C：Transform + CSS 变量（性能最优 + 连线跟随）
   * 🔥 辅助线：使用 Direct DOM 操作，不触发 React 渲染（关键优化）
   */
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragRef.current || !nodes) return;

      // RAF 节流：避免每次 mousemove 都执行
      if (rafRef.current !== null) {
        return;
      }

      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;

        if (!dragRef.current || !nodes) return;

        const { element, mouseStartX, mouseStartY, id, startX, startY, selectedNodes } = dragRef.current;
        
        // 计算偏移量（必须除以 scale）
        const dx = (e.clientX - mouseStartX) / scale;
        const dy = (e.clientY - mouseStartY) / scale;

        // 计算新位置
        const newX = startX + dx;
        const newY = startY + dy;

        // 计算实际的 transform 偏移（相对于起始位置）
        const transformDx = newX - startX;
        const transformDy = newY - startY;

        // 🔥 关键优化：直接操作主节点 DOM，不触发 React 渲染
        if (element) {
          element.style.transform = `translate(${transformDx}px, ${transformDy}px)`;
          element.style.setProperty('--drag-offset-x', `${transformDx}`);
          element.style.setProperty('--drag-offset-y', `${transformDy}`);
        }

        // 🔥 更新其他选中节点
        if (selectedNodes) {
          selectedNodes.forEach(({ element: el }) => {
            if (el) {
              el.style.transform = `translate(${transformDx}px, ${transformDy}px)`;
              el.style.setProperty('--drag-offset-x', `${transformDx}`);
              el.style.setProperty('--drag-offset-y', `${transformDy}`);
            }
          });
        }

        // 🔥 辅助线检测：每帧都检测（因为是 Direct DOM，开销很小）
        // 不再使用计数器节流，获得最丝滑的体验
        const currentNode = nodes.get(id);
        if (currentNode && helperLineRefs) {
          const lines = detectHelperLines(
            { ...currentNode, x: newX, y: newY },
            nodes,
            5
          );
          // 🔥 直接操作 DOM，不触发 React 渲染
          updateHelperLinesDom(lines);
        }
      });
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (!dragRef.current) return;

      // 清除未完成的 RAF
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }

      const {
        id,
        startX,
        startY,
        mouseStartX,
        mouseStartY,
        element,
        selectedNodes,
      } = dragRef.current;

      // 计算最终位置
      const dx = (e.clientX - mouseStartX) / scale;
      const dy = (e.clientY - mouseStartY) / scale;
      let finalX = startX + dx;
      let finalY = startY + dy;

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

      // 🔥 清除其他选中节点的 transform
      if (selectedNodes) {
        selectedNodes.forEach(({ element: el }) => {
          if (el) {
            const originalTransition = el.style.transition;
            el.style.transition = 'none';
            el.style.transform = '';
            el.style.removeProperty('--drag-offset-x');
            el.style.removeProperty('--drag-offset-y');
            el.style.willChange = '';
            el.offsetHeight;
            requestAnimationFrame(() => {
              if (el) {
                el.style.transition = originalTransition;
              }
            });
          }
        });
      }

      // 更新主节点的 Store
      onUpdateNode(id, { x: finalX, y: finalY });

      // 🔥 更新其他选中节点的 Store
      if (selectedNodes) {
        selectedNodes.forEach(({ id: nodeId, startX: sx, startY: sy }) => {
          const newX = sx + dx;
          const newY = sy + dy;
          onUpdateNode(nodeId, { x: newX, y: newY });
        });
      }

      // 🔥 隐藏辅助线（Direct DOM 操作）
      hideHelperLines();

      // 清理上下文
      dragRef.current = null;
      
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
      
      // 清除未完成的 RAF
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [isDragging, scale, onUpdateNode, nodes, detectHelperLines, updateHelperLinesDom, hideHelperLines, helperLineRefs]);

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

    // 🔥 检查是否是多选拖动
    const isMultiSelect = selectedNodeIds && selectedNodeIds.length > 1 && selectedNodeIds.includes(nodeId);

    let selectedNodesInfo: Array<{ id: string; startX: number; startY: number; element: HTMLElement | null }> = [];

    if (isMultiSelect && nodes) {
      console.log('[useDrag] 多选拖动', { selectedNodeIds, mainNodeId: nodeId });
      
      // 🔥 收集所有选中节点的信息
      selectedNodesInfo = selectedNodeIds
        .filter(id => id !== nodeId) // 排除主拖动节点
        .map(id => {
          const n = nodes.get(id);
          if (!n) return null;
          
          // 查找节点的 DOM 元素
          const el = document.querySelector(`[data-node-id="${id}"]`) as HTMLElement;
          
          return {
            id,
            startX: n.x,
            startY: n.y,
            element: el,
          };
        })
        .filter(Boolean) as Array<{ id: string; startX: number; startY: number; element: HTMLElement | null }>;
      
      console.log('[useDrag] 收集到的跟随节点', { count: selectedNodesInfo.length });
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
      selectedNodes: selectedNodesInfo.length > 0 ? selectedNodesInfo : undefined, // 🔥 保存多选信息
    };

    // 🔥 关键修复：立即设置拖拽状态（学习组拖动的做法）
    // 这样事件监听器会立即注册，用户不会感觉到延迟
    setIsDragging(true);

    // 🔥 只延迟 DOM 操作（GPU 加速优化）
    // 第一帧：React 处理状态更新
    // 第二帧：DOM 已经渲染完成，浏览器完成布局计算
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!dragRef.current) return; // 如果已经取消，直接返回
        
        const { element, selectedNodes } = dragRef.current;
        
        // 🔥 主节点：启用 GPU 加速 + 禁用过渡效果
        if (element) {
          element.style.willChange = 'transform';
          element.style.transition = 'none';
        }
        
        // 🔥 其他选中节点：启用 GPU 加速 + 禁用过渡效果
        if (selectedNodes) {
          selectedNodes.forEach(({ element: el }) => {
            if (el) {
              el.style.willChange = 'transform';
              el.style.transition = 'none';
            }
          });
        }
      });
    });
  }, [onSaveHistory, selectedNodeIds, nodes]);

  /**
   * 取消拖拽
   */
  const cancelDrag = useCallback(() => {
    if (!dragRef.current) return;

    // 清除未完成的 RAF
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    const { element, selectedNodes } = dragRef.current;

    // 清理主节点 DOM
    if (element) {
      element.style.transform = '';
      element.style.removeProperty('--drag-offset-x');
      element.style.removeProperty('--drag-offset-y');
      element.style.willChange = '';
      element.style.transition = '';
    }

    // 🔥 清理其他选中节点 DOM
    if (selectedNodes) {
      selectedNodes.forEach(({ element: el }) => {
        if (el) {
          el.style.transform = '';
          el.style.removeProperty('--drag-offset-x');
          el.style.removeProperty('--drag-offset-y');
          el.style.willChange = '';
          el.style.transition = '';
        }
      });
    }

    // 🔥 隐藏辅助线（Direct DOM 操作）
    hideHelperLines();

    // 清理上下文
    dragRef.current = null;
    
    // 清除拖拽状态
    setIsDragging(false);
  }, [hideHelperLines]);

  return {
    handleMouseDown,
    cancelDrag,
    isDragging, // 🔥 暴露 isDragging 状态给 Node.tsx 使用
    draggingNodeId: dragRef.current?.id || null, // 🔥 暴露拖动节点 ID
  };
};
