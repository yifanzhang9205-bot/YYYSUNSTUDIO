/**
 * useAssetLibrary Hook - 资产库逻辑
 * 
 * 职责：
 * - 创建资产（深拷贝节点数据）
 * - 使用资产（拖拽到画布）
 * - 生成缩略图
 * 
 * 架构：Hooks Layer
 * - 处理资产库相关的业务逻辑
 * - 调用 assetLibraryStore
 */

import { useCallback } from 'react';
import { AppNode, Connection } from '../types';
import { useAssetLibraryStore, Asset, AssetCategory } from '../core/stores/assetLibraryStore';

export const useAssetLibrary = () => {
  const addAsset = useAssetLibraryStore(state => state.addAsset);

  /**
   * 深拷贝节点数据
   */
  const deepCopyNodes = useCallback((nodes: AppNode[]): AppNode[] => {
    return nodes.map(node => ({
      ...node,
      data: JSON.parse(JSON.stringify(node.data)),
      inputs: [...node.inputs],
    }));
  }, []);

  /**
   * 深拷贝连接数据
   */
  const deepCopyConnections = useCallback((connections: Connection[]): Connection[] => {
    return connections.map(conn => ({ ...conn }));
  }, []);

  /**
   * 生成缩略图（从 IndexedDB 创建独立的 Blob URL）
   * TODO: 阶段2完善 - 实现3种规则（有图片/自定义/首字母）
   */
  const generateThumbnail = useCallback(async (nodes: AppNode[], assetId: string): Promise<string> => {
    // 查找第一个有图片的节点
    for (const node of nodes) {
      if (node.data.image && node.data.image.startsWith('blob:')) {
        try {
          // 🔥 关键修复：从节点的 IndexedDB 读取 Blob，创建资产库专用的 Blob URL
          const { loadFromStorage, saveToStorage } = await import('../services/storage');
          const nodeStorageKey = `blob-node-${node.id}-image`;
          const blob = await loadFromStorage<Blob>(nodeStorageKey);
          
          if (blob) {
            // 创建资产库专用的 Blob URL（独立于画布节点）
            const assetBlobUrl = URL.createObjectURL(blob);
            
            // 保存到资产库专用的 IndexedDB
            const assetStorageKey = `asset-thumbnail-${assetId}`;
            await saveToStorage(assetStorageKey, blob);
            
            console.log('[useAssetLibrary] 资产库缩略图已创建（独立 Blob URL）', { assetId, nodeId: node.id });
            return assetBlobUrl;
          }
        } catch (error) {
          console.error('[useAssetLibrary] 创建资产库缩略图失败:', error);
        }
      }
      
      if (node.data.images && node.data.images.length > 0 && node.data.images[0].startsWith('blob:')) {
        try {
          const { loadFromStorage, saveToStorage } = await import('../services/storage');
          const nodeStorageKey = `blob-node-${node.id}-image-0`;
          const blob = await loadFromStorage<Blob>(nodeStorageKey);
          
          if (blob) {
            const assetBlobUrl = URL.createObjectURL(blob);
            const assetStorageKey = `asset-thumbnail-${assetId}`;
            await saveToStorage(assetStorageKey, blob);
            
            console.log('[useAssetLibrary] 资产库缩略图已创建（从 images[0]）', { assetId, nodeId: node.id });
            return assetBlobUrl;
          }
        } catch (error) {
          console.error('[useAssetLibrary] 创建资产库缩略图失败:', error);
        }
      }
    }
    
    // 如果没有图片，返回空字符串（后续用首字母占位符）
    return '';
  }, []);

  /**
   * 创建资产
   */
  const createAsset = useCallback(async (
    name: string,
    category: AssetCategory,
    nodes: AppNode[],
    connections: Connection[],
    customThumbnail?: string
  ) => {
    // 深拷贝节点和连接
    const copiedNodes = deepCopyNodes(nodes);
    const copiedConnections = deepCopyConnections(connections);
    
    // 生成资产 ID（提前生成，用于缩略图保存）
    const assetId = `asset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // 🔥 关键修复：异步生成缩略图（从 IndexedDB 创建独立的 Blob URL）
    const thumbnail = customThumbnail || await generateThumbnail(nodes, assetId);
    const thumbnailType = customThumbnail ? 'custom' : (thumbnail ? 'auto' : 'text');
    
    // 创建资产对象
    const asset: Asset = {
      id: assetId,
      name,
      category,
      thumbnail,
      thumbnailType,
      nodes: copiedNodes,
      connections: copiedConnections,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    // 保存到 Store
    addAsset(asset);
    
    // 🔥 注意：缩略图已经在 generateThumbnail 中保存到 IndexedDB，这里不需要再保存
    
    // 🔥 数据持久化：保存资产的节点图片到 IndexedDB（阶段2完整修复）
    (async () => {
      try {
        console.log('[useAssetLibrary] 开始保存资产节点图片到 IndexedDB', { 
          assetId: asset.id, 
          nodesCount: copiedNodes.length 
        });
        
        const { 
          saveAssetNodeImage, 
          saveAssetNodeImages 
        } = await import('../services/blobStorage');
        
        for (const node of copiedNodes) {
          // 保存单张图片（node.data.image）
          if (node.data.image && node.data.image.startsWith('blob:')) {
            await saveAssetNodeImage(asset.id, node.id, node.data.image);
            console.log('[useAssetLibrary] 资产节点图片已保存', { 
              assetId: asset.id, 
              nodeId: node.id 
            });
          }
          
          // 保存图片数组（node.data.images）
          if (node.data.images && node.data.images.length > 0) {
            const blobImages = node.data.images.filter((img: string) => img.startsWith('blob:'));
            if (blobImages.length > 0) {
              await saveAssetNodeImages(asset.id, node.id, blobImages);
              console.log('[useAssetLibrary] 资产节点图片数组已保存', { 
                assetId: asset.id, 
                nodeId: node.id, 
                count: blobImages.length 
              });
            }
          }
          
          // 保存九宫格图片（node.data.gridImages）
          if (node.data.gridImages && node.data.gridImages.length > 0) {
            const blobGridImages = node.data.gridImages.filter((img: string) => img.startsWith('blob:'));
            if (blobGridImages.length > 0) {
              // 使用 saveAssetNodeImages 保存九宫格图片
              await saveAssetNodeImages(asset.id, node.id, blobGridImages);
              console.log('[useAssetLibrary] 资产节点九宫格图片已保存', { 
                assetId: asset.id, 
                nodeId: node.id, 
                count: blobGridImages.length 
              });
            }
          }
        }
        
        console.log('[useAssetLibrary] 所有资产节点图片保存完成');
      } catch (error) {
        console.error('[useAssetLibrary] 保存资产节点图片失败:', error);
      }
    })();
    
    // 🔥 引用计数保护：标记历史记录中的图片被资产库使用（阶段3）
    (async () => {
      try {
        const { useAssetHistoryStore } = await import('../core/stores/assetHistoryStore');
        const { markAssetUsedByLibrary } = useAssetHistoryStore.getState();
        
        // 查找历史记录中对应的图片
        for (const node of copiedNodes) {
          if (node.data.image && node.data.image.startsWith('blob:')) {
            // 从历史记录中查找这个图片
            const { assetHistory } = useAssetHistoryStore.getState();
            const historyAsset = assetHistory.find(a => a.src === node.data.image);
            
            if (historyAsset) {
              markAssetUsedByLibrary(historyAsset.id);
              console.log('[useAssetLibrary] 历史记录已标记为被资产库使用', { 
                historyAssetId: historyAsset.id,
                assetId: asset.id 
              });
            }
          }
        }
      } catch (error) {
        console.error('[useAssetLibrary] 标记历史记录失败:', error);
      }
    })();
    
    console.log('[useAssetLibrary] 创建资产', {
      id: asset.id,
      name,
      category,
      nodesCount: nodes.length,
      connectionsCount: connections.length,
      thumbnailType,
    });
    
    return asset;
  }, [addAsset, deepCopyNodes, deepCopyConnections, generateThumbnail]);

  /**
   * 使用资产（拖拽到画布）
   */
  const useAsset = useCallback(async (
    assetId: string,
    position: { x: number; y: number },
    onAddNodes: (nodes: AppNode[]) => void,
    onAddConnections: (connections: Connection[]) => void
  ) => {
    console.log('[useAssetLibrary] 使用资产', { assetId, position });
    
    // 从 Store 获取资产数据
    const assets = useAssetLibraryStore.getState().assets;
    const asset = assets.find(a => a.id === assetId);
    
    if (!asset) {
      console.error('[useAssetLibrary] 资产不存在', { assetId });
      return;
    }
    
    // 深拷贝节点数据
    const copiedNodes = deepCopyNodes(asset.nodes);
    
    // 🔥 数据持久化：从 IndexedDB 恢复资产的节点图片（阶段2完整修复）
    try {
      console.log('[useAssetLibrary] 开始从 IndexedDB 恢复资产节点图片', { 
        assetId, 
        nodesCount: copiedNodes.length 
      });
      
      const { 
        loadAssetNodeImage, 
        loadAssetNodeImages 
      } = await import('../services/blobStorage');
      
      for (const node of copiedNodes) {
        // 恢复单张图片（node.data.image）
        if (node.data.image && node.data.image.startsWith('blob:')) {
          const restoredBlobUrl = await loadAssetNodeImage(assetId, node.id);
          if (restoredBlobUrl) {
            node.data.image = restoredBlobUrl;
            console.log('[useAssetLibrary] 资产节点图片已恢复', { 
              assetId, 
              nodeId: node.id 
            });
          } else {
            console.warn('[useAssetLibrary] 资产节点图片未找到，使用原 Blob URL', { 
              assetId, 
              nodeId: node.id 
            });
          }
        }
        
        // 恢复图片数组（node.data.images）
        if (node.data.images && node.data.images.length > 0) {
          const blobImagesCount = node.data.images.filter((img: string) => img.startsWith('blob:')).length;
          if (blobImagesCount > 0) {
            const restoredBlobUrls = await loadAssetNodeImages(assetId, node.id, blobImagesCount);
            if (restoredBlobUrls.length > 0) {
              // 替换 Blob URL
              let blobIndex = 0;
              node.data.images = node.data.images.map((img: string) => {
                if (img.startsWith('blob:') && blobIndex < restoredBlobUrls.length) {
                  return restoredBlobUrls[blobIndex++];
                }
                return img;
              });
              console.log('[useAssetLibrary] 资产节点图片数组已恢复', { 
                assetId, 
                nodeId: node.id, 
                count: restoredBlobUrls.length 
              });
            }
          }
        }
        
        // 恢复九宫格图片（node.data.gridImages）
        if (node.data.gridImages && node.data.gridImages.length > 0) {
          const blobGridImagesCount = node.data.gridImages.filter((img: string) => img.startsWith('blob:')).length;
          if (blobGridImagesCount > 0) {
            const restoredBlobUrls = await loadAssetNodeImages(assetId, node.id, blobGridImagesCount);
            if (restoredBlobUrls.length > 0) {
              // 替换 Blob URL
              let blobIndex = 0;
              node.data.gridImages = node.data.gridImages.map((img: string) => {
                if (img.startsWith('blob:') && blobIndex < restoredBlobUrls.length) {
                  return restoredBlobUrls[blobIndex++];
                }
                return img;
              });
              console.log('[useAssetLibrary] 资产节点九宫格图片已恢复', { 
                assetId, 
                nodeId: node.id, 
                count: restoredBlobUrls.length 
              });
            }
          }
        }
      }
      
      console.log('[useAssetLibrary] 所有资产节点图片恢复完成');
    } catch (error) {
      console.error('[useAssetLibrary] 恢复资产节点图片失败:', error);
    }
    
    // 生成新的节点 ID 映射
    const idMap = new Map<string, string>();
    copiedNodes.forEach(node => {
      const newId = `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      idMap.set(node.id, newId);
    });
    
    // 计算资产的边界（用于定位）
    let minX = Infinity;
    let minY = Infinity;
    copiedNodes.forEach(node => {
      if (node.x < minX) minX = node.x;
      if (node.y < minY) minY = node.y;
    });
    
    // 调整节点位置和 ID
    // 🔥 数据清理机制：保留原始节点的 historyAssetId（用于引用检查）
    const newNodes = copiedNodes.map(node => ({
      ...node,
      id: idMap.get(node.id)!,
      x: position.x + (node.x - minX),
      y: position.y + (node.y - minY),
      data: {
        ...node.data,
        // 保留原始节点的 historyAssetId（如果有）
        historyAssetId: node.data.historyAssetId,
      },
    }));
    
    // 深拷贝连接数据并更新 ID
    const copiedConnections = deepCopyConnections(asset.connections);
    const newConnections = copiedConnections.map(conn => ({
      ...conn,
      from: idMap.get(conn.from) || conn.from,
      to: idMap.get(conn.to) || conn.to,
    }));
    
    // 添加节点和连接到画布
    onAddNodes(newNodes);
    onAddConnections(newConnections);
    
    // 🔥 数据持久化：保存新节点图片到 IndexedDB（阶段1修复）
    (async () => {
      try {
        console.log('[useAssetLibrary] 开始保存新节点图片到 IndexedDB', { 
          assetId, 
          nodesCount: newNodes.length 
        });
        
        const { saveNodeImageBlob, saveNodeImagesBlob } = await import('../services/blobStorage');
        
        for (const node of newNodes) {
          // 保存单张图片（node.data.image）
          if (node.data.image && node.data.image.startsWith('blob:')) {
            await saveNodeImageBlob(node.id, node.data.image);
            console.log('[useAssetLibrary] 新节点图片已保存', { nodeId: node.id });
          }
          
          // 保存图片数组（node.data.images）
          if (node.data.images && node.data.images.length > 0) {
            const blobImages = node.data.images.filter((img: string) => img.startsWith('blob:'));
            if (blobImages.length > 0) {
              await saveNodeImagesBlob(node.id, blobImages);
              console.log('[useAssetLibrary] 新节点图片数组已保存', { 
                nodeId: node.id, 
                count: blobImages.length 
              });
            }
          }
          
          // 保存九宫格图片（node.data.gridImages）
          if (node.data.gridImages && node.data.gridImages.length > 0) {
            const blobGridImages = node.data.gridImages.filter((img: string) => img.startsWith('blob:'));
            if (blobGridImages.length > 0) {
              // 使用 saveImagesToBlob 保存九宫格图片
              const { saveImagesToBlob } = await import('../services/blobStorage');
              await saveImagesToBlob(blobGridImages, node.id, 'grid');
              console.log('[useAssetLibrary] 新节点九宫格图片已保存', { 
                nodeId: node.id, 
                count: blobGridImages.length 
              });
            }
          }
        }
        
        console.log('[useAssetLibrary] 所有新节点图片保存完成');
      } catch (error) {
        console.error('[useAssetLibrary] 保存新节点图片失败:', error);
      }
    })();
    
    console.log('[useAssetLibrary] 资产使用成功', {
      assetId,
      assetName: asset.name,
      nodesCount: newNodes.length,
      connectionsCount: newConnections.length,
      position,
    });
  }, [deepCopyNodes, deepCopyConnections]);

  return {
    createAsset,
    useAsset,
  };
};
