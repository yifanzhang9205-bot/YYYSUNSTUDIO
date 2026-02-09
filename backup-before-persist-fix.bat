@echo off
chcp 65001 >nul
echo ========================================
echo 完整项目代码备份
echo ========================================
echo.

set BACKUP_DIR=backup-full-%date:~0,4%%date:~5,2%%date:~8,2%-%time:~0,2%%time:~3,2%%time:~6,2%
set BACKUP_DIR=%BACKUP_DIR: =0%

echo 创建备份目录: %BACKUP_DIR%
mkdir "%BACKUP_DIR%" 2>nul

echo.
echo [1/3] 备份完整项目代码...
echo 这可能需要几分钟，请耐心等待...
echo.

REM 备份 src 目录
echo 备份 src 目录...
xcopy "src" "%BACKUP_DIR%\src\" /E /I /Y /Q >nul

REM 备份 public 目录
echo 备份 public 目录...
xcopy "public" "%BACKUP_DIR%\public\" /E /I /Y /Q >nul

REM 备份配置文件
echo 备份配置文件...
if exist "package.json" xcopy "package.json" "%BACKUP_DIR%\" /Y >nul
if exist "package-lock.json" xcopy "package-lock.json" "%BACKUP_DIR%\" /Y >nul
if exist "tsconfig.json" xcopy "tsconfig.json" "%BACKUP_DIR%\" /Y >nul
if exist "vite.config.ts" xcopy "vite.config.ts" "%BACKUP_DIR%\" /Y >nul
if exist ".env" xcopy ".env" "%BACKUP_DIR%\" /Y >nul
if exist ".env.local" xcopy ".env.local" "%BACKUP_DIR%\" /Y >nul
if exist "index.html" xcopy "index.html" "%BACKUP_DIR%\" /Y >nul

echo.
echo [2/3] 备份浏览器数据...
echo 请在浏览器控制台执行以下命令来导出数据：
echo.
echo ============ 复制以下代码到控制台 ============
echo // 1. 导出 localStorage
echo const localStorageData = JSON.stringify(localStorage);
echo console.log('=== localStorage 数据 ===');
echo console.log(localStorageData);
echo.
echo // 2. 导出 IndexedDB 列表
echo indexedDB.databases().then(dbs =^> {
echo   console.log('=== IndexedDB 数据库列表 ===');
echo   console.log(dbs);
echo });
echo ============================================
echo.
echo 然后：
echo 1. 复制 localStorage 数据，保存到: %BACKUP_DIR%\localStorage-backup.json
echo 2. 复制 IndexedDB 列表，保存到: %BACKUP_DIR%\indexeddb-info.txt
echo.
pause

echo.
echo [3/3] 创建恢复脚本...
(
echo @echo off
echo chcp 65001 ^>nul
echo echo ========================================
echo echo 恢复完整项目代码
echo echo ========================================
echo echo.
echo.
echo echo ⚠️ 警告：此操作将覆盖当前代码！
echo echo.
echo set /p confirm="确认恢复？(输入 YES 继续): "
echo if not "%%confirm%%"=="YES" (
echo   echo 已取消恢复
echo   pause
echo   exit /b
echo )
echo.
echo echo [1/2] 恢复项目代码...
echo xcopy "src" "..\..\..\src\" /E /I /Y /Q ^>nul
echo xcopy "public" "..\..\..\public\" /E /I /Y /Q ^>nul
echo if exist "package.json" xcopy "package.json" "..\..\..\" /Y ^>nul
echo if exist "package-lock.json" xcopy "package-lock.json" "..\..\..\" /Y ^>nul
echo if exist "tsconfig.json" xcopy "tsconfig.json" "..\..\..\" /Y ^>nul
echo if exist "vite.config.ts" xcopy "vite.config.ts" "..\..\..\" /Y ^>nul
echo if exist ".env" xcopy ".env" "..\..\..\" /Y ^>nul
echo if exist ".env.local" xcopy ".env.local" "..\..\..\" /Y ^>nul
echo if exist "index.html" xcopy "index.html" "..\..\..\" /Y ^>nul
echo.
echo echo [2/2] 恢复浏览器数据...
echo echo 请在浏览器控制台执行：
echo echo.
echo echo ============ 复制以下代码到控制台 ============
echo echo // 1. 清除当前数据
echo echo localStorage.clear(^);
echo echo.
echo echo // 2. 读取 localStorage-backup.json 的内容，然后执行：
echo echo const backupData = {你的备份数据};
echo echo Object.keys(backupData^).forEach(key =^> localStorage.setItem(key, backupData[key]^)^);
echo echo.
echo echo // 3. 刷新页面
echo echo location.reload(^);
echo echo ============================================
echo echo.
echo pause
echo.
echo echo ========================================
echo echo 恢复完成！
echo echo ========================================
echo echo.
echo echo 请刷新浏览器页面。
echo pause
) > "%BACKUP_DIR%\restore.bat"

