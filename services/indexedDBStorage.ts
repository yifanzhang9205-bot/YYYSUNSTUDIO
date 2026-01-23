/**
 * IndexedDB 存储服务
 * 用于存储大文件（图片、视频等）
 * 容量：几百 MB 到几 GB
 */

const DB_NAME = 'YYYSunStudio';
const DB_VERSION = 1;
const STORE_IMAGES = 'images';
const STORE_VIDEOS = 'videos';
const STORE_AUDIO = 'audio';

interface StorageItem {
  id: string;
  data: string; // base64 data
  timestamp: number;
  size: number; // bytes
  type: 'image' | 'video' | 'audio';
}

/**
 * 初始化 IndexedDB
 */
const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('[IndexedDB] 打开失败:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      console.log('[IndexedDB] 打开成功');
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      console.log('[IndexedDB] 升级数据库');
      const db = (event.target as IDBOpenDBRequest).result;

      // 创建图片存储
      if (!db.objectStoreNames.contains(STORE_IMAGES)) {
        const imageStore = db.createObjectStore(STORE_IMAGES, { keyPath: 'id' });
        imageStore.createIndex('timestamp', 'timestamp', { unique: false });
        imageStore.createIndex('size', 'size', { unique: false });
        console.log('[IndexedDB] 创建图片存储');
      }

      // 创建视频存储
      if (!db.objectStoreNames.contains(STORE_VIDEOS)) {
        const videoStore = db.createObjectStore(STORE_VIDEOS, { keyPath: 'id' });
        videoStore.createIndex('timestamp', 'timestamp', { unique: false });
        videoStore.createIndex('size', 'size', { unique: false });
        console.log('[IndexedDB] 创建视频存储');
      }

      // 创建音频存储
      if (!db.objectStoreNames.contains(STORE_AUDIO)) {
        const audioStore = db.createObjectStore(STORE_AUDIO, { keyPath: 'id' });
        audioStore.createIndex('timestamp', 'timestamp', { unique: false });
        audioStore.createIndex('size', 'size', { unique: false });
        console.log('[IndexedDB] 创建音频存储');
      }
    };
  });
};

/**
 * 保存数据到 IndexedDB
 */
