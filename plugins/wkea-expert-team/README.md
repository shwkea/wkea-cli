# WKEA 专家团

WKEA 全流程业务专家团：覆盖需求询价、产品配置、供应商开发、客户管理、报价单、库存、销售订单/合同的全链路供应链运营团队。

## 主理人

- **小嘉**（Jia）— 业务运营总监
  - 接收任务、拆解分派、协调专家、执行 workflow、汇总输出

## 团队成员

| 花名 | 角色 | 文件 |
|------|------|------|
| 谭知行 | 需求询价处理专家 | `wkea-demand-expert.md` |
| 管立品 | 产品管理专家 | `wkea-product-expert.md` |
| 原启诚 | 供应商开发专家 | `wkea-vendor-expert.md` |
| — | 品牌管理专家 | `wkea-brand-expert.md` |
| — | 客户管理专家 | `wkea-customer-expert.md` |
| — | 报价单管理专家 | `wkea-quotation-expert.md` |
| — | 库存与仓库管理专家 | `wkea-stock-expert.md` |
| — | 销售合同与订单管理专家 | `wkea-sales-expert.md` |
| — | 流程核验专家 | `wkea-inspection-expert.md` |
| — | 首选供应商确认专家 | `preferred-supplier-confirm.md` |
| — | 源头工厂评估专家 | `source-supplier-evaluator.md` |

## 工作流

7 个标准化 workflow（`agents/workflows/`）：

| 序号 | 场景 | 文件 |
|:---:|------|------|
| 01 | 需求询价处理（解析→研究→匹配→询价→报告→核验） | `01-需求询价处理.md` |
| 02 | 批量产品上架 + 供应商开发 | `02-产品开发供应商.md` |
| 04 | 品牌开发供应商（官网搜代理→核验→入库） | `04-品牌开发供应商.md` |
| 05 | 产品配置与上架（研究→型号解析→配置器→上架） | `05-产品配置与上架.md` |
| 06 | 供应商评估与确认（分级评分 + 源头定位） | `06-供应商评估与确认.md` |
| 07 | 供应商报价录入（报价文本→结构化→写入询价单） | `07-供应商报价录入.md` |

> 工作流文件是流程的**唯一权威**。各 expert 的 agent 定义引用工作流，不维护副本。

## 设计原则

- **工作流是唯一源码**：Phase 列表、进度模板、aiRemark 规范等都在 workflow 文件中定义，expert 和 team-lead 引用而非复制
- **每个 workflow 末尾必有核验 Phase**：派 `wkea-inspection-expert` 对照原文核查，跳过核验 = 流程未完成
- **团队协作协议**：由 `wkea-expert-team-team-lead.md` "团队协作机制"段统一定义，不在各 expert 中重复
