# demand -- 需求询价管理

> **命令参数以 `<command> --help` 为准。** 以下命令示例仅说明操作流程，具体参数不要照抄，先跑 `--help` 查看完整参数列表后再执行。

## 1. 核心概念

### 数据结构

```
DemandQuotation（需求询价主表）
  ├── DemandQuotationItem（行项目）
  │     └── skuId → 绑定的 SKU
  └── DemandQuotationDocInfo（供应商报价记录）
```

- **DemandQuotation**：需求询价主表，包含主题、渠道来源、状态等基本信息。
- **DemandQuotationItem**：行项目，每个行项目对应一个客户询价的具体产品，可绑定到 SKU。
- **DemandQuotationDocInfo**：供应商针对该需求的报价记录。

### 状态流转

| 状态码 | 含义 |
|--------|------|
| 274 | 待处理 |
| 275 | 处理中 |
| 276 | 已完成 |
| 291 | 已取消 |

### 行项目关键字段

| 字段 | 说明 |
|------|------|
| `productName` / `productBrand` / `productModel` | 客户原文（客户原始描述） |
| `manageProductName` / `manageProductBrand` / `manageProductModel` | 后台编辑后的值（运营修正后） |
| `expectPrice` | 客户期望价 |
| `finalSkuPrice` | 最终确认的 SKU 价格（供应商报价后填写） |
| `aiRemark` | AI 处理记录，**只能写入此字段** |
| `to-vendor-remark` | 供应商可见备注（**禁止 AI 写入**） |
| `remark` | 客户可见备注（**禁止 AI 写入**） |

> 重要：AI 研究结果只能写入 `aiRemark` 字段，严禁写入 `remark`（客户可见）或 `to-vendor-remark`（供应商可见）。

**aiRemark 按工作阶段分区域写入**：

| 区域 | 内容 | 写入时机 |
|------|------|---------|
| 区域 5（产品研究） | 品牌发现、逐个验证、规格对比 | 产品信息收集完成后 |
| 区域 6（供应商匹配） | 系统已有供应商、新开发供应商 | 供应商查找完成后 |

各区域之间内容不交叉：区域 5 不写供应商信息，区域 6 不写产品规格。

---

## 2. 常用操作

### 2.1 解析需求

两种方式将客户需求解析为结构化行项目：

**方式 A：CLI 命令（推荐）**

- `demand parse` — 将客户需求文本解析为结构化行项目（参数见 `demand parse --help`）

返回结构化行项目（产品名/品牌/型号/数量/单位/客户原文），直接用于下一步创建。

**方式 B：MCP 工具**
通过 MCP 的 `parse_demand` 工具异步解析，支持文件附件和图片识别。适用于附件多、内容复杂的场景。

两种方式的输出格式一致，items 数组传给 `demand create --items` 即可。

### 2.2 创建需求

- `demand create` — 创建需求询价（参数见 `demand create --help`）

**渠道来源（channel-source）可选值**：

| 值 | 说明 |
|----|------|
| `淘宝-亿日` | 淘宝亿日店铺 |
| `淘宝-维嘉` | 淘宝维嘉店铺 |
| `1688` | 1688 平台 |
| `微信` | 微信渠道 |
| `邮箱` | 邮件渠道 |
| `线下` | 线下渠道 |
| `其他` | 其他渠道 |

### 2.3 创建任务进度

需求创建后，用进度跟踪整体处理流程：

- `progress create` — 创建任务进度，按实际需要处理的步骤创建（参数见 `progress create --help`）
- `progress step` — 逐步骤推进任务进度（参数见 `progress step --help`）

### 2.4 行项目管理

- `demand items` — 查看需求的行项目列表（参数见 `demand items --help`）；可加 `--save-json` 保存到文件
- `demand add-item` — 添加行项目（参数见 `demand add-item --help`）
- `demand update-item` — 更新行项目（填写最终价格和毛利率，参数见 `demand update-item --help`）
- `demand complete-item` — 完成行项目（参数见 `demand complete-item --help`）

### 2.5 查看需求详情

- `demand get` — 查看需求详情（参数见 `demand get --help`）

### 2.6 供应商匹配

为每个行项目的品牌找到对应的供应商：

1. `demand vendors-by-brand` — 按品牌查询已绑定的供应商（参数见 `--help`）
2. 已有 ≥ 2 家供应商的品牌 → 直接进入询价
3. 不足 2 家的品牌 → 需先开发供应商（`vendor create` + 绑定品牌），再询价
4. 供应商创建和品牌绑定见 `vendor guide`，三方绑定规则见 `binding-rules.md`

### 2.7 供应商询价

- `demand quote-to-vendor` — 向供应商发起询价，指定需求和行项目（参数见 `--help`）
- 已询过价的供应商不需要重复发送

### 2.8 报价对比与采纳

供应商回复后（异步，新会话处理）：

1. **查看报价**：`demand vendor-quotes` — 查看所有供应商的报价明细（单价、交期、库存、发货地等）
2. **对比报价**：逐行项目对比各供应商的价格、交期。供应商报价数据包含每个行项目的：价格、交期（天）、库存、发货地、备注、报价有效期
3. **业务人员选择**：根据报价对比结果，决定采纳哪个供应商的报价
4. **保存供应价格**：`demand save-price` — 将选中的报价保存到产品供应信息（仅记录，不改默认售价）
5. **设置主供应商价格**：`product supply set-master` — 采纳的报价设为 SKU 默认售价（⚠️ 仅供应商正式报价后使用）
6. **更新行项目**：`demand update-item` — 填写 `--final-sku-price` 和 `--gross-margin`

### 2.9 行项目转产品

将行项目直接转为产品（只创建 SPU + SKU，**不设价格、不上架**）：

- `demand simple-create-product` — 行项目转产品（参数见 `--help`）

> 注意：此操作仅创建产品基础数据，价格需后续通过 `supply set-master` 设置。

---

## 3. 数据校验

创建需求后，按以下步骤验证数据正确性：

1. **验证需求基本信息**：
   ```bash
   demand get --id <需求ID>
   ```
   确认主题、渠道来源、状态等字段正确。

2. **验证行项目**：
   ```bash
   demand items --demand-id <需求ID>
   ```
   检查行项目的产品名称、品牌、型号、期望价格是否与原始需求一致。

3. **关键校验项**：
   - `originalText` 字段不能丢失 —— 从 `parse` 输出的 items 传递到 `create` 的 items 时，每行的原始文本必须保留。
   - `aiRemark` 中不含敏感信息（不应出现在客户或供应商可见字段）。
   - 如有供应商报价，确认 `finalSkuPrice` 已填写。

---

## 4. 常见错误

| 错误现象 | 原因 | 解决 |
|----------|------|------|
| 创建需求后发现行项目为空 | `--items` 参数 JSON 格式错误或未正确传递 parse 输出 | 检查 JSON 是否合法，确保单引号内的 JSON 双引号已正确转义 |
| `originalText` 丢失 | 从 parse 到 create 过程中未保留原始文本字段 | parse 输出的 items 中每个对象必须包含 `originalText`，create 时原样传入 |
| AI 内容写入了 `remark` 或 `to-vendor-remark` | 未遵守"AI 只能写 `aiRemark`"的约束 | 回查写入逻辑，只向 `aiRemark` 写入 |
| `simple-create-product` 后发现产品无价格 | 该命令只创建产品数据，不设价格 | 后续使用 `supply set-master` 设置价格 |
| 供应商报价查询为空 | 尚未发起询价或供应商未响应 | 先用 `demand quote-to-vendor` 发起询价 |
