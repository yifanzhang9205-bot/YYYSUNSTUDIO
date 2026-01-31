/**
 * 图片工具函数
 * 
 * 职责：图片尺寸检测、比例计算
 * 
 * 架构位置：Core Layer（底层工具）
 */

/**
 * 图片尺寸信息
 */
export interface ImageDimensions {
    width: number;
    height: number;
    aspectRatio: number;  // 宽高比（width / height）
    aspectRatioString: string;  // 比例字符串（如 "16:9", "21:9"）
}

/**
 * 检测图片的实际尺寸
 * 
 * @param imageUrl - 图片 URL（base64 或 Blob URL）
 * @returns 图片尺寸信息
 */
export const detectImageDimensions = async (imageUrl: string): Promise<ImageDimensions> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = () => {
            const width = img.width;
            const height = img.height;
            const aspectRatio = width / height;
            const aspectRatioString = getAspectRatioString(aspectRatio);
            
            resolve({
                width,
                height,
                aspectRatio,
                aspectRatioString,
            });
        };
        
        img.onerror = () => {
            reject(new Error('图片加载失败'));
        };
        
        img.src = imageUrl;
    });
};

/**
 * 根据宽高比计算比例字符串
 * 
 * @param ratio - 宽高比（width / height）
 * @returns 比例字符串（如 "16:9", "21:9", "1:1"）
 */
export const getAspectRatioString = (ratio: number): string => {
    // 常见比例映射
    const commonRatios: { [key: string]: number } = {
        '1:1': 1.0,
        '4:3': 1.333,
        '3:2': 1.5,
        '16:9': 1.778,
        '16:10': 1.6,
        '21:9': 2.333,
        '2:1': 2.0,
        '3:1': 3.0,
    };
    
    // 查找最接近的比例
    let closestRatio = '16:9';
    let minDiff = Infinity;
    
    for (const [ratioStr, ratioValue] of Object.entries(commonRatios)) {
        const diff = Math.abs(ratio - ratioValue);
        if (diff < minDiff) {
            minDiff = diff;
            closestRatio = ratioStr;
        }
    }
    
    // 如果差异小于 0.05，认为是该比例
    if (minDiff < 0.05) {
        return closestRatio;
    }
    
    // 否则返回精确比例
    return `${ratio.toFixed(2)}:1`;
};

/**
 * 根据图片尺寸计算节点的推荐尺寸
 * 
 * @param imageDimensions - 图片尺寸信息
 * @param maxWidth - 最大宽度（默认 800）
 * @param maxHeight - 最大高度（默认 600）
 * @returns 节点推荐尺寸 { width, height }
 */
export const calculateNodeSize = (
    imageDimensions: ImageDimensions,
    maxWidth: number = 800,
    maxHeight: number = 600
): { width: number; height: number } => {
    const { width: imgWidth, height: imgHeight, aspectRatio } = imageDimensions;
    
    // 如果图片尺寸小于最大尺寸，直接使用图片尺寸
    if (imgWidth <= maxWidth && imgHeight <= maxHeight) {
        return {
            width: imgWidth,
            height: imgHeight,
        };
    }
    
    // 如果图片尺寸超过最大尺寸，按比例缩放
    let nodeWidth = imgWidth;
    let nodeHeight = imgHeight;
    
    // 先按宽度缩放
    if (nodeWidth > maxWidth) {
        nodeWidth = maxWidth;
        nodeHeight = nodeWidth / aspectRatio;
    }
    
    // 再按高度缩放
    if (nodeHeight > maxHeight) {
        nodeHeight = maxHeight;
        nodeWidth = nodeHeight * aspectRatio;
    }
    
    return {
        width: Math.round(nodeWidth),
        height: Math.round(nodeHeight),
    };
};

/**
 * 批量检测图片尺寸
 * 
 * @param imageUrls - 图片 URL 数组
 * @returns 图片尺寸信息数组
 */
export const detectMultipleImageDimensions = async (
    imageUrls: string[]
): Promise<ImageDimensions[]> => {
    return Promise.all(imageUrls.map(url => detectImageDimensions(url)));
};

/**
 * 检测图片是否为横向（宽 > 高）
 * 
 * @param dimensions - 图片尺寸信息
 * @returns 是否为横向
 */
export const isLandscape = (dimensions: ImageDimensions): boolean => {
    return dimensions.aspectRatio > 1;
};

/**
 * 检测图片是否为纵向（高 > 宽）
 * 
 * @param dimensions - 图片尺寸信息
 * @returns 是否为纵向
 */
export const isPortrait = (dimensions: ImageDimensions): boolean => {
    return dimensions.aspectRatio < 1;
};

/**
 * 检测图片是否为正方形（宽 = 高）
 * 
 * @param dimensions - 图片尺寸信息
 * @returns 是否为正方形
 */
export const isSquare = (dimensions: ImageDimensions): boolean => {
    return Math.abs(dimensions.aspectRatio - 1) < 0.01;
};

/**
 * 根据图片 URL 自动计算节点尺寸
 * 
 * @param imageUrl - 图片 URL
 * @param maxWidth - 最大宽度（默认 800）
 * @param maxHeight - 最大高度（默认 600）
 * @returns 节点推荐尺寸 { width, height }
 */
export const autoCalculateNodeSize = async (
    imageUrl: string,
    maxWidth: number = 800,
    maxHeight: number = 600
): Promise<{ width: number; height: number }> => {
    const dimensions = await detectImageDimensions(imageUrl);
    return calculateNodeSize(dimensions, maxWidth, maxHeight);
};
