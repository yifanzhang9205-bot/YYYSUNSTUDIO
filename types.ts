
export enum NodeType {
  PROMPT_INPUT = 'PROMPT_INPUT',
  IMAGE_GENERATOR = 'IMAGE_GENERATOR',
  VIDEO_GENERATOR = 'VIDEO_GENERATOR',
  VIDEO_ANALYZER = 'VIDEO_ANALYZER',
  IMAGE_EDITOR = 'IMAGE_EDITOR',
  AUDIO_GENERATOR = 'AUDIO_GENERATOR',
  
  // 新增：故事创作流程节点
  STORY_STUDIO = 'STORY_STUDIO',           // 创意工作室
  CHARACTER_REFERENCE = 'CHARACTER_REFERENCE', // 角色参考
  SCENE_REFERENCE = 'SCENE_REFERENCE',     // 场景参考
  STORYBOARD_SHOT = 'STORYBOARD_SHOT',     // 分镜生成
  
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
  };
  inputs: string[]; // IDs of nodes this node connects FROM
}

// 剧本数据结构
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
}

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

// Window interface for Google AI Studio key selection
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
}