# 产品管理操作指南

## 核心概念

### SPU（产品组）
相同属性的产品集合。一个 SPU 下可有多个 SKU（不同型号/规格组合）。
- **命名**：不能包含品牌名（品牌是绑定关系）
- **必绑**：品牌、分类

### SKU（最小可售卖单位）
唯一型号 + 规格组合。**创建时建议不传 `--name`**，后端自动拼 `品牌名 SPU名 型号`。

### 规格 vs 属性
| 类型 | 影响型号？ | 示例 |
|------|-----------|------|
| 规格 | 是 | 主体尺寸、螺纹种类 |
| 分隔符 | 是（拼接用） | `-`、`.` |
| 属性 | 否 | 产地、材质、保修年限 |

判定：**值变了型号会变 → 规格，不变 → 属性**。

### 规格值 name vs tag
| 字段 | 用途 | 规则 |
|------|------|------|
| `name` | 前台选择器显示的文本 | 可用括号附带规格参数，如 `G02 (1/4″)` |
| `tag` | 拼接型号的纯代码 | **只允许型号码本身**，不得含空格/中文/单位/描述 |

> 例：厂商数据 `G02 1/4"` → name = `G02 (1/4″)`，tag = `G02`（不是 `G02 1/4"`）

### 三层绑定关系
供应商 → SPU-供应商绑定 → SKU-供应信息。**必须先绑定 SPU-供应商，才能设 SKU 供应信息**。

## 常用操作

### 查重（创建前必做）
```bash
product spu list --keyword <名称>    # 按名称
product spu list --brand-id <id>      # 按品牌
product sku list --keyword <型号>     # 按具体型号
```
多维度搜，一种方式没找到不等不存在。

### 创建简单产品（单 SKU，无规格变型）
```bash
# 先确认品牌和分类 ID 存在
product spu create --name "<名称>" --brand-id <id> --category-id <id>
# 创建 SKU（不传 name，后端自动拼名）
product sku create --spu-id <id> --model "<型号>"
```

### 创建复杂产品（多 SKU 变型）
```bash
product quick-create \
  --spu-name "<名称>" --brand-id <id> --category-id <id> \
  --specs '{"颜色":["红色","蓝色"],"尺寸":["10寸","12寸"]}' \
  -s '{"model":"YYG-50-R10","specs":{"颜色":["红色"],"尺寸":["10寸"]}}' \
  -s '{"model":"YYG-50-B12","specs":{"颜色":["蓝色"],"尺寸":["12寸"]}}'
```
quick-create 有事务保证：SPU 和 SKU 要么全成功、要么全失败。

### 管理规格
```bash
product spu spec bind --spu-id <id> --spec-id <id>      # 绑定规格
product spu spec update --spu-id <id> --spec-id <id> --is-fixed   # 设固定规格
product spu separator set --spu-id <id> --spec-fg "-,/"  # 设分隔符
```

### 设置供应信息
```bash
product supply bind-vendor --spu-id <id> --vendor-id <id>    # 绑定供应商
product supply set-master --sku <sku> --vendor-id <id> --price <采购价> --gross-margin <毛利率>  # 设主供应商价格
```

### SKU 替代品
```bash
product sku replace add --sku <sku> --replace-sku <替代SKU>
```

## 数据校验

创建后立刻验证：
```bash
product spu get --spu-id <id>        # 确认 SPU
product sku get --sku-id <sku>       # 确认 SKU（看单位是否已设为 469/pcs）
product supply sku list --sku-id <sku>  # 确认供应信息
```

### 缺了什么该提醒业务人员
- 没有品牌 ID → 先用 `brand create` 创建品牌
- 没有分类 ID → 确认分类是否存在
- 没有供应商 → 先用 `vendor create` 创建供应商
- 型号不确定 → 不能猜，让业务人员确认
- **SKU 单位必填**：工业品默认 469(pcs)，不传则后续库存/订单出错

## 常见错误

- **创建前不查重** → 重复创建 SPU
- **SPU 名称含品牌名** → 不符合规范
- **tag 含空格/中文** → 型号拼接错误
- **解绑 SPU-供应商前不备份** → 级联清空所有 SKU 供应信息
- **ES 索引异步** → 创建后立即搜索可能查不到，等几秒
- **捏造数据** → 价格必须来自供应商报价，规格必须来自资料
- **SKU 不传单位** → 单位为空，后续库存/订单出问题
