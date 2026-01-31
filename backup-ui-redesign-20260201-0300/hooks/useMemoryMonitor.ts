/**
 * 内存监控 Hook
 * 
 * 职责：
 * - 监控应用内存占用
 * - 定期输出内存统计
 * - 检测内存泄漏
 */

import { useEffect } from 'react';

interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

interface PerformanceWithMemory extends Performance {
  memory?: MemoryInfo;
}

/**
 * 内存监控 Hook
 * 
 * @param interval 监控间隔（毫秒），默认 5000ms
 * @param enabled 是否启用监控，默认 true
 */
export const useMemoryMonitor = (interval = 5000, enabled = true) => {
  useEffect(() => {
    if (!enabled) return;
    
    // 检查浏览器是否支持 memory API
    const perf = performance as PerformanceWithMemory;
    if (!perf.memory) {
      console.warn('[内存监控] 浏览器不支持 performance.memory API');
      console.warn('[内存监控] 请使用 Chrome 并启动时添加 --enable-precise-memory-info');
      return;
    }
    
    let lastUsed = 0;
    let maxUsed = 0;
    
    const logMemory = () => {
      const memory = perf.memory!;
      const usedMB = memory.usedJSHeapSize / 1024 / 1024;
      const totalMB = memory.totalJSHeapSize / 1024 / 1024;
      const limitMB = memory.jsHeapSizeLimit / 1024 / 1024;
      
      // 计算增长
      const growth = usedMB - lastUsed;
      lastUsed = usedMB;
      
      // 记录最大值
      if (usedMB > maxUsed) {
        maxUsed = usedMB;
      }
      
      // 计算使用率
      const usagePercent = (usedMB / limitMB) * 100;
      
      // 根据使用率选择日志级别
      if (usagePercent > 80) {
        console.error('[内存监控] ⚠️ 内存占用过高！', {
          used: `${usedMB.toFixed(2)} MB`,
          total: `${totalMB.toFixed(2)} MB`,
          limit: `${limitMB.toFixed(2)} MB`,
          usage: `${usagePercent.toFixed(1)}%`,
          growth: `${growth > 0 ? '+' : ''}${growth.toFixed(2)} MB`,
          max: `${maxUsed.toFixed(2)} MB`,
        });
      } else if (usagePercent > 60) {
        console.warn('[内存监控] ⚠️ 内存占用较高', {
          used: `${usedMB.toFixed(2)} MB`,
          total: `${totalMB.toFixed(2)} MB`,
          limit: `${limitMB.toFixed(2)} MB`,
          usage: `${usagePercent.toFixed(1)}%`,
          growth: `${growth > 0 ? '+' : ''}${growth.toFixed(2)} MB`,
          max: `${maxUsed.toFixed(2)} MB`,
        });
      } else {
        console.log('[内存监控]', {
          used: `${usedMB.toFixed(2)} MB`,
          total: `${totalMB.toFixed(2)} MB`,
          limit: `${limitMB.toFixed(2)} MB`,
          usage: `${usagePercent.toFixed(1)}%`,
          growth: `${growth > 0 ? '+' : ''}${growth.toFixed(2)} MB`,
          max: `${maxUsed.toFixed(2)} MB`,
        });
      }
      
      // 检测内存泄漏（连续增长）
      if (growth > 50) {
        console.warn('[内存监控] 🔥 检测到可能的内存泄漏！增长:', `${growth.toFixed(2)} MB`);
      }
    };
    
    // 立即执行一次
    logMemory();
    
    // 定期监控
    const timer = setInterval(logMemory, interval);
    
    return () => clearInterval(timer);
  }, [interval, enabled]);
};

/**
 * 手动触发垃圾回收（仅开发环境）
 * 
 * 需要启动 Chrome 时添加 --js-flags="--expose-gc"
 */
export const triggerGC = () => {
  if (typeof window !== 'undefined' && 'gc' in window) {
    console.log('[GC] 手动触发垃圾回收');
    (window as any).gc();
    
    // 等待 GC 完成后输出内存
    setTimeout(() => {
      const perf = performance as PerformanceWithMemory;
      if (perf.memory) {
        const usedMB = perf.memory.usedJSHeapSize / 1024 / 1024;
        console.log('[GC] 垃圾回收完成，当前内存:', `${usedMB.toFixed(2)} MB`);
      }
    }, 100);
  } else {
    console.warn('[GC] 需要启动 Chrome 时添加 --js-flags="--expose-gc"');
    console.warn('[GC] 例如：chrome.exe --js-flags="--expose-gc"');
  }
};

/**
 * 获取当前内存使用情况
 */
export const getMemoryUsage = (): {
  used: number;
  total: number;
  limit: number;
  usagePercent: number;
} | null => {
  const perf = performance as PerformanceWithMemory;
  if (!perf.memory) {
    return null;
  }
  
  const memory = perf.memory;
  return {
    used: memory.usedJSHeapSize / 1024 / 1024,
    total: memory.totalJSHeapSize / 1024 / 1024,
    limit: memory.jsHeapSizeLimit / 1024 / 1024,
    usagePercent: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
  };
};
