#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""批量替换所有组件中的深色背景为亮色风格"""

import re
import os

# 定义要处理的文件列表
files = [
    "components/VideoNodeModules.tsx",
    "components/StoryboardShotNode.tsx",
    "components/SonicStudio.tsx",
    "components/SmartSequenceDock.tsx",
    "components/SketchEditor.tsx",
    "components/MultiAngleCameraNode.tsx",
    "components/GridSplitterNode.tsx",
    "components/ScriptNode.tsx",
    "components/StoryStudioNode.tsx",
    "components/SceneReferenceNode.tsx",
    "components/CharacterReferenceNode.tsx",
    "components/ImageCropper.tsx",
    "components/ChatWindow.tsx",
    "components/AssistantPanel.tsx"
]

# 定义替换规则（顺序很重要！）
replacements = [
    # 自定义深色背景颜色
    (r'bg-\[#0a0a0c\]', 'bg-gray-100'),
    (r'bg-\[#1c1c1e\]', 'bg-gray-100'),
    (r'bg-\[#2c2c2e\]', 'bg-gray-200'),
    (r'bg-\[#121214\]', 'bg-gray-100'),
    (r'bg-\[#0a0a0a\]', 'bg-gray-100'),
    (r'bg-\[#1a1a1c\]', 'bg-gray-100'),
    
    # Tailwind 深色背景
    (r'bg-zinc-900', 'bg-gray-100'),
    (r'bg-gray-900(?!/)', 'bg-gray-100'),  # bg-gray-900 但不是 bg-gray-900/XX
    
    # 半透明深色背景
    (r'bg-gray-900/90', 'bg-gray-100/90'),
    (r'bg-gray-900/80', 'bg-gray-100/80'),
    (r'bg-gray-900/60', 'bg-gray-100/60'),
    (r'bg-gray-900/50', 'bg-gray-100/50'),
    (r'bg-gray-900/40', 'bg-gray-100/40'),
    (r'bg-gray-900/30', 'bg-gray-100/30'),
    (r'bg-gray-900/20', 'bg-gray-100/20'),
    (r'bg-gray-900/10', 'bg-gray-100/10'),
]

total_changes = 0
total_files_changed = 0

for file_path in files:
    if not os.path.exists(file_path):
        print(f"✗ 文件不存在: {file_path}")
        continue
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # 应用所有替换规则
        for pattern, replacement in replacements:
            content = re.sub(pattern, replacement, content)
        
        # 如果内容有变化，写回文件
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            total_files_changed += 1
            print(f"✓ 已修改: {file_path}")
        else:
            print(f"○ 无需修改: {file_path}")
    
    except Exception as e:
        print(f"✗ 处理失败 {file_path}: {e}")

print(f"\n总计修改了 {total_files_changed} 个文件")
