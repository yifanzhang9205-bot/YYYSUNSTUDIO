import React, { useState } from 'react';
import { Sparkles, ChevronDown, ChevronUp, Loader, Film, Check, RefreshCw, Eye } from 'lucide-react';
import { Shot } from '../types';

interface StoryboardShotNodeProps {
  shots: Shot[];
  currentShotIndex: number;
  gridImages?: string[];
  selectedGridIndex?: number;
  userPrompt?: string;
  negativePrompt?: string;
  fullPrompt?: string;
  isWorking: boolean;
  isExpanded: boolean;
  onShotChange: (index: number) => void;
  onGridSelect: (index: number) => void;
  onUserPromptChange: (value: string) => void;
  onNegativePromptChange: (value: string) => void;
  onGenerate: () => void;
  onRegenerate: () => void;
}

export const StoryboardShotNode: React.FC<StoryboardShotNodeProps> = ({
  shots,
  currentShotIndex,
  gridImages,
  selectedGridIndex,
  userPrompt,
  negativePrompt,
  fullPrompt,
  isWorking,
  isExpanded,
  onShotChange,
  onGridSelect,
  onUserPromptChange,
  onNegativePromptChange,
  onGenerate,
  onRegenerate,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showFullPrompt, setShowFullPrompt] = useState(false);

  const currentShot = shots[currentShotIndex];
  const hasGenerated = gridImages && gridImages.length > 0;
  const hasSelected = selectedGridIndex !== undefined && selectedGridIndex >= 0;

  // 未展开状态：显示简洁预览
  if (!isExpanded) {
    return (
      <div className="p-4">
        {hasSelected && gridImages ? (
          <div className="space-y-3">
            <img 
              src={gridImages[selectedGridIndex]} 
              alt={`镜头 ${currentShot?.shotNumber}`}
              className="w-full h-32 object-cover rounded-2xl"
            />
            <div className="text-white/90 font-medium text-sm">镜头 {currentShot?.shotNumber}</div>
            <div className="text-white/40 text-xs">{currentShot?.shotType} · {currentShot?.cameraAngle}</div>
          </div>
        ) : currentShot ? (
          <div className="space-y-2">
            <div className="text-white/90 font-medium">镜头 {currentShot.shotNumber}</div>
            <div className="text-white/50 text-xs line-clamp-2">{currentShot.visualDescription}</div>
            <div className="text-white/30 text-xs">点击展开生成分镜</div>
          </div>
        ) : (
          <div className="text-white/40 italic text-sm">连接剧本节点以加载镜头...</div>
        )}
      </div>
    );
  }

  // 展开状态：显示完整编辑界面
  if (!currentShot) {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-full text-white/40">
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
          <Film size={28} className="opacity-50" />
        </div>
        <div className="text-sm font-medium">请连接创意工作室节点</div>
        <div className="text-xs mt-1 opacity-60">从输入端口连接</div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* 镜头选择器 */}
      {shots.length > 1 && (
        <div className="flex items-center gap-3">
          <button
            onClick={() => onShotChange(Math.max(0, currentShotIndex - 1))}
            disabled={currentShotIndex === 0 || isWorking}
            className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-xl border border-white/10 text-white/80 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/20 active:scale-95 transition-all flex items-center justify-center"
          >
            ←
          </button>
          <div className="flex-1 text-center">
            <div className="text-sm font-semibold text-white/90">镜头 {currentShot.shotNumber}</div>
            <div className="text-xs text-white/40">
              {currentShotIndex + 1} / {shots.length}
            </div>
          </div>
          <button
            onClick={() => onShotChange(Math.min(shots.length - 1, currentShotIndex + 1))}
            disabled={currentShotIndex === shots.length - 1 || isWorking}
            className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-xl border border-white/10 text-white/80 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/20 active:scale-95 transition-all flex items-center justify-center"
          >
            →
          </button>
        </div>
      )}

      {/* 镜头信息卡片 */}
      <div className="p-4 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 space-y-3">
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1">景别</div>
            <div className="text-xs text-white/90 font-medium">{currentShot.shotType}</div>
          </div>
          <div className="flex-1">
            <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1">角度</div>
            <div className="text-xs text-white/90 font-medium">{currentShot.cameraAngle}</div>
          </div>
          <div className="flex-1">
            <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1">运镜</div>
            <div className="text-xs text-white/90 font-medium">{currentShot.cameraMovement}</div>
          </div>
        </div>
        
        {currentShot.characters && currentShot.characters.length > 0 && (
          <div>
            <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1">角色</div>
            <div className="text-xs text-white/70">{currentShot.characters.join(', ')}</div>
          </div>
        )}
        
        <div>
          <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1">动作描述</div>
          <div className="text-xs text-white/60 leading-relaxed">{currentShot.action}</div>
        </div>
        
        {currentShot.dialogue && (
          <div>
            <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1">对话</div>
            <div className="text-xs text-white/60 italic">"{currentShot.dialogue}"</div>
          </div>
        )}
      </div>

      {/* 9宫格展示 */}
      {hasGenerated ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-medium text-white/50">
              选择分镜 {hasSelected && <span className="text-white/80">(已选 {selectedGridIndex + 1})</span>}
            </div>
            <button
              onClick={onRegenerate}
              disabled={isWorking}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-white/50 hover:text-white/90 bg-white/5 hover:bg-white/10 rounded-full transition-all disabled:opacity-30"
            >
              <RefreshCw size={12} />
              重新生成
            </button>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            {gridImages.map((img: string, index: number) => (
              <button
                key={index}
                onClick={() => onGridSelect(index)}
                disabled={isWorking}
                className={`relative aspect-video rounded-xl overflow-hidden border-2 transition-all hover:scale-[1.02] active:scale-[0.98] ${
                  selectedGridIndex === index
                    ? 'border-white ring-2 ring-white/30'
                    : 'border-white/10 hover:border-white/30'
                }`}
              >
                <img
                  src={img}
                  alt={`镜头 ${currentShot.shotNumber} 变体 ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {selectedGridIndex === index && (
                  <div className="absolute inset-0 bg-white/10 flex items-center justify-center">
                    <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-lg">
                      <Check size={14} className="text-black" />
                    </div>
                  </div>
                )}
                <div className="absolute bottom-1.5 right-1.5 px-2 py-0.5 bg-black/60 backdrop-blur-md rounded-full text-[10px] text-white/90 font-medium">
                  {index + 1}
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-10 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-white/40">
          <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mb-3">
            <Film size={24} className="opacity-50" />
          </div>
          <div className="text-xs text-center">
            点击下方按钮生成 9 宫格分镜
            <div className="text-[10px] mt-1 opacity-60">需要先连接角色和场景参考</div>
          </div>
        </div>
      )}

      {/* 高级选项 */}
      <div className="pt-3">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-xs font-medium text-white/40 hover:text-white/70 transition-colors"
        >
          {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          高级选项
        </button>

        {showAdvanced && (
          <div className="mt-4 space-y-4">
            {/* 查看完整提示词 */}
            <div>
              <button
                onClick={() => setShowFullPrompt(!showFullPrompt)}
                className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors"
              >
                <Eye size={12} />
                {showFullPrompt ? '隐藏' : '查看'}完整生成提示词
              </button>
              
              {showFullPrompt && fullPrompt && (
                <div className="mt-2 p-3 bg-white/5 backdrop-blur-xl rounded-xl text-[10px] text-white/40 leading-relaxed max-h-32 overflow-y-auto font-mono">
                  {fullPrompt}
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-[10px] font-medium text-white/40 uppercase tracking-wider mb-2">
                ✏️ 自定义补充提示词
              </label>
              <textarea
                value={userPrompt || ''}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onUserPromptChange(e.target.value)}
                placeholder="例如：添加屏幕发出蓝光、强调疲惫的表情、增加景深..."
                className="w-full h-20 px-4 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl text-xs text-white/90 placeholder-white/30 focus:outline-none focus:border-white/30 resize-none transition-colors"
                disabled={isWorking}
              />
            </div>
            
            <div>
              <label className="block text-[10px] font-medium text-white/40 uppercase tracking-wider mb-2">
                🚫 负面提示词
              </label>
              <textarea
                value={negativePrompt || ''}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onNegativePromptChange(e.target.value)}
                placeholder="例如：避免模糊、多余的人物、错误的手部..."
                className="w-full h-20 px-4 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl text-xs text-white/90 placeholder-white/30 focus:outline-none focus:border-white/30 resize-none transition-colors"
                disabled={isWorking}
              />
            </div>
          </div>
        )}
      </div>

      {/* 生成按钮 */}
      <button
        onClick={onGenerate}
        disabled={isWorking}
        className="w-full py-3 bg-white hover:bg-white/90 disabled:bg-white/20 disabled:text-white/40 rounded-2xl text-sm font-semibold text-black transition-all flex items-center justify-center gap-2 active:scale-[0.98] shadow-lg shadow-white/10"
      >
        {isWorking ? (
          <>
            <Loader size={16} className="animate-spin" />
            生成中...
          </>
        ) : hasGenerated ? (
          <>
            <RefreshCw size={16} />
            重新生成 9 宫格
          </>
        ) : (
          <>
            <Sparkles size={16} />
            生成 9 宫格分镜
          </>
        )}
      </button>

      {/* 提示信息 */}
      {hasSelected && (
        <div className="text-xs text-center text-white/40">
          ✓ 已选择分镜，可连接到序列编排
        </div>
      )}
    </div>
  );
};
