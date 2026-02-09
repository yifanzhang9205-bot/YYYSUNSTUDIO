# UI 设计规则（自动应用）

> ⚠️ **强制规则**：所有 UI 设计必须遵循这些规则

---

## 🎨 核心原则

### 1. 永远使用专业的设计系统

在设计任何 UI 之前，**必须**先分析：
- 产品类型（SaaS、工具、创意应用等）
- 目标风格（极简、现代、专业、创意等）
- 参考对象（Linear、Figma、Notion 等）

### 2. 禁止的设计模式

❌ **绝对不要：**
- 使用 emoji 作为 UI 图标（🎨 ✨ 🚀）
- 使用过小的图标（< 18px）
- 使用过灰的颜色（gray-400 作为主要文字）
- 使用过紧的间距（< 12px）
- 没有悬停状态
- 没有视觉层次
- 所有元素平等对待

✅ **必须做到：**
- 使用 SVG 图标库（Lucide、Heroicons）
- 图标大小至少 18-20px
- 主要文字使用 gray-700 或更深
- 合理的间距（16-24px）
- 明确的悬停反馈
- 清晰的视觉层次
- 突出重要元素

---

## 📐 具体规范

### 图标
```tsx
// ❌ 错误
<span>🎨</span>
<Icon size={14} />

// ✅ 正确
import { Sparkles } from 'lucide-react';
<Sparkles size={20} className="text-blue-500" />
```

### 颜色
```tsx
// ❌ 错误 - 太灰，看不清
<p className="text-gray-400">主要文字</p>

// ✅ 正确 - 清晰可读
<p className="text-gray-700">主要文字</p>
<p className="text-gray-500">次要文字</p>
```

### 间距
```tsx
// ❌ 错误 - 太挤
<div className="flex flex-col gap-2">

// ✅ 正确 - 呼吸感
<div className="flex flex-col gap-4">
```

### 交互状态
```tsx
// ❌ 错误 - 没有反馈
<button className="text-gray-600">
  点击
</button>

// ✅ 正确 - 清晰反馈
<button className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors px-3 py-2 rounded-lg">
  点击
</button>
```

### 视觉层次
```tsx
// ❌ 错误 - 所有元素平等
<div>
  <p>选项 1</p>
  <p>选项 2</p>
  <p>选项 3</p>
</div>

// ✅ 正确 - 有层次
<div>
  <h3 className="text-sm font-semibold text-gray-900 mb-3">选择功能</h3>
  <div className="space-y-2">
    <button className="text-gray-700 hover:text-gray-900">选项 1</button>
    <button className="text-gray-700 hover:text-gray-900">选项 2</button>
  </div>
</div>
```

---

## 🎯 设计流程（强制执行）

### 步骤 1：分析需求
- 这是什么类型的 UI？（菜单、表单、卡片、列表等）
- 用户会如何使用？（点击、悬停、拖拽等）
- 参考哪个产品的设计？（Linear、Figma、Notion 等）

### 步骤 2：选择风格
根据产品类型选择合适的风格：

**专业工具类**（如 Figma、Linear）：
- 简洁、高效、功能优先
- 中性色调（灰色系）
- 清晰的图标和文字
- 微妙的悬停效果

**创意应用类**（如 Canva、Framer）：
- 活泼、有趣、视觉丰富
- 彩色图标
- 大胆的配色
- 明显的动画效果

**数据分析类**（如 Tableau、Notion）：
- 信息密度高
- 表格和列表为主
- 清晰的数据层次
- 快速扫描

### 步骤 3：实施设计
按照以下优先级：
1. **布局** - 先确定结构
2. **层次** - 区分主次元素
3. **颜色** - 选择合适的配色
4. **间距** - 确保呼吸感
5. **交互** - 添加悬停和点击状态
6. **细节** - 圆角、阴影、动画

### 步骤 4：自我检查
在提交代码前，问自己：
- [ ] 图标是否使用 SVG？（不是 emoji）
- [ ] 图标大小是否 >= 18px？
- [ ] 文字颜色是否足够深？（gray-700+）
- [ ] 间距是否合理？（16-24px）
- [ ] 是否有悬停状态？
- [ ] 是否有视觉层次？
- [ ] 是否参考了专业产品？

---

## 🚀 快速参考

### 常用图标（Lucide）
```tsx
import { 
  Edit3,      // 编辑
  Image,      // 图片
  Wand2,      // 魔法棒
  Sparkles,   // 闪光
  Zap,        // 闪电
  Layers,     // 图层
  Settings,   // 设置
  Search,     // 搜索
  Plus,       // 添加
  X,          // 关闭
} from 'lucide-react';
```

### 常用颜色
```tsx
// 文字
text-gray-900  // 标题
text-gray-700  // 主要文字
text-gray-500  // 次要文字
text-gray-400  // 禁用/占位符

// 背景
bg-white       // 主背景
bg-gray-50     // 次背景
bg-gray-100    // 悬停背景

// 边框
border-gray-200  // 默认边框
border-gray-300  // 悬停边框

// 强调色
text-blue-500    // 链接/按钮
text-cyan-500    // 主要操作
text-purple-500  // 特殊功能
```

### 常用间距
```tsx
gap-2   // 8px  - 紧密
gap-3   // 12px - 正常
gap-4   // 16px - 舒适
gap-6   // 24px - 宽松

p-2     // 8px  - 小按钮
p-3     // 12px - 正常按钮
p-4     // 16px - 大按钮
```

---

## 💡 示例：好的 vs 坏的

### 菜单选项

❌ **坏的设计**：
```tsx
<div className="flex flex-col gap-1">
  <div className="text-gray-400 text-xs">选项 1</div>
  <div className="text-gray-400 text-xs">选项 2</div>
</div>
```

问题：
- 文字太灰（gray-400）
- 文字太小（text-xs）
- 间距太小（gap-1）
- 没有图标
- 没有悬停状态

✅ **好的设计**：
```tsx
<div className="flex flex-col gap-3">
  <button className="flex items-center gap-3 text-gray-700 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors">
    <Edit3 size={20} className="text-gray-400" />
    <span className="text-sm font-medium">选项 1</span>
  </button>
  <button className="flex items-center gap-3 text-gray-700 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors">
    <Image size={20} className="text-gray-400" />
    <span className="text-sm font-medium">选项 2</span>
  </button>
</div>
```

优点：
- 清晰的图标（20px SVG）
- 可读的文字（gray-700）
- 合理的间距（gap-3, px-3 py-2）
- 明确的悬停反馈
- 圆角和过渡动画

---

## 🎓 学习资源

当不确定如何设计时，参考这些产品：

**极简专业**：
- Linear（项目管理）
- Vercel（开发工具）
- Stripe（支付平台）

**现代创意**：
- Figma（设计工具）
- Framer（网站构建）
- Notion（笔记应用）

**数据密集**：
- Airtable（数据库）
- Retool（内部工具）
- Tableau（数据可视化）

---

**记住：好的 UI 设计不是艺术，而是科学。遵循规则，参考优秀产品，持续迭代。**
