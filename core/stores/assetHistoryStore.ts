/**
 * 资源历史管理 Store
 * 
 * 职责：
 * - 管理生成的资源历史记录
 * - 提供历史记录操作接口
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

// ============================================
// 类型定义
// ============================================

export interface AssetHistoryStore {
  // ========== 数据 ==========
  /** 资源历史记录 */
  assetHistory: any[];

  // ========== 查询操作 ==========
  /** 获取所有历史记录 */
  getAllHistory: () => any[];
  
  /** 获取历史记录数量 */
  getHistoryCount: () => number;

  // ========== 增删改操作 ==========
  /** 添加历史记录 */
  addHistory: (asset: any) => void;
  
  /** 批量添加历史记录 */
  addMultipleHistory: (assets: any[]) => void;
  
  /** 删除历史记录 */
  deleteHistory: (index: number) => void;
  
  /** 清空历史记录 */
  clearHistory: () => void;
  
  /** 设置所有历史记录 */
  setHistory: (history: any[]) => void;
}

// ============================================
// 创建 Store
// ============================================

export const useAssetHistoryStore = create<AssetHistoryStore>()(
  immer((set, get) => ({
    // ========== 初始数据 ==========
    assetHistory: [],

    // ========== 查询操作 ==========
    getAllHistory: () => {
      return get().assetHistory;
    },

    getHistoryCount: () => {
      return get().assetHistory.length;
    },

    // ========== 增删改操作 ==========
    addHistory: (asset) => set((state) => {
      state.assetHistory.push(asset);
    }),

    addMultipleHistory: (assets) => set((state) => {
      state.assetHistory.push(...assets);
    }),

    deleteHistory: (index) => set((state) => {
      if (index >= 0 && index < state.assetHistory.length) {
        state.assetHistory.splice(index, 1);
      }
    }),

    clearHistory: () => set((state) => {
      state.assetHistory = [];
    }),

    setHistory: (history) => set((state) => {
      state.assetHistory = history;
    }),
  }))
);
