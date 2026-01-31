/**
 * 几何计算工具函数
 * 
 * 职责：
 * - 纯函数，无副作用
 * - 不依赖 React
 * - 可独立测试
 * 
 * 包含：
 * - 碰撞检测（AABB）
 * - 距离计算
 * - 角度计算
 * - 边界检测
 */

// ============================================
// 类型定义
// ============================================

export interface Point {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Circle {
  x: number;
  y: number;
  radius: number;
}

// ============================================
// 距离计算
// ============================================

/**
 * 计算两点之间的欧几里得距离
 */
export function distance(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * 计算两点之间的曼哈顿距离
 */
export function manhattanDistance(p1: Point, p2: Point): number {
  return Math.abs(p2.x - p1.x) + Math.abs(p2.y - p1.y);
}

/**
 * 计算点到矩形的最近距离
 */
export function distanceToRect(point: Point, rect: Rect): number {
  const closestX = Math.max(rect.x, Math.min(point.x, rect.x + rect.width));
  const closestY = Math.max(rect.y, Math.min(point.y, rect.y + rect.height));
  return distance(point, { x: closestX, y: closestY });
}

// ============================================
// 碰撞检测
// ============================================

/**
 * AABB（轴对齐包围盒）碰撞检测
 * 检测两个矩形是否相交
 */
export function checkCollision(a: Rect, b: Rect): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

/**
 * 检测点是否在矩形内
 */
export function pointInRect(point: Point, rect: Rect): boolean {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  );
}

/**
 * 检测点是否在圆内
 */
export function pointInCircle(point: Point, circle: Circle): boolean {
  return distance(point, circle) <= circle.radius;
}

/**
 * 检测两个圆是否相交
 */
export function circleCollision(a: Circle, b: Circle): boolean {
  return distance(a, b) <= a.radius + b.radius;
}

// ============================================
// 角度计算
// ============================================

/**
 * 计算两点之间的角度（弧度）
 */
export function angle(p1: Point, p2: Point): number {
  return Math.atan2(p2.y - p1.y, p2.x - p1.x);
}

/**
 * 计算两点之间的角度（度数）
 */
export function angleDegrees(p1: Point, p2: Point): number {
  return (angle(p1, p2) * 180) / Math.PI;
}

/**
 * 弧度转度数
 */
export function radiansToDegrees(radians: number): number {
  return (radians * 180) / Math.PI;
}

/**
 * 度数转弧度
 */
export function degreesToRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

// ============================================
// 边界检测
// ============================================

/**
 * 检测矩形是否在视口内（带 padding）
 */
export function isRectInViewport(
  rect: Rect,
  viewport: Rect,
  padding: number = 0
): boolean {
  return (
    rect.x + rect.width > viewport.x - padding &&
    rect.x < viewport.x + viewport.width + padding &&
    rect.y + rect.height > viewport.y - padding &&
    rect.y < viewport.y + viewport.height + padding
  );
}

/**
 * 将矩形限制在边界内
 */
export function clampRect(rect: Rect, bounds: Rect): Rect {
  return {
    x: Math.max(bounds.x, Math.min(rect.x, bounds.x + bounds.width - rect.width)),
    y: Math.max(bounds.y, Math.min(rect.y, bounds.y + bounds.height - rect.height)),
    width: rect.width,
    height: rect.height,
  };
}

/**
 * 将点限制在边界内
 */
export function clampPoint(point: Point, bounds: Rect): Point {
  return {
    x: Math.max(bounds.x, Math.min(point.x, bounds.x + bounds.width)),
    y: Math.max(bounds.y, Math.min(point.y, bounds.y + bounds.height)),
  };
}

// ============================================
// 磁吸对齐
// ============================================

/**
 * 计算磁吸对齐后的位置
 * @param value 当前值
 * @param target 目标值
 * @param threshold 磁吸阈值
 * @returns 对齐后的值
 */
export function snapToValue(
  value: number,
  target: number,
  threshold: number
): number {
  return Math.abs(value - target) < threshold ? target : value;
}

/**
 * 计算磁吸对齐后的点
 */
export function snapToPoint(
  point: Point,
  target: Point,
  threshold: number
): Point {
  return {
    x: snapToValue(point.x, target.x, threshold),
    y: snapToValue(point.y, target.y, threshold),
  };
}

/**
 * 计算磁吸对齐后的矩形（对齐到网格）
 */
export function snapToGrid(rect: Rect, gridSize: number): Rect {
  return {
    x: Math.round(rect.x / gridSize) * gridSize,
    y: Math.round(rect.y / gridSize) * gridSize,
    width: rect.width,
    height: rect.height,
  };
}

// ============================================
// 布局计算
// ============================================

/**
 * 计算矩形的中心点
 */
export function getRectCenter(rect: Rect): Point {
  return {
    x: rect.x + rect.width / 2,
    y: rect.y + rect.height / 2,
  };
}

/**
 * 计算多个矩形的包围盒
 */
export function getBoundingBox(rects: Rect[]): Rect | null {
  if (rects.length === 0) return null;

  const minX = Math.min(...rects.map(r => r.x));
  const minY = Math.min(...rects.map(r => r.y));
  const maxX = Math.max(...rects.map(r => r.x + r.width));
  const maxY = Math.max(...rects.map(r => r.y + r.height));

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

/**
 * 计算两个矩形之间的间距
 */
export function getRectSpacing(a: Rect, b: Rect): { x: number; y: number } {
  const aRight = a.x + a.width;
  const aBottom = a.y + a.height;
  const bRight = b.x + b.width;
  const bBottom = b.y + b.height;

  const xSpacing = Math.max(0, Math.min(
    Math.abs(b.x - aRight),
    Math.abs(a.x - bRight)
  ));

  const ySpacing = Math.max(0, Math.min(
    Math.abs(b.y - aBottom),
    Math.abs(a.y - bBottom)
  ));

  return { x: xSpacing, y: ySpacing };
}

// ============================================
// 工具函数
// ============================================

/**
 * 线性插值
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

/**
 * 点的线性插值
 */
export function lerpPoint(start: Point, end: Point, t: number): Point {
  return {
    x: lerp(start.x, end.x, t),
    y: lerp(start.y, end.y, t),
  };
}

/**
 * 限制数值在范围内
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}

// ============================================
// 防遮挡布局算法（新增 - 2026-01-30）
// ============================================

/**
 * 检测两个矩形是否重叠（带间距）
 * @param a 矩形 A
 * @param b 矩形 B
 * @param gap 最小间距（默认 20px）
 * @returns 是否重叠
 */
export function isRectOverlapping(a: Rect, b: Rect, gap: number = 20): boolean {
  return (
    a.x < b.x + b.width + gap &&
    a.x + a.width + gap > b.x &&
    a.y < b.y + b.height + gap &&
    a.y + a.height + gap > b.y
  );
}

/**
 * 寻找不重叠的位置（螺旋搜索算法）
 * @param preferredPos 优先位置
 * @param size 节点大小
 * @param existingRects 现有节点的矩形
 * @param options 配置选项
 * @returns 不重叠的位置
 */
export function findNonOverlappingPosition(
  preferredPos: Point,
  size: { width: number; height: number },
  existingRects: Rect[],
  options: {
    gap?: number;           // 节点间距（默认 40px）
    maxAttempts?: number;   // 最大尝试次数（默认 100）
    searchRadius?: number;  // 搜索半径增量（默认 200px）
    angleStep?: number;     // 角度步进（默认 30°）
  } = {}
): Point {
  const {
    gap = 40,
    maxAttempts = 100,
    searchRadius = 200,
    angleStep = 30,
  } = options;

  // 1. 先检查优先位置是否可用
  const preferredRect: Rect = {
    x: preferredPos.x,
    y: preferredPos.y,
    width: size.width,
    height: size.height,
  };

  const hasOverlap = existingRects.some(rect =>
    isRectOverlapping(preferredRect, rect, gap)
  );

  if (!hasOverlap) {
    return preferredPos;
  }

  // 2. 螺旋搜索：从优先位置开始，螺旋式向外搜索
  for (let i = 0; i < maxAttempts; i++) {
    const angle = (i * angleStep) % 360;
    const distance = Math.floor(i / (360 / angleStep)) * searchRadius + searchRadius;

    const x = preferredPos.x + Math.cos(degreesToRadians(angle)) * distance;
    const y = preferredPos.y + Math.sin(degreesToRadians(angle)) * distance;

    const testRect: Rect = {
      x,
      y,
      width: size.width,
      height: size.height,
    };

    const hasOverlap = existingRects.some(rect =>
      isRectOverlapping(testRect, rect, gap)
    );

    if (!hasOverlap) {
      return { x, y };
    }
  }

  // 3. 如果找不到空白区域，返回优先位置（可能重叠，但至少有连线）
  console.warn('[geometry] 找不到不重叠的位置，返回优先位置（可能重叠）');
  return preferredPos;
}

/**
 * 计算网格布局（用于自动整理）
 * @param rects 要排列的矩形数组
 * @param options 配置选项
 * @returns 排列后的位置数组
 */
export function calculateGridLayout(
  rects: Rect[],
  options: {
    startX?: number;        // 起始 X 坐标（默认 100）
    startY?: number;        // 起始 Y 坐标（默认 100）
    gapX?: number;          // 水平间距（默认 40）
    gapY?: number;          // 垂直间距（默认 40）
    columns?: number;       // 列数（默认自动计算）
    sortBy?: 'x' | 'y' | 'none'; // 排序方式（默认 'x'）
  } = {}
): Point[] {
  const {
    startX = 100,
    startY = 100,
    gapX = 40,
    gapY = 40,
    columns,
    sortBy = 'x',
  } = options;

  if (rects.length === 0) return [];

  // 1. 排序（按 X 或 Y 坐标）
  let sortedRects = [...rects];
  if (sortBy === 'x') {
    sortedRects.sort((a, b) => a.x - b.x || a.y - b.y);
  } else if (sortBy === 'y') {
    sortedRects.sort((a, b) => a.y - b.y || a.x - b.x);
  }

  // 2. 计算列数（如果未指定）
  const cols = columns || Math.ceil(Math.sqrt(rects.length));

  // 3. 计算每列的最大宽度和每行的最大高度
  const colWidths: number[] = [];
  const rowHeights: number[] = [];

  sortedRects.forEach((rect, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);

    colWidths[col] = Math.max(colWidths[col] || 0, rect.width);
    rowHeights[row] = Math.max(rowHeights[row] || 0, rect.height);
  });

  // 4. 计算每个节点的位置
  const positions: Point[] = [];
  let currentX = startX;
  let currentY = startY;

  sortedRects.forEach((rect, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);

    // 如果是新行，重置 X，更新 Y
    if (col === 0 && row > 0) {
      currentX = startX;
      currentY += rowHeights[row - 1] + gapY;
    }

    // 如果不是第一列，累加前面列的宽度
    if (col > 0) {
      currentX += colWidths[col - 1] + gapX;
    }

    positions.push({ x: currentX, y: currentY });

    // 如果是最后一列，重置 X
    if (col === cols - 1) {
      currentX = startX;
    }
  });

