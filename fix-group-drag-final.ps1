# 修复 Group 拖动调用 - 最终版
$content = Get-Content "App.tsx" -Raw -Encoding UTF8

# 新代码
$newCode = @'
                      onMouseDown={(e) => {
                          e.stopPropagation();
                          selectGroup(g.id); // 使用 Store 的方法
                          startGroupDrag(e, g.id, g); // ✅ 调用 useGroup Hook 的方法
                      }}
'@

# 读取文件为行数组
$lines = Get-Content "App.tsx" -Encoding UTF8

# 找到起始行（第 2097 行，索引 2096）
$startIndex = 2096
$endIndex = 2125

# 检查是否找到正确的位置
if ($lines[$startIndex] -match 'onMouseDown=') {
    Write-Host "✅ 找到 onMouseDown 在第 $($startIndex + 1) 行" -ForegroundColor Green
    
    # 替换第 2097-2126 行
    $newLines = @()
    $newLines += $lines[0..($startIndex - 1)]  # 前面的行
    $newLines += $newCode  # 新代码
    $newLines += $lines[($endIndex + 1)..($lines.Count - 1)]  # 后面的行
    
    # 写回文件
    $newLines | Set-Content "App.tsx" -Encoding UTF8
    
    Write-Host "✅ 成功修复 Group 拖动调用！" -ForegroundColor Green
    Write-Host "已将第 $($startIndex + 1) 到第 $($endIndex + 1) 行替换为调用 startGroupDrag" -ForegroundColor Green
} else {
    Write-Host "❌ 未找到正确的位置" -ForegroundColor Red
    Write-Host "第 $($startIndex + 1) 行内容：$($lines[$startIndex])" -ForegroundColor Yellow
}
