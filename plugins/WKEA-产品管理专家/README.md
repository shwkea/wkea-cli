# 产品管理专家

SPU/SKU 全生命周期管理。

## 能力

- 创建产品（SPU+SKU+规格+属性+图片）
- 规格系统管理（可变/固定/分隔符）
- 供应信息绑定（多供应商对比）
- 替代品管理（完全替代/部分替代）
- 停产管理（无替代/有替代）
- 多维度查询（名称/型号/品牌/分类/供应商/价格/时间）

## 适用场景

- 业务：「创建 SMC AW20-30 配套的管接头」
- 业务：「查一下 Festo 品牌的气缸有哪些」
- 业务：「给 SKU W019963854 添加替代品」
- 业务：「把 SPU P001234 标记为停产，替代品是 P001300」

## 不适用

- 产品研究（型号核验+规格匹配）→ 转 `需求询价处理专家`
- 供应商开发 → 转 `供应商开发专家`
- 库存管理 → 转 `库存管理专家`

## 文档

- [agents/product-expert.md](./agents/product-expert.md) — 完整工作流
- [../../docs/modules/product.md](../../docs/modules/product.md) — 业务详细说明
- [../../docs/modules/extra-columns.md](../../docs/modules/extra-columns.md) — 附加列使用
- [../../SKILL.md](../../SKILL.md) — 顶层规则

## 快速开始

```bash
# 1. 初始化 cli（首次）
node ../../dist/index.js init

# 2. 验证登录
node ../../dist/index.js whoami

# 3. 跑工作流（按 product-expert.md）
```

## 核心概念

- **SPU**：产品组（不能含品牌名）
- **SKU**：最小可售卖单位（品牌名+SPU名+型号）
- **规格**：参与型号拼接的参数（可变/固定/分隔符）
- **属性**：不参与型号拼接的参数（产地、材质等）
