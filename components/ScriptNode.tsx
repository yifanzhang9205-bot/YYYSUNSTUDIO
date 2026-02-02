import React, { useState } from 'react';
import { Film, Users, MapPin, Camera, ChevronDown, ChevronRight, Edit2, Check, X, Play } from 'lucide-react';
import { ScriptData } from '../types';

interface ScriptNodeProps {
  scriptData?: ScriptData;
  isGenerating: boolean;
  error?: string;
  
  onGenerate: (userIdea: string) => void;
  onUpdate: (data: ScriptData) => void;
  onCreateWorkflow: () => void;
  onGenerateShot: (shotId: string) => void;
}

type ViewMode = 'overview' | 'characters' | 'scenes' | 'shots';

export const ScriptNode: React.FC<ScriptNodeProps> = ({
  scriptData,
  isGenerating,
  error,
  onGenerate,
  onUpdate,
  onCreateWorkflow,
  onGenerateShot,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [expandedShotId, setExpandedShotId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(scriptData?.title || '');
  
  // 输入框状态
  const [showInputDialog, setShowInputDialog] = useState(false);
  const [userIdea, setUserIdea] = useState('');

  // 处理生成剧本
  const handleGenerate = () => {
    if (!userIdea.trim()) {
      return;
    }
    onGenerate(userIdea);
    setShowInputDialog(false);
    setUserIdea('');
  };

  // 空状态 - 极简 + 清晰
  if (!scriptData) {
    return (
      <>
        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100">
          {/* 图标 */}
          <div className="mb-12">
            <Film size={36} strokeWidth={0.75} className="text-white/30" />
          </div>
          
          {/* 标题 */}
          <h3 className="text-[15px] font-normal text-white/70 mb-16 tracking-[0.25em]" style={{ fontFamily: '"Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif' }}>
            创建剧本
          </h3>
          
          {/* 按钮 */}
          <button
            onClick={() => setShowInputDialog(true)}
            disabled={isGenerating}
            className="px-10 py-2.5 text-white/50 hover:text-white/70 text-[13px] font-normal transition-colors duration-300 tracking-[0.15em] border border-white/15 hover:border-white/25 rounded-sm disabled:opacity-20"
            style={{ fontFamily: '"Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif' }}
          >
            {isGenerating ? '创作中' : '开始'}
          </button>
        </div>

        {/* 输入对话框 - 自适应大小 */}
        {showInputDialog && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-gray-100/90" onClick={() => setShowInputDialog(false)}>
            <div className="bg-gray-100 border border-white/15 rounded-sm p-10 w-[600px] max-w-[85vw]" onClick={(e) => e.stopPropagation()}>
              {/* 输入框 - 更大更清晰 */}
              <textarea
                value={userIdea}
                onChange={(e) => setUserIdea(e.target.value)}
                placeholder="输入创意"
                className="w-full h-40 px-0 py-0 bg-transparent border-0 border-b border-white/15 text-[15px] text-white/70 placeholder-white/25 focus:outline-none focus:border-white/30 transition-colors resize-none font-normal tracking-wide leading-relaxed"
                style={{ fontFamily: '"Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif' }}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    handleGenerate();
                  } else if (e.key === 'Escape') {
                    setShowInputDialog(false);
                    setUserIdea('');
                  }
                }}
              />
              
              {/* 底部 */}
              <div className="flex items-center justify-end mt-8 gap-8">
                <button
                  onClick={() => {
                    setShowInputDialog(false);
                    setUserIdea('');
                  }}
                  className="text-[12px] text-white/40 hover:text-white/60 font-normal transition-colors tracking-[0.15em]"
                  style={{ fontFamily: '"Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif' }}
                >
                  取消
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={!userIdea.trim()}
                  className="text-[12px] text-white/60 hover:text-white/80 font-normal transition-colors disabled:opacity-20 tracking-[0.15em]"
                  style={{ fontFamily: '"Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif' }}
                >
                  生成
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // 折叠状态 - 清晰可读
  if (viewMode === 'overview') {
    return (
      <div className="w-full h-full flex flex-col bg-gray-100">
        {/* 头部 */}
        <div className="px-6 py-4 border-b border-white/8 flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Film size={16} strokeWidth={0.75} className="text-white/30 shrink-0" />
            <div className="flex-1 min-w-0">
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="flex-1 px-0 py-1 bg-transparent border-0 border-b border-white/15 text-[13px] text-white/70 focus:outline-none focus:border-white/30 transition-colors font-normal"
                    style={{ fontFamily: '"Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif' }}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        onUpdate({ ...scriptData, title: editedTitle });
                        setIsEditing(false);
                      } else if (e.key === 'Escape') {
                        setEditedTitle(scriptData.title);
                        setIsEditing(false);
                      }
                    }}
                  />
                  <button onClick={() => { onUpdate({ ...scriptData, title: editedTitle }); setIsEditing(false); }} className="p-1 hover:bg-white/5 rounded transition-colors">
                    <Check size={12} strokeWidth={1.5} className="text-white/50" />
                  </button>
                  <button onClick={() => { setEditedTitle(scriptData.title); setIsEditing(false); }} className="p-1 hover:bg-white/5 rounded transition-colors">
                    <X size={12} strokeWidth={1.5} className="text-white/50" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 group/title">
                  <h3 className="text-[13px] font-normal text-white/70 truncate tracking-wide" style={{ fontFamily: '"Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif' }}>
                    {scriptData.title}
                  </h3>
                  <button onClick={() => setIsEditing(true)} className="p-1 hover:bg-white/5 rounded opacity-0 group-hover/title:opacity-100 transition-all shrink-0">
                    <Edit2 size={11} strokeWidth={1.5} className="text-white/40" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 统计 */}
        <div className="flex-1 flex items-center justify-center">
          <div className="flex gap-16">
            <div className="flex flex-col items-center">
              <div className="text-[28px] font-light text-white/50 mb-1.5">{scriptData.characters.length}</div>
              <div className="text-[11px] text-white/30 font-normal tracking-[0.15em]" style={{ fontFamily: '"Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif' }}>角色</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-[28px] font-light text-white/50 mb-1.5">{scriptData.scenes.length}</div>
              <div className="text-[11px] text-white/30 font-normal tracking-[0.15em]" style={{ fontFamily: '"Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif' }}>场景</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-[28px] font-light text-white/50 mb-1.5">{scriptData.shots.length}</div>
              <div className="text-[11px] text-white/30 font-normal tracking-[0.15em]" style={{ fontFamily: '"Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif' }}>镜头</div>
            </div>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="px-6 py-4 border-t border-white/8 flex gap-4">
          <button
            onClick={() => setViewMode('shots')}
            className="flex-1 py-2 text-white/40 hover:text-white/60 text-[12px] font-normal transition-colors tracking-[0.15em]"
            style={{ fontFamily: '"Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif' }}
          >
            详情
          </button>
          <button
            onClick={onCreateWorkflow}
            className="flex-1 py-2 text-white/50 hover:text-white/70 text-[12px] font-normal transition-colors tracking-[0.15em] border border-white/15 hover:border-white/25 rounded-sm"
            style={{ fontFamily: '"Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif' }}
          >
            生成工作流
          </button>
        </div>
      </div>
    );
  }

  // 展开状态 - 极简
  return (
    <div className="w-full h-full flex flex-col bg-gray-100 overflow-hidden">
      {/* 头部 */}
      <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3 shrink-0">
        <button onClick={() => setViewMode('overview')} className="p-1 hover:bg-white/5 rounded transition-colors">
          <ChevronDown size={14} strokeWidth={1} className="text-white/40" />
        </button>
        <h3 className="text-[12px] font-light text-white/60 tracking-wide" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif' }}>
          {scriptData.title}
        </h3>
      </div>

      {/* Tab */}
      <div className="px-6 py-3 border-b border-white/5 flex gap-6 shrink-0">
        {[
          { key: 'characters' as ViewMode, label: '角色' },
          { key: 'scenes' as ViewMode, label: '场景' },
          { key: 'shots' as ViewMode, label: '分镜' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setViewMode(tab.key)}
            className={`text-[11px] font-light transition-colors tracking-[0.2em] pb-1 ${
              viewMode === tab.key
                ? 'text-white/60 border-b border-white/20'
                : 'text-white/30 hover:text-white/40'
            }`}
            style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif' }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 内容 */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        {viewMode === 'characters' && (
          <>
            {scriptData.characters.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-white/20">
                <p className="text-[11px] font-light tracking-[0.2em]">暂无数据</p>
              </div>
            ) : (
              scriptData.characters.map((char) => (
                <div key={char.id} className="py-4 border-b border-white/5">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-[12px] font-light text-white/60 tracking-wide" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif' }}>
                      {char.name}
                    </h4>
                    <button className="text-[10px] text-white/30 hover:text-white/50 font-light transition-colors tracking-[0.2em]">
                      生成
                    </button>
                  </div>
                  <p className="text-[11px] text-white/40 leading-relaxed font-light">{char.description}</p>
                </div>
              ))
            )}
          </>
        )}

        {viewMode === 'scenes' && (
          <>
            {scriptData.scenes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-white/20">
                <p className="text-[11px] font-light tracking-[0.2em]">暂无数据</p>
              </div>
            ) : (
              scriptData.scenes.map((scene) => (
                <div key={scene.id} className="py-4 border-b border-white/5">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-[12px] font-light text-white/60 tracking-wide" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif' }}>
                      {scene.location}
                    </h4>
                    <button className="text-[10px] text-white/30 hover:text-white/50 font-light transition-colors tracking-[0.2em]">
                      生成
                    </button>
                  </div>
                  <p className="text-[11px] text-white/40 leading-relaxed font-light">{scene.description}</p>
                </div>
              ))
            )}
          </>
        )}

        {viewMode === 'shots' && (
          <>
            {scriptData.shots.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-white/20">
                <p className="text-[11px] font-light tracking-[0.2em]">暂无数据</p>
              </div>
            ) : (
              scriptData.shots.map((shot) => (
                <div key={shot.id} className="py-4 border-b border-white/5">
                  <button
                    onClick={() => setExpandedShotId(expandedShotId === shot.id ? null : shot.id)}
                    className="w-full flex items-center justify-between mb-2"
                  >
                    <div className="flex items-center gap-2">
                      {expandedShotId === shot.id ? (
                        <ChevronDown size={12} strokeWidth={1} className="text-white/30" />
                      ) : (
                        <ChevronRight size={12} strokeWidth={1} className="text-white/30" />
                      )}
                      <span className="text-[12px] font-light text-white/60 tracking-wide" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif' }}>
                        镜头 {shot.shotNumber}
                      </span>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); onGenerateShot(shot.id); }}
                      className="text-[10px] text-white/30 hover:text-white/50 font-light transition-colors tracking-[0.2em]"
                    >
                      生成
                    </button>
                  </button>

                  {expandedShotId === shot.id && (
                    <div className="pl-5 space-y-2 mt-2">
                      <p className="text-[11px] text-white/40 leading-relaxed font-light">{shot.action}</p>
                      {shot.dialogue && (
                        <p className="text-[11px] text-white/30 italic leading-relaxed font-light">"{shot.dialogue}"</p>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
};

