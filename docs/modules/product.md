# 产品管理

## 1. 业务概念

### SPU（产品组）
相同属性规格的产品集合，管理共性特征。一个 SPU 下可挂多个 SKU。
- **命名规则**：只能是产品名，**不能包含品牌名**
- **关联**：绑定品牌和分类、绑定供应商

### SKU（最小可售卖单位）
具有唯一型号和规格组合的最小销售单位，归属于某个 SPU。
- **命名规则**：`品牌名 + SPU名 + 型号`（空格分隔），通常由系统自动生成
- **管理数据**：销售价、采购价、库存、供应信息

### 产品图片
每个产品可以关联图片（小图/大图）。创建产品时如果有图片 URL，应一并保存。
- 小图（示意图）：产品概览图中使用
- 大图（高清图）：产品详情页使用

---

## 2. 规格系统（核心概念）

### 2.1 什么是规格

规格是构成产品型号的参数。产品型号由多个"位置"按顺序拼接而成，每个位置可以是以下三种类型之一：

| 类型 | 含义 | 示例 |
|------|------|------|
| **可变规格** | 有多个选项供选择的参数 | 主体尺寸：20/30/40/60 |
| **固定规格** | 只有唯一值，不可选的参数 | AMS、X、L、X2044 |
| **分隔符** | 位置之间的连接符号 | `-`、`.`、`/` |

### 2.2 规格认定原则——关键规则

**核心原则：当一个产品存在规格（即有选型配置表）时，型号中的全部内容都应该维护为规格。**

以型号 `AMS[1]X-[2][3]-[4]L[5]-X2044` 为例：

```
分解：  AMS  [1]  X  -  [2]  [3]  -  [4]  L  [5]  -  X2044
类型：  固定  可变  固  分  可变  可变  分  可变  固  可变  分  固定
        规格  规格  定  隔        规格  隔  规格  定  规格  隔  规格
                      符              符              符
```

**判断方法（按优先级）：**
1. 拿到产品型号和选型配置表
2. 如果存在选型配置表（有可选参数）→ **型号中所有内容都是规格**
3. 每个位置逐一分析：有选项的是可变规格，唯一值的是固定规格，连接符是分隔符
4. 分隔符需独立管理，不归属于某个规格

### 2.3 固定规格（is_fixed = true）

固定规格是型号中的固定值片段（如 AMS、X、L、X2044），它们也属于规格，但有特殊标记：
- `is_fixed = true` — 标记为固定规格
- 只有一个规格值，该值就是它本身（name=固定值，tag=固定值）
- 在前端展示为固定文本，不可选择，默认已选中
- 参与型号拼接时直接输出其值

### 2.4 分隔符

分隔符是规格位置之间的连接符号（`-`、`.`、`/`、空格等），独立于规格存在。
- 保存在 SPU 的 JSON 配置中
- 每个规格位置之间可以有一个分隔符
- 还有一个"产品标签分隔符"，用于在型号中插入产品标签时使用
- 系统有预定义的分隔符枚举值可供选择（parent-id=100）

### 2.5 型号拼接规则

型号由各规格值和分隔符按顺序拼接而成：
```
[固定规格值/可变规格选中值] + [分隔符] + [固定规格值/可变规格选中值] + ...
```

### 2.6 规格 vs 属性判断标准

| 类型 | 影响型号？ | 参与选型？ | 示例 |
|------|-----------|-----------|------|
| **规格**（含可变/固定） | ✅ 是 | ✅ 是（固定规格仅唯一值） | 主体尺寸、螺纹种类 |
| **分隔符** | ✅ 是（拼接用） | ❌ | `-`、`.` |
| **属性** | ❌ 否 | ❌ 否 | 产地、材质、保修年限 |

---

## 3. 三层绑定关系

