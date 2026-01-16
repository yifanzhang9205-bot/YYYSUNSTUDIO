import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, Grid3X3, Check, Trash2, RotateCcw } from 'lucide-react';

interface GridSplitterNodeProps {
  inputImage?: string;
  croppedImages?: string[];
  selectedIndex?: number;
  outputImage?: string;
  isWorking?: boolean;
  onUpdate: (data: {
    inputImage?: string;
    croppedImages?: string[];
    selectedIndex?: number;
    outputImage?: string;
  }) => void;
}

/**
 * 九宫格处理节点
 * - 上传 21:9 九宫格图片
 * - 自动切割成 9 张
 * - 双击选择一张作为输出（放大覆盖）
 * - 再次双击回到九宫格
 */
export const GridSplitterNode: React.FC<GridSplitterNodeProps> = ({
  inputImage,
  croppedImages = [],
  selectedIndex,
  onUpdate
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 是否处于单图展示模式
  const hasSelection = selectedIndex !== undefined && selectedIndex >= 0;
  const isSingleView = hasSelection && croppedImages.length > 0;

  /**
   * 切割九宫格图片
   */
  const cropGridImage = useCallback(async (imageUrl: string): Promise<string[]> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) { reject(new Error('Canvas not available')); return; }
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('Context not available')); return; }

        // 21:9 图片切成 3x3，每个格子是 7:3 比例
        const cellWidth = Math.floor(img.width / 3);
        const cellHeight = Math.floor(img.height / 3);
        canvas.width = cellWidth;
        canvas.height = cellHeight;

        const results: string[] = [];
        for (let row = 0; row < 3; row++) {
          for (let col = 0; col < 3; col++) {
            ctx.clearRect(0, 0, cellWidth, cellHeight);
            ctx.drawImage(img, col * cellWidth, row * cellHeight, cellWidth, cellHeight, 0, 0, cellWidth, cellHeight);
            results.push(canvas.toDataURL('image/jpeg', 0.92));
          }
        }
        resolve(results);
      };
      img.onerror = () => reject(new Error('图片加载失败'));
      img.src = imageUrl;
    });
  }, []);

  /**
   * 处理文件上传
   */
  const handleFileSelect = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setIsProcessing(true);
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      try {
        const cropped = await cropGridImage(dataUrl);
        onUpdate({
          inputImage: dataUrl,
          croppedImages: cropped,
          selectedIndex: undefined,
          outputImage: undefined
        });
      } catch (err) {
        console.error('切割失败:', err);
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsDataURL(file);
  }, [cropGridImage, onUpdate]);

  /**
   * 外部输入图片变化时自动切割
   */
  const prevInputImageRef = useRef<string | undefined>(undefined);
  
  useEffect(() => {
    // 检测输入图片是否变化
    const inputChanged = inputImage !== prevInputImageRef.current;
    prevInputImageRef.current = inputImage;
    
    if (inputImage && inputChanged && !isProcessing) {
      console.log('[GridSplitter] 检测到新输入图片，开始切割');
      setIsProcessing(true);
      cropGridImage(inputImage)
        .then(cropped => {
          console.log('[GridSplitter] 切割完成，共', cropped.length, '张');
          onUpdate({ 
            croppedImages: cropped,
            selectedIndex: undefined,
            outputImage: undefined
          });
        })
        .catch(err => {
          console.error('[GridSplitter] 切割失败:', err);
        })
        .finally(() => setIsProcessing(false));
    }
  }, [inputImage, isProcessing, cropGridImage, onUpdate]);

  /**
   * 双击选择图片
   */
  const handleSelect = useCallback((index: number) => {
    console.log('[GridSplitter] 选择图片:', index, '当前选中:', selectedIndex);
    onUpdate({ 
      selectedIndex: index, 
      outputImage: croppedImages[index] 
    });
  }, [croppedImages, onUpdate, selectedIndex]);

  /**
   * 回到九宫格
   */
  const handleBackToGrid = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    console.log('[GridSplitter] 返回九宫格');
    onUpdate({ 
      selectedIndex: undefined, 
      outputImage: undefined 
    });
  }, [onUpdate]);

  /**
   * 清除所有
   */
  const handleClear = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止事件冒泡
    e.preventDefault();
    console.log('[GridSplitter] 清除所有图片');
    onUpdate({ 
      inputImage: null,  // 明确传 null 表示用户主动清除
      croppedImages: [], 
      selectedIndex: undefined, 
      outputImage: undefined 
    });
  }, [onUpdate]);

  // 拖拽
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = () => setDragOver(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#0a0a0a] rounded-2xl overflow-hidden">
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
      {/* 头部 */}
      <div className="h-11 bg-[#1c1c1e]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-2">
          <Grid3X3 size={16} className="text-white/40" />
          <span className="text-[13px] text-white/70 font-medium">九宫格处理</span>
          {isSingleView && (
            <span className="text-[11px] text-white/40 ml-1">· 已选第 {(selectedIndex ?? 0) + 1} 张</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {isSingleView && (
            <button
              onClick={handleBackToGrid}
              onMouseDown={(e) => e.stopPropagation()}
              className="h-7 px-2.5 rounded-lg bg-white/5 hover:bg-white/10 flex items-center gap-1.5 text-white/50 hover:text-white/80 transition-all text-xs"
            >
              <RotateCcw size={12} />
              <span>重选</span>
            </button>
          )}
          {inputImage && (
            <button
              onClick={handleClear}
              onMouseDown={(e) => e.stopPropagation()}
              className="w-7 h-7 rounded-lg bg-white/5 hover:bg-red-500/20 flex items-center justify-center text-white/40 hover:text-red-400 transition-all"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* 内容区 */}
      <div className="flex-1 p-3 overflow-hidden flex flex-col">
        
        {/* 无图片 - 上传区域 */}
        {!inputImage && !isProcessing && (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`flex-1 flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${
              dragOver ? 'border-white/40 bg-white/5' : 'border-white/10 hover:border-white/20 hover:bg-white/5'
            }`}
          >
            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center">
              <Upload size={24} className="text-white/30" />
            </div>
            <div className="text-center">
              <p className="text-sm text-white/50 font-medium">上传九宫格图片</p>
              <p className="text-xs text-white/30 mt-1">支持 21:9 比例</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(file);
                e.target.value = '';
              }}
            />
          </div>
        )}

        {/* 处理中 */}
        {isProcessing && (
          <div className="flex-1 flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            <span className="text-sm text-white/50">正在处理...</span>
          </div>
        )}

        {/* 单图模式 - 选中的图片覆盖整个区域 */}
        {!isProcessing && isSingleView && (
          <div 
            className="flex-1 relative rounded-2xl overflow-hidden cursor-pointer group"
            onDoubleClick={handleBackToGrid}
          >
            <img 
              src={croppedImages[selectedIndex!]} 
              alt=""
              className="w-full h-full object-contain bg-black/30"
            />
            {/* 选中标记 */}
            <div className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
              <Check size={18} className="text-black" strokeWidth={2.5} />
            </div>
            {/* 提示 */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
              <div className="px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-full">
                <span className="text-xs text-white font-medium">第 {(selectedIndex ?? 0) + 1} 张</span>
              </div>
              <div className="px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-xs text-white/70">双击重新选择</span>
              </div>
            </div>
          </div>
        )}

        {/* 九宫格模式 - 21:9 整体比例 */}
        {!isProcessing && inputImage && croppedImages.length > 0 && !isSingleView && (
          <div className="flex-1 flex flex-col">
            {/* 九宫格容器 - 保持 21:9 比例 */}
            <div className="w-full aspect-[21/9] bg-black/20 rounded-2xl p-1 grid grid-cols-3 grid-rows-3 gap-1">
              {croppedImages.map((img, i) => (
                <div
                  key={i}
                  onDoubleClick={() => handleSelect(i)}
                  className="relative rounded-lg overflow-hidden cursor-pointer transition-all hover:ring-2 hover:ring-white/40 hover:z-10 active:scale-[0.98]"
                >
                  <img src={img} alt="" className="w-full h-full object-cover" draggable={false} />
                  {/* 编号 */}
                  <div className="absolute bottom-1 left-1 w-5 h-5 rounded bg-black/60 flex items-center justify-center text-[10px] font-bold text-white/80">
                    {i + 1}
                  </div>
                </div>
              ))}
            </div>
            {/* 底部提示 */}
            <div className="mt-3 text-center">
              <span className="text-xs text-white/40">双击选择一张图片</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GridSplitterNode;
