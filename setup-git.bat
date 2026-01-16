@echo off
chcp 65001 >nul
echo ========================================
echo   SunStudio Git 初始化脚本
echo ========================================
echo.

echo [1/3] 初始化 Git 仓库...
git init
if errorlevel 1 (
    echo ❌ Git 初始化失败，请确保已安装 Git
    pause
    exit /b 1
)
echo ✅ Git 仓库初始化成功
echo.

echo [2/3] 添加所有文件...
git add .
if errorlevel 1 (
    echo ❌ 添加文件失败
    pause
    exit /b 1
)
echo ✅ 文件添加成功
echo.

echo [3/3] 创建初始提交...
git commit -m "Initial commit: SunStudio project"
if errorlevel 1 (
    echo ❌ 提交失败
    pause
    exit /b 1
)
echo ✅ 初始提交成功
echo.

echo ========================================
echo   下一步操作
echo ========================================
echo.
echo 1. 访问 https://github.com/new
echo 2. 创建一个新的私有仓库（名称：sunstudio）
echo 3. 不要勾选 "Initialize with README"
echo 4. 创建后，复制仓库 URL
echo.
echo 5. 执行以下命令（替换 YOUR_USERNAME）：
echo.
echo    git remote add origin https://github.com/YOUR_USERNAME/sunstudio.git
echo    git branch -M main
echo    git push -u origin main
echo.
echo ========================================
pause
