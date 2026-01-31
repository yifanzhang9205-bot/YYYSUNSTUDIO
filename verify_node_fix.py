#!/usr/bin/env python3
"""
验证 Node.tsx 的修复是否正确
"""

import re

# 读取文件
with open('components/Node.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

print("=" * 60)
print("验证 Node.tsx 修复")
print("=" * 60)

# 检查 1：组件参数是否包含 className, style, ...props
if re.search(r'className,\s*style,\s*\.\.\.props', content):
    print("✅ 组件参数包含: className, style, ...props")
else:
    print("❌ 组件参数缺少: className, style, ...props")

# 检查 2：return 语句中是否有 {...props}
if re.search(r'return\s*\(\s*<div[^>]*\{\.\.\.props\}', content, re.DOTALL):
    print("✅ 最外层 div 包含: {...props}")
else:
    print("❌ 最外层 div 缺少: {...props}")

# 检查 3：是否有 data-node-id
if re.search(r'data-node-id=\{node\.id\}', content):
    print("✅ 最外层 div 包含: data-node-id={node.id}")
else:
    print("❌ 最外层 div 缺少: data-node-id={node.id}")

# 检查 4：是否有 id 属性
if re.search(r'id=\{props\.id \|\| `node-\$\{node\.id\}`\}', content):
    print("✅ 最外层 div 包含: id={props.id || `node-${node.id}`}")
else:
    print("❌ 最外层 div 缺少: id={props.id || `node-${node.id}`}")

# 检查 5：className 是否合并
if re.search(r'className=\{`[^`]*\$\{className \|\| \'\'\}`\}', content):
    print("✅ className 正确合并: ${className || ''}")
else:
    print("❌ className 未正确合并")

# 检查 6：style 是否合并
if re.search(r'\.\.\.style', content):
    print("✅ style 正确合并: ...style")
else:
    print("❌ style 未正确合并")

print("=" * 60)
print("验证完成")
print("=" * 60)

# 提取并显示关键代码片段
print("\n关键代码片段：")
print("-" * 60)

# 提取组件参数定义
match = re.search(r'const NodeComponent.*?\{([^}]+className[^}]+)\}', content, re.DOTALL)
if match:
    print("组件参数：")
    print(match.group(1).strip()[:200] + "...")

# 提取 return 语句的 div
match = re.search(r'return\s*\(\s*<div([^>]{100,500})>', content, re.DOTALL)
if match:
    print("\n最外层 div 属性：")
    attrs = match.group(1).strip()
    # 格式化输出
    for line in attrs.split('\n'):
        if line.strip():
            print(f"  {line.strip()}")

print("-" * 60)
