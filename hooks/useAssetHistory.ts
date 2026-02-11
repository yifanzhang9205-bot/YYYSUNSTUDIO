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
  const { addHistory, setHistory: setAssetHistory, updateAssetSrc } = useAssetHistoryStore();

  /**
   * 恢复历史记录图片（页面加载时调用）
   * 🔥 引用计数方案：从 IndexedDB 恢复 Blob URL
   */
  const restoreHistoryImages = useCallback(async () => {
    const assets = useAssetHistoryStore.getState().assetHistory;
    
    console.log(`[AssetHistory] 开始恢复历史记录图片: ${assets.length} 个`);
    
    for (const asset of assets) {
      if (asset.type === 'image') {
        try {
          // 🔥 使用 blobId 从 IndexedDB 恢复
          if (asset.blobId) {
            // 方案 1：使用 blobId 直接加载
            const { loadFromStorage } = await import('../services/storage');
            const blob = await loadFromStorage<Blob>(asset.blobId);
            
            if (blob) {
              // 创建新的 Blob URL
              const newBlobUrl = URL.createObjectURL(blob);
              
              // 更新 Store
              updateAssetSrc(asset.id, newBlobUrl);
              console.log(`[AssetHistory] 图片已恢复（引用计数）: ${asset.id} -> ${asset.blobId}`);
            } else {
              console.warn(`[AssetHistory] Blob 未找到: ${asset.blobId}`);
            }
          } else {
            // 降级方案：使用旧的键名格式
            const { loadAssetHistoryImage } = await import('../services/blobStorage');
            const newBlobUrl = await loadAssetHistoryImage(asset.id);
            
            if (newBlobUrl) {
              // 更新 Store
              updateAssetSrc(asset.id, newBlobUrl);
              console.log(`[AssetHistory] 图片已恢复（旧格式）: ${asset.id}`);
            } else {
              console.warn(`[AssetHistory] 图片未找到: ${asset.id}`);
            }
          }
        } catch (error) {
          console.error(`[AssetHistory] 恢复图片失败: ${asset.id}`, error);
        }
      }
    }
    
    console.log('[AssetHistory] 历史记录图片恢复完成');
  }, [updateAssetSrc]);

  /**
   * 处理资源生成
   * 🔥 引用计数方案：使用 saveAssetHistoryImageWithRef
   */
  const handleAssetGenerated = useCallback(async (
    type: 'image' | 'video' | 'audio', 
    src: string, 
    title: string
  ) => {
    let assetId = `a-${Date.now()}`;
    
    // 检查是否已存在（避免重复）
    const exists = assetHistory.find(a => a.src === src);
    if (exists) {
      console.log('[AssetHistory] 资源已存在，跳过', { src: src.substring(0, 50) });
      return;
    }
    
    // 🔥 引用计数方案：使用新的保存函数
    let historySrc = src;
    let blobId: string | undefined;
    
    if (src.startsWith('blob:') || src.startsWith('data:')) {
      try {
        // 使用引用计数保存
        const { saveAssetHistoryImageWithRef } = await import('../services/blobStorage');
        
        // 🔥 修复：使用返回的 blobId（确保一致性）
        const result = await saveAssetHistoryImageWithRef(assetId, src);
        historySrc = result.blobUrl;
        blobId = result.blobId;
        
        console.log('[AssetHistory] 历史记录已保存（引用计数）', { 
          assetId, 
          blobId,
          historySrc: historySrc.substring(0, 50)
        });
      } catch (error) {
        console.error('[AssetHistory] 保存历史记录失败:', error);
        // 降级：使用原始 src
        historySrc = src;
        blobId = undefined;
      }
    }
    
    // 使用 Store 的 addHistory 方法
    addHistory({ 
      id: assetId, 
      type, 
      src: historySrc,
      blobId,  // 🔥 保存 Blob ID（用于引用计数）
      title, 
      timestamp: Date.now() 
    });
    
    console.log('[AssetHistory] 历史记录已添加', { assetId, blobId, type, title });
  }, [assetHistory, addHistory]);

  /**
   * 删除单个资源
   * 🔥 引用计数方案：使用 deleteBlobReference
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
      
      // 3. 🔥 使用引用计数删除
      if (asset.blobId) {
        const { deleteAssetHistoryImageWithRef } = await import('../services/blobStorage');
        await deleteAssetHistoryImageWithRef(asset.id, asset.blobId);
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
   * 🔥 引用计数方案：使用 deleteBlobReference
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
      
      // 3. 🔥 使用引用计数删除
      const { deleteAssetHistoryImageWithRef } = await import('../services/blobStorage');
      for (const asset of assetsToDelete) {
        if (asset.blobId) {
          try {
            await deleteAssetHistoryImageWithRef(asset.id, asset.blobId);
          } catch (error) {
            console.error(`[AssetHistory] 删除 ${asset.id} 失败:`, error);
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
   * 批量下载选中的图片（不清除）
   * 🔥 规则 2：批量下载
   * - 下载所有图片（包括被引用的）
   * - 不检查引用关系
   * - 下载不影响数据存储
   */
  const downloadSelectedImages = useCallback(async (selectedIds: Set<string>) => {
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
      
      console.log(`[AssetHistory] 批量下载完成，共 ${assetsToDownload.length} 张图片`);
      
    } catch (error) {
      console.error('[AssetHistory] 批量下载失败:', error);
      alert(`❌ 下载失败：${error instanceof Error ? error.message : '未知错误'}`);
      throw error;
    }
  }, [assetHistory]);

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
      
      // 4. 🔥 清理 IndexedDB 中的 Blob 数据（使用专用函数）
      const { deleteAssetHistoryImage } = await import('../services/blobStorage');
      for (const asset of assetsToDownload) {
        if (asset.id) {
          try {
            await deleteAssetHistoryImage(asset.id);
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

  /**
   * 一键清除历史记录（智能清理）
   * 🔥 规则 3：一键清除逻辑
   * - 扫描所有历史记录
   * - 分类：独占的 vs 被引用的
   * - 清理独占的记录
   * - 显示结果，提供继续清理选项
   */
  const handleClearHistory = useCallback(async () => {
    if (assetHistory.length === 0) {
      alert('历史记录为空');
      return;
    }
    
    try {
      console.log(`[AssetHistory] 开始一键清除历史记录，共 ${assetHistory.length} 条`);
      
      // 1. 扫描所有历史记录，分类
      const { checkMultipleReferences } = await import('../services/referenceChecker');
      const allIds = assetHistory.map(a => a.id);
      const { 独占的, 被引用的 } = checkMultipleReferences(allIds);
      
      console.log('[AssetHistory] 分类完成', { 
        独占的数量: 独占的.length, 
        被引用的数量: 被引用的.length 
      });
      
      // 2. 清理独占的记录
      if (独占的.length > 0) {
        const assetsToDelete = assetHistory.filter(a => 独占的.includes(a.id));
        
        // 清理 Blob URL
        assetsToDelete.forEach(asset => {
          if (asset.src && asset.src.startsWith('blob:')) {
            URL.revokeObjectURL(asset.src);
          }
        });
        
        // 清理 IndexedDB
        const { deleteAssetHistoryImage } = await import('../services/blobStorage');
        for (const asset of assetsToDelete) {
          if (asset.id) {
            try {
              await deleteAssetHistoryImage(asset.id);
            } catch (error) {
              console.error(`[AssetHistory] 删除 IndexedDB Blob ${asset.id} 失败:`, error);
            }
          }
        }
        
        // 更新 Store
        const newHistory = assetHistory.filter(a => !独占的.includes(a.id));
        setAssetHistory(newHistory);
        
        // 保存到 IndexedDB
        await saveToStorage('assets', newHistory);
        
        console.log(`[AssetHistory] 已清理 ${独占的.length} 条独占记录`);
      }
      
      // 3. 显示结果
      if (被引用的.length === 0) {
        alert(`✅ 已清理 ${独占的.length} 条记录`);
        return;
      }
      
      alert(`✅ 已清理 ${独占的.length} 条记录，跳过 ${被引用的.length} 条（被资产库或画布使用）`);
      
      // 4. 提供继续清理选项
      const confirmed = prompt(
        `跳过的 ${被引用的.length} 条记录正在被使用。\n\n` +
        `如需继续清理这些记录，请输入"确认"：`
      );
      
      if (confirmed === '确认') {
        console.log('[AssetHistory] 用户确认清理被引用的记录');
        
        // 清理被引用的记录
        const assetsToDelete = assetHistory.filter(a => 被引用的.includes(a.id));
        
        // 清理 Blob URL
        assetsToDelete.forEach(asset => {
          if (asset.src && asset.src.startsWith('blob:')) {
            URL.revokeObjectURL(asset.src);
          }
        });
        
        // 清理 IndexedDB
        const { deleteAssetHistoryImage } = await import('../services/blobStorage');
        for (const asset of assetsToDelete) {
          if (asset.id) {
            try {
              await deleteAssetHistoryImage(asset.id);
            } catch (error) {
              console.error(`[AssetHistory] 删除 IndexedDB Blob ${asset.id} 失败:`, error);
            }
          }
        }
        
        // 更新 Store
        const newHistory = assetHistory.filter(a => !被引用的.includes(a.id));
        setAssetHistory(newHistory);
        
        // 保存到 IndexedDB
        await saveToStorage('assets', newHistory);
        
        alert(`✅ 已清理所有 ${被引用的.length} 条被引用的记录`);
        console.log(`[AssetHistory] 一键清除完成，共清理 ${assetHistory.length} 条记录`);
      } else {
        console.log('[AssetHistory] 用户取消清理被引用的记录');
      }
      
    } catch (error) {
      console.error('[AssetHistory] 一键清除失败:', error);
      alert(`❌ 清除失败：${error instanceof Error ? error.message : '未知错误'}`);
      throw error;
    }
  }, [assetHistory, setAssetHistory]);

  return {
    restoreHistoryImages,
    handleAssetGenerated,
    handleDeleteAsset,
    handleDeleteMultipleAssets,
    downloadSelectedImages,           // 🔥 新增：批量下载（不清除）
    downloadSelectedImagesAndClear,   // 批量下载并清除
    handleClearHistory,
  };
};
