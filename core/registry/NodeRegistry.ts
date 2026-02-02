/**
 * 节点注册表
 * 
 * 职责：
 * - 统一管理所有节点类型
 * - 提供节点定义（名称、图标、默认值）
 * - 新增节点只需注册一次
 * 
 * 使用方式：
 * 1. 注册节点：nodeRegistry.register({ type, name, ... })
 * 2. 获取定义：nodeRegistry.get(NodeType.IMAGE_GENERATOR)
 * 3. 获取所有：nodeRegistry.getAll()
 */

import { NodeType, NodeStatus, AppNode } from '../../types';
import type { LucideIcon } from 'lucide-react';

// ============================================
// 类型定义
// ============================================

/**
 * 节点定义接口
 */
export interface NodeDefinition {
  /** 节点类型 */
  type: NodeType;
  
  /** 中文名称 */
  name: string;
  
  /** 图标组件（Lucide React） */
  icon?: LucideIcon;
  
  /** 图标名称（字符串，用于动态导入） */
  iconName?: string;
  
  /** 默认宽度 */
  defaultWidth: number;
  
  /** 默认高度 */
  defaultHeight: number;
  
  /** 默认数据 */
  defaultData: Partial<AppNode['data']>;
  
  /** 分类（用于菜单分组） */
  category?: 'basic' | 'story' | 'advanced' | 'deprecated';
  
  /** 是否已废弃 */
  deprecated?: boolean;
  
  /** 描述 */
  description?: string;
}

/**
 * 节点创建选项
 */
export interface CreateNodeOptions {
  /** 节点 ID（可选，不提供则自动生成） */
  id?: string;
  
  /** X 坐标 */
  x: number;
  
  /** Y 坐标 */
  y: number;
  
  /** 自定义标题（可选） */
  title?: string;
  
  /** 自定义数据（可选，会合并到默认数据） */
  data?: Partial<AppNode['data']>;
  
  /** 输入节点 ID 列表 */
  inputs?: string[];
}

// ============================================
// 节点注册表类
// ============================================

class NodeRegistry {
  private registry = new Map<NodeType, NodeDefinition>();

  /**
   * 注册节点类型
   */
  register(definition: NodeDefinition): void {
    this.registry.set(definition.type, definition);
  }

  /**
   * 批量注册节点类型
   */
  registerAll(definitions: NodeDefinition[]): void {
    definitions.forEach(def => this.register(def));
  }

  /**
   * 获取节点定义
   */
  get(type: NodeType): NodeDefinition | undefined {
    return this.registry.get(type);
  }

  /**
   * 获取所有节点定义
   */
  getAll(): NodeDefinition[] {
    return Array.from(this.registry.values());
  }

  /**
   * 按分类获取节点定义
   */
  getByCategory(category: NodeDefinition['category']): NodeDefinition[] {
    return this.getAll().filter(def => def.category === category);
  }

  /**
   * 获取非废弃的节点定义
   */
  getActive(): NodeDefinition[] {
    return this.getAll().filter(def => !def.deprecated);
  }

  /**
   * 检查节点类型是否已注册
   */
  has(type: NodeType): boolean {
    return this.registry.has(type);
  }

