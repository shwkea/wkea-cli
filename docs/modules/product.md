# 产品管理操作指南

> **命令参数以 `<command> --help` 为准。** 以下命令示例仅说明操作流程和命令组合方式，具体参数不要照抄，先跑 `--help` 查看完整参数列表后再执行。

## 核心概念

### SPU（产品组）
相同属性产品的集合。**命名不能含品牌名**（品牌是绑定关系），必绑品牌和分类。一个 SPU 可有多 SKU。

### SKU（最小可售卖单位）
唯一型号 + 规格组合。创建时**建议不传 `--name`**，后端自动拼 `品牌名 SPU名 型号`（空格分隔）。手写 name 容易拼错格式。

### 产品变型与配置器

当产品有多个可选规格（如颜色、尺寸、电压）时，不同规格值组合会产生不同型号，这叫**产品变型**。**关键规则：有规格选型的产品只建 1 个 SKU（代表型号），电商详情页由用户选型后动态生成实际型号。** 不需要为每个组合建 SKU。

```
SPU（定义所有规格和可选值）
  └── 1 个代表 SKU（model = 代表完整型号，绑定一组规格值）
        └── 电商详情页：用户选型 → 系统按规格定义拼出完整型号
```

维护方式：

1. 先分析型号结构，判定每个位置是**可变规格**还是**固定规格**
2. 用 `quick-create` 创建 SPU + 规格定义 + **1 个代表 SKU**

**SKU 数量规则（最重要）**：

| 产品类型 | SKU 数量 | model 填什么 |
|---------|---------|-------------|
| **有规格选型**（多规格，用户可选） | **只建 1 个** | 代表完整型号（如 AMS20X-F02-MLE-X2044） |
| **无规格**（单一型号，用户不可选） | 每个型号建 1 个 | 该型号 |

> 无规格产品若不想电商端弹选型器，`spu create` 不要设 `--buy-spec`。

### 规格建模

#### 型号分解铁律（最重要）

**型号中被分隔符（`-`、`.`、`/` 等）隔开的每一段，都必须对应一个规格。** 全部分析完后才能判断每段是可变还是固定。禁止跳过任何一段。

示例：`MRV-02-P-1` 拆为 4 段：

| 段 | 值 | 所有变型中 | → 规格类型 |
|----|----|-----------|-----------|
| 第1段 | MRV | 全部相同 | **固定规格**（is_fixed=true，name=tag=MRV） |
| 第2段 | 02 | 可选 02/03 | 可变规格（tag=02/03） |
| 第3段 | P | 可选 P/T/A/B | 可变规格（tag=P/T/A/B） |
| 第4段 | 1 | 可选 1/2/3 | 可变规格（tag=1/2/3） |
| 连接符 | `-` | — | 分隔符 |

> **错误做法**：把第1段 MRV 当成"系列名"跳过 → 最终拼出的型号缺少前缀，选型结果变成 `02-P-1` 而不是 `MRV-02-P-1`。

#### 复杂型号建模（嵌入固定字符）

当型号含**嵌入固定字符**（如 `AMSX-X2044` 的 `AMS`/`X`/`L`/`X2044`）且相邻可变规格（如 `F02`、`MLE`）时：

- **每个固定字符单独建固定规格**（name=tag=该字符）
- **相邻可变规格之间用空分隔符（null）拼接**
- 分隔符序列支持 `null`（已确认后端支持）

以 `AMSX-X2044` 为例拆 9 段：

| 段 | 值 | 规格类型 |
|----|----|---------|
| 第1段 | AMS | 固定规格 |
| 第2段 | 尺寸 | 可变规格 |
| 第3段 | X | 固定规格 |
| 第4段 | F螺纹 | 可变规格 |
| 第5段 | 口径 | 可变规格 |
| 第6段 | KM单位 | 可变规格 |
| 第7段 | L | 固定规格 |
| 第8段 | E操作 | 可变规格 |
| 第9段 | X2044 | 固定规格 |

#### 规格类型判定

```
参数参与型号拼接？
├ 是 → 规格
│   ├ 有多个可选值？ → 可变规格（is_fixed=false，用户选型时可选）
│   └ 仅一个值？ → 固定规格（is_fixed=true，选型时固定显示但不可选）
└ 否 → 属性
```

