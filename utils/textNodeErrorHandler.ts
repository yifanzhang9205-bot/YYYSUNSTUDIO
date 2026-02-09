/**
 * 文字节点错误处理工具
 * 
 * 职责：
 * - 统一处理文字节点的错误
 * - 提供友好的错误提示
 * - 记录错误日志
 */

import { TextNodeErrorType, TextNodeError } from '../types';

/**
 * 处理文字节点错误
 * @param error - 原始错误对象
 * @param context - 错误上下文（用于日志）
 * @returns 格式化的错误对象
 */
export function handleTextNodeError(error: any, context: string): TextNodeError {
  console.error(`[TextNode] ${context}:`, error);
  
  const errorMessage = error?.message || String(error);
  const timestamp = Date.now();
  
  // 图片相关错误
  if (errorMessage.includes('upload') || errorMessage.includes('上传')) {
    return {
      type: TextNodeErrorType.INVALID_IMAGE,
      message: '图片上传失败，请重试',
      details: errorMessage,
      timestamp,
    };
  }
  
  // 图片过大
  if (errorMessage.includes('too large') || errorMessage.includes('过大') || errorMessage.includes('10MB')) {
    return {
      type: TextNodeErrorType.IMAGE_TOO_LARGE,
      message: '图片过大，请选择小于 10MB 的图片',
      details: errorMessage,
      timestamp,
    };
  }
  
  // 图片格式错误
  if (errorMessage.includes('format') || errorMessage.includes('格式') || errorMessage.includes('type')) {
    return {
      type: TextNodeErrorType.INVALID_IMAGE,
      message: '不支持的图片格式，请上传 JPG、PNG、WebP 或 GIF',
      details: errorMessage,
      timestamp,
    };
  }
  
  // 没有图片
  if (errorMessage.includes('no image') || errorMessage.includes('没有图片') || errorMessage.includes('请先上传')) {
    return {
      type: TextNodeErrorType.NO_IMAGE,
      message: '请先上传图片',
      details: errorMessage,
      timestamp,
    };
  }
  
  // API 调用失败
  if (errorMessage.includes('API') || errorMessage.includes('api')) {
    return {
      type: TextNodeErrorType.API_ERROR,
      message: 'AI 服务暂时不可用，请稍后重试',
      details: errorMessage,
      timestamp,
    };
  }
  
  // 超时
  if (errorMessage.includes('timeout') || errorMessage.includes('超时')) {
    return {
      type: TextNodeErrorType.TIMEOUT,
      message: '请求超时，请检查网络连接',
      details: errorMessage,
      timestamp,
    };
  }
  
  // 限流
  if (errorMessage.includes('rate limit') || errorMessage.includes('频繁') || errorMessage.includes('429')) {
    return {
      type: TextNodeErrorType.RATE_LIMIT,
      message: '请求过于频繁，请稍后再试',
      details: errorMessage,
      timestamp,
    };
  }
  
  // 网络错误
  if (errorMessage.includes('network') || errorMessage.includes('网络') || errorMessage.includes('连接')) {
    return {
      type: TextNodeErrorType.NETWORK_ERROR,
      message: '网络连接失败，请检查网络',
      details: errorMessage,
      timestamp,
    };
  }
  
  // 输入为空
  if (errorMessage.includes('empty') || errorMessage.includes('为空') || errorMessage.includes('请输入')) {
    return {
      type: TextNodeErrorType.EMPTY_PROMPT,
      message: '请输入内容',
      details: errorMessage,
      timestamp,
    };
  }
  
  // 输入过长
  if (errorMessage.includes('too long') || errorMessage.includes('过长') || errorMessage.includes('长度')) {
    return {
      type: TextNodeErrorType.PROMPT_TOO_LONG,
      message: '输入内容过长，请缩短',
      details: errorMessage,
      timestamp,
    };
  }
  
  // 多个输入连接
  if (errorMessage.includes('multiple') || errorMessage.includes('多个')) {
    return {
      type: TextNodeErrorType.MULTIPLE_INPUTS,
      message: '只能连接一个输入节点',
      details: errorMessage,
      timestamp,
    };
  }
  
  // 默认错误
  return {
    type: TextNodeErrorType.UNKNOWN,
    message: errorMessage || '操作失败，请重试',
    details: errorMessage,
    timestamp,
  };
}

/**
 * 显示错误提示（Toast）
 * 注意：这里只是记录日志，实际的 Toast 显示需要在 UI 层实现
 * @param error - 错误对象
 */
export function showErrorToast(error: TextNodeError): void {
  console.error('[TextNode] 错误提示:', error.message);
  // TODO: 集成全局 Toast 组件
  // const { showToast } = useToastStore.getState();
  // showToast({
  //   type: 'error',
  //   message: error.message,
  //   duration: 3000,
  // });
}

/**
 * 获取错误的友好提示文本
 * @param errorType - 错误类型
 * @returns 友好的提示文本
 */
export function getErrorMessage(errorType: TextNodeErrorType): string {
  const errorMessages: Record<TextNodeErrorType, string> = {
    [TextNodeErrorType.EMPTY_PROMPT]: '请输入内容',
    [TextNodeErrorType.PROMPT_TOO_LONG]: '输入内容过长，请缩短',
    [TextNodeErrorType.NO_IMAGE]: '请先上传图片',
    [TextNodeErrorType.INVALID_IMAGE]: '不支持的图片格式，请上传 JPG、PNG、WebP 或 GIF',
    [TextNodeErrorType.IMAGE_TOO_LARGE]: '图片过大，请选择小于 10MB 的图片',
    [TextNodeErrorType.MULTIPLE_INPUTS]: '只能连接一个输入节点',
    [TextNodeErrorType.API_ERROR]: 'AI 服务暂时不可用，请稍后重试',
    [TextNodeErrorType.NETWORK_ERROR]: '网络连接失败，请检查网络',
    [TextNodeErrorType.TIMEOUT]: '请求超时，请检查网络连接',
    [TextNodeErrorType.RATE_LIMIT]: '请求过于频繁，请稍后再试',
    [TextNodeErrorType.UNKNOWN]: '操作失败，请重试',
  };
  
  return errorMessages[errorType] || '未知错误';
}
