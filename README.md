# wkea-manage-cli

WKEA 后台管理 CLI 工具，用于操作 WKEA 后台管理系统的 API。

## 安装

```bash
npm install -g wkea-manage-cli
```

## 初始化

```bash
wkea-manage-cli init   # 引导配置 API 地址和登录凭证
wkea-manage-cli reset  # 重置并重新配置
```

## 快速使用

```bash
wkea-manage-cli --help              # 全局帮助
wkea-manage-cli skills              # AI 工具说明（重要，安装后必读）
wkea-manage-cli enum                # 枚举值说明
wkea-manage-cli version             # 版本
wkea-manage-cli update              # 更新
```

---

## 模块总览

| 模块 | 说明 |
|------|------|
| `brand` | 品牌管理 |
| `vendor` | 供应商管理 |
| `product` | 产品管理（SPU + SKU + 规格 + 属性 + 供应） |

---

## product 产品模块

```
wkea-manage-cli product <subcommand>
```

### SPU（产品组）

SPU 是具有相同属性、规格的产品集合，是 SKU 的上一级。

| 命令 | 说明 |
|------|------|
| `product spu create` | 创建 SPU |
| `product spu get` | 查询 SPU 详情（含品牌、分类、规格、SKU） |
| `product spu list` | SPU 列表 |
| `product spu update` | 更新 SPU 名称 |
| `product spu delete` | 删除 SPU（逻辑删除） |
| `product spu bind-brand` | SPU 绑定品牌 |
| `product spu unbind-brand` | SPU 解绑品牌 |
| `product spu brands` | 查询 SPU 绑定的品牌 |
| `product spu bind-category` | SPU 绑定分类 |
| `product spu unbind-category` | SPU 解绑分类 |
| `product spu categories` | 查询 SPU 绑定的分类 |
| `product spu extra-columns get` | 查询 SPU 扩展字段 |
| `product spu extra-columns set` | 设置 SPU 扩展字段 |

**示例**：

```bash
# 创建 SPU
wkea-manage-cli product spu create --name "Apple iPhone 16 Pro Max" --brand-id 5086

# 查询详情（含规格和 SKU）
wkea-manage-cli product spu get --spu-id WK153427

# 绑定品牌
wkea-manage-cli product spu bind-brand --spu-id WK153427 --brand-id 5086
```

### SKU（最小可售卖单位）

SKU 是 SPU 下的具体可售卖产品，拥有唯一的型号和规格组合。

| 命令 | 说明 |
|------|------|
| `product sku get` | 查询 SKU 详情（含规格值、供应商、扩展字段） |
| `product sku list` | SKU 列表（支持按 SPU 筛选或全局搜索） |
| `product sku create` | 创建 SKU（单个） |
| `product sku update` | 更新 SKU |
| `product sku delete` | 删除 SKU |
| `product sku clone` | 克隆 SKU |
| `product sku spec-values get` | 查询 SKU 关联的规格值 |
| `product sku spec-values set` | 设置 SKU 规格值 |
| `product sku extra-columns get` | 查询 SKU 扩展字段 |
| `product sku extra-columns set` | 设置 SKU 扩展字段 |

**示例**：

```bash
# 查询 SPU 下的所有 SKU
wkea-manage-cli product sku list --spu-id WK153427

# 创建 SKU
wkea-manage-cli product sku create --spu-id WK153427 --name "iPhone 黑色 128GB" --price 9999

# 查询 SKU 详情
wkea-manage-cli product sku get --sku-id W001083650
```

### 规格（Spec）

规格是**影响 SKU 型号和价格**的参数，如颜色、存储容量、尺寸、功率。

> **规格 vs 属性**：规格参与型号拼接（如"黑色"变成型号中的"BLK"），属性只用于展示（如产地、材质）。

| 命令 | 说明 |
|------|------|
| `product spec list` | 查询 SPU 关联的规格列表及规格值 |
| `product spec add` | 添加规格并绑定到 SPU（可同时添加规格值） |
| `product spec unbind` | 将规格从 SPU 解绑 |
| `product spec param list` | 查询某规格下的规格值列表 |
| `product spec param add` | 为规格添加规格值 |

