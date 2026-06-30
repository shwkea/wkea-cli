# WKEA-报价单管理专家

报价单全生命周期管理。

## 能力

- 从需求询价生成报价单
- 独立创建报价单
- 添加/删除/修改/排序报价单产品
- 生成分享短链接和复制文案
- 微信发送给客户

## 适用场景

- 业务：「把需求 D-2024-001 转成报价单」
- 业务：「创建一个独立报价单，列 SMC 的 5 个产品」
- 业务：「生成分享链接，主题『SMC 气缸报价』」

## 不适用

- 需求询价处理 → 转 WKEA-需求询价处理专家
- 销售订单（执行）→ 转 WKEA-销售订单与合同专家

## 文档

- [agents/wkea-quotation-expert.md](./agents/wkea-quotation-expert.md) — 完整工作流
- [../../SKILL.md](../../SKILL.md) — 顶层规则

## 快速开始

```bash
# 1. 初始化 cli（首次）
node ../../dist/index.js init

# 2. 验证登录
node ../../dist/index.js whoami

# 3. 跑工作流（按 wkea-quotation-expert.md）
```
