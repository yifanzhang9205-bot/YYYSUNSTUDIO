/**
 * AssetLibraryPanel - 资产库面板
 * 
 * 功能：
 * - 显示分类标签（全部、人物、场景、物品、风格、其他）
 * - 显示资产网格（2列）
 * - 显示资产卡片（缩略图 + 名称）
 * - 拖拽到画布
 * - 点击在画布中心创建
 * - 右键菜单（重命名、删除）
 * - 空状态
 * 
 * 架构：UI Layer
 */

import React, { useState } from 'react';
import { FolderHeart, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { useAssetLibraryStore, AssetCategory, Asset } from '../core/stores/assetLibraryStore';

interface AssetLibraryPanelProps {
  onUseAsset: (assetId: string, position: { x: number; y: number }) => void;
}

export const AssetLibraryPanel: React.FC<AssetLibraryPanelProps> = ({
  onUseAsset,
}) => {
  const assets = useAssetLibraryStore(state => state.assets);
  const selectedCategory = useAssetLibraryStore(state => state.selectedCategory);
  const setSelectedCategory = useAssetLibraryStore(state => state.setSelectedCategory);
  const getAssetsByCategory = useAssetLibraryStore(state => state.getAssetsByCategory);
  const updateAsset = useAssetLibraryStore(state => state.updateAsset);
  const deleteAsset = useAssetLibraryStore(state => state.deleteAsset);

  const [contextMenu, setContextMenu] = useState<{
    assetId: string;
    x: number;
    y: number;
  } | null>(null);

  // 处理点击"更多"按钮
  const handleMoreClick = (e: React.MouseEvent, asset: Asset) => {
    e.stopPropagation();
    
    // 获取按钮位置（相对于视口）
    const button = e.currentTarget as HTMLElement;
    const buttonRect = button.getBoundingClientRect();
    
    // 获取面板位置（相对于视口）
    const panel = button.closest('.asset-library-panel') as HTMLElement;
    const panelRect = panel?.getBoundingClientRect();
    
    if (!panelRect) return;
    
    // 计算菜单位置（相对于面板）
    const menuX = buttonRect.right - panelRect.left - 140; // 140 是菜单宽度，右对齐
    const menuY = buttonRect.bottom - panelRect.top + 4;   // 按钮下方 4px
    
    setContextMenu({
      assetId: asset.id,
      x: menuX,
      y: menuY,
    });
  };

  // 分类列表
  const categories: { value: AssetCategory | 'all'; label: string }[] = [
    { value: 'all', label: '全部' },
    { value: 'character', label: '人物' },
    { value: 'scene', label: '场景' },
    { value: 'object', label: '物品' },
    { value: 'style', label: '风格' },
    { value: 'other', label: '其他' },
  ];

  // 获取当前分类的资产
  const filteredAssets = getAssetsByCategory(selectedCategory);

  // 处理拖拽开始
  const handleDragStart = (e: React.DragEvent, asset: Asset) => {
    e.dataTransfer.setData('application/asset-id', asset.id);
    e.dataTransfer.effectAllowed = 'copy';
    console.log('[AssetLibraryPanel] 开始拖拽资产', { id: asset.id, name: asset.name });
  };

  // 处理点击资产（在画布中心创建）
  const handleClickAsset = (asset: Asset) => {
    console.log('[AssetLibraryPanel] 点击资产', { id: asset.id, name: asset.name });
    // 使用画布中心位置（由父组件计算）
    onUseAsset(asset.id, { x: 0, y: 0 });
  };

  // 关闭右键菜单
  const closeContextMenu = () => {
    setContextMenu(null);
  };

  // 重命名资产
  const handleRename = (assetId: string) => {
    const asset = assets.find(a => a.id === assetId);
    if (!asset) return;

    const newName = prompt('请输入新的资产名称', asset.name);
    if (newName && newName.trim() && newName.trim() !== asset.name) {
      updateAsset(assetId, { name: newName.trim() });
    }
    closeContextMenu();
  };

  // 删除资产
  const handleDelete = (assetId: string) => {
    const asset = assets.find(a => a.id === assetId);
    if (!asset) return;

    const confirmed = window.confirm(`确认删除资产"${asset.name}"？\n\n此操作不可撤销。`);
    if (confirmed) {
      deleteAsset(assetId);
    }
    closeContextMenu();
  };

  // 生成首字母占位符
  const generateLetterThumbnail = (name: string) => {
    const firstLetter = name.charAt(0).toUpperCase();
    const colors = [
      '#3B82F6', // 蓝色
      '#10B981', // 绿色
      '#F59E0B', // 黄色
      '#EF4444', // 红色
      '#8B5CF6', // 紫色
      '#F97316', // 橙色
      '#06B6D4', // 青色
    ];
    const charCode = firstLetter.charCodeAt(0);
    const bgColor = colors[charCode % colors.length];

    return (
      <div
        className="w-full h-full flex items-center justify-center rounded-2xl"
        style={{ backgroundColor: bgColor }}
      >
        <span className="text-4xl font-bold text-white">{firstLetter}</span>
      </div>
    );
  };

  return (
    <div className="asset-library-panel w-96 h-full bg-white border border-gray-200 rounded-lg shadow-xl flex flex-col relative" style={{ fontFamily: '"Source Han Sans CN", "Noto Sans SC", sans-serif' }}>
      {/* 标题栏 - 减小高度 */}
      <div className="h-10 flex items-center justify-between px-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <FolderHeart size={16} className="text-gray-600" />
          <h3 className="text-xs font-semibold text-gray-700">
            资产库
          </h3>
        </div>
        <div className="text-[10px] text-gray-400 font-medium">
          {filteredAssets.length} 个
        </div>
      </div>

      {/* 分类标签 - 减小内边距，增加宽度以显示所有分类 */}
      <div className="px-3 py-2 bg-gray-50/50 border-b border-gray-100">
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat.value
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* 资产网格 */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
        {filteredAssets.length === 0 ? (
          // 空状态
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <FolderHeart size={32} className="text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-500 text-center mb-1">
              暂无资产
            </p>
            <p className="text-xs text-gray-400 text-center">
              框选节点后点击"添加到资产库"
            </p>
          </div>
        ) : (
          // 资产网格 - 3列布局
          <div className="grid grid-cols-3 gap-2">
            {filteredAssets.map((asset) => (
              <div
                key={asset.id}
                draggable={true}
                onDragStart={(e) => handleDragStart(e, asset)}
                onClick={() => handleClickAsset(asset)}
                className="group relative aspect-square bg-white border border-gray-200 rounded-2xl overflow-hidden cursor-grab active:cursor-grabbing hover:border-gray-400 hover:scale-[1.02] transition-all"
                title={asset.name}
              >
                {/* 缩略图 */}
                <div className="w-full h-full">
                  {asset.thumbnail ? (
                    <img
                      src={asset.thumbnail}
                      alt={asset.name}
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                    />
                  ) : (
                    generateLetterThumbnail(asset.name)
                  )}
                </div>

                {/* 资产名称 */}
                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-2">
                  <p className="text-[10px] text-white/90 truncate font-medium">
                    {asset.name}
                  </p>
                </div>

                {/* 更多按钮 - 点击显示菜单 */}
                <button
                  onClick={(e) => handleMoreClick(e, asset)}
                  className="absolute top-2 right-2 w-6 h-6 rounded-lg bg-black/50 hover:bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  title="更多操作"
                >
                  <MoreVertical size={14} className="text-white" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 更多菜单（点击"更多"按钮显示） - 相对于面板定位 */}
      {contextMenu && (
        <>
          {/* 遮罩层 - 覆盖整个面板 */}
          <div
            className="absolute inset-0 z-[9998]"
            onClick={closeContextMenu}
          />
          
          {/* 菜单 - 下拉框样式，紧贴按钮下方 */}
          <div
            className="absolute z-[9999] bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
            style={{
              left: `${contextMenu.x}px`,
              top: `${contextMenu.y}px`,
              minWidth: '140px',
              fontFamily: '"Source Han Sans CN", "Noto Sans SC", sans-serif',
            }}
          >
            <button
              onClick={() => handleRename(contextMenu.assetId)}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Edit2 size={16} className="text-gray-500" />
              <span>重命名</span>
            </button>
            <div className="h-px bg-gray-100" />
            <button
              onClick={() => handleDelete(contextMenu.assetId)}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <Trash2 size={16} />
              <span>删除</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};
