#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
高对比度极简主义风格批量替换脚本
High Contrast Minimalist Style Batch Replacement
"""

import re
import os

# 样式替换映射
STYLE_REPLACEMENTS = [
    # 1. 节点背景：保持白色，但改用黑色边框和锐利阴影
    (r'bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg shadow-sm', 
     'bg-white border border-black rounded-md shadow-[0_4px_12px_rgba(0,0,0,0.15)]'),
    
    (r'bg-white/95 backdrop-blur-xl border border-gray-200 rounded-lg shadow-lg',
     'bg-white border border-black rounded-md shadow-[0_4px_12px_rgba(0,0,0,0.15)]'),
    
    (r'bg-white border border-gray-200 shadow-sm',
     'bg-white border border-black shadow-[0_4px_12px_rgba(0,0,0,0.15)]'),
    
    # 2. 圆角：从 rounded-lg 改为 rounded-md (8px -> 6px)
    (r'rounded-lg', 'rounded-md'),
    (r'rounded-xl', 'rounded-md'),
    
    # 3. 文字颜色：从灰色改为黑色
    (r'text-gray-600', 'text-black'),
    (r'text-gray-700', 'text-black'),
    (r'text-gray-800', 'text-black'),
    (r'text-gray-900', 'text-black'),
    (r'text-slate-400', 'text-black'),
    (r'text-slate-600', 'text-black'),
    
    # 4. 边框：从灰色改为黑色
    (r'border-gray-200', 'border-black'),
    (r'border-gray-300', 'border-black'),
    (r'border-white/10', 'border-black'),
    
    # 5. 滑块：从蓝色改为黑色
    (r'bg-blue-500', 'bg-black'),
    (r'text-blue-500', 'text-black'),
    
    # 6. Hover 状态：从灰色改为黑色
    (r'hover:text-gray-900', 'hover:text-black'),
    (r'hover:bg-gray-100', 'hover:bg-gray-50'),
    
    # 7. 背景透明度：移除 backdrop-blur
    (r'backdrop-blur-sm', ''),
    (r'backdrop-blur-xl', ''),
    (r'backdrop-blur-lg', ''),
    
    # 8. 占位符文字：改为深灰
    (r'placeholder:text-gray-400', 'placeholder:text-gray-600'),
]

def apply_replacements(content):
    """应用所有样式替换"""
    for old, new in STYLE_REPLACEMENTS:
        content = re.sub(old, new, content)
    return content

def process_file(filepath):
    """处理单个文件"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        content = apply_replacements(content)
        
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✅ 已更新: {filepath}")
            return True
        else:
            print(f"⏭️  无需更新: {filepath}")
            return False
    except Exception as e:
        print(f"❌ 错误 {filepath}: {e}")
        return False

def main():
    """主函数"""
    files_to_process = [
        'App.tsx',
        'components/Node.tsx',
        'components/SidebarDock.tsx',
        'components/Minimap.tsx',
        'components/GroupToolbar.tsx',
        'components/AssistantPanel.tsx',
        'components/CanvasBoard.tsx',
        'components/ChatWindow.tsx',
        'components/SettingsModal.tsx',
        'components/MultiFrameDock.tsx',
        'components/SmartSequenceDock.tsx',
        'components/SonicStudio.tsx',
    ]
    
    updated_count = 0
    for filepath in files_to_process:
        if os.path.exists(filepath):
            if process_file(filepath):
                updated_count += 1
        else:
            print(f"⚠️  文件不存在: {filepath}")
    
    print(f"\n🎉 完成！共更新 {updated_count} 个文件")

if __name__ == '__main__':
    main()
