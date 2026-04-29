## 通用原则

创建或更新任何数据时，先执行 `whoami` 获取当前登录用户信息。对于 `--manage-id`（客户经理）、`--manager-id`（经理ID）等负责人字段，一律使用 `whoami` 查到的本人 ID，**不要问用户选谁**。

---

## 业务概念

### 产品层级：SPU → SKU

**SPU（产品组）**

- 具有相同属性、规格的产品集合，是 SKU 的上一级
- 管理共性特征：产品说明、图片、规格绑定、属性绑定
- 示例：不同的 SPU → "iPhone 手机"、"小米手机"

**SKU（最小可售卖单位）**

- 具有唯一型号（model）和规格组合的最小销售单位
- 工业品的 SKU 数量容易爆炸（如 4 个规格各 10 个值 = 10000 个 SKU）
- 管理销售价、采购价、库存的单位

### 规格（Spec）

- 影响 SKU 型号（model）和价格的参数
- 示例：颜色、内存、硬盘、尺寸、功率、压力、口径
- **所有型号相关信息都作为规格来管理**，例如把"iPhone"作为规格名，"iPhone 12"、"iPhone 16"作为规格值
- 规格值必须填写 tag（型号码），用于生成 SKU 型号

**tag 的作用**

```
SKU.model = 规格值1.tag + "-" + 规格值2.tag + "-" + 规格值3.tag + ...
示例：
  规格"型号"的值: "iPhone12" (tag="IP12") + "iPhone16" (tag="IP16")
  规格"颜色"的值: "红色" (tag="RED") + "蓝色" (tag="BLU")
  → model = "IP12-RED" 或 "IP16-BLU"
```

### 属性（Attribute）

- 不影响 SKU 型号的描述性参数
- 示例：产地、材质、保修年限、包装清单
- 纯展示用，不参与型号生成

### 规格 vs 属性 判断原则

遇到产品参数时问自己：**这个参数会影响 SKU 型号吗？**

| 影响型号（影响价格/区分可售单位） | 不影响型号（纯展示描述） |
|---|---|
| → 写到规格（Spec） | → 写到属性（Attribute） |
| 示例：颜色、内存、尺寸 | 示例：产地、材质、保修年限 |

---

## 供应商保存完整流程

保存供应商需要按顺序完成以下步骤，缺一不可，否则数据不完整。

### 步骤一：基础信息

创建供应商时，必须先通过枚举命令查看以下必填字段的可用值：

- **供应商类型**（`--type`）— 原厂/授权经销商/品牌方/总代理/其他
- **收款方式**（`--pay-type`）— 银行转账/支付宝/微信
- **结算方式**（`--settlement-type`）— 现款/月结
- **付款期限**（`--payment-term`）— 现款提货/货到 X 天/票到 X 天/款到发货
- **币种**（`--currency-id`）

每个枚举参数的值通过 `wkea-manage-cli enum --type <枚举组名>` 查询。枚举组名在 `--help` 中有标注。

供应商创建后可以补充联系人、品牌绑定、分类绑定等信息。

### 步骤二：联系人

供应商的联系人需要独立维护。一个供应商可以有多个联系人，每个联系人包含姓名、电话、邮箱等信息。

**注意：联系人不能通过供应商创建/更新一起保存，必须单独维护。**

### 步骤三：绑定品牌

绑定品牌的含义：将品牌与供应商建立关联关系，关联后该供应商可以管理/销售这些品牌的产品。

品牌在系统中独立存在，供应商与品牌是多对多关系。

### 步骤四：绑定分类

绑定分类的含义：将产品分类与供应商建立关联关系，标识供应商的经营范围。

### 步骤五：优势分类（可选）

标识供应商的核心业务领域，用于供应商排序和推荐。

---

## 品牌管理

品牌在系统中独立存在，供应商与品牌是多对多关系。删除品牌时会清理：供应商-品牌关联、SPU-品牌关联、品牌-分类关联。

---

## 产品管理

### 创建产品

**`quick-create` 是创建产品的首选方式**，能一次性完成 SPU + 规格 + 品牌绑定 + SKU 的创建。
SKU 是可选的——不传 SKU 参数就只创建 SPU 和规格，传入则同时创建具体 SKU。

