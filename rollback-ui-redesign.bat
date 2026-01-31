@echo off
REM UI 改版回滚脚本
REM 回滚到：2026-02-01 03:00（北京时间）

echo ========================================
echo UI 改版回滚脚本
echo 回滚到：2026-02-01 03:00
echo ========================================
echo.

REM 检查备份文件夹是否存在
set BACKUP_DIR=backup-ui-redesign-20260201-0300
if not exist %BACKUP_DIR% (
    echo 错误：备份文件夹不存在！
    echo 请先运行 backup-before-ui-redesign.bat
    pause
    exit /b 1
)

echo 警告：此操作将覆盖当前代码！
echo 请确认是否继续？
pause

REM 1. Git 回滚（推荐）
echo.
echo [方式 1] Git 回滚（推荐）
echo 是否使用 Git 回滚？(Y/N)
set /p USE_GIT=

if /i "%USE_GIT%"=="Y" (
    echo 正在使用 Git 回滚...
    set /p COMMIT_HASH=<%BACKUP_DIR%\git-commit-hash.txt
    git reset --hard %COMMIT_HASH%
    echo Git 回滚完成！
    goto :end
)

REM 2. 手动回滚
echo.
echo [方式 2] 手动回滚
echo 正在恢复文件...

REM 恢复源代码
echo [1/3] 恢复源代码...
copy /Y %BACKUP_DIR%\App.tsx App.tsx
xcopy /E /I /Y %BACKUP_DIR%\components components
xcopy /E /I /Y %BACKUP_DIR%\hooks hooks
xcopy /E /I /Y %BACKUP_DIR%\core core
xcopy /E /I /Y %BACKUP_DIR%\services services
xcopy /E /I /Y %BACKUP_DIR%\utils utils
xcopy /E /I /Y %BACKUP_DIR%\workers workers

REM 恢复配置文件
echo [2/3] 恢复配置文件...
copy /Y %BACKUP_DIR%\package.json package.json
copy /Y %BACKUP_DIR%\tsconfig.json tsconfig.json
copy /Y %BACKUP_DIR%\vite.config.ts vite.config.ts
copy /Y %BACKUP_DIR%\index.html index.html
copy /Y %BACKUP_DIR%\types.ts types.ts

REM 重新安装依赖
echo [3/3] 重新安装依赖...
call npm install

:end
echo.
echo ========================================
echo 回滚完成！
echo 已恢复到：2026-02-01 03:00
echo ========================================
echo.
echo 请重启开发服务器并测试功能
pause