  return positions;
}

/**
 * 计算拓扑排序布局（基于连接关系）
 * @param rects 要排列的矩形数组
 * @param connections 连接关系数组
 * @param options 配置选项
 * @returns 排列后的位置数组
 */
export function calculateTopologyLayout(
  rects: Array<Rect & { id: string }>,
  connections: Array<{ from: string; to: string }>,
  options: {
    startX?: number;        // 起始 X 坐标（默认 100）
    startY?: number;        // 起始 Y 坐标（默认 100）
    gapX?: number;          // 水平间距（默认 200）
    gapY?: number;          // 垂直间距（默认 100）
  } = {}
): Map<string, Point> {
  const {
    startX = 100,
    startY = 100,
    gapX = 200,
    gapY = 100,
  } = options;

  const positions = new Map<string, Point>();

  // 1. 构建邻接表和入度表
  const adjacencyList = new Map<string, string[]>();
  const inDegree = new Map<string, number>();

  rects.forEach(rect => {
    adjacencyList.set(rect.id, []);
    inDegree.set(rect.id, 0);
  });

  connections.forEach(conn => {
    if (adjacencyList.has(conn.from) && inDegree.has(conn.to)) {
      adjacencyList.get(conn.from)!.push(conn.to);
      inDegree.set(conn.to, (inDegree.get(conn.to) || 0) + 1);
    }
  });

  // 2. 拓扑排序（Kahn 算法）
  const layers: string[][] = [];
  const queue: string[] = [];

  // 找到所有入度为 0 的节点（起始节点）
  inDegree.forEach((degree, id) => {
    if (degree === 0) {
      queue.push(id);
    }
  });

  // 如果没有起始节点，随机选一个
  if (queue.length === 0 && rects.length > 0) {
    queue.push(rects[0].id);
  }

  // 分层
  while (queue.length > 0) {
    const currentLayer = [...queue];
    layers.push(currentLayer);
    queue.length = 0;

    currentLayer.forEach(nodeId => {
      const neighbors = adjacencyList.get(nodeId) || [];
      neighbors.forEach(neighborId => {
        const degree = inDegree.get(neighborId) || 0;
        inDegree.set(neighborId, degree - 1);
        if (degree - 1 === 0) {
          queue.push(neighborId);
        }
      });
    });
  }

  // 3. 计算每层的位置
  layers.forEach((layer, layerIndex) => {
    const layerRects = layer.map(id => rects.find(r => r.id === id)!).filter(Boolean);
    const maxHeight = Math.max(...layerRects.map(r => r.height));

    layer.forEach((nodeId, nodeIndex) => {
      const rect = rects.find(r => r.id === nodeId);
      if (!rect) return;

      const x = startX + layerIndex * (Math.max(...layerRects.map(r => r.width)) + gapX);
      const y = startY + nodeIndex * (maxHeight + gapY);

      positions.set(nodeId, { x, y });
    });
  });

  return positions;
}
