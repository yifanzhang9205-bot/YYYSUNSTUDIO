#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""修复 Node.tsx 中被截断的中文字符"""

import re

file_path = "components/Node.tsx"

# 定义所有需要修复的字符串
replacements = [
    # 注释
    ('// 🔥 FORCE UPDATE: 2026-01-25 23:52:00 - 底部面板已彻底删�?', '// 🔥 FORCE UPDATE: 2026-01-25 23:52:00 - 底部面板已彻底删除'),
    ('// 🔥 关键修复：继�?HTMLAttributes', '// 🔥 关键修复：继承 HTMLAttributes'),
    ('    // 快速检查：交互状态变�?', '    // 快速检查：交互状态变化'),
    ('    // 比较 data 对象的关键字段（避免深度比较整个 data�?', '    // 比较 data 对象的关键字段（避免深度比较整个 data）'),
    ('    // 比较数组字段（浅比较�?', '    // 比较数组字段（浅比较）'),
    ('// 🔥 关键修复：接�?...props 并展开到最外层 div', '// 🔥 关键修复：接收 ...props 并展开到最外层 div'),
    ('  className, style, ...props // 🔥 提取 className, style, 和其�?HTML 属�?', '  className, style, ...props // 🔥 提取 className, style, 和其他 HTML 属性'),
    ('  // 🆕 节点进入动画状�?', '  // 🆕 节点进入动画状态'),
    ('  // 🔥 零拷贝优化：上传视频（不读取文件内容，直接创�?Blob URL�?', '  // 🔥 零拷贝优化：上传视频（不读取文件内容，直接创建 Blob URL）'),
    ('          console.log(`[Node] 上传视频，创�?Blob URL:', '          console.log(`[Node] 上传视频，创建 Blob URL:'),
    ('          // 2. 立即更新节点（不等待保存�?', '          // 2. 立即更新节点（不等待保存）'),
    ('          // 3. 异步保存�?IndexedDB（不阻塞 UI�?', '          // 3. 异步保存到 IndexedDB（不阻塞 UI）'),
    ('  // 🔥 零拷贝优化：上传图片（不读取文件内容，直接创�?Blob URL�?', '  // 🔥 零拷贝优化：上传图片（不读取文件内容，直接创建 Blob URL）'),
    ('          console.log(`[Node] 上传图片，创�?Blob URL:', '          console.log(`[Node] 上传图片，创建 Blob URL:'),
    ('      // 剧本节点的高�?', '      // 剧本节点的高度'),
    ('      if (node.type === NodeType.MULTI_ANGLE_CAMERA) return 800; // 始终大尺�?', '      if (node.type === NodeType.MULTI_ANGLE_CAMERA) return 800; // 始终大尺寸'),
    ('      if (node.type === NodeType.GRID_SPLITTER) return 480; // 九宫格处理节�?', '      if (node.type === NodeType.GRID_SPLITTER) return 480; // 九宫格处理节点'),
    ('      // 剧本节点（新�?', '      // 剧本节点（新）'),
    ('      // 创意工作室节�?', '      // 创意工作室节点'),
    ('      // 角色参考节�?', '      // 角色参考节点'),
    ('      // 场景参考节�?', '      // 场景参考节点'),
    ('      // 多角度相机节�?', '      // 多角度相机节点'),
    ('                      // 清除旧的生成结果，允许重新生�?', '                      // 清除旧的生成结果，允许重新生成'),
    ('                      // 同时更新 selectedGridIndex �?image', '                      // 同时更新 selectedGridIndex 和 image'),
    ('                      // 如果有裁剪后的图�?URL，使用它；否则使用原始九宫格图片', '                      // 如果有裁剪后的图片 URL，使用它；否则使用原始九宫格图片'),
    ('                          image: imageToUse // 设置裁剪后的单张图片，使其可被其他节点获�?', '                          image: imageToUse // 设置裁剪后的单张图片，使其可被其他节点获取'),
    ('      // 九宫格处理节�?', '      // 九宫格处理节点'),
    ('          // 🔥 锁定逻辑：第一次接收图片后，就锁定这个图片，后续不再自动更�?', '          // 🔥 锁定逻辑：第一次接收图片后，就锁定这个图片，后续不再自动更新'),
    ('              // �?已经有保存的图片，使用它（锁定）', '              // 1. 已经有保存的图片，使用它（锁定）'),
    ('              // �?第一次接收，使用输入图片（GridSplitterNode 会自动保存）', '              // 2. 第一次接收，使用输入图片（GridSplitterNode 会自动保存）'),
    ('          // 🔥 使用 useCallback 包装 onUpdate，防止无限循�?', '          // 🔥 使用 useCallback 包装 onUpdate，防止无限循环'),
    ('              // inputImage: 只有明确传入 null 或有值时才更�?', '              // inputImage: 只有明确传入 null 或有值时才更新'),
    ('                  // 有新的图�?', '                  // 有新的图片'),
    ("'生成�?..'", "'生成中...'"),
    ("'处理�?..'", "'处理中...'"),
    ("'拖拽或上�?'", "'拖拽或上传'"),
    ('分镜参�?', '分镜参考'),
    ('     // 底部面板已禁�?- 不需要输入框', '     // 底部面板已禁用 - 不需要输入框'),
    ('  // 🔥 性能优化：交互时禁用昂贵�?CSS 属�?', '  // 🔥 性能优化：交互时禁用昂贵的 CSS 属性'),
    ('            // 🔥 交互时禁�?transition 和昂贵的 CSS', '            // 🔥 交互时禁用 transition 和昂贵的 CSS'),
    ("console.warn('[剧本节点] onCreateWorkflow 未定�?", "console.warn('[剧本节点] onCreateWorkflow 未定义'"),
]

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # 应用所有替换
    for old, new in replacements:
        content = content.replace(old, new)
    
    if content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✓ 已修复 {file_path}")
        print(f"  共修复 {len([1 for old, new in replacements if old in original_content])} 处")
    else:
        print(f"○ {file_path} 无需修复")

except Exception as e:
    print(f"✗ 修复失败: {e}")
