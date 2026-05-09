# 需求询价管理

## 1. 业务概念

**需求询价** — B2B 采购的核心入口。客户提需求 → 内部匹配产品/供应商 → 向供应商询价 → 供应商报价 → 转订单。

### 实体关系
```
DemandQuotation（需求询价主表）
  ├── DemandQuotationItem（行项目 1..N）
  │     └── skuId → SKU（可选绑定）
  ├── DemandQuotationDocInfo（供应商报价记录）
  │     └── DemandQuotationDocInfoData（报价明细）
  └── DeepSearch / SupplierExtract（深度搜索联动）
```

### 状态
| 状态码 | 含义 |
|--------|------|
| 274 | 待处理 |
| 275 | 处理中 |
| 276 | 已完成 |
| 291 | 已取消 |

### 行项目关键字段
- 客户填写（只读）：`productName`、`productBrand`、`productModel`
- 后台编辑：`manageProductName`、`manageProductBrand`、`manageProductModel`
- 绑定产品：`skuId`
- 业务数据：`quantity`、`expectPrice`、`finalSkuPrice`、`grossMargin`
- 记录：`aiRemark`（AI 处理记录，Markdown 格式）

---

## 2. 前置条件

- 领取需求前：无（直接 claim 即可）
- 产品匹配前：需求已被当前 AI 领取（Step 1 已完成）
- 供应商匹配前：行项目必须已绑定 SKU
- 询价前：行项目涉及的品牌必须有绑定的供应商

---

## 3. 判断依据

- **需求状态 274（待处理）且 manageId 为空** → 可领取
- **ES 搜索可用**（线上） → 优先用 ES 搜索已有产品
- **ES 不可用**（开发环境返回 500） → 走 WebSearch
- **品牌有供应商** → 直接询价；**品牌无供应商** → 必须网上搜索创建，不能跳过

---

## 4. 操作流程

> **AI 必须全程自主处理，不允许停下来问用户。**
> 每步在行项目的 `aiRemark` 字段记录处理过程（Markdown 格式）。

### 4.1 全流程处理（6 步，缺一不可）

**Step 1：领取需求**
→ 使用 `wkea-manage-cli demand claim`
- 原子操作，防止并发抢单
- 无论需求的 manageId 是否为空，只要当前 AI 被要求处理该需求，就应该先 claim 确保自己是处理人
- claim 成功后即进入处理流程，不需要额外等待或轮询

**Step 2：获取详情**
→ 使用 `wkea-manage-cli demand get`
- 获取需求基本信息 + 行项目列表
- 每个行项目含：产品名称、品牌、型号、数量、单位、期望价格等

---

**Step 3：产品匹配（必须为每个行项目找到或创建 SKU）**

> 目标：为每个行项目绑定一个具体的 SKU（系统产品）。匹配到完全一致的型号才能上架。

#### 3.1 搜索已有产品（按顺序尝试，换方式不等于不存在）

**方式 A：按 SPU 名称搜索**
```
wkea-manage-cli product spu list --keyword <产品名>
```
- 例如客户说要"3M 电动钻"，搜 `--keyword 3M 电动钻`
- 匹配 SPU 的 name 字段
- 如果没找到，缩短关键词再试（"电动钻" → "钻"）

**方式 B：按 SKU 型号搜索**
```
wkea-manage-cli product sku list --keyword <型号>
```
- 例如客户说要型号"3M-DRILL-600W"，搜 `--keyword 3M-DRILL-600W`
- 匹配 SKU 的 model 字段
- 型号通常更精确，如果 spu 搜不到试试 sku

**方式 C：ES 搜索**（线上环境可用）
- 调用系统 ES 接口搜索
- ES 不可用时返回 500，此时走方式 D

**方式 D：网上搜索**
- 通过 WebSearch 在网上搜索该产品
- 找到产品信息后，调用一键上架创建 SPU+SKU

#### 3.2 验证产品匹配

找到可能的匹配后，必须验证：
1. **型号完全一致** — 客户要求的型号与系统型号必须完全匹配
2. **品牌一致** — 客户说的品牌与系统品牌一致
3. **规格参数一致** — 如有规格要求，逐一比对

> 验证通过后，才算找到匹配。型号对不上不能强行绑定。

#### 3.3 上架并绑定

**情况 A：系统已有完全匹配的 SKU**
```
wkea-manage-cli demand item update --item-id <id> --sku-id <SKU>
```
将 SKU 绑定到行项目。

**情况 B：系统没有，需要新建**
```
# 一键上架（自动创建 SPU+SKU 并绑定到行项目）
wkea-manage-cli demand item update --item-id <id> --sku-id <新建的SKU>
```
或者手动创建：
```
wkea-manage-cli product spu create --name <产品名> --brand-id <id> --category-id <id>
wkea-manage-cli product sku create --spu-id <id> --name <SKU名> --price <价格> --stock <库存>
```

#### 3.4 记录

在 aiRemark 中记录：
```
## 产品匹配
- 搜索方式：SPU名称搜索 / SKU型号搜索 / WebSearch
- 关键词：XXX
- 匹配结果：找到 SKU W001234（型号完全匹配）/ 未找到，已新建 SKU
- 验证结果：型号、品牌、规格均一致
```

> **注意**：每个行项目都必须绑定 SKU 后才能进入下一步。禁止跳过。