| 类型 | 影响型号？ | 参与选型？ | 创建方式 |
|------|-----------|-----------|---------|
| 可变规格 | 是 | 用户可选 | 创建规格参数值 |
| 固定规格 | 是 | 固定显示不可选 | 创建规格时设 `--is-fixed`，只能有一个值 |
| 分隔符 | 是（拼接用） | 否 | `product spu separator set` |
| 属性 | 否 | 否 | `product attribute` |

**固定规格注意**：固定规格只能有一个值，不可再添加选项（误操作会报错）。

#### 规格值 name vs tag（核心概念）

| 字段 | 用途 | 规则 |
|------|------|------|
| `name` | 前台选择器显示文本 | 用户看到的文字，可附规格参数如 `G02 (1/4″)` |
| `tag` | 拼接型号的纯代码 | **只允许型号码，不含空格/中文/单位/描述** |

**典型对照**：

| 厂商数据 | name（正确） | tag（正确） | tag（错误原因） |
|---------|-------------|-----------|----------------|
| `G02 1/4"` | `G02 (1/4″)` | `G02` | `G02 1/4"`（含空格） |
| `R 滚轮` | `R (滚轮)` | `R` | `R 滚轮`（含中文） |
| `001 0.1~1 l/min` | `001 (0.1~1 l/min)` | `001` | `001 0.1~1 l/min`（含空格/单位） |
| `红色` | `红色` | `RED` | `HongSe`（应为英文代码） |
| `20` | `20` | `20` | — |

> 自检：tag 含空格/中文/单位 → 违规。tag 应比 name 短或等长。

#### 规格建模完整流程

```
1. 分析型号结构 → 逐位置判断（有多个选项→可变规格，固定值→固定规格，连接符→分隔符）
2. product spec add --spu-id --name --tag --param '<规格值JSON>'   # 创建可变规格（V1，一步创建+绑定+加值）；管理已有规格用 V2 `product spu spec`
3. product spu spec bind       # 绑定规格到 SPU
4. product spu spec update --is-fixed   # 标记固定规格
5. product spu separator set   # 设置分隔符（-、/等连接符）
6. product spu get             # 查看完整型号结构验证
```

#### 分隔符

连接符（如 `-`、`.`、`/`）参与型号拼接但不是规格。用 `product spu separator set` 设置。分隔符列表按位置编号对应。

### 三层绑定关系

供应商 → SPU-供应商绑定 → SKU-供应信息。**必须先绑 SPU-供应商，再设 SKU 供应**。

### 替代品与停产

- SPU 级停产：`product spu update --stop-production <替代SPU_ID>`（0=停产无替代，清空=未停产）
- SKU 级替代：`product sku replace add/list/remove`，可选 `--full-replace` 标记完全替代
- 替代品不影响价格
- 停产与替代品分开管理

---

## 常用操作

### 查重（创建前必做）

```bash
product spu list --keyword <名称>       # 按 SPU 名称
product spu list --brand-id <id>         # 按品牌
product spu list --vendor-id <id>        # 按供应商
product sku list --keyword <型号>        # 按 SKU 型号
product sku list --barcode <条码>        # 按条码
product spu es-search --title <关键词>   # ES 搜索（仅线上）
```

多维度搜，一种方式没找到不等于不存在。缩短关键词、去分隔符再搜。

### 创建简单产品（无规格，单一型号）

无规格产品每个型号建 1 个 SKU：

1. `product spu create` — 创建 SPU（参数见 `--help`）
2. `product sku create` — 创建 SKU（不传 name，后端自动拼名；默认单位 469=pcs）
3. 若该型号无规格、也无需选型 → 每个型号重复第 2 步建 1 个 SKU
4. `product spu update` — 补充资料（图片、PDF、描述等）

### 创建变型产品（有规格选型 — 产品配置器）

用 `quick-create` 一步完成：SPU + 规格定义 + **1 个代表 SKU**。有事务保证，全成功或全失败。参数以 `--help` 为准，以下仅为示意。

**⚠️ 只建 1 个代表 SKU**，不要为每个规格组合建 SKU。电商详情页用户选型后自动生成完整型号。

