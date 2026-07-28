# 供应商管理操作指南

> **命令参数以 `<command> --help` 为准。** 以下命令示例仅说明操作流程，具体参数不要照抄，先跑 `--help` 查看完整参数列表后再执行。

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

- `vendor list` — 按公司名关键词搜索已有供应商（参数见 `vendor list --help`），支持 `--keyword` 模糊匹配

> 如果没搜到，尝试全称的部分片段再搜一次。搜到结果后人工判断是否已存在。

### 创建供应商

- `vendor create` — 创建供应商（参数见 `vendor create --help`）
  - `--name` 必填，为公司工商全称（不要简写）
  - `--brand-id-list` 可选，创建时一次性绑定品牌（不支持传 categoryId，分类需用 `bind-all` 补绑）

### 创建后绑定品牌和分类

- `vendor bind-all` — 一次性绑定品牌和分类，1 次网络往返（参数见 `vendor bind-all --help`）

- 返回 `{ brands: {addedCount, skippedCount}, categories: {addedCount, skippedCount} }`
- 两个字段都可选：只传 `--brand-ids` 或只传 `--category-ids` 也行

### 查看供应商详情

- `vendor get` — 查看供应商详情（参数见 `vendor get --help`）

### 管理子资源

**联系人：**
- `vendor contact list` — 查看供应商联系人列表（参数见 `vendor contact list --help`）
- `vendor contact add` — 添加联系人（参数见 `vendor contact add --help`）

**收货地址：**
- `vendor address list` — 查看收货地址列表（参数见 `vendor address list --help`）
- `vendor address add` — 添加收货地址（参数见 `vendor address add --help`）

**银行账户：**
- `vendor bank-account list` — 查看银行账户列表（参数见 `vendor bank-account list --help`）
- `vendor bank-account add` — 添加银行账户（参数见 `vendor bank-account add --help`）

**开票信息：**
- `vendor invoice get` — 查看开票信息（参数见 `vendor invoice get --help`）
- `vendor invoice set` — 设置开票信息（参数见 `vendor invoice set --help`）

**官网链接：**
- `vendor website list` — 查看官网链接列表（参数见 `vendor website list --help`）
- `vendor website add` — 添加官网链接（参数见 `vendor website add --help`）

### 合并重复供应商

发现重复供应商后，用 `merge` 合并（转移绑定关系）：

- `vendor merge` — 合并重复供应商，转移绑定关系到目标供应商（参数见 `vendor merge --help`）

合并支持三个方向选择性转移：

| 选项 | 默认 | 说明 |
|------|------|------|
| `--move-brands` | true | 源供应商绑定的品牌转移到目标 |
| `--move-categories` | true | 源供应商绑定的分类转移到目标 |
| `--move-products` | true | 源供应商供应的产品转移到目标 |

> 三项默认全开。如需保留源供应商的某些绑定关系不转移，需显式 `--move-brands=false` 等。

### 使用 extra-columns 自定义字段

- `vendor extra-column set` — 给供应商添加自定义字段值（参数见 `vendor extra-column set --help`）

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
