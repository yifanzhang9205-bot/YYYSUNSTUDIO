import { 
  saveToIndexedDB, 
  loadFromIndexedDB, 
  isIndexedDBAvailable,
  getStorageUsage 
} from './indexedDBStorage';
import { AppNode } from '../types';

const DB_NAME = 'sunstudio_db';
const DB_VERSION = 1;
const STORE_NAME = 'app_data';

const getDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = (event: any) => {
      resolve(event.target.result);
    };

    request.onerror = (event: any) => {
      reject(event.target.error);
    };
  });
};

/**
 * 检查数据是否为 base64 图片/视频/音频
 */
const isMediaData = (data: string): { isMedia: boolean; type?: 'image' | 'video' | 'audio' } => {
  if (typeof data !== 'string') return { isMedia: false };
  
  if (data.startsWith('data:image/')) return { isMedia: true, type: 'image' };
  if (data.startsWith('data:video/')) return { isMedia: true, type: 'video' };
  if (data.startsWith('data:audio/')) return { isMedia: true, type: 'audio' };
  
  return { isMedia: false };
};

/**
 * 生成媒体文件的唯一 ID
 */
const generateMediaId = (nodeId: string, field: string): string => {
  return `${nodeId}_${field}_${Date.now()}`;
};

/**
 * 保存节点数据（智能分离媒体文件）
 */
export const saveNodesWithMedia = async (nodes: AppNode[]): Promise<void> => {
  console.log('[Storage] 开始保存节点数据，共', nodes.length, '个节点');
  
  // 分离媒体数据和元数据
  const nodesMetadata: AppNode[] = [];
  const mediaToSave: Array<{ id: string; data: string; type: 'image' | 'video' | 'audio' }> = [];
  
  for (const node of nodes) {
    const nodeCopy = { ...node, data: { ...node.data } };
    
    // 检查并分离图片
    if (node.data.image) {
      const check = isMediaData(node.data.image);
      if (check.isMedia && check.type) {
        const mediaId = generateMediaId(node.id, 'image');
        mediaToSave.push({ id: mediaId, data: node.data.image, type: check.type });
        nodeCopy.data.image = `@media:${mediaId}`; // 使用引用标记
      }
    }
    
    // 检查并分离多张图片
    if (node.data.images && Array.isArray(node.data.images)) {
      nodeCopy.data.images = await Promise.all(
        node.data.images.map(async (img, idx) => {
          const check = isMediaData(img);
          if (check.isMedia && check.type) {
            const mediaId = generateMediaId(node.id, `images_${idx}`);
            mediaToSave.push({ id: mediaId, data: img, type: check.type });
            return `@media:${mediaId}`;
          }
          return img;
        })
      );
    }
    
    // 检查并分离视频
    if (node.data.videoUri) {
      const check = isMediaData(node.data.videoUri);
      if (check.isMedia && check.type) {
        const mediaId = generateMediaId(node.id, 'videoUri');
        mediaToSave.push({ id: mediaId, data: node.data.videoUri, type: check.type });
        nodeCopy.data.videoUri = `@media:${mediaId}`;
      }
    }
    
    // 检查并分离音频
    if (node.data.audioUri) {
      const check = isMediaData(node.data.audioUri);
      if (check.isMedia && check.type) {
        const mediaId = generateMediaId(node.id, 'audioUri');
        mediaToSave.push({ id: mediaId, data: node.data.audioUri, type: check.type });
        nodeCopy.data.audioUri = `@media:${mediaId}`;
      }
    }
    
    // 检查九宫格图片
    if (node.data.gridImages && Array.isArray(node.data.gridImages)) {
      nodeCopy.data.gridImages = await Promise.all(
        node.data.gridImages.map(async (img, idx) => {
          const check = isMediaData(img);
          if (check.isMedia && check.type) {
            const mediaId = generateMediaId(node.id, `gridImages_${idx}`);
            mediaToSave.push({ id: mediaId, data: img, type: check.type });
            return `@media:${mediaId}`;
          }
          return img;
        })
      );
    }
    
    // 检查裁剪后的图片
    if (node.data.croppedImages && Array.isArray(node.data.croppedImages)) {
      nodeCopy.data.croppedImages = await Promise.all(
        node.data.croppedImages.map(async (img, idx) => {
          const check = isMediaData(img);
          if (check.isMedia && check.type) {
            const mediaId = generateMediaId(node.id, `croppedImages_${idx}`);
            mediaToSave.push({ id: mediaId, data: img, type: check.type });
            return `@media:${mediaId}`;
          }
          return img;
        })
      );
    }
    
    nodesMetadata.push(nodeCopy);
  }
  
  // 保存媒体文件到 IndexedDB
  if (mediaToSave.length > 0 && isIndexedDBAvailable()) {
    console.log(`[Storage] 保存 ${mediaToSave.length} 个媒体文件到 IndexedDB`);
    for (const media of mediaToSave) {
      await saveToIndexedDB(media.id, media.data, media.type);
    }
  }
  
  // 保存元数据到原有存储
  console.log('[Storage] 保存节点元数据');
  await saveToStorage('nodes', nodesMetadata);
  
  // 显示存储使用情况
  const usage = await getStorageUsage();
  console.log('[Storage] 存储使用情况:', usage);
};

