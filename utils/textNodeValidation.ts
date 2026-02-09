/**
 * 文字节点输入验证工具
 * 
 * 职责：
 * - 验证提示词输入
 * - 验证图片文件
 * - 验证用户输入
 * - 提供清晰的验证错误信息
 */

/**
 * 验证结果接口
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * 验证提示词输入
 * @param prompt - 提示词文本
 * @param maxLength - 最大长度（默认1000）
 * @returns 验证结果
 */
export function validatePrompt(prompt: string, maxLength: number = 1000): ValidationResult {
  // 检查是否为空
  if (!prompt || !prompt.trim()) {
    return {
      valid: false,
      error: '请输入提示词',
    };
  }
  
  // 检查长度
  if (prompt.length > maxLength) {
    return {
      valid: false,
      error: `提示词过长，请控制在 ${maxLength} 字以内`,
    };
  }
  
  // 检查非法字符（可选）
  // 这里可以根据需要添加更多验证规则
  const invalidChars = /[<>]/g;
  if (invalidChars.test(prompt)) {
    return {
      valid: false,
      error: '提示词包含非法字符（< >）',
    };
  }
  
  return { valid: true };
}

/**
 * 验证图片文件
 * @param file - 图片文件对象
 * @param maxSize - 最大文件大小（字节，默认10MB）
 * @returns 验证结果
 */
export function validateImageFile(file: File, maxSize: number = 10 * 1024 * 1024): ValidationResult {
  // 检查文件是否存在
  if (!file) {
    return {
      valid: false,
      error: '请选择图片文件',
    };
  }
  
  // 检查文件类型
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: '不支持的图片格式，请上传 JPG、PNG、WebP 或 GIF',
    };
  }
  
  // 检查文件大小
  if (file.size > maxSize) {
    const maxSizeMB = Math.floor(maxSize / (1024 * 1024));
    return {
      valid: false,
      error: `图片过大，请选择小于 ${maxSizeMB}MB 的图片`,
    };
  }
  
  // 检查文件名（可选）
  if (file.name && file.name.length > 255) {
    return {
      valid: false,
      error: '文件名过长',
    };
  }
  
  return { valid: true };
}

/**
 * 验证用户输入（提示词生成模式）
 * @param input - 用户输入的自然语言描述
 * @param maxLength - 最大长度（默认500）
 * @returns 验证结果
 */
export function validateUserInput(input: string, maxLength: number = 500): ValidationResult {
  // 检查是否为空
  if (!input || !input.trim()) {
    return {
      valid: false,
      error: '请输入您的需求描述',
    };
  }
  
  // 检查长度
  if (input.length > maxLength) {
    return {
      valid: false,
      error: `描述过长，请控制在 ${maxLength} 字以内`,
    };
  }
  
  // 检查最小长度（至少5个字符）
  if (input.trim().length < 5) {
    return {
      valid: false,
      error: '描述过短，请提供更多细节',
    };
  }
  
  return { valid: true };
}

/**
 * 验证 API 模型选择
 * @param model - 模型名称
 * @param availableModels - 可用的模型列表
 * @returns 验证结果
 */
export function validateModel(model: string, availableModels: string[]): ValidationResult {
  if (!model) {
    return {
      valid: false,
      error: '请选择 API 模型',
    };
  }
  
  if (!availableModels.includes(model)) {
    return {
      valid: false,
      error: '不支持的 API 模型',
    };
  }
  
  return { valid: true };
}

/**
 * 验证 Blob URL
 * @param url - Blob URL
 * @returns 验证结果
 */
export function validateBlobUrl(url: string): ValidationResult {
  if (!url) {
    return {
      valid: false,
      error: 'URL 为空',
    };
  }
  
  if (!url.startsWith('blob:')) {
    return {
      valid: false,
      error: '无效的 Blob URL',
    };
  }
  
  return { valid: true };
}

/**
 * 验证 Base64 图片数据
 * @param base64 - Base64 字符串
 * @returns 验证结果
 */
export function validateBase64Image(base64: string): ValidationResult {
  if (!base64) {
    return {
      valid: false,
      error: 'Base64 数据为空',
    };
  }
  
  // 检查是否是有效的 Base64 图片格式
  const base64Pattern = /^data:image\/(jpeg|jpg|png|webp|gif);base64,/;
  if (!base64Pattern.test(base64)) {
    return {
      valid: false,
      error: '无效的 Base64 图片格式',
    };
  }
  
  return { valid: true };
}

/**
 * 批量验证
 * @param validations - 验证函数数组
 * @returns 第一个失败的验证结果，或成功结果
 */
export function validateAll(...validations: ValidationResult[]): ValidationResult {
  for (const result of validations) {
    if (!result.valid) {
      return result;
    }
  }
  
  return { valid: true };
}
