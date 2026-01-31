# 修复 Group onMouseDown 事件
$content = Get-Content App.tsx -Raw

# 查找并替换 Group 的 onMouseDown 事件
# 旧代码：内联逻辑 + dragGroupRef.current
# 新代码：调用 startGroupDrag(e, g.id, g)

$oldPattern = @'
                      onMouseDown=\{\(e\) => \{
                          e\.stopPropagation\(\);
                          selectGroup\(g\.id\); // 使用 Store 的方法

                          const childNodes = Array\.from\(nodes\.values\(\)\)\.filter\(n => \{
                              const b = getNodeBounds\(n\);
                              const cx = b\.x \+ b\.width/2;
                              const cy = b\.y \+ b\.height/2;
                              return cx>g\.x && cx<g\.x\+g\.width && cy>g\.y && cy<g\.y\+g\.height;
                          \}\)\.map\(n=>\(\{id:n\.id, startX:n\.x, startY:n\.y\}\)\);

                          // 缓存 Group 和子节点的 DOM 元素
                          const groupElement = document\.querySelector\(`\[data-group-id="\$\{g\.id\}"\]`\) as HTMLElement;
                          const childElements = new Map<string, HTMLElement>\(\);
                          childNodes\.forEach\(child => \{
                              const el = document\.querySelector\(`\[data-node-id="\$\{child\.id\}"\]`\) as HTMLElement;
                              if \(el\) childElements\.set\(child\.id, el\);
                          \}\);

                          dragGroupRef\.current = \{
                              id: g\.id,
                              startX: g\.x,
                              startY: g\.y,
                              mouseStartX: e\.clientX,
                              mouseStartY: e\.clientY,
                              childNodes,
                              groupElement,
                              childElements
                          \};
                      \}\}
'@

$newCode = @'
                      onMouseDown={(e) => {
                          e.stopPropagation();
                          selectGroup(g.id);
                          startGroupDrag(e, g.id, g); // ✅ 调用 useGroup Hook 的方法
                      }}
'@

if ($content -match $oldPattern) {
    $content = $content -replace $oldPattern, $newCode
    $content | Out-File -FilePath App.tsx -Encoding UTF8 -NoNewline
    Write-Host "✅ 修复成功！Group onMouseDown 现在调用 startGroupDrag"
} else {
    Write-Host "❌ 未找到匹配的代码模式"
    Write-Host "尝试简化的匹配..."
    
    # 简化版：只匹配关键部分
    $simplePattern = 'dragGroupRef\.current = \{[^}]+\};'
    if ($content -match $simplePattern) {
        Write-Host "找到 dragGroupRef.current，但需要手动修复"
    }
}
