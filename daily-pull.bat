@echo off
chcp 65001 >nul
echo ========================================
echo   SunStudio 每日拉取脚本
echo ========================================
echo.

echo [1/2] 拉取最新代码...
git pull
if errorlevel 1 (
    echo ❌ 拉取失败，可能存在冲突
    echo.
    echo 请手动解决冲突后再试
    pause
    exit /b 1
)
echo ✅ 代码已更新到最新版本
echo.

echo [2/2] 检查依赖更新...
call npm install
if errorlevel 1 (
    echo ⚠️  依赖更新失败，但不影响使用
) else (
    echo ✅ 依赖已更新
)
echo.

echo ========================================
echo   完成！可以开始工作了
echo ========================================
echo.
echo 运行以下命令启动开发服务器：
echo.
echo    npm run dev
echo.
echo ========================================
pause
