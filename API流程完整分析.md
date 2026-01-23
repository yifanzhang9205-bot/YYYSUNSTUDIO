# 西瓜皮 API 流程完整分析

## 实际 API 响应格式（根据真实日志）

### 1. 创建任务 API

**请求**:
```json
POST https://tasks.xiguapi.tech/
Authorization: Bearer w8n-cYYtSMwKtG6ghPyEykfbh8pl
Content-Type: application/json

{
  "prompt": "小猫喝水，飞在半空，虚幻五引擎，环境超级复杂",
  "model": "nanobananapro",
  "resolution": "1K",
  "aspect_ratio": "9:16",
  "image_urls": [],
  "num": 1
}
```

**响应**（实际日志）:
```json
{
  "success": true,
  "taskId": "897ba322-d96d-4ac3-a11b-6d35922ee426",
  "status": "queued",
  "task": {...},
  "message": "Task queued and started successfully"
}
```

**关键字段**:
- ✅ `success`: boolean（不是 `code`）
- ✅ `taskId`: string（驼峰命名，不是 `taskid`）
- ✅ `status`: string
- ✅ `message`: string

### 2. 查询任务 API

**请求**:
```json
POST https://tasks.xiguapi.tech/
Authorization: Bearer w8n-cYYtSMwKtG6ghPyEykfbh8pl
Content-Type: application/json

{
  "taskId": "897ba322-d96d-4ac3-a11b-6d35922ee426"
}
```

**响应**（预期格式）:
```json
{
  "success": true,
  "status": "success",
  "result": {
    "images": ["https://image-upload.xiguapi.tech/creation/generated/..."]
  },
  "message": "Task already finalized"
}
```

**关键字段**:
- ✅ `success`: boolean
- ✅ `status`: "running" | "success" | "failed"
- ✅ `result.images`: string[]
- ✅ `message`: string

## 代码流程

### 流程 1: 图片生成（generateImage）

```
用户点击生成
    ↓
App.tsx: handleNodeAction()
    ↓
geminiService.ts: generateImageFromText()
    ↓
xiguapiService.ts: generateImage()
    ↓
    ├─ createTask() → 返回 taskId
    ↓
    └─ waitForTaskCompletion()
        ↓
        └─ 循环调用 queryTask()
            ↓
            ├─ status === 'success' → 返回 images
            ├─ status === 'failed' → 抛出错误
            └─ status === 'running' → 继续等待
```

### 流程 2: 数据转换

```
API 返回图片 URL
    ↓
urlToBase64() 转换为 base64
    ↓
返回给 geminiService
    ↓
返回给 App.tsx
    ↓
handleNodeUpdate() 更新节点数据
    ↓
Node.tsx 显示图片
```

## 当前代码状态

### ✅ 已修复
1. CreateTaskResponse 接口：`success` + `taskId`（驼峰）
2. 创建任务的状态检查：`!result.success`
3. 返回 taskId：`result.taskId`

### ✅ 已正确
1. QueryTaskRequest 接口：`taskId`（驼峰）
2. QueryTaskResponse 接口：`success` + `status` + `result.images`
3. 轮询逻辑：检查 `status === 'success'`

### ⚠️ 需要验证
1. 查询 API 是否真的返回 400？
2. 如果返回 400，错误信息是什么？
3. URL 转 base64 是否会失败？

## 测试步骤

1. **创建任务** ✅
   - 日志显示：`[Xiguapi] 任务创建成功，taskId: 897ba322...`
   - 状态：成功

2. **查询任务** ❓
   - 需要查看日志：`[Xiguapi] 查询任务请求:`
   - 需要查看日志：`[Xiguapi] 查询响应状态:`
   - 需要查看日志：`[Xiguapi] 查询响应内容:`

3. **转换 base64** ❓
   - 需要查看日志：`[Xiguapi] URL 转 base64 失败`
   - 或者：`[Xiguapi] 任务完成，生成 X 张图片`

## 下一步

请重新运行图片生成，并提供完整的控制台日志，特别是：

1. `[Xiguapi] 查询任务请求:` 后面的内容
2. `[Xiguapi] 查询响应状态:` 后面的内容
3. `[Xiguapi] 查询响应内容:` 后面的内容

这样我就能知道查询 API 到底返回了什么。

## 可能的问题

### 问题 1: API 端点不同
- 创建和查询可能使用不同的端点
- 需要确认 API 文档

### 问题 2: 请求体格式
- 可能需要额外的字段
- 可能字段名不对

### 问题 3: 认证问题
- 可能查询需要不同的认证方式
- 可能 token 过期

### 问题 4: CORS 问题
- 可能浏览器阻止了请求
- 需要检查 Network 面板

---

**当前代码应该是正确的，需要实际运行日志来确认问题**
