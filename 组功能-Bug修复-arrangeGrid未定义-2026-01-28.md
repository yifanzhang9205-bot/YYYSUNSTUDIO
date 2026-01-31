# 组功能 Bug 修复 - arrangeGrid 未定义

**日期**：2026-01-28  
**状态**：✅ 已修复

---

## 🐛 Bug 描述

**错误信息**：
```
Uncaught ReferenceError: arrangeGrid is not defined
at App (App.tsx:875:41)
```

**原因**：
- 在 `hooks/useGroup.ts` 中删除了 `arrangeGrid` 和 `autoResizeGroup` 函数
- 但 `App.tsx` 中仍然引用了这些函数

---

## 🔧 修复方案

### 1. 修复 `handleArrangeGroup` 函数

**修复前**：
```typescript
const handleArrangeGroup = useCallback((algorithm: 'topology' | 'grid' = 'grid') => {
    if (!selectedGroupId) return;
    
    if (algorithm === 'topology') {
        arrangeTopology(selectedGroupId);
    } else {
        arrangeGrid(selectedGroupId); // ❌ arrangeGrid 未定义
    }
}, [selectedGroupId, arrangeTopology, arrangeGrid]);
```

**修复后**：
```typescript
const handleArrangeGroup = useCallback(() => {
    if (!selectedGroupId) return;
    
    // 使用拓扑排序算法
    arrangeTopology(selectedGroupId);
}, [selectedGroupId, arrangeTopology]);
```

### 2. 删除未使用的 `autoResizeGroup` 引用

**修复前**：
```typescript
const {
    // ...
    deleteGroupWithNodes,
    updateGroupTitle,
    autoResizeGroup, // ❌ 未使用
    toggleCollapse,
    isCollapsed,
} = useGroup({ ... });
```

**修复后**：
```typescript
const {
    // ...
    deleteGroupWithNodes,
    updateGroupTitle,
    toggleCollapse,
    isCollapsed,
} = useGroup({ ... });
```

---

## ✅ 验证

- [x] 无 `arrangeGrid is not defined` 错误
- [x] 无 `autoResizeGroup` 未使用警告
- [x] `handleArrangeGroup` 正常工作
- [x] 拓扑排序功能正常

---

## 📝 相关文件

- `App.tsx` - 修复函数引用
- `hooks/useGroup.ts` - 已删除的函数

---

**修复完成！** ✅
