#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import re

# 读取文件
with open('components/MultiAngleCameraNode.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. 删除 showResults state 定义
content = re.sub(r'  const \[showResults, setShowResults\] = useState\(false\);\n', '', content)

# 2. 删除预览按钮（保留"已输出"提示）
preview_button_pattern = r'''                <button
                  onClick=\{\(\) => setShowResults\(true\)\}
                  className="h-10 px-4 bg-black/40 backdrop-blur-xl rounded-full border border-white/10 flex items-center gap-2 text-white/60 hover:text-white hover:bg-white/10 transition-all active:scale-95"
                >
                  <span className="text-\[13px\] font-medium">预览</span>
                </button>
'''
content = re.sub(preview_button_pattern, '', content)

# 3. 删除整个预览面板
preview_panel_pattern = r'''
      \{/\* 结果面板 - 使用九宫格选择器 \*/\}
      \{showResults && gridImages && gridImages\.length > 0 && \(
        <div className="absolute inset-0 bg-\[#0a0a0a\]/95 backdrop-blur-2xl flex flex-col z-20 rounded-2xl">
          \{/\* 头部 \*/\}
          <div className="h-14 flex items-center justify-between px-5 border-b border-white/5 shrink-0">
            <span className="text-\[15px\] font-semibold text-white">生成结果</span>
            <button 
              onClick=\{\(\) => setShowResults\(false\)\} 
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all"
            >
              <X size=\{16\} />
            </button>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
            \{/\* 九宫格选择器 - 自动识别并切割九宫格图片 \*/\}
            <GridImageSelector
              gridImageUrl=\{gridImages\[0\]\}
              selectedIndex=\{selectedGridIndex\}
              onSelect=\{\(index, croppedUrl\) => \{
                // 当用户选择某张图片时，更新选中索引和裁剪后的图片
                onGridSelect\(index, croppedUrl\);
              \}\}
              onConfirm=\{\(index, croppedUrl\) => \{
                // 确认选择时，传递裁剪后的图片并关闭面板
                onGridSelect\(index, croppedUrl\);
                setShowResults\(false\);
              \}\}
              showConfirmButton=\{true\}
              className="h-full"
            />
          </div>
        </div>
      \)\}'''
content = re.sub(preview_panel_pattern, '', content, flags=re.MULTILINE)

# 4. 删除 GridImageSelector import
content = re.sub(r"import \{ GridImageSelector \} from '\./GridImageSelector';\n", '', content)

# 写回文件
with open('components/MultiAngleCameraNode.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)

print("Done! Removed preview functionality.")
