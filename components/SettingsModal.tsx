import React, { useState, useEffect } from 'react';
import { X, Save, Key, ExternalLink } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [polloKey, setPolloKey] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('pollo_api_key');
    if (stored) setPolloKey(stored);
  }, [isOpen]);

  const handleSave = () => {
    localStorage.setItem('pollo_api_key', polloKey.trim());
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
    setTimeout(onClose, 500);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl flex items-center justify-center" 
      onClick={onClose}
    >
      <div 
        className="w-[480px] bg-[#1c1c1e]/95 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-white/5 flex justify-between items-center bg-white/5">
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all active:scale-95"
          >
            <X size={14} className="text-white/60" />
          </button>
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-white/90">设置</span>
            <div className="w-9 h-9 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10">
                <Key size={16} className="text-white/70" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                  Pollo.ai API Key
                </label>
                <a 
                  href="https://pollo.ai/dashboard/api-keys" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="flex items-center gap-1.5 text-[11px] text-white/50 hover:text-white/80 transition-colors"
                >
                    <span>获取 Key</span>
                    <ExternalLink size={10} />
                </a>
            </div>
            
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-white/30 font-mono text-xs">key-</span>
                </div>
                <input 
                    type="password" 
                    autoComplete="off"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all font-mono"
                    placeholder="粘贴您的 Pollo API Key..."
                    value={polloKey}
                    onChange={(e) => setPolloKey(e.target.value)}
                />
            </div>
            <p className="text-[11px] text-white/40 leading-relaxed px-1">
                用于激活 Wan 2.1 / Wan 2.5 视频生成模型。密钥仅保存在您的浏览器本地存储中，不会上传至服务器。
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-white/5 bg-black/20 flex justify-end">
            <button 
                onClick={handleSave}
                className={`px-8 py-3 rounded-2xl text-sm font-semibold transition-all active:scale-95 ${
                  isSaved 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                    : 'bg-white text-black hover:bg-white/90 shadow-lg shadow-white/10'
                }`}
            >
                {isSaved ? '✓ 已保存' : '保存设置'}
            </button>
        </div>
      </div>
    </div>
  );
};
