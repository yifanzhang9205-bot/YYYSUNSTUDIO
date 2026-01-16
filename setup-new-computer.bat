@echo off
chcp 65001 >nul
echo ========================================
echo   SunStudio 新电脑设置脚本
echo ========================================
echo.

echo [1/3] 检查 Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 未检测到 Node.js，请先安装：https://nodejs.org
    pause
    exit /b 1
)
echo ✅ Node.js 已安装
node --version
echo.

echo [2/3] 安装项目依赖...
echo 这可能需要几分钟，请耐心等待...
call npm install
if errorlevel 1 (
    echo ❌ 依赖安装失败
    pause
    exit /b 1
)
echo ✅ 依赖安装成功
echo.

echo [3/3] 创建环境变量文件...
if exist .env.local (
    echo ⚠️  .env.local 文件已存在，跳过创建
) else (
    echo GEMINI_API_KEY=AIzaSyAa31dI6OI9iq3PLfChFAZjpBRo83frAV8 > .env.local
    echo API_KEY=AIzaSyAa31dI6OI9iq3PLfChFAZjpBRo83frAV8 >> .env.local
    echo ✅ 环境变量文件创建成功
)
echo.

echo ========================================
echo   设置完成！
echo ========================================
echo.
echo 运行以下命令启动开发服务器：
echo.
echo    npm run dev
echo.
echo 然后在浏览器访问：http://localhost:5173
echo.
echo ========================================
pause
