import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Grid3X3, Maximize2, Check } from 'lucide-react';

interface GridImageSelectorProps {
  /** 原始九宫格图片 URL（21:9 比例） */
  gridImageUrl: string;
  /** 当前选中的格子索引（0-8） */
  selectedIndex?: number;
  /** 选中格子变化时的回调 */
  onSelect?: (index: number, croppedImageUrl: string) => void;
  /** 是否显示确认按钮 */
  showConfirmButton?: boolean;
  /** 确认选择时的回调 */
  onConfirm?: (index: number, croppedImageUrl: string) => void;
  /** 自定义类名 */
  className?: string;
}

interface CroppedImage {
  index: number;
  url: string;
}

/**
 * 九宫格图片选择器
 * 
 * 功能：
 * 1. 自动识别并切割 21:9 的九宫格图片为 9 张独立图片
 * 2. 默认展示 3x3 九宫格视图
 * 3. 双击某张图片 → 单独展示该图片
 * 4. 再次双击 → 回到九宫格视图
 */
export const GridImageSelector: React.FC<GridImageSelectorProps> = ({
  gridImageUrl,
  selectedIndex,
  onSelect,
  showConfirmButton = false,
  onConfirm,
  className = ''
}) => {
  // 切割后的 9 张图片
  const [croppedImages, setCroppedImages] = useState<CroppedImage[]>([]);
  // 是否处于单图展示模式
  const [isSingleView, setIsSingleView] = useState(false);
  // 当前展示/选中的图片索引
  const [currentIndex, setCurrentIndex] = useState<number>(selectedIndex ?? -1);
  // 加载状态
  const [isLoading, setIsLoading] = useState(true);
  // 错误信息
  const [error, setError] = useState<string | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  /**
   * 将九宫格图片切割成 9 张独立图片
   */
  const cropGridImage = useCallback(async (imageUrl: string): Promise<CroppedImage[]> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) {
          reject(new Error('Canvas not available'));
          return;
        }
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        // 计算每个格子的尺寸（3列 x 3行）
        const cellWidth = Math.floor(img.width / 3);
        const cellHeight = Math.floor(img.height / 3);
        
        // 设置 canvas 尺寸为单个格子大小
        canvas.width = cellWidth;
        canvas.height = cellHeight;

        const results: CroppedImage[] = [];

        // 切割 9 个格子
        for (let row = 0; row < 3; row++) {
          for (let col = 0; col < 3; col++) {
            const index = row * 3 + col;
            
            // 清空 canvas
            ctx.clearRect(0, 0, cellWidth, cellHeight);
            
            // 绘制对应区域
            ctx.drawImage(
              img,
              col * cellWidth,  // 源 x
              row * cellHeight, // 源 y
              cellWidth,        // 源宽度
              cellHeight,       // 源高度
              0,                // 目标 x
              0,                // 目标 y
              cellWidth,        // 目标宽度
              cellHeight        // 目标高度
            );
            
            // 转换为 data URL
            const croppedUrl = canvas.toDataURL('image/jpeg', 0.92);
            results.push({ index, url: croppedUrl });
          }
        }

        resolve(results);
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = imageUrl;
    });
  }, []);

  // 当图片 URL 变化时，重新切割
  useEffect(() => {
    if (!gridImageUrl) {
      setCroppedImages([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    cropGridImage(gridImageUrl)
      .then(images => {
        setCroppedImages(images);
        setIsLoading(false);
        // 如果有预设的选中索引，设置它
        if (selectedIndex !== undefined && selectedIndex >= 0) {
          setCurrentIndex(selectedIndex);
        }
      })
      .catch(err => {
        console.error('[GridImageSelector] 切割失败:', err);
        setError('图片处理失败');
        setIsLoading(false);
      });
  }, [gridImageUrl, cropGridImage, selectedIndex]);

  /**
   * 处理双击事件
   */
  const handleDoubleClick = useCallback((index: number) => {
    if (isSingleView && currentIndex === index) {
      // 当前是单图模式且点击的是同一张 → 回到九宫格
      setIsSingleView(false);
    } else {
      // 切换到单图模式
      setIsSingleView(true);
      setCurrentIndex(index);
      
      // 触发选择回调
      const croppedImage = croppedImages.find(img => img.index === index);
      if (croppedImage && onSelect) {
        onSelect(index, croppedImage.url);
      }
    }
  }, [isSingleView, currentIndex, croppedImages, onSelect]);

  /**
   * 处理单击事件（仅在九宫格模式下高亮选中）
   */
  const handleClick = useCallback((index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isSingleView) {
      setCurrentIndex(index);
    }
  }, [isSingleView]);

  /**
   * 确认选择
   */
  const handleConfirm = useCallback(() => {
    if (currentIndex >= 0 && onConfirm) {
      const croppedImage = croppedImages.find(img => img.index === currentIndex);
      if (croppedImage) {
        onConfirm(currentIndex, croppedImage.url);
      }
    }
  }, [currentIndex, croppedImages, onConfirm]);

  /**
   * 切换视图模式
   */
  const toggleViewMode = useCallback(() => {
    setIsSingleView(prev => !prev);
  }, []);

  // 隐藏的 canvas 用于图片处理
  const hiddenCanvas = (
    <canvas 
      ref={canvasRef} 
      style={{ display: 'none' }} 
    />
  );

  // 加载中状态
  if (isLoading) {
    return (
      <div className={`flex items-center justify-center bg-black/20 rounded-2xl ${className}`}>
        {hiddenCanvas}
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          <span className="text-xs text-white/50">正在处理图片...</span>
        </div>
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <div className={`flex items-center justify-center bg-black/20 rounded-2xl ${className}`}>
        {hiddenCanvas}
        <span className="text-xs text-red-400">{error}</span>
      </div>
    );
  }

  // 无图片状态
  if (croppedImages.length === 0) {
    return (
      <div className={`flex items-center justify-center bg-black/20 rounded-2xl ${className}`}>
        {hiddenCanvas}
        <span className="text-xs text-white/40">暂无图片</span>
      </div>
    );
  }

  // 单图展示模式
  if (isSingleView && currentIndex >= 0) {
    const selectedImage = croppedImages.find(img => img.index === currentIndex);
    
    return (
      <div className={`relative ${className}`}>
        {hiddenCanvas}
        
        {/* 单图展示 */}
        <div 
          className="relative w-full aspect-square rounded-2xl overflow-hidden cursor-pointer group"
          onDoubleClick={() => handleDoubleClick(currentIndex)}
        >
          <img 
            src={selectedImage?.url} 
            alt={`选中图片 ${currentIndex + 1}`}
            className="w-full h-full object-cover transition-transform duration-300"
          />
          
          {/* 悬浮提示 */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <span className="text-white/0 group-hover:text-white/70 text-sm font-medium transition-colors">
              双击返回九宫格
            </span>
          </div>
          
          {/* 选中标记 */}
          <div className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
            <Check size={18} className="text-black" strokeWidth={2.5} />
          </div>
          
          {/* 图片编号 */}
          <div className="absolute bottom-3 left-3 px-2.5 py-1 bg-black/60 backdrop-blur-sm rounded-full">
            <span className="text-xs text-white font-medium">第 {currentIndex + 1} 张</span>
          </div>
        </div>

        {/* 底部操作栏 */}
        <div className="flex items-center justify-between mt-3">
          <button
            onClick={toggleViewMode}
            className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-white/70 hover:text-white transition-all active:scale-95"
          >
            <Grid3X3 size={16} />
            <span className="text-xs font-medium">查看全部</span>
          </button>
          
          {showConfirmButton && (
            <button
              onClick={handleConfirm}
              className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-xl font-medium text-xs hover:bg-white/90 transition-all active:scale-95 shadow-lg shadow-white/20"
            >
              <Check size={14} />
              <span>确认选择</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // 九宫格展示模式
  return (
    <div className={`relative ${className}`}>
      {hiddenCanvas}
      
      {/* 3x3 网格 */}
      <div className="grid grid-cols-3 gap-1.5 rounded-2xl overflow-hidden bg-black/20 p-1.5">
        {croppedImages.map((img) => (
          <div
            key={img.index}
            onClick={(e) => handleClick(img.index, e)}
            onDoubleClick={() => handleDoubleClick(img.index)}
            className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer transition-all duration-200 ${
              currentIndex === img.index
                ? 'ring-2 ring-white ring-offset-1 ring-offset-black/50 scale-[1.02] z-10'
                : 'hover:ring-1 hover:ring-white/30 hover:scale-[1.01]'
            }`}
          >
            <img 
              src={img.url} 
              alt={`格子 ${img.index + 1}`}
              className="w-full h-full object-cover"
              draggable={false}
            />
            
            {/* 编号标签 */}
            <div className={`absolute bottom-1 left-1 w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold transition-all ${
              currentIndex === img.index
                ? 'bg-white text-black'
                : 'bg-black/50 text-white/70'
            }`}>
              {img.index + 1}
            </div>
            
            {/* 选中标记 */}
            {currentIndex === img.index && (
              <div className="absolute top-1 right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-md">
                <Check size={12} className="text-black" strokeWidth={3} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 底部操作栏 */}
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-2 text-white/40">
          <Grid3X3 size={14} />
          <span className="text-xs">双击放大查看</span>
        </div>
        
        {showConfirmButton && currentIndex >= 0 && (
          <button
            onClick={handleConfirm}
            className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-xl font-medium text-xs hover:bg-white/90 transition-all active:scale-95 shadow-lg shadow-white/20"
          >
            <Check size={14} />
            <span>确认选择</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default GridImageSelector;
