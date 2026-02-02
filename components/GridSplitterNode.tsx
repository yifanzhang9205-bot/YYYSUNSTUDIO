import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Grid3X3, Check, Trash2, RotateCcw, Maximize, X, Upload } from 'lucide-react';

interface GridSplitterNodeProps {
  inputImage?: string;
  croppedImages?: string[];
  selectedIndex?: number;
  outputImage?: string;
  isWorking?: boolean;
  isExpanded?: boolean;
  isSelected?: boolean;
  onUpdate: (data: {
    inputImage?: string | null;
    croppedImages?: string[];
    selectedIndex?: number;
    outputImage?: string;
  }) => void;
}

/**
 * 九宫格处理节点
 * 
 * 功能：
 * 1. 接受 3D 相机的图片
 * 2. 自动切割成 9 张（只在接收到新数据时）
 * 3. 双击任意一张可以放大
 * 4. 双击后拖动可以单张拖出（使用拖动手柄）
 * 5. 防止无限循环（使用 lastInputImage 跟踪）
 */
export const GridSplitterNode: React.FC<GridSplitterNodeProps> = ({
  inputImage,
  croppedImages = [],
  selectedIndex,
  isExpanded = true,
  isSelected = false,
  onUpdate
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 🔥 跟踪上一次的输入图片，防止重复切割
  const lastInputImageRef = useRef<string | undefined>(undefined);

  
  // 是否处于单图展示模式
  const hasSelection = selectedIndex !== undefined && selectedIndex >= 0 && selectedIndex < croppedImages.length;
  const isSingleView = hasSelection && croppedImages.length > 0;
  const selectedImage = hasSelection ? croppedImages[selectedIndex] : undefined;

  /**
   * 切割九宫格图片（高质量切割 + Blob URL 优化）
   */
  const cropGridImage = useCallback(async (imageUrl: string): Promise<string[]> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = async () => {
        const canvas = canvasRef.current;
        if (!canvas) { reject(new Error('Canvas not available')); return; }
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('Context not available')); return; }

        // 高质量切割设置
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // 精确计算尺寸
        const cellWidth = img.width / 3;
        const cellHeight = img.height / 3;
        
        canvas.width = Math.round(cellWidth);
        canvas.height = Math.round(cellHeight);

        const results: string[] = [];
        for (let row = 0; row < 3; row++) {
          for (let col = 0; col < 3; col++) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            ctx.drawImage(
              img, 
              col * cellWidth, 
              row * cellHeight, 
              cellWidth, 
              cellHeight, 
              0, 
              0, 
              canvas.width, 
              canvas.height
            );
            
            // 转换为 Blob URL（内存优化）
            const blob = await new Promise<Blob>((resolve) => {
              canvas.toBlob((b) => resolve(b!), 'image/webp', 0.95);
            });
            
            const blobUrl = URL.createObjectURL(blob);
            results.push(blobUrl);
          }
        }
        
        // 清理资源
        canvas.width = 0;
        canvas.height = 0;
        img.src = '';
        img.onload = null;
        img.onerror = null;
        
        resolve(results);
      };
      img.onerror = () => reject(new Error('图片加载失败'));
      img.src = imageUrl;
    });
  }, []);

  /**
   * 🔥 自动切割：只在接收到新数据时触发
   * 
   * 关键逻辑：
   * 1. 检查 inputImage 是否改变（与 lastInputImageRef 比较）
   * 2. 如果改变，触发切割
   * 3. 切割完成后，更新 lastInputImageRef
   * 4. 这样可以防止无限循环，同时支持 3D 相机反复工作
   */
  useEffect(() => {
    // 条件 1：有输入图片
    if (!inputImage) {
      return;
    }
    
    // 条件 2：输入图片改变了（新数据）
    if (inputImage === lastInputImageRef.current) {
      return;
    }
    
    // 条件 3：不在处理中
    if (isProcessing) {
      return;
    }
    
    console.log('[GridSplitter] 检测到新图片，自动切割');
    console.log('[GridSplitter] 旧图片:', lastInputImageRef.current?.substring(0, 50));
    console.log('[GridSplitter] 新图片:', inputImage.substring(0, 50));
    
    // 更新跟踪
    lastInputImageRef.current = inputImage;
    setIsProcessing(true);
    
    cropGridImage(inputImage)
      .then((cropped) => {
        console.log('[GridSplitter] 自动切割完成，共', cropped.length, '张');
        onUpdate({ 
          croppedImages: cropped,
          selectedIndex: undefined,
          outputImage: undefined
        });
      })
      .catch((err) => {
        console.error('[GridSplitter] 自动切割失败:', err);
        // 🔥 不重置 lastInputImageRef，防止无限重试
        // 用户可以手动清除后重新上传
      })
      .finally(() => {
        setIsProcessing(false);
      });
  }, [inputImage, isProcessing, cropGridImage, onUpdate]);

  /**
   * 双击选择图片
   */
  const handleSelect = useCallback((index: number) => {
    console.log('[GridSplitter] 选择图片:', index, '当前选中:', selectedIndex, '可用图片数:', croppedImages.length);
    
    // 边界检查
    if (index < 0 || index >= croppedImages.length) {
      console.error('[GridSplitter] 索引越界:', index);
      return;
    }
    
    const selectedImage = croppedImages[index];
    if (!selectedImage) {
      console.error('[GridSplitter] 图片不存在:', index);
      return;
    }
    
    console.log('[GridSplitter] 选中图片 URL 长度:', selectedImage.length);
    onUpdate({ 
      selectedIndex: index, 
      outputImage: selectedImage 
    });
  }, [croppedImages, onUpdate]); // 🔥 移除 selectedIndex 依赖

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
    e.stopPropagation();
    e.preventDefault();
    console.log('[GridSplitter] 清除所有图片');
    lastInputImageRef.current = undefined; // 🔥 重置跟踪，允许重新切割
    onUpdate({ 
      inputImage: null,
      croppedImages: [], 
      selectedIndex: undefined, 
      outputImage: undefined 
    });
  }, [onUpdate]);

  /**
   * 全屏功能
   */
  const handleToggleFullscreen = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    console.log('[GridSplitter] 切换全屏:', !isFullscreen);
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  /**
   * ESC 键关闭全屏
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        console.log('[GridSplitter] ESC 关闭全屏');
        setIsFullscreen(false);
      }
    };
    
    if (isFullscreen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isFullscreen]);

  /**
   * 上传本地图片
   */
  const handleFileSelect = useCallback(async (file: File) => {
    console.log('[GridSplitter] 上传本地图片');
    const blobUrl = URL.createObjectURL(file);
    
    // 更新输入图片
    onUpdate({ inputImage: blobUrl });
    
    // 异步保存到 IndexedDB
    const { saveFileToIndexedDBAsync } = await import('../services/blobStorage');
    saveFileToIndexedDBAsync(`grid-input-${Date.now()}`, file).catch(error => {
      console.error('[GridSplitter] 图片异步保存失败:', error);
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

  // 🔥 收起状态 - 完美显示图片，无边框，自适应比例
  if (!isExpanded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-transparent overflow-hidden">
        {isSingleView ? (
          // 🔥 显示选中的图片 - 完美 21:9，无边框，双击返回九宫格
          selectedImage ? (
            <img 
              src={selectedImage} 
              alt=""
              className="w-full h-full object-cover cursor-pointer"
              style={{ aspectRatio: '21 / 9' }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                console.log('[GridSplitter] 双击返回九宫格（收起状态）');
                handleBackToGrid();
              }}
            />
          ) : (
            <div className="flex items-center justify-center text-white/30 text-xs">
              图片加载失败
            </div>
          )
        ) : croppedImages.length > 0 ? (
          // 显示九宫格缩略图 - 充满整个节点，双击选择
          <div className="w-full h-full grid grid-cols-3 grid-rows-3 gap-0">
            {croppedImages.map((img, i) => (
              <div 
                key={i} 
                className="relative cursor-pointer hover:opacity-80 transition-opacity"
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  console.log('[GridSplitter] 双击格子（收起状态）:', i);
                  handleSelect(i);
                }}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        ) : inputImage ? (
          // 显示输入图片 - 充满整个节点
          <img 
            src={inputImage} 
            alt=""
            className="w-full h-full object-contain opacity-60"
          />
        ) : (
          // 无图片提示 - 最小化显示
          <div className="flex flex-col items-center gap-2">
            <Grid3X3 size={20} className="text-white/20" />
            <span className="text-[11px] text-white/30 font-medium">九宫格</span>
          </div>
        )}
      </div>
    );
  }

  // 展开状态 - 显示完整的九宫格处理界面
  return (
    <div className="w-full h-full relative">
      <div className="w-full h-full flex flex-col bg-gray-100 rounded-2xl overflow-hidden">
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      
      {/* 🔥 头部 - 固定在节点外部顶部 */}
      <div className="absolute -top-11 left-0 right-0 h-10 bg-gray-100/80 backdrop-blur-xl border border-white/5 rounded-t-xl flex items-center justify-between px-4 z-10">
        <div className="flex items-center gap-2">
          <Grid3X3 size={16} className="text-white/40" />
          {isSingleView && isSelected && (
            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
              <Check size={14} className="text-black" strokeWidth={2.5} />
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          {/* 全屏按钮 */}
          {(isSingleView || croppedImages.length > 0) && (
            <button
              onClick={handleToggleFullscreen}
              onMouseDown={(e) => e.stopPropagation()}
              className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white/80 transition-all"
              title="全屏查看"
            >
              <Maximize size={14} />
            </button>
          )}
          {/* 重选按钮 */}
          {isSingleView && isSelected && (
            <button
              onClick={handleBackToGrid}
              onMouseDown={(e) => e.stopPropagation()}
              className="h-7 px-2.5 rounded-lg bg-white/5 hover:bg-white/10 flex items-center gap-1.5 text-white/50 hover:text-white/80 transition-all text-xs"
              title="返回九宫格"
            >
              <RotateCcw size={12} />
            </button>
          )}
          {/* 清除按钮 */}
          {inputImage && (
            <button
              onClick={handleClear}
              onMouseDown={(e) => e.stopPropagation()}
              className="w-7 h-7 rounded-lg bg-white/5 hover:bg-red-500/20 flex items-center justify-center text-white/40 hover:text-red-400 transition-all"
              title="清除所有"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* 内容区 - 充满整个节点 */}
      <div className="flex-1 overflow-hidden flex flex-col">
        
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
              <Grid3X3 size={24} className="text-white/30" />
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

        {/* 🔥 有输入图片但未切割 - 显示预览（自动切割中） */}
        {!isProcessing && inputImage && croppedImages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 p-4">
            {/* 预览图片 */}
            <div className="w-full max-h-[200px] rounded-xl overflow-hidden border border-white/10">
              <img 
                src={inputImage} 
                alt="预览"
                className="w-full h-full object-contain"
              />
            </div>
            {/* 提示文字 */}
            <div className="text-center">
              <p className="text-sm text-white/60 font-medium">图片已接入</p>
              <p className="text-xs text-white/40 mt-1">正在自动切割...</p>
            </div>
          </div>
        )}

        {/* 处理中 */}
        {isProcessing && (
          <div className="flex-1 flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            <span className="text-sm text-white/50">正在处理...</span>
          </div>
        )}

        {/* 单图模式 - 选中的图片覆盖整个区域（无边框，完美 21:9）*/}
        {!isProcessing && isSingleView && (
          <div 
            className="flex-1 relative overflow-hidden"
            onDoubleClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              console.log('[GridSplitter] 双击返回九宫格');
              handleBackToGrid();
            }}
          >
            {selectedImage ? (
              <img 
                src={selectedImage} 
                alt=""
                className="w-full h-full object-cover pointer-events-none"
                style={{ aspectRatio: '21 / 9' }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/30 text-sm">
                图片加载失败
              </div>
            )}
          </div>
        )}

        {/* 九宫格模式 - 21:9 整体比例 */}
        {!isProcessing && inputImage && croppedImages.length > 0 && !isSingleView && (
          <div className="flex-1 flex flex-col">
            {/* 九宫格容器 - 保持 21:9 比例 */}
            <div className="w-full aspect-[21/9] bg-gray-100/20 rounded-xl grid grid-cols-3 grid-rows-3 gap-1 p-1">
              {croppedImages.map((img, i) => (
                <div
                  key={i}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    console.log('[GridSplitter] 双击格子:', i);
                    handleSelect(i);
                  }}
                  className="relative rounded-lg overflow-hidden cursor-pointer transition-all hover:ring-2 hover:ring-white/40 hover:z-10 active:scale-[0.98]"
                >
                  <img src={img} alt="" className="w-full h-full object-cover" draggable={false} />
                  {/* 编号 */}
                  <div className="absolute bottom-1 left-1 w-5 h-5 rounded bg-gray-100/60 flex items-center justify-center text-[10px] font-bold text-white/80">
                    {i + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 🔥 全屏遮罩层 */}
      {isFullscreen && (
        <div 
          className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-xl flex items-center justify-center"
          onClick={() => setIsFullscreen(false)}
        >
          {/* 关闭按钮 */}
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-all"
            title="关闭全屏 (ESC)"
          >
            <X size={20} />
          </button>

          {/* 全屏内容 */}
          <div 
            className="max-w-[90vw] max-h-[90vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {isSingleView ? (
              // 单图全屏
              selectedImage ? (
                <img 
                  src={selectedImage} 
                  alt=""
                  className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
                  style={{ aspectRatio: '21 / 9' }}
                />
              ) : (
                <div className="text-white/50 text-lg">图片加载失败</div>
              )
            ) : croppedImages.length > 0 ? (
              // 九宫格全屏
              <div className="w-full max-w-[85vw] aspect-[21/9] grid grid-cols-3 grid-rows-3 gap-2 p-2 bg-gray-100/40 rounded-xl">
                {croppedImages.map((img, i) => (
                  <div
                    key={i}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      console.log('[GridSplitter] 全屏模式双击格子:', i);
                      handleSelect(i);
                      setIsFullscreen(false);
                    }}
                    className="relative rounded-lg overflow-hidden cursor-pointer transition-all hover:ring-4 hover:ring-white/60 hover:z-10 active:scale-[0.98]"
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" draggable={false} />
                    {/* 编号 */}
                    <div className="absolute bottom-2 left-2 w-8 h-8 rounded-lg bg-black/70 flex items-center justify-center text-sm font-bold text-white">
                      {i + 1}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-white/50 text-lg">无可用图片</div>
            )}
          </div>

          {/* 提示文字 */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40 text-sm">
            {isSingleView ? '点击背景或按 ESC 关闭' : '双击图片选择 · 点击背景或按 ESC 关闭'}
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default GridSplitterNode;
