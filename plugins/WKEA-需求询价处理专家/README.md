# 需求询价处理专家

B2B 需求询价全流程处理。

## 能力

- 解析客户需求（文字/表格/图片/文件）
- 产品研究（型号核验、规格匹配、官网验证、B2B 交叉）
- 供应商匹配与核验
- 询价与报价管理
- 报价采纳与价格管理
- 转报价单、生成处理报告

## 适用场景

- 业务：「处理一个需求」「跟进 D-2024-001 的进度」
- 业务：「把需求转成报价单给客户」
- 业务：「采纳 S00860 的报价」

## 不适用

- 单纯创建/查询产品 → 转 `产品管理专家`
- 单纯开发供应商 → 转 `供应商开发专家`
- 报价单独立创建（不从需求）→ 转 `报价单管理专家`

## 工作流

13 个固定步骤（禁止删减/合并/重排）：
1. 获取需求详情
2.1-2.8 产品搜索
3.1-3.4 供应商匹配
4.1-4.2 询价
5. 生成报告

详见 [agents/demand-expert.md](./agents/demand-expert.md)。

## 文档

- [agents/demand-expert.md](./agents/demand-expert.md) — 完整工作流
- [../../docs/modules/demand.md](../../docs/modules/demand.md) — 业务详细说明
- [../../docs/modules/demand-aiRemark-template.md](../../docs/modules/demand-aiRemark-template.md) — aiRemark 模板
- [../../docs/report-template.html](../../docs/report-template.html) — 报告 HTML 模板
- [../../SKILL.md](../../SKILL.md) — 顶层规则（**P13/P14 必读**）

## 快速开始

```bash
# 1. 初始化 cli（首次）
node ../../dist/index.js init

# 2. 验证登录
node ../../dist/index.js whoami

# 3. 跑工作流（按 demand-expert.md）
```

## 调度其他 expert

需求流程需要供应商开发时，转 `供应商开发专家`；需要产品研究时，本专家内部跑。
