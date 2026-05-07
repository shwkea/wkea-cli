## 通用原则

创建或更新任何数据时，先执行 `whoami` 获取当前登录用户信息。对于 `--manage-id`（客户经理）、`--manager-id`（经理ID）等负责人字段，一律使用 `whoami` 查到的本人 ID，**不要问用户选谁**。

---

## 附加列系统

附加列（ExtraColumns）是系统的动态扩展字段机制。每个模块可以自定义任意字段，系统自动识别类型，无需额外配置。

### 可用模块

| 模块 | CLI 上下文 | module_code |
|------|-----------|-------------|
| 供应商 | vendor | vendor |
| SPU | product spu | spu |
| SKU | product sku | sku |
| 客户 | 无 CLI | customer |
| 需求询价 | 无 CLI | demandInquiry |

### 使用格式

`--extra-columns` 参数接受 JSON，支持两种格式：

**简单格式**（自动创建 text 类型的列）：
```json
{"注册资本":"1000万","供应商等级":"A级"}
```

**扩展格式**（指定列属性）：
```json
{
  "注册资本": {
    "value": "1000万",
    "title": "注册资本(万元)",
    "type": "number",
    "decimalPlaces": 2
  },
  "成立日期": {
    "value": "2020-01-01",
    "type": "date",
    "dateFormat": "YYYY-MM-DD"
  },
  "合作评分": {
    "value": "4.5",
    "type": "number",
    "decimalPlaces": 1
  }
}
```

### 扩展格式支持的属性

| 属性 | 说明 | 适用 type |
|------|------|-----------|
| `value` | 字段值 | 全部 |
| `title` | 列显示名（默认同 key） | 全部 |
| `type` | 列类型：text / number / date / select / boolean / email / phone / link | 全部 |
| `decimalPlaces` | 小数位数 | number |
| `dateFormat` | 日期格式，如 YYYY-MM-DD | date |
| `options` | 下拉选项数组 `[{label, value}]` | select |
| `columnWidth` | 列宽（默认 120） | 全部 |
| `align` | 对齐方式：left / center / right | 全部 |

### 使用原则

1. **不存在的 key 自动创建配置** — 无需预先定义字段，AI 可以直接用任何 key
2. **扩展格式会更新已有配置** — 如果同名 key 已存在但类型不同，会用新类型覆盖
3. **已存在的 key 只配置一次** — 后续调用简单格式即可，无需重复传类型
4. **追加而非覆盖** — 只新增/更新传入的列，不影响已有列数据
5. **create/update/extra-columns save 均可操作** — 创建时直接传，或独立维护

---

## 业务概念

### 产品层级：SPU → SKU

**SPU（产品组）**

- 具有相同属性、规格的产品集合，是 SKU 的上一级
- 管理共性特征：产品说明、图片、规格绑定、属性绑定
- 示例：不同的 SPU → "iPhone 手机"、"小米手机"
- **命名规则：只能是产品名，不能包含品牌名**
  - ❌ 错误："3M 电动钻"（包含品牌名 3M）
  - ✅ 正确："电动钻"

**SKU（最小可售卖单位）**

- 具有唯一型号（model）和规格组合的最小销售单位
- 工业品的 SKU 数量容易爆炸（如 4 个规格各 10 个值 = 10000 个 SKU）
- 管理销售价、采购价、库存的单位
- **命名规则：品牌名 + 产品名 + 型号**（空格分隔）
  - ✅ 示例："3M 电动钻 3M-DRILL-600W"、"西门子 断路器 5SY4103-7"

### 规格（Spec）

- 影响 SKU 型号（model）和价格的参数，通过选择不同规格值可以生成不同的型号，这个过程叫做**选型**
- 示例：颜色、内存、硬盘、尺寸、功率、压力、口径
- **所有型号相关信息都作为规格来管理**
- 规格值必须填写 tag（型号码），用于生成 SKU 型号
- **确认是否为规格的标准：这个参数是否通过选型影响型号？** 如果厂商明确给出了选型配置表（如产品选型手册、规格配置表），其中列出的参数几乎都是规格

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
- 示例：产地、材质、保修年限、包装清单、防水等级、接口类型、检测距离
- 纯展示用，不参与型号生成

