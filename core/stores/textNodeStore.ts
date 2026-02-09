/**
 * 文字节点数据管理 Store
 * 
 * 职责：
 * - 管理文字节点的状态（模式、提示词、图片等）
 * - 提供状态更新接口
 * - 不包含任何 UI 逻辑
 * 
 * 技术栈：
 * - Zustand：轻量级状态管理
 * - Immer：不可变数据更新
 * 
 * 架构位置：Core Layer（底层）
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { enableMapSet } from 'immer';
import { TextNodeMode, TextNodeData } from '../../types';

// 启用 Immer MapSet 插件
enableMapSet();

// ============================================
// 类型定义
// ============================================

export interface TextNodeStore {
  // ========== 数据 ==========
  /** 所有文字节点的数据（Map 结构，查找 O(1)） */
  nodes: Map<string, TextNodeData>;

  // ========== 查询操作 ==========
  /** 获取单个节点数据 */
  getNode: (id: string) => TextNodeData | undefined;
  
  /** 检查节点是否存在 */
  hasNode: (id: string) => boolean;

  // ========== 模式管理 ==========
  /** 更新节点模式 */
  updateMode: (id: string, mode: TextNodeMode) => void;

  // ========== 提示词管理 ==========
  /** 更新提示词 */
  updatePrompt: (id: string, prompt: string) => void;
  
  /** 更新分析生成的提示词 */
  updateAnalyzedPrompt: (id: string, analyzedPrompt: string) => void;
  
  /** 更新用户编辑后的提示词 */
  updateEditedPrompt: (id: string, editedPrompt: string) => void;
  
  /** 更新用户输入 */
  updateUserInput: (id: string, userInput: string) => void;
  
  /** 更新 AI 生成的提示词 */
  updateGeneratedPrompt: (id: string, generatedPrompt: string) => void;

  // ========== 图片管理 ==========
  /** 更新输入图片 */
  updateInputImage: (id: string, inputImage: string) => void;

  // ========== 输出节点管理 ==========
  /** 设置输出节点 ID */
  setOutputNodeId: (id: string, outputNodeId: string) => void;
  
  /** 清除输出节点 ID */
  clearOutputNodeId: (id: string) => void;

  // ========== 状态管理 ==========
  /** 开始分析图片 */
  startAnalyzing: (id: string, requestId: string) => void;
  
  /** 完成分析图片 */
  finishAnalyzing: (id: string, analyzedPrompt: string) => void;
  
  /** 分析失败 */
  failAnalyzing: (id: string, error: string) => void;
  
  /** 开始生成提示词 */
  startGenerating: (id: string, requestId: string) => void;
  
  /** 完成生成提示词 */
  finishGenerating: (id: string, generatedPrompt: string) => void;
  
  /** 生成失败 */
  failGenerating: (id: string, error: string) => void;

  // ========== 节点生命周期 ==========
  /** 初始化节点 */
  initNode: (id: string, data?: Partial<TextNodeData>) => void;
  
  /** 重置节点 */
  resetNode: (id: string) => void;
  
  /** 删除节点 */
  deleteNode: (id: string) => void;
}

// ============================================
// 创建 Store
// ============================================

export const useTextNodeStore = create<TextNodeStore>()(
  immer((set, get) => ({
    // ========== 初始数据 ==========
    nodes: new Map(),

    // ========== 查询操作 ==========
    getNode: (id) => {
      return get().nodes.get(id);
    },

    hasNode: (id) => {
      return get().nodes.has(id);
    },

    // ========== 模式管理 ==========
    updateMode: (id, mode) => set((state) => {
      const node = state.nodes.get(id);
      if (node) {
        node.mode = mode;
      }
    }),

    // ========== 提示词管理 ==========
    updatePrompt: (id, prompt) => set((state) => {
      const node = state.nodes.get(id);
      if (node) {
        node.prompt = prompt;
      }
    }),

    updateAnalyzedPrompt: (id, analyzedPrompt) => set((state) => {
      const node = state.nodes.get(id);
      if (node) {
        node.analyzedPrompt = analyzedPrompt;
      }
    }),

    updateEditedPrompt: (id, editedPrompt) => set((state) => {
      const node = state.nodes.get(id);
      if (node) {
        node.editedPrompt = editedPrompt;
      }
    }),

    updateUserInput: (id, userInput) => set((state) => {
      const node = state.nodes.get(id);
      if (node) {
        node.userInput = userInput;
      }
    }),

    updateGeneratedPrompt: (id, generatedPrompt) => set((state) => {
      const node = state.nodes.get(id);
      if (node) {
        node.generatedPrompt = generatedPrompt;
      }
    }),

    // ========== 图片管理 ==========
    updateInputImage: (id, inputImage) => set((state) => {
      const node = state.nodes.get(id);
      if (node) {
        node.inputImage = inputImage;
      }
    }),

    // ========== 输出节点管理 ==========
    setOutputNodeId: (id, outputNodeId) => set((state) => {
      const node = state.nodes.get(id);
      if (node) {
        node.outputNodeId = outputNodeId;
      }
    }),

    clearOutputNodeId: (id) => set((state) => {
      const node = state.nodes.get(id);
      if (node) {
        node.outputNodeId = undefined;
      }
    }),

    // ========== 状态管理 ==========
    startAnalyzing: (id, requestId) => set((state) => {
      const node = state.nodes.get(id);
      if (node) {
        node.isAnalyzing = true;
        node.pendingRequestId = requestId;
        node.error = undefined;
      }
    }),

    finishAnalyzing: (id, analyzedPrompt) => set((state) => {
      const node = state.nodes.get(id);
      if (node) {
        node.isAnalyzing = false;
        node.analyzedPrompt = analyzedPrompt;
        node.editedPrompt = analyzedPrompt; // 初始时编辑后的提示词等于分析生成的提示词
        node.pendingRequestId = undefined;
        node.error = undefined;
      }
    }),

    failAnalyzing: (id, error) => set((state) => {
      const node = state.nodes.get(id);
      if (node) {
        node.isAnalyzing = false;
        node.error = error;
        node.pendingRequestId = undefined;
      }
    }),

    startGenerating: (id, requestId) => set((state) => {
      const node = state.nodes.get(id);
      if (node) {
        node.isGenerating = true;
        node.pendingRequestId = requestId;
        node.error = undefined;
      }
    }),

    finishGenerating: (id, generatedPrompt) => set((state) => {
      const node = state.nodes.get(id);
      if (node) {
        node.isGenerating = false;
        node.generatedPrompt = generatedPrompt;
        node.pendingRequestId = undefined;
        node.error = undefined;
      }
    }),

    failGenerating: (id, error) => set((state) => {
      const node = state.nodes.get(id);
      if (node) {
        node.isGenerating = false;
        node.error = error;
        node.pendingRequestId = undefined;
      }
    }),

    // ========== 节点生命周期 ==========
    initNode: (id, data = {}) => set((state) => {
      if (!state.nodes.has(id)) {
        state.nodes.set(id, {
          mode: TextNodeMode.INITIAL,
          prompt: '',
          model: 'gemini-2.0-flash-001', // 使用稳定版本
          ...data,
        });
      }
    }),

    resetNode: (id) => set((state) => {
      const node = state.nodes.get(id);
      if (node) {
        // 保留 model，重置其他字段
        const model = node.model;
        state.nodes.set(id, {
          mode: TextNodeMode.INITIAL,
          prompt: '',
          model,
        });
      }
    }),

    deleteNode: (id) => set((state) => {
      state.nodes.delete(id);
    }),
  }))
);

