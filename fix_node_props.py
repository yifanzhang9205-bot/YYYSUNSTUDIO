#!/usr/bin/env python3
"""
修复 Node.tsx 的 props 透传问题
确保 data-node-id 和 id 属性能正确渲染到 HTML
"""

import re

# 读取文件
with open('components/Node.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 查找并替换组件函数定义
# 原始模式：匹配当前的参数列表（可能有或没有 onCreateWorkflow）
old_pattern = r'const NodeComponent: React\.FC<NodeProps> = \(\{\s*node, onUpdate, onAction, onDelete, onExpand, onCrop, onNodeMouseDown, onPortMouseDown, onPortMouseUp, onNodeContextMenu, onMediaContextMenu, onResizeMouseDown, inputAssets, onInputReorder,.*?isDragging, isGroupDragging, isSelected, isResizing, isConnecting\s*\}\) => \{'

# 新的参数列表：添加 className, style, ...props
new_params = '''const NodeComponent: React.FC<NodeProps> = ({ 
  node, onUpdate, onAction, onDelete, onExpand, onCrop, onNodeMouseDown, onPortMouseDown, onPortMouseUp, onNodeContextMenu, onMediaContextMenu, onResizeMouseDown, inputAssets, onInputReorder, onCreateWorkflow, isDragging, isGroupDragging, isSelected, isResizing, isConnecting,
  className, style, ...props // 🔥 关键：解构 className, style 和其他 HTML 属性
}) => {'''

# 执行替换
content_new = re.sub(old_pattern, new_params, content, flags=re.DOTALL)

# 检查是否替换成功
if content_new == content:
    print("❌ 未找到匹配的模式，尝试更宽松的匹配...")
    
    # 更宽松的模式：只匹配关键部分
    old_pattern2 = r'(const NodeComponent: React\.FC<NodeProps> = \(\{[^}]+)(isDragging, isGroupDragging, isSelected, isResizing, isConnecting\s*)\}\) => \{'
    
    new_params2 = r'\1isDragging, isGroupDragging, isSelected, isResizing, isConnecting,\n  className, style, ...props // 🔥 关键：解构 className, style 和其他 HTML 属性\n}) => {'
    
    content_new = re.sub(old_pattern2, new_params2, content, flags=re.DOTALL)
    
    if content_new == content:
        print("❌ 仍然未找到匹配，手动查找...")
        # 查找 NodeComponent 定义的位置
        match = re.search(r'const NodeComponent.*?\{', content, re.DOTALL)
        if match:
            print(f"找到 NodeComponent 定义：\n{match.group()[:200]}...")
        else:
            print("未找到 NodeComponent 定义")
        exit(1)

# 写回文件
with open('components/Node.tsx', 'w', encoding='utf-8') as f:
    f.write(content_new)

print("✅ 成功修复 Node.tsx 的 props 透传问题")
print("✅ 已添加: className, style, ...props")
