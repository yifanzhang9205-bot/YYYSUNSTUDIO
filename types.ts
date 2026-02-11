
export enum NodeType {
  PROMPT_INPUT = 'PROMPT_INPUT',
  IMAGE_GENERATOR = 'IMAGE_GENERATOR',
  VIDEO_GENERATOR = 'VIDEO_GENERATOR',
  VIDEO_ANALYZER = 'VIDEO_ANALYZER',
  IMAGE_EDITOR = 'IMAGE_EDITOR',
  AUDIO_GENERATOR = 'AUDIO_GENERATOR',
  
  // 新增：AI 协作工作室节点
  SCRIPT_NODE = 'SCRIPT_NODE',             // 剧本节点
  SHOT_IMAGE_GENERATOR = 'SHOT_IMAGE_GENERATOR', // 分镜图生成
  
  // 新增：多角度相机节点
  MULTI_ANGLE_CAMERA = 'MULTI_ANGLE_CAMERA', // 多角度相机
  
  // 新增：九宫格处理节点
  GRID_SPLITTER = 'GRID_SPLITTER',         // 九宫格处理
}

export enum NodeStatus {
  IDLE = 'IDLE',
  WORKING = 'WORKING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export type VideoGenerationMode = 'DEFAULT' | 'CONTINUE' | 'CUT' | 'FIRST_LAST_FRAME' | 'CHARACTER_REF';

export interface AppNode {
  id: string;
  type: NodeType;
  x: number;
  y: number;
  width?: number; // Custom width
  height?: number; // Custom height
  title: string;
  status: NodeStatus;
  data: {
    prompt?: string;
    model?: string; // Selected AI model
    image?: string; // Base64 (The currently displayed main image)
    images?: string[]; // Array of Base64 strings (for multiple generations)
    imageCount?: number; // Number of images to generate (1-4)
    videoCount?: number; // Number of videos to generate (1-4)
    videoUri?: string; // URL
    videoUris?: string[]; // Array of URLs (for multiple video generations)
    videoMetadata?: any; // Stores the raw Video object from Gemini API for extension
    audioUri?: string; // Base64 or Blob URL for Audio Node
    analysis?: string; // Video analysis result
    error?: string;
    progress?: string;
    aspectRatio?: string; // e.g., '16:9', '4:3'
    resolution?: string; // e.g., '1080p', '4k'
    duration?: number; // Duration in seconds (for Audio/Video)
    
    // Video Strategies (StoryContinuator, SceneDirector, FrameWeaver, CharacterRef)
    generationMode?: VideoGenerationMode; 
    selectedFrame?: string; // Base64 of the specific frame captured from video (Raw)
    croppedFrame?: string; // Base64 of the cropped/edited frame (Final Input)
    
    // Input Management
    sortedInputIds?: string[]; // Order of input nodes for multi-image composition
    
    // 新增：提示词管理
    systemPrompt?: string;  // 系统内置提示词（只读）
    userPrompt?: string;    // 用户自定义补充
    negativePrompt?: string; // 负面提示词
    fullPrompt?: string;    // 最终合成的完整提示词（用于调试）
    
    // 新增：9宫格管理
    gridImages?: string[];  // 9张候选图
    selectedGridIndex?: number; // 用户选中的索引（0-8）
    
    // 新增：剧本数据
    storyData?: StoryData;
    
    // 新增：角色/场景参考
    characterRefs?: { [characterName: string]: string }; // 角色名 -> 参考图
    sceneRefs?: { [sceneId: string]: string }; // 场景ID -> 参考图
    
    // 新增：创意工作室配置
    storyStyle?: string; // 故事风格
    targetDuration?: number; // 目标时长（秒）
    shotCount?: number; // 镜头数量
    
    // 新增：当前索引（用于多角色/场景/镜头切换）
    currentCharacterIndex?: number;
    currentSceneIndex?: number;
    currentShotIndex?: number;
    
    // 新增：多角度相机参数
    horizontalAngle?: number;  // 水平角度 0-360
    verticalAngle?: number;    // 垂直角度 -30 to 60
    cameraZoom?: number;       // 距离 0-10
    cameraPrompt?: string;     // 生成的相机提示词
    
    // 新增：九宫格处理节点数据
    inputImage?: string;       // 输入的九宫格图片
    croppedImages?: string[];  // 切割后的 9 张图片
    
    // 🔥 新增：引用追踪（数据清理机制）
    historyAssetId?: string;   // 来自哪个历史记录（用于引用检查）
    selectedIndex?: number;    // 选中的图片索引
    outputImage?: string;      // 输出的图片（选中的那张）
    
    // 新增：角色/场景/镜头关联 ID
    characterId?: string;      // 关联的角色 ID
    sceneId?: string;          // 关联的场景 ID
    shotId?: string;           // 关联的镜头 ID
    
    // 新增：角色/场景/镜头名称和编号
    characterName?: string;    // 角色名称
    sceneNumber?: number;      // 场景编号
    shotNumber?: number;       // 镜头编号
    
    // 新增：剧本节点相关
    scriptData?: ScriptData;   // 剧本数据（完整）
    description?: string;      // 角色/场景描述
    location?: string;         // 场景位置
    shotType?: string;         // 镜头类型
    
    // 新增：角色相关属性
    personality?: string;      // 角色性格
    visualKeywords?: string;   // 视觉关键词
    scriptNodeId?: string;     // 关联的剧本节点 ID
    
    // 新增：场景相关属性
    timeOfDay?: string;        // 时间段（白天/夜晚等）
    mood?: string;             // 场景氛围/情绪
    
    // 新增：镜头相关属性
    cameraAngle?: string;      // 镜头角度
    cameraMovement?: string;   // 镜头运动
    
    // 🔥 新增：文字节点升级相关字段（2026-02-03）
    mode?: TextNodeMode;                    // 节点模式（initial/manual/reverse/text-to-image/prompt-generator）
    analyzedPrompt?: string;                // 分析生成的提示词
    userInput?: string;                     // 用户输入（用于提示词生成）
    generatedPrompt?: string;               // AI 生成的提示词
    outputNodeId?: string;                  // 输出节点 ID（文生图模式）
    isAnalyzing?: boolean;                  // 是否正在分析图片
    isGenerating?: boolean;                 // 是否正在生成提示词
    pendingRequestId?: string;              // 当前请求 ID（用于取消旧请求）
  };
  inputs: string[]; // IDs of nodes this node connects FROM
}

// 剧本数据结构（AI 协作工作室）
export interface ScriptData {
  title: string;              // 剧本标题
  logline: string;            // 一句话概述
  theme: string;              // 主题/情绪
  targetDuration: number;     // 目标时长（秒）
  characters: Character[];    // 角色列表
  scenes: Scene[];            // 场景列表
  shots: Shot[];              // 分镜列表
  createdAt: number;
  updatedAt: number;
  version: number;
}

// 镜头类型枚举
export enum ShotType {
  EXTREME_WIDE = 'Extreme Wide Shot',    // 极远景
  WIDE = 'Wide Shot',                    // 远景
  FULL = 'Full Shot',                    // 全景
  MEDIUM = 'Medium Shot',                // 中景
  CLOSE_UP = 'Close-Up',                 // 特写
  EXTREME_CLOSE_UP = 'Extreme Close-Up', // 大特写
}

// 机位角度枚举
export enum CameraAngle {
  EYE_LEVEL = 'Eye Level',       // 平视
  HIGH_ANGLE = 'High Angle',     // 俯视
  LOW_ANGLE = 'Low Angle',       // 仰视
  BIRDS_EYE = "Bird's Eye View", // 鸟瞰
  DUTCH = 'Dutch Angle',         // 荷兰角
}

// 运镜方式枚举
export enum CameraMovement {
  STATIC = 'Static',       // 静止
  PAN = 'Pan',             // 摇镜
  TILT = 'Tilt',           // 俯仰
  DOLLY = 'Dolly',         // 推拉
  TRACK = 'Track',         // 跟随
  CRANE = 'Crane',         // 升降
  HANDHELD = 'Handheld',   // 手持
}

// 剧本数据结构（旧版，保留兼容性）
export interface StoryData {
  title: string;
  logline: string;
  theme: string;
  characters: Character[];
  scenes: Scene[];
  shots: Shot[];
}

export interface Character {
  id: string;
  name: string;
  description: string;
  personality: string;
  visualKeywords: string[];
  referenceImage?: string; // 用户选中的参考图
}

export interface Scene {
  id: string;
  sceneNumber: number;
  location: string;
  timeOfDay: string;
  mood: string;
  description: string;
  visualKeywords: string[];
  referenceImage?: string;
}

export interface Shot {
  id: string;
  shotNumber: number;
  sceneNumber: number;
  shotType: string; // 特写/近景/中景/全景/远景
  cameraAngle: string; // 平视/俯视/仰视/侧面
  cameraMovement: string; // 静止/推进/拉远/跟随/环绕
  duration: number;
  characters: string[]; // 角色名数组
  action: string;
  dialogue?: string;
  visualDescription: string;
  imagePrompt: string;
}

export interface Group {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  title: string;
  nodeIds?: string[]; // 组内节点 ID 列表（可选）
  color?: GroupColor; // 🔥 新增：组颜色（2026-02-08）
}

// 🔥 新增：组颜色类型（2026-02-08）
export type GroupColor = 'default' | 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'orange';

export interface Connection {
  from: string;
  to: string;
}

export interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  id?: string;
}

