# demand -- 需求询价管理

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
```bash
demand parse --text "<客户需求文本>"
```
返回结构化行项目（产品名/品牌/型号/数量/单位/客户原文），直接用于下一步创建。

**方式 B：MCP 工具**
通过 MCP 的 `parse_demand` 工具异步解析，支持文件附件和图片识别。适用于附件多、内容复杂的场景。

两种方式的输出格式一致，items 数组传给 `demand create --items` 即可。

### 2.2 创建需求

```bash
demand create --items '<parse输出的items JSON>' --topic "<主题>" --channel-source "微信"
```

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

```bash
progress create --tasks '[{"name":"解析需求"},{"name":"产品研究"},{"name":"供应商匹配"},...]'
```

按实际需要处理的步骤创建，后续用 `progress step --step-index <n>` 逐步骤推进。

### 2.4 行项目管理

```bash
# 查看需求的行项目列表
demand items --demand-id <id>

# 查看并保存到文件
demand items --demand-id <id> --save-json <path>

# 添加行项目
demand add-item --demand-id <id> --product-name <名称> --quantity <数量>

# 更新行项目（填写最终价格和毛利率）
demand update-item --item-id <id> --final-sku-price <价格> --gross-margin <毛利率>

# 完成行项目
demand complete-item --item-id <id>
```

### 2.5 查看需求详情

```bash
demand get --id <需求ID>
```

### 2.6 供应商询价

```bash
# 向供应商发起询价
demand quote-to-vendor --id <需求ID> --vendor-id <供应商ID> --item-ids <行项目ID1,行项目ID2>

# 查看供应商报价
demand vendor-quotes --demand-id <需求ID>

# 保存 SKU 价格（供应商报价后）
demand save-price --sku <SKU> --vendor-id <供应商ID> --price <单价> --gross-margin <毛利率>

# 保存供应商额外信息
demand quote-save-info --demand-id <需求ID> --vendor-id <供应商ID> --info-list '<json>'
```

### 2.7 行项目转产品

将行项目直接转为产品（只创建 SPU + SKU，**不设价格、不上架**）：

```bash
demand simple-create-product --id <需求ID>
```

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
