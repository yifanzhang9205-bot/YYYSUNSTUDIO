#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
修复 GridSplitterNode.tsx 的语法错误
- 移除重复的拖手定义
- 确保所有标签正确闭合
"""

# 读取文件
with open('components/GridSplitterNode.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 找到第一个拖手定义的位置（在最外层 div 中）
# 这个是正确的位置，应该保留
first_drag_handle_start = content.find('      {/* 🔥 拖动手柄 - 在最外层')
first_drag_handle_end = content.find('      )}', first_drag_handle_start) + 8

# 找到第二个拖手定义的位置（在单图模式的 div 中）
# 这个是错误的位置，应该删除
second_drag_handle_start = content.find('            {/* 🔥 拖动手柄 - 优化版')
if second_drag_handle_start != -1:
    second_drag_handle_end = content.find('            )}', second_drag_handle_start) + 14
    # 删除第二个拖手定义
    content = content[:second_drag_handle_start] + content[second_drag_handle_end:]
    print(f'✅ 删除了重复的拖手定义（位置：{second_drag_handle_start}-{second_drag_handle_end}）')

# 修复显示条件：从 isSingleView 改为 isSingleView && isSelected
content = content.replace(
    '      {isSingleView && (',
    '      {isSingleView && isSelected && ('
)
print('✅ 修复了拖手显示条件：isSingleView && isSelected')

# 写回文件
with open('components/GridSplitterNode.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('✅ 修复完成！')
