/**
 * 分组数据管理 Store
 * 
 * 职责：
 * - 管理所有分组数据
 * - 提供增删改查接口
 * - 管理分组内的节点
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Group } from '../../types';

// ============================================
// 类型定义
// ============================================

export interface GroupStore {
  // ========== 数据 ==========
  /** 所有分组 */
  groups: Group[];

  // ========== 查询操作 ==========
  /** 获取所有分组 */
  getAllGroups: () => Group[];
  
  /** 获取单个分组 */
  getGroup: (id: string) => Group | undefined;
  
  /** 检查分组是否存在 */
  hasGroup: (id: string) => boolean;
  
  /** 获取分组数量 */
  getGroupCount: () => number;

  // ========== 增删改操作 ==========
  /** 添加分组 */
  addGroup: (group: Group) => void;
  
  /** 批量添加分组 */
  addGroups: (groups: Group[]) => void;
  
  /** 更新分组 */
  updateGroup: (id: string, updates: Partial<Group>) => void;
  
  /** 删除分组 */
  deleteGroup: (id: string) => void;
  
  /** 批量删除分组 */
  deleteGroups: (ids: string[]) => void;
  
  /** 清空所有分组 */
  clearGroups: () => void;
  
  /** 设置所有分组（用于加载/恢复） */
  setGroups: (groups: Group[]) => void;

  // ========== 特殊操作 ==========
  /** 更新分组位置 */
  updateGroupPosition: (id: string, x: number, y: number) => void;
  
  /** 更新分组大小 */
  updateGroupSize: (id: string, width: number, height: number) => void;
}

// ============================================
// 创建 Store
// ============================================

export const useGroupStore = create<GroupStore>()(
  persist(
    immer((set, get) => ({
      // ========== 初始数据 ==========
      groups: [],

    // ========== 查询操作 ==========
    getAllGroups: () => {
      return get().groups;
    },

    getGroup: (id) => {
      return get().groups.find(group => group.id === id);
    },

    hasGroup: (id) => {
      return get().groups.some(group => group.id === id);
    },

    getGroupCount: () => {
      return get().groups.length;
    },

    // ========== 增删改操作 ==========
    addGroup: (group) => set((state) => {
      state.groups.push(group);
    }),

    addGroups: (groups) => set((state) => {
      state.groups.push(...groups);
    }),

    updateGroup: (id, updates) => set((state) => {
      const index = state.groups.findIndex(group => group.id === id);
      if (index !== -1) {
        state.groups[index] = { ...state.groups[index], ...updates };
      }
    }),

    deleteGroup: (id) => set((state) => {
      state.groups = state.groups.filter(group => group.id !== id);
    }),

    deleteGroups: (ids) => set((state) => {
      const idSet = new Set(ids);
      state.groups = state.groups.filter(group => !idSet.has(group.id));
    }),

    clearGroups: () => set((state) => {
      state.groups = [];
    }),

    setGroups: (groups) => set((state) => {
      state.groups = [...groups];
    }),

    // ========== 特殊操作 ==========
    updateGroupPosition: (id, x, y) => set((state) => {
      const index = state.groups.findIndex(group => group.id === id);
      if (index !== -1) {
        state.groups[index] = { ...state.groups[index], x, y };
      }
    }),

    updateGroupSize: (id, width, height) => set((state) => {
      const index = state.groups.findIndex(group => group.id === id);
      if (index !== -1) {
        state.groups[index] = { ...state.groups[index], width, height };
      }
    }),
  })),
  {
    name: 'canvas-groups-storage',
    storage: createJSONStorage(() => localStorage),
  }
)
);
