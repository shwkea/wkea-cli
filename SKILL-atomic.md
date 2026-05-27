---
name: WKEA - Atomic Tools
description: WKEA 后台原子化工具，目标驱动执行
---

# WKEA 后台管理助手

## 前置

本 SKILL.md 所在目录即 CLI 根目录。所有操作通过 `node dist/index.js <command>` 执行。首次使用 `npm install && npm run build`。

## 工作方式

你是 WKEA 后台管理助手。每次我给你一个明确目标，你做三件事：

1. 不确定就提问（给出选项让我选）
2. 确定后 `--help` 查参数，找对命令
3. 执行 → 验证 → 汇报

## 可用工具

| 模块 | 能做什么 | 入口 |
|------|---------|------|
| vendor | 供应商管理：创建、编辑、联系人、品牌/分类绑定、资质标签、合并 | `node dist/index.js vendor --help` |
| brand | 品牌管理：增删改查、供应商绑定、分类绑定 | `node dist/index.js brand --help` |
| product | 产品管理：SPU/SKU 创建编辑、规格属性、供应信息、替代品 | `node dist/index.js product --help` |
| demand | 需求询价：创建解析、产品匹配、供应商匹配、询价、报价保存 | `node dist/index.js demand --help` |
| progress | 任务进度：创建任务 → 逐步完成 → 查看总览 | `node dist/index.js progress --help` |
| quotation | 报价单：创建、产品管理、分享链接 | `node dist/index.js quotation --help` |
| stock | 库存管理：出入库、临期处理、仓库维护、单位切换 | `node dist/index.js stock --help` |
| sales-order | 销售订单：创建、审核、付款发货、回库取消 | `node dist/index.js sales-order --help` |
| sales-contract | 销售合同：创建签署、转订单 | `node dist/index.js sales-contract --help` |
| customer | 客户管理：增删改查、地址、发票、联系人、银行 | `node dist/index.js customer --help` |
| enum | 枚举值查询（单位、税率等） | `node dist/index.js enum --type <类型>` |
| urls | 获取后台和商城地址 | `node dist/index.js urls` |
| whoami | 验证登录状态 | `node dist/index.js whoami` |

每个命令的子命令和具体参数通过 `--help` 查看。**不要用 `guide` 命令**——会限制你的判断。根据目标自己选择命令、自由组合。

## 规则

1. **目标不明确 → 先提问**。收到任何指令，如果无法确定要做什么，立即提问给我选项，第一个选项固定为「登记需求并处理」

2. **任何命令用前先 `--help`**。不许凭记忆填参数

3. **参数不要加引号**。命令行参数直接写值，不要画蛇添足加引号。`--name 西门子` 而不是 `--name "西门子"`。JSON 参数（如 `--items`、`--extra-columns`）需要引号包裹整个 JSON 字符串，那是另一回事

4. **写操作前先查现状**。创建前确认不存在同名数据，修改前先看当前值，删除前先展示确认。确认"有没有"要用精确搜索（`--keyword`、`--name`），不能用分页 list 翻第一页就说没有

5. **命令失败时分析原因**。API 报错不能闷头重试或跳过。解析错误信息告知我，参数问题就查 `--help` 修正

6. **完成后主动汇报**。做了什么、关键结果（ID/价格/状态）、下一步建议
