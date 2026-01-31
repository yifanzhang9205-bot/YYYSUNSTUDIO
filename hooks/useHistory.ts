/**
 * useHistory Hook - 撤销/重做逻辑
 * 
 * 职责：
 * - 管理历史记录（撤销/重做）
 * - 保存画布状态快照
 * - 处理快捷键（Ctrl+Z 撤销、Ctrl+Y 重做）
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { AppNode, Connection, Group } from '../types';

interface HistoryState {
  nodes: AppNode[];
  connections: Connection[];
  groups: Group[];
}

interface UseHistoryOptions {
  maxHistorySize?: number;
  onRestore?: (state: HistoryState) => void;
}

export const useHistory = ({ maxHistorySize = 50, onRestore }: UseHistoryOptions = {}) => {
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Refs for closures
  const historyRef = useRef(history);
  const historyIndexRef = useRef(historyIndex);

  // 同步 ref
  useEffect(() => {
    historyRef.current = history;
    historyIndexRef.current = historyIndex;
  }, [history, historyIndex]);

  /**
   * 保存历史记录
   */
  const saveHistory = useCallback((
    nodes: Map<string, AppNode>,
    connections: Connection[],
    groups: Group[]
  ) => {
    try {
      // 将 Map 转换为数组
      const nodesArray = Array.from(nodes.values());

      // 深拷贝当前状态
      const currentState: HistoryState = {
        nodes: JSON.parse(JSON.stringify(nodesArray)),
        connections: JSON.parse(JSON.stringify(connections)),
        groups: JSON.parse(JSON.stringify(groups)),
      };

      // 截断未来的历史记录
      const newHistory = historyRef.current.slice(0, historyIndexRef.current + 1);

      // 添加新的历史记录
      newHistory.push(currentState);

      // 限制历史记录数量
      if (newHistory.length > maxHistorySize) {
        newHistory.shift();
      }

      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    } catch (error) {
      console.warn('[History] 保存历史记录失败:', error);
    }
  }, [maxHistorySize]);

  /**
   * 撤销
   */
  const undo = useCallback(() => {
    const idx = historyIndexRef.current;

    if (idx > 0) {
      const previousState = historyRef.current[idx - 1];
      setHistoryIndex(idx - 1);
      
      // 调用恢复回调
      if (onRestore) {
        onRestore(previousState);
      }
    }
  }, [onRestore]);

  /**
   * 重做
   */
  const redo = useCallback(() => {
    const idx = historyIndexRef.current;

    if (idx < historyRef.current.length - 1) {
      const nextState = historyRef.current[idx + 1];
      setHistoryIndex(idx + 1);
      
      // 调用恢复回调
      if (onRestore) {
        onRestore(nextState);
      }
    }
  }, [onRestore]);

  /**
   * 清空历史记录
   */
  const clearHistory = useCallback(() => {
    setHistory([]);
    setHistoryIndex(-1);
  }, []);

  /**
   * 检查是否可以撤销
   */
  const canUndo = useCallback((): boolean => {
    return historyIndexRef.current > 0;
  }, []);

  /**
   * 检查是否可以重做
   */
  const canRedo = useCallback((): boolean => {
    return historyIndexRef.current < historyRef.current.length - 1;
  }, []);

  // === 快捷键处理已移至 App.tsx（避免冲突）===
  // useEffect(() => { ... }, [undo, redo]);

  return {
    history,
    historyIndex,
    saveHistory,
    undo,
    redo,
    clearHistory,
    canUndo: canUndo(),
    canRedo: canRedo(),
  };
};
