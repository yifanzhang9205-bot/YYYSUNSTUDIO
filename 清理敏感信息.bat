@echo off
chcp 65001 >nul
echo ========================================
echo   清理敏感信息脚本
echo ========================================
echo.
echo 此脚本将删除包含 API Key 的文件
echo.
echo 将要删除的文件：
echo - .env.local
echo - 项目迁移方案.md
echo - 迁移准备完成.md
echo - 推送到GitHub指南.md
echo - 快速参考.md
echo - setup-new-computer.bat
echo.
set /p confirm="确认删除？(Y/N): "
if /i "%confirm%" NEQ "Y" (
    echo 已取消
    pause
    exit /b 0
)

echo.
echo 正在删除文件...

if exist .env.local (
    del .env.local
    echo ✅ 已删除 .env.local
)

if exist "项目迁移方案.md" (
    del "项目迁移方案.md"
    echo ✅ 已删除 项目迁移方案.md
)

if exist "迁移准备完成.md" (
    del "迁移准备完成.md"
    echo ✅ 已删除 迁移准备完成.md
)

if exist "推送到GitHub指南.md" (
    del "推送到GitHub指南.md"
    echo ✅ 已删除 推送到GitHub指南.md
)

if exist "快速参考.md" (
    del "快速参考.md"
    echo ✅ 已删除 快速参考.md
)

if exist setup-new-computer.bat (
    del setup-new-computer.bat
    echo ✅ 已删除 setup-new-computer.bat
)

echo.
echo ========================================
echo   清理完成！
echo ========================================
echo.
echo 敏感信息已删除，但代码仍然保留
echo 这些文件已备份在 GitHub 上
echo 在新电脑上可以重新下载
echo.
pause
