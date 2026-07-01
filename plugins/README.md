# wkea-cli 业务专家 Plugin

本目录是 wkea-cli 业务专家的 WorkBuddy 兼容 plugin。**只发布 1 个 team plugin**（WKEA 专家团），内含 1 个主理人 + 8 个 member agent + 3 个跨 expert Workflow。

**为什么是 1 个 plugin 而不是 9 个**：8 个 expert 协同工作（"开发品牌 X"需要 vendor-expert + brand-expert 联动），从来没有过"独立装某个 expert"的用户场景。1 个 plugin 多 agent 符合 WorkBuddy 官方 software-company 模式。

**所有 expert 必须以 `wkea-` 前缀命名**（agent 文件名、agentName 等），便于在 WorkBuddy 多 marketplace 中识别归属。

## Plugin 列表

| 目录 | 中文名 | 英文 ID | 类型 | 状态 | 说明 |
|------|--------|--------|------|------|------|
| [`_template/`](./_template/) | 模板 | - | - | ✅ | 新建 expert 时复制此目录 |
| [`wkea-expert-team/`](./wkea-expert-team/) | WKEA 专家团 | `wkea-expert-team` | **team** | ✅ | 主理人小嘉 + 8 个 member agent + 3 个 Workflow |

### 8 个 member agent（全部在 `wkea-expert-team/agents/`）

| Member | 中文名 | 角色 | agent ID |
|--------|--------|------|----------|
| team-lead | 小嘉（齐活林） | 主理人 | `wkea-expert-team-team-lead` |
| demand | 谭知行 | 需求询价处理专家 | `wkea-demand-expert` |
| product | 管立品 | 产品管理专家 | `wkea-product-expert` |
| vendor | 原启诚 | 供应商开发专家 | `wkea-vendor-expert` |
| brand | 姚承志 | 品牌管理专家 | `wkea-brand-expert` |
| customer | 宋知信 | 客户管理专家 | `wkea-customer-expert` |
| quotation | 卢文耀 | 报价单管理专家 | `wkea-quotation-expert` |
| stock | 沈知诚 | 库存管理专家 | `wkea-stock-expert` |
| sales | 钟启元 | 销售订单与合同专家 | `wkea-sales-expert` |

## Team 设计

- **Team**（`expertType: "team"`）：多角色专家团，含 1 个主理人（team-lead）+ N 个 member agent
  - `plugin.json` 必含 `teamInfo`（leadAgent + memberAgents）和 `members` 数组
  - `members[].role` 必有一个 `"lead"`，id 等于 `teamInfo.leadAgent`
  - `profession` 必须等于 `displayName`（Team 铁律）
  - 必含 `settings.json` 指定入口 agent：`{ "agent": "<team-lead 文件名不含 .md>" }`
  - 主理人 agent md 必含 SOP/Workflow 章节和团队协作铁律（TeamCreate、调度、中转、严禁行为）

## Plugin 目录结构

```
wkea-expert-team/                               ← Team plugin
├── .workbuddy-plugin/
│   └── plugin.json              ← 必填：manifest
├── agents/
│   ├── wkea-expert-team-team-lead.md   ← 主理人
│   ├── wkea-demand-expert.md           ← 8 个 member
│   ├── wkea-product-expert.md
│   ├── wkea-vendor-expert.md
│   ├── wkea-brand-expert.md
│   ├── wkea-customer-expert.md
│   ├── wkea-quotation-expert.md
│   ├── wkea-stock-expert.md
│   ├── wkea-sales-expert.md
│   └── workflows/                     ← 跨 expert SOP
│       ├── 01-需求询价处理.md
│       ├── 02-产品开发供应商.md
│       └── 04-品牌开发供应商.md
├── avatars/
│   ├── team.png                      ← 团头像
│   ├── wkea-expert-team-team-lead.png← 主理人头像
│   └── <member>.png                  ← 每个 member 1 个
├── settings.json                     ← Team 必填
└── README.md                         ← 使用说明
```

## 命名约定

- **plugin.json `name`**：`wkea-expert-team`（团队唯一 ID）
- **plugin.json `agentName`**：`wkea-expert-team-team-lead`（主理人）
- **plugin.json `plugin`**：与 `name` 相同
- **agent md frontmatter `name`**：`wkea-` + kebab-case 英文（如 `wkea-product-expert`）
- **frontmatter `displayName` / `profession`**：中英文双语（中文带"WKEA-"前缀，英文不带）
- **WorkBuddy marketplace 唯一性**：所有 WKEA expert 都装到 `my-experts` marketplace

## 兼容性

| 平台 | 识别字段 |
|------|---------|
| WorkBuddy | `name`、`agentName`、`expertType=team`、`displayName`（可选）、`description` |
| Claude Agent SDK | `tools`、`model` |
| Codex CLI | `name`、`description` |

未知字段安全忽略，扩展字段用 `x-*` 前缀。

## 校验

```bash
# 校验 team plugin
node ../scripts/validate-plugin.js ./wkea-expert-team
```

校验通过即代表 plugin 可直接拷贝到 `$HOME/.workbuddy/plugins/marketplaces/my-experts/plugins/`（覆盖式同步，见顶层 SKILL.md 的更新章节）。

## 开发流程

**新增 expert member**（不是新增 plugin）：

1. 在 `wkea-expert-team/agents/` 新建 `<member>.md`，frontmatter 写 `name` / `description` / `displayName` / `profession` / `maxTurns`
2. 在 `wkea-expert-team/.workbuddy-plugin/plugin.json` 的 `agents` 数组里加一行 `./agents/<member>.md`
3. 在 `members` 数组里加一个 member 对象（含 id / name / profession / avatar / role: "member"）
4. `teamInfo.memberAgents` 数组加新 id
5. 跑 `node ../scripts/validate-plugin.js ./wkea-expert-team` 校验
6. 在 `agents/workflows/` 新建跨 expert Workflow（如有需要）

**新增跨 expert Workflow**：

1. `wkea-expert-team/agents/workflows/NN-场景名.md`（N+1 递增）
2. 在主理人 agent.md 的「Workflow 索引」表里加一行
