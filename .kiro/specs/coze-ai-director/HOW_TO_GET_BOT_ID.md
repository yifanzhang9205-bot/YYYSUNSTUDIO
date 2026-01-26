# 如何获取 Bot ID - 图文教程

## 📍 Bot ID 是什么？

Bot ID 是你的智能体的唯一标识符，格式是一串数字，例如：
```
7234567890123456789
```

在调用 API 时，需要用这个 ID 来指定调用哪个智能体。

---

## 🎯 方法 1：从 URL 获取（最简单，推荐）

### 步骤：

1. **发布智能体**
   - 点击右上角的"发布"按钮
   - 选择"私有"
   - 点击"确认发布"

2. **查看浏览器地址栏**
   - 发布成功后，停留在智能体页面
   - 看浏览器顶部的 URL

3. **识别 Bot ID**
   
   **国内版（coze.cn）：**
   ```
   https://www.coze.cn/space/123456/bot/7234567890123456789
                                        ^^^^^^^^^^^^^^^^^^^
                                        这就是 Bot ID
   ```
   
   **国际版（coze.com）：**
   ```
   https://www.coze.com/space/123456/bot/7234567890123456789
                                         ^^^^^^^^^^^^^^^^^^^
                                         这就是 Bot ID
   ```

4. **复制 Bot ID**
   - 选中 URL 最后的数字部分
   - 右键 → 复制
   - 或者直接手动复制：`7234567890123456789`

### 示例：

如果你的 URL 是：
```
https://www.coze.cn/space/456789/bot/7234567890123456789
```

那么你的 Bot ID 就是：
```
7234567890123456789
```

---

## 🎯 方法 2：从智能体设置页面获取

### 步骤：

1. **进入智能体编辑页面**
   - 在"我的智能体"列表中，点击你的智能体

2. **打开设置面板**
   - 点击右上角的"设置"按钮（齿轮图标）
   - 或者点击"详情"按钮

3. **找到 Bot ID**
   - 在弹出的面板中，找到"Bot ID"或"智能体 ID"字段
   - 通常在基本信息部分

4. **复制 Bot ID**
   - 点击 Bot ID 旁边的"复制"按钮
   - 或者手动选中并复制

### 可能的位置：

```
基本信息
├── 智能体名称：SunStudio AI 导演
├── 描述：专业的影视制作和提示词优化助手
├── Bot ID：7234567890123456789  [复制]  ← 在这里
└── 创建时间：2025-01-24
```

---

## 🎯 方法 3：从 API 管理页面获取

### 步骤：

1. **进入 API 管理**
   - 点击左侧菜单的"开发"
   - 选择"API 管理"或"访问令牌"

2. **查看智能体列表**
   - 在页面中会显示你所有的智能体
   - 每个智能体旁边会显示对应的 Bot ID

3. **找到你的智能体**
   - 找到"SunStudio AI 导演"
   - 查看它的 Bot ID

4. **复制 Bot ID**
   - 点击 Bot ID 旁边的"复制"按钮

### 页面结构示例：

```
我的智能体
┌─────────────────────────────────────────────────┐
│ 智能体名称              Bot ID          操作     │
├─────────────────────────────────────────────────┤
│ SunStudio AI 导演      7234567890123456789  [复制] │
│ 其他智能体             7111111111111111111  [复制] │
└─────────────────────────────────────────────────┘
```

---

## 🔑 同时获取 API 密钥

在获取 Bot ID 的同时，你还需要创建 API 密钥：

### 步骤：

1. **进入 API 管理**
   - 点击"开发" → "API 管理"

2. **创建 API Key**
   - 点击"创建 API Key"或"创建访问令牌"按钮

3. **填写信息**
   ```
   名称：SunStudio AI Director API
   权限：选择你的智能体（SunStudio AI 导演）
   有效期：永久（或根据需要选择）
   ```

4. **复制 API Key**
   - ⚠️ **重要**：API Key 只显示一次！
   - 立即复制并保存到安全的地方
   - 格式类似：`pat_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

---

## 💾 保存到项目中

获取到 Bot ID 和 API Key 后，保存到项目的 `.env.local` 文件：

```env
# Coze AI 导演助手配置
COZE_API_KEY=pat_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
COZE_BOT_ID=7234567890123456789
COZE_API_BASE_URL=https://api.coze.cn/v1
```

**注意**：
- 国内版用户：`https://api.coze.cn/v1`
- 国际版用户：`https://api.coze.com/v1`

---

## ✅ 验证配置

### 方法 1：使用 curl 测试

```bash
curl -X POST https://api.coze.cn/v1/chat \
  -H "Authorization: Bearer pat_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "bot_id": "7234567890123456789",
    "user_id": "test_user",
    "stream": false,
    "messages": [{
      "role": "user",
      "content": "{\"function\":\"optimize_prompt\",\"userInput\":\"一只猫\",\"nodeType\":\"IMAGE_GENERATOR\",\"context\":{\"aspectRatio\":\"1:1\"}}"
    }]
  }'
```

### 方法 2：使用 Postman 测试

1. 创建新的 POST 请求
2. URL：`https://api.coze.cn/v1/chat`
3. Headers：
   ```
   Authorization: Bearer pat_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   Content-Type: application/json
   ```
4. Body（raw JSON）：
   ```json
   {
     "bot_id": "7234567890123456789",
     "user_id": "test_user",
     "stream": false,
     "messages": [{
       "role": "user",
       "content": "{\"function\":\"optimize_prompt\",\"userInput\":\"一只猫\",\"nodeType\":\"IMAGE_GENERATOR\",\"context\":{\"aspectRatio\":\"1:1\"}}"
     }]
   }
   ```
5. 点击"Send"

### 预期响应：

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "conversation_id": "xxx",
    "messages": [{
      "role": "assistant",
      "content": "{\"function\":\"optimize_prompt\",\"result\":{...}}",
      "type": "answer"
    }]
  }
}
```

---

## ❓ 常见问题

### Q1：找不到 Bot ID 怎么办？

**A**：确保你已经发布了智能体。未发布的智能体可能没有 Bot ID。

### Q2：Bot ID 是字母还是数字？

**A**：Bot ID 是纯数字，通常是 19 位，例如：`7234567890123456789`

### Q3：API Key 忘记复制了怎么办？

**A**：API Key 只显示一次，如果忘记复制，需要：
1. 删除旧的 API Key
2. 重新创建一个新的
3. 立即复制并保存

### Q4：Bot ID 会变吗？

**A**：不会。Bot ID 是智能体的唯一标识符，创建后不会改变。

### Q5：可以用同一个 API Key 调用多个智能体吗？

**A**：可以。一个 API Key 可以调用你账号下的所有智能体，只需要在请求中指定不同的 `bot_id`。

---

## 🔒 安全提示

1. **不要泄露 API Key**
   - 不要提交到 Git 仓库
   - 不要分享给他人
   - 使用 `.env.local`（已在 `.gitignore` 中）

2. **定期更换 API Key**
   - 建议每 3-6 个月更换一次
   - 如果怀疑泄露，立即更换

3. **限制 API Key 权限**
   - 只授予必要的智能体访问权限
   - 设置合理的有效期

---

## 📚 相关文档

- [COZE_CONFIGURATION_GUIDE.md](./COZE_CONFIGURATION_GUIDE.md) - 完整配置指南
- [MODEL_SELECTION_GUIDE.md](./MODEL_SELECTION_GUIDE.md) - 模型选择指南
- [API_SPECIFICATION.md](./API_SPECIFICATION.md) - API 接口规范

---

**文档版本**：v1.0  
**创建日期**：2025-01-24  
**作者**：Kiro AI
