# wkea-cli 业务专家 Plugin 集合

本目录是 wkea-cli 业务专家的 plugin 集合。每个子目录是一个独立的 WorkBuddy 兼容 plugin，可以单独发布、单独安装。

**所有 expert 必须以 `WKEA-` 前缀命名**（目录、plugin.json、displayName、agent 文件名均要带前缀），便于在 WorkBuddy 多 marketplace 中识别归属。

## Plugin 列表

| 目录 | 中文名 | 英文 ID | 状态 | 说明 |
|------|--------|--------|------|------|
| [`_template/`](./_template/) | 模板 | - | ✅ | 新建 expert 时复制此目录 |
| [`WKEA-供应商开发专家/`](./WKEA-供应商开发专家/) | WKEA-供应商开发专家 | `wkea-vendor-expert` | ✅ Phase 1 | 供应商全生命周期 + 合并 |
| [`WKEA-需求询价处理专家/`](./WKEA-需求询价处理专家/) | WKEA-需求询价处理专家 | `wkea-demand-expert` | ✅ Phase 1 | 13 步全流程 + 报告 |
| [`WKEA-产品管理专家/`](./WKEA-产品管理专家/) | WKEA-产品管理专家 | `wkea-product-expert` | ✅ Phase 1 | SPU/SKU/规格/替代品 |

## Phase 2 计划

| 目录 | 中文名 | 英文 ID | 优先级 | 说明 |
|------|--------|---------|--------|------|
| - | WKEA-品牌管理专家 | `wkea-brand-expert` | 中 | 品牌 CRUD + 绑定 |
| - | WKEA-客户管理专家 | `wkea-customer-expert` | 中 | 客户 + 子集合 |
| - | WKEA-库存管理专家 | `wkea-stock-expert` | 中 | 库存 + 仓库 |
| - | WKEA-报价单管理专家 | `wkea-quotation-expert` | 中 | 报价单 + 分享 |
| - | WKEA-销售订单与合同专家 | `wkea-sales-expert` | 中 | 订单 + 合同（合并）|

## Plugin 目录结构

```
WKEA-<plugin-name>/
├── .workbuddy-plugin/
│   └── plugin.json              ← 必填：manifest（name 必须 wkea- 前缀）
├── agents/
│   └── wkea-<agent-name>.md     ← 必填：agent 定义（frontmatter name 必须 WKEA- 前缀）
├── avatars/
│   └── expert.png               ← 可选：头像
└── README.md                    ← 可选：使用说明
```

## 命名约定

- **目录名**：`WKEA-` + 中文（如 `WKEA-供应商开发专家`）
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

## 打包发布

```bash
# 打包单个 plugin
node ../scripts/publish-plugin.js <plugin-dir>

# 打包示例
node ../scripts/publish-plugin.js ./WKEA-供应商开发专家
node ../scripts/publish-plugin.js ./WKEA-需求询价处理专家
node ../scripts/publish-plugin.js ./WKEA-产品管理专家
```

输出 zip 到 `../dist/plugins/<name>-v<version>.zip`，可直接上传到 WorkBuddy marketplace。

## 开发流程

1. 复制 `[_template/](./_template/)` 为 `WKEA-<新名字>/`
2. 修改 `plugin.json` 的 name（保留 wkea- 前缀）、agentName、description、tags、quickPrompts
3. 修改 `agents/wkea-<name>.md` 的 frontmatter（保留 WKEA- 前缀）和正文
4. 跑 `node ../scripts/publish-plugin.js <新目录>` 验证打包
5. 更新本 README 的 Plugin 列表
