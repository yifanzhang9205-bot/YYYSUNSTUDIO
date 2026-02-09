/**
 * useGroup Hook - 分组逻辑
 * 
 * 职责：
 * - 处理分组创建（框选）
 * - 处理分组拖动（包含子节点）
 * - 处理分组删除
 * - 处理一键整理（拓扑排序、网格布局）
 * - 管理分组状态
 * 
 * 架构重构 - 阶段 A：
 * - 使用 groupStore 管理分组数据
 * - 使用 selectionStore 管理选择状态
 * - 不再使用内部 useState
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { AppNode, Group, Connection } from '../types';

interface UseGroupOptions {
  groups: Group[];
  nodes: Map<string, AppNode>;
  connections: Connection[];
  scale: number;
  onAddGroup: (group: Group) => void;
  onUpdateGroup: (id: string, updates: Partial<Group>) => void;
  onDeleteGroup: (id: string) => void;
  onUpdateNode: (id: string, updates: Partial<AppNode>) => void;
  onSaveHistory: () => void;
  getApproxNodeHeight: (node: AppNode) => number;
}

interface DragGroupContext {
  id: string;
  startX: number;
  startY: number;
  mouseStartX: number;
  mouseStartY: number;
  childNodes: Array<{ id: string; startX: number; startY: number; element: HTMLElement | null }>;
}

export const useGroup = ({
  groups,
  nodes,
  connections,
  scale,
  onAddGroup,
  onUpdateGroup,
  onDeleteGroup,
  onUpdateNode,
  onSaveHistory,
  getApproxNodeHeight,
}: UseGroupOptions) => {
  
  // === 状态管理 ===
  const [resizingGroupId, setResizingGroupId] = useState<string | null>(null);
  const [isDraggingGroup, setIsDraggingGroup] = useState<boolean>(false);
  const dragGroupRef = useRef<DragGroupContext | null>(null);
  
  // === Ref 存储（避免 useEffect 重复注册）===
  const scaleRef = useRef(scale);
  
  // 更新 scaleRef
  useEffect(() => {
    scaleRef.current = scale;
  }, [scale]);

  // === 辅助函数 ===
  
  /**
   * 获取节点所在的分组
   */
  const getNodeGroup = useCallback((nodeId: string): Group | undefined => {
    const node = nodes.get(nodeId);
    if (!node) return undefined;

    const nodeWidth = node.width || 420;
    const nodeHeight = getApproxNodeHeight(node);
    const cx = node.x + nodeWidth / 2;
    const cy = node.y + nodeHeight / 2;

    return groups.find(g => 
      cx > g.x && cx < g.x + g.width && 
      cy > g.y && cy < g.y + g.height
    );
  }, [groups, nodes, getApproxNodeHeight]);

  /**
   * 获取组内的所有节点
   */
  const getGroupNodes = useCallback((groupId: string): AppNode[] => {
    const group = groups.find(g => g.id === groupId);
    if (!group) return [];

    return Array.from(nodes.values()).filter(n => {
      const nodeWidth = n.width || 420;
      const nodeHeight = getApproxNodeHeight(n);
      const cx = n.x + nodeWidth / 2;
      const cy = n.y + nodeHeight / 2;
      return cx > group.x && cx < group.x + group.width && 
             cy > group.y && cy < group.y + group.height;
    });
  }, [groups, nodes, getApproxNodeHeight]);

  // === 分组拖动 ===
  
  /**
   * 开始拖动分组
   * 
   * 注意：App.tsx 调用时传递 (e, groupId, group)
   */
  const startGroupDrag = useCallback((e: React.MouseEvent, groupId: string, group: Group) => {
    // ❌ 不要 stopPropagation，会阻止选中事件
    // e.stopPropagation();
    
    // 🔥 先初始化拖动上下文（不包含子节点）
    dragGroupRef.current = {
      id: groupId,
      startX: group.x,
      startY: group.y,
      mouseStartX: e.clientX,
      mouseStartY: e.clientY,
      childNodes: [], // 先设置为空数组
    };

    // ✅ 设置拖动状态（先设置状态，让 React 禁用 transition）
    setIsDraggingGroup(true);

    // ❌ 不要在这里操作 transition，让 React 控制
    // const groupElement = document.querySelector(`[data-group-id="${groupId}"]`) as HTMLElement;
    // if (groupElement) {
    //   groupElement.style.transition = 'none';
    //   groupElement.style.willChange = 'transform';
    // }

    // 🔥 关键修复：使用双重 requestAnimationFrame 延迟查询 DOM
    // 确保 React 已经完成渲染，DOM 元素已经挂载
    // 第一帧：React 处理状态更新
    // 第二帧：DOM 已经渲染完成
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!dragGroupRef.current) return; // 如果已经取消拖动，直接返回

        // 查询子节点的 DOM 元素
        const childNodes = getGroupNodes(groupId).map(n => {
          // 方法 1：使用 data-node-id 属性选择器
          let element = document.querySelector(`[data-node-id="${n.id}"]`) as HTMLElement;
          
          // 方法 2：使用 id 选择器（备用方案）
          if (!element) {
            element = document.getElementById(`node-${n.id}`) as HTMLElement;
          }
          
          // 🔥 如果找不到元素，打印警告（调试用）
          if (!element) {
            console.warn(`[useGroup] 找不到节点 DOM 元素: ${n.id}`);
            console.warn(`[useGroup] 当前 DOM 中的所有节点:`, 
              Array.from(document.querySelectorAll('[data-node-id]')).map(el => el.getAttribute('data-node-id'))
            );
          }
          
          return {
            id: n.id,
            startX: n.x,
            startY: n.y,
            element, // 缓存 DOM 元素引用
          };
        });

        // 更新拖动上下文，添加子节点
        if (dragGroupRef.current) {
          dragGroupRef.current.childNodes = childNodes;

          // ❌ 不要操作子节点的 transition，让 React 控制
          // childNodes.forEach(child => {
          //   if (child.element) {
          //     child.element.style.transition = 'none';
          //     child.element.style.willChange = 'transform';
          //   }
          // });
        }
      });
    });
  }, [getGroupNodes]);

  /**
   * 更新分组拖动
   * 
   * 使用 CSS transform 优化性能（GPU 加速，0 次 React 重渲染）
   * 
   * 🔥 关键修复：transform 需要使用世界坐标，因为 Canvas 已经有 scale
   * 
   * @returns {boolean} 是否处理了拖动（true = 正在拖动 Group，false = 没有拖动）
   */
  const updateGroupDrag = useCallback((e: MouseEvent, currentScale: number): boolean => {
    if (!dragGroupRef.current) {
      return false;
    }

    const { id, mouseStartX, mouseStartY, childNodes } = dragGroupRef.current;

    // 计算偏移量（屏幕坐标）
    const screenDx = e.clientX - mouseStartX;
    const screenDy = e.clientY - mouseStartY;

    // 🔥 关键修复：转换为世界坐标，因为 Canvas 已经有 scale
    const worldDx = screenDx / currentScale;
    const worldDy = screenDy / currentScale;

    // 使用 CSS transform 优化性能（直接操作 DOM）
    const groupElement = document.querySelector(`[data-group-id="${id}"]`) as HTMLElement;
    
    if (groupElement) {
      groupElement.style.transform = `translate(${worldDx}px, ${worldDy}px)`;
      groupElement.style.willChange = 'transform';
    }

    // 🔥 关键修复：使用缓存的 DOM 元素引用，不再每次查询
    childNodes.forEach((child: { id: string; startX: number; startY: number; element: HTMLElement | null }) => {
      if (child.element) {
        child.element.style.transform = `translate(${worldDx}px, ${worldDy}px)`;
        child.element.style.willChange = 'transform';
      }
    });
    
    return true; // 返回 true 表示处理了拖动
  }, []);

  /**
   * 结束分组拖动
   * 
   * 计算最终位置并更新 Store
   * 
   * 🔥 关键修复：延迟清除 isDraggingGroup 状态，确保 React 先更新完 left/top
   */
  const endGroupDrag = useCallback((e: MouseEvent, currentScale: number) => {
    if (!dragGroupRef.current) return;

    const { id, startX, startY, mouseStartX, mouseStartY, childNodes } = dragGroupRef.current;

    // 计算最终位置（世界坐标）
    const screenDx = e.clientX - mouseStartX;
    const screenDy = e.clientY - mouseStartY;
    const worldDx = screenDx / currentScale;
    const worldDy = screenDy / currentScale;
    const finalX = startX + worldDx;
    const finalY = startY + worldDy;

    // 保存历史
    onSaveHistory();

    // 🔥 关键修复：先把组和节点的 transform 设置为 0，再更新 state
    // 这样视觉上不会有跳跃
    const groupElement = document.querySelector(`[data-group-id="${id}"]`) as HTMLElement;
    if (groupElement) {
      groupElement.style.transform = 'translate(0, 0)';
    }

    // 🔥 先把所有节点的 transform 设置为 0
    childNodes.forEach((child: { id: string; startX: number; startY: number; element: HTMLElement | null }) => {
      if (child.element) {
        child.element.style.transform = 'translate(0, 0)';
      }
    });

    // 更新分组位置（使用 Store）
    onUpdateGroup(id, { x: finalX, y: finalY });

    // 更新子节点位置（使用 Store）
    childNodes.forEach((child: { id: string; startX: number; startY: number }) => {
      onUpdateNode(child.id, {
        x: child.startX + worldDx,
        y: child.startY + worldDy,
      });
    });

    // 清除拖动上下文
    dragGroupRef.current = null;

    // 🔥 关键修复：延迟清除 isDraggingGroup 状态
    // 确保 React 先更新完 left/top，再恢复 transition
    // 否则节点会从旧位置动画滑动到新位置
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        // 清除拖动状态（恢复 transition）
        setIsDraggingGroup(false);

        // 清除所有 transform 和 willChange
        const groupElement = document.querySelector(`[data-group-id="${id}"]`) as HTMLElement;
        if (groupElement) {
          groupElement.style.transform = '';
          groupElement.style.willChange = 'auto';
        }

        childNodes.forEach((child: { id: string; startX: number; startY: number; element: HTMLElement | null }) => {
          if (child.element) {
            child.element.style.transform = '';
            child.element.style.willChange = 'auto';
          }
        });
      });
    });
  }, [onSaveHistory, onUpdateGroup, onUpdateNode]);

  /**
   * 取消分组拖动
   */
  const cancelGroupDrag = useCallback(() => {
    if (!dragGroupRef.current) return;

    const { id, childNodes } = dragGroupRef.current;

    // 清理 transform
    const groupElement = document.querySelector(`[data-group-id="${id}"]`) as HTMLElement;
    if (groupElement) {
      groupElement.style.transform = '';
      groupElement.style.willChange = 'auto';
    }

    // 🔥 关键修复：使用缓存的 DOM 元素引用
    childNodes.forEach((child: { id: string; startX: number; startY: number; element: HTMLElement | null }) => {
      if (child.element) {
        child.element.style.transform = '';
        child.element.style.willChange = 'auto';
      }
    });

    dragGroupRef.current = null;
    setIsDraggingGroup(false);
  }, []);

  // === 全局事件监听（自动处理拖动）===
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!dragGroupRef.current) return;
      
      // 使用 scaleRef.current 而不是 scale
      updateGroupDrag(e, scaleRef.current);
    };

    const handleGlobalMouseUp = (e: MouseEvent) => {
      if (!dragGroupRef.current) return;
      
      // 使用 scaleRef.current 而不是 scale
      endGroupDrag(e, scaleRef.current);
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [updateGroupDrag, endGroupDrag]); // 不依赖 scale

  // === 对齐功能（6 种）===
  
  /**
   * 左对齐
   */
  const alignLeft = useCallback((groupId: string) => {
    const groupNodes = getGroupNodes(groupId);
    if (groupNodes.length < 2) return;

    onSaveHistory();

    // 找到最左边的节点
    const minX = Math.min(...groupNodes.map(n => n.x));

    // 将所有节点对齐到最左边
    groupNodes.forEach(node => {
      onUpdateNode(node.id, { x: minX });
    });
  }, [getGroupNodes, onSaveHistory, onUpdateNode]);

  /**
   * 水平居中对齐
   */
  const alignCenterH = useCallback((groupId: string) => {
    const groupNodes = getGroupNodes(groupId);
    if (groupNodes.length < 2) return;

    onSaveHistory();

    // 计算所有节点的水平中心点的平均值
    const avgCenterX = groupNodes.reduce((sum, n) => {
      const nodeWidth = n.width || 420;
      return sum + (n.x + nodeWidth / 2);
    }, 0) / groupNodes.length;

    // 将所有节点的中心对齐到平均中心
    groupNodes.forEach(node => {
      const nodeWidth = node.width || 420;
      onUpdateNode(node.id, { x: avgCenterX - nodeWidth / 2 });
    });
  }, [getGroupNodes, onSaveHistory, onUpdateNode]);

  /**
   * 右对齐
   */
  const alignRight = useCallback((groupId: string) => {
    const groupNodes = getGroupNodes(groupId);
    if (groupNodes.length < 2) return;

    onSaveHistory();

    // 找到最右边的节点
    const maxRight = Math.max(...groupNodes.map(n => n.x + (n.width || 420)));

    // 将所有节点对齐到最右边
    groupNodes.forEach(node => {
      const nodeWidth = node.width || 420;
      onUpdateNode(node.id, { x: maxRight - nodeWidth });
    });
  }, [getGroupNodes, onSaveHistory, onUpdateNode]);

  /**
   * 顶部对齐
   */
  const alignTop = useCallback((groupId: string) => {
    const groupNodes = getGroupNodes(groupId);
    if (groupNodes.length < 2) return;

    onSaveHistory();

    // 找到最上边的节点
    const minY = Math.min(...groupNodes.map(n => n.y));

    // 将所有节点对齐到最上边
    groupNodes.forEach(node => {
      onUpdateNode(node.id, { y: minY });
    });
  }, [getGroupNodes, onSaveHistory, onUpdateNode]);

  /**
   * 垂直居中对齐
   */
  const alignCenterV = useCallback((groupId: string) => {
    const groupNodes = getGroupNodes(groupId);
    if (groupNodes.length < 2) return;

    onSaveHistory();

    // 计算所有节点的垂直中心点的平均值
    const avgCenterY = groupNodes.reduce((sum, n) => {
      const nodeHeight = getApproxNodeHeight(n);
      return sum + (n.y + nodeHeight / 2);
    }, 0) / groupNodes.length;

    // 将所有节点的中心对齐到平均中心
    groupNodes.forEach(node => {
      const nodeHeight = getApproxNodeHeight(node);
      onUpdateNode(node.id, { y: avgCenterY - nodeHeight / 2 });
    });
  }, [getGroupNodes, getApproxNodeHeight, onSaveHistory, onUpdateNode]);

  /**
   * 底部对齐
   */
  const alignBottom = useCallback((groupId: string) => {
    const groupNodes = getGroupNodes(groupId);
    if (groupNodes.length < 2) return;

    onSaveHistory();

    // 找到最下边的节点
    const maxBottom = Math.max(...groupNodes.map(n => n.y + getApproxNodeHeight(n)));

    // 将所有节点对齐到最下边
    groupNodes.forEach(node => {
      const nodeHeight = getApproxNodeHeight(node);
      onUpdateNode(node.id, { y: maxBottom - nodeHeight });
    });
  }, [getGroupNodes, getApproxNodeHeight, onSaveHistory, onUpdateNode]);

  // === 分布功能（2 种）===
  
  /**
   * 水平间距分布
   */
  const distributeH = useCallback((groupId: string) => {
    const groupNodes = getGroupNodes(groupId);
    if (groupNodes.length < 3) return; // 至少需要 3 个节点

    onSaveHistory();

    // 按 x 坐标排序
    const sortedNodes = [...groupNodes].sort((a, b) => a.x - b.x);

    // 计算总间距
    const firstNode = sortedNodes[0];
    const lastNode = sortedNodes[sortedNodes.length - 1];
    const firstRight = firstNode.x + (firstNode.width || 420);
    const lastLeft = lastNode.x;
    const totalGap = lastLeft - firstRight;

    // 计算中间节点的总宽度
    const middleNodesWidth = sortedNodes
      .slice(1, -1)
      .reduce((sum, n) => sum + (n.width || 420), 0);

    // 计算平均间距
    const avgGap = (totalGap - middleNodesWidth) / (sortedNodes.length - 1);

    // 重新分布节点
    let currentX = firstRight + avgGap;
    for (let i = 1; i < sortedNodes.length - 1; i++) {
      const node = sortedNodes[i];
      onUpdateNode(node.id, { x: currentX });
      currentX += (node.width || 420) + avgGap;
    }
  }, [getGroupNodes, onSaveHistory, onUpdateNode]);

  /**
   * 垂直间距分布
   */
  const distributeV = useCallback((groupId: string) => {
    const groupNodes = getGroupNodes(groupId);
    if (groupNodes.length < 3) return; // 至少需要 3 个节点

    onSaveHistory();

    // 按 y 坐标排序
    const sortedNodes = [...groupNodes].sort((a, b) => a.y - b.y);

    // 计算总间距
    const firstNode = sortedNodes[0];
    const lastNode = sortedNodes[sortedNodes.length - 1];
    const firstBottom = firstNode.y + getApproxNodeHeight(firstNode);
    const lastTop = lastNode.y;
    const totalGap = lastTop - firstBottom;

    // 计算中间节点的总高度
    const middleNodesHeight = sortedNodes
      .slice(1, -1)
      .reduce((sum, n) => sum + getApproxNodeHeight(n), 0);

    // 计算平均间距
    const avgGap = (totalGap - middleNodesHeight) / (sortedNodes.length - 1);

    // 重新分布节点
    let currentY = firstBottom + avgGap;
    for (let i = 1; i < sortedNodes.length - 1; i++) {
      const node = sortedNodes[i];
      onUpdateNode(node.id, { y: currentY });
      currentY += getApproxNodeHeight(node) + avgGap;
    }
  }, [getGroupNodes, getApproxNodeHeight, onSaveHistory, onUpdateNode]);

  // === 拓扑排序（Kahn 算法）===
  
  /**
   * 拓扑排序布局
   */
  const arrangeTopology = useCallback((groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    if (!group) return;

    const groupNodes = getGroupNodes(groupId);
    if (groupNodes.length === 0) return;

    onSaveHistory();

    // 构建邻接表和入度表
    const nodeIds = new Set(groupNodes.map(n => n.id));
    const groupConnections = connections.filter(c => nodeIds.has(c.from) && nodeIds.has(c.to));

    const adjacency = new Map<string, string[]>();
    const inDegree = new Map<string, number>();

    groupNodes.forEach(n => {
      adjacency.set(n.id, []);
      inDegree.set(n.id, 0);
    });

    groupConnections.forEach(conn => {
      adjacency.get(conn.from)?.push(conn.to);
      inDegree.set(conn.to, (inDegree.get(conn.to) || 0) + 1);
    });

    // Kahn 算法拓扑排序
    const layers: string[][] = [];
    const queue: string[] = [];
    const processed = new Set<string>();

    // 找到所有入度为 0 的节点
    groupNodes.forEach(n => {
      if (inDegree.get(n.id) === 0) {
        queue.push(n.id);
      }
    });

    // 按层级处理节点
    while ( queue.length > 0) {
      const currentLayer: string[] = [...queue];
      layers.push(currentLayer);
      queue.length = 0;

      currentLayer.forEach(nodeId => {
        processed.add(nodeId);

        const outputs = adjacency.get(nodeId) || [];
        outputs.forEach(outputId => {
          const degree = inDegree.get(outputId) || 0;
          inDegree.set(outputId, degree - 1);

          if (degree - 1 === 0 && !processed.has(outputId)) {
            queue.push(outputId);
          }
        });
      });
    }

    // 处理未被处理的节点（孤立节点或循环依赖）
    const unprocessed = groupNodes.filter(n => !processed.has(n.id));
    if (unprocessed.length > 0) {
      layers.push(unprocessed.map(n => n.id));
    }

    // 布局参数
    const horizontalGap = 80;
    const verticalGap = 100;
    const padding = 40;

    // 🔥 关键修复：记录每个节点的实际位置和大小
    const nodePositions = new Map<string, { x: number; y: number; width: number; height: number }>();

    // 计算每层的位置
    let currentY = group.y + padding;

    layers.forEach(layer => {
      // ✅ 修复：计算这一层的实际宽度（累加每个节点的实际宽度）
      let layerWidth = 0;
      layer.forEach(nodeId => {
        const node = nodes.get(nodeId);
        if (node) {
          layerWidth += (node.width || 420);
        }
      });
      layerWidth += (layer.length - 1) * horizontalGap;

      // ✅ 修复：基于实际宽度居中对齐
      let currentX = group.x + padding + (group.width - padding * 2 - layerWidth) / 2;

      // 🔥 计算这一层的最大高度
      let maxLayerHeight = 0;
      layer.forEach(nodeId => {
        const node = nodes.get(nodeId);
        if (node) {
          const nodeHeight = getApproxNodeHeight(node);
          maxLayerHeight = Math.max(maxLayerHeight, nodeHeight);
        }
      });

      layer.forEach(nodeId => {
        const node = nodes.get(nodeId);
        if (node) {
          const nodeHeight = getApproxNodeHeight(node);
          const nodeWidth = node.width || 420; // ✅ 使用实际宽度
          
          onUpdateNode(nodeId, {
            x: currentX,
            y: currentY,
          });

          // ✅ 修复：记录实际宽度和高度
          nodePositions.set(nodeId, {
            x: currentX,
            y: currentY,
            width: nodeWidth,
            height: nodeHeight
          });

          // ✅ 修复：使用实际宽度移动
          currentX += nodeWidth + horizontalGap;
        }
      });

      // 🔥 使用这一层的最大高度
      currentY += maxLayerHeight + verticalGap;
    });

    // 🔥 关键修复：根据实际节点位置计算组的边界
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    nodePositions.forEach(pos => {
      minX = Math.min(minX, pos.x);
      minY = Math.min(minY, pos.y);
      maxX = Math.max(maxX, pos.x + pos.width);
      maxY = Math.max(maxY, pos.y + pos.height);
    });

    // 更新分组大小和位置
    onUpdateGroup(groupId, {
      x: minX - padding,
      y: minY - padding,
      width: (maxX - minX) + padding * 2,
      height: (maxY - minY) + padding * 2,
    });
  }, [groups, getGroupNodes, connections, onSaveHistory, onUpdateNode, onUpdateGroup, nodes, getApproxNodeHeight]);

  /**
   * 宫格排列（每排4个）
   * 性能优化：使用 Map 查询，避免重复计算
   */
  const arrangeGrid = useCallback((groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    if (!group) return;

    const groupNodes = getGroupNodes(groupId);
    if (groupNodes.length === 0) return;

    onSaveHistory();

    // 🔥 性能优化：构建邻接表和入度表（使用 Map）
    const nodeIds = new Set(groupNodes.map(n => n.id));
    const groupConnections = connections.filter(c => nodeIds.has(c.from) && nodeIds.has(c.to));

    const adjacency = new Map<string, string[]>();
    const inDegree = new Map<string, number>();

    groupNodes.forEach(n => {
      adjacency.set(n.id, []);
      inDegree.set(n.id, 0);
    });

    groupConnections.forEach(conn => {
      adjacency.get(conn.from)?.push(conn.to);
      inDegree.set(conn.to, (inDegree.get(conn.to) || 0) + 1);
    });

    // Kahn 算法拓扑排序
    const layers: string[][] = [];
    const queue: string[] = [];
    const processed = new Set<string>();

    // 找到所有入度为 0 的节点
    groupNodes.forEach(n => {
      if (inDegree.get(n.id) === 0) {
        queue.push(n.id);
      }
    });

    // 按层级处理节点
    while (queue.length > 0) {
      const currentLayer: string[] = [...queue];
      layers.push(currentLayer);
      queue.length = 0;

      currentLayer.forEach(nodeId => {
        processed.add(nodeId);

        const outputs = adjacency.get(nodeId) || [];
        outputs.forEach(outputId => {
          const degree = inDegree.get(outputId) || 0;
          inDegree.set(outputId, degree - 1);

          if (degree - 1 === 0 && !processed.has(outputId)) {
            queue.push(outputId);
          }
        });
      });
    }

    // 处理未被处理的节点（孤立节点）
    const unprocessed = groupNodes.filter(n => !processed.has(n.id));
    if (unprocessed.length > 0) {
      layers.push(unprocessed.map(n => n.id));
    }

    // 🔥 关键：展平所有节点，按每排4个重新分组
    const NODES_PER_ROW = 4;
    const allNodeIds = layers.flat();
    const gridRows: string[][] = [];

    for (let i = 0; i < allNodeIds.length; i += NODES_PER_ROW) {
      gridRows.push(allNodeIds.slice(i, i + NODES_PER_ROW));
    }

    // 布局参数
    const horizontalGap = 80;
    const verticalGap = 100;
    const padding = 40;

    // 🔥 性能优化：记录每个节点的实际位置和大小
    const nodePositions = new Map<string, { x: number; y: number; width: number; height: number }>();

    // 计算每行的位置
    let currentY = group.y + padding;

    gridRows.forEach(row => {
      // ✅ 计算这一行的实际宽度
      let rowWidth = 0;
      row.forEach(nodeId => {
        const node = nodes.get(nodeId);
        if (node) {
          rowWidth += (node.width || 420);
        }
      });
      rowWidth += (row.length - 1) * horizontalGap;

      // ✅ 基于实际宽度居中对齐
      let currentX = group.x + padding + (group.width - padding * 2 - rowWidth) / 2;

      // 🔥 计算这一行的最大高度
      let maxRowHeight = 0;
      row.forEach(nodeId => {
        const node = nodes.get(nodeId);
        if (node) {
          const nodeHeight = getApproxNodeHeight(node);
          maxRowHeight = Math.max(maxRowHeight, nodeHeight);
        }
      });

      // 更新节点位置
      row.forEach(nodeId => {
        const node = nodes.get(nodeId);
        if (node) {
          const nodeHeight = getApproxNodeHeight(node);
          const nodeWidth = node.width || 420;

          onUpdateNode(nodeId, {
            x: currentX,
            y: currentY,
          });

          // 记录实际位置和大小
          nodePositions.set(nodeId, {
            x: currentX,
            y: currentY,
            width: nodeWidth,
            height: nodeHeight
          });

          currentX += nodeWidth + horizontalGap;
        }
      });

      currentY += maxRowHeight + verticalGap;
    });

    // 🔥 根据实际节点位置计算组的边界
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    nodePositions.forEach(pos => {
      minX = Math.min(minX, pos.x);
      minY = Math.min(minY, pos.y);
      maxX = Math.max(maxX, pos.x + pos.width);
      maxY = Math.max(maxY, pos.y + pos.height);
    });

    // 更新分组大小和位置
    onUpdateGroup(groupId, {
      x: minX - padding,
      y: minY - padding,
      width: (maxX - minX) + padding * 2,
      height: (maxY - minY) + padding * 2,
    });
  }, [groups, getGroupNodes, connections, onSaveHistory, onUpdateNode, onUpdateGroup, nodes, getApproxNodeHeight]);

  /**
   * 竖排排列（从上到下一列）
   * 性能优化：一次遍历计算最大宽度
   */
  const arrangeVertical = useCallback((groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    if (!group) return;

    const groupNodes = getGroupNodes(groupId);
    if (groupNodes.length === 0) return;

    onSaveHistory();

    // 布局参数
    const verticalGap = 80;
    const padding = 40;

    // 🔥 性能优化：一次遍历计算最大宽度
    let maxWidth = 0;
    groupNodes.forEach(node => {
      const nodeWidth = node.width || 420;
      maxWidth = Math.max(maxWidth, nodeWidth);
    });

    // 居中对齐的起始 X 坐标
    const startX = group.x + padding + (group.width - padding * 2 - maxWidth) / 2;

    // 🔥 性能优化：记录每个节点的实际位置和大小
    const nodePositions = new Map<string, { x: number; y: number; width: number; height: number }>();

    // 从上到下排列
    let currentY = group.y + padding;

    groupNodes.forEach(node => {
      const nodeWidth = node.width || 420;
      const nodeHeight = getApproxNodeHeight(node);

      // 居中对齐
      const nodeX = startX + (maxWidth - nodeWidth) / 2;

      onUpdateNode(node.id, {
        x: nodeX,
        y: currentY,
      });

      // 记录实际位置和大小
      nodePositions.set(node.id, {
        x: nodeX,
        y: currentY,
        width: nodeWidth,
        height: nodeHeight
      });

      currentY += nodeHeight + verticalGap;
    });

    // 🔥 根据实际节点位置计算组的边界
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    nodePositions.forEach(pos => {
      minX = Math.min(minX, pos.x);
      minY = Math.min(minY, pos.y);
      maxX = Math.max(maxX, pos.x + pos.width);
      maxY = Math.max(maxY, pos.y + pos.height);
    });

    // 更新分组大小和位置
    onUpdateGroup(groupId, {
      x: minX - padding,
      y: minY - padding,
      width: (maxX - minX) + padding * 2,
      height: (maxY - minY) + padding * 2,
    });
  }, [groups, getGroupNodes, onSaveHistory, onUpdateNode, onUpdateGroup, nodes, getApproxNodeHeight]);

  // === 批量缩放功能 ===
  
  /**
   * 批量缩放节点（以组中心为基准）
   */
  const scaleNodes = useCallback((groupId: string, scaleFactor: number) => {
    const group = groups.find(g => g.id === groupId);
    if (!group) return;

    const groupNodes = getGroupNodes(groupId);
    if (groupNodes.length === 0) return;

    onSaveHistory();

    // 计算组的中心点
    const groupCenterX = group.x + group.width / 2;
    const groupCenterY = group.y + group.height / 2;

    // 缩放每个节点
    groupNodes.forEach(node => {
      const nodeWidth = node.width || 420;
      const nodeHeight = getApproxNodeHeight(node);
      
      // 节点中心点
      const nodeCenterX = node.x + nodeWidth / 2;
      const nodeCenterY = node.y + nodeHeight / 2;

      // 计算相对于组中心的偏移
      const offsetX = nodeCenterX - groupCenterX;
      const offsetY = nodeCenterY - groupCenterY;

      // 缩放后的偏移
      const newOffsetX = offsetX * scaleFactor;
      const newOffsetY = offsetY * scaleFactor;

      // 新的节点中心点
      const newNodeCenterX = groupCenterX + newOffsetX;
      const newNodeCenterY = groupCenterY + newOffsetY;

      // 新的节点位置（左上角）
      const newX = newNodeCenterX - nodeWidth / 2;
      const newY = newNodeCenterY - nodeHeight / 2;

      onUpdateNode(node.id, { x: newX, y: newY });
    });
  }, [groups, getGroupNodes, getApproxNodeHeight, onSaveHistory, onUpdateNode]);

  // === 动态扩展组 ===
  
  /**
   * 扩展或创建组
   * 
   * 逻辑：
   * 1. 检测选中的节点是否有部分已在某个组内
   * 2. 如果是，扩展该组的边界包含所有选中节点
   * 3. 如果不是，创建新组
   */
  const expandOrCreateGroup = useCallback((selectedNodeIds: string[]) => {
    console.log('[useGroup] expandOrCreateGroup 被调用', {
      selectedNodeIds,
      nodesCount: selectedNodeIds.length,
      groupsCount: groups.length
    });
    
    if (selectedNodeIds.length === 0) return;

    const selectedNodes = selectedNodeIds
      .map(id => nodes.get(id))
      .filter((n): n is AppNode => n !== undefined);

    if (selectedNodes.length === 0) return;

    // 检测选中的节点是否有部分已在某个组内
    const nodesInGroups = new Map<string, AppNode[]>(); // groupId -> nodes

    selectedNodes.forEach(node => {
      const nodeWidth = node.width || 420;
      const nodeHeight = getApproxNodeHeight(node);
      const cx = node.x + nodeWidth / 2;
      const cy = node.y + nodeHeight / 2;

      // 查找节点所在的组
      const group = groups.find(g => 
        cx > g.x && cx < g.x + g.width && 
        cy > g.y && cy < g.y + g.height
      );

      if (group) {
        if (!nodesInGroups.has(group.id)) {
          nodesInGroups.set(group.id, []);
        }
        nodesInGroups.get(group.id)!.push(node);
      }
    });

    console.log('[useGroup] 节点在组内的情况', {
      nodesInGroupsCount: nodesInGroups.size,
      groupIds: Array.from(nodesInGroups.keys())
    });

    // 如果有节点已在组内，扩展该组或合并多个组
    if (nodesInGroups.size > 0) {
      console.log('[useGroup] 检测到节点在组内', {
        groupCount: nodesInGroups.size,
        groupIds: Array.from(nodesInGroups.keys())
      });

      // 如果涉及多个组，合并为一个大组
      if (nodesInGroups.size > 1) {
        console.log('[useGroup] 合并多个组');
        
        onSaveHistory();

        // 计算所有选中节点的边界
        const minX = Math.min(...selectedNodes.map(n => n.x));
        const minY = Math.min(...selectedNodes.map(n => n.y));
        const maxX = Math.max(...selectedNodes.map(n => n.x + (n.width || 420)));
        const maxY = Math.max(...selectedNodes.map(n => n.y + getApproxNodeHeight(n)));

        const padding = 32;

        // 创建新的大组
        const newGroup: Group = {
          id: `g-${Date.now()}`,
          title: '合并分组',
          x: minX - padding,
          y: minY - padding,
          width: (maxX - minX) + padding * 2,
          height: (maxY - minY) + padding * 2,
          nodeIds: selectedNodeIds,
        };

        onAddGroup(newGroup);

        // 删除所有旧组
        nodesInGroups.forEach((_, groupId) => {
          onDeleteGroup(groupId);
        });

        console.log('[useGroup] 组合并完成', {
          newGroupId: newGroup.id,
          deletedGroups: Array.from(nodesInGroups.keys())
        });
        
        return; // 合并完成
      }

      // 如果只涉及一个组，扩展该组
      const targetGroupId = Array.from(nodesInGroups.keys())[0];
      const targetGroup = groups.find(g => g.id === targetGroupId);
      
      if (targetGroup) {
        console.log('[useGroup] 扩展现有组', {
          targetGroupId,
          selectedNodesCount: selectedNodes.length
        });
        
        onSaveHistory();

        // 🔥 关键修复：计算组内所有节点的边界（包括原有节点和新选中节点）
        const allNodesInGroup = getGroupNodes(targetGroupId);
        const allNodes = [...new Set([...allNodesInGroup, ...selectedNodes])]; // 去重

        console.log('[useGroup] 计算边界', {
          originalNodesCount: allNodesInGroup.length,
          selectedNodesCount: selectedNodes.length,
          totalNodesCount: allNodes.length
        });

        // 计算所有节点的边界
        const minX = Math.min(...allNodes.map(n => n.x));
        const minY = Math.min(...allNodes.map(n => n.y));
        const maxX = Math.max(...allNodes.map(n => n.x + (n.width || 420)));
        const maxY = Math.max(...allNodes.map(n => n.y + getApproxNodeHeight(n)));

        const padding = 32;

        // 扩展组的边界
        onUpdateGroup(targetGroupId, {
          x: minX - padding,
          y: minY - padding,
          width: (maxX - minX) + padding * 2,
          height: (maxY - minY) + padding * 2,
          nodeIds: allNodes.map(n => n.id), // 更新 nodeIds
        });

        console.log('[useGroup] 组扩展完成', {
          newBounds: {
            x: minX - padding,
            y: minY - padding,
            width: (maxX - minX) + padding * 2,
            height: (maxY - minY) + padding * 2
          }
        });
        
        return; // 扩展完成，不创建新组
      }
    }

    // 如果没有节点在组内，创建新组（临时组）
    console.log('[useGroup] 创建临时组');
    
    onSaveHistory();

    const minX = Math.min(...selectedNodes.map(n => n.x));
    const minY = Math.min(...selectedNodes.map(n => n.y));
    const maxX = Math.max(...selectedNodes.map(n => n.x + (n.width || 420)));
    const maxY = Math.max(...selectedNodes.map(n => n.y + getApproxNodeHeight(n)));

    const padding = 32;

    // 🔥 创建临时组（title = '临时分组'）
    const newGroup: Group = {
      id: `g-${Date.now()}`,
      title: '临时分组', // 🔥 临时组标记
      x: minX - padding,
      y: minY - padding,
      width: (maxX - minX) + padding * 2,
      height: (maxY - minY) + padding * 2,
      nodeIds: selectedNodeIds,
    };

    onAddGroup(newGroup);
    console.log('[useGroup] 临时组创建完成', newGroup.id);
  }, [nodes, groups, getApproxNodeHeight, getGroupNodes, onSaveHistory, onUpdateGroup, onAddGroup, onDeleteGroup]);
  
  /**
   * 创建分组
   */
  const createGroup = useCallback((group: Group) => {
    onSaveHistory();
    onAddGroup(group);
  }, [onSaveHistory, onAddGroup]);

  /**
   * 删除分组（只删除分组，保留节点）
   */
  const deleteGroup = useCallback((groupId: string) => {
    onSaveHistory();
    onDeleteGroup(groupId);
  }, [onSaveHistory, onDeleteGroup]);

  /**
   * 删除分组及其内部的所有节点
   */
  const deleteGroupWithNodes = useCallback((groupId: string, onDeleteNodes: (nodeIds: string[]) => void) => {
    const group = groups.find(g => g.id === groupId);
    if (!group) return;

    onSaveHistory();

    // 获取组内的所有节点
    const groupNodes = getGroupNodes(groupId);
    const nodeIdsToDelete = groupNodes.map(n => n.id);

    // 先删除节点
    if (nodeIdsToDelete.length > 0) {
      onDeleteNodes(nodeIdsToDelete);
    }

    // 再删除分组
    onDeleteGroup(groupId);
  }, [groups, getGroupNodes, onSaveHistory, onDeleteGroup]);

  /**
   * 更新分组标题
   */
  const updateGroupTitle = useCallback((groupId: string, title: string) => {
    onSaveHistory();
    onUpdateGroup(groupId, { title });
  }, [onSaveHistory, onUpdateGroup]);

  // === 自动调整分组大小功能已移除 ===
  // autoResizeGroup 功能已从右键菜单移除（2026-01-28）

  /**
   * 折叠/展开分组（占位，待实现）
   */
  const toggleCollapse = useCallback((_groupId: string) => {
    // TODO: 实现折叠/展开功能
  }, []);

  /**
   * 判断分组是否折叠（占位，待实现）
   */
  const isCollapsed = useCallback((_groupId: string): boolean => {
    // TODO: 实现折叠状态判断
    return false;
  }, []);

  /**
   * 开始调整分组大小（占位，待实现）
   */
  const startGroupResize = useCallback((_groupId: string, _e: React.MouseEvent) => {
    // TODO: 实现调整大小功能
    setResizingGroupId(_groupId);
  }, []);

  /**
   * 结束调整分组大小（占位，待实现）
   */
  const endGroupResize = useCallback(() => {
    // TODO: 实现调整大小功能
    setResizingGroupId(null);
  }, []);

  return {
    // 状态
    resizingGroupId,
    isDraggingGroup,

    // 查询
    getNodeGroup,
    getGroupNodes,

    // 拖动
    startGroupDrag,
    updateGroupDrag,
    endGroupDrag,
    cancelGroupDrag,

    // 对齐功能
    alignLeft,
    alignCenterH,
    alignRight,
    alignTop,
    alignCenterV,
    alignBottom,

    // 分布功能
    distributeH,
    distributeV,

    // 排列功能
    arrangeTopology,
    arrangeGrid, // 🔥 新增：宫格排列（每排4个）
    arrangeVertical, // 🔥 新增：竖排排列（从上到下一列）

    // 批量缩放
    scaleNodes,

    // 其他
    createGroup,
    deleteGroup,
    deleteGroupWithNodes, // 新增：删除分组及其节点
    updateGroupTitle,
    toggleCollapse,
    isCollapsed,
    startGroupResize,
    endGroupResize,
    expandOrCreateGroup, // 新增：动态扩展组或创建新组
  };
};
