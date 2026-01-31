/**
 * useViewport Hook - 缩放/平移逻辑
 * 
 * 职责：
 * - 处理画布缩放（滚轮、快捷键）
 * - 处理画布平移（拖拽、空格+拖拽）
 * - 处理适应视图（Fit View）
 */

import React, { useState, useCallback, useRef } from 'react';
import { AppNode } from '../types';

interface UseViewportOptions {
  nodes: Map<string, AppNode>;
  getNodeHeight: (node: AppNode) => number;
}

export const useViewport = ({ nodes, getNodeHeight }: UseViewportOptions) => {
  const [scale, setScale] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

  // Refs for RAF
  const scaleRef = useRef(scale);
  const panRef = useRef(pan);
  
  // 🔥 新增：使用 ref 存储拖动状态，避免 useCallback 依赖项问题
  const isDraggingCanvasRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  
  // 🔥 新增：RAF 节流，提升拖动丝滑度
  const rafIdRef = useRef<number | null>(null);

  // 同步 ref
  scaleRef.current = scale;
  panRef.current = pan;
  isDraggingCanvasRef.current = isDraggingCanvas;
  lastMousePosRef.current = lastMousePos;

  /**
   * 缩放画布
   */
  const handleZoom = useCallback((delta: number, centerX: number, centerY: number) => {
    setScale(prevScale => {
      const newScale = Math.max(0.1, Math.min(3, prevScale + delta));

      // 计算缩放中心点（世界坐标）
      const worldX = (centerX - panRef.current.x) / prevScale;
      const worldY = (centerY - panRef.current.y) / prevScale;

      // 计算新的平移量（保持缩放中心点不变）
      const newPanX = centerX - worldX * newScale;
      const newPanY = centerY - worldY * newScale;

      setPan({ x: newPanX, y: newPanY });

      return newScale;
    });
  }, []);

  /**
   * 滚轮缩放
   */
  const handleWheel = useCallback((e: WheelEvent) => {
    // 阻止默认滚动行为
    e.preventDefault();
    e.stopPropagation();
    
    if (e.shiftKey) {
      // Shift + 滚轮：平移
      setPan(prev => ({
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY,
      }));
    } else {
      // 普通滚轮：缩放
      const delta = -e.deltaY * 0.001;
      handleZoom(delta, e.clientX, e.clientY);
    }
  }, [handleZoom]);

  /**
   * 开始拖拽画布
   */
  const startCanvasDrag = useCallback((e: React.MouseEvent) => {
    setIsDraggingCanvas(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  }, []);

  /**
   * 拖拽画布中
   */
  const updateCanvasDrag = useCallback((e: MouseEvent) => {
    // 🔥 使用 ref 而不是 state，避免依赖项问题
    if (!isDraggingCanvasRef.current) return;

    // 🔥 取消之前的 RAF
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
    }

    // 🔥 使用 RAF 节流，提升丝滑度（60fps）
    rafIdRef.current = requestAnimationFrame(() => {
      const dx = e.clientX - lastMousePosRef.current.x;
      const dy = e.clientY - lastMousePosRef.current.y;

      setPan(prev => ({
        x: prev.x + dx,
        y: prev.y + dy,
      }));

      setLastMousePos({ x: e.clientX, y: e.clientY });
    });
  }, []); // 🔥 空依赖项，函数永远不会重新创建

  /**
   * 结束拖拽画布
   */
  const endCanvasDrag = useCallback(() => {
    // 🔥 清除 RAF
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    
    setIsDraggingCanvas(false);
  }, []); // 🔥 空依赖项，函数永远不会重新创建

  /**
   * 适应视图（Fit View）
   */
  const fitView = useCallback(() => {
    if (nodes.size === 0) {
      setPan({ x: 0, y: 0 });
      setScale(1);
      return;
    }

    const padding = 100;
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    // 计算所有节点的包围盒
    nodes.forEach(node => {
      const h = node.height || getNodeHeight(node);
      const w = node.width || 420;

      if (node.x < minX) minX = node.x;
      if (node.y < minY) minY = node.y;
      if (node.x + w > maxX) maxX = node.x + w;
      if (node.y + h > maxY) maxY = node.y + h;
    });

    const contentW = maxX - minX;
    const contentH = maxY - minY;

    // 计算缩放比例
    const scaleX = (window.innerWidth - padding * 2) / contentW;
    const scaleY = (window.innerHeight - padding * 2) / contentH;
    let newScale = Math.min(scaleX, scaleY, 1);
    newScale = Math.max(0.2, newScale);

    // 计算平移量（居中）
    const contentCenterX = minX + contentW / 2;
    const contentCenterY = minY + contentH / 2;

    const newPanX = window.innerWidth / 2 - contentCenterX * newScale;
    const newPanY = window.innerHeight / 2 - contentCenterY * newScale;

    setPan({ x: newPanX, y: newPanY });
    setScale(newScale);
  }, [nodes, getNodeHeight]);

  /**
   * 重置视图
   */
  const resetView = useCallback(() => {
    setPan({ x: 0, y: 0 });
    setScale(1);
  }, []);

  /**
   * 放大
   */
  const zoomIn = useCallback(() => {
    handleZoom(0.1, window.innerWidth / 2, window.innerHeight / 2);
  }, [handleZoom]);

  /**
   * 缩小
   */
  const zoomOut = useCallback(() => {
    handleZoom(-0.1, window.innerWidth / 2, window.innerHeight / 2);
  }, [handleZoom]);

  /**
   * 直接设置缩放值（用于滑块）
   */
  const setScaleValue = useCallback((newScale: number) => {
    setScale(Math.max(0.1, Math.min(3, newScale)));
  }, []);

  /**
   * 直接设置平移值（用于小地图）
   */
  const setPanValue = useCallback((newPan: { x: number; y: number }) => {
    setPan(newPan);
  }, []);

  return {
    scale,
    pan,
    isDraggingCanvas,
    handleWheel,
    startCanvasDrag,
    updateCanvasDrag,
    endCanvasDrag,
    fitView,
    resetView,
    zoomIn,
    zoomOut,
    setScale: setScaleValue,
    setPan: setPanValue, // 🔥 新增：暴露 setPan 方法给小地图使用
  };
};
