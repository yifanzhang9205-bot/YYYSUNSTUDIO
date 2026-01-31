/**
 * 选择状态管理 Store
 * 
 * 职责：
 * - 管理节点选择状态
 * - 管理分组选择状态
 * - 提供选择操作接口
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

// ============================================
// 类型定义
// ============================================

export interface SelectionStore {
  // ========== 数据 ==========
  /** 选中的节点 ID 列表 */
  selectedNodeIds: string[];
  
  /** 选中的分组 ID */
  selectedGroupId: string | null;

  // ========== 节点选择操作 ==========
  /** 选择单个节点 */
  selectNode: (id: string, multi?: boolean) => void;
  
  /** 选择多个节点 */
  selectNodes: (ids: string[]) => void;
  
  /** 取消选择节点 */
  deselectNode: (id: string) => void;
  
  /** 清空节点选择 */
  clearNodeSelection: () => void;
  
  /** 切换节点选择状态 */
  toggleNodeSelection: (id: string) => void;
  
  /** 检查节点是否被选中 */
  isNodeSelected: (id: string) => boolean;

  // ========== 分组选择操作 ==========
  /** 选择分组 */
  selectGroup: (id: string | null) => void;
  
  /** 清空分组选择 */
  clearGroupSelection: () => void;

  // ========== 通用操作 ==========
  /** 清空所有选择 */
  clearAllSelection: () => void;
}

// ============================================
// 创建 Store
// ============================================

export const useSelectionStore = create<SelectionStore>()(
  immer((set, get) => ({
    // ========== 初始数据 ==========
    selectedNodeIds: [],
    selectedGroupId: null,

    // ========== 节点选择操作 ==========
    selectNode: (id, multi = false) => set((state) => {
      if (multi) {
        // 多选模式：添加到选择列表
        if (!state.selectedNodeIds.includes(id)) {
          state.selectedNodeIds.push(id);
        }
      } else {
        // 单选模式：替换选择列表
        state.selectedNodeIds = [id];
      }
      // 清空分组选择
      state.selectedGroupId = null;
    }),

    selectNodes: (ids) => set((state) => {
      state.selectedNodeIds = ids;
      state.selectedGroupId = null;
    }),

    deselectNode: (id) => set((state) => {
      state.selectedNodeIds = state.selectedNodeIds.filter(nodeId => nodeId !== id);
    }),

    clearNodeSelection: () => set((state) => {
      state.selectedNodeIds = [];
    }),

    toggleNodeSelection: (id) => set((state) => {
      const index = state.selectedNodeIds.indexOf(id);
      if (index !== -1) {
        state.selectedNodeIds.splice(index, 1);
      } else {
        state.selectedNodeIds.push(id);
      }
    }),

    isNodeSelected: (id) => {
      return get().selectedNodeIds.includes(id);
    },

    // ========== 分组选择操作 ==========
    selectGroup: (id) => set((state) => {
      state.selectedGroupId = id;
      // 清空节点选择
      state.selectedNodeIds = [];
    }),

    clearGroupSelection: () => set((state) => {
      state.selectedGroupId = null;
    }),

    // ========== 通用操作 ==========
    clearAllSelection: () => set((state) => {
      state.selectedNodeIds = [];
      state.selectedGroupId = null;
    }),
  }))
);
