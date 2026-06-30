# WKEA-品牌管理专家

品牌全生命周期管理。

## 能力

- 增删改查品牌
- 绑定/解绑供应商到品牌
- 绑定/解绑分类到品牌
- 维护品牌链接（官网/商城/店铺）
- 维护商标信息（注册号、有效期、申请人）

## 适用场景

- 业务：「创建 SMC 品牌」「查一下 Festo 是否存在」
- 业务：「把品牌 B001234 绑定到供应商 S00860」
- 业务：「删除品牌」（会展示级联影响）

## 不适用

- 供应商开发 → 转 WKEA-供应商开发专家
- 产品 SPU/SKU → 转 WKEA-产品管理专家
- 需求询价 → 转 WKEA-需求询价处理专家

## 文档

- [agents/wkea-brand-expert.md](./agents/wkea-brand-expert.md) — 完整工作流
- [../../SKILL.md](../../SKILL.md) — 顶层规则

## 快速开始

```bash
# 1. 初始化 cli（首次）
node ../../dist/index.js init

# 2. 验证登录
node ../../dist/index.js whoami

# 3. 跑工作流（按 wkea-brand-expert.md）
```
