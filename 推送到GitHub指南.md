# 推送代码到 GitHub 指南

## ✅ 已完成的步骤

1. ✅ Git 仓库已初始化
2. ✅ 所有文件已添加并提交
3. ✅ 远程仓库已关联：https://github.com/yifanzhang9205-bot/YYYSUNSTUDIO.git
4. ✅ 分支已重命名为 main

## ⚠️ 当前问题

推送时遇到网络连接问题：`Recv failure: Connection was reset`

这通常是因为：
- 网络不稳定
- 防火墙/代理设置
- GitHub 访问受限

---

## 🔧 解决方案

### 方案 1：在 VS Code 终端中手动推送（推荐）

1. **打开 VS Code 终端**
   - 快捷键：`Ctrl + ~`（波浪号键）
   - 或菜单：查看 → 终端

2. **执行推送命令**
   ```bash
   git push -u origin main
   ```

3. **如果提示输入用户名和密码**
   - 用户名：`yifanzhang9205-bot`
   - 密码：使用 **Personal Access Token**（不是 GitHub 密码）
   
   如何获取 Token：
   - 访问：https://github.com/settings/tokens
   - 点击 "Generate new token (classic)"
   - 勾选 `repo` 权限
   - 生成后复制 Token（只显示一次，请保存）

### 方案 2：使用 GitHub Desktop（最简单）

1. **下载安装 GitHub Desktop**
   - 访问：https://desktop.github.com/
   - 下载并安装

2. **添加现有仓库**
   - 打开 GitHub Desktop
   - File → Add Local Repository
   - 选择项目文件夹：`D:\sunstudio`

3. **推送代码**
   - 点击 "Publish repository"
   - 或点击 "Push origin"

### 方案 3：检查网络并重试

1. **检查网络连接**
   ```bash
   ping github.com
   ```

2. **如果使用代理，配置 Git 代理**
   ```bash
   # HTTP 代理
   git config --global http.proxy http://127.0.0.1:7890
   git config --global https.proxy http://127.0.0.1:7890
   
   # 取消代理
   git config --global --unset http.proxy
   git config --global --unset https.proxy
   ```

3. **重试推送**
   ```bash
   git push -u origin main
   ```

### 方案 4：使用 SSH 方式（更稳定）

1. **生成 SSH 密钥**
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   ```
   一路回车即可

2. **复制公钥**
   ```bash
   cat ~/.ssh/id_ed25519.pub
   ```
   或在 Windows 上：
   ```bash
   type %USERPROFILE%\.ssh\id_ed25519.pub
   ```

3. **添加到 GitHub**
   - 访问：https://github.com/settings/keys
   - 点击 "New SSH key"
   - 粘贴公钥内容

4. **修改远程仓库地址**
   ```bash
   git remote set-url origin git@github.com:yifanzhang9205-bot/YYYSUNSTUDIO.git
   ```

5. **推送代码**
   ```bash
   git push -u origin main
   ```

---

## 📋 推送成功后的验证

1. **访问你的 GitHub 仓库**
   https://github.com/yifanzhang9205-bot/YYYSUNSTUDIO

2. **检查文件是否都上传了**
   - 应该看到 63 个文件
   - 包括所有 `.tsx`、`.ts`、`.md` 文件
   - **不包括** `node_modules` 和 `.env.local`（已被 .gitignore 忽略）

3. **确认提交记录**
   - 应该看到一个提交："Initial commit: SunStudio project"

---

## 🚀 推送成功后，在新电脑上使用

### 步骤 1：克隆项目
```bash
git clone https://github.com/yifanzhang9205-bot/YYYSUNSTUDIO.git
cd YYYSUNSTUDIO
```

### 步骤 2：安装依赖
```bash
npm install
```

### 步骤 3：创建环境变量
创建 `.env.local` 文件：
```
GEMINI_API_KEY=AIzaSyAa31dI6OI9iq3PLfChFAZjpBRo83frAV8
API_KEY=AIzaSyAa31dI6OI9iq3PLfChFAZjpBRo83frAV8
```

### 步骤 4：启动项目
```bash
npm run dev
```

---

## 💡 小贴士

### 如果推送一直失败
可以先把代码压缩打包，通过云盘传输：
1. 删除 `node_modules` 文件夹
2. 压缩整个项目为 `sunstudio.zip`
3. 上传到云盘（OneDrive、百度网盘等）
4. 在新电脑下载解压
5. 运行 `npm install` 安装依赖

### 推送成功后的日常使用
```bash
# 每天开始工作
git pull

# 每天结束工作
git add .
git commit -m "今天的工作内容"
git push
```

---

## 🆘 还是不行？

如果以上方法都不行，可以：

1. **检查 GitHub 仓库是否创建成功**
   - 访问：https://github.com/yifanzhang9205-bot/YYYSUNSTUDIO
   - 如果显示 404，说明仓库不存在，需要重新创建

2. **检查 Git 配置**
   ```bash
   git config --list
   ```

3. **查看详细错误信息**
   ```bash
   git push -u origin main --verbose
   ```

4. **使用 GitHub Desktop**（最简单可靠）
   - 下载：https://desktop.github.com/

---

## ✅ 当前状态总结

- ✅ 本地 Git 仓库已准备好
- ✅ 所有代码已提交
- ✅ 远程仓库已关联
- ⏳ 等待推送到 GitHub

**只需要成功执行一次 `git push -u origin main` 就完成了！**

---

## 📞 需要帮助？

如果遇到其他问题，可以：
1. 截图错误信息
2. 查看 GitHub 文档：https://docs.github.com/
3. 使用 GitHub Desktop 作为备选方案
