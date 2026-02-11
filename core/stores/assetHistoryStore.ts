/**
 * 资源历史管理 Store
 * 
 * 职责：
 * - 管理生成的资源历史记录
 * - 提供历史记录操作接口
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// ============================================
// 类型定义
// ============================================

/**
 * 历史记录项
 */
export interface AssetHistoryItem {
  id: string;                    // 资产 ID
  src: string;                   // Blob URL（临时，刷新后失效）
  blobId?: string;               // Blob ID（用于引用计数，可选）
  prompt?: string;               // 提示词
  timestamp: number;             // 时间戳
  usedByAssetLibrary?: boolean;  // 是否被资产库使用
  [key: string]: any;            // 其他字段
}

export interface AssetHistoryStore {
  // ========== 数据 ==========
  /** 资源历史记录 */
  assetHistory: AssetHistoryItem[];

  // ========== 查询操作 ==========
  /** 获取所有历史记录 */
  getAllHistory: () => AssetHistoryItem[];
  
  /** 获取历史记录数量 */
  getHistoryCount: () => number;

  // ========== 增删改操作 ==========
  /** 添加历史记录 */
  addHistory: (asset: AssetHistoryItem) => void;
  
  /** 批量添加历史记录 */
  addMultipleHistory: (assets: AssetHistoryItem[]) => void;
  
  /** 删除历史记录 */
  deleteHistory: (index: number) => void;
  
  /** 清空历史记录 */
  clearHistory: () => void;
  
  /** 设置所有历史记录 */
  setHistory: (history: AssetHistoryItem[]) => void;
  
  /** 更新资源的 src（用于恢复时更新 Blob URL） */
  updateAssetSrc: (id: string, newSrc: string) => void;
  
  /** 标记资源被资产库使用 */
  markAssetUsedByLibrary: (id: string) => void;
  
  /** 取消标记资源被资产库使用 */
  unmarkAssetUsedByLibrary: (id: string) => void;
  
  /** 检查资源是否被资产库使用 */
  isAssetUsedByLibrary: (id: string) => boolean;
}

// ============================================
// 创建 Store
// ============================================

export const useAssetHistoryStore = create<AssetHistoryStore>()(
  persist(
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

      updateAssetSrc: (id, newSrc) => set((state) => {
        const asset = state.assetHistory.find(a => a.id === id);
        if (asset) {
          asset.src = newSrc;
        }
      }),

      markAssetUsedByLibrary: (id) => set((state) => {
        const asset = state.assetHistory.find(a => a.id === id);
        if (asset) {
          asset.usedByAssetLibrary = true;
        }
      }),

      unmarkAssetUsedByLibrary: (id) => set((state) => {
        const asset = state.assetHistory.find(a => a.id === id);
        if (asset) {
          asset.usedByAssetLibrary = false;
        }
      }),

      isAssetUsedByLibrary: (id) => {
        const asset = get().assetHistory.find(a => a.id === id);
        return asset?.usedByAssetLibrary === true;
      },
    })),
    {
      name: 'asset-history-storage', // localStorage 存储键名
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        assetHistory: state.assetHistory,
        // 只持久化历史记录数组
      }),
    }
  )
);
