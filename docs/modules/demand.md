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

- 领取需求前：无
- 产品匹配前：需求已被当前 AI 领取
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

### 4.1 持续轮询
```
每 60 秒执行一次：
  wkea-manage-cli demand pending-tasks
  有未处理需求 → 进入全流程处理
  无 → 继续等待下一周期
```

### 4.2 全流程处理（6 步，缺一不可）

**Step 1：领取需求**
→ 使用 `wkea-manage-cli demand claim`
- 原子操作，防止并发抢单
- 领取后当前 AI 成为该需求的处理人

**Step 2：获取详情**
→ 使用 `wkea-manage-cli demand get`
- 获取需求基本信息 + 行项目列表
- 每个行项目含：产品名称、品牌、型号、数量、单位、期望价格等

**Step 3：产品匹配（必须为每个行项目找到或创建 SKU）**
- **3a. ES 搜索已有产品** — 通过产品名称/型号搜索系统已有 SPU 和 SKU，找到匹配则绑定到行项目
- **3b. 网上搜索** — ES 没找到或不可用时，通过 WebSearch 搜索产品，调用一键上架功能自动创建 SPU+SKU 并绑定
- **3c. 记录** — 在 aiRemark 中记录：搜索方式、关键词、来源、结果

> **注意**：每个行项目都必须绑定 SKU 后才能进入下一步。禁止跳过。

**Step 4：供应商匹配（必须为每个行项目涉及的品牌找到供应商）**
- **4a. 查询品牌已绑供应商** — 调用按品牌查供应商接口
- **4b. 无供应商则网上搜索** — **禁止跳过或报错**，必须找到至少一个供应商
- **4c. 创建供应商并绑定** — 搜到供应商信息后创建并绑定到品牌

> **注意**：不得因品牌无供应商就结束流程。

**Step 5：自动询价**
→ 使用 `wkea-manage-cli demand auto-quote`
- 按行项目的产品品牌分组
- 自动向各品牌的主供应商发起询价
- 无主供应商则向全部绑定供应商询价

**Step 6：记录处理完成**
→ 在行项目的 aiRemark 中汇总：产品匹配 + 供应商匹配 + 询价结果

### 4.3 行项目管理
→ 新增行项目：`wkea-manage-cli demand item add`
→ 批量新增：`wkea-manage-cli demand item batch-add`
→ 修改行项目：`wkea-manage-cli demand item update`
→ 删除行项目：`wkea-manage-cli demand item delete`

---

## 5. 边界情况

- **ES 不可用**（开发环境返回 500）→ 必须走 WebSearch，不能跳过产品匹配
- **品牌无供应商** → 必须网上搜索创建，不能报错退出
- **供应商异步报价** → AI 发出询价后等待供应商响应（异步），需轮询检查报价状态
- **一键上架** — 内部自动查重（按品牌+型号），重复则直接绑定
- **主供应商机制** — 品牌可设置主要供应商，自动询价时优先询价