/**
 * 加载节点数据（自动恢复媒体文件）
 */
export const loadNodesWithMedia = async (): Promise<AppNode[] | undefined> => {
  console.log('[Storage] 开始加载节点数据');
  
  const nodesMetadata = await loadFromStorage<AppNode[]>('nodes');
  if (!nodesMetadata) {
    console.log('[Storage] 未找到节点数据');
    return undefined;
  }
  
  console.log('[Storage] 加载到', nodesMetadata.length, '个节点元数据');
  
  // 恢复媒体数据
  const nodes: AppNode[] = [];
  
  for (const node of nodesMetadata) {
    const nodeCopy = { ...node, data: { ...node.data } };
    
    // 恢复图片
    if (node.data.image && typeof node.data.image === 'string' && node.data.image.startsWith('@media:')) {
      const mediaId = node.data.image.replace('@media:', '');
      const mediaData = await loadFromIndexedDB(mediaId, 'image');
      if (mediaData) {
        nodeCopy.data.image = mediaData;
      }
    }
    
    // 恢复多张图片
    if (node.data.images && Array.isArray(node.data.images)) {
      nodeCopy.data.images = await Promise.all(
        node.data.images.map(async (img) => {
          if (typeof img === 'string' && img.startsWith('@media:')) {
            const mediaId = img.replace('@media:', '');
            const mediaData = await loadFromIndexedDB(mediaId, 'image');
            return mediaData || img;
          }
          return img;
        })
      );
    }
    
    // 恢复视频
    if (node.data.videoUri && typeof node.data.videoUri === 'string' && node.data.videoUri.startsWith('@media:')) {
      const mediaId = node.data.videoUri.replace('@media:', '');
      const mediaData = await loadFromIndexedDB(mediaId, 'video');
      if (mediaData) {
        nodeCopy.data.videoUri = mediaData;
      }
    }
    
    // 恢复音频
    if (node.data.audioUri && typeof node.data.audioUri === 'string' && node.data.audioUri.startsWith('@media:')) {
      const mediaId = node.data.audioUri.replace('@media:', '');
      const mediaData = await loadFromIndexedDB(mediaId, 'audio');
      if (mediaData) {
        nodeCopy.data.audioUri = mediaData;
      }
    }
    
    // 恢复九宫格图片
    if (node.data.gridImages && Array.isArray(node.data.gridImages)) {
      nodeCopy.data.gridImages = await Promise.all(
        node.data.gridImages.map(async (img) => {
          if (typeof img === 'string' && img.startsWith('@media:')) {
            const mediaId = img.replace('@media:', '');
            const mediaData = await loadFromIndexedDB(mediaId, 'image');
            return mediaData || img;
          }
          return img;
        })
      );
    }
    
    // 恢复裁剪后的图片
    if (node.data.croppedImages && Array.isArray(node.data.croppedImages)) {
      nodeCopy.data.croppedImages = await Promise.all(
        node.data.croppedImages.map(async (img) => {
          if (typeof img === 'string' && img.startsWith('@media:')) {
            const mediaId = img.replace('@media:', '');
            const mediaData = await loadFromIndexedDB(mediaId, 'image');
            return mediaData || img;
          }
          return img;
        })
      );
    }
    
    nodes.push(nodeCopy);
  }
  
  console.log('[Storage] 节点数据加载完成');
  return nodes;
};

export const saveToStorage = async (key: string, data: any) => {
    const db = await getDB();
    return new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.put(data, key);

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
};

export const loadFromStorage = async <T>(key: string): Promise<T | undefined> => {
    const db = await getDB();
    return new Promise<T | undefined>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(key);

      request.onsuccess = () => {
        // request.result is undefined if the key does not exist, which is what we want to return
        resolve(request.result);
      };
      request.onerror = () => {
        reject(request.error);
      };
    });
};