```
供应商 ──→ SPU-供应商绑定（spu_mid_vendors 表）
              │      一个 SPU 可由多个供应商供货
              │
              └──→ SKU-供应信息（sku_vendors_price 表）
                      一个 SKU 可由多个供应商以不同价格供货
```
**必须先绑定 SPU-供应商，才能绑定 SKU-供应信息。**
解绑 SPU-供应商时会级联清空该 SPU 下所有 SKU 的供应信息。

---

## 4. 前置条件

- 创建 SPU：品牌和分类必须已存在
- 创建 SKU：SPU 必须已存在
- 绑定供应信息：SPU 必须先绑定该供应商
- 创建规格：SPU 必须先存在

---

## 5. 判断依据

### 创建方式选择
| 场景 | 推荐方式 |
|------|---------|
| 有完整产品数据（名称+品牌+分类+型号+价格+库存） | quick-create（一次性完成 SPU+SKU） |
| 只有规格定义，无具体 SKU 数据 | 先创建 SPU，再定义规格 |
| 已有 SPU，新增 SKU | 单独创建 SKU |

### quick-create 两种模式
- **变型模式**：只创建 SPU 和规格定义，不生成 SKU
- **具体 SKU 模式**：创建 SPU+规格+直接生成有型号/价格/库存的 SKU

### 规格创建判断
| 场景 | 做法 |
|------|------|
| 产品有选型配置表 | 型号中所有内容都是规格（含固定规格和分隔符） |
| 参数参与型号拼接 | → 规格 |
| 参数不参与型号拼接 | → 属性 |
| 型号中有固定值片段（如 AMS、X2044） | → 固定规格（is_fixed=true） |
| 值变了型号会变 | → 规格（可变或固定） |
| 值变了型号不变 | → 属性 |

---

## 6. 操作流程

### 6.1 创建产品

**方式 A：quick-create（推荐，适用于一次创建 SPU+SKU）**
→ 先确认品牌和分类已存在
→ 使用 `wkea-manage-cli product quick-create`

**方式 B：分步创建**
→ Step 1：创建 SPU — `wkea-manage-cli product spu create`
→ Step 2：创建 SKU — `wkea-manage-cli product sku create`
→ Step 3：保存产品图片（如有 URL）— 使用产品图片保存命令
→ Step 4：验证 — `wkea-manage-cli product spu get`
→ 提供后台链接：`{manageMainUrl}#/main/product-group-list?id={spuId}`

### 6.2 管理规格

**Step 1：分析型号结构**
拿到型号编码规则（如 `AMS[1]X-[2][3]-[4]L[5]-X2044`），逐位置分析：
- 有选项的 → 创建为**可变规格**，添加多个规格值
- 固定值片段 → 创建为**固定规格**（is_fixed=true），仅一个值
- 连接符 → 记录为**分隔符**

**Step 2：创建规格**
→ 创建规格值：使用规格管理命令
→ 绑定规格到 SPU：`wkea-manage-cli product spu spec bind`
→ 设置分隔符：使用分隔符管理命令

**Step 3：查看规格**
→ 查看 SPU 规格：`wkea-manage-cli product spu spec list`
→ 查看型号结构：`wkea-manage-cli product spu spec model`

### 6.3 管理属性
→ 查看属性：`wkea-manage-cli product attribute list`
→ 添加/更新属性：`wkea-manage-cli product attribute set`

### 6.4 管理供应信息

**先绑定 SPU-供应商**
→ `wkea-manage-cli product spu bind-vendor`
→ 查看已绑：`wkea-manage-cli product spu vendors`

**再绑定 SKU-供应信息**
→ 设置供应信息：`wkea-manage-cli product sku supply set`
→ 查看供应信息列表：`wkea-manage-cli product sku supply list`
→ 多供应商对比：`wkea-manage-cli product sku supply summary`
→ SPU 下所有 SKU 的供应总览：`wkea-manage-cli product spu supply-list`

### 6.5 查询产品

**搜索策略：按维度搜索，不要一股脑塞关键词。**

