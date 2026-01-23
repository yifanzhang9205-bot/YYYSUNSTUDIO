import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { Settings, Play, X, RotateCcw, Image as ImageIcon, Camera, AlertCircle } from 'lucide-react';

interface MultiAngleCameraNodeProps {
  horizontalAngle: number;
  verticalAngle: number;
  cameraZoom: number;
  cameraPrompt?: string;
  gridImages?: string[];
  selectedGridIndex?: number;
  userPrompt?: string;
  isWorking: boolean;
  isExpanded: boolean;
  inputImage?: string;
  error?: string;
  
  onHorizontalAngleChange: (value: number) => void;
  onVerticalAngleChange: (value: number) => void;
  onZoomChange: (value: number) => void;
  onPresetSelect: (type: 'horizontal' | 'vertical' | 'distance', value: string) => void;
  onUserPromptChange: (value: string) => void;
  onGenerate: () => void;
  onGridSelect: (index: number, croppedImageUrl?: string) => void;
}

const AZIMUTH = [
  { v: 0, label: '正面' }, { v: 45, label: '右前' }, { v: 90, label: '右侧' }, { v: 135, label: '右后' },
  { v: 180, label: '背面' }, { v: 225, label: '左后' }, { v: 270, label: '左侧' }, { v: 315, label: '左前' },
];
const ELEVATION = [
  { v: 60, label: '俯拍' }, { v: 30, label: '高角度' }, { v: 0, label: '平视' }, { v: -30, label: '仰拍' },
];
const DISTANCE = [
  { v: 0, label: '特写' }, { v: 4, label: '中景' }, { v: 8, label: '远景' },
];