export interface Workflow {
  id: string;
  title: string;
  thumbnail: string;
  nodes: AppNode[];
  connections: Connection[];
  groups: Group[];
}

// New Smart Sequence Types
export interface SmartSequenceItem {
    id: string;
    src: string; // Base64 or URL
    transition: {
        duration: number; // 1-6s
        prompt: string;
    };
}

// ========== 文字节点类型定义 ==========

/**
 * 文字节点模式枚举
 */
export enum TextNodeMode {
  INITIAL = 'initial',              // 初始状态（显示功能选项列表）
  MANUAL = 'manual',                // 自己编写内容
  REVERSE = 'reverse',              // 图片反推提示词
  TEXT_TO_IMAGE = 'text-to-image',  // 文生图
  PROMPT_GENERATOR = 'prompt-generator', // 提示词生成
}

/**
 * 文字节点错误类型枚举
 */
export enum TextNodeErrorType {
  EMPTY_PROMPT = 'EMPTY_PROMPT',                   // 提示词为空
  PROMPT_TOO_LONG = 'PROMPT_TOO_LONG',             // 提示词过长
  NO_IMAGE = 'NO_IMAGE',                           // 没有输入图片
  INVALID_IMAGE = 'INVALID_IMAGE',                 // 图片格式无效
  IMAGE_TOO_LARGE = 'IMAGE_TOO_LARGE',             // 图片过大
  MULTIPLE_INPUTS = 'MULTIPLE_INPUTS',             // 多个输入连接
  API_ERROR = 'API_ERROR',                         // API 调用失败
  NETWORK_ERROR = 'NETWORK_ERROR',                 // 网络错误
  TIMEOUT = 'TIMEOUT',                             // 超时
  RATE_LIMIT = 'RATE_LIMIT',                       // 限流
  UNKNOWN = 'UNKNOWN',                             // 未知错误
}