export const saveToIndexedDB = async (
  id: string,
  data: string,
  type: 'image' | 'video' | 'audio'
): Promise<void> => {
  try {
    const db = await initDB();
    const storeName = type === 'image' ? STORE_IMAGES : type === 'video' ? STORE_VIDEOS : STORE_AUDIO;

    // 计算数据大小
    const size = new Blob([data]).size;

    const item: StorageItem = {
      id,
      data,
      timestamp: Date.now(),
      size,
      type
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(item);

      request.onsuccess = () => {
        console.log(`[IndexedDB] 保存成功: ${id} (${(size / 1024).toFixed(2)} KB)`);
        resolve();
      };

      request.onerror = () => {
        console.error('[IndexedDB] 保存失败:', request.error);
        reject(request.error);
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('[IndexedDB] 保存异常:', error);
    throw error;
  }
};

/**
 * 从 IndexedDB 读取数据
 */
export const loadFromIndexedDB = async (
  id: string,
  type: 'image' | 'video' | 'audio'
): Promise<string | null> => {
  try {
    const db = await initDB();
    const storeName = type === 'image' ? STORE_IMAGES : type === 'video' ? STORE_VIDEOS : STORE_AUDIO;

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onsuccess = () => {
        const item = request.result as StorageItem | undefined;
        if (item) {
          console.log(`[IndexedDB] 读取成功: ${id} (${(item.size / 1024).toFixed(2)} KB)`);
          resolve(item.data);
        } else {
          console.log(`[IndexedDB] 未找到: ${id}`);
          resolve(null);
        }
      };

      request.onerror = () => {
        console.error('[IndexedDB] 读取失败:', request.error);
        reject(request.error);
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('[IndexedDB] 读取异常:', error);
    return null;
  }
};

/**
 * 删除 IndexedDB 中的数据
 */
export const deleteFromIndexedDB = async (
  id: string,
  type: 'image' | 'video' | 'audio'
): Promise<void> => {
  try {
    const db = await initDB();
    const storeName = type === 'image' ? STORE_IMAGES : type === 'video' ? STORE_VIDEOS : STORE_AUDIO;

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onsuccess = () => {
        console.log(`[IndexedDB] 删除成功: ${id}`);
        resolve();
      };

      request.onerror = () => {
        console.error('[IndexedDB] 删除失败:', request.error);
        reject(request.error);
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('[IndexedDB] 删除异常:', error);
    throw error;
  }
};

/**
 * 批量保存数据
 */
export const batchSaveToIndexedDB = async (
  items: Array<{ id: string; data: string; type: 'image' | 'video' | 'audio' }>
): Promise<void> => {
  console.log(`[IndexedDB] 批量保存 ${items.length} 项`);
  
  for (const item of items) {
    await saveToIndexedDB(item.id, item.data, item.type);
  }
  
  console.log('[IndexedDB] 批量保存完成');
};

/**
 * 批量读取数据
 */
export const batchLoadFromIndexedDB = async (
  ids: Array<{ id: string; type: 'image' | 'video' | 'audio' }>
): Promise<Map<string, string>> => {
  console.log(`[IndexedDB] 批量读取 ${ids.length} 项`);
  
  const results = new Map<string, string>();
  
  for (const { id, type } of ids) {
    const data = await loadFromIndexedDB(id, type);
    if (data) {
      results.set(id, data);
    }
  }
  
  console.log(`[IndexedDB] 批量读取完成，成功 ${results.size}/${ids.length} 项`);
  return results;
};

/**
 * 获取存储使用情况
 */
export const getStorageUsage = async (): Promise<{
  used: number;
  quota: number;
  percentage: number;
}> => {
  try {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      const used = estimate.usage || 0;
      const quota = estimate.quota || 0;
      const percentage = quota > 0 ? (used / quota) * 100 : 0;

      console.log('[IndexedDB] 存储使用情况:', {
        used: `${(used / 1024 / 1024).toFixed(2)} MB`,
        quota: `${(quota / 1024 / 1024).toFixed(2)} MB`,
        percentage: `${percentage.toFixed(2)}%`
      });

      return { used, quota, percentage };
    }
  } catch (error) {
    console.error('[IndexedDB] 获取存储使用情况失败:', error);
  }

  return { used: 0, quota: 0, percentage: 0 };
};

/**
 * 清空所有数据
 */
export const clearAllIndexedDB = async (): Promise<void> => {
  try {
    const db = await initDB();

    return new Promise((resolve, reject) => {
      const stores = [STORE_IMAGES, STORE_VIDEOS, STORE_AUDIO];
      const transaction = db.transaction(stores, 'readwrite');

      stores.forEach(storeName => {
        const store = transaction.objectStore(storeName);
        store.clear();
      });

      transaction.oncomplete = () => {
        console.log('[IndexedDB] 清空所有数据成功');
        db.close();
        resolve();
      };

      transaction.onerror = () => {
        console.error('[IndexedDB] 清空数据失败:', transaction.error);
        reject(transaction.error);
      };
    });
  } catch (error) {
    console.error('[IndexedDB] 清空数据异常:', error);
    throw error;
  }
};

/**
 * 检查 IndexedDB 是否可用
 */
export const isIndexedDBAvailable = (): boolean => {
  try {
    return 'indexedDB' in window && indexedDB !== null;
  } catch (e) {
    return false;
  }
};

/**
 * 获取所有存储的项目列表
 */
export const getAllStoredItems = async (
  type: 'image' | 'video' | 'audio'
): Promise<Array<{ id: string; timestamp: number; size: number }>> => {
  try {
    const db = await initDB();
    const storeName = type === 'image' ? STORE_IMAGES : type === 'video' ? STORE_VIDEOS : STORE_AUDIO;

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        const items = (request.result as StorageItem[]).map(item => ({
          id: item.id,
          timestamp: item.timestamp,
          size: item.size
        }));
        resolve(items);
      };

      request.onerror = () => {
        console.error('[IndexedDB] 获取列表失败:', request.error);
        reject(request.error);
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('[IndexedDB] 获取列表异常:', error);
    return [];
  }
};
