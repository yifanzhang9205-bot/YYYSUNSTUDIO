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
   * 生成缩略图
   * TODO: 阶段2完善 - 实现3种规则（有图片/自定义/首字母）
   */
  const generateThumbnail = useCallback((nodes: AppNode[]): string => {
    // 简化实现：查找第一个有图片的节点
    for (const node of nodes) {
      if (node.data.image) {
        return node.data.image;
      }
      if (node.data.images && node.data.images.length > 0) {
        return node.data.images[0];
      }
    }
    
    // 如果没有图片，返回空字符串（后续用首字母占位符）
    return '';
  }, []);

  /**
   * 创建资产
   */
  const createAsset = useCallback((
    name: string,
    category: AssetCategory,
    nodes: AppNode[],
    connections: Connection[],
    customThumbnail?: string
  ) => {
    // 深拷贝节点和连接
    const copiedNodes = deepCopyNodes(nodes);
    const copiedConnections = deepCopyConnections(connections);
    
    // 生成缩略图
    const thumbnail = customThumbnail || generateThumbnail(nodes);
    const thumbnailType = customThumbnail ? 'custom' : (thumbnail ? 'auto' : 'text');
    
    // 创建资产对象
    const asset: Asset = {
      id: `asset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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
  const useAsset = useCallback((
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
    const newNodes = copiedNodes.map(node => ({
      ...node,
      id: idMap.get(node.id)!,
      x: position.x + (node.x - minX),
      y: position.y + (node.y - minY),
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
