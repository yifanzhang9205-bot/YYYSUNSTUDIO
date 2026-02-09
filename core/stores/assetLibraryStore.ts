/**
 * Asset Library Store - 资产库状态管理
 * 
 * 职责：
 * - 管理资产数据（增删改查）
 * - 管理当前选中的分类
 * - 持久化到 IndexedDB
 * 
 * 架构：Core Layer
 * - 不依赖 React
 * - 使用 Zustand + Immer
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AppNode, Connection } from '../../types';

/**
 * 资产分类
 */
export type AssetCategory = 'character' | 'scene' | 'object' | 'style' | 'other';

/**
 * 缩略图类型
 */
export type ThumbnailType = 'auto' | 'custom' | 'text';

/**
 * 资产数据结构
 */
export interface Asset {
  id: string;                    // 唯一 ID（uuid）
  name: string;                  // 资产名称
  category: AssetCategory;       // 分类
  thumbnail: string;             // 缩略图（Blob URL 或 Base64）
  thumbnailType: ThumbnailType;  // 缩略图类型
  nodes: AppNode[];              // 节点数据（深拷贝）
  connections: Connection[];     // 连接关系
  createdAt: number;             // 创建时间戳
  updatedAt: number;             // 更新时间戳
}

/**
 * Asset Library Store State
 */
interface AssetLibraryState {
  assets: Asset[];
  selectedCategory: AssetCategory | 'all';
  
  // Actions
  addAsset: (asset: Asset) => void;
  updateAsset: (id: string, updates: Partial<Asset>) => void;
  deleteAsset: (id: string) => void;
  getAssetsByCategory: (category: AssetCategory | 'all') => Asset[];
  setSelectedCategory: (category: AssetCategory | 'all') => void;
  clearAssets: () => void;
}

/**
 * 创建 Asset Library Store
 */
export const useAssetLibraryStore = create<AssetLibraryState>()(
  persist(
    immer((set, get) => ({
      assets: [],
      selectedCategory: 'all',

      /**
       * 添加资产
       */
      addAsset: (asset: Asset) => {
        set((state) => {
          state.assets.push(asset);
        });
        
        console.log('[AssetLibraryStore] 添加资产', {
          id: asset.id,
          name: asset.name,
          category: asset.category,
          nodesCount: asset.nodes.length,
        });
      },

      /**
       * 更新资产
       */
      updateAsset: (id: string, updates: Partial<Asset>) => {
        set((state) => {
          const index = state.assets.findIndex(a => a.id === id);
          if (index !== -1) {
            state.assets[index] = {
              ...state.assets[index],
              ...updates,
              updatedAt: Date.now(),
            };
          }
        });
        
        console.log('[AssetLibraryStore] 更新资产', { id, updates });
      },

      /**
       * 删除资产
       */
      deleteAsset: (id: string) => {
        set((state) => {
          const index = state.assets.findIndex(a => a.id === id);
          if (index !== -1) {
            // 🔥 清理 Blob URL（如果存在）
            const asset = state.assets[index];
            if (asset.thumbnail && asset.thumbnail.startsWith('blob:')) {
              URL.revokeObjectURL(asset.thumbnail);
            }
            
            state.assets.splice(index, 1);
          }
        });
        
        console.log('[AssetLibraryStore] 删除资产', { id });
      },

      /**
       * 根据分类获取资产
       */
      getAssetsByCategory: (category: AssetCategory | 'all') => {
        const { assets } = get();
        
        if (category === 'all') {
          return assets;
        }
        
        return assets.filter(a => a.category === category);
      },

      /**
       * 设置当前选中的分类
       */
      setSelectedCategory: (category: AssetCategory | 'all') => {
        set((state) => {
          state.selectedCategory = category;
        });
        
        console.log('[AssetLibraryStore] 切换分类', { category });
      },

      /**
       * 清空所有资产
       */
      clearAssets: () => {
        set((state) => {
          // 🔥 清理所有 Blob URL
          state.assets.forEach(asset => {
            if (asset.thumbnail && asset.thumbnail.startsWith('blob:')) {
              URL.revokeObjectURL(asset.thumbnail);
            }
          });
          
          state.assets = [];
        });
        
        console.log('[AssetLibraryStore] 清空资产');
      },
    })),
    {
      name: 'asset-library-storage', // localStorage 存储键名
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        assets: state.assets,
        // 不持久化 selectedCategory（每次打开默认显示"全部"）
      }),
    }
  )
);
