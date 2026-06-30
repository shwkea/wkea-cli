# wkea-cli 业务专家 Plugin 集合

本目录是 wkea-cli 业务专家的 plugin 集合。每个子目录是一个独立的 WorkBuddy 兼容 plugin，可以单独发布、单独安装。

**所有 expert 必须以 `WKEA-` 前缀命名**（目录、plugin.json、displayName、agent 文件名均要带前缀），便于在 WorkBuddy 多 marketplace 中识别归属。

## Plugin 列表

| 目录 | 中文名 | 英文 ID | 类型 | 状态 | 说明 |
|------|--------|--------|------|------|------|
| [`_template/`](./_template/) | 模板 | - | - | ✅ | 新建 expert 时复制此目录 |
| [`wkea-vendor-development-expert/`](./wkea-vendor-development-expert/) | WKEA-供应商开发专家 | `wkea-vendor-expert` | agent | ✅ | 供应商全生命周期 + 合并 |
| [`wkea-demand-inquiry-expert/`](./wkea-demand-inquiry-expert/) | WKEA-需求询价处理专家 | `wkea-demand-expert` | agent | ✅ | 13 步全流程 + 报告 |
| [`wkea-product-management-expert/`](./wkea-product-management-expert/) | WKEA-产品管理专家 | `wkea-product-expert` | agent | ✅ | SPU/SKU/规格/替代品 |
| [`wkea-brand-management-expert/`](./wkea-brand-management-expert/) | WKEA-品牌管理专家 | `wkea-brand-expert` | agent | ✅ | 品牌 CRUD + 绑定/解绑 |
| [`wkea-customer-management-expert/`](./wkea-customer-management-expert/) | WKEA-客户管理专家 | `wkea-customer-expert` | agent | ✅ | 客户 + 地址/发票/银行/联系人 |
| [`wkea-quotation-management-expert/`](./wkea-quotation-management-expert/) | WKEA-报价单管理专家 | `wkea-quotation-expert` | agent | ✅ | 报价单 + 分享链接 |
| [`wkea-stock-management-expert/`](./wkea-stock-management-expert/) | WKEA-库存管理专家 | `wkea-stock-expert` | agent | ✅ | 库存 + 仓库 + 临期/超龄 |
| [`wkea-sales-expert/`](./wkea-sales-expert/) | WKEA-销售订单与合同专家 | `wkea-sales-expert` | agent | ✅ | 合同 + 订单状态机全流程 |
| [`wkea-expert-team/`](./wkea-expert-team/) | WKEA 专家团 | `wkea-expert-team` | **team** | ✅ | 主理人小嘉 + 8 个 member agent + 多 Workflow |

## Team vs Agent

- **Agent**（`expertType: "agent"`）：单角色专家，自身完成全部工作
- **Team**（`expertType: "team"`）：多角色专家团，含 1 个主理人（team-lead）+ N 个 member agent
  - `plugin.json` 必含 `teamInfo`（leadAgent + memberAgents）和 `members` 数组
  - `members[].role` 必有一个 `"lead"`，id 等于 `teamInfo.leadAgent`
  - `profession` 必须等于 `displayName`（Team 铁律）
  - 必含 `settings.json` 指定入口 agent：`{ "agent": "<team-lead 文件名不含 .md>" }`
  - 主理人 agent md 必含 SOP/Workflow 章节和团队协作铁律（TeamCreate、调度、中转、严禁行为）

## Plugin 目录结构

```
WKEA-<plugin-name>/                              ← Agent 或 Team
├── .workbuddy-plugin/
│   └── plugin.json              ← 必填：manifest（name 必须 wkea- 前缀）
├── agents/
│   ├── wkea-<agent-name>.md     ← Agent: 1 个；Team: N+1 个（1 lead + N member）
│   └── ...
├── avatars/
│   ├── expert.png               ← Agent: 1 个
│   ├── team.png                 ← Team: 1 个（主团头像）
│   ├── <lead>.png               ← Team: 1 个
│   ├── <member-a>.png           ← Team: 每个 member 1 个
│   └── ...
├── settings.json                ← Team 必填：{ "agent": "<lead 文件名>" }；Agent 不需要
└── README.md                    ← 可选：使用说明
```

## 命名约定

- **目录名**：`wkea-` + kebab-case 英文（与 plugin.json `name` 一致，如 `wkea-vendor-development-expert`）
- **plugin.json `name`**：`wkea-` + kebab-case 英文（如 `wkea-vendor-development-expert`）
- **plugin.json `agentName`**：`wkea-` + kebab-case（如 `wkea-vendor-expert`）
- **plugin.json `plugin`**：与 `name` 相同
- **agent md frontmatter `name`**：`WKEA-` + 中文
- **displayName.zh / profession.zh**：`WKEA-` + 中文
- **tags、displayDescription**：以 `WKEA` 开头
- **WorkBuddy marketplace 唯一性**：所有 WKEA expert 都装到 `my-experts` marketplace，目录名带前缀避免和其他 marketplace expert 冲突

## 兼容性

| 平台 | 识别字段 |
|------|---------|
| WorkBuddy | `name`、`agentName`、`expertType=agent`、`displayName`（可选）、`description` |
| Claude Agent SDK | `tools`、`model` |
| Codex CLI | `name`、`description` |

未知字段安全忽略，扩展字段用 `x-*` 前缀。

## 校验

```bash
# 校验单个 plugin 的 spec 合规性（不生成 zip / dist 产物）
node ../scripts/validate-plugin.js <plugin-dir>

# 校验示例
node ../scripts/validate-plugin.js ./wkea-vendor-development-expert
node ../scripts/validate-plugin.js ./wkea-demand-inquiry-expert
node ../scripts/validate-plugin.js ./wkea-product-management-expert
node ../scripts/validate-plugin.js ./wkea-expert-team
```

校验通过即代表 plugin 可直接拷贝到 `$HOME/.workbuddy/plugins/marketplaces/my-experts/plugins/`（覆盖式同步，见顶层 SKILL.md 的更新章节）。

## 开发流程

1. 复制 `[_template/](./_template/)` 为 `WKEA-<新名字>/`
2. 修改 `plugin.json` 的 name（保留 wkea- 前缀）、agentName、description、tags、quickPrompts
3. 修改 `agents/wkea-<name>.md` 的 frontmatter（保留 WKEA- 前缀）和正文
4. 跑 `node ../scripts/validate-plugin.js <新目录>` 校验合规性
5. 更新本 README 的 Plugin 列表
