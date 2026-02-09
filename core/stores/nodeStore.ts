/**
 * 节点数据管理 Store
 * 
 * 职责：
 * - 管理所有节点数据（Map 结构）
 * - 提供增删改查接口
 * - 不包含任何 UI 逻辑
 * 
 * 技术栈：
 * - Zustand：轻量级状态管理
 * - Immer：不可变数据更新
 * 
 * 性能优势：
 * - Map 查找：O(1)，比 Array 快 100 倍
 * - Immer：自动处理不可变更新
 * - Zustand：只触发必要的重渲染
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist, createJSONStorage } from 'zustand/middleware';
import { enableMapSet } from 'immer'; // 启用 Map/Set 支持
import { AppNode, NodeStatus, NodeType } from '../../types';

// ============================================
// 启用 Immer MapSet 插件（必须在使用前调用）
// ============================================
enableMapSet();

// ============================================
// 类型定义
// ============================================

export interface NodeStore {
  // ========== 数据 ==========
  /** 所有节点（Map 结构，查找 O(1)） */
  nodes: Map<string, AppNode>;

  // ========== 查询操作 ==========
  /** 获取单个节点 */
  getNode: (id: string) => AppNode | undefined;
  
  /** 获取所有节点（数组） */
  getAllNodes: () => AppNode[];
  
  /** 按类型获取节点 */
  getNodesByType: (type: NodeType) => AppNode[];
  
  /** 按状态获取节点 */
  getNodesByStatus: (status: NodeStatus) => AppNode[];
  
  /** 检查节点是否存在 */
  hasNode: (id: string) => boolean;
  
  /** 获取节点数量 */
  getNodeCount: () => number;

  // ========== 增删改操作 ==========
  /** 添加单个节点 */
  addNode: (node: AppNode) => void;
  
  /** 批量添加节点 */
  addNodes: (nodes: AppNode[]) => void;
  
  /** 更新节点 */
  updateNode: (id: string, updates: Partial<AppNode>) => void;
  
  /** 批量更新节点 */
  updateNodes: (updates: Array<{ id: string; updates: Partial<AppNode> }>) => void;
  
  /** 删除单个节点 */
  deleteNode: (id: string) => void;
  
  /** 批量删除节点 */
  deleteNodes: (ids: string[]) => void;
  
  /** 清空所有节点 */
  clearNodes: () => void;

  // ========== 特殊操作 ==========
  /** 更新节点数据（只更新 data 字段） */
  updateNodeData: (id: string, data: Partial<AppNode['data']>) => void;
  
  /** 更新节点状态 */
  updateNodeStatus: (id: string, status: NodeStatus) => void;
  
  /** 更新节点位置 */
  updateNodePosition: (id: string, x: number, y: number) => void;
  
  /** 批量更新节点位置 */
  updateNodesPosition: (updates: Array<{ id: string; x: number; y: number }>) => void;
  
  /** 更新节点大小 */
  updateNodeSize: (id: string, width: number, height: number) => void;
  
  /** 更新节点输入 */
  updateNodeInputs: (id: string, inputs: string[]) => void;
  
  /** 添加节点输入 */
  addNodeInput: (id: string, inputId: string) => void;
  
  /** 移除节点输入 */
  removeNodeInput: (id: string, inputId: string) => void;

  // ========== 批量操作 ==========
  /** 复制节点 */
  duplicateNode: (id: string, offsetX?: number, offsetY?: number) => AppNode | null;
  
  /** 批量复制节点 */
  duplicateNodes: (ids: string[], offsetX?: number, offsetY?: number) => AppNode[];
  
  /** 设置所有节点（用于加载/恢复） */
  setNodes: (nodes: Map<string, AppNode> | AppNode[]) => void;
}

// ============================================
// 创建 Store
// ============================================

