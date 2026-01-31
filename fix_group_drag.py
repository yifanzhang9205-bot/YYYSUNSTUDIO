# -*- coding: utf-8 -*-
"""修复 Group 拖动调用 - 替换 onMouseDown 事件"""

import re

print("=== 修复 Group 拖动调用 ===")

# 读取文件
with open("App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 定义要替换的旧代码（使用正则表达式，避免编码问题）
old_pattern = r'onMouseDown=\{\(e\) => \{\s*e\.stopPropagation\(\);\s*selectGroup\(g\.id\);[^}]*dragGroupRef\.current = \{[^}]*\};\s*\}\}'

# 定义新代码
new_code = '''onMouseDown={(e) => {
                          e.stopPropagation();
                          selectGroup(g.id); // 使用 Store 的方法
                          startGroupDrag(e, g.id, g); // ✅ 调用 useGroup Hook 的方法
                      }}'''

# 检查是否找到旧代码
matches = re.findall(old_pattern, content, re.DOTALL)
if matches:
    print(f"✅ 找到 {len(matches)} 处旧的 onMouseDown 代码")
    
    # 替换代码
    content = re.sub(old_pattern, new_code, content, flags=re.DOTALL)
    
    # 保存文件
    with open("App.tsx", "w", encoding="utf-8") as f:
        f.write(content)
    
    print("✅ 已替换 onMouseDown 事件为调用 startGroupDrag")
else:
    print("❌ 未找到旧的 onMouseDown 代码")
    print("尝试查找 dragGroupRef.current 的使用...")
    
    # 查找 dragGroupRef.current 的所有使用
    drag_ref_matches = re.findall(r'dragGroupRef\.current.*?;', content, re.DOTALL)
    if drag_ref_matches:
        print(f"找到 {len(drag_ref_matches)} 处 dragGroupRef.current 的使用")
        for i, match in enumerate(drag_ref_matches[:3], 1):
            print(f"\n使用 {i}:")
            print(match[:200] + "..." if len(match) > 200 else match)

print("\n=== 修复完成 ===")
