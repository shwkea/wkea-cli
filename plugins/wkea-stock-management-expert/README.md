# WKEA-库存管理专家

库存与仓库管理。

## 能力

- 库存增删改查
- 仓库增删改查
- 拆分包装（单位转换）
- 自动拆分（按需求数量）
- 临期管理
- 超 60 天库龄管理

## 适用场景

- 业务：「给 SKU W019963854 加 100 个库存」
- 业务：「把 1 箱拆成 10 个」
- 业务：「查一下哪些库存快过期了」
- 业务：「查超 60 天的库存」

## 不适用

- SPU/SKU 创建 → 转 WKEA-产品管理专家
- 销售出库 → 转 WKEA-销售订单与合同专家

## 文档

- [agents/wkea-stock-expert.md](./agents/wkea-stock-expert.md) — 完整工作流
- [../../SKILL.md](../../SKILL.md) — 顶层规则

## 快速开始

```bash
# 1. 初始化 cli（首次）
node ../../dist/index.js init

# 2. 验证登录
node ../../dist/index.js whoami

# 3. 跑工作流（按 wkea-stock-expert.md）
```
