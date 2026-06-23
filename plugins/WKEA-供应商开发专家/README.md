# 供应商开发专家

工业品供应商全生命周期管理。

## 能力

- 从品牌名/Logo/网址/图片出发，开发该品牌的供应商
- 搜索官网并提取授权代理商名单（含完整性自检）
- 企查查核验（工商+荣誉+联系方式）
- 批量创建并绑定品牌/分类
- 维护子集合（联系人/地址/银行/发票/链接）
- 合并重复供应商

## 适用场景

- 业务：「帮我开发 SMC 品牌的供应商，至少 5 家」
- 需求：某品牌没供应商或 < 2 家
- 维护：补充/补全供应商信息
- 合并：两家供应商合并到一家

## 不适用

- 查看已知供应商 → 直接用 CLI
- 报价单 → 转报价单管理专家
- 销售订单/合同 → 转销售订单与合同专家

## 文档

- [agents/vendor-expert.md](./agents/vendor-expert.md) — 完整工作流
- [../../docs/modules/vendor.md](../../docs/modules/vendor.md) — 业务详细说明
- [../../SKILL.md](../../SKILL.md) — 顶层规则

## 快速开始

```bash
# 1. 初始化 cli（首次）
node ../../dist/index.js init

# 2. 验证登录
node ../../dist/index.js whoami

# 3. 跑工作流（按 vendor-expert.md 的 Step 0-5）
```

## 模板来源

吸收自 WorkBuddy `brand-supplier-dev` agent（业务同事沉淀）+ 合并 `wkea-cli` 业务文档。
