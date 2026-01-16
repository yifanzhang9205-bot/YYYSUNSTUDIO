@echo off
chcp 65001 >nul
echo ========================================
echo   SunStudio 每日推送脚本
echo ========================================
echo.

echo [1/4] 检查修改的文件...
git status
echo.

echo [2/4] 添加所有修改...
git add .
if errorlevel 1 (
    echo ❌ 添加文件失败
    pause
    exit /b 1
)
echo ✅ 文件添加成功
echo.

echo [3/4] 创建提交...
set /p commit_msg="请输入提交说明（描述你做了什么）: "
if "%commit_msg%"=="" (
    set commit_msg=Update: daily work
)
git commit -m "%commit_msg%"
if errorlevel 1 (
    echo ⚠️  没有需要提交的修改
    pause
    exit /b 0
)
echo ✅ 提交成功
echo.

echo [4/4] 推送到 GitHub...
git push
if errorlevel 1 (
    echo ❌ 推送失败，请检查网络连接
    pause
    exit /b 1
)
echo ✅ 推送成功
echo.

echo ========================================
echo   完成！代码已同步到 GitHub
echo ========================================
pause
