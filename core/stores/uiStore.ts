/**
 * UI 状态管理 Store
 * 
 * 职责：
 * - 管理全局 UI 面板的开关状态
 * - 管理加载状态
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

// ============================================
// 类型定义
// ============================================

export interface UIStore {
  // ========== 数据 ==========
  /** 聊天面板是否打开 */
  isChatOpen: boolean;
  
  /** 草图编辑器是否打开 */
  isSketchEditorOpen: boolean;
  
  /** 多帧面板是否打开 */
  isMultiFrameOpen: boolean;
  
  /** 音乐工作室是否打开 */
  isSonicStudioOpen: boolean;
  
  /** 设置面板是否打开 */
  isSettingsOpen: boolean;
  
  /** 应用是否已加载 */
  isLoaded: boolean;
  
  /** 正在编辑的组 ID（双击改名功能）*/
  editingGroupId: string | null;

  // ========== 操作 ==========
  /** 切换聊天面板 */
  toggleChat: () => void;
  
  /** 设置聊天面板状态 */
  setChatOpen: (open: boolean) => void;
  
  /** 切换草图编辑器 */
  toggleSketchEditor: () => void;
  
  /** 设置草图编辑器状态 */
  setSketchEditorOpen: (open: boolean) => void;
  
  /** 切换多帧面板 */
  toggleMultiFrame: () => void;
  
  /** 设置多帧面板状态 */
  setMultiFrameOpen: (open: boolean) => void;
  
  /** 切换音乐工作室 */
  toggleSonicStudio: () => void;
  
  /** 设置音乐工作室状态 */
  setSonicStudioOpen: (open: boolean) => void;
  
  /** 切换设置面板 */
  toggleSettings: () => void;
  
  /** 设置设置面板状态 */
  setSettingsOpen: (open: boolean) => void;
  
  /** 设置加载状态 */
  setLoaded: (loaded: boolean) => void;
  
  /** 关闭所有面板 */
  closeAllPanels: () => void;
  
  /** 设置正在编辑的组 ID */
  setEditingGroupId: (id: string | null) => void;
}

// ============================================
// 创建 Store
// ============================================
// ============================================

export const useUIStore = create<UIStore>()(
  immer((set) => ({
    // ========== 初始数据 ==========
    isChatOpen: false,
    isSketchEditorOpen: false,
    isMultiFrameOpen: false,
    isSonicStudioOpen: false,
    isSettingsOpen: false,
    isLoaded: false,
    editingGroupId: null,

    // ========== 操作 ==========
    toggleChat: () => set((state) => {
      state.isChatOpen = !state.isChatOpen;
    }),

    setChatOpen: (open) => set((state) => {
      state.isChatOpen = open;
    }),

    toggleSketchEditor: () => set((state) => {
      state.isSketchEditorOpen = !state.isSketchEditorOpen;
    }),

    setSketchEditorOpen: (open) => set((state) => {
      state.isSketchEditorOpen = open;
    }),

    toggleMultiFrame: () => set((state) => {
      state.isMultiFrameOpen = !state.isMultiFrameOpen;
    }),

    setMultiFrameOpen: (open) => set((state) => {
      state.isMultiFrameOpen = open;
    }),

    toggleSonicStudio: () => set((state) => {
      state.isSonicStudioOpen = !state.isSonicStudioOpen;
    }),

    setSonicStudioOpen: (open) => set((state) => {
      state.isSonicStudioOpen = open;
    }),

    toggleSettings: () => set((state) => {
      state.isSettingsOpen = !state.isSettingsOpen;
    }),

    setSettingsOpen: (open) => set((state) => {
      state.isSettingsOpen = open;
    }),

    setLoaded: (loaded) => set((state) => {
      state.isLoaded = loaded;
    }),

    closeAllPanels: () => set((state) => {
      state.isChatOpen = false;
      state.isSketchEditorOpen = false;
      state.isMultiFrameOpen = false;
      state.isSonicStudioOpen = false;
      state.isSettingsOpen = false;
    }),

    setEditingGroupId: (id) => set((state) => {
      state.editingGroupId = id;
    }),
  }))
);
