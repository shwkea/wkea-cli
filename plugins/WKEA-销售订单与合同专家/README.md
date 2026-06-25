# WKEA-销售订单与合同专家

销售合同与订单全生命周期管理。

## 能力

- 销售合同 CRUD + 签署 + 转订单
- 销售订单 CRUD + 状态流转全流程
- 销售合同行项目维护
- 订单发货单 / 出库单查询
- 删除必带级联影响提示

## 适用场景

- 业务：「创建销售合同」「把合同 SC-2024-001 转成订单」
- 业务：「创建销售订单」「确认订单付款」「订单发货」
- 业务：「订单状态流转（待审核→已确认→待付款→待发货→已发货→已完成）」

## 不适用

- 报价单 → 转 WKEA-报价单管理专家
- 客户管理 → 转 WKEA-客户管理专家
- 库存出库 → 转 WKEA-库存管理专家

## 文档

- [agents/wkea-sales-expert.md](./agents/wkea-sales-expert.md) — 完整工作流
- [../../SKILL.md](../../SKILL.md) — 顶层规则

## 快速开始

```bash
# 1. 初始化 cli（首次）
node ../../dist/index.js init

# 2. 验证登录
node ../../dist/index.js whoami

# 3. 跑工作流（按 wkea-sales-expert.md）
```
