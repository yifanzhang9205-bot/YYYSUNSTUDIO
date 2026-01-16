import React, { useState } from 'react';
import { Sparkles, ChevronDown, ChevronUp, Loader, Users, Check, RefreshCw } from 'lucide-react';
import { Character } from '../types';

interface CharacterReferenceNodeProps {
  characters: Character[];
  currentCharacterIndex: number;
  gridImages?: string[];
  selectedGridIndex?: number;
  userPrompt?: string;
  isWorking: boolean;
  isExpanded: boolean;
  onCharacterChange: (index: number) => void;
  onGridSelect: (index: number) => void;
  onUserPromptChange: (value: string) => void;
  onGenerate: () => void;
  onRegenerate: () => void;
}

export const CharacterReferenceNode: React.FC<CharacterReferenceNodeProps> = ({
  characters, currentCharacterIndex, gridImages, selectedGridIndex, userPrompt,
  isWorking, isExpanded, onCharacterChange, onGridSelect, onUserPromptChange,
  onGenerate, onRegenerate,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const currentCharacter = characters[currentCharacterIndex];
  const hasGenerated = gridImages && gridImages.length > 0;
  const hasSelected = selectedGridIndex !== undefined && selectedGridIndex >= 0;

  // 未展开状态
  if (!isExpanded) {
    return (
      <div className="p-5">
        {hasSelected && gridImages ? (
          <div className="space-y-3">
            <img 
              src={gridImages[selectedGridIndex]} 
              alt={currentCharacter?.name}
              className="w-full h-32 object-cover rounded-xl"
            />
            <div className="text-[13px] text-white font-medium">{currentCharacter?.name}</div>
            <div className="text-[11px] text-white/40">
              {currentCharacterIndex + 1} / {characters.length} 角色
            </div>
          </div>
        ) : currentCharacter ? (
          <div className="space-y-2">
            <div className="text-[14px] text-white font-medium">{currentCharacter.name}</div>
            <div className="text-[12px] text-white/40 line-clamp-2">{currentCharacter.description}</div>
          </div>
        ) : (
          <div className="text-[13px] text-white/30">连接剧本节点以加载角色...</div>
        )}
      </div>
    );
  }

  // 无角色状态
  if (!currentCharacter) {
    return (
      <div className="p-8 flex flex-col items-center justify-center h-full">
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
          <Users size={24} className="text-white/30" />
        </div>
        <div className="text-[14px] text-white/50 font-medium">请连接创意工作室节点</div>
        <div className="text-[12px] text-white/30 mt-1">从输入端口连接</div>
      </div>
    );
  }

  return (
    <div className="p-5 space-y-5">
      {/* 角色选择器 - iOS 风格 */}
      {characters.length > 1 && (
        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
          <button
            onClick={() => onCharacterChange(Math.max(0, currentCharacterIndex - 1))}
            disabled={currentCharacterIndex === 0 || isWorking}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60 disabled:opacity-30 hover:bg-white/20 transition-all active:scale-95"
          >
            ←
          </button>
          <div className="flex-1 text-center">
            <div className="text-[14px] font-semibold text-white">{currentCharacter.name}</div>
            <div className="text-[11px] text-white/40">
              {currentCharacterIndex + 1} / {characters.length}
            </div>
          </div>
          <button
            onClick={() => onCharacterChange(Math.min(characters.length - 1, currentCharacterIndex + 1))}
            disabled={currentCharacterIndex === characters.length - 1 || isWorking}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60 disabled:opacity-30 hover:bg-white/20 transition-all active:scale-95"
          >
            →
          </button>
        </div>
      )}

      {/* 角色信息 */}
      <div className="p-4 bg-white/5 rounded-xl border border-white/5">
        <div className="text-[11px] text-white/40 uppercase tracking-wider font-semibold mb-2">角色描述</div>
        <div className="text-[13px] text-white/80 leading-relaxed">{currentCharacter.description}</div>
        {currentCharacter.personality && (
          <div className="text-[11px] text-white/40 mt-3 pt-3 border-t border-white/5">
            性格: {currentCharacter.personality}
          </div>
        )}
      </div>

      {/* 9宫格展示 */}
      {hasGenerated ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-[11px] text-white/40 uppercase tracking-wider font-semibold">
              选择参考图 {hasSelected && `(已选 ${(selectedGridIndex ?? 0) + 1})`}
            </div>
            <button
              onClick={onRegenerate}
              disabled={isWorking}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 text-[11px] text-white/50 hover:text-white hover:bg-white/10 transition-all active:scale-95 disabled:opacity-30"
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
                className={`relative aspect-square rounded-xl overflow-hidden transition-all active:scale-[0.98] ${
                  selectedGridIndex === index
                    ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0a0a0a]'
                    : 'ring-1 ring-white/10 hover:ring-white/30'
                }`}
              >
                <img src={img} alt={`变体 ${index + 1}`} className="w-full h-full object-cover" />
                {selectedGridIndex === index && (
                  <div className="absolute inset-0 bg-white/10 flex items-center justify-center">
                    <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-lg">
                      <Check size={14} className="text-black" />
                    </div>
                  </div>
                )}
                <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 bg-black/60 backdrop-blur rounded-md text-[10px] text-white font-semibold">
                  {index + 1}
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-8 border border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
            <Users size={20} className="text-white/30" />
          </div>
          <div className="text-[12px] text-white/40">点击下方按钮生成参考图</div>
        </div>
      )}

      {/* 高级选项 */}
      <div className="border-t border-white/5 pt-4">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-[12px] font-medium text-white/40 hover:text-white/70 transition-colors"
        >
          {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          高级选项
        </button>

        {showAdvanced && (
          <div className="mt-3">
            <textarea
              value={userPrompt || ''}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onUserPromptChange(e.target.value)}
              placeholder="自定义补充提示词..."
              className="w-full h-16 px-4 py-3 bg-white/5 border border-white/5 rounded-xl text-[12px] text-white placeholder-white/30 focus:outline-none focus:border-white/20 resize-none transition-colors"
              disabled={isWorking}
            />
          </div>
        )}
      </div>

      {/* 生成按钮 - iOS 风格 */}
      <button
        onClick={onGenerate}
        disabled={isWorking}
        className="w-full h-11 bg-white rounded-xl flex items-center justify-center gap-2 text-black font-semibold text-[14px] hover:bg-white/90 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-white/10"
      >
        {isWorking ? (
          <>
            <Loader size={16} className="animate-spin" />
            <span>生成中...</span>
          </>
        ) : hasGenerated ? (
          <>
            <RefreshCw size={16} />
            <span>重新生成</span>
          </>
        ) : (
          <>
            <Sparkles size={16} />
            <span>生成参考图</span>
          </>
        )}
      </button>

      {/* 提示信息 */}
      {hasSelected && (
        <div className="flex items-center justify-center gap-2 text-[12px] text-white/40">
          <Check size={14} className="text-white/60" />
          已选择参考图，可连接到分镜生成节点
        </div>
      )}
    </div>
  );
};