简单格式（纯可变规格，无固定规格时使用）：
```bash
product quick-create \
  --spu-name "<名称>" --brand-id <id> --category-id <id> \
  --specs '{"颜色":["红色","蓝色"],"安装方式":["直接安装","脚座安装"]}' \
  -s '{"model":"YYG-50-R-R","specs":{"颜色":["红色"],"安装方式":["直接安装"]}}'
```

包含固定规格时，必须用 `--fullSpecs`（简单 `--specs` 格式无法表达 isFixed）。**`-s` 只传 1 个代表 SKU**：
```bash
product quick-create \
  --spu-name "模块式溢流阀 MRV 系列" --brand-id 100 --category-id 200 \
  --fullSpecs '[
    {"name":"产品代号","sort":1,"isFixed":true,"params":[{"name":"MRV","tag":"MRV","sort":1}]},
    {"name":"阀体尺寸","sort":2,"params":[{"name":"1/4″","tag":"02","sort":1},{"name":"3/8″","tag":"03","sort":2}]},
    {"name":"油口","sort":3,"params":[{"name":"P Port","tag":"P","sort":1},{"name":"T Port","tag":"T","sort":2}]}
  ]' \
  -s '{"model":"MRV-02-P","specs":{"产品代号":["MRV"],"阀体尺寸":["1/4″"],"油口":["P Port"]}}'
```
> 注意：`fullSpecs` 中 isFixed=true 的规格也必须在 `-s` 代表 SKU 里传对应规格值。
> `-s` 的代表 SKU 选哪一组规格值都行（如 MRV-02-P），电商端会以规格定义和这些规格值生成完整选型器。

`--specs` 是 SPU 级规格定义。`-s` 是每个 SKU 的型号和对应规格值。每次 `-s` 一个 SKU，多个 `-s` 传多个。

**分开创建**（已有 SPU，追加 SKU）：用 `product sku create` 或 `product sku clone`。

**quick-create 后校验分隔符**：跑 `product spu separator get --spu-id <id>` 确认型号拼接正确；拼接不对再 `product spu separator set` 修正。

### 管理规格

- `product spu spec create` — 创建新规格（参数见 `--help`）
- `product spu spec bind` — 绑定规格到 SPU
- `product spu spec update` — 更新规格（设固定规格 `--is-fixed`）
- `product spu separator set` — 设置分隔符
- `product spu spec list` — 查看规格列表
- `product spu get` — 查看完整型号结构

### 属性（Attribute）管理

**属性 = 值变了型号不变的特征**（产地、材质等），不参与型号拼接。用 `product attribute` 命令组管理（注意：是 `product attribute`，不是 `product spu attribute`）。

流程：**创建属性 → 绑定到 SPU → 设置属性值**

1. `product attribute create` — 创建属性（`--name` 前台名 + `--manage-name` 后台名）
2. `product attribute spu-bind` — 绑定属性到 SPU（`--spu-id` + `--attr-id`）
3. `product attribute spu-set` — 设置 SPU 属性值（`--spu-id` + `--attr-id` + `--value`）

### SPU 级主要字段

| 参数 | 说明 |
|------|------|
| `--name` | SPU 名称，必填，不能含品牌名 |
| `--brand-id` / `--category-id` | 品牌和分类，必填 |
| `--vendor-id` | 供应商（未传则自动绑定默认供应商"待开发"） |
| `--series` | 系列 |
| `--description` | 描述 |
| `--pdf-link` | datasheet PDF 链接（**推荐必传**，用户最关心的资料） |
| `--details` | 详情介绍（富文本） |
| `--model-remark` | 型号备注 |
| `--images` | 图片 URL，逗号分隔 |
| `--sales-deliver` | 销售交期（枚举，`enum --type 交期` 查看） |
| `--buy-spec` | 是否按规格购买 |
| `--can-be-returned` | 是否可退货 |
| `--stop-production` | 停产替代 SPU ID（0=停产无替代） |
| `--wkea-discount` / `--wkea-deliver-discount` | 维嘉折扣 |
| `--es-keyword` | ES 搜索关键词 |

### SKU 级主要字段