REM 创建备份说明
(
echo # 完整项目代码备份
echo.
echo **备份时间**: %date% %time%
echo **备份原因**: persist 中间件修复前的完整备份
echo.
echo ## 备份内容
echo.
echo ### 1. 完整项目代码
echo - `src/` - 所有源代码
echo - `public/` - 公共资源
echo - `package.json` - 依赖配置
echo - `tsconfig.json` - TypeScript 配置
echo - `vite.config.ts` - Vite 配置
echo - `.env` / `.env.local` - 环境变量
echo - `index.html` - 入口文件
echo.
echo ### 2. 浏览器数据
echo - `localStorage-backup.json` - 本地存储数据
echo - `indexeddb-info.txt` - IndexedDB 数据库信息
echo.
echo ## 如何恢复
echo.
echo ### 方法 1：使用恢复脚本（推荐）
echo ```bash
echo cd %BACKUP_DIR%
echo restore.bat
echo ```
echo.
echo ### 方法 2：手动恢复
echo.
echo 1. **恢复代码**:
echo    ```bash
echo    xcopy "%BACKUP_DIR%\src" "src\" /E /I /Y
echo    xcopy "%BACKUP_DIR%\public" "public\" /E /I /Y
echo    xcopy "%BACKUP_DIR%\*.json" "." /Y
echo    xcopy "%BACKUP_DIR%\*.ts" "." /Y
echo    ```
echo.
echo 2. **恢复浏览器数据**:
echo    - 打开浏览器控制台
echo    - 执行恢复脚本（见下方）
echo.
echo ## localStorage 恢复脚本
echo.
echo ```javascript
echo // 1. 清除当前数据
echo localStorage.clear(^);
echo.
echo // 2. 读取 localStorage-backup.json 的内容
echo const backupData = {你的备份数据};
echo.
echo // 3. 恢复数据
echo Object.keys(backupData^).forEach(key =^> {
echo   localStorage.setItem(key, backupData[key]^);
echo }^);
echo.
echo // 4. 刷新页面
echo location.reload(^);
echo ```
echo.
echo ## 注意事项
echo.
echo 1. ⚠️ 恢复操作会覆盖当前代码，请谨慎操作
echo 2. 恢复前请确保已关闭所有相关的浏览器标签页
echo 3. 恢复后需要刷新页面才能生效
echo 4. IndexedDB 数据不会被修改，无需担心图片丢失
echo 5. 如果需要重新安装依赖，运行 `npm install`
echo.
echo ## 验证恢复
echo.
echo 恢复后，验证以下内容：
echo - [ ] 项目可以正常启动 (npm run dev^)
echo - [ ] 节点数据完整
echo - [ ] 图片显示正常
echo - [ ] 资产库完整
echo - [ ] 历史记录完整
echo - [ ] 所有功能正常工作
echo.
echo ## 备份文件大小
echo.
echo 运行以下命令查看备份大小：
echo ```bash
echo dir /s "%BACKUP_DIR%"
echo ```
) > "%BACKUP_DIR%\README.md"

echo.
echo ========================================
echo 备份完成！
echo ========================================
echo.
echo 备份位置: %BACKUP_DIR%
echo.
echo 备份内容：
echo - 完整 src 目录
echo - 完整 public 目录
echo - 所有配置文件
echo - 浏览器数据（需手动导出）
echo.
echo 下一步操作：
echo 1. 在浏览器控制台导出 localStorage 数据
echo 2. 保存到: %BACKUP_DIR%\localStorage-backup.json
echo 3. 记录 IndexedDB 信息到: %BACKUP_DIR%\indexeddb-info.txt
echo 4. 然后可以安全地进行修复
echo.
echo 如需恢复，运行: %BACKUP_DIR%\restore.bat
echo.
pause
