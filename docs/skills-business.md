
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

```bash
wkea-manage-cli vendor create --name <供应商名称> --manage-id <客户经理ID>
# 创建后记录返回的 vendorId
wkea-manage-cli vendor update --vendor-id <vendorId> --contact <联系人> --phone <电话> --address <地址> ...
```

### 步骤二：联系人

```bash
wkea-manage-cli vendor contact-add --vendor-id <vendorId> --name <姓名> --phone <电话> --email <邮箱>
# 每个联系人单独调用，添加后用 contact-list 验证
wkea-manage-cli vendor contact-list --vendor-id <vendorId>
```

**注意：联系人不能通过 vendor create/update 一起保存，必须单独调用 contact-add。**

### 步骤三：绑定品牌

绑定品牌的含义：将品牌与供应商建立关联关系，关联后该供应商可以管理/销售这些品牌的产品。

```bash
# 先搜索品牌获取品牌ID
wkea-manage-cli brand list --keyword <品牌名>
# 绑定（增量绑定，已绑定的自动跳过）
wkea-manage-cli vendor bind-brands --vendor-id <vendorId> --brand-ids <1,2,3>
```

### 步骤四：绑定分类

绑定分类的含义：将产品分类与供应商建立关联关系，标识供应商的经营范围。

```bash
wkea-manage-cli vendor bind-categories --vendor-id <vendorId> --category-ids <1,2,3>
```

### 步骤五：优势分类（可选）

标识供应商的核心业务领域，用于供应商排序和推荐。

```bash
wkea-manage-cli vendor superior-category add --vendor-id <vendorId> --name <优势分类名> --priority <优先级>
```

### 查询供应商完整信息

```bash
wkea-manage-cli vendor get --vendor-id <vendorId>         # 基础信息
wkea-manage-cli vendor brands --vendor-id <vendorId>     # 绑定的品牌
wkea-manage-cli vendor categories --vendor-id <vendorId> # 绑定的分类
wkea-manage-cli vendor contact-list --vendor-id <vendorId> # 联系人列表
wkea-manage-cli vendor superior-category list --vendor-id <vendorId> # 优势分类
wkea-manage-cli vendor extra-columns --vendor-id <vendorId> # 扩展字段
```

### 删除供应商

删除前会清理所有关联数据（品牌绑定、分类绑定等）。

```bash
# 1. 先查询
wkea-manage-cli vendor get --vendor-id <vendorId>
wkea-manage-cli vendor brands --vendor-id <vendorId>
wkea-manage-cli vendor categories --vendor-id <vendorId>
wkea-manage-cli vendor contact-list --vendor-id <vendorId>

# 2. 展示结果，问用户确认
# 3. 用户确认后执行
wkea-manage-cli vendor delete --vendor-id <vendorId>
```

### 供应商合并

将来源供应商的所有数据合并到目标供应商：

```bash
wkea-manage-cli vendor merge --from-id <来源ID> --to-id <目标ID> --operator <操作人>
```

---

## 品牌管理

品牌在系统中独立存在，供应商与品牌是多对多关系。

```bash
wkea-manage-cli brand list --keyword <关键词>  # 搜索品牌（获取品牌ID）
wkea-manage-cli brand get --brand-id <ID>      # 品牌详情
wkea-manage-cli brand create --name <名称>   # 创建品牌
wkea-manage-cli brand update --brand-id <ID> --name <新名称> # 更新
wkea-manage-cli brand delete --brand-id <ID> # 删除（会清理关联）
```

删除品牌时会清理：供应商-品牌关联、SPU-品牌关联、品牌-分类关联。

---

## 产品管理

### 创建产品：`product quick-create`（首选）

**`quick-create` 是创建产品的首选命令**，能一次性完成 SPU + 规格 + 品牌绑定 + SKU 的创建。
SKU 是可选的——不传 `-s` 就只创建 SPU 和规格，传入 `-s` 则同时创建具体 SKU。

**不传 SKU（变型模式——只有规格，不创建具体 SKU）：**

Specs 格式支持两种输入方式：

**方式 1：简单规格（JSON 对象）** — 适合不需要 tag 的场景：
```bash
wkea-manage-cli product quick-create \
  --spu-name "AMS20X/30X/40X/60X-X2044 系列 压缩空气管理系统" \
  --brand-id 6632 \
  --series "AMSX-X2044" \
  --description "压缩空气管理系统 IO-Link通信对应" \
  --specs '{"颜色":["红色","蓝色","黑色"],"尺寸":["10寸","12寸"]}'
```

**方式 2：完整规格（JSON 数组，含 tag/sort/isFixed）** — 适合需要 tag 型号码生成 SKU 型号的场景：
```bash
wkea-manage-cli product quick-create \
  --spu-name "AMS20X/30X/40X/60X-X2044 系列 压缩空气管理系统" \
  --brand-id 6632 \
  --specs '[{"name":"主体尺寸","sort":1,"params":[{"name":"20","tag":"20","sort":1},{"name":"30","tag":"30","sort":2}]},{"name":"螺纹种类","sort":2,"params":[{"name":"F(G)","tag":"F","sort":1},{"name":"N(NPT)","tag":"N","sort":2}]}]'
```

完整规格 `fullSpecs` 每个字段说明：

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

```bash
# 一次性创建 SPU + 规格 + 具体 SKU
wkea-manage-cli product quick-create \
  --spu-name "液压缸系列" \
  --brand-id 123 \
  --category-id 456 \
  --vendor-id S00001 \
  -s '{"name":"液压缸-50mm","specs":{"材质":["不锈钢","碳钢"]},"salesPrice":100,"stock":50}' \
  -s '{"name":"液压缸-100mm","specs":{"材质":["不锈钢","碳钢"]},"salesPrice":200,"stock":30}'
```

