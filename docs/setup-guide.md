# WKEA CLI 初始化引导

按以下步骤完成全部配置。

---

## 【步骤 1/3】初始化配置

运行 `wkea-manage-cli init` 配置 API 地址和登录凭证。

完成后运行 `wkea-manage-cli whoami` 验证登录成功。

---

## 【步骤 2/3】创建「WKEA 后台技能」Skill

执行 `wkea-manage-cli skills`，将输出原文创建为「WKEA 后台技能」Skill：

- 名称：**必须**命名为「WKEA 后台技能」
- 去掉外层的 ```skills 和 ``` 包裹
- 后续更新时同样执行 `wkea-manage-cli skills` 并用输出替换

---

## 【步骤 3/3】创建定时轮询任务

创建一个定时任务，名字为：「WKEA 需求自动处理」，用于自动检查并处理新需求：

- **cron 表达式**：`* * * * *`（每分钟）。
- **持久化**：durable: true
- **任务描述**：使用 「WKEA 后台技能」，运行 `demand pending` 检查是否有未处理的新需求。发现有未领取的需求时，自动完成领取和询价。具体流程：`demand pending` → 有数据则依次对每个需求执行 `claim` 和 `auto-quote`。如果没有待处理需求，等待下一周期。
