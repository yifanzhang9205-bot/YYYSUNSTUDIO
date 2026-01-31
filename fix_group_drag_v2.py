# -*- coding: utf-8 -*-
"""修复 Group 拖动调用 - 直接替换指定行"""

print("=== 修复 Group 拖动调用 ===")

# 读取文件
with open("App.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

print(f"文件总行数: {len(lines)}")

# 查找 onMouseDown 的开始行（第 2017 行，索引 2016）
start_line = 2016  # 第 2017 行（索引从 0 开始）
end_line = 2045    # 第 2046 行

# 检查是否是正确的位置
if start_line < len(lines) and "onMouseDown" in lines[start_line]:
    print(f"✅ 找到 onMouseDown 在第 {start_line + 1} 行")
    
    # 新的代码（4 行）
    new_lines = [
        "                      onMouseDown={(e) => {\n",
        "                          e.stopPropagation();\n",
        "                          selectGroup(g.id); // 使用 Store 的方法\n",
        "                          startGroupDrag(e, g.id, g); // ✅ 调用 useGroup Hook 的方法\n",
        "                      }}\n",
    ]
    
    # 替换行
    lines[start_line:end_line+1] = new_lines
    
    # 保存文件
    with open("App.tsx", "w", encoding="utf-8") as f:
        f.writelines(lines)
    
    print(f"✅ 已替换第 {start_line + 1}-{end_line + 1} 行")
    print(f"   旧代码: {end_line - start_line + 1} 行")
    print(f"   新代码: {len(new_lines)} 行")
else:
    print(f"❌ 第 {start_line + 1} 行不包含 onMouseDown")
    if start_line < len(lines):
        print(f"   实际内容: {lines[start_line][:100]}")

print("\n=== 修复完成 ===")