| 参数 | 说明 |
|------|------|
| `--model` | 型号，实际必填，不传会建出无型号 SKU |
| `--spu-id` | 所属 SPU，必填 |
| `--sales-price` | 售价（⚠️ 仅供应商正式报价时填写） |
| `--purchase-price` | 采购价（⚠️ 同上） |
| `--stock` | 库存数量 |
| `--weight` | 重量(kg) |
| `--is-shelf` | 是否上架（⚠️ 默认否，价格确认后设 true） |
| `--barcode` | 条码 |
| `--item-number` | 货号 |
| `--images` | 图片 URL，逗号分隔 |
| `--safety-stock` / `--ceiling-stock` | 库存下限/上限 |
| `--deliver` | 销售交期（枚举） |
| `--tax-rate` / `--purchase-tax-rate` | 税率（枚举） |
| `--purchase-link` | 采购链接 |
| `--life` / `--return-deadline` | 质保期/退货期限（天） |
| `--remark` / `--simple-desc` / `--position-remark` | 备注 |
| `--extra-columns` | 扩展字段 JSON |
| `--info` 对象 | 制造商型号、最小起订量/倍数、长宽高、采购交期、是否易碎、是否定制等（⚠️ `sku create` 命令不支持 `--info` 参数，仅 `quick-create` 的 `-s` 支持 info 对象；手工 `sku create` 时这些信息只能放 `--extra-columns`） |

### 设置供应信息

- `product supply bind-vendor` — SPU 绑定供应商
- `product supply set-master` — 设主供应商价格（会改写 SKU 售价，⚠️ 仅供应商正式报价后使用）。毛利率 `--gross-margin` 必填，默认取系统配置 `markup_rate`（加价率，默认 15%）；AI 可用默认值，但应让业务人员确认。
- `product supply sku set` — 设置 SKU 供应详情
- `product supply sku list` — 查看 SKU 所有供应信息

> ⚠️ 解绑 SPU-供应商会级联清空该 SPU 下所有 SKU 的供应信息，操作前先 `product supply sku list` 备份。

### 替代品管理

- `product sku replace list` / `add` / `remove` — 管理 SKU 替代关系

**维嘉替代品**：非 WKEA 品牌产品复制生成维嘉替代品时，系统自动维护 `wkeaReplaceSpu`。设置主供应商价格时，若 SKU 有完全替代品，价格会自动同步到替代品上（通过 `--wkea-discount` 控制折扣比例，默认 0.95）。

### SKU 克隆

`product sku clone` — 已有 SKU 与目标类似时快速复制。克隆复制型号、规格值、属性等基础信息（价格和库存不复制）。

---

## 数据校验

创建后立刻验证：
```bash
product spu get --spu-id <id>                # SPU 全貌
product sku get --sku-id <sku>               # SKU 详情（**检查单位是否 pcs/469**）
product sku list --spu-id <id>               # SPU 下的所有 SKU
product supply sku list --sku-id <sku>        # 供应信息
product spu spec list --spu-id <id>           # 规格绑定
```

### 缺了什么该提醒业务人员

| 缺少 | 后果 | 补全方式 |
|------|------|---------|
| 品牌 ID | SPU 无品牌归属 | `brand create` 创建品牌 |
| 分类 ID | 无法正确分类展示 | `category list --name <分类名>` 查到 ID |
| 供应商 | 无法设价格 | `vendor create` + `supply bind-vendor` |
| SKU 单位 | 后续库存/订单出错 | 工业品默认 469(pcs) |
| datasheet PDF | 用户缺少选型依据 | `product spu update --pdf-link` |
| 型号 | 创建不了 SKU | 让业务人员确认，**不能猜** |

---

## 常见错误

- **创建前不查重** → 重复创建 SPU/SKU
- **有规格产品为每个组合建 SKU** → 只需建 1 个代表 SKU，电商端选型生成实际型号（最常见错误）
- **SPU 名称含品牌名** → 品牌是绑定关系不是名称一部分
- **tag 含空格/中文/单位** → 型号拼接错误，选型器显示异常
- **固定规格创建后还加选项** → 报错，固定规格只能有一个值
- **解绑 SPU-供应商前不备份** → 级联清空供应信息无法恢复
- **ES 索引异步** → 创建后立即搜索查不到，等几秒
- **捏造数据** → 价格必须来自供应商报价，规格必须来自 datasheet。资料没写的留空或填 0
- **SKU 不传单位** → 单位为空，后续库存/订单报错
- **quick-create 失败后半成品残留** → 需清理已创建的 SPU 再重试
