# SunStudio

一个基于 React + TypeScript + Vite 的创意工作室应用，集成了 AI 图像生成、视频生成、故事创作等功能。

## 🚀 快速开始

### 首次运行
```bash
# 安装依赖
npm install

# 创建环境变量文件 .env.local，添加以下内容：
# GEMINI_API_KEY=your_api_key_here
# API_KEY=your_api_key_here

# 启动开发服务器
npm run dev
```

### 开发命令
```bash
npm run dev      # 启动开发服务器（http://localhost:5173）
npm run build    # 构建生产版本
npm run preview  # 预览生产版本
```

## 📦 技术栈

- **React 19.2.0** - UI 框架
- **TypeScript 5.8.2** - 类型系统
- **Vite 6.2.0** - 构建工具
- **Three.js 0.182.0** - 3D 渲染
- **@google/genai** - Google Gemini API
- **lucide-react** - 图标库

## 🎨 主要功能

### 基础功能
- 📝 **创意描述** - 文本输入节点
- 🖼️ **文字生图** - AI 图像生成
- 🎬 **文生视频** - AI 视频生成

### 故事创作
- ✨ **创意工作室** - 剧本生成和管理
- 👤 **角色参考** - 角色设定和可视化
- 🏞️ **场景参考** - 场景设定和可视化
- 🎞️ **分镜生成** - 自动生成分镜图

### 高级工具
- 📷 **多角度相机** - 3D 视角控制和多角度图像生成
- 🔲 **九宫格处理** - 自动切割和选择九宫格图片

### 特殊功能
- 🎬 **智能多帧** - 多帧序列视频生成
- 🎵 **音频中心** - AI 音乐生成

## 🗂️ 项目结构

```
sunstudio/
├── components/           # React 组件
│   ├── Node.tsx         # 节点基础组件
│   ├── SidebarDock.tsx  # 左侧工具栏
│   ├── MultiAngleCameraNode.tsx # 多角度相机
│   ├── GridSplitterNode.tsx # 九宫格处理
│   └── ...
├── services/            # 服务层
│   ├── geminiService.ts # Gemini API
│   ├── nanoBananaService.ts # Nano Banana API
│   └── storage.ts       # 本地存储
├── App.tsx              # 主应用
├── types.ts             # 类型定义
└── ...
```

## 🔧 配置说明

### 环境变量
创建 `.env.local` 文件：
```
GEMINI_API_KEY=your_gemini_api_key
API_KEY=your_api_key
```

### API 配置
- **Gemini API**: https://ai.google.dev/
- **Nano Banana API**: https://grsai.dakka.com.cn

## 📚 文档

- [项目迁移方案](./项目迁移方案.md) - 多设备开发指南
- [故事创作完整流程](./故事创作完整流程.md) - 故事创作功能说明
- [多角度相机完善总结](./多角度相机完善总结.md) - 多角度相机功能说明
- [菜单优化更新说明](./菜单优化更新说明.md) - 最新的菜单优化
- [一键整理功能说明](./一键整理功能说明.md) - 组内节点整理功能

## 🛠️ 实用脚本

### Windows 脚本
- `setup-git.bat` - 初始化 Git 仓库
- `setup-new-computer.bat` - 新电脑快速设置
- `daily-push.bat` - 每日推送代码
- `daily-pull.bat` - 每日拉取代码

### 使用方法
双击运行对应的 `.bat` 文件即可。

## 🔄 多设备开发流程

### 当前电脑完成工作
```bash
# 方式 1: 使用脚本（推荐）
双击运行 daily-push.bat

# 方式 2: 手动执行
git add .
git commit -m "描述你的修改"
git push
```

### 新电脑开始工作
```bash
# 方式 1: 使用脚本（推荐）
双击运行 daily-pull.bat

# 方式 2: 手动执行
git pull
npm install  # 如果有新依赖
```

## 🎯 开发建议

1. **每次开始工作前**：先 `git pull` 拉取最新代码
2. **每次结束工作后**：立即 `git push` 推送代码
3. **提交信息规范**：清楚描述做了什么修改
4. **API Key 安全**：不要将 `.env.local` 提交到 Git

## 📝 更新日志

### 最近更新
- ✅ 优化右键菜单 UI，采用 iOS 风格
- ✅ 精简菜单节点，删除不常用的节点类型
- ✅ 优化一键整理功能，保持节点原有顺序
- ✅ 添加多设备开发支持

## 📞 常见问题

### Q: npm install 很慢？
A: 使用国内镜像：
```bash
npm config set registry https://registry.npmmirror.com
npm install
```

### Q: API 配额用完了？
A: 访问 https://ai.google.dev/ 升级到付费计划或申请新的 API Key

### Q: 两台电脑同时修改了代码？
A: Git 会提示冲突，需要手动解决。建议避免同时修改同一文件。

## 📄 License

Private Project - All Rights Reserved

## 👨‍💻 开发者

SunStudio Team

---

**祝开发愉快！** 🎉
