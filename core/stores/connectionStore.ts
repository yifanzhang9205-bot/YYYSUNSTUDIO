/**
 * 连接线数据管理 Store
 * 
 * 职责：
 * - 管理所有连接线数据
 * - 提供增删改查接口
 * - 验证连接有效性
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Connection } from '../../types';

// ============================================
// 类型定义
// ============================================

export interface ConnectionStore {
  // ========== 数据 ==========
  /** 所有连接线 */
  connections: Connection[];

  // ========== 查询操作 ==========
  /** 获取所有连接线 */
  getAllConnections: () => Connection[];
  
  /** 获取节点的输出连接 */
  getOutputConnections: (nodeId: string) => Connection[];
  
  /** 获取节点的输入连接 */
  getInputConnections: (nodeId: string) => Connection[];
  
  /** 检查连接是否存在 */
  hasConnection: (from: string, to: string) => boolean;
  
  /** 获取连接数量 */
  getConnectionCount: () => number;

  // ========== 增删改操作 ==========
  /** 添加连接 */
  addConnection: (connection: Connection) => void;
  
  /** 批量添加连接 */
  addConnections: (connections: Connection[]) => void;
  
  /** 删除连接 */
  deleteConnection: (from: string, to: string) => void;
  
  /** 删除节点的所有连接 */
  deleteNodeConnections: (nodeId: string) => void;
  
  /** 批量删除节点的连接 */
  deleteNodesConnections: (nodeIds: string[]) => void;
  
  /** 清空所有连接 */
  clearConnections: () => void;
  
  /** 设置所有连接（用于加载/恢复） */
  setConnections: (connections: Connection[]) => void;
}

// ============================================
// 创建 Store
// ============================================

export const useConnectionStore = create<ConnectionStore>()(
  persist(
    immer((set, get) => ({
      // ========== 初始数据 ==========
      connections: [],

    // ========== 查询操作 ==========
    getAllConnections: () => {
      return get().connections;
    },

    getOutputConnections: (nodeId) => {
      return get().connections.filter(conn => conn.from === nodeId);
    },

    getInputConnections: (nodeId) => {
      return get().connections.filter(conn => conn.to === nodeId);
    },

    hasConnection: (from, to) => {
      return get().connections.some(conn => conn.from === from && conn.to === to);
    },

    getConnectionCount: () => {
      return get().connections.length;
    },

    // ========== 增删改操作 ==========
    addConnection: (connection) => set((state) => {
      // 检查是否已存在
      const exists = state.connections.some(
        conn => conn.from === connection.from && conn.to === connection.to
      );
      if (!exists) {
        state.connections.push(connection);
      }
    }),

    addConnections: (connections) => set((state) => {
      connections.forEach(connection => {
        const exists = state.connections.some(
          conn => conn.from === connection.from && conn.to === connection.to
        );
        if (!exists) {
          state.connections.push(connection);
        }
      });
    }),

    deleteConnection: (from, to) => set((state) => {
      state.connections = state.connections.filter(
        conn => !(conn.from === from && conn.to === to)
      );
    }),

    deleteNodeConnections: (nodeId) => set((state) => {
      state.connections = state.connections.filter(
        conn => conn.from !== nodeId && conn.to !== nodeId
      );
    }),

    deleteNodesConnections: (nodeIds) => set((state) => {
      const nodeIdSet = new Set(nodeIds);
      state.connections = state.connections.filter(
        conn => !nodeIdSet.has(conn.from) && !nodeIdSet.has(conn.to)
      );
    }),

    clearConnections: () => set((state) => {
      state.connections = [];
    }),

    setConnections: (connections) => set((state) => {
      state.connections = [...connections];
    }),
  })),
  {
    name: 'canvas-connections-storage',
    storage: createJSONStorage(() => localStorage),
  }
)
);