**不传 SKU（变型模式——只有规格，不创建具体 SKU）：**

使用 `--specs` 参数传入规格 JSON。支持两种格式：

1. **简单规格（JSON 对象）** — 适合不需要 tag 的场景：`{"规格名":["值1","值2"]}`
2. **完整规格（JSON 数组）** — 适合需要 tag 型号码生成 SKU 型号的场景：`[{"name":"规格名","sort":1,"params":[{"name":"值1","tag":"TAG1"},...]}]`

完整规格 `fullSpecs` 字段说明：

| 字段 | 说明 |
|------|------|
| `name` | 规格名称，如"主体尺寸"、"颜色" |
| `sort` | 排序（可选） |
| `isFixed` | 是否固定规格（可选，默认 false） |
| `isNameShow` | 规格名是否在产品名中体现（可选，默认 false） |
| `params` | 规格值列表 |
| `params[].name` | 规格值名称，如"20"、"红色" |
| `params[].tag` | 型号码（**必填**），用于生成 SKU model |
| `params[].sort` | 排序（可选） |

**注意：** 规格创建后，系统会维护规格信息用于 ES 搜索，**不会自动生成 SKU 组合**。搜索时系统会根据搜索条件 + 产品规格数据动态生成对应型号。

**传 SKU（具体 SKU 模式——有具体型号/价格/库存）：**

通过 `-s --sku <json>` 参数传入 SKU 数据。每个 `-s` 创建一个 SKU，可以多次传入。

`-s` 字段说明：

| 字段 | 必填 | 说明 |
|------|------|------|
| name | 是 | SKU 名称 |
| specs | 否 | 自动创建规格，格式 `{"规格名":["值1","值2"]}` |
| attributes | 否 | SKU 级属性，格式 `[{"name":"属性名","value":"属性值"}]` |
| paramIds | 否 | 已有规格参数 ID（直接复用，不自动创建） |
| salesPrice | 否 | 售价（为空但有 purchasePrice 则按默认加价率自动计算） |
| purchasePrice | 否 | 采购价 |
| stock | 否 | 库存 |
| weight | 否 | 重量(kg) |
| isShelf | 否 | 是否上架（默认 true） |
| unit | 否 | 单位 ID（枚举值） |
| remark | 否 | 备注 |
| model | 否 | 型号 |
| images | 否 | 图片集合（多张逗号分隔） |
| imgReference | 否 | 详情图是否仅供参考 |
| salesDeliver | 否 | 销售交期（枚举值） |
| deliveryDateType | 否 | 交期类型（枚举值） |
| safetyStock | 否 | 库存下限 |
| ceilingStock | 否 | 库存上限（0 为不限制） |
| actualSalesPrice | 否 | 实际销售价格 |
| taxRate | 否 | 销售税率（枚举值） |
| purchaseTaxRate | 否 | 采购税率（枚举值） |
| purchaseLink | 否 | 采购链接 |
| tagManage | 否 | SKU 标签（枚举值） |
| templateId | 否 | 运费模板 Id |
| barcode | 否 | 条码 |
| esKeyword | 否 | ES 搜索关键词 |
| life | 否 | 质保期（天） |
| returnDeadline | 否 | 无理由退货期限（天） |
| invoiceMethod | 否 | 开票方式（1一单一开，2累计开票） |
| purchaseState | 否 | 采购状态（true=在售，false=停购） |
| replaceSku | 否 | 替换 SKU（存在则下架当前 sku） |
| dineInDetails | 否 | 堂食详情 |
| specName | 否 | 规格值名称 |
| extendId | 否 | 扩展 ID |
| offlineCategory | 否 | 线下分类 |
| unitAmounts | 否 | 单位量 |
| itemNumber | 否 | 货号（其他地方产品编号） |
| positionRemark | 否 | 位置备注（采购时此产品在供应商的位置） |
| simpleDesc | 否 | 简单描述（详情展示） |
| info | 否 | SKU 详细信息对象（见下方 info 字段表） |

`info` 字段说明（嵌套对象）：