### 规格 vs 属性 — 核心判断原则

**不能仅凭感官归类，必须检查是否影响型号。** 遇到产品参数时，严格按以下步骤判断：

**第一步：看型号。** 先拿到产品型号（model），型号是确定规格的最终依据。

**第二步：检查该参数是否参与选型。** 问自己：**这个参数值变了，型号会变吗？**

- **会变 → 规格**（如：产品型号为 `iphone-13-pro-max-256g`，其中 "256g" 有 128g/256g 选项，选了不同值型号就不同 → 规格）
- **不会变 → 属性**（如：产品型号为 `1133545 WTM10L-241612D0A00ZVZZZZZZZZZ1`，而参数有"检测距离"、"接口类型（PNP/NPN）"、"防护等级（IP69/IP67）"，但这些参数不管选什么，型号始终是固定的 → 属性）

**第三步：检查是否存在选型配置。** 很多工业品会给出明确的规格选型配置表（选型手册、产品目录中的配置选项），这些选项就是规格。

**实际案例：**

| 产品信息 | 判断过程 | 结论 |
|---------|---------|------|
| 型号: `iphone-13-pro-max-256g`，参数有"存储(128g/256g/512g)" | 选了不同存储，型号会变 | **规格** |
| 型号: `1133545 WTM10L-...`，参数有"检测距离(25-400mm)"、"接口类型(PNP/NPN)"、"防护等级(IP69/IP67)"、"IO-LINK" | 不管怎么选这些参数，型号始终是固定的 | **属性** |
| 产品选型手册中有"功率(1.5kW/2.2kW/3.7kW)"、"压力(0.6MPa/1.0MPa)" | 选型配置表中的参数，不同选项产生不同型号 | **规格** |

---

## 供应商管理

对应命令模块：`wkea-manage-cli vendor`，包含 create、get、update、delete、list、联系人和品牌管理、优势分类等子命令。用 `vendor --help` 查看完整列表，子命令用 `vendor <command> --help` 查看参数。

### 供应商保存完整流程

保存供应商需要按顺序完成以下步骤，缺一不可，否则数据不完整。

### 步骤一：基础信息

创建供应商时，必填字段中部分使用枚举值，需通过枚举命令查看可用值：

- **供应商类型** — 原厂/授权经销商/品牌方/总代理/其他
- **收款方式** — 银行转账/支付宝/微信
- **结算方式** — 现款/月结
- **付款期限** — 现款提货/货到 X 天/票到 X 天/款到发货
- **币种**

每个枚举参数的值通过 `wkea-manage-cli enum --type <枚举组名>` 查询。枚举组名在 `--help` 中有标注。

创建时只需传供应商名称即可，其余字段可先填默认值。

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

对应命令模块：`wkea-manage-cli brand`，包含 create、get、update、delete、list 等子命令。用 `brand --help` 查看完整列表。

品牌在系统中独立存在，供应商与品牌是多对多关系。删除品牌时会清理：供应商-品牌关联、SPU-品牌关联、品牌-分类关联。

---

## 产品管理

对应命令模块：`wkea-manage-cli product`，包含 product spu、product sku、product spec、product attribute、product supply、product quick-create 等子模块。各子模块下还有 get/create/update/delete 等子命令。用 `product --help` 查看完整列表，子命令用 `product <sub> --help` 查看参数。

### 推荐：quick-create（首选）

`quick-create` 是创建产品的首选方式，能一次性完成 SPU + 规格 + 品牌绑定 + SKU 的创建。

使用场景有两种：

