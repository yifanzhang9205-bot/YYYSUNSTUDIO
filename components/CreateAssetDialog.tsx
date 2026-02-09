/**
 * CreateAssetDialog - 创建资产对话框
 * 
 * 功能：
 * - 输入资产名称
 * - 选择分类
 * - 预览缩略图（简化版）
 * 
 * 架构：UI Layer
 */

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { AssetCategory } from '../core/stores/assetLibraryStore';

interface CreateAssetDialogProps {
  onConfirm: (name: string, category: AssetCategory) => void;
  onCancel: () => void;
}

export const CreateAssetDialog: React.FC<CreateAssetDialogProps> = ({
  onConfirm,
  onCancel,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<AssetCategory>('other');

  const handleConfirm = () => {
    if (!name.trim()) {
      alert('请输入资产名称');
      return;
    }
    
    onConfirm(name.trim(), category);
  };

  const categories: { value: AssetCategory; label: string }[] = [
    { value: 'character', label: '人物' },
    { value: 'scene', label: '场景' },
    { value: 'object', label: '物品' },
    { value: 'style', label: '风格' },
    { value: 'other', label: '其他' },
  ];

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50">
      <div className="w-[480px] bg-white rounded-2xl shadow-2xl p-6">
        {/* 标题 */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">创建资产</h2>
          <button
            onClick={onCancel}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* 资产名称 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            资产名称 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="请输入资产名称"
            maxLength={50}
            className="w-full h-10 px-3 bg-white border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
            autoFocus
          />
        </div>

        {/* 选择分类 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            选择分类 <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={`h-10 px-3 rounded-lg text-sm font-medium transition-all ${
                  category === cat.value
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                } border`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* 按钮 */}
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="h-10 px-6 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleConfirm}
            className="h-10 px-6 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors"
          >
            确认创建
          </button>
        </div>
      </div>
    </div>
  );
};