| 字段 | 说明 |
|------|------|
| vendorsSku | 供应商 SKU |
| manufacturerModel | 制造商型号 |
| minOrderQuantity | 最小起订量 |
| minOrderMultiple | 最小起订倍数 |
| minPurchaseQuantity | 最小采购量 |
| minPurchaseMultiple | 最小采购倍数 |
| purchasePrice | 采购价格（覆盖外层） |
| innerPackingQuantity | 内包装数量 |
| startDate | 销售开始时间 |
| endDate | 销售结束时间 |
| stockType | 备货类型（非备货/备货） |
| lengthWidthHeight | 长宽高 |
| weight | 重量(kg, 覆盖外层) |
| isFragile | 是否易碎 |
| purchaseDeliver | 采购交期（枚举值） |
| deliveryDateType | 采购交期类型（枚举值，覆盖外层） |
| isReturn | 能否退货 |
| isExchange | 能否换货 |
| isCustomized | 是否定制 |
| isPreferred | 是否维嘉优选 |
| deliveryMethod | 发货方式（枚举值） |

**注意：** `quick-create` 内部已自动刷新 ES，无需额外调用。

### 变型模式（仅规格，不创建具体 SKU）

如果只有规格数据没有具体 SKU 数据，用 `--specs` 参数即可，**不要走分步流程**。
**完整规格 JSON（含 tag）已支持一步创建**，不再需要分步调用 spec add。

仅当需要补充规格到已有 SPU 时才需要分步操作。

### 备选：分步创建

当需要逐步创建、或在已有 SPU 上补充字段时，可以使用分步方式。相比于 `quick-create`，缺少规格/SKU 自动创建能力，适合已有 SPU 的补充编辑场景。

### 规格管理

规格值必须填写 tag（型号码），否则 SKU 型号拼接不正确。

### 供应信息（SKU + 供应商 + 价格）

供应信息管理 SKU 与供应商、价格之间的关系。包含：
- SPU 与供应商的绑定
- SKU 的供应价格和库存设置
- 供应汇总查询

---

## 枚举参数参考

以下是各命令参数对应的枚举组名。用 `wkea-manage-cli enum --type <枚举组名>` 查看可用值。

### 供应商相关

| CLI 参数 | 对应枚举组名（用 enum --type 查看） | 说明 |
|----------|-----------------------------------|------|
| `--type` | 供应商类型 | 原厂/授权经销商/品牌方/总代理/其他 |
| `--pay-type` | 收款方式 | 银行转账/支付宝/微信 |
| `--settlement-type` | 结款方式 | 现款/月结 |
| `--payment-term` | 付款期限 | 现款提货/货到 X 天/票到 X 天/款到发货 |
| `--currency-id` | 币种 | 币种列表 |
| `--enterprise-type` | 企业类型 | 股份有限/有限责任/个体工商户等 |
| `--channel-source` | 渠道来源 | 企业微信/淘宝/线下等 |
| `--group-id` | 供应商组 | 核心供应商/零星供应商 |

### 产品相关

| CLI 参数 | 对应枚举组名（用 enum --type 查看） | 说明 |
|----------|-----------------------------------|------|
| `--unit` / `unit` | 单位 | 个/件/箱/套等 |
| `--tax-rate` / `taxRate` | 税率 | 13%/6%/3% 等 |
| `--sales-deliver` / `salesDeliver` | 交期 | 工作日/自然日 |
| `--delivery-date-type` / `deliveryDateType` | 交期 | 工作日/自然日 |
| `--purchase-deliver` / `purchaseDeliver` | 交期 | 工作日/自然日 |
| `--delivery-method` / `deliveryMethod` | 发货方式 | 快递/物流等 |
| `--tag-manage` / `tagManage` | 发货方式（实际: SKU标签） | — |
| `--invoice-method` / `invoiceMethod` | 发票类型 | 一单一开/累计开票 |

---

## 数据删除与关联清理

| 操作 | 关联清理内容 |
|------|-------------|
| 删除品牌 | 供应商-品牌绑定、SPU-品牌绑定、品牌-分类绑定 |
| 删除供应商 | 供应商-品牌绑定、供应商-分类绑定 |
| 删除 SPU | SPU-规格绑定、SKU、SKU-规格值绑定、属性绑定 |

删除操作均为硬删除（直接从数据库删除），供应商、品牌、产品均不使用软删除。
