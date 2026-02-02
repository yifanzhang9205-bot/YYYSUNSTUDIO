/**
 * React Flow 风格主题配置
 * 
 * 用途：
 * - 统一管理所有颜色
 * - 支持亮色/暗色切换
 * - 方便后续维护
 */

export const lightTheme = {
  // 背景
  background: '#ffffff',
  backgroundPattern: '#f3f4f6',
  
  // 节点
  nodeBg: '#ffffff',
  nodeBorder: '#e5e7eb',
  nodeText: '#1f2937',
  nodeTextSecondary: '#6b7280',
  nodeShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
  
  // 连接线
  edge: '#b1b1b7',
  edgeHover: '#6b7280',
  edgeSelected: '#0041d0',
  
  // 控制栏
  controlBg: '#ffffff',
  controlBorder: '#e5e7eb',
  controlText: '#374151',
  controlHover: '#f3f4f6',
  
  // 主色
  primary: '#0041d0',
  primaryHover: '#0033a6',
  secondary: '#ff0072',
  secondaryHover: '#cc005b',
  
  // 状态色
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
};

export const darkTheme = {
  // 背景
  background: '#1a1a1a',
  backgroundPattern: '#2d2d2d',
  
  // 节点
  nodeBg: '#2d2d2d',
  nodeBorder: '#404040',
  nodeText: '#ffffff',
  nodeTextSecondary: '#9ca3af',
  nodeShadow: '0 4px 6px -1px rgb(0 0 0 / 0.3)',
  
  // 连接线
  edge: '#555555',
  edgeHover: '#777777',
  edgeSelected: '#3b82f6',
  
  // 控制栏
  controlBg: '#2d2d2d',
  controlBorder: '#404040',
  controlText: '#e5e7eb',
  controlHover: '#404040',
  
  // 主色
  primary: '#3b82f6',
  primaryHover: '#2563eb',
  secondary: '#ec4899',
  secondaryHover: '#db2777',
  
  // 状态色
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
};

// 默认使用亮色主题
export const theme = lightTheme;

// 导出类型
export type Theme = typeof lightTheme;
