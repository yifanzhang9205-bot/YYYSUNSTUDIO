/**
 * useTextNodeActions Hook
 * 
 * 职责：封装文字节点的所有操作逻辑
 * 
 * 架构位置：Hooks Layer（交互层）
 * 依赖：Core Layer（Stores、Utils）
 * 被依赖：UI Layer（TextNode 组件）
 * 
 * 功能：
 * - 模式切换
 * - 提示词更新
 * - 图片上传和分析
 * - 提示词生成
 * - 自动创建输出节点
 * - 传递提示词给下游
 */

import { useCallback, useRef } from 'react';
import { useTextNodeStore } from '../core/stores/textNodeStore';
import { useNodeStore } from '../core/stores/nodeStore';
import { useConnectionStore } from '../core/stores/connectionStore';
import { TextNodeMode, NodeType, NodeStatus } from '../types';

/**
 * useTextNodeActions Hook
 * 
 * @returns 文字节点的所有操作方法
 */
export const useTextNodeActions = () => {
  // 请求取消控制器（用于取消旧请求）
  const abortControllersRef = useRef<Map<string, AbortController>>(new Map());
  
  // Blob URL 管理（用于清理）
  const blobUrlsRef = useRef<Map<string, string[]>>(new Map());
  
  /**
   * 切换节点模式
   */
  const switchMode = useCallback((nodeId: string, mode: TextNodeMode) => {
    // 取消当前节点的所有请求
    const controller = abortControllersRef.current.get(nodeId);
    if (controller) {
      controller.abort();
      abortControllersRef.current.delete(nodeId);
    }
    
    // 更新模式
    useTextNodeStore.getState().updateMode(nodeId, mode);
    
    // 如果切换到文生图模式，自动创建输出节点
    if (mode === TextNodeMode.TEXT_TO_IMAGE) {
      createOutputNode(nodeId);
    }
  }, []);
  
  /**
   * 更新提示词
   */
  const updatePrompt = useCallback((nodeId: string, prompt: string) => {
    useTextNodeStore.getState().updatePrompt(nodeId, prompt);
  }, []);
  
  /**
   * 上传图片到 IndexedDB
   */
  const uploadImage = useCallback(async (nodeId: string, file: File): Promise<void> => {
    try {
      // 1. 验证文件类型
      if (!file.type.startsWith('image/')) {
        throw new Error('只支持图片文件');
      }
      
      // 2. 验证文件大小（最大 10MB）
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('图片大小不能超过 10MB');
      }
      
      // 3. 创建 Blob URL（零拷贝）
      const blobUrl = URL.createObjectURL(file);
      
      // 4. 保存 Blob URL 引用（用于后续清理）
      const urls = blobUrlsRef.current.get(nodeId) || [];
      urls.push(blobUrl);
      blobUrlsRef.current.set(nodeId, urls);
      
      // 5. 更新 Store
      useTextNodeStore.getState().updateInputImage(nodeId, blobUrl);
      
      // 6. 异步保存到 IndexedDB（不阻塞 UI）
      const { saveFileToIndexedDBAsync } = await import('../services/blobStorage');
      saveFileToIndexedDBAsync(nodeId, file).catch(error => {
        console.error('[TextNode] 异步保存图片失败:', error);
      });
      
    } catch (error: any) {
      useTextNodeStore.getState().failAnalyzing(nodeId, error.message);
      throw error;
    }
  }, []);
  
  /**
   * 分析图片生成提示词
   */
  const analyzeImage = useCallback(async (nodeId: string): Promise<void> => {
    const nodeData = useTextNodeStore.getState().getNode(nodeId);
    if (!nodeData || !nodeData.inputImage) {
      throw new Error('请先上传图片');
    }
    
    // 取消旧请求
    const oldController = abortControllersRef.current.get(nodeId);
    if (oldController) {
      oldController.abort();
    }
    
    // 创建新的 AbortController
    const controller = new AbortController();
    abortControllersRef.current.set(nodeId, controller);
    
    // 生成请求 ID
    const requestId = `analyze-${Date.now()}`;
    
    try {
      // 开始分析
      useTextNodeStore.getState().startAnalyzing(nodeId, requestId);
      
      // 转换图片为 Base64（如果是 Blob URL）
      const { ensureBase64 } = await import('../services/blobStorage');
      const imageBase64 = await ensureBase64(nodeData.inputImage);
      
      let analyzedPrompt: string;
      
      // API 选择逻辑：Coze → Gemini
      try {
        // 尝试使用 Coze API
        const { analyzeImageForPrompt: analyzeWithCoze, isCozeAvailable } = await import('../services/cozeService');
        
        if (isCozeAvailable()) {
          console.log('[TextNode] 使用 Coze API 分析图片');
          analyzedPrompt = await analyzeWithCoze(imageBase64, controller.signal);
        } else {
          throw new Error('COZE_NOT_AVAILABLE');
        }
      } catch (cozeError: any) {
        // 如果 Coze 不支持图片或不可用，使用 Gemini 备用
        if (cozeError.message === 'COZE_IMAGE_NOT_SUPPORTED' || cozeError.message === 'COZE_NOT_AVAILABLE') {
          console.log('[TextNode] Coze 不可用，使用 Gemini API 备用');
          
          const { analyzeImageForPrompt: analyzeWithGemini } = await import('../services/geminiService');
          analyzedPrompt = await analyzeWithGemini(
            imageBase64,
            nodeData.model || 'gemini-2.0-flash-001',
            controller.signal
          );
        } else {
          throw cozeError;
        }
      }
      
      // 检查请求是否被取消
      if (controller.signal.aborted) {
        return;
      }
      
      // 完成分析
      useTextNodeStore.getState().finishAnalyzing(nodeId, analyzedPrompt);
      
      // 清理 AbortController
      abortControllersRef.current.delete(nodeId);
      
    } catch (error: any) {
      // 如果是取消错误，忽略
      if (error.name === 'AbortError') {
        return;
      }
      
      // 分析失败
      useTextNodeStore.getState().failAnalyzing(nodeId, error.message);
      
      // 清理 AbortController
      abortControllersRef.current.delete(nodeId);
      
      throw error;
    }
  }, []);
  
  /**
   * 生成提示词（使用 Coze API）
   */
  const generatePrompt = useCallback(async (nodeId: string): Promise<void> => {
    const nodeData = useTextNodeStore.getState().getNode(nodeId);
    if (!nodeData || !nodeData.userInput) {
      throw new Error('请先输入描述');
    }
    
    // 取消旧请求
    const oldController = abortControllersRef.current.get(nodeId);
    if (oldController) {
      oldController.abort();
    }
    
    // 创建新的 AbortController
    const controller = new AbortController();
    abortControllersRef.current.set(nodeId, controller);
    
    // 生成请求 ID
    const requestId = `generate-${Date.now()}`;
    
    try {
      // 开始生成
      useTextNodeStore.getState().startGenerating(nodeId, requestId);
      
      // 检查 Coze API 是否可用
      const { isCozeAvailable, generatePromptFromDescription } = await import('../services/cozeService');
      
      if (!isCozeAvailable()) {
        throw new Error('AI 导演功能尚未配置，请先配置 Coze API Key');
      }
      
      // 调用 Coze API 生成提示词
      const generatedPrompt = await generatePromptFromDescription(
        nodeData.userInput,
        controller.signal
      );
      
      // 检查请求是否被取消
      if (controller.signal.aborted) {
        return;
      }
      
      // 完成生成
      useTextNodeStore.getState().finishGenerating(nodeId, generatedPrompt);
      
      // 清理 AbortController
      abortControllersRef.current.delete(nodeId);
      
    } catch (error: any) {
      // 如果是取消错误，忽略
      if (error.name === 'AbortError') {
        return;
      }
      
      // 生成失败
      useTextNodeStore.getState().failGenerating(nodeId, error.message);
      
      // 清理 AbortController
      abortControllersRef.current.delete(nodeId);
      
      throw error;
    }
  }, []);
  
  /**
   * 创建输出节点（文生图模式）
   * 返回创建的节点 ID
   */
  const createOutputNode = useCallback(async (nodeId: string): Promise<string | undefined> => {
    const nodeData = useTextNodeStore.getState().getNode(nodeId);
    
    // 检查是否已经创建过输出节点
    if (nodeData?.outputNodeId) {
      console.log('[TextNode] 输出节点已存在，跳过创建');
      return nodeData.outputNodeId;
    }
    
    // 获取当前节点
    const currentNode = useNodeStore.getState().getNode(nodeId);
    if (!currentNode) {
      console.error('[TextNode] 节点不存在:', nodeId);
      return undefined;
    }
    
    // 计算输出节点位置（右侧 500px）
    const outputX = currentNode.x + (currentNode.width || 420) + 100;
    const outputY = currentNode.y;
    
    // 创建图片节点
    const outputNodeId = `n-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const outputNode = {
      id: outputNodeId,
      type: NodeType.IMAGE_GENERATOR,
      x: outputX,
      y: outputY,
      width: 420,
      height: 480,
      title: '生成的图片',
      status: NodeStatus.IDLE,
      data: {
        prompt: '',
        model: nodeData?.model || 'imagen-3.0-generate-001',
        imageCount: 1,
        aspectRatio: '1:1',
        resolution: '1024x1024',
      },
      inputs: [nodeId],
    };
    
    // 添加节点到画布
    useNodeStore.getState().addNode(outputNode);
    
    // 建立连接
    useConnectionStore.getState().addConnection({
      from: nodeId,
      to: outputNodeId,
    });
    
    // 保存输出节点 ID
    useTextNodeStore.getState().setOutputNodeId(nodeId, outputNodeId);
    
    console.log('[TextNode] 自动创建输出节点:', outputNodeId);
    
    return outputNodeId;
  }, []);
  
  /**
   * 追加 AI 生成的内容到文本框（不覆盖已有内容）
   */
  const appendPromptFromAI = useCallback((nodeId: string, aiGeneratedContent: string) => {
    const nodeData = useTextNodeStore.getState().getNode(nodeId);
    const currentPrompt = nodeData?.prompt || '';
    
    // 如果已有内容，添加换行符后追加
    const newPrompt = currentPrompt 
      ? `${currentPrompt}\n\n${aiGeneratedContent}`
      : aiGeneratedContent;
    
    // 更新 Store
    useTextNodeStore.getState().updatePrompt(nodeId, newPrompt);
    
    console.log('[TextNode] AI 生成的内容已追加到文本框');
  }, []);
  
  /**
   * 传递提示词给下游节点
   */
  const passPromptToDownstream = useCallback((nodeId: string, prompt?: string) => {
    // 如果没有传递 prompt 参数，从 Store 获取
    const finalPrompt = prompt || useTextNodeStore.getState().getNode(nodeId)?.prompt;
    
    if (!finalPrompt) {
      console.warn('[TextNode] 提示词为空，无法传递');
      // TODO: 显示错误提示
      return;
    }
    
    // 获取所有下游连接
    const connections = useConnectionStore.getState().connections;
    const downstreamNodeIds = connections
      .filter(conn => conn.from === nodeId)
      .map(conn => conn.to);
    
    if (downstreamNodeIds.length === 0) {
      console.warn('[TextNode] 没有下游节点');
      // TODO: 显示提示（可选）
      return;
    }
    
    // 更新下游节点的 prompt 字段
    downstreamNodeIds.forEach(downstreamId => {
      useNodeStore.getState().updateNodeData(downstreamId, {
        prompt: finalPrompt,
      });
    });
    
    console.log('[TextNode] 提示词已传递给下游节点:', downstreamNodeIds);
    // TODO: 显示成功提示
  }, []);
  
  /**
   * 重置节点
   */
  const resetNode = useCallback((nodeId: string) => {
    // 取消所有请求
    const controller = abortControllersRef.current.get(nodeId);
    if (controller) {
      controller.abort();
      abortControllersRef.current.delete(nodeId);
    }
    
    // 清理 Blob URLs
    const urls = blobUrlsRef.current.get(nodeId);
    if (urls) {
      urls.forEach(url => {
        try {
          URL.revokeObjectURL(url);
        } catch (error) {
          console.error('[TextNode] 清理 Blob URL 失败:', error);
        }
      });
      blobUrlsRef.current.delete(nodeId);
    }
    
    // 重置 Store
    useTextNodeStore.getState().resetNode(nodeId);
  }, []);
  
  /**
   * 清理节点资源（组件销毁时调用）
   */
  const cleanupNode = useCallback((nodeId: string) => {
    // 取消所有请求
    const controller = abortControllersRef.current.get(nodeId);
    if (controller) {
      controller.abort();
      abortControllersRef.current.delete(nodeId);
    }
    
    // 清理 Blob URLs
    const urls = blobUrlsRef.current.get(nodeId);
    if (urls) {
      urls.forEach(url => {
        try {
          URL.revokeObjectURL(url);
        } catch (error) {
          console.error('[TextNode] 清理 Blob URL 失败:', error);
        }
      });
      blobUrlsRef.current.delete(nodeId);
    }
    
    // 删除节点数据
    useTextNodeStore.getState().deleteNode(nodeId);
  }, []);
  
  return {
    switchMode,
    updatePrompt,
    uploadImage,
    analyzeImage,
    generatePrompt,
    createOutputNode,
    passPromptToDownstream,
    appendPromptFromAI,
    resetNode,
    cleanupNode,
  };
};