/**
 * 文字节点错误接口
 */
export interface TextNodeError {
  type: TextNodeErrorType;
  message: string;
  details?: string;
  timestamp: number;
}

/**
 * 文字节点数据接口
 */
export interface TextNodeData {
  // ========== 通用字段 ==========
  /** 当前模式 */
  mode?: TextNodeMode;
  
  /** 用户输入的文字/提示词 */
  prompt?: string;
  
  /** 选择的 AI 模型 */
  model?: string;
  
  /** 错误信息（字符串） */
  error?: string;
  
  // ========== 图片反推模式 ==========
  /** 输入图片（Base64 或 Blob URL） */
  inputImage?: string;
  
  /** AI 分析生成的提示词 */
  analyzedPrompt?: string;
  
  /** 用户编辑后的提示词 */
  editedPrompt?: string;
  
  /** 是否正在分析 */
  isAnalyzing?: boolean;
  
  // ========== 文生图模式 ==========
  /** 自动生成的输出节点 ID */
  outputNodeId?: string;
  
  // ========== 提示词生成模式 ==========
  /** 用户的自然语言描述 */
  userInput?: string;
  
  /** AI 生成的提示词 */
  generatedPrompt?: string;
  
  /** 是否正在生成 */
  isGenerating?: boolean;
  
  // ========== 请求管理（防止竞态条件）==========
  /** 当前请求 ID */
  pendingRequestId?: string;
}

// Window interface for Google AI Studio key selection
declare global {
  interface Window {
    aistudio?: AIStudio;
  }
  
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
}