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
      className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center" 
      onClick={onClose}
    >
      <div 
        className="w-[480px] bg-white border border-black rounded-2xl shadow-xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-black flex justify-between items-center bg-gray-50">
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-white hover:bg-gray-50 border border-black flex items-center justify-center transition-all active:scale-95"
          >
            <X size={14} className="text-black" />
          </button>
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-black">设置</span>
            <div className="w-9 h-9 rounded-md bg-blue-50 flex items-center justify-center border border-blue-200">
                <Key size={16} className="text-blue-600" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Pollo.ai API Key
                </label>
                <a 
                  href="https://pollo.ai/dashboard/api-keys" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="flex items-center gap-1.5 text-[11px] text-gray-500 hover:text-blue-600 transition-colors"
                >
                    <span>获取 Key</span>
                    <ExternalLink size={10} />
                </a>
            </div>
            
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-gray-400 font-mono text-xs">key-</span>
                </div>
                <input 
                    type="password" 
                    autoComplete="off"
                    className="w-full bg-white border border-black rounded-md py-4 pl-12 pr-4 text-sm text-black placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all font-mono"
                    placeholder="粘贴您的 Pollo API Key..."
                    value={polloKey}
                    onChange={(e) => setPolloKey(e.target.value)}
                />
            </div>
            <p className="text-[11px] text-gray-500 leading-relaxed px-1">
                用于激活 Wan 2.1 / Wan 2.5 视频生成模型。密钥仅保存在您的浏览器本地存储中，不会上传至服务器。
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-black bg-gray-50 flex justify-end">
            <button 
                onClick={handleSave}
                className={`px-8 py-3 rounded-md text-sm font-semibold transition-all active:scale-95 ${
                  isSaved 
                    ? 'bg-green-50 text-green-600 border border-green-200' 
                    : 'bg-black text-white hover:bg-blue-600 shadow-sm'
                }`}
            >
                {isSaved ? '✓ 已保存' : '保存设置'}
            </button>
        </div>
      </div>
    </div>
  );
};