| `quick-create` 选项 | 说明 |
|---------------------|------|
| `--spu-name <name>` | **必填** SPU 名称 |
| `--spu-id <id>` | 已有 SPU ID（传此则复用，只创建 SKU/规格） |
| `--brand-id <id>` | 品牌 ID |
| `--brand-name <name>` | 品牌名称（`--brand-id` 优先） |
| `--brand-ids <ids>` | 品牌 ID 列表，逗号分隔 |
| `--category-id <id>` | 分类 ID |
| `--category-name <name>` | 分类名称（`--category-id` 优先） |
| `--vendor-id <id>` | 供应商 ID |
| `--vendor-name <name>` | 供应商名称（`--vendor-id` 优先） |
| `--series <series>` | 系列 |
| `--tag <tag>` | 产品标签（生成型号用） |
| `--manager-id <id>` | 经理 ID |
| `--description <text>` | SPU 描述 |
| `--category-show <show>` | 分类层级展示 |
| `--can-be-returned` | 是否可退货 |
| `--buy-spec` | 是否按规格购买 |
| `--stop-production <status>` | 停产后替代系列 |
| `--specs <json>` | SPU 级规格 JSON。JSON 对象=简单规格 `{...}`，JSON 数组=完整规格含 tag `[{...}]`（详见上方完整规格说明） |
| `--images <urls>` | 图片 URL，逗号分隔 |
| `--pdf-link <url>` | PDF 链接 |
| `--details <text>` | 详情介绍（富文本） |
| `--model-remark <remark>` | 产品选型备注 |
| `--sales-deliver <num>` | 销售交期 |
| `--es-keyword <keyword>` | ES 搜索关键词 |
| `-s --sku <json>` | SKU 数据（可多次传）。详见下方 `-s` 字段表 |

**`-s` 字段说明：**

| 字段 | 必填 | 说明 |
|------|------|------|
| name | 是 | SKU 名称 |
| specs | 否 | 自动创建规格，格式 `{"规格名":["值1","值2"]}` |
| attributes | 否 | SKU 级属性，格式 `[{"name":"属性名","value":"属性值"}]` |
| paramIds | 否 | 已有规格参数 ID（直接复用，不自动创建） |
| salesPrice | 否 | 售价 |
| purchasePrice | 否 | 采购价 |
| stock | 否 | 库存 |
| isShelf | 否 | 是否上架 |
| unit | 否 | 单位 ID |
| remark | 否 | 备注 |
| model | 否 | 型号 |

**注意：** `quick-create` 内部已自动刷新 ES，无需额外调用。

### 变型模式（仅规格，不创建具体 SKU）

如果只有规格数据没有具体 SKU 数据，用 `quick-create --specs` 即可，**不要走下面的分步流程**。
**完整规格 JSON（含 tag）已支持一步创建**，不再需要分步调用 spec add：

```bash
# 一步完成：创建 SPU + 完整规格（含 tag）
wkea-manage-cli product quick-create \
  --spu-name "AMS20X/30X/40X/60X-X2044 系列 压缩空气管理系统" \
  --brand-id 6632 \
  --specs '[{"name":"主体尺寸","sort":1,"params":[{"name":"20","tag":"20","sort":1},{"name":"30","tag":"30","sort":2}]}]'
```

仅当需要补充规格到已有 SPU 时才需要分步：

```bash
# 补充规格到已有 SPU
wkea-manage-cli product spec add --spu-id <SPU ID> --name <规格名> --tag <标签> \
  --param '[{"name":"规格值名","tag":"型号码","sort":1}]'

# 刷新 ES
curl -X POST /api/manageV2/spu/es/refresh \
  -H "token: <token>" \
  -H "Content-Type: application/json" \
  -d '["<SPU ID>"]'
```

### 备选：`product spu create`（分步创建）

当需要逐步创建、或在已有 SPU 上补充字段时使用：

```bash
wkea-manage-cli product spu create --name <SPU名称> --brand-id <品牌ID> --category-id <分类ID>
```

相比于 `quick-create`，缺少规格/SKU 自动创建能力，适合已有 SPU 的补充编辑场景。

### 规格管理

规格值必须填写 tag（型号码），否则 SKU 型号拼接不正确。

```bash
# 查询 SPU 的规格列表
wkea-manage-cli product spec list --spu-id <SPU ID>

# 查询某规格下的规格值
wkea-manage-cli product spec param list --spec-id <规格 ID>
```

### 供应信息（SKU + 供应商 + 价格）

```bash
# SPU 绑定供应商
wkea-manage-cli product supply bind-vendor --spu-id <SPU ID> --vendor-id <供应商ID>

# 设置 SKU 供应信息
wkea-manage-cli product supply sku set --sku-id <SKU ID> --vendor-id <供应商ID> \
  --sales-price <售价> --purchase-price <采购价> --stock <库存>

# 查询 SPU 的所有供应
wkea-manage-cli product supply supply-list --spu-id <SPU ID>

# 查询 SKU 的供应汇总
wkea-manage-cli product supply sku summary --sku-id <SKU ID>
```

---

## 数据删除与关联清理

| 操作 | 关联清理内容 |
|------|-------------|
| 删除品牌 | 供应商-品牌绑定、SPU-品牌绑定、品牌-分类绑定 |
| 删除供应商 | 供应商-品牌绑定、供应商-分类绑定 |
| 删除 SPU | SPU-规格绑定、SKU、SKU-规格值绑定、属性绑定 |

删除操作均为硬删除（直接从数据库删除），供应商、品牌、产品均不使用软删除。