1. **变型模式** — 只创建 SPU 和规格，不创建具体 SKU。传入规格 JSON，格式支持简单对象或完整数组（含 tag 型号码）。
2. **具体 SKU 模式** — 同时创建有具体型号/价格/库存的 SKU。

注意：创建完成后系统自动刷新 ES，无需额外调用。

### 备选：分步创建

当需要逐步创建、或在已有 SPU 上补充字段时，可以使用分步方式（spu create → spec add → sku create）。相比 `quick-create` 更灵活但步骤多。

### 变型模式使用场景

如果只有规格数据没有具体 SKU 数据，用变型模式即可。完整规格 JSON（含 tag）已支持一步创建，不需要分步调用。

### 供应信息

供应信息管理 SKU 与供应商、价格之间的关系。包含：
- SPU 与供应商的绑定
- SKU 的供应价格和库存设置
- 供应汇总查询

---

## 需求询价管理

对应命令模块：`wkea-manage-cli demand`，包含 create、get、update、delete、list、pending、claim、auto-quote、process、simple-create-product、quote-to-vendor、vendors-by-brand 以及行项目管理（items/add-item/update-item/delete-item/complete-item）等子命令。用 `demand --help` 查看完整列表，子命令用 `demand <command> --help` 查看参数。

需求询价模块处理客户提交的采购需求。AI 全流程为：

1. 查看待处理的未分配需求（manage_id 为空的）
2. 领取需求（原子操作，防止并发抢单）
3. 获取需求详情和行项目
4. ES 搜索匹配系统产品，找到后绑定 SKU 到行项目
5. 如果品牌没有绑定供应商，先绑定供应商到品牌
6. 向供应商询价（自动按品牌分组查供应商并发起询价）

### 核心业务流程

- **查看待处理**：列出 manage_id 为空的需求
- **领取**：设置当前用户为负责人（原子性 UPDATE，防止并发）
- **详情**：查看需求基本信息 + 行项目列表
- **ES 搜索**：通过产品名称/型号搜索系统已有产品，绑定 SKU 到行项目
- **按品牌询价**：系统自动按行项目的品牌分组，查找各品牌的绑定供应商，批量发起询价

**注意**：ES 搜索仅在线上环境可用，开发环境（本地）会返回 500。

### 持续轮询

AI 应持续监听是否有新的未处理需求。每 60 秒轮询一次 pending 列表，发现有未领取的需求时自动领取并处理。如果当前没有待处理需求，继续等待下一个轮询周期。

### 附加列支持

需求询价模块支持附加列（ExtraColumns），可在需求级别和行项目级别添加自定义字段。

---

---
## 报价单管理

对应命令模块：`wkea-manage-cli quotation`，包含 create、get、add-item、remove-item、share 等子命令。用 `quotation --help` 查看完整列表，子命令用 `quotation <command> --help` 查看参数。

报价单是独立的分享报价模块，可从需求询价生成或在 AI 的辅助下独立创建，用于向客户展示产品报价清单。

### 适用场景

1. **需求询价完成后生成** — 通过 `demand share-order` 从已报价的需求一键生成报价单
2. **AI 独立创建** — 直接通过 `quotation create` 创建空的报价单，再调用 `add-item` 添加产品
3. **编辑管理** — 创建后可增删产品、修改产品、排序
4. **分享** — 生成短链接+复制文案，发送给客户微信查看

### 核心业务流程

- **创建报价单**：传入产品 JSON 数组（含 SKU、数量、单位），返回 shareId（雪花ID）
- **查看产品列表**：根据 shareId 查看报价单内的所有产品，含品牌、图片、价格等
- **添加产品**：向已有报价单追加产品
- **删除产品**：从报价单中移除指定产品
- **修改产品**：更新数量、单位、备注等（通过 API 直接调用）
- **修改备注**：单独更新某个产品的备注（通过 API 直接调用）
- **排序**：调整产品显示顺序（通过 API 直接调用）
- **分享报价单**：生成分享 URL + 短链 + 复制文案，支持传入 topic 自定义主题名（不传则取第一个产品名）

