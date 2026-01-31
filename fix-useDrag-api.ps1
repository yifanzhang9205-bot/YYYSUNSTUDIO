# 修复 App.tsx 中的 useDrag API 不兼容问题

$file = "App.tsx"
$content = Get-Content $file -Raw -Encoding UTF8

# 修改 1：删除 useDrag 解构中的 handleMouseMove 和 handleMouseUp
$content = $content -replace `
    '(?s)(const\s*\{\s*handleMouseDown:\s*handleNodeDragStart,\s*)handleMouseMove:\s*handleNodeDragMove,\s*handleMouseUp:\s*handleNodeDragEnd,\s*(cancelDrag,\s*isDragging:\s*isDraggingNode,\s*\}\s*=\s*useDrag\(\{)', `
    '$1$2'

# 修改 2：删除 handleNodeDragMove 调用
$content = $content -replace `
    '(?s)//\s*===\s*节点拖拽：使用\s*useDrag\s*Hook\s*===\s*if\s*\(isDraggingNode\)\s*\{\s*handleNodeDragMove\(e\);\s*return;\s*\}', `
    '// === 节点拖拽：useDrag Hook 自动处理（通过 useEffect）===
      // 不需要手动调用，useDrag Hook 内部已经注册了全局 mousemove 监听器'

# 修改 3：删除 handleNodeDragEnd 调用
$content = $content -replace `
    '(?s)//\s*===\s*节点拖拽结束：使用\s*useDrag\s*Hook\s*===\s*if\s*\(isDraggingNode\)\s*\{\s*handleNodeDragEnd\(e\);\s*return;\s*\}', `
    '// === 节点拖拽结束：useDrag Hook 自动处理（通过 useEffect）===
      // 不需要手动调用，useDrag Hook 内部已经注册了全局 mouseup 监听器'

# 修改 4：删除依赖数组中的 handleNodeDragMove
$content = $content -replace `
    '\},\s*\[selectionRect,\s*isDraggingNode,\s*isDraggingGroup,\s*scale,\s*updateBoxSelection,\s*updateGroupDrag,\s*handleNodeDragMove\]\);', `
    '}, [selectionRect, isDraggingNode, isDraggingGroup, scale, updateBoxSelection, updateGroupDrag]);'

# 保存文件
$content | Out-File $file -Encoding UTF8 -NoNewline

Write-Host "✅ 修复完成！" -ForegroundColor Green
Write-Host "已删除 handleNodeDragMove 和 handleNodeDragEnd 的调用" -ForegroundColor Green
