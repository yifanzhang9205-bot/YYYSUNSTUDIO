import React, { useRef, useEffect, useState } from 'react';
import { Map, Maximize2, Minimize2 } from 'lucide-react';
import { AppNode, Connection } from '../types';

interface MinimapProps {
    nodes: Map<string, AppNode>;
    connections: Connection[];
    pan: { x: number; y: number };
    scale: number;
    viewportWidth: number;
    viewportHeight: number;
    onPanChange: (pan: { x: number; y: number }) => void;
}

export const Minimap: React.FC<MinimapProps> = ({
    nodes,
    connections,
    pan,
    scale,
    viewportWidth,
    viewportHeight,
    onPanChange
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isExpanded, setIsExpanded] = useState(false); // 🔥 修改：默认折叠
    const [isDragging, setIsDragging] = useState(false);
    
    // 小地图尺寸
    const MINIMAP_WIDTH = 200;
    const MINIMAP_HEIGHT = 150;
    const MINIMAP_PADDING = 10;
    
    // 计算所有节点的边界
    const getNodesBounds = () => {
        if (nodes.size === 0) {
            return { minX: 0, minY: 0, maxX: 1000, maxY: 1000 };
        }
        
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        
        nodes.forEach(node => {
            const width = node.width || 420;
            const height = node.height || 400;
            
            minX = Math.min(minX, node.x);
            minY = Math.min(minY, node.y);
            maxX = Math.max(maxX, node.x + width);
            maxY = Math.max(maxY, node.y + height);
        });
        
        // 添加一些边距
        const padding = 200;
        return {
            minX: minX - padding,
            minY: minY - padding,
            maxX: maxX + padding,
            maxY: maxY + padding
        };
    };
    
    // 检测孤立节点
    const getIsolatedNodes = () => {
        const connectedNodeIds = new Set<string>();
        connections.forEach(c => {
            connectedNodeIds.add(c.from);
            connectedNodeIds.add(c.to);
        });
        
        const isolated = new Set<string>();
        nodes.forEach((node, id) => {
            if (!connectedNodeIds.has(id)) {
                isolated.add(id);
            }
        });
        
        return isolated;
    };
    
    // 绘制小地图
    useEffect(() => {
        if (!isExpanded || !canvasRef.current) return;
        
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        // 设置高 DPI
        const dpr = window.devicePixelRatio || 1;
        canvas.width = MINIMAP_WIDTH * dpr;
        canvas.height = MINIMAP_HEIGHT * dpr;
        canvas.style.width = `${MINIMAP_WIDTH}px`;
        canvas.style.height = `${MINIMAP_HEIGHT}px`;
        ctx.scale(dpr, dpr);
        
        // 清空画布
        ctx.clearRect(0, 0, MINIMAP_WIDTH, MINIMAP_HEIGHT);
        
        // 获取节点边界
        const bounds = getNodesBounds();
        const boundsWidth = bounds.maxX - bounds.minX;
        const boundsHeight = bounds.maxY - bounds.minY;
        
        // 计算缩放比例（保持宽高比）
        const scaleX = (MINIMAP_WIDTH - MINIMAP_PADDING * 2) / boundsWidth;
        const scaleY = (MINIMAP_HEIGHT - MINIMAP_PADDING * 2) / boundsHeight;
        const minimapScale = Math.min(scaleX, scaleY);
        
        // 转换坐标：画布坐标 → 小地图坐标
        const toMinimapX = (x: number) => {
            return (x - bounds.minX) * minimapScale + MINIMAP_PADDING;
        };
        const toMinimapY = (y: number) => {
            return (y - bounds.minY) * minimapScale + MINIMAP_PADDING;
        };
        
        // 获取孤立节点
        const isolatedNodes = getIsolatedNodes();
        
        // 绘制连接线
        ctx.strokeStyle = 'rgba(156, 163, 175, 0.5)'; // gray-400
        ctx.lineWidth = 1;
        connections.forEach(conn => {
            const fromNode = nodes.get(conn.from);
            const toNode = nodes.get(conn.to);
            if (!fromNode || !toNode) return;
            
            const fromX = toMinimapX(fromNode.x + (fromNode.width || 420) / 2);
            const fromY = toMinimapY(fromNode.y + (fromNode.height || 400) / 2);
            const toX = toMinimapX(toNode.x + (toNode.width || 420) / 2);
            const toY = toMinimapY(toNode.y + (toNode.height || 400) / 2);
            
            ctx.beginPath();
            ctx.moveTo(fromX, fromY);
            ctx.lineTo(toX, toY);
            ctx.stroke();
        });
        
        // 绘制节点
        nodes.forEach((node, id) => {
            const x = toMinimapX(node.x);
            const y = toMinimapY(node.y);
            const width = (node.width || 420) * minimapScale;
            const height = (node.height || 400) * minimapScale;
            
            // 孤立节点用红色，普通节点用灰色
            if (isolatedNodes.has(id)) {
                ctx.fillStyle = 'rgba(239, 68, 68, 0.8)'; // 红色
                ctx.strokeStyle = 'rgba(239, 68, 68, 1)';
            } else {
                ctx.fillStyle = 'rgba(229, 231, 235, 0.8)'; // gray-200
                ctx.strokeStyle = 'rgba(156, 163, 175, 1)'; // gray-400
            }
            
            ctx.lineWidth = 1;
            ctx.fillRect(x, y, Math.max(width, 3), Math.max(height, 3));
            ctx.strokeRect(x, y, Math.max(width, 3), Math.max(height, 3));
        });
        
        // 绘制当前视口
        const viewportX = toMinimapX(-pan.x / scale);
        const viewportY = toMinimapY(-pan.y / scale);
        const viewportW = (viewportWidth / scale) * minimapScale;
        const viewportH = (viewportHeight / scale) * minimapScale;
        
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.8)'; // blue-500
        ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
        ctx.lineWidth = 2;
        ctx.fillRect(viewportX, viewportY, viewportW, viewportH);
        ctx.strokeRect(viewportX, viewportY, viewportW, viewportH);
        
    }, [nodes, connections, pan, scale, viewportWidth, viewportHeight, isExpanded]);
    
    // 处理点击和拖动
    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!canvasRef.current) return;
        
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        setIsDragging(true);
        handleMinimapClick(x, y);
    };
    
    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDragging || !canvasRef.current) return;
        
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        handleMinimapClick(x, y);
    };
    
    const handleMouseUp = () => {
        setIsDragging(false);
    };
    
    const handleMinimapClick = (x: number, y: number) => {
        // 获取节点边界
        const bounds = getNodesBounds();
        const boundsWidth = bounds.maxX - bounds.minX;
        const boundsHeight = bounds.maxY - bounds.minY;
        
        // 计算缩放比例
        const scaleX = (MINIMAP_WIDTH - MINIMAP_PADDING * 2) / boundsWidth;
        const scaleY = (MINIMAP_HEIGHT - MINIMAP_PADDING * 2) / boundsHeight;
        const minimapScale = Math.min(scaleX, scaleY);
        
        // 转换坐标：小地图坐标 → 画布坐标
        const canvasX = (x - MINIMAP_PADDING) / minimapScale + bounds.minX;
        const canvasY = (y - MINIMAP_PADDING) / minimapScale + bounds.minY;
        
        // 计算新的 pan 值（让点击位置居中）
        const newPanX = viewportWidth / 2 - canvasX * scale;
        const newPanY = viewportHeight / 2 - canvasY * scale;
        
        onPanChange({ x: newPanX, y: newPanY });
    };
    
    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mouseup', handleMouseUp);
            return () => window.removeEventListener('mouseup', handleMouseUp);
        }
    }, [isDragging]);
    
    return (
        <div 
            className="relative flex items-center gap-2"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
        >
            {/* 展开/折叠按钮 */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 text-gray-700 hover:text-blue-600 transition-colors rounded-md hover:bg-white/80 border border-transparent hover:border-gray-200"
                title={isExpanded ? '折叠小地图' : '展开小地图'}
            >
                {isExpanded ? <Minimize2 size={14} strokeWidth={2.5} /> : <Map size={14} strokeWidth={2.5} />}
            </button>
            
            {/* 小地图面板 - 绝对定位，不占用控制栏空间 */}
            {isExpanded && (
                <div className="absolute bottom-16 right-0 bg-white border border-gray-200 rounded-xl p-3 shadow-xl animate-in fade-in zoom-in-95 duration-300">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <Map size={14} className="text-gray-700" strokeWidth={2.5} />
                            <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                小地图
                            </span>
                        </div>
                        <div className="flex items-center gap-1">
                            {/* 图例 */}
                            <div className="flex items-center gap-1 text-[10px] text-gray-600">
                                <div className="w-2 h-2 bg-gray-200 rounded-sm border border-gray-300"></div>
                                <span>节点</span>
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-red-600 ml-2">
                                <div className="w-2 h-2 bg-red-500 rounded-sm border border-red-600"></div>
                                <span>孤立</span>
                            </div>
                        </div>
                    </div>
                    
                    <canvas
                        ref={canvasRef}
                        className="rounded-lg cursor-pointer bg-white border border-gray-200"
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        style={{ 
                            width: MINIMAP_WIDTH, 
                            height: MINIMAP_HEIGHT,
                            cursor: isDragging ? 'grabbing' : 'pointer'
                        }}
                    />
                    
                    <div className="mt-2 text-[10px] text-gray-500 text-center">
                        点击或拖动跳转
                    </div>
                </div>
            )}
        </div>
    );
};
