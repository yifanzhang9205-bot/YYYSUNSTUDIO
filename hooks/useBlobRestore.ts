/**
 * Blob URL 恢复 Hook
 * 
 * 职责：
 * - 页面加载时从 IndexedDB 恢复所有 Blob URL
 * - 自动更新节点数据
 */

import { useEffect } from 'react';
import { useNodeStore } from '../core/stores/nodeStore';
import { loadNodeImageBlob, loadNodeImagesBlob, loadGridImages } from '../services/blobStorage';

export function useBlobRestore() {
  const { nodes, updateNodes } = useNodeStore();

  useEffect(() => {
    const restoreBlobUrls = async () => {
      console.log('[BlobRestore] 开始恢复 Blob URL...');
      
      const updates: Array<{ id: string; updates: any }> = [];
      
      for (const [nodeId, node] of nodes.entries()) {
        const nodeUpdates: any = {};
        
        // 1. 恢复单张图片（image 字段）
        if (node.data.image && node.data.image.startsWith('blob:')) {
          const restoredUrl = await loadNodeImageBlob(nodeId);
          if (restoredUrl) {
            nodeUpdates.data = { ...node.data, image: restoredUrl };
            console.log(`[BlobRestore] 恢复节点图片: ${nodeId}`);
          }
        }
        
        // 2. 恢复九宫格图片（gridImages 字段）
        if (node.data.gridImages && node.data.gridImages.length > 0) {
          const firstImage = node.data.gridImages[0];
          if (firstImage && firstImage.startsWith('blob:')) {
            const restoredImages = await loadGridImages(nodeId, node.data.gridImages.length);
            if (restoredImages.length > 0) {
              nodeUpdates.data = { 
                ...nodeUpdates.data || node.data, 
                gridImages: restoredImages 
              };
              console.log(`[BlobRestore] 恢复九宫格图片: ${nodeId}, 数量: ${restoredImages.length}`);
            }
          }
        }
        
        // 3. 恢复裁剪后的图片数组（croppedImages 字段）
        if (node.data.croppedImages && node.data.croppedImages.length > 0) {
          const firstImage = node.data.croppedImages[0];
          if (firstImage && firstImage.startsWith('blob:')) {
            const restoredImages = await loadNodeImagesBlob(nodeId, node.data.croppedImages.length);
            if (restoredImages.length > 0) {
              nodeUpdates.data = { 
                ...nodeUpdates.data || node.data, 
                croppedImages: restoredImages 
              };
              console.log(`[BlobRestore] 恢复裁剪图片: ${nodeId}, 数量: ${restoredImages.length}`);
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
        updateNodes(updates);
        console.log(`[BlobRestore] Blob URL 恢复完成，共 ${updates.length} 个节点`);
      } else {
        console.log('[BlobRestore] 无需恢复 Blob URL');
      }
    };
    
    // 延迟执行，确保 Store 已经恢复
    const timer = setTimeout(() => {
      restoreBlobUrls();
    }, 100);
    
    return () => clearTimeout(timer);
  }, []); // 只在组件挂载时执行一次
}