| 想搜什么 | 用哪个命令 | 参数 |
|---------|-----------|------|
| 按 SPU 名称搜 | `product spu list --keyword <产品名>` | keyword 匹配 SPU name 字段 |
| 按 SKU 型号搜 | `product sku list --keyword <型号>` | keyword 匹配 SKU model 字段 |
| 按品牌筛选 | `product spu list --brand-id <id>` | 精确匹配品牌 ID |
| 按分类筛选 | `product spu list --category-id <id>` | 精确匹配分类 ID |
| 按供应商筛选 | `product spu list --vendor-id <id>` | 精确匹配供应商 ID |
| 按价格范围搜 | `product sku list --min-price <num> --max-price <num>` | 价格区间筛选 |
| 按时间范围搜 | `product spu list --created-time-begin <时间> --created-time-end <时间>` | 创建时间范围 |

**搜索注意事项**：
- **一个搜索方式没找到 ≠ 产品不存在**。尝试多种维度后再下结论
- 搜 SPU 用 `product spu list`，搜具体型号用 `product sku list`，两者不能互相替代
- 关键词不要太长太精确，先试简短关键词再逐步精确
- SKU 型号搜索支持模糊匹配，传型号的一部分即可
- 支持组合筛选：`--keyword 3M --brand-id 1 --category-id 5` 同时按名称+品牌+分类筛选

**具体命令：**
→ SPU 列表：`wkea-manage-cli product spu list`（运行 --help 查看全部筛选参数）
→ SKU 列表：`wkea-manage-cli product sku list`（运行 --help 查看全部筛选参数）
→ SKU 详情：`wkea-manage-cli product sku get`

### 6.6 更新/删除
→ 更新 SPU：`wkea-manage-cli product spu update`
→ 更新 SKU：`wkea-manage-cli product sku update`
→ 删除 SKU：`wkea-manage-cli product sku delete`
→ 删除 SPU：`wkea-manage-cli product spu delete`（会级联删除所有 SKU）

---

## 7. 边界情况

- **quick-create 事务保证**：SPU 和 SKU 要么同时创建成功，要么同时失败
- **ES 索引异步刷新**：创建后 ES 索引异步更新，不阻塞返回
- **SKU 克隆**：可用于快速生成类似 SKU
- **批量操作**：支持批量删除、批量上下架 SKU
- **级联删除**：删除 SPU 会清理：SPU-规格绑定、所有 SKU、SKU-规格值绑定、属性绑定
- **固定规格无选项**：只有一个规格值，不可添加更多选项
- **分隔符独立管理**：不归属某个规格，存储在 SPU 级别的 JSON 配置中

---

## 8. 替代品与停产管理

### 8.1 SPU 级停产替代

当整个产品系列停产时，在 SPU 上设置停产替代关系。

```
product spu update --spu-id <SPU> --stop-production <替代SPU_ID>
```

- `--stop-production` 传入**替代 SPU 的 ID**，表示该 SPU 停产并由指定 SPU 替代
- 传入 `--stop-production 0` 表示停产且**无替代**
- 传入 `--stop-production ""` 或清空表示**未停产**
- 停产替代关系设置后，前端详情页会展示停产标识和替代品链接

### 8.2 SKU 级替代关系

单个 SKU 可以设置多个替代产品，替代品是指功能、规格可互换的同类产品。

```
# 查看替代产品列表
wkea-manage-cli product sku replace list --sku SKU20001

# 添加替代产品
wkea-manage-cli product sku replace add --sku SKU20001 --replace-sku SKU20002 [--full-replace]

# 删除替代产品
wkea-manage-cli product sku replace remove --sku SKU20001 --replace-sku SKU20002
```

- 替代关系是双向展示的：设置后 SKU 详情页会展示替代产品信息
- `--full-replace` 标记是否完全替代（功能、性能完全等同）
- 替代品不改变停产状态，停产由 SPU 的 `stopProduction` 字段控制

### 8.3 维嘉替代品（自动生成）

对于非 WKEA 品牌的产品，在复制生成维嘉替代品时，系统自动维护 `wkeaReplaceSpu` 字段，无需手动操作。
