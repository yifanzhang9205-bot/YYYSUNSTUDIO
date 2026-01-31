@echo off
REM UI 改版前备份脚本
REM 创建时间：2026-02-01 03:00（北京时间）

echo ========================================
echo UI 改版前备份脚本
echo 备份时间点：2026-02-01 03:00
echo ========================================
echo.

REM 1. 创建备份文件夹
set BACKUP_DIR=backup-ui-redesign-20260201-0300
echo [1/5] 创建备份文件夹: %BACKUP_DIR%
if not exist %BACKUP_DIR% mkdir %BACKUP_DIR%

REM 2. 备份源代码
echo [2/5] 备份源代码...
xcopy /E /I /Y App.tsx %BACKUP_DIR%\App.tsx
xcopy /E /I /Y components %BACKUP_DIR%\components
xcopy /E /I /Y hooks %BACKUP_DIR%\hooks
xcopy /E /I /Y core %BACKUP_DIR%\core
xcopy /E /I /Y services %BACKUP_DIR%\services
xcopy /E /I /Y utils %BACKUP_DIR%\utils
xcopy /E /I /Y workers %BACKUP_DIR%\workers

REM 3. 备份配置文件
echo [3/5] 备份配置文件...
copy /Y package.json %BACKUP_DIR%\package.json
copy /Y tsconfig.json %BACKUP_DIR%\tsconfig.json
copy /Y vite.config.ts %BACKUP_DIR%\vite.config.ts
copy /Y index.html %BACKUP_DIR%\index.html
copy /Y types.ts %BACKUP_DIR%\types.ts

REM 4. 创建 Git 提交（备份点）
echo [4/5] 创建 Git 提交...
git add .
git commit -m "备份：UI 改版前 - 2026-02-01 03:00"
git log -1 --format="%%H" > %BACKUP_DIR%\git-commit-hash.txt

REM 5. 记录备份信息
echo [5/5] 记录备份信息...
echo 备份时间：2026-02-01 03:00 > %BACKUP_DIR%\backup-info.txt
echo 备份原因：UI 改版前备份 >> %BACKUP_DIR%\backup-info.txt
echo Git Commit: >> %BACKUP_DIR%\backup-info.txt
type %BACKUP_DIR%\git-commit-hash.txt >> %BACKUP_DIR%\backup-info.txt

echo.
echo ========================================
echo 备份完成！
echo 备份位置：%BACKUP_DIR%
echo Git Commit Hash：
type %BACKUP_DIR%\git-commit-hash.txt
echo ========================================
echo.
echo 回滚方式：
echo 1. Git 回滚：git reset --hard [commit-hash]
echo 2. 手动回滚：复制 %BACKUP_DIR% 中的文件
echo.
pause