export const MultiAngleCameraNode: React.FC<MultiAngleCameraNodeProps> = ({
  horizontalAngle, verticalAngle, cameraZoom, gridImages, selectedGridIndex,
  userPrompt, isWorking, inputImage, error, onHorizontalAngleChange, onVerticalAngleChange,
  onZoomChange, onUserPromptChange, onGenerate, onGridSelect,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{ 
    renderer: THREE.WebGLRenderer; 
    scene: THREE.Scene; 
    camera: THREE.PerspectiveCamera; 
    cameraRig: THREE.Group; 
    card: THREE.Mesh;
    helpers: {
      heightRing: THREE.Line;
      verticalLine: THREE.Line;
      groundLine: THREE.Line;
      groundMarker: THREE.Mesh;
    };
  } | null>(null);
  const frameRef = useRef<number>(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, h: 0, v: 0, z: 0 });
  const [showPanel, setShowPanel] = useState(false);

  // 初始化 Three.js
  useEffect(() => {
    if (!containerRef.current) return;
    
    // 清理旧的
    if (sceneRef.current) {
      sceneRef.current.renderer.dispose();
      if (containerRef.current.contains(sceneRef.current.renderer.domElement)) {
        containerRef.current.removeChild(sceneRef.current.renderer.domElement);
      }
      sceneRef.current = null;
    }

    const container = containerRef.current;
    // 使用容器实际尺寸
    const rect = container.getBoundingClientRect();
    const w = Math.max(rect.width || 400, 300);
    const h = Math.max(rect.height || 500, 300);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setClearColor(0x1a1a1a);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);

    const camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 100);
    camera.position.set(0, 5, 12);
    camera.lookAt(0, 1, 0);

    // 灯光
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
    mainLight.position.set(5, 10, 5);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.set(1024, 1024);
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
    fillLight.position.set(-5, 5, -5);
    scene.add(fillLight);

    // 地面
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(20, 20),
      new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.9 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // 网格 - 灰白色
    const grid = new THREE.GridHelper(16, 16, 0x444444, 0x333333);
    grid.position.y = 0.01;
    scene.add(grid);

    // 轨道圆环
    const orbitPoints = [];
    for (let i = 0; i <= 64; i++) {
      const angle = (i / 64) * Math.PI * 2;
      orbitPoints.push(new THREE.Vector3(Math.cos(angle) * 5, 0.02, Math.sin(angle) * 5));
    }
    const orbitGeo = new THREE.BufferGeometry().setFromPoints(orbitPoints);
    const orbit = new THREE.Line(orbitGeo, new THREE.LineDashedMaterial({ color: 0x555555, dashSize: 0.3, gapSize: 0.15 }));
    orbit.computeLineDistances();
    scene.add(orbit);

    // 卡片
    const cardGeo = new THREE.BoxGeometry(2.2, 3, 0.05);
    const card = new THREE.Mesh(cardGeo, new THREE.MeshStandardMaterial({ color: 0xdddddd, roughness: 0.3 }));
    card.position.y = 1.5;
    card.castShadow = true;
    scene.add(card);
    
    // 卡片边框
    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(cardGeo),
      new THREE.LineBasicMaterial({ color: 0x666666 })
    );
    card.add(edges);

    // 相机指示器
    const cameraRig = new THREE.Group();
    scene.add(cameraRig);

    const camGroup = new THREE.Group();
    
    // 相机主体
    const camBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 0.4, 0.6),
      new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.4, metalness: 0.3 })
    );
    camBody.castShadow = true;
    camGroup.add(camBody);

    // 镜头 - 朝向 +Z（指向目标，因为 lookAt 让 -Z 指向目标后会翻转）
    const lens = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.22, 0.3, 20),
      new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.2, metalness: 0.6 })
    );
    lens.rotation.x = Math.PI / 2;
    lens.position.z = 0.45;
    camGroup.add(lens);

    // 镜头玻璃
    const glass = new THREE.Mesh(
      new THREE.CircleGeometry(0.15, 20),
      new THREE.MeshStandardMaterial({ color: 0x88aacc, emissive: 0x446688, emissiveIntensity: 0.3, metalness: 0.9, roughness: 0 })
    );
    glass.position.z = 0.6;
    camGroup.add(glass);
    
    // 取景框 - 从相机向目标展开（+Z 方向，因为 lookAt 会让 -Z 指向目标）
    // 小端在相机处，大端朝向目标
    const lineMat = new THREE.LineBasicMaterial({ color: 0x777777, transparent: true, opacity: 0.6 });
    
    // 近框（相机端，小）
    const nearZ = 0.7;
    const nearW = 0.2, nearH = 0.15;
    const nearPts = [
      new THREE.Vector3(-nearW, -nearH, nearZ),
      new THREE.Vector3(nearW, -nearH, nearZ),
      new THREE.Vector3(nearW, nearH, nearZ),
      new THREE.Vector3(-nearW, nearH, nearZ),
      new THREE.Vector3(-nearW, -nearH, nearZ),
    ];
    camGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(nearPts), lineMat));
    
    // 远框（目标端，大）- 向 +Z 方向展开
    const farZ = 4;
    const farW = 1.5, farH = 2.0;
    const farPts = [
      new THREE.Vector3(-farW, -farH, farZ),
      new THREE.Vector3(farW, -farH, farZ),
      new THREE.Vector3(farW, farH, farZ),
      new THREE.Vector3(-farW, farH, farZ),
      new THREE.Vector3(-farW, -farH, farZ),
    ];
    camGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(farPts), lineMat));
    
    // 连接线（四个角，从小框到大框）
    const connectCorners = [
      [[-nearW, -nearH, nearZ], [-farW, -farH, farZ]],
      [[nearW, -nearH, nearZ], [farW, -farH, farZ]],
      [[nearW, nearH, nearZ], [farW, farH, farZ]],
      [[-nearW, nearH, nearZ], [-farW, farH, farZ]],
    ];
    connectCorners.forEach(([s, e]) => {
      const geo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(s[0], s[1], s[2]), 
        new THREE.Vector3(e[0], e[1], e[2])
      ]);
      camGroup.add(new THREE.Line(geo, lineMat));
    });
    
    // 中心十字准星（在远框位置）
    const crossMat = new THREE.LineDashedMaterial({ color: 0x888888, dashSize: 0.1, gapSize: 0.08 });
    const crossH = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-0.4, 0, farZ), 
        new THREE.Vector3(0.4, 0, farZ)
      ]),
      crossMat
    );
    const crossV = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, -0.5, farZ), 
        new THREE.Vector3(0, 0.5, farZ)
      ]),
      crossMat
    );
    crossH.computeLineDistances();
    crossV.computeLineDistances();
    camGroup.add(crossH, crossV);

    cameraRig.add(camGroup);

    // 动态辅助元素组（会随相机位置更新）
    const helpersGroup = new THREE.Group();
    scene.add(helpersGroup);
    
    // 高度参考圆环（初始化，后续会更新）
    const heightRingGeo = new THREE.BufferGeometry();
    const heightRing = new THREE.Line(heightRingGeo, new THREE.LineDashedMaterial({ 
      color: 0x666666, 
      dashSize: 0.2, 
      gapSize: 0.1,
      transparent: true,
      opacity: 0.5
    }));
    helpersGroup.add(heightRing);
    
    // 相机到地面的垂直线
    const verticalLineGeo = new THREE.BufferGeometry();
    const verticalLine = new THREE.Line(verticalLineGeo, new THREE.LineDashedMaterial({ 
      color: 0x555555, 
      dashSize: 0.15, 
      gapSize: 0.1 
    }));
    helpersGroup.add(verticalLine);
    
    // 地面投影点到目标的连线
    const groundLineGeo = new THREE.BufferGeometry();
    const groundLine = new THREE.Line(groundLineGeo, new THREE.LineDashedMaterial({ 
      color: 0x555555, 
      dashSize: 0.2, 
      gapSize: 0.1 
    }));
    helpersGroup.add(groundLine);
    
    // 地面投影点标记（小圆点）
    const groundMarker = new THREE.Mesh(
      new THREE.CircleGeometry(0.15, 16),
      new THREE.MeshBasicMaterial({ color: 0x666666, transparent: true, opacity: 0.6 })
    );
    groundMarker.rotation.x = -Math.PI / 2;
    groundMarker.position.y = 0.02;
    helpersGroup.add(groundMarker);

    sceneRef.current = { 
      renderer, scene, camera, cameraRig, card,
      helpers: { heightRing, verticalLine, groundLine, groundMarker }
    };

    // 动画循环
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // ResizeObserver 监听容器大小变化
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0 && sceneRef.current) {
          sceneRef.current.renderer.setSize(width, height);
          sceneRef.current.camera.aspect = width / height;
          sceneRef.current.camera.updateProjectionMatrix();
        }
      }
    });
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(frameRef.current);
      resizeObserver.disconnect();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // 更新相机位置和辅助元素
  useEffect(() => {
    if (!sceneRef.current) return;
    const { cameraRig, camera, helpers } = sceneRef.current;
    
    const hRad = (horizontalAngle * Math.PI) / 180;
    const vRad = (verticalAngle * Math.PI) / 180;
    // 距离计算：特写(0)=2.5, 中景(4)=4.5, 远景(8)=6.5
    const dist = 2.5 + cameraZoom * 0.5;
    
    // 相机位置计算
    const x = dist * Math.sin(hRad) * Math.cos(vRad);
    const y = dist * Math.sin(vRad) + 1.5;
    const z = dist * Math.cos(hRad) * Math.cos(vRad);
    
    // 地面投影点（相机正下方）
    const groundX = dist * Math.sin(hRad) * Math.cos(vRad);
    const groundZ = dist * Math.cos(hRad) * Math.cos(vRad);
    
    // 水平距离（用于高度圆环半径）
    const horizontalDist = Math.sqrt(groundX * groundX + groundZ * groundZ);
    
    // 更新相机位置，让相机看向目标
    cameraRig.position.set(x, y, z);
    cameraRig.lookAt(0, 1.5, 0);
    
    // 更新高度参考圆环
    const ringPoints: THREE.Vector3[] = [];
    for (let i = 0; i <= 64; i++) {
      const angle = (i / 64) * Math.PI * 2;
      ringPoints.push(new THREE.Vector3(
        Math.cos(angle) * horizontalDist,
        y,
        Math.sin(angle) * horizontalDist
      ));
    }
    helpers.heightRing.geometry.dispose();
    helpers.heightRing.geometry = new THREE.BufferGeometry().setFromPoints(ringPoints);
    helpers.heightRing.computeLineDistances();
    
    // 更新垂直线（相机到地面）
    helpers.verticalLine.geometry.dispose();
    helpers.verticalLine.geometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(x, y, z),
      new THREE.Vector3(groundX, 0.02, groundZ)
    ]);
    helpers.verticalLine.computeLineDistances();
    
    // 更新地面连线（投影点到目标中心）
    helpers.groundLine.geometry.dispose();
    helpers.groundLine.geometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(groundX, 0.02, groundZ),
      new THREE.Vector3(0, 0.02, 0)
    ]);
    helpers.groundLine.computeLineDistances();
    
    // 更新地面投影点标记位置
    helpers.groundMarker.position.set(groundX, 0.02, groundZ);
    
    // 观察相机跟随
    const camDist = 10 + cameraZoom * 0.15;
    camera.position.set(
      camDist * Math.sin(hRad * 0.1),
      5 + verticalAngle * 0.02,
      camDist * Math.cos(hRad * 0.1)
    );
    camera.lookAt(0, 1, 0);
  }, [horizontalAngle, verticalAngle, cameraZoom]);

  // 加载图片纹理
  useEffect(() => {
    if (!sceneRef.current || !inputImage) return;
    const { card } = sceneRef.current;
    
    const loader = new THREE.TextureLoader();
    loader.load(inputImage, (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      (card.material as THREE.MeshStandardMaterial).map = texture;
      (card.material as THREE.MeshStandardMaterial).needsUpdate = true;
    });
  }, [inputImage]);

  // 3D 视口拖拽（不影响节点移动）
  const handleViewportMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止冒泡到节点
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY, h: horizontalAngle, v: verticalAngle, z: cameraZoom });
  };

  useEffect(() => {
    if (!isDragging) return;
    
    const onMove = (e: MouseEvent) => {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      
      if (e.shiftKey) {
        onZoomChange(Math.max(0, Math.min(10, dragStart.z + dy * 0.025)));
      } else {
        onHorizontalAngleChange((dragStart.h + dx * 0.4 + 360) % 360);
        onVerticalAngleChange(Math.max(-30, Math.min(60, dragStart.v - dy * 0.25)));
      }
    };
    
    const onUp = () => setIsDragging(false);
    
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [isDragging, dragStart]);

  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
    // 限制在 0-10 范围内，不循环
    const newZoom = cameraZoom + e.deltaY * 0.008;
    if (newZoom >= 0 && newZoom <= 10) {
      onZoomChange(newZoom);
    }
  };

  // 找最近预设
  const nearestAz = AZIMUTH.reduce((p, c) => Math.abs(((horizontalAngle - c.v + 180) % 360) - 180) < Math.abs(((horizontalAngle - p.v + 180) % 360) - 180) ? c : p);
  const nearestEl = ELEVATION.reduce((p, c) => Math.abs(verticalAngle - c.v) < Math.abs(verticalAngle - p.v) ? c : p);
  const nearestDist = DISTANCE.reduce((p, c) => Math.abs(cameraZoom - c.v) < Math.abs(cameraZoom - p.v) ? c : p);

  return (
    <div className="w-full h-full flex flex-col bg-[#0a0a0a] overflow-hidden rounded-2xl">
      {/* 顶部拖拽条 - iOS 风格 */}
      <div className="h-11 bg-[#1c1c1e]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-4 cursor-move shrink-0">
        <div className="flex items-center gap-2.5">
          <Camera size={16} className="text-white/40" strokeWidth={1.5} />
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5">
          <span className="text-[11px] text-white/50 font-medium">{nearestAz.label}</span>
          <span className="text-white/20">·</span>
          <span className="text-[11px] text-white/50 font-medium">{nearestEl.label}</span>
        </div>
      </div>

      {/* 3D 视口 */}
      <div className="flex-1 relative" style={{ minHeight: '400px' }}>
        <div
          ref={containerRef}
          className={`absolute inset-0 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          onMouseDown={handleViewportMouseDown}
          onWheel={handleWheel}
          onContextMenu={(e: React.MouseEvent) => e.preventDefault()}
        />

        {/* 角度显示 - iOS 毛玻璃胶囊 */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 pointer-events-none">
          {[
            { label: '水平', value: `${Math.round(horizontalAngle)}°` },
            { label: '垂直', value: `${Math.round(verticalAngle)}°` },
            { label: '距离', value: cameraZoom.toFixed(1) },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2 px-3 py-1.5 bg-black/40 backdrop-blur-xl rounded-full border border-white/10">
              <span className="text-[10px] text-white/40 font-medium">{item.label}</span>
              <span className="text-[11px] text-white/80 font-semibold tabular-nums">{item.value}</span>
            </div>
          ))}
        </div>

        {/* 操作提示 - iOS 风格 */}
        <div className="absolute top-4 left-4 px-3 py-1.5 bg-black/40 backdrop-blur-xl rounded-full border border-white/10 pointer-events-none">
          <span className="text-[11px] text-white/50 font-medium">拖拽旋转 · 滚轮缩放</span>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-3 px-6 py-5 bg-red-500/20 backdrop-blur-xl rounded-2xl border border-red-500/30 max-w-[80%]">
            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
              <AlertCircle size={24} className="text-red-400" />
            </div>
            <span className="text-[13px] text-red-300 font-medium text-center">{error}</span>
          </div>
        )}

        {/* 无图片提示 */}
        {!inputImage && !error && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-3 px-6 py-5 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 pointer-events-none">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
              <ImageIcon size={20} className="text-white/30" />
            </div>
            <span className="text-[13px] text-white/50 font-medium">连接图片以预览</span>
          </div>
        )}

        {/* 底部控制栏 - iOS 风格 */}
        <div className="absolute bottom-4 inset-x-4 flex justify-between items-center">
          <div className="flex gap-2">
            <button
              onClick={() => { onHorizontalAngleChange(0); onVerticalAngleChange(0); onZoomChange(5); }}
              className="w-10 h-10 bg-black/40 backdrop-blur-xl rounded-full border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all active:scale-95"
            >
              <RotateCcw size={16} />
            </button>
            <button
              onClick={() => setShowPanel(true)}
              className="h-10 px-4 bg-black/40 backdrop-blur-xl rounded-full border border-white/10 flex items-center gap-2 text-white/60 hover:text-white hover:bg-white/10 transition-all active:scale-95"
            >
              <Settings size={15} />
              <span className="text-[13px] font-medium">设置</span>
            </button>
          </div>
          
          <div className="flex gap-2">
            {gridImages && gridImages.length > 0 && (
              <>
                <div className="h-10 px-3 bg-green-500/20 backdrop-blur-xl rounded-full border border-green-500/30 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-[12px] text-green-300 font-medium">已输出</span>
                </div>
              </>
            )}
            <button
              onClick={onGenerate}
              disabled={isWorking}
              className="h-10 px-5 bg-white rounded-full flex items-center gap-2 text-black font-semibold text-[13px] hover:bg-white/90 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-white/20"
            >
              {isWorking ? (
                <>
                  <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  <span>生成中</span>
                </>
              ) : (
                <>
                  <Play size={14} fill="black" />
                  <span>生成</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 设置面板 - iOS 风格 */}
      {showPanel && (
        <div className="absolute inset-0 bg-[#0a0a0a]/95 backdrop-blur-2xl flex flex-col z-20 rounded-2xl">
          {/* 头部 */}
          <div className="h-14 flex items-center justify-between px-5 border-b border-white/5 shrink-0">
            <span className="text-[15px] font-semibold text-white">相机设置</span>
            <button 
              onClick={() => setShowPanel(false)} 
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all"
            >
              <X size={16} />
            </button>
          </div>
          
          <div className="flex-1 p-5 space-y-6 overflow-y-auto custom-scrollbar">
            {/* 方位角 */}
            <div>
              <div className="text-[11px] text-white/40 uppercase tracking-wider font-semibold mb-3">方位角</div>
              <div className="grid grid-cols-4 gap-2">
                {AZIMUTH.map((a) => (
                  <button 
                    key={a.v} 
                    onClick={() => onHorizontalAngleChange(a.v)}
                    className={`py-2.5 rounded-xl text-[12px] font-medium transition-all active:scale-95 ${
                      nearestAz.v === a.v 
                        ? 'bg-white text-black shadow-lg shadow-white/20' 
                        : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/5'
                    }`}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </div>
            
            {/* 仰角 */}
            <div>
              <div className="text-[11px] text-white/40 uppercase tracking-wider font-semibold mb-3">仰角</div>
              <div className="grid grid-cols-4 gap-2">
                {ELEVATION.map((e) => (
                  <button 
                    key={e.v} 
                    onClick={() => onVerticalAngleChange(e.v)}
                    className={`py-2.5 rounded-xl text-[12px] font-medium transition-all active:scale-95 ${
                      nearestEl.v === e.v 
                        ? 'bg-white text-black shadow-lg shadow-white/20' 
                        : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/5'
                    }`}
                  >
                    {e.label}
                  </button>
                ))}
              </div>
            </div>
            
            {/* 距离 */}
            <div>
              <div className="text-[11px] text-white/40 uppercase tracking-wider font-semibold mb-3">距离</div>
              <div className="grid grid-cols-3 gap-2">
                {DISTANCE.map((d) => (
                  <button 
                    key={d.v} 
                    onClick={() => onZoomChange(d.v)}
                    className={`py-2.5 rounded-xl text-[12px] font-medium transition-all active:scale-95 ${
                      nearestDist.v === d.v 
                        ? 'bg-white text-black shadow-lg shadow-white/20' 
                        : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/5'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
            
            {/* 精确调整滑块 */}
            <div className="space-y-4">
              <div className="text-[11px] text-white/40 uppercase tracking-wider font-semibold">精确调整</div>
              {[
                { l: '水平', v: horizontalAngle, min: 0, max: 360, fn: onHorizontalAngleChange, unit: '°' },
                { l: '垂直', v: verticalAngle, min: -30, max: 60, fn: onVerticalAngleChange, unit: '°' },
                { l: '距离', v: cameraZoom, min: 0, max: 10, fn: onZoomChange, step: 0.1, unit: '' },
              ].map((s) => (
                <div key={s.l} className="bg-white/5 rounded-xl p-3 border border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[12px] text-white/60 font-medium">{s.l}</span>
                    <span className="text-[13px] text-white font-semibold tabular-nums">
                      {s.step ? s.v.toFixed(1) : Math.round(s.v)}{s.unit}
                    </span>
                  </div>
                  <input 
                    type="range" 
                    min={s.min} 
                    max={s.max} 
                    step={s.step || 1} 
                    value={s.v}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => s.fn(Number(e.target.value))}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-white/10"
                    style={{ 
                      background: `linear-gradient(to right, white ${((s.v - s.min) / (s.max - s.min)) * 100}%, rgba(255,255,255,0.1) ${((s.v - s.min) / (s.max - s.min)) * 100}%)` 
                    }} 
                  />
                </div>
              ))}
            </div>
            
            {/* 补充描述 */}
            <div>
              <div className="text-[11px] text-white/40 uppercase tracking-wider font-semibold mb-3">补充描述</div>
              <textarea
                className="w-full px-4 py-3 bg-white/5 border border-white/5 rounded-xl text-[13px] text-white resize-none focus:border-white/20 focus:outline-none focus:ring-0 placeholder-white/30 transition-colors"
                rows={3}
                placeholder="光照、材质、风格等..."
                value={userPrompt || ''}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onUserPromptChange(e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
