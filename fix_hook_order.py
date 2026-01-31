# -*- coding: utf-8 -*-
"""修复 Hook 调用顺序 - 将 getApproxNodeHeight 移到 useGroup 之前"""

print("=== 修复 Hook 调用顺序 ===")

# 读取文件
with open("App.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

print(f"文件总行数: {len(lines)}")

# 1. 找到 getApproxNodeHeight 的定义（第 635 行左右）
getApproxNodeHeight_start = None
getApproxNodeHeight_end = None

for i in range(600, min(700, len(lines))):
    if "const getApproxNodeHeight = (node: AppNode) => {" in lines[i]:
        getApproxNodeHeight_start = i
        # 找到函数结束（找到 }; 或单独的 }）
        for j in range(i + 1, min(i + 50, len(lines))):
            if lines[j].strip() == "};":
                getApproxNodeHeight_end = j
                break
        break

if getApproxNodeHeight_start is not None and getApproxNodeHeight_end is not None:
    print(f"✅ 找到 getApproxNodeHeight 定义: 第 {getApproxNodeHeight_start + 1}-{getApproxNodeHeight_end + 1} 行")
    
    # 提取 getApproxNodeHeight 函数
    getApproxNodeHeight_lines = lines[getApproxNodeHeight_start:getApproxNodeHeight_end + 1]
    
    # 2. 找到 getNodeBounds 的定义（紧跟在 getApproxNodeHeight 后面）
    getNodeBounds_start = None
    getNodeBounds_end = None
    
    for i in range(getApproxNodeHeight_end + 1, min(getApproxNodeHeight_end + 20, len(lines))):
        if "const getNodeBounds = (node: AppNode) => {" in lines[i]:
            getNodeBounds_start = i
            # 找到函数结束
            for j in range(i + 1, min(i + 10, len(lines))):
                if lines[j].strip() == "};":
                    getNodeBounds_end = j
                    break
            break
    
    if getNodeBounds_start is not None and getNodeBounds_end is not None:
        print(f"✅ 找到 getNodeBounds 定义: 第 {getNodeBounds_start + 1}-{getNodeBounds_end + 1} 行")
        
        # 提取 getNodeBounds 函数
        getNodeBounds_lines = lines[getNodeBounds_start:getNodeBounds_end + 1]
        
        # 3. 删除原位置的函数（包括空行）
        # 删除 getNodeBounds
        del lines[getNodeBounds_start:getNodeBounds_end + 1]
        # 删除 getApproxNodeHeight（注意索引已经变化）
        del lines[getApproxNodeHeight_start:getApproxNodeHeight_start + len(getApproxNodeHeight_lines)]
        
        # 4. 找到 deleteNodesCallback 的结束位置（第 308 行左右）
        insert_position = None
        for i in range(300, min(350, len(lines))):
            if "}, [saveHistory, nodes]);" in lines[i]:
                insert_position = i + 1
                break
        
        if insert_position is not None:
            print(f"✅ 找到插入位置: 第 {insert_position + 1} 行（deleteNodesCallback 之后）")
            
            # 5. 插入函数（添加空行和注释）
            insert_lines = [
                "\n",
                "  // === 辅助函数（必须在 useGroup 之前定义）===\n",
                "  \n",
            ] + getApproxNodeHeight_lines + [
                "\n",
                "  \n",
            ] + getNodeBounds_lines + [
                "\n",
            ]
            
            lines[insert_position:insert_position] = insert_lines
            
            # 保存文件
            with open("App.tsx", "w", encoding="utf-8") as f:
                f.writelines(lines)
            
            print(f"✅ 已将 getApproxNodeHeight 和 getNodeBounds 移到第 {insert_position + 1} 行")
            print(f"   共移动 {len(insert_lines)} 行")
        else:
            print("❌ 未找到插入位置（deleteNodesCallback 结束）")
    else:
        print("❌ 未找到 getNodeBounds 定义")
else:
    print("❌ 未找到 getApproxNodeHeight 定义")

print("\n=== 修复完成 ===")
