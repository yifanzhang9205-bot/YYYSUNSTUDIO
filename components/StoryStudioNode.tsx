import React, { useState } from 'react';
import { Sparkles, ChevronDown, ChevronUp, Loader, FileText, Users, MapPin, Film } from 'lucide-react';
import { StoryData, Character, Scene } from '../types';

interface StoryStudioNodeProps {
  concept: string;
  storyStyle: string;
  targetDuration: number;
  shotCount: number;
  storyData?: StoryData;
  userPrompt?: string;
  isWorking: boolean;
  isExpanded: boolean;
  onConceptChange: (value: string) => void;
  onStyleChange: (value: string) => void;
  onDurationChange: (value: number) => void;
  onShotCountChange: (value: number) => void;
  onUserPromptChange: (value: string) => void;
  onGenerate: () => void;
}

const STYLES = ['科幻', '温馨', '悬疑', '商业广告', '动作', '喜剧', '文艺'];
const DURATIONS = [{ v: 15, l: '15秒' }, { v: 30, l: '30秒' }, { v: 60, l: '60秒' }, { v: 90, l: '90秒' }];

export const StoryStudioNode: React.FC<StoryStudioNodeProps> = ({
  concept, storyStyle, targetDuration, shotCount, storyData, userPrompt,
  isWorking, isExpanded, onConceptChange, onStyleChange, onDurationChange,
  onShotCountChange, onUserPromptChange, onGenerate,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showStoryData, setShowStoryData] = useState(false);

  // 未展开状态
  if (!isExpanded) {
    return (
      <div className="p-5">
        {storyData ? (
          <div className="space-y-2">
            <div className="text-[15px] font-semibold text-white">{storyData.title}</div>
            <div className="text-[13px] text-white/50 line-clamp-2">{storyData.logline}</div>
            <div className="flex gap-3 text-[12px] text-white/40">
              <span>{storyData.characters.length} 角色</span>
              <span>{storyData.shots.length} 镜头</span>
            </div>
          </div>
        ) : concept ? (
          <div className="text-[13px] text-white/50 line-clamp-3">{concept}</div>
        ) : (
          <div className="text-[13px] text-white/30">点击展开创建故事...</div>
        )}
      </div>
    );
  }

  return (
    <div className="p-5 space-y-5">
      {/* 创意输入区 */}
      <div>
        <label className="block text-[11px] text-white/40 uppercase tracking-wider font-semibold mb-2">
          创意灵感
        </label>
        <textarea
          value={concept}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onConceptChange(e.target.value)}
          placeholder="输入你的创意想法..."
          className="w-full h-24 px-4 py-3 bg-white/5 border border-white/5 rounded-xl text-[13px] text-white placeholder-white/30 focus:outline-none focus:border-white/20 resize-none transition-colors"
          disabled={isWorking}
        />
      </div>

      {/* 基础配置 - iOS 分段控件风格 */}
      <div className="space-y-4">
        {/* 风格选择 */}
        <div>
          <label className="block text-[11px] text-white/40 uppercase tracking-wider font-semibold mb-2">风格</label>
          <div className="flex flex-wrap gap-2">
            {STYLES.map((s) => (
              <button
                key={s}
                onClick={() => onStyleChange(s)}
                disabled={isWorking}
                className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-all active:scale-95 ${
                  storyStyle === s
                    ? 'bg-white text-black shadow-lg shadow-white/20'
                    : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/5'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* 时长和镜头数 */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] text-white/40 uppercase tracking-wider font-semibold mb-2">时长</label>
            <div className="flex gap-1.5">
              {DURATIONS.map((d) => (
                <button
                  key={d.v}
                  onClick={() => onDurationChange(d.v)}
                  disabled={isWorking}
                  className={`flex-1 py-2 rounded-xl text-[11px] font-medium transition-all active:scale-95 ${
                    targetDuration === d.v
                      ? 'bg-white text-black'
                      : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/5'
                  }`}
                >
                  {d.l}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] text-white/40 uppercase tracking-wider font-semibold mb-2">镜头数</label>
            <div className="bg-white/5 rounded-xl p-3 border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[13px] text-white font-semibold">{shotCount}</span>
              </div>
              <input
                type="range"
                min={3}
                max={20}
                value={shotCount}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onShotCountChange(Number(e.target.value))}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-white/10"
                style={{ background: `linear-gradient(to right, white ${((shotCount - 3) / 17) * 100}%, rgba(255,255,255,0.1) ${((shotCount - 3) / 17) * 100}%)` }}
                disabled={isWorking}
              />
            </div>
          </div>
        </div>
      </div>

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
        disabled={isWorking || !concept.trim()}
        className="w-full h-11 bg-white rounded-xl flex items-center justify-center gap-2 text-black font-semibold text-[14px] hover:bg-white/90 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-white/10"
      >
        {isWorking ? (
          <>
            <Loader size={16} className="animate-spin" />
            <span>生成中...</span>
          </>
        ) : (
          <>
            <Sparkles size={16} />
            <span>生成剧本</span>
          </>
        )}
      </button>

      {/* 生成结果 */}
      {storyData && (
        <div className="border-t border-white/5 pt-4">
          <button
            onClick={() => setShowStoryData(!showStoryData)}
            className="flex items-center justify-between w-full text-[12px] font-medium text-white/50 hover:text-white/80 transition-colors"
          >
            <span className="flex items-center gap-2">
              <FileText size={14} />
              剧本详情
            </span>
            {showStoryData ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {showStoryData && (
            <div className="mt-4 space-y-4">
              {/* 标题和概要 */}
              <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                <div className="text-[14px] font-semibold text-white mb-1">{storyData.title}</div>
                <div className="text-[12px] text-white/50">{storyData.logline}</div>
                <div className="text-[11px] text-white/30 mt-2">主题: {storyData.theme}</div>
              </div>

              {/* 角色列表 */}
              <div>
                <div className="flex items-center gap-2 text-[11px] text-white/40 uppercase tracking-wider font-semibold mb-2">
                  <Users size={12} />
                  <span>角色 ({storyData.characters.length})</span>
                </div>
                <div className="space-y-2">
                  {storyData.characters.map((char: Character) => (
                    <div key={char.id} className="p-3 bg-white/5 rounded-xl border border-white/5">
                      <div className="text-[13px] font-medium text-white">{char.name}</div>
                      <div className="text-[11px] text-white/40 line-clamp-2 mt-1">{char.description}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 场景列表 */}
              <div>
                <div className="flex items-center gap-2 text-[11px] text-white/40 uppercase tracking-wider font-semibold mb-2">
                  <MapPin size={12} />
                  <span>场景 ({storyData.scenes.length})</span>
                </div>
                <div className="space-y-2">
                  {storyData.scenes.map((scene: Scene) => (
                    <div key={scene.id} className="p-3 bg-white/5 rounded-xl border border-white/5">
                      <div className="text-[13px] font-medium text-white">
                        场景 {scene.sceneNumber}: {scene.location}
                      </div>
                      <div className="text-[11px] text-white/40 mt-1">{scene.timeOfDay} · {scene.mood}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 镜头提示 */}
              <div className="flex items-center gap-2 p-3 bg-white/5 rounded-xl border border-white/5">
                <Film size={14} className="text-white/30" />
                <span className="text-[12px] text-white/40">{storyData.shots.length} 个镜头已生成</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