---

**Step 4：供应商匹配（必须为每个行项目涉及的品牌找到有联系方式供应商）**

> 目标：找到至少一个**有邮箱或手机号**的供应商。没有联系方式的供应商无法发送询价通知，等于没用。

#### 4.1 搜索方式（多维切换，换维度不等于不存在）

**方式 A：按品牌查已绑供应商**
```
wkea-manage-cli brand vendors --brand-id <id>
```
- 最快的方式，查询该品牌在系统里已经绑了哪些供应商

**方式 B：按产品分类找供应商**
```
wkea-manage-cli vendor list --category-id <id>
```
- 同一产品分类下可能有其他品牌的供应商

**方式 C：逐个产品维度搜**
```
wkea-manage-cli product spu vendors --spu-id <id>
```
- 查同 SPU 下已绑了哪些供应商

**方式 D：网上搜索**
- 搜索引擎搜：`<品牌名> 经销商`、`<品牌名> 代理商`、`<产品名> 供应商`
- B2B 平台：1688、淘宝企业购、京东工业品
- 行业网站：品牌官网的"联系我们"或"经销商查询"

#### 4.2 供应商信息验证标准

找到的供应商必须满足以下条件才能创建：

**必填信息（缺一不可）：**
| 字段 | 说明 | 查找方式 |
|------|------|---------|
| 供应商名称 | 全称，如"深圳市某某科技有限公司" | 网页标题、公司介绍 |
| **邮箱** | 用于系统发送询价通知 | 官网"联系我们"、企查查、天眼查 |
| **手机号/电话** | 用于系统发送短信通知 | 网页联系方式、企查查 |

**辅助验证信息（尽量补充）：**
- 联系人姓名、职位
- 品牌授权证书、代理证明
- 企查查工商信息（统一信用代码、法人、注册资本、经营状态）
- 供应商类型（原厂/授权经销商/代理商）

> **如果只找到公司名但没找到邮箱和电话，不能创建。** 必须继续深挖（找官网→找联系我们→找企查查→找1688店铺）。

#### 4.3 创建供应商并绑定

```
# 创建供应商
wkea-manage-cli vendor create --name "<公司全称>" --email "<邮箱>" --phone "<手机号>"

# 维护联系人（邮箱和电话存在联系人里）
wkea-manage-cli vendor contact add --vendor-id <id> --name "<联系人>" --email "<邮箱>" --phone "<手机>"

# 绑定品牌
wkea-manage-cli vendor bind-brand --vendor-id <id> --brand-id <品牌ID>

# 绑定分类
wkea-manage-cli vendor bind-category --vendor-id <id> --category-id <分类ID>
```

#### 4.4 记录

在 aiRemark 中记录：
```
## 供应商匹配
- 品牌：XXX
- 搜索方式：系统查询 / 搜索引擎 / B2B平台
- 来源：https://...
- 找到供应商：XXX有限公司（邮箱: contact@xxx.com, 电话: 021-12345678）
- 验证结果：官网有联系方式，企查查工商状态正常
- 已创建供应商 ID: S00xxx
```

> **注意**：不得因品牌无供应商就结束流程。必须找到至少一个有邮箱/电话的供应商。

---

**Step 5：自动询价**
→ 使用 `wkea-manage-cli demand auto-quote`
- 按行项目的产品品牌分组
- 自动向各品牌的主供应商发起询价（通过邮件/短信通知）
- 无主供应商则向全部绑定供应商询价

**Step 6：记录处理完成**
→ 在行项目的 aiRemark 中汇总：产品匹配 + 供应商匹配 + 询价结果

---

### 4.2 执行记录规范

每次搜索和操作都在 aiRemark 中记录，格式如下：

```markdown
## 产品匹配
- 搜索方式：SPU名称搜索
- 关键词：3M 电动钻
- 系统结果：找到 SPU W001234，名称匹配
- 型号验证：客户型号"3M-DRILL-600W" vs 系统型号"3M-DRILL-600W" → 完全一致
- 结果：已绑定 SKU W001234

## 供应商匹配
- 品牌：3M
- 搜索方式：系统查询（品牌已绑供应商）
- 找到供应商：3M中国有限公司（邮箱: sales@3m.cn, 电话: 021-12345678）
- 企查查验证：统一信用代码 91310000XXXX，经营状态存续
- 结果：已创建供应商 S00xxx，已绑定品牌 3M
```

---

### 4.3 行项目管理
→ 新增行项目：`wkea-manage-cli demand item add`
→ 批量新增：`wkea-manage-cli demand item batch-add`
→ 修改行项目：`wkea-manage-cli demand item update`
→ 删除行项目：`wkea-manage-cli demand item delete`

---

## 5. 边界情况

- **ES 不可用**（开发环境返回 500）→ 必须走 WebSearch，不能跳过产品匹配
- **品牌无供应商** → 必须网上搜索创建，不能报错退出
- **供应商没有邮箱/电话** → 不能创建，继续深挖找到联系方式
- **多个供应商匹配** → 优先选有授权证书、工商状态正常、有官网的
- **供应商异步报价** → AI 发出询价后等待供应商响应（异步），需轮询检查报价状态
- **一键上架** — 内部自动查重（按品牌+型号），重复则直接绑定
- **主供应商机制** — 品牌可设置主要供应商，自动询价时优先询价
