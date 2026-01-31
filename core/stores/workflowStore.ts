/**
 * 工作流管理 Store
 * 
 * 职责：
 * - 管理工作流数据
 * - 管理当前选中的工作流
 * - 提供工作流操作接口
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { Workflow } from '../../types';

// ============================================
// 类型定义
// ============================================

export interface WorkflowStore {
  // ========== 数据 ==========
  /** 所有工作流 */
  workflows: Workflow[];
  
  /** 当前选中的工作流 ID */
  selectedWorkflowId: string | null;

  // ========== 查询操作 ==========
  /** 获取所有工作流 */
  getAllWorkflows: () => Workflow[];
  
  /** 获取单个工作流 */
  getWorkflow: (id: string) => Workflow | undefined;
  
  /** 获取当前选中的工作流 */
  getSelectedWorkflow: () => Workflow | undefined;

  // ========== 增删改操作 ==========
  /** 添加工作流 */
  addWorkflow: (workflow: Workflow) => void;
  
  /** 更新工作流 */
  updateWorkflow: (id: string, updates: Partial<Workflow>) => void;
  
  /** 删除工作流 */
  deleteWorkflow: (id: string) => void;
  
  /** 设置所有工作流 */
  setWorkflows: (workflows: Workflow[]) => void;

  // ========== 选择操作 ==========
  /** 选择工作流 */
  selectWorkflow: (id: string | null) => void;
  
  /** 清空选择 */
  clearSelection: () => void;
}

// ============================================
// 创建 Store
// ============================================

export const useWorkflowStore = create<WorkflowStore>()(
  immer((set, get) => ({
    // ========== 初始数据 ==========
    workflows: [],
    selectedWorkflowId: null,

    // ========== 查询操作 ==========
    getAllWorkflows: () => {
      return get().workflows;
    },

    getWorkflow: (id) => {
      return get().workflows.find(workflow => workflow.id === id);
    },

    getSelectedWorkflow: () => {
      const { workflows, selectedWorkflowId } = get();
      if (!selectedWorkflowId) return undefined;
      return workflows.find(workflow => workflow.id === selectedWorkflowId);
    },

    // ========== 增删改操作 ==========
    addWorkflow: (workflow) => set((state) => {
      state.workflows.push(workflow);
    }),

    updateWorkflow: (id, updates) => set((state) => {
      const index = state.workflows.findIndex(workflow => workflow.id === id);
      if (index !== -1) {
        state.workflows[index] = { ...state.workflows[index], ...updates };
      }
    }),

    deleteWorkflow: (id) => set((state) => {
      state.workflows = state.workflows.filter(workflow => workflow.id !== id);
      // 如果删除的是当前选中的工作流，清空选择
      if (state.selectedWorkflowId === id) {
        state.selectedWorkflowId = null;
      }
    }),

    setWorkflows: (workflows) => set((state) => {
      state.workflows = workflows;
    }),

    // ========== 选择操作 ==========
    selectWorkflow: (id) => set((state) => {
      state.selectedWorkflowId = id;
    }),

    clearSelection: () => set((state) => {
      state.selectedWorkflowId = null;
    }),
  }))
);