### 分享文案格式

```
你好,请查看{topic}产品报价单,有疑问随时联系,谢谢。链接: {shortUrl}
```

### 操作示例

```bash
# 创建报价单
wkea-manage-cli quotation create --items '[{"sku":"W000000001","quantity":2,"unit":20,"selected":true}]'

# 查看报价单产品
wkee-manage-cli quotation get --share-id <shareId>

# 添加产品
wkea-manage-cli quotation add-item --share-id <shareId> --items '[{"sku":"W000000029","quantity":3,"unit":32,"selected":true}]'

# 删除产品
wkea-manage-cli quotation remove-item --share-id <shareId> --item-id <itemId>

# 分享报价单
wkea-manage-cli quotation share --share-id <shareId> [--topic "交货期报价"]
```

---

## 销售订单管理

对应命令模块：`wkea-manage-cli sales-order`，包含 create、list、get、delete、cancel、confirm、confirm-payment、create-ship-order、ship、back-order、deliveries、outbound-orders 等子命令。用 `sales-order --help` 查看完整列表。

销售订单管理后台创建的线下订单，包含订单全生命周期的核心操作。

### 订单状态流转

```
创建 → 确认（审核）→ 确认付款 → 创建发货单 → 发货 → 回库
  ↓        ↓
取消      删除
```

### 订单状态枚举

| 状态码 | 含义 |
|--------|------|
| 109 | 已取消 |
| 110 | 待审核 |
| 111 | 待付款 |
| 112 | 待发货 |
| 113 | 已发货 |
| 114 | 已完成 |
| 115 | 已确认 |
| 219 | 售后中 |

### 核心业务流程

- **创建订单**：复用 V1 CreateOrderDto，含客户信息、收货信息、行项目、配送方式、支付方式等
- **列表查询**：支持按订单ID、客户名称、负责人、SKU、订单状态、时间范围等筛选，V2 标准 pageNum/pageSize 分页
- **订单详情**：查看完整订单信息，含行项目、品牌、图片、价格、供应商信息
- **确认订单（审核）**：状态从"待审核"→"已确认"
- **确认付款**：记录付款时间和支付方式
- **创建发货单**：从订单行项目选择库存发出，支持自动拆分包装
- **发货**：录入物流公司和运单号
- **回库**：已发货订单的产品退回仓库
- **删除订单**：仅可删除已取消的订单

### 查询子列表

- **发货单列表**：查看订单的所有发货记录（含物流公司、运单号、状态）
- **出库单列表**：查看订单的所有出库记录

### 订单跳转链接

后台详情页面：`{manageMainUrl}#/main/order-details/{orderId}`

### 发货物流

`sales-order ship` 发货时支持两种方式指定物流公司：

1. **物流公司ID**（推荐）：`--logistics-company-id 57`
2. **物流公司名称**：`--logistics-company 顺丰快递`

常用物流公司映射：
| 名称 | ID |
|------|----|
| 顺丰快递 | 57 |
| 德邦快递（默认） | 58 |
| 安能物流 | 59 |
| 货拉拉物流 | 60 |

配送方式枚举通过 `enum --type 配送方式` 查询。

---

## 销售合同管理

对应命令模块：`wkea-manage-cli sales-contract`，包含 create、list、get、update、delete、transfer-order 等子命令。用 `sales-contract --help` 查看完整列表。

### 销售合同转订单

`sales-contract transfer-order` 将签署完成的销售合同转为销售订单。

必传参数：
- `--id` 合同ID
- `--manage-id` 负责人ID
- `--distribution-mode` 配送方式（118=整单发货 119=有货先发 403=堂食）
- `--pay-type` 支付方式
- `--items <json>` 行项目 JSON

可选参数：
- `--customer-freight` 客户运费（默认0）
- `--has-freight` 是否含运（默认否）

配送方式枚举通过 `enum --type 配送方式` 查询，支付方式通过 `enum --type 支付方式` 查询。

