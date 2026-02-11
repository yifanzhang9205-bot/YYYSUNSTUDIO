/**
 * 引用计数服务（Reference Counting Service）
 * 
 * 职责：
 * - 管理 Blob 的引用计数
 * - 跟踪哪些地方在使用同一个 Blob
 * - 只有当引用计数为 0 时，才删除 IndexedDB 中的 Blob
 * 
 * 架构：
 * - 使用 localStorage 持久化引用计数表
 * - 每个 Blob 有一个唯一 ID（blobId）
 * - 每个引用有一个唯一 ID（referenceId）
 * 
 * 示例：
 * ```
 * 引用计数表:
 * {
 *   "blob-abc123": {
 *     "asset-history-xyz": true,  // 历史记录引用
 *     "blob-node-n1-image": true, // 节点引用
 *     "asset-thumbnail-xyz": true // 资产库引用
 *   }
 * }
 * ```
 */

import { useAssetLibraryStore } from '../core/stores/assetLibraryStore';
import { useNodeStore } from '../core/stores/nodeStore';

// ============================================
// 类型定义
// ============================================

/**
 * 引用计数表
 * Key: blobId（Blob 的唯一 ID）
 * Value: 引用 ID 的集合
 */
type ReferenceCountTable = Record<string, Record<string, boolean>>;

// ============================================
// 持久化存储
// ============================================

const STORAGE_KEY = 'blob-reference-count';

/**
 * 从 localStorage 加载引用计数表
 */
const loadReferenceTable = (): ReferenceCountTable => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return {};
    return JSON.parse(data);
  } catch (error) {
    console.error('[ReferenceChecker] 加载引用计数表失败:', error);
    return {};
  }
};

/**
 * 保存引用计数表到 localStorage
 */
const saveReferenceTable = (table: ReferenceCountTable): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(table));
  } catch (error) {
    console.error('[ReferenceChecker] 保存引用计数表失败:', error);
  }
};

// ============================================
// 引用计数 API
// ============================================

/**
 * 添加引用
 * @param blobId - Blob 的唯一 ID
 * @param referenceId - 引用的唯一 ID（如 'asset-history-xyz', 'blob-node-n1-image'）
 */
export const addReference = (blobId: string, referenceId: string): void => {
  const table = loadReferenceTable();
  
  if (!table[blobId]) {
    table[blobId] = {};
  }
  
  table[blobId][referenceId] = true;
  saveReferenceTable(table);
  
  console.log(`[ReferenceChecker] 添加引用: ${blobId} <- ${referenceId}`);
};

/**
 * 移除引用
 * @param blobId - Blob 的唯一 ID
 * @param referenceId - 引用的唯一 ID
 * @returns 是否应该删除 Blob（引用计数为 0）
 */
export const removeReference = (blobId: string, referenceId: string): boolean => {
  const table = loadReferenceTable();
  
  if (!table[blobId]) {
    console.warn(`[ReferenceChecker] Blob 不存在: ${blobId}`);
    return true; // 不存在，可以删除
  }
  
  delete table[blobId][referenceId];
  
  // 检查是否还有其他引用
  const remainingReferences = Object.keys(table[blobId]).length;
  
  if (remainingReferences === 0) {
    // 没有引用了，删除整个条目
    delete table[blobId];
    saveReferenceTable(table);
    console.log(`[ReferenceChecker] 移除引用: ${blobId} <- ${referenceId}（引用计数为 0，可以删除）`);
    return true; // 可以删除
  } else {
    saveReferenceTable(table);
    console.log(`[ReferenceChecker] 移除引用: ${blobId} <- ${referenceId}（还有 ${remainingReferences} 个引用）`);
    return false; // 还有引用，不能删除
  }
};

/**
 * 获取引用计数
 * @param blobId - Blob 的唯一 ID
 * @returns 引用计数
 */
export const getReferenceCount = (blobId: string): number => {
  const table = loadReferenceTable();
  
  if (!table[blobId]) {
    return 0;
  }
  
  return Object.keys(table[blobId]).length;
};

/**
 * 获取所有引用 ID
 * @param blobId - Blob 的唯一 ID
 * @returns 引用 ID 数组
 */
export const getReferences = (blobId: string): string[] => {
  const table = loadReferenceTable();
  
  if (!table[blobId]) {
    return [];
  }
  
  return Object.keys(table[blobId]);
};

/**
 * 检查是否有引用
 * @param blobId - Blob 的唯一 ID
 * @returns 是否有引用
 */
export const hasReferences = (blobId: string): boolean => {
  return getReferenceCount(blobId) > 0;
};

/**
 * 清空所有引用计数（用于调试）
 */
export const clearAllReferences = (): void => {
  localStorage.removeItem(STORAGE_KEY);
  console.log('[ReferenceChecker] 清空所有引用计数');
};

/**
 * 打印引用计数表（用于调试）
 */
export const printReferenceTable = (): void => {
  const table = loadReferenceTable();
  console.log('[ReferenceChecker] 引用计数表:', table);
};

// ============================================
// 兼容旧代码的 API（保留）
// ============================================

/**
 * 检查历史记录是否被资产库引用
 * @param assetId - 历史记录的资产 ID
 * @returns 是否被引用
 */
export const isReferencedByAssetLibrary = (assetId: string): boolean => {
  const { assets } = useAssetLibraryStore.getState();
  
  // 检查是否有资产引用了这个历史记录
  return assets.some(asset => {
    // 检查资产的节点数据中是否有相同的 historyAssetId
    return asset.nodes.some(node => {
      return node.data.historyAssetId === assetId;
    });
  });
};

/**
 * 检查历史记录是否在画布上使用
 * @param assetId - 历史记录的资产 ID
 * @returns 是否在使用
 */
export const isUsedInCanvas = (assetId: string): boolean => {
  const { nodes } = useNodeStore.getState();
  
  // 检查是否有节点使用了这个历史记录的图片
  return Array.from(nodes.values()).some(node => {
    return node.data.historyAssetId === assetId;
  });
};

/**
 * 获取引用信息（用于显示）
 * @param assetId - 历史记录的资产 ID
 * @returns 引用信息
 */
export const getReferenceInfo = (assetId: string): {
  inAssetLibrary: boolean;
  inCanvas: boolean;
  message: string;
} => {
  const inAssetLibrary = isReferencedByAssetLibrary(assetId);
  const inCanvas = isUsedInCanvas(assetId);
  
  let message = '';
  if (inAssetLibrary && inCanvas) {
    message = '该图片正在画布和资产库中使用';
  } else if (inAssetLibrary) {
    message = '该图片已被资产库使用';
  } else if (inCanvas) {
    message = '该图片正在画布上使用';
  }
  
  return { inAssetLibrary, inCanvas, message };
};

/**
 * 批量检查多个历史记录的引用情况
 * @param assetIds - 历史记录 ID 数组
 * @returns 分类结果
 */
export const checkMultipleReferences = (assetIds: string[]): {
  独占的: string[];
  被引用的: string[];
} => {
  const 独占的: string[] = [];
  const 被引用的: string[] = [];
  
  for (const assetId of assetIds) {
    const { inAssetLibrary, inCanvas } = getReferenceInfo(assetId);
    
    if (inAssetLibrary || inCanvas) {
      被引用的.push(assetId);
    } else {
      独占的.push(assetId);
    }
  }
  
  return { 独占的, 被引用的 };
};
