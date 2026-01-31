/**
 * 资源历史 Hook
 * 
 * 职责：
 * - 管理资源历史记录（图片、视频、音频）
 * - 处理资源生成、下载、清除
 * - 处理 Blob URL 的存储和恢复
 */

import { useCallback } from 'react';
import { useAssetHistoryStore } from '../core/stores/assetHistoryStore';
import { saveToStorage, deleteFromStorage } from '../services/storage';

/**
 * 资源历史 Hook
 */
export const useAssetHistory = () => {
  const assetHistory = useAssetHistoryStore(state => state.assetHistory);
  const { addHistory, setHistory: setAssetHistory } = useAssetHistoryStore();

  /**
   * 处理资源生成
   * 如果是 Blob URL，将 Blob 存储到 IndexedDB（页面刷新后可恢复）
   */
  const handleAssetGenerated = useCallback(async (
    type: 'image' | 'video' | 'audio', 
    src: string, 
    title: string
  ) => {
    let assetId = `a-${Date.now()}`;
    
    if (src.startsWith('blob:')) {
      try {
        // 从 Blob URL 获取 Blob
        const response = await fetch(src);
        const blob = await response.blob();
        
        // 存储到 IndexedDB
        await saveToStorage(`asset-${assetId}`, blob);
      } catch (error) {
        console.error('[AssetHistory] 保存 Blob 失败:', error);
      }
    }
    
    // 使用 Store 的 addHistory 方法
    const exists = assetHistory.find(a => a.src === src);
    if (!exists) {
      addHistory({ 
        id: assetId, 
        type, 
        src, 
        title, 
        timestamp: Date.now() 
      });
    }
  }, [assetHistory, addHistory]);

  /**
   * 删除单个资源
   * 完整清理：Blob URL + IndexedDB Blob + Store + 持久化
   */
  const handleDeleteAsset = useCallback(async (id: string) => {
    try {
      // 1. 找到要删除的资源
      const asset = assetHistory.find(a => a.id === id);
      if (!asset) {
        console.warn('[AssetHistory] 资源不存在:', id);
        return;
      }
      
      // 2. 清理 Blob URL（避免内存泄漏）
      if (asset.src && asset.src.startsWith('blob:')) {
        URL.revokeObjectURL(asset.src);
        console.log('[AssetHistory] 已释放 Blob URL:', asset.src.substring(0, 50));
      }
      
      // 3. 删除 IndexedDB 中的 Blob 数据
      if (asset.id) {
        try {
          await deleteFromStorage(`asset-${asset.id}`);
          console.log('[AssetHistory] 已删除 IndexedDB Blob:', asset.id);
        } catch (error) {
          console.error('[AssetHistory] 删除 IndexedDB Blob 失败:', error);
        }
      }
      
      // 4. 更新 Store
      const newHistory = assetHistory.filter(a => a.id !== id);
      setAssetHistory(newHistory);
      
      // 5. 立即保存到 IndexedDB
      await saveToStorage('assets', newHistory);
      
      console.log('[AssetHistory] 资源删除完成:', id);
    } catch (error) {
      console.error('[AssetHistory] 删除资源失败:', error);
      throw error;
    }
  }, [assetHistory, setAssetHistory]);

  /**
   * 批量删除多个资源
   * 完整清理：Blob URL + IndexedDB Blob + Store + 持久化
   * 性能优化：一次性更新 Store 和保存
   */
  const handleDeleteMultipleAssets = useCallback(async (ids: string[]) => {
    if (ids.length === 0) return;
    
    try {
      console.log(`[AssetHistory] 开始批量删除 ${ids.length} 个资源`);
      
      // 1. 找到要删除的资源
      const assetsToDelete = assetHistory.filter(a => ids.includes(a.id));
      
      // 2. 清理 Blob URL（避免内存泄漏）
      assetsToDelete.forEach(asset => {
        if (asset.src && asset.src.startsWith('blob:')) {
          URL.revokeObjectURL(asset.src);
        }
      });
      
      // 3. 删除 IndexedDB 中的 Blob 数据
      for (const asset of assetsToDelete) {
        if (asset.id) {
          try {
            await deleteFromStorage(`asset-${asset.id}`);
          } catch (error) {
            console.error(`[AssetHistory] 删除 IndexedDB Blob ${asset.id} 失败:`, error);
          }
        }
      }
      
      // 4. 一次性更新 Store
      const newHistory = assetHistory.filter(a => !ids.includes(a.id));
      setAssetHistory(newHistory);
      
      // 5. 一次性保存到 IndexedDB
      await saveToStorage('assets', newHistory);
      
      console.log(`[AssetHistory] 批量删除完成，已删除 ${assetsToDelete.length} 个资源`);
    } catch (error) {
      console.error('[AssetHistory] 批量删除失败:', error);
      throw error;
    }
  }, [assetHistory, setAssetHistory]);

  /**
   * 批量下载选中的图片并清除
   * 完整清理：下载 + Blob URL + IndexedDB Blob + Store + 持久化
   */
  const downloadSelectedImagesAndClear = useCallback(async (selectedIds: Set<string>) => {
    if (selectedIds.size === 0) return;
    
    // 收集要下载的图片
    const assetsToDownload = assetHistory.filter(a => selectedIds.has(a.id));
    
    if (assetsToDownload.length === 0) return;
    
    try {
      if (assetsToDownload.length === 1) {
        // 单张图片：直接下载
        const asset = assetsToDownload[0];
        const a = document.createElement('a');
        a.href = asset.src;
        a.download = `${asset.title || 'image'}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        // 多张图片：打包成 ZIP 下载
        const JSZip = (await import('jszip')).default;
        const zip = new JSZip();
        
        // 将所有图片添加到 ZIP
        for (let i = 0; i < assetsToDownload.length; i++) {
          const asset = assetsToDownload[i];
          try {
            const response = await fetch(asset.src);
            const blob = await response.blob();
            const filename = `${i + 1}-${asset.title || 'image'}.png`;
            zip.file(filename, blob);
          } catch (error) {
            console.error(`[AssetHistory] 下载 ${asset.title} 失败:`, error);
          }
        }
        
        // 生成 ZIP 并下载
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const zipUrl = URL.createObjectURL(zipBlob);
        const a = document.createElement('a');
        a.href = zipUrl;
        a.download = `images-${Date.now()}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(zipUrl);
      }
      
      // ✅ 下载成功后才清除
      console.log(`[AssetHistory] 下载完成，开始清除 ${assetsToDownload.length} 个资源`);
      
      // 1. 更新 Store
      const newAssetHistory = assetHistory.filter(a => !selectedIds.has(a.id));
      setAssetHistory(newAssetHistory);
      
      // 2. 立即保存到 IndexedDB
      await saveToStorage('assets', newAssetHistory);
      
      // 3. 清理 Blob URL（避免内存泄漏）
      assetsToDownload.forEach(asset => {
        if (asset.src && asset.src.startsWith('blob:')) {
          URL.revokeObjectURL(asset.src);
        }
      });
      
      // 4. 🔥 新增：清理 IndexedDB 中的 Blob 数据
      for (const asset of assetsToDownload) {
        if (asset.id) {
          try {
            await deleteFromStorage(`asset-${asset.id}`);
            console.log(`[AssetHistory] 已删除 IndexedDB Blob: ${asset.id}`);
          } catch (error) {
            console.error(`[AssetHistory] 删除 IndexedDB Blob ${asset.id} 失败:`, error);
          }
        }
      }
      
      console.log(`[AssetHistory] 清除完成，已释放内存和磁盘空间`);
      
    } catch (error) {
      console.error('[AssetHistory] 批量下载失败:', error);
      // ❌ 失败时不清除数据，并提示用户
      alert(`❌ 下载失败：${error instanceof Error ? error.message : '未知错误'}\n\n数据未清除，请重试`);
      throw error;
    }
  }, [assetHistory, setAssetHistory]);

  return {
    handleAssetGenerated,
    handleDeleteAsset,
    handleDeleteMultipleAssets,
    downloadSelectedImagesAndClear,
  };
};
