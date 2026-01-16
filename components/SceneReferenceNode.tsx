import React, { useState } from 'react';
import { Sparkles, ChevronDown, ChevronUp, Loader, MapPin, Check, RefreshCw } from 'lucide-react';
import { Scene } from '../types';

interface SceneReferenceNodeProps {
  scenes: Scene[];
  currentSceneIndex: number;
  gridImages?: string[];
  selectedGridIndex?: number;
  userPrompt?: string;
  isWorking: boolean;
  isExpanded: boolean;
  onSceneChange: (index: number) => void;
  onGridSelect: (index: number) => void;
  onUserPromptChange: (value: string) => void;
  onGenerate: () => void;
  onRegenerate: () => void;
}

export const SceneReferenceNode: React.FC<SceneReferenceNodeProps> = ({
  scenes,
  currentSceneIndex,
  gridImages,
  selectedGridIndex,
  userPrompt,
  isWorking,
  isExpanded,
  onSceneChange,
  onGridSelect,
  onUserPromptChange,
  onGenerate,
  onRegenerate,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const currentScene = scenes[currentSceneIndex];
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
              alt={currentScene?.location}
              className="w-full h-32 object-cover rounded-2xl"
            />
            <div className="text-white/90 font-medium text-sm">{currentScene?.location}</div>
            <div className="text-white/40 text-xs">
              场景 {currentScene?.sceneNumber} · {currentScene?.timeOfDay}
            </div>
          </div>
        ) : currentScene ? (
          <div className="space-y-2">
            <div className="text-white/90 font-medium">场景 {currentScene.sceneNumber}</div>
            <div className="text-white/60 text-xs">{currentScene.location}</div>
            <div className="text-white/40 text-xs">{currentScene.timeOfDay} · {currentScene.mood}</div>
          </div>
        ) : (
          <div className="text-white/40 italic text-sm">连接剧本节点以加载场景...</div>
        )}
      </div>
    );
  }

  // 展开状态：显示完整编辑界面
  if (!currentScene) {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-full text-white/40">
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
          <MapPin size={28} className="opacity-50" />
        </div>
        <div className="text-sm font-medium">请连接创意工作室节点</div>
        <div className="text-xs mt-1 opacity-60">从输入端口连接</div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* 场景选择器 */}
      {scenes.length > 1 && (
        <div className="flex items-center gap-3">
          <button
            onClick={() => onSceneChange(Math.max(0, currentSceneIndex - 1))}
            disabled={currentSceneIndex === 0 || isWorking}
            className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-xl border border-white/10 text-white/80 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/20 active:scale-95 transition-all flex items-center justify-center"
          >
            ←
          </button>
          <div className="flex-1 text-center">
            <div className="text-sm font-semibold text-white/90">场景 {currentScene.sceneNumber}</div>
            <div className="text-xs text-white/40">
              {currentSceneIndex + 1} / {scenes.length}
            </div>
          </div>
          <button
            onClick={() => onSceneChange(Math.min(scenes.length - 1, currentSceneIndex + 1))}
            disabled={currentSceneIndex === scenes.length - 1 || isWorking}
            className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-xl border border-white/10 text-white/80 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/20 active:scale-95 transition-all flex items-center justify-center"
          >
            →
          </button>
        </div>
      )}

      {/* 场景信息卡片 */}
      <div className="p-4 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 space-y-3">
        <div>
          <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1">地点</div>
          <div className="text-sm text-white/90 font-medium">{currentScene.location}</div>
        </div>
        <div className="flex gap-6">
          <div>
            <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1">时间</div>
            <div className="text-xs text-white/70">{currentScene.timeOfDay}</div>
          </div>
          <div>
            <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1">氛围</div>
            <div className="text-xs text-white/70">{currentScene.mood}</div>
          </div>
        </div>
        <div>
          <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1">描述</div>
          <div className="text-xs text-white/60 leading-relaxed">{currentScene.description}</div>
        </div>
      </div>

      {/* 9宫格展示 */}
      {hasGenerated ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-medium text-white/50">
              选择参考图 {hasSelected && <span className="text-white/80">(已选 {selectedGridIndex + 1})</span>}
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
                className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all hover:scale-[1.02] active:scale-[0.98] ${
                  selectedGridIndex === index
                    ? 'border-white ring-2 ring-white/30'
                    : 'border-white/10 hover:border-white/30'
                }`}
              >
                <img
                  src={img}
                  alt={`场景 ${currentScene.sceneNumber} 变体 ${index + 1}`}
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
            <MapPin size={24} className="opacity-50" />
          </div>
          <div className="text-xs">点击下方按钮生成 9 宫格参考图</div>
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
            <div>
              <label className="block text-[10px] font-medium text-white/40 uppercase tracking-wider mb-2">
                💡 系统提示词（只读）
              </label>
              <div className="p-3 bg-white/5 backdrop-blur-xl rounded-xl text-[11px] text-white/40 leading-relaxed max-h-20 overflow-y-auto">
                场景氛围参考图，{currentScene.location}，{currentScene.timeOfDay}，{currentScene.mood}氛围，电影级构图...
              </div>
            </div>
            
            <div>
              <label className="block text-[10px] font-medium text-white/40 uppercase tracking-wider mb-2">
                ✏️ 自定义补充提示词
              </label>
              <textarea
                value={userPrompt || ''}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onUserPromptChange(e.target.value)}
                placeholder="例如：强调金色阳光、添加雾气效果、更暗的色调..."
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
            生成 9 宫格参考图
          </>
        )}
      </button>

      {/* 提示信息 */}
      {hasSelected && (
        <div className="text-xs text-center text-white/40">
          ✓ 已选择参考图，可连接到分镜生成节点
        </div>
      )}
    </div>
  );
};
