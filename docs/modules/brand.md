# 品牌管理操作指南

## 核心概念

### 品牌基础实体
品牌是系统基础数据实体，独立于供应商存在。每个品牌有唯一 ID，承载品牌名称、关键词、Logo、官网、类型、授权证书、注册号等属性。

### 品牌与供应商：多对多
- 一个品牌可被多个供应商代理（如亚德客品牌被多家代理商代理）
- 一个供应商可代理多个品牌（如某代理商同时代理 SMC、亚德客、气立可）
- 绑定命令可从品牌侧或供应商侧发起，效果等价

### 品牌与 SPU：一对一（主品牌）
- 一个 SPU 绑定一个主品牌（必绑项）
- 删除品牌时会级联清理：供应商-品牌绑定、SPU-品牌关联、品牌-分类绑定

### 品牌与分类：多对多
- 一个品牌可属于多个分类（如某品牌同时属于「气动元件」和「液压元件」）
- 品牌分类绑定影响前端分类筛选和展示

### 品牌属性清单

| 属性 | 必填 | 说明 |
|------|------|------|
| 名称（name） | 是 | 品牌中文名，创建时必传 |
| 关键词（keyword） | 推荐 | 用于搜索匹配 |
| 官网（url） | 否 | 品牌官方网站 |
| Logo | 否 | 品牌 Logo 图片 URL |
| 类型（type） | 否 | 自有品牌 / 代理品牌 |
| 授权证书 | 否 | 品牌授权文件 |
| 注册号 | 否 | 商标注册号 |
| 描述（desc） | 否 | 品牌简介 |

### 绑定方向

| 命令 | 入口 | 场景 |
|------|------|------|
| `brand bind-vendors` | 品牌侧 | 创建品牌后批量绑供应商 |
| `brand bind-categories` | 品牌侧 | 给品牌打分类标签 |
| `vendor bind-brands` | 供应商侧 | 供应商开发完成后绑品牌 |
| `vendor bind-all` | 供应商侧 | 一次性绑品牌 + 分类 |

> `brand bind-vendors` 和 `vendor bind-brands` 功能等价，只是入口不同。不要重复调用——同一条绑定关系重复调浪费请求。

---

## 常用操作

### 创建前查重（铁律）

```bash
# 按品牌名搜索
node dist/index.js brand list --name <品牌名>

# 如果无精确匹配，尝试关键词搜索
node dist/index.js brand list --keyword <关键词>
```

### 创建品牌

```bash
node dist/index.js brand create \
  --name "<品牌中文名>" \
  [--keyword <搜索关键词>] \
  [--url <官网URL>] \
  [--logo <Logo图片URL>] \
  [--desc <品牌描述>] \
  [--type <自有/代理>] \
  [--vendors-ids <供应商ID1,供应商ID2>] \
  [--category-ids <分类ID1,分类ID2>]
```

- `--name` 必填
- `--vendors-ids` 和 `--category-ids` 可选，创建时一次性绑定

### 查看和更新品牌

```bash
# 查看品牌详情
node dist/index.js brand get --brand-id <品牌ID>

# 更新品牌信息
node dist/index.js brand update --brand-id <ID> --name <新名称> [--keyword/--url/--logo/--desc/--type ...]
```

### 绑定供应商和分类

```bash
# 绑定供应商（品牌侧入口）
node dist/index.js brand bind-vendors \
  --brand-id <品牌ID> \
  --vendor-ids <供应商ID1,供应商ID2>

# 绑定分类（品牌侧入口）
node dist/index.js brand bind-categories \
  --brand-id <品牌ID> \
  --category-ids <分类ID1,分类ID2>
```

### 管理品牌官网链接

品牌可维护多个官网链接（如中文官网、国际官网）：

```bash
# 添加官网链接
node dist/index.js brand create-url --brand-id <ID> --url <URL> [--type <类型>]

# 查看官网链接列表
node dist/index.js brand list-urls --brand-id <ID>

# 更新官网链接
node dist/index.js brand update-url --brand-id <ID> --url-id <URL_ID> --url <新URL>

# 删除官网链接
node dist/index.js brand delete-url --brand-id <ID> --url-id <URL_ID>
```

### 删除品牌

```bash
node dist/index.js brand delete --brand-id <品牌ID>
```

> 删除品牌为**硬删除**，不可恢复。会级联清理以下绑定关系：
> - 所有供应商-品牌绑定
> - 所有 SPU-品牌关联（SPU 的品牌字段被清空）
> - 所有品牌-分类绑定
>
> 删除前务必用 `brand get --brand-id <ID>` 确认 `vendorCount` 和 `productCount`，评估影响范围。

---

## 数据校验

创建后立刻验证：

```bash
# 1. 确认品牌基本信息
node dist/index.js brand get --brand-id <ID>

# 2. 确认绑定关系
node dist/index.js brand get --brand-id <ID>  # 看返回中的 vendorCount / categoryCount / productCount

# 3. 确认官网链接
node dist/index.js brand list-urls --brand-id <ID>
```

### 缺了什么该提醒业务人员

- **品牌名称不完整** → 必须使用品牌标准中文名，不能简写或拼音
- **没有关键词** → 搜索功能无法匹配到该品牌，需补 `brand update --keyword`
- **没有绑供应商** → 品牌无法与供应商关联，需补 `brand bind-vendors`
- **没有绑分类** → 品牌在前端分类筛选不可见，需补 `brand bind-categories`
- **没有 Logo** → 前端展示缺少品牌视觉标识，需补 `brand update --logo`
- **类型未设** → 自有/代理类型缺失影响业务分析，需补 `brand update --type`
- **重复品牌** → 搜到同名或近似名品牌时，先确认是否同一品牌，避免重复创建

---

## 常见错误

- **创建前不查重** → 同一品牌被重复创建，数据冗余
- **品牌名写简称** → 如 "SMC" 写 "smc"，后端大小写敏感可能匹配不到
- **绑定供应商用 `bind-categories`** → 两个命令完全无关，分类 ID 不会绑到供应商上
- **删除前不看级联影响** → 误删品牌导致多个 SPU 失去品牌关联、供应商绑定被清空
- **创建时传 `--vendors-ids` 后又调 `bind-vendors`** → 重复绑定，浪费请求
- **分类 ID 来源不可靠** → 用 web_search 搜到的分类 ID 可能不对；必须用 CLI `enum --type <类型>` 查询真实分类 ID
- **ES 索引异步延迟** → 创建品牌后立即用 `brand list --name` 搜索可能查不到，等几秒再搜