  /**
   * 创建节点实例
   */
  createNode(type: NodeType, options: CreateNodeOptions): AppNode | null {
    const definition = this.get(type);
    if (!definition) {
      console.error(`节点类型未注册: ${type}`);
      return null;
    }

    const id = options.id || `n-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    return {
      id,
      type,
      x: options.x,
      y: options.y,
      width: definition.defaultWidth,
      height: definition.defaultHeight,
      title: options.title || definition.name,
      status: NodeStatus.IDLE,
      data: {
        ...definition.defaultData,
        ...options.data,
      },
      inputs: options.inputs || [],
    };
  }
}

// ============================================
// 导出单例
// ============================================

export const nodeRegistry = new NodeRegistry();

// ============================================
// 注册所有节点类型
// ============================================

/**
 * 初始化节点注册表
 * 注意：这个函数需要在应用启动时调用一次
 */
export function initializeNodeRegistry(): void {
  nodeRegistry.registerAll([
    // ========== 基础节点 ==========
    {
      type: NodeType.PROMPT_INPUT,
      name: '创意描述',
      iconName: 'Type',
      defaultWidth: 420,
      defaultHeight: 200,
      defaultData: {
        prompt: '',
      },
      category: 'basic',
      description: '文本输入节点，用于输入提示词',
    },
    {
      type: NodeType.IMAGE_GENERATOR,
      name: '文字生图',
      iconName: 'Image',
      defaultWidth: 420,
      defaultHeight: 480,
      defaultData: {
        prompt: '',
        model: 'imagen-3.0-generate-001',
        imageCount: 1,
        aspectRatio: '1:1',
        resolution: '1024x1024',
      },
      category: 'basic',
      description: 'AI 图片生成节点',
    },
    {
      type: NodeType.VIDEO_GENERATOR,
      name: '文生视频',
      iconName: 'Video',
      defaultWidth: 420,
      defaultHeight: 480,
      defaultData: {
        prompt: '',
        model: 'veo-001',
        videoCount: 1,
        aspectRatio: '16:9',
        resolution: '720p',
        duration: 5,
        generationMode: 'DEFAULT',
      },
      category: 'basic',
      description: 'AI 视频生成节点',
    },
    {
      type: NodeType.VIDEO_ANALYZER,
      name: '视频分析',
      iconName: 'ScanFace',
      defaultWidth: 420,
      defaultHeight: 320,
      defaultData: {
        analysis: '',
      },
      category: 'basic',
      description: '分析视频内容',
    },
    {
      type: NodeType.IMAGE_EDITOR,
      name: '图片编辑',
      iconName: 'Brush',
      defaultWidth: 420,
      defaultHeight: 480,
      defaultData: {
        prompt: '',
      },
      category: 'basic',
      description: '编辑图片',
    },
    {
      type: NodeType.AUDIO_GENERATOR,
      name: '音频生成',
      iconName: 'Music',
      defaultWidth: 420,
      defaultHeight: 200,
      defaultData: {
        prompt: '',
        duration: 30,
      },
      category: 'basic',
      description: 'AI 音频生成节点',
    },

    // ========== 故事创作节点 ==========
    {
      type: NodeType.SCRIPT_NODE,
      name: '剧本节点',
      iconName: 'Film',
      defaultWidth: 420,
      defaultHeight: 600,
      defaultData: {
        storyData: undefined,
      },
      category: 'story',
      description: 'AI 剧本生成和管理',
    },
    {
      type: NodeType.SHOT_IMAGE_GENERATOR,
      name: '分镜图生成',
      iconName: 'Camera',
      defaultWidth: 420,
      defaultHeight: 480,
      defaultData: {
        prompt: '',
        model: 'imagen-3.0-generate-001',
        imageCount: 1,
      },
      category: 'story',
      description: '生成分镜图',
    },

    // ========== 高级工具节点 ==========
    {
      type: NodeType.MULTI_ANGLE_CAMERA,
      name: '多角度相机',
      iconName: 'LayoutTemplate',
      defaultWidth: 420,
      defaultHeight: 800,
      defaultData: {
        horizontalAngle: 0,
        verticalAngle: 0,
        prompt: '',
        model: 'imagen-3.0-generate-001',
      },
      category: 'advanced',
      description: '3D 视角控制和多角度图像生成',
    },
    {
      type: NodeType.GRID_SPLITTER,
      name: '九宫格处理',
      iconName: 'Grid3X3',
      defaultWidth: 630,   // 🔥 21:9 比例
      defaultHeight: 270,  // 🔥 21:9 比例
      defaultData: {
        gridImages: [],
        selectedGridIndex: undefined,
      },
      category: 'advanced',
      description: '自动切割和选择九宫格图片',
    },
  ]);
}

// ============================================
// 工具函数
// ============================================

/**
 * 生成唯一的节点 ID
 */
export function generateNodeId(): string {
  return `n-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 获取节点的中文名称
 */
export function getNodeName(type: NodeType): string {
  const definition = nodeRegistry.get(type);
  return definition?.name || '未知节点';
}

/**
 * 获取节点的图标名称
 */
export function getNodeIconName(type: NodeType): string | undefined {
  const definition = nodeRegistry.get(type);
  return definition?.iconName;
}

/**
 * 检查节点是否已废弃
 */
export function isNodeDeprecated(type: NodeType): boolean {
  const definition = nodeRegistry.get(type);
  return definition?.deprecated || false;
}