**示例**：

```bash
# 查询 SPU 的规格列表
wkea-manage-cli product spec list --spu-id WK153427

# 添加规格（含规格值）
wkea-manage-cli product spec add \
  --spu-id WK153427 \
  --name "颜色" \
  --tag "COLOR" \
  --param '[{"name":"黑色","tag":"BLK"},{"name":"白色","tag":"WHT"}]'

# 为规格添加规格值
wkea-manage-cli product spec param add \
  --spec-id 104558 \
  --name "128GB" \
  --tag "128"
```

### 属性（Attribute）

属性是**不影响 SKU 型号**的描述性参数，如产地、材质、保修年限。

| 命令 | 说明 |
|------|------|
| `product attribute list` | 属性列表（分页） |
| `product attribute create` | 新增属性 |
| `product attribute update` | 修改属性 |
| `product attribute delete` | 删除属性 |
| `product attribute spu-list` | 查询 SPU 绑定的属性 |
| `product attribute spu-bind` | SPU 绑定属性 |
| `product attribute spu-values` | 查询 SPU 属性值 |
| `product attribute spu-set` | 更新 SPU 属性值 |
| `product attribute sku-list` | 查询 SKU 属性值（含 SPU 级继承覆盖） |
| `product attribute sku-set` | 更新 SKU 属性值 |

**示例**：

```bash
# 查询 SPU 的属性
wkea-manage-cli product attribute spu-list --spu-id WK153427

# SPU 绑定属性
wkea-manage-cli product attribute spu-bind --spu-id WK153427 --attr-id 123
```

### 供应（Supply）

供应是 SKU 与供应商之间的价格、库存、订货号等信息。

| 命令 | 说明 |
|------|------|
| `product supply bind-vendor` | SPU 绑定供应商 |
| `product supply unbind-vendor` | SPU 解绑供应商 |
| `product supply vendors` | 查询 SPU 绑定的供应商列表 |
| `product supply supply-list` | 查询 SPU 的供应列表（含供应商+SKU 供应信息） |
| `product supply sku set` | 设置 SKU 供应信息 |
| `product supply sku list` | 查询 SKU 的供应信息列表 |
| `product supply sku get` | 获取 SKU 指定供应商的供应信息 |
| `product supply sku delete` | 删除 SKU 供应信息 |
| `product supply sku batch` | 批量设置 SKU 供应信息 |
| `product supply sku summary` | 获取 SKU 供应汇总信息 |

**示例**：

```bash
# SPU 绑定供应商
wkea-manage-cli product supply bind-vendor --spu-id WK153427 --vendor-id V001

# 设置 SKU 供应信息
wkea-manage-cli product supply sku set \
  --sku-id W001083650 \
  --vendor-id V001 \
  --sales-price 9999 \
  --purchase-price 8000 \
  --stock 100
```

### 快捷创建

快速创建 SPU + SKU，支持笛卡尔积批量生成。

```bash
wkea-manage-cli product quick-create \
  --spu-name "测试产品" \
  --sku-name "测试SKU" \
  --param-ids "604776,604780"
```

> **笛卡尔积说明**：传入 `--param-ids` 时，根据规格值组合生成所有 SKU。例如 2 个规格各 4 个规格值 → 生成 16 个 SKU。

---

## 枚举值说明

部分字段使用枚举 ID，需通过以下命令查看含义：

```bash
wkea-manage-cli enum
```

常见枚举：

| 枚举 ID | 含义 |
|---------|------|
| relation:16 | 销售税率 |
| relation:19 | 产品单位 |
| relation:56 | 发货方式 |
| relation:61 | 交期类型 |
| relation:100 | 分隔符 |
| relation:208 | 产品价值标签 |
| relation:224 | 相关产品类型 |
| relation:241 | SKU 标签 |

---

## AI 安装

复制以下内容给 AI：

```markdown
给我用 npm 全局安装一下 wkea-manage-cli
安装完成后，请运行以下命令，参考输出内容创建一个本工具的专属 skills，名字就叫：WKEA 后台技能
wkea-manage-cli skills
安装后初始化：
wkea-manage-cli init
```
