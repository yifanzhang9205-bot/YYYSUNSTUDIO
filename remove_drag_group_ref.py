# -*- coding: utf-8 -*-
"""删除旧的 dragGroupRef 声明"""

print("=== 删除旧的 dragGroupRef 声明 ===")

# 读取文件
with open("App.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

print(f"文件总行数: {len(lines)}")

# 查找 dragGroupRef 的声明（第 516 行，索引 515）
start_line = 515  # 第 516 行（索引从 0 开始）

# 检查是否是正确的位置
if start_line < len(lines) and "const dragGroupRef = useRef" in lines[start_line]:
    print(f"✅ 找到 dragGroupRef 声明在第 {start_line + 1} 行")
    
    # 找到声明的结束位置（找到 } | null>(null); 这一行）
    end_line = start_line
    for i in range(start_line, min(start_line + 20, len(lines))):
        if "} | null>(null);" in lines[i]:
            end_line = i
            break
    
    print(f"   声明结束在第 {end_line + 1} 行")
    print(f"   共 {end_line - start_line + 1} 行")
    
    # 删除这些行（包括前后的空行）
    # 检查前一行是否是空行
    if start_line > 0 and lines[start_line - 1].strip() == "":
        start_line -= 1
        print(f"   包含前面的空行，从第 {start_line + 1} 行开始删除")
    
    # 删除行
    del lines[start_line:end_line + 1]
    
    # 保存文件
    with open("App.tsx", "w", encoding="utf-8") as f:
        f.writelines(lines)
    
    print(f"✅ 已删除 dragGroupRef 声明")
else:
    print(f"❌ 第 {start_line + 1} 行不包含 dragGroupRef 声明")
    if start_line < len(lines):
        print(f"   实际内容: {lines[start_line][:100]}")

print("\n=== 删除完成 ===")
