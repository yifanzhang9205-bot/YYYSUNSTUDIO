/**
 * useConnection Hook - 连接线逻辑
 * 
 * 职责：
 * - 处理连接线的创建
 * - 处理连接线的删除
 * - 验证连接的有效性
 */

import { useState, useCallback } from 'react';
import { Connection, AppNode, NodeType } from '../types';

interface ConnectionStart {
  id: string;
  x: number;
  y: number;
  portType?: 'input' | 'output';
}

interface UseConnectionOptions {
  nodes: Map<string, AppNode>;
  connections: Connection[];
  onAddConnection: (connection: Connection) => void;
  onDeleteConnection: (from: string, to: string) => void;
  onUpdateNodeInputs: (nodeId: string, inputs: string[]) => void;
}

export const useConnection = ({
  nodes,
  connections,
  onAddConnection,
  onDeleteConnection,
  onUpdateNodeInputs,
}: UseConnectionOptions) => {
  const [connectionStart, setConnectionStart] = useState<ConnectionStart | null>(null);

  /**
   * 开始连接
   */
  const startConnection = useCallback((
    nodeId: string,
    x: number,
    y: number,
    portType: 'input' | 'output' = 'output'
  ) => {
    setConnectionStart({ id: nodeId, x, y, portType });
  }, []);

  /**
   * 结束连接
   */
  const endConnection = useCallback((targetNodeId: string) => {
    if (!connectionStart) return;

    const sourceId = connectionStart.id;
    const targetId = targetNodeId;

    // 不能连接到自己
    if (sourceId === targetId) {
      setConnectionStart(null);
      return;
    }

    // 检查是否已存在连接
    const existingConnection = connections.find(
      c => c.from === sourceId && c.to === targetId
    );
    if (existingConnection) {
      setConnectionStart(null);
      return;
    }

    // 创建连接
    const newConnection: Connection = {
      from: sourceId,
      to: targetId,
    };

    onAddConnection(newConnection);

    // 更新目标节点的输入
    const targetNode = nodes.get(targetId);
    if (targetNode) {
      const newInputs = [...targetNode.inputs, sourceId];
      onUpdateNodeInputs(targetId, newInputs);
    }

    setConnectionStart(null);
  }, [connectionStart, connections, nodes, onAddConnection, onUpdateNodeInputs]);

  /**
   * 取消连接
   */
  const cancelConnection = useCallback(() => {
    setConnectionStart(null);
  }, []);

  /**
   * 删除连接
   */
  const deleteConnection = useCallback((from: string, to: string) => {
    onDeleteConnection(from, to);

    // 更新目标节点的输入
    const targetNode = nodes.get(to);
    if (targetNode) {
      const newInputs = targetNode.inputs.filter(id => id !== from);
      onUpdateNodeInputs(to, newInputs);
    }
  }, [nodes, onDeleteConnection, onUpdateNodeInputs]);

  /**
   * 删除节点的所有连接
   */
  const deleteNodeConnections = useCallback((nodeId: string) => {
    // 删除所有从该节点出发的连接
    const outgoingConnections = connections.filter(c => c.from === nodeId);
    outgoingConnections.forEach(c => {
      deleteConnection(c.from, c.to);
    });

    // 删除所有到该节点的连接
    const incomingConnections = connections.filter(c => c.to === nodeId);
    incomingConnections.forEach(c => {
      deleteConnection(c.from, c.to);
    });
  }, [connections, deleteConnection]);

  /**
   * 获取节点的输出连接
   */
  const getOutputConnections = useCallback((nodeId: string): Connection[] => {
    return connections.filter(c => c.from === nodeId);
  }, [connections]);

  /**
   * 获取节点的输入连接
   */
  const getInputConnections = useCallback((nodeId: string): Connection[] => {
    return connections.filter(c => c.to === nodeId);
  }, [connections]);

  /**
   * 检查连接是否有效
   */
  const isValidConnection = useCallback((sourceId: string, targetId: string): boolean => {
    // 不能连接到自己
    if (sourceId === targetId) return false;

    // 检查是否已存在连接
    const existingConnection = connections.find(
      c => c.from === sourceId && c.to === targetId
    );
    if (existingConnection) return false;

    // 检查节点类型兼容性
    const sourceNode = nodes.get(sourceId);
    const targetNode = nodes.get(targetId);
    if (!sourceNode || !targetNode) return false;

    // TODO: 添加更多的兼容性检查
    // 例如：文本节点只能连接到图片生成节点

    return true;
  }, [connections, nodes]);

  /**
   * 获取兼容的输出节点类型
   */
  const getCompatibleOutputNodes = useCallback((sourceNode: AppNode): NodeType[] => {
    const compatible: NodeType[] = [];

    switch (sourceNode.type) {
      case NodeType.MULTI_ANGLE_CAMERA:
        compatible.push(NodeType.IMAGE_GENERATOR, NodeType.VIDEO_GENERATOR);
        break;
      case NodeType.IMAGE_GENERATOR:
      case NodeType.IMAGE_EDITOR:
        compatible.push(NodeType.VIDEO_GENERATOR, NodeType.IMAGE_EDITOR, NodeType.VIDEO_ANALYZER, NodeType.MULTI_ANGLE_CAMERA);
        break;
      case NodeType.VIDEO_GENERATOR:
        compatible.push(NodeType.VIDEO_ANALYZER);
        break;
      case NodeType.PROMPT_INPUT:
        compatible.push(NodeType.IMAGE_GENERATOR, NodeType.VIDEO_GENERATOR, NodeType.AUDIO_GENERATOR);
        break;
    }

    return Array.from(new Set(compatible));
  }, []);

  /**
   * 获取兼容的输入节点类型
   */
  const getCompatibleInputNodes = useCallback((targetNode: AppNode): NodeType[] => {
    const compatible: NodeType[] = [];

    switch (targetNode.type) {
      case NodeType.VIDEO_GENERATOR:
        compatible.push(NodeType.PROMPT_INPUT, NodeType.IMAGE_GENERATOR, NodeType.IMAGE_EDITOR);
        break;
      case NodeType.IMAGE_GENERATOR:
        compatible.push(NodeType.PROMPT_INPUT);
        break;
      case NodeType.VIDEO_ANALYZER:
        compatible.push(NodeType.VIDEO_GENERATOR, NodeType.IMAGE_GENERATOR, NodeType.IMAGE_EDITOR);
        break;
      case NodeType.IMAGE_EDITOR:
        compatible.push(NodeType.IMAGE_GENERATOR, NodeType.IMAGE_EDITOR);
        break;
      case NodeType.AUDIO_GENERATOR:
        compatible.push(NodeType.PROMPT_INPUT);
        break;
      case NodeType.MULTI_ANGLE_CAMERA:
        compatible.push(NodeType.IMAGE_GENERATOR, NodeType.IMAGE_EDITOR);
        break;
    }

    return Array.from(new Set(compatible));
  }, []);

  return {
    connectionStart,
    startConnection,
    endConnection,
    cancelConnection,
    deleteConnection,
    deleteNodeConnections,
    getOutputConnections,
    getInputConnections,
    isValidConnection,
    getCompatibleOutputNodes,
    getCompatibleInputNodes,
  };
};
