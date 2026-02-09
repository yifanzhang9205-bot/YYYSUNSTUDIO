/**
 * TextNodeReverse - 图片反推提示词模式
 * 
 * 功能：
 * 1. 无输入连接时显示上传按钮
 * 2. 有输入连接时显示输入图片
 * 3. 点击"生成提示词"按钮调用 AI 分析
 * 4. 显示生成的提示词并支持编辑
 * 5. 点击"生成"按钮传递提示词给下游节点
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Upload, Loader2, ArrowLeft } from 'lucide-react';
import { useTextNodeStore } from '../../core/stores/textNodeStore';
import { useTextNodeActions } from '../../hooks/useTextNodeActions';
import { useNodeStore } from '../../core/stores/nodeStore';
import { useConnectionStore } from '../../core/stores/connectionStore';
import { TextNodeMode } from '../../types';

interface TextNodeReverseProps {
  nodeId: string;
}

export const TextNodeReverse: React.FC<TextNodeReverseProps> = React.memo(({
  nodeId,
}) => {
  // 从 Store 获取节点数据
  const nodeData = useTextNodeStore(state => state.getNode(nodeId));
  const node = useNodeStore(state => state.getNode(nodeId));
  const connections = useConnectionStore(state => state.connections);
  
  // 获取操作方法
  const { uploadImage, analyzeImage, resetNode } = useTextNodeActions();
  
  // 本地状态
  const [editedPrompt, setEditedPrompt] = useState(nodeData?.editedPrompt || '');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 检查是否有输入连接
  const hasInputConnection = node?.inputs && node.inputs.length > 0;
  
  // 从连接的图片节点读取图片数据
  useEffect(() => {
    if (!hasInputConnection) return;
    
    // 获取连接到当前节点的第一个节点
    const inputConnection = connections.find(conn => conn.to === nodeId);
    if (!inputConnection) return;
    
    // 获取输入节点
    const inputNode = useNodeStore.getState().getNode(inputConnection.from);
    if (!inputNode) return;
    
    // 检查输入节点是否有图片数据
    // 图片节点的图片存储在 data.image 字段
    const imageData = inputNode.data?.image;
    
    if (imageData && imageData !== nodeData?.inputImage) {
      // 更新文字节点的输入图片
      useTextNodeStore.getState().updateInputImage(nodeId, imageData);
      console.log('[TextNodeReverse] 从连接的图片节点读取图片:', imageData.substring(0, 50));
    }
  }, [hasInputConnection, connections, nodeId, nodeData?.inputImage]);
  
  // 同步生成的提示词到编辑框
  useEffect(() => {
    if (nodeData?.editedPrompt) {
      setEditedPrompt(nodeData.editedPrompt);
    }
  }, [nodeData?.editedPrompt]);
  
  // 处理文件选择
  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        await uploadImage(nodeId, file);
      } catch (error) {
        console.error('图片上传失败:', error);
      }
    }
    // 清空 input，允许重复上传同一文件
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [nodeId, uploadImage]);
  
  // 处理点击上传区域
  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);
  
  // 处理分析图片
  const handleAnalyze = useCallback(async () => {
    if (!nodeData?.inputImage || nodeData?.isAnalyzing) return;
    try {
      await analyzeImage(nodeId);
    } catch (error) {
      console.error('图片分析失败:', error);
    }
  }, [nodeId, nodeData?.inputImage, nodeData?.isAnalyzing, analyzeImage]);
  
  // 处理提示词编辑
  const handlePromptChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newPrompt = e.target.value;
    setEditedPrompt(newPrompt);
    // 更新 Store
    useTextNodeStore.getState().updateEditedPrompt(nodeId, newPrompt);
  }, [nodeId]);
  
  // 处理生成按钮（传递提示词给下游）
  const handleGenerate = useCallback(() => {
    if (!editedPrompt.trim()) return;
    // 传递提示词给下游节点
    const { passPromptToDownstream } = useTextNodeActions();
    passPromptToDownstream(nodeId, editedPrompt);
  }, [nodeId, editedPrompt]);
  
  // 处理返回按钮
  const handleBack = useCallback(() => {
    resetNode(nodeId);
  }, [nodeId, resetNode]);
  
  return (
    <div className="relative w-full h-full flex flex-col p-4 gap-3">
      {/* 返回按钮 */}
      <button
        onClick={handleBack}
        className="absolute top-2 left-2 p-1.5 rounded-lg 
                   bg-white/90 hover:bg-white 
                   border border-gray-200 
                   transition-colors z-10"
        title="返回"
      >
        <ArrowLeft size={14} className="text-gray-600" />
      </button>
      
      {/* 提示词文本框 */}
      <div className="flex-1 flex flex-col gap-2 mt-8">
        <textarea
          className="flex-1 w-full bg-white border border-gray-200 
                     rounded-lg text-[11px] text-gray-800 leading-relaxed
                     placeholder-gray-400 focus:outline-none focus:border-blue-500
                     px-3 py-3 resize-none custom-scrollbar"
          placeholder="连接图片节点后，点击生成按钮，AI 将分析图片生成提示词..."
          value={editedPrompt}
          onChange={handlePromptChange}
        />
      </div>
      
      {/* 生成按钮 */}
      <button
        onClick={handleAnalyze}
        disabled={!nodeData?.inputImage || nodeData?.isAnalyzing}
        className="w-full px-4 py-2.5 text-[11px] font-bold text-white 
                   bg-blue-500 hover:bg-blue-600 rounded-lg 
                   transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                   flex items-center justify-center gap-2"
      >
        {nodeData?.isAnalyzing ? (
          <>
            <Loader2 size={14} className="animate-spin" />
            <span>生成中...</span>
          </>
        ) : (
          '生成提示词'
        )}
      </button>
    </div>
  );
});

TextNodeReverse.displayName = 'TextNodeReverse';
