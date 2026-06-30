# WKEA-客户管理专家

客户全生命周期管理。

## 能力

- 增删改查客户
- 维护地址子集合（收货地址）
- 维护发票子集合（发票抬头/税号）
- 维护银行账户子集合
- 维护联系人子集合
- 支持一次性创建带全部子集合数据

## 适用场景

- 业务：「创建上海某某有限公司客户」
- 业务：「给客户 C001234 添加收货地址」
- 业务：「查客户详情」

## 不适用

- 销售订单/合同 → 转 WKEA-销售订单与合同专家
- 报价单 → 转 WKEA-报价单管理专家
- 供应商管理 → 转 WKEA-供应商开发专家

## 文档

- [agents/wkea-customer-expert.md](./agents/wkea-customer-expert.md) — 完整工作流
- [../../SKILL.md](../../SKILL.md) — 顶层规则

## 快速开始

```bash
# 1. 初始化 cli（首次）
node ../../dist/index.js init

# 2. 验证登录
node ../../dist/index.js whoami

# 3. 跑工作流（按 wkea-customer-expert.md）
```