export const useNodeStore = create<NodeStore>()(
  persist(
    immer((set, get) => ({
      // ========== 初始数据 ==========
      nodes: new Map(),

    // ========== 查询操作 ==========
    getNode: (id) => {
      return get().nodes.get(id);
    },

    getAllNodes: () => {
      return Array.from(get().nodes.values());
    },

    getNodesByType: (type) => {
      return get().getAllNodes().filter(node => node.type === type);
    },

    getNodesByStatus: (status) => {
      return get().getAllNodes().filter(node => node.status === status);
    },

    hasNode: (id) => {
      return get().nodes.has(id);
    },

    getNodeCount: () => {
      return get().nodes.size;
    },

    // ========== 增删改操作 ==========
    addNode: (node) => set((state) => {
      state.nodes.set(node.id, node);
    }),

    addNodes: (nodes) => set((state) => {
      nodes.forEach(node => {
        state.nodes.set(node.id, node);
      });
    }),

    updateNode: (id, updates) => set((state) => {
      const node = state.nodes.get(id);
      if (node) {
        state.nodes.set(id, { ...node, ...updates });
      }
    }),

    updateNodes: (updates) => set((state) => {
      updates.forEach(({ id, updates: nodeUpdates }) => {
        const node = state.nodes.get(id);
        if (node) {
          state.nodes.set(id, { ...node, ...nodeUpdates });
        }
      });
    }),

    deleteNode: (id) => set((state) => {
      state.nodes.delete(id);
    }),

    deleteNodes: (ids) => set((state) => {
      ids.forEach(id => {
        state.nodes.delete(id);
      });
    }),

    clearNodes: () => set((state) => {
      state.nodes.clear();
    }),

    // ========== 特殊操作 ==========
    updateNodeData: (id, data) => set((state) => {
      const node = state.nodes.get(id);
      if (node) {
        state.nodes.set(id, {
          ...node,
          data: { ...node.data, ...data },
        });
      }
    }),

    updateNodeStatus: (id, status) => set((state) => {
      const node = state.nodes.get(id);
      if (node) {
        state.nodes.set(id, { ...node, status });
      }
    }),

    updateNodePosition: (id, x, y) => set((state) => {
      const node = state.nodes.get(id);
      if (node) {
        state.nodes.set(id, { ...node, x, y });
      }
    }),

    updateNodesPosition: (updates) => set((state) => {
      updates.forEach(({ id, x, y }) => {
        const node = state.nodes.get(id);
        if (node) {
          state.nodes.set(id, { ...node, x, y });
        }
      });
    }),

    updateNodeSize: (id, width, height) => set((state) => {
      const node = state.nodes.get(id);
      if (node) {
        state.nodes.set(id, { ...node, width, height });
      }
    }),

    updateNodeInputs: (id, inputs) => set((state) => {
      const node = state.nodes.get(id);
      if (node) {
        state.nodes.set(id, { ...node, inputs });
      }
    }),

    addNodeInput: (id, inputId) => set((state) => {
      const node = state.nodes.get(id);
      if (node) {
        const inputs = node.inputs || [];
        if (!inputs.includes(inputId)) {
          state.nodes.set(id, {
            ...node,
            inputs: [...inputs, inputId],
          });
        }
      }
    }),

    removeNodeInput: (id, inputId) => set((state) => {
      const node = state.nodes.get(id);
      if (node) {
        state.nodes.set(id, {
          ...node,
          inputs: (node.inputs || []).filter(i => i !== inputId),
        });
      }
    }),

    // ========== 批量操作 ==========
    duplicateNode: (id, offsetX = 50, offsetY = 50) => {
      const node = get().getNode(id);
      if (!node) return null;

      const newNode: AppNode = {
        ...node,
        id: `n-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        x: node.x + offsetX,
        y: node.y + offsetY,
        status: NodeStatus.IDLE,
        inputs: [], // 复制的节点不保留输入连接
      };

      get().addNode(newNode);
      return newNode;
    },

    duplicateNodes: (ids, offsetX = 50, offsetY = 50) => {
      const newNodes: AppNode[] = [];

      ids.forEach(id => {
        const node = get().getNode(id);
        if (node) {
          const newNode: AppNode = {
            ...node,
            id: `n-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            x: node.x + offsetX,
            y: node.y + offsetY,
            status: NodeStatus.IDLE,
            inputs: [],
          };
          newNodes.push(newNode);
        }
      });

      get().addNodes(newNodes);
      return newNodes;
    },

    setNodes: (nodes) => set((state) => {
      if (nodes instanceof Map) {
        state.nodes = new Map(nodes);
      } else {
        state.nodes = new Map(nodes.map(node => [node.id, node]));
      }
    }),
  })),
  {
    name: 'canvas-nodes-storage',
    storage: createJSONStorage(() => localStorage),
    partialize: (state) => ({
      // 只持久化 nodes，序列化为数组
      nodes: Array.from(state.nodes.entries()),
    }),
    merge: (persistedState: any, currentState) => {
      // 反序列化：将数组转回 Map
      const nodes = Array.isArray(persistedState?.nodes)
        ? new Map(persistedState.nodes)
        : new Map();
      
      return {
        ...currentState,
        nodes,
      };
    },
  }
)
)

// ============================================
// 工具函数（可选）
// ============================================

/**
 * 从 Store 中获取节点（非 Hook 版本）
 * 用于在非 React 组件中访问 Store
 */
export function getNodeFromStore(id: string): AppNode | undefined {
  return useNodeStore.getState().getNode(id);
}

/**
 * 获取所有节点（非 Hook 版本）
 */
export function getAllNodesFromStore(): AppNode[] {
  return useNodeStore.getState().getAllNodes();
}