---

## 库存管理

对应命令模块：`wkea-manage-cli stock`，包含 list、add、modify、delete、switch-unit、automatic-splitting、expired、over-60-days、move-expired、move-over-60-days、buy-info、warehouses、add-warehouse、delete-warehouse、sku-exist 等子命令。用 `stock --help` 查看完整列表。

库存管理系统中的产品库存和仓库信息。一个库存记录包含：SKU、仓库、数量、库位号、单位、生产日期/批次、保质期、购买日期。

### 核心概念

- **库存记录**：SKU + 仓库 + 库位号 唯一确定一条库存记录
- **默认仓库**：所有库存默认存到 **临时仓库**（仓库列表中的"临时仓库"），**不需要询问用户入到哪个仓库**
- **拆分包装**：将一个大包装拆分成多个小包装（如 1箱→10个）
- **自动拆分**：系统自动按目标单位拆分库存
- **临期管理**：跟踪产品保质期，临期产品可转移到专有库位
- **库龄管理**：超过 60 天的库存可转移到折扣单位处理

### 库存 CRUD

```bash
# 列表查询（支持分页 + SKU/仓库/库位/SPU/名称筛选）
POST /api/manageV2/business/stock/list
# 请求体：{"pageNum":1,"pageSize":20,"sku":"W000000001","warehouseId":10}

# 新增库存（仓库 ID 通过 GET /stock/warehouses 查询 name="临时仓库" 的记录获取）
POST /api/manageV2/business/stock
# 请求体：{"warehoseId":<临时仓库的ID>,"productSkuId":"W000000001","stock":5,"location":"A1","skuUnit":20}

# 修改库存
PUT /api/manageV2/business/stock
# 请求体：{"id":335,"stock":99,"location":"a-1"}

# 删除库存
DELETE /api/manageV2/business/stock/{id}
```

### 库存业务操作

- **拆分包装**：将库存从大单位拆为小单位（传入 stockId、原单位数量、新单位和新数量）
- **自动拆分**：传入需要发出的数量，系统自动寻找合适库存拆分
- **快过期产品列表**：查看所有即将过期的产品
- **超 60 天产品列表**：查看库龄超过 60 天的产品
- **转移临期库存**：将临期库存转移到临期库位
- **转移超 60 天库存**：将超 60 天库存转移到折扣库位
- **产品交易信息**：查看 SKU 的买入/卖出统计

### 仓库管理

```bash
# 仓库列表
GET /api/manageV2/business/stock/warehouses?name=临时

# 仓库详情
GET /api/manageV2/business/stock/warehouses/{id}

# 新增/修改仓库
POST /api/manageV2/business/stock/warehouses
# 请求体：{"name":"主仓库","type":1,"status":1}

# 删除仓库
DELETE /api/manageV2/business/stock/warehouses/{id}

# SKU存在库存查询
GET /api/manageV2/business/stock/sku-exist/{sku}
```

### 库存跳转链接

后台库存页面：`{manageMainUrl}#/main/product-stock`

---

## 枚举参数

各命令中需要传枚举值的参数，用 `wkea-manage-cli enum --type <枚举组名>` 查看可用值。枚举组名在命令的 `--help` 中有标注。

常用枚举类别：
- 供应商：供应商类型、收款方式、结款方式、付款期限、币种
- 产品：单位、税率、交期、发货方式
- 需求：需求状态（274待处理/275处理中/276已完成）

---

## 数据删除与关联清理

| 操作 | 关联清理内容 |
|------|-------------|
| 删除品牌 | 供应商-品牌绑定、SPU-品牌绑定、品牌-分类绑定 |
| 删除供应商 | 供应商-品牌绑定、供应商-分类绑定 |
| 删除 SPU | SPU-规格绑定、SKU、SKU-规格值绑定、属性绑定 |

删除操作均为硬删除（直接从数据库删除），供应商、品牌、产品均不使用软删除。
