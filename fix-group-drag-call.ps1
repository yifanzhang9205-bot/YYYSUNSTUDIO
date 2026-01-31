# 修复 Group 拖动调用 - 替换 onMouseDown 事件
$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "=== 修复 Group 拖动调用 ===" -ForegroundColor Cyan

# 读取文件（UTF-8 编码）
$content = Get-Content "App.tsx" -Raw -Encoding UTF8

# 定义要替换的旧代码（第 2017-2046 行）
$oldCode = @'
                      onMouseDown={(e) => { 
                          e.stopPropagation();
                          selectGroup(g.id); // 使用 Store 的方法

                          const childNodes = Array.from(nodes.values()).filter(n => {
                              const b = getNodeBounds(n);
                              const cx = b.x + b.width/2;
                              const cy = b.y + b.height/2;
                              return cx>g.x && cx<g.x+g.width && cy>g.y && cy<g.y+g.height;
                          }).map(n=>({id:n.id, startX:n.x, startY:n.y}));

                          // 缓存 Group 和子节点的 DOM 元素
                          const groupElement = document.querySelector(`[data-group-id="${g.id}"]`) as HTMLElement;
                          const childElements = new Map<string, HTMLElement>();
                          childNodes.forEach(child => {
                              const el = document.querySelector(`[data-node-id="${child.id}"]`) as HTMLElement;
                              if (el) childElements.set(child.id, el);
                          });

                          dragGroupRef.current = {
                              id: g.id,
                              startX: g.x,
                              startY: g.y,
                              mouseStartX: e.clientX,
                              mouseStartY: e.clientY,
                              childNodes,
                              groupElement,
                              childElements
                          };
                      }}
'@

# 定义新代码
$newCode = @'
                      onMouseDown={(e) => {
                          e.stopPropagation();
                          selectGroup(g.id); // 使用 Store 的方法
                          startGroupDrag(e, g.id, g); // ✅ 调用 useGroup Hook 的方法
                      }}
'@

# 检查旧代码是否存在
if ($content -match [regex]::Escape($oldCode)) {
    Write-Host "✅ 找到旧的 onMouseDown 代码" -ForegroundColor Green
    
    # 替换代码
    $content = $content -replace [regex]::Escape($oldCode), $newCode
    
    # 保存文件（UTF-8 编码，无 BOM）
    $utf8NoBom = New-Object System.Text.UTF8Encoding $false
    [System.IO.File]::WriteAllText("$PWD\App.tsx", $content, $utf8NoBom)
    
    Write-Host "✅ 已替换 onMouseDown 事件为调用 startGroupDrag" -ForegroundColor Green
} else {
    Write-Host "❌ 未找到旧的 onMouseDown 代码" -ForegroundColor Red
    Write-Host "可能已经被修改过了" -ForegroundColor Yellow
}

Write-Host "`n=== 修复完成 ===" -ForegroundColor Cyan
