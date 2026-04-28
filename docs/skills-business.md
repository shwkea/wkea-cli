
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

### 创建 SPU

```bash
wkea-manage-cli product spu create --name <SPU名称> --brand-id <品牌ID> --category-id <分类ID>
```

### 产品创建两种模式：变型 vs 具体 SKU

**核心原则：规格和 SKU 是两种不同的数据层次。只需确认手上有什么数据，不要做多余操作。**

| 场景 | 判断依据 | 做法 |
|------|---------|------|
| 变型 | 只有规格数据，没有具体型号/价格 | 创建 SPU → 添加规格和规格值 → **结束. 不需要创建 SKU** |
| 具体 SKU | 有具体型号 + 价格/库存/名称等详细数据 | 用 `quick-create` 一次性创建 SPU + SKU |

**🚫 常见错误：规格数据写完后，又去手动创建 SKU**

这是最常见的错误，**必须禁止**：

- 规格添加完成后，系统会自动组合生成所有 `4×3×7×2×2` 种 SKU 型号和记录
- **不要自己写脚本去循环组合规格值逐一创建 SKU**——系统已经自动做了
- 不要在变型模式下调用 `product sku create` 或 `product sku spec-values set`
- 变型模式的终点就是规格添加完成 + ES 刷新，没有后续步骤

**变型模式（只有规格数据）**：

步骤：
1. 创建 SPU
2. 添加规格和规格值（规格值必须填写 tag）
3. 调用 ES 刷新
4. ✅ **完成。SKU 由系统自动组合生成，不要在创建规格后再手动创建 SKU**

```bash
# 添加规格（含规格值）
wkea-manage-cli product spec add --spu-id <SPU ID> --name <规格名> --tag <标签> \
  --param '[{"name":"规格值名","tag":"型号码","sort":1}]'

# 刷新 ES 搜索数据
curl -X POST /api/manageV2/spu/es/refresh \
  -H "token: <token>" \
  -H "Content-Type: application/json" \
  -d '["<SPU ID>"]'
```

**具体 SKU 模式（有具体型号+价格等详细数据）**：

通过 `quick-create` 一次性创建 SPU + SKU：

```bash
wkea-manage-cli product quick-create --spu-name <SPU名称> -s '<sku1>' -s '<sku2>'
```

| `-s` 字段 | 必填 | 说明 |
|-----------|------|------|
| name | 是 | SKU 名称 |
| specs | 否 | 自动创建规格，格式 `{"规格名":["值1","值2"]}` |
| attributes | 否 | SKU 级属性，格式 `[{"name":"属性名","value":"属性值"}]` |
| paramIds | 否 | 已有规格参数 ID（直接复用，不自动创建） |
| salesPrice | 否 | 售价（具体 SKU 才有意义） |
| purchasePrice | 否 | 采购价 |
| stock | 否 | 库存 |
| isShelf | 否 | 是否上架 |
| unit | 否 | 单位 ID（参考 enum --type 单位） |
| remark | 否 | 备注 |
| model | 否 | 型号 |

**何时需要刷新 ES：**
- 创建 SPU 后
- 添加/修改/删除规格后
- 添加/修改/删除规格值后
- `quick-create` 内部已自动刷新，无需额外调用

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
