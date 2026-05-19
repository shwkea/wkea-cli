# 任务进度管理

## 1. 业务概念

**任务进度** — 用于 AI 在执行长流程时跟踪每一步完成情况的工具。每个任务包含多个步骤，AI 按顺序完成并标记。

### 实体关系
```
TaskProgress（进度主表）
  └── steps（步骤数组，如 ["产品匹配","供应商匹配","询价","完成"])
```

### 状态
| 值 | 含义 |
|----|------|
| 0 | 处理中 |
| 1 | 已完成 |

---

## 2. 使用方式

### 创建进度（一次创建所有步骤）
```bash
wkea-manage-cli progress create \
  --name "{progressName}" \
  --steps "{step1},{step2},{step3},..." \
  --relation-type {relationType} \
  --relation-id {relationId} \
  --link "{manageMainUrl}#/main/{pagePath}/{id}"
```

> 具体参数名通过 `--help` 查看。

### 完成一个步骤（按顺序，从1开始）
```bash
wkea-manage-cli progress step --id {progressId} --step-index {stepNumber}
```

返回示例：
```
第1步「获取详情」已完成，已完成 1/5，下一步：产品匹配
```

### 查看进度
```bash
wkea-manage-cli progress get --id {progressId}
```

### 列表查询
```bash
wkea-manage-cli progress list --relation-type {relationType} --relation-id {relationId}
wkea-manage-cli progress list --status {statusCode}
```

> 具体参数名通过 `--help` 查看。

---

## 3. 进度完成返回字段

`progress step` 返回：
| 字段 | 说明 | 示例 |
|------|------|------|
| finishedStep | 已完成步数 | 2 |
| totalSteps | 总步数 | 5 |
| currentStep | 刚完成的步骤名 | "产品匹配" |
| remainingSteps | 剩余步骤 | ["供应商匹配","询价","完成"] |
| nextStep | 下一步 | "供应商匹配" |
| isCompleted | 是否全部完成 | false |
| message | 提示消息 | "第2步「产品匹配」已完成，已完成 2/5，下一步：供应商匹配" |
