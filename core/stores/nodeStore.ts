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
      
      // 🔥 自动保存图片到 IndexedDB（异步，不阻塞 UI）
      (async () => {
        try {
          const { saveNodeImageBlob, saveNodeImagesBlob } = await import('../../services/blobStorage');
          
          // 1. 保存单张图片（image 字段）
          if (node.data.image && (node.data.image.startsWith('blob:') || node.data.image.startsWith('data:'))) {
            await saveNodeImageBlob(node.id, node.data.image);
          }
          
          // 2. 保存九宫格图片（gridImages 字段）
          if (node.data.gridImages && Array.isArray(node.data.gridImages) && node.data.gridImages.length > 0) {
            const firstImage = node.data.gridImages[0];
            if (firstImage && (firstImage.startsWith('blob:') || firstImage.startsWith('data:'))) {
              await saveNodeImagesBlob(node.id, node.data.gridImages);
            }
          }
          
          // 3. 保存裁剪后的图片数组（croppedImages 字段）
          if (node.data.croppedImages && Array.isArray(node.data.croppedImages) && node.data.croppedImages.length > 0) {
            const firstImage = node.data.croppedImages[0];
            if (firstImage && (firstImage.startsWith('blob:') || firstImage.startsWith('data:'))) {
              await saveNodeImagesBlob(node.id, node.data.croppedImages);
            }
          }
        } catch (error) {
          console.error('[NodeStore] 自动保存图片到 IndexedDB 失败:', error);
        }
      })();
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
      const node = state.nodes.get(id);
      if (node) {
        // 🔥 数据清理机制：释放节点专用的 Blob URL（不影响历史记录和资产库）
        // 原理：节点的 Blob URL 是从 IndexedDB 独立创建的，不是共享的
        // 历史记录、资产库、画布节点各自有独立的 Blob URL
        if (node.data.image && node.data.image.startsWith('blob:')) {
          URL.revokeObjectURL(node.data.image);
          console.log(`[NodeStore] 已释放节点 Blob URL: ${node.data.image.substring(0, 50)}`);
        }
        
        if (node.data.gridImages && Array.isArray(node.data.gridImages)) {
          node.data.gridImages.forEach(url => {
            if (url && url.startsWith('blob:')) {
              URL.revokeObjectURL(url);
            }
          });
          console.log(`[NodeStore] 已释放 ${node.data.gridImages.length} 个九宫格 Blob URL`);
        }
        
        if (node.data.croppedImages && Array.isArray(node.data.croppedImages)) {
          node.data.croppedImages.forEach(url => {
            if (url && url.startsWith('blob:')) {
              URL.revokeObjectURL(url);
            }
          });
          console.log(`[NodeStore] 已释放 ${node.data.croppedImages.length} 个裁剪图片 Blob URL`);
        }
        
        // 删除节点数据
        state.nodes.delete(id);
        
        // IndexedDB 不清理（等待历史记录清除时统一清理）
        console.log(`[NodeStore] 节点已删除: ${id}，IndexedDB 数据保留（等待历史记录清除）`);
      }
    }),

    deleteNodes: (ids) => set((state) => {
      ids.forEach(id => {
        const node = state.nodes.get(id);
        if (node) {
          // 🔥 释放节点专用的 Blob URL
          if (node.data.image && node.data.image.startsWith('blob:')) {
            URL.revokeObjectURL(node.data.image);
          }
          
          if (node.data.gridImages && Array.isArray(node.data.gridImages)) {
            node.data.gridImages.forEach(url => {
              if (url && url.startsWith('blob:')) {
                URL.revokeObjectURL(url);
              }
            });
          }
          
          if (node.data.croppedImages && Array.isArray(node.data.croppedImages)) {
            node.data.croppedImages.forEach(url => {
              if (url && url.startsWith('blob:')) {
                URL.revokeObjectURL(url);
              }
            });
          }
        }
        
        state.nodes.delete(id);
      });
      
      console.log(`[NodeStore] 批量删除完成: ${ids.length} 个节点，Blob URL 已释放`);
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
        
        // 🔥 自动保存图片到 IndexedDB（异步，不阻塞 UI）
        (async () => {
          try {
            const { saveNodeImageBlob, saveNodeImagesBlob } = await import('../../services/blobStorage');
            
            // 1. 保存单张图片（image 字段）
            if (data.image && (data.image.startsWith('blob:') || data.image.startsWith('data:'))) {
              await saveNodeImageBlob(id, data.image);
            }
            
            // 2. 保存九宫格图片（gridImages 字段）
            if (data.gridImages && Array.isArray(data.gridImages) && data.gridImages.length > 0) {
              const firstImage = data.gridImages[0];
              if (firstImage && (firstImage.startsWith('blob:') || firstImage.startsWith('data:'))) {
                await saveNodeImagesBlob(id, data.gridImages);
              }
            }
            
            // 3. 保存裁剪后的图片数组（croppedImages 字段）
            if (data.croppedImages && Array.isArray(data.croppedImages) && data.croppedImages.length > 0) {
              const firstImage = data.croppedImages[0];
              if (firstImage && (firstImage.startsWith('blob:') || firstImage.startsWith('data:'))) {
                await saveNodeImagesBlob(id, data.croppedImages);
              }
            }
          } catch (error) {
            console.error('[NodeStore] 自动保存图片到 IndexedDB 失败:', error);
          }
        })();
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
    // 🔥 页面刷新后恢复 Blob URL
    onRehydrateStorage: () => {
      return async (state, error) => {
        if (error) {
          console.error('[NodeStore] 恢复失败:', error);
          return;
        }
        
        if (!state) {
          console.warn('[NodeStore] state 为空，跳过 Blob URL 恢复');
          return;
        }
        
        // 延迟执行，确保 Store 完全恢复
        setTimeout(async () => {
          console.log('[NodeStore] 开始恢复 Blob URL...', `节点数量: ${state.nodes.size}`);
          
          if (state.nodes.size === 0) {
            console.log('[NodeStore] 没有节点需要恢复');
            return;
          }
          
          // 动态导入 blobStorage（避免循环依赖）
          const { loadNodeImageBlob, loadNodeImagesBlob, loadGridImages } = await import('../../services/blobStorage');
          
          // 遍历所有节点，恢复 Blob URL
          const updates: Array<{ id: string; updates: Partial<AppNode> }> = [];
          
          for (const [nodeId, node] of state.nodes.entries()) {
            const nodeUpdates: Partial<AppNode> = {};
            
            // 1. 恢复单张图片（image 字段）
            if (node.data.image && node.data.image.startsWith('blob:')) {
              console.log(`[NodeStore] 尝试恢复节点图片: ${nodeId}`);
              const restoredUrl = await loadNodeImageBlob(nodeId);
              if (restoredUrl) {
                nodeUpdates.data = { ...node.data, image: restoredUrl };
                console.log(`[NodeStore] ✅ 恢复节点图片成功: ${nodeId}`);
              } else {
                console.warn(`[NodeStore] ❌ 恢复节点图片失败: ${nodeId} - 未找到 IndexedDB 数据`);
              }
            }
            
            // 2. 恢复九宫格图片（gridImages 字段）
            if (node.data.gridImages && node.data.gridImages.length > 0) {
              const firstImage = node.data.gridImages[0];
              if (firstImage && firstImage.startsWith('blob:')) {
                console.log(`[NodeStore] 尝试恢复九宫格图片: ${nodeId}, 数量: ${node.data.gridImages.length}`);
                const restoredImages = await loadGridImages(nodeId, node.data.gridImages.length);
                if (restoredImages.length > 0) {
                  nodeUpdates.data = { 
                    ...nodeUpdates.data || node.data, 
                    gridImages: restoredImages 
                  };
                  console.log(`[NodeStore] ✅ 恢复九宫格图片成功: ${nodeId}, 数量: ${restoredImages.length}`);
                } else {
                  console.warn(`[NodeStore] ❌ 恢复九宫格图片失败: ${nodeId} - 未找到 IndexedDB 数据`);
                }
              }
            }
            
            // 3. 恢复裁剪后的图片数组（croppedImages 字段）
            if (node.data.croppedImages && node.data.croppedImages.length > 0) {
              const firstImage = node.data.croppedImages[0];
              if (firstImage && firstImage.startsWith('blob:')) {
                console.log(`[NodeStore] 尝试恢复裁剪图片: ${nodeId}, 数量: ${node.data.croppedImages.length}`);
                const restoredImages = await loadNodeImagesBlob(nodeId, node.data.croppedImages.length);
                if (restoredImages.length > 0) {
                  nodeUpdates.data = { 
                    ...nodeUpdates.data || node.data, 
                    croppedImages: restoredImages 
                  };
                  console.log(`[NodeStore] ✅ 恢复裁剪图片成功: ${nodeId}, 数量: ${restoredImages.length}`);
                } else {
                  console.warn(`[NodeStore] ❌ 恢复裁剪图片失败: ${nodeId} - 未找到 IndexedDB 数据`);
                }
              }
            }
            
            // 如果有更新，添加到批量更新列表
            if (Object.keys(nodeUpdates).length > 0) {
              updates.push({ id: nodeId, updates: nodeUpdates });
            }
          }
          
          // 批量更新节点
          if (updates.length > 0) {
            state.updateNodes(updates);
            console.log(`[NodeStore] ✅ Blob URL 恢复完成，共 ${updates.length} 个节点`);
          } else {
            console.log('[NodeStore] 无需恢复 Blob URL（没有失效的 Blob URL）');
          }
        }, 500); // 延迟 500ms，确保 Store 完全恢复
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
