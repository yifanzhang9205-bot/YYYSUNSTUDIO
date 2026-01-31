#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""修复 App.tsx 中的 useDrag API 不兼容问题"""

import re

# 读取文件
with open('App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 修改 1：删除 useDrag 解构中的 handleMouseMove 和 handleMouseUp（第 485-490 行）
content = re.sub(
    r'(const\s*\{\s*handleMouseDown:\s*handleNodeDragStart,)\s*handleMouseMove:\s*handleNodeDragMove,\s*handleMouseUp:\s*handleNodeDragEnd,\s*(cancelDrag,)',
    r'\1\n    \2',
    content
)

# 修改 2：删除 handleNodeDragMove 调用（第 909-914 行）
content = re.sub(
    r'//\s*===\s*节点拖拽：使用\s*useDrag\s*Hook\s*===\s*\n\s*if\s*\(isDraggingNode\)\s*\{\s*\n\s*handleNodeDragMove\(e\);\s*\n\s*return;\s*\n\s*\}',
    '// === 节点拖拽：useDrag Hook 自动处理（通过 useEffect）===\n      // 不需要手动调用，useDrag Hook 内部已经注册了全局 mousemove 监听器',
    content
)

# 修改 3：删除 handleNodeDragEnd 调用（第 925-930 行）
content = re.sub(
    r'//\s*===\s*节点拖拽结束：使用\s*useDrag\s*Hook\s*===\s*\n\s*if\s*\(isDraggingNode\)\s*\{\s*\n\s*handleNodeDragEnd\(e\);\s*\n\s*return;\s*\n\s*\}',
    '// === 节点拖拽结束：useDrag Hook 自动处理（通过 useEffect）===\n      // 不需要手动调用，useDrag Hook 内部已经注册了全局 mouseup 监听器',
    content
)

# 修改 4：删除依赖数组中的 handleNodeDragMove（第 920 行）
content = re.sub(
    r'\},\s*\[selectionRect,\s*isDraggingNode,\s*isDraggingGroup,\s*scale,\s*updateBoxSelection,\s*updateGroupDrag,\s*handleNodeDragMove\]\);',
    '}, [selectionRect, isDraggingNode, isDraggingGroup, scale, updateBoxSelection, updateGroupDrag]);',
    content
)

# 保存文件
with open('App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ 修复完成！")
print("已删除 handleNodeDragMove 和 handleNodeDragEnd 的调用")
