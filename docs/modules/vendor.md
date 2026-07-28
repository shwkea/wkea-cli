# 供应商管理操作指南

## 核心概念

### 供应商基础实体
供应商是系统中独立的管理实体，每个供应商拥有唯一 ID（如 `S00860`），承载企业工商信息、联系方式等基础数据。

### 供应商与品牌、分类的多对多绑定
- 一个供应商可代理多个品牌（如 SMC 代理气立可、亚德客）
- 一个品牌可被多个供应商代理（如亚德客被 A 公司、B 公司同时代理）
- 供应商 <-> 分类同理：一个供应商能卖多个分类，一个分类下有多个供应商

### 子集合
供应商实体下挂多个子资源，各有独立管理命令：

| 子资源 | 命令前缀 | 说明 |
|--------|---------|------|
| 联系人 | `vendor contact` | 供应商对接人，支持多个 |
| 收货地址 | `vendor address` | 采购入库使用的地址 |
| 银行账户 | `vendor bank-account` | 付款账户信息 |
| 开票信息 | `vendor invoice` | 开票抬头、税号等 |
| 官网链接 | `vendor website` | 供应商官网 URL，支持多个 |

### 绑定方向
参考 `binding-rules.md`，供应商侧提供三种绑定命令：

| 命令 | 用途 | 推荐度 |
|------|------|--------|
| `vendor bind-all` | 一次性绑品牌 + 分类 | **最推荐** |
| `vendor bind-brands` | 只绑品牌 | 增量场景 |
| `vendor bind-categories` | 只绑分类 | 增量场景 |

---

## 常用操作

### 创建前查重（铁律）

**必须先查重，再创建。** 跳过此步容易产生重复供应商，后续合并成本高。

```bash
# 按公司名关键词搜索
node dist/index.js vendor list --keyword <公司名关键词>

# 如果没搜到，尝试全称的部分片段再搜一次
node dist/index.js vendor list --keyword <公司名简称>
```

> `vendor list` 支持 `--keyword` 模糊匹配，不是精确匹配。搜到结果后人工判断是否已存在。

### 创建供应商

```bash
node dist/index.js vendor create \
  --name "<公司全称>" \
  [--contact <联系人>] \
  [--phone <电话>] \
  [--address <地址>] \
  [--brand-id-list <品牌ID1,品牌ID2>]
```

- `--name` 必填，为公司工商全称（不要简写）
- `--brand-id-list` 可选，创建时一次性绑定品牌（不支持传 categoryId，分类需用 `bind-all` 补绑）

### 创建后绑定品牌和分类

```bash
node dist/index.js vendor bind-all \
  --vendor-id <供应商ID> \
  --brand-ids <品牌ID1,品牌ID2> \
  --category-ids <分类ID1,分类ID2>
```

- 一个命令同时绑定品牌和分类，1 次网络往返
- 返回 `{ brands: {addedCount, skippedCount}, categories: {addedCount, skippedCount} }`
- 两个字段都可选：只传 `--brand-ids` 或只传 `--category-ids` 也行

### 查看供应商详情

```bash
node dist/index.js vendor get --vendor-id <供应商ID>
```

### 管理子资源

```bash
# 联系人
node dist/index.js vendor contact list --vendor-id <ID>
node dist/index.js vendor contact add --vendor-id <ID> --name <姓名> --phone <电话>

# 收货地址
node dist/index.js vendor address list --vendor-id <ID>
node dist/index.js vendor address add --vendor-id <ID> --address <详细地址>

# 银行账户
node dist/index.js vendor bank-account list --vendor-id <ID>
node dist/index.js vendor bank-account add --vendor-id <ID> --account <账号> --bank <开户行>

# 开票信息
node dist/index.js vendor invoice get --vendor-id <ID>
node dist/index.js vendor invoice set --vendor-id <ID> --title <抬头> --tax-number <税号>

# 官网链接
node dist/index.js vendor website list --vendor-id <ID>
node dist/index.js vendor website add --vendor-id <ID> --url <URL>
```

### 合并重复供应商

发现重复供应商后，用 `merge` 合并（转移绑定关系）：

```bash
node dist/index.js vendor merge \
  --from-id <源供应商ID（废弃的）> \
  --to-id <目标供应商ID（保留的）>
```

合并支持三个方向选择性转移：

| 选项 | 默认 | 说明 |
|------|------|------|
| `--move-brands` | true | 源供应商绑定的品牌转移到目标 |
| `--move-categories` | true | 源供应商绑定的分类转移到目标 |
| `--move-products` | true | 源供应商供应的产品转移到目标 |

> 三项默认全开。如需保留源供应商的某些绑定关系不转移，需显式 `--move-brands=false` 等。

### 使用 extra-columns 自定义字段

```bash
# 给供应商添加自定义字段值
node dist/index.js vendor extra-column set \
  --vendor-id <ID> \
  --column-id <字段ID> \
  --value <值>
```

> 可用字段 ID 通过 `extra-columns list --entity-type vendor` 查询。

### 获取后台跳转链接

写操作完成后，向业务人员输出后台管理跳转链接：

```
{manageMainUrl}#/main/supplier-add/{vendorId}
```

> `manageMainUrl` 通过 `node dist/index.js urls` 获取，不能硬编码。

---

## 数据校验

创建后立刻验证：

```bash
# 1. 确认供应商基本信息
node dist/index.js vendor get --vendor-id <ID>

# 2. 确认绑定关系
node dist/index.js vendor get --vendor-id <ID>  # 看返回中的 brandCount / categoryCount

# 3. 确认子资源
node dist/index.js vendor contact list --vendor-id <ID>
node dist/index.js vendor address list --vendor-id <ID>
node dist/index.js vendor bank-account list --vendor-id <ID>
```

### 缺了什么该提醒业务人员

- **公司名不完整** → 必须工商全称，不能简写或别名
- **没有绑品牌** → 供应商无法关联产品，需补 `bind-all --brand-ids`
- **没有绑分类** → 供应商无法在分类下创建产品，需补 `bind-all --category-ids`
- **没有联系人** → 后续采购无法对接，需补 `vendor contact add`
- **没有收货地址** → 采购入库无法填写地址，需补 `vendor address add`
- **没有银行账户** → 财务付款无法操作，需补 `vendor bank-account add`
- **重复供应商** → 搜到同名或近似名供应商时，先确认是否同一家，是则合并而非新建

---

## 常见错误

- **创建前不查重** → 重复创建供应商，后续需要 `merge` 合并，增加数据清理成本
- **公司名用简称/别名** → 同一家公司出现多个名字不同的记录，后期难以识别去重
- **`vendor create --brand-id-list` 后又调 `bind-brands`** → 重复请求，可能报错 "已绑定"
- **创建时传 `--brand-id-list` 但忘记补绑分类** → 供应商有品牌但无分类，无法正常使用
- **合并时没确认三个 move 选项** → 如不需要转移产品，忘记设 `--move-products=false`，导致产品被意外迁移
- **批量创建时数据不一致** → 脚本半路中断，部分供应商创建成功、部分失败，无事务回滚
- **硬编码后台 URL** → 环境切换后链接失效；必须用 `node dist/index.js urls` 动态获取
