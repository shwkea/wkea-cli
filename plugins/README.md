# wkea-cli 业务专家 Plugin 集合

本目录是 wkea-cli 业务专家的 plugin 集合。每个子目录是一个独立的 WorkBuddy 兼容 plugin，可以单独发布、单独安装。

## Plugin 列表

| 目录 | 中文名 | 英文 ID | 状态 | 说明 |
|------|--------|--------|------|------|
| [`_template/`](./_template/) | 模板 | - | ✅ | 新建 expert 时复制此目录 |
| [`供应商开发专家/`](./供应商开发专家/) | 供应商开发专家 | `vendor-expert` | ✅ Phase 1 | 供应商全生命周期 + 合并 |
| [`需求询价处理专家/`](./需求询价处理专家/) | 需求询价处理专家 | `demand-expert` | ✅ Phase 1 | 13 步全流程 + 报告 |
| [`产品管理专家/`](./产品管理专家/) | 产品管理专家 | `product-expert` | ✅ Phase 1 | SPU/SKU/规格/替代品 |

## Phase 2 计划

| 目录 | 中文名 | 英文 ID | 优先级 | 说明 |
|------|--------|---------|--------|------|
| - | 品牌管理专家 | `brand-expert` | 中 | 品牌 CRUD + 绑定 |
| - | 客户管理专家 | `customer-expert` | 中 | 客户 + 子集合 |
| - | 库存管理专家 | `stock-expert` | 中 | 库存 + 仓库 |
| - | 报价单管理专家 | `quotation-expert` | 中 | 报价单 + 分享 |
| - | 销售订单与合同专家 | `sales-expert` | 中 | 订单 + 合同（合并）|

## Plugin 目录结构

```
<plugin-name>/
├── .codebuddy-plugin/
│   └── plugin.json              ← 必填：manifest
├── agents/
│   └── <agent-name>.md          ← 必填：agent 定义（frontmatter + 工作流）
├── avatars/
│   └── expert.png               ← 可选：头像
└── README.md                    ← 可选：使用说明
```

## 命名约定

- **目录名**：中文（与 WorkBuddy UI 一致）
- **agentName**（plugin.json + frontmatter）：英文 kebab-case，跨平台稳定
- **displayName**：中文为主，英文可选
- **name 字段**：可中文（WorkBuddy 支持），去掉 `displayName` 字段保持精简

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
node ../scripts/publish-plugin.js ./供应商开发专家
node ../scripts/publish-plugin.js ./需求询价处理专家
node ../scripts/publish-plugin.js ./产品管理专家
```

输出 zip 到 `../dist/plugins/<name>-v<version>.zip`，可直接上传到 WorkBuddy marketplace。

## 开发流程

1. 复制 `[_template/](./_template/)` 为新目录
2. 修改 `plugin.json` 的 name、agentName、description、tags、quickPrompts
3. 修改 `agents/<name>.md` 的 frontmatter 和正文
4. 跑 `node ../scripts/publish-plugin.js <新目录>` 验证打包
5. 更新本 README 的 Plugin 列表
