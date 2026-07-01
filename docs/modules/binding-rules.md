# 三方绑定规则（vendor ↔ brand ↔ category）

> WKEA 后台中，供应商、品牌、分类三方之间存在多种绑定关系。本文档梳理所有绑定 API、推荐用法、概念区别，避免误用。

---

## 1. 绑定矩阵

| 从\到 | 绑供应商 | 绑品牌 | 绑分类 |
|------|---------|--------|--------|
| **供应商** | — | `bind-all` / `bind-brands` | `bind-all` / `bind-categories` |
| **品牌** | `bind-vendors` | — | `bind-categories` |
| **分类** | （无独立命令） | （无独立命令） | — |

> 分类本身**没有顶级管理命令**（无 `category.ts` 命令模块），分类管理分散在 vendor / brand 命令中。

---

## 2. 创建时一次性绑定

| 命令 | 支持的绑定 |
|------|----------|
| `vendor create` | `--brand-id-list <id列表>`（**不支持**一次性传 categoryId） |
| `brand create` | `--vendors-ids <id列表>` + `--category-ids <id列表>` |
| `category create` | （**无**独立命令，分类管理分散在 vendor / brand 命令中） |

**建议**：vendor 创建后**用 `bind-all` 二次绑定**分类和品牌，比在 create 里写 brand-id-list 更清晰。

---

## 3. 增量绑定：bind-all vs 分别绑定

### 3.1 推荐：`vendor bind-all`（一次完成）

```bash
node dist/index.js vendor bind-all \
  --vendor-id S00860 \
  --brand-ids 1,2,3 \
  --category-ids 10,20,30
```

- **1 次网络往返**
- **原子性更好**（一个失败另一个不写入）
- **返回结构清晰**：`{ brands: {addedCount, skippedCount}, categories: {addedCount, skippedCount} }`
- 两个字段都可选，可只传 brands 或只传 categories

### 3.2 备选：分别调用

```bash
# 只需绑品牌时
node dist/index.js vendor bind-brands --vendor-id S00860 --brand-ids 1,2,3

# 只需绑分类时
node dist/index.js vendor bind-categories --vendor-id S00860 --category-ids 10,20
```

**何时用分别调用**：
- 只需要绑一个方向
- 与其他命令配合，状态需要分阶段确认
- 调试单个 API 行为

---

## 4. 三种"分类"概念的区别

WKEA 系统里"分类"有**三个不同含义**，混用会出问题：

| 概念 | API | 业务含义 | 字段特征 |
|------|------|--------|---------|
| **vendor-分类绑定** | `vendor bind-categories` | 供应商**能卖**哪些分类 | 简单多对多（categoryId 列表） |
| **brand-分类绑定** | `brand bind-categories` | 品牌**属于**哪些分类 | 简单多对多（categoryId 列表） |
| **vendor-优势分类** | `vendor superior-category` | 供应商**主攻/擅长**哪些分类 | 带 `priority`、`systemCategoryId`、`systemCategoryPath`，可排序 |

**举例**：
- SMC 供应商绑「气动元件」分类 → **vendor-分类绑定**
- SMC 品牌属于「气动元件」分类 → **brand-分类绑定**
- 上海某 SMC 代理的核心优势是「气动元件」且 priority=1 → **vendor-优势分类**

**优势分类不能替代分类绑定**：
- 没绑普通分类（`bind-categories`）就创建不了 SKU
- 优势分类（`superior-category`）只用于"突出展示"和"供应商画像"，不影响业务流转

---

## 5. 反方向绑定（brand → vendor）

`brand bind-vendors` 和 `vendor bind-brands` **功能等价**，只是入口不同：

- `vendor bind-brands` — 在供应商侧加品牌（适合"开发完供应商后批量绑品牌"）
- `brand bind-vendors` — 在品牌侧加供应商（适合"创建品牌后批量绑供应商"）

**选择依据**：
- 主数据是供应商 → 用 `vendor bind-brands`
- 主数据是品牌 → 用 `brand bind-vendors`
- 都行但**不要重复调用**（同一条绑定关系重复调用浪费一次请求）

---

## 6. merge 时的选择性转移

`vendor merge --from-id <源ID> --to-id <目标ID>` 支持三个方向选择性转移：

| 选项 | 默认 | 说明 |
|------|------|------|
| `--move-brands` | true | 源供应商绑定的品牌转移到目标供应商 |
| `--move-categories` | true | 源供应商绑定的分类转移到目标供应商 |
| `--move-products` | true | 源供应商供应的产品转移到目标供应商 |

> 三项**默认全开**。如需保留源供应商的某些绑定关系不转移，需显式 `--move-brands=false` 等。

---

## 7. 删除时的级联清理

参考 `appendix.md` 1. 级联清理规则：

| 操作 | 级联清理内容 |
|------|-------------|
| 删除品牌 | 供应商-品牌绑定、SPU-品牌绑定、品牌-分类绑定 |
| 删除供应商 | 供应商-品牌绑定、供应商-分类绑定 |
| 删除 SPU | SPU-规格绑定、下属所有 SKU、SKU-规格值绑定、属性绑定 |

> 所有删除操作均为**硬删除**（直接从数据库删除），不可恢复。

---

## 8. 常见误用

| 误用 | 后果 | 正确做法 |
|------|------|---------|
| 用 `bind-categories` 期望返回"优势分类"信息 | 拿不到 priority | 用 `vendor superior-category list` |
| `vendor create --brand-id-list` 后又调 `bind-brands` | 重复请求，可能报错"已绑定" | 一次 `bind-all` 搞定 |
| 想给品牌绑供应商但调了 `bind-categories` | 完全无关 | 用 `brand bind-vendors` |
| 用 `web_search` 搜到的分类 ID 写入优势分类 | systemCategoryId 可能不存在 | 必须用 CLI `enum --type <类型>` 查真实分类 |
| 删除品牌时没看级联影响 | 误删 N 个供应商-品牌绑定 | 删除前 `brand get` 看 vendorCount / productCount |

---

## 9. 完整 API 速查

| API | 命令 | 推荐场景 |
|------|------|---------|
| 供应商创建时绑品牌 | `vendor create --brand-id-list` | 已知品牌、首次创建供应商 |
| 供应商批量绑品牌+分类 | `vendor bind-all` | **最常用**，推荐 |
| 供应商单独绑品牌 | `vendor bind-brands` | 增量、调试 |
| 供应商单独绑分类 | `vendor bind-categories` | 增量、调试 |
| 供应商设置优势分类 | `vendor superior-category add` | 强调供应商专长 |
| 品牌创建时绑供应商+分类 | `brand create --vendors-ids --category-ids` | 已知供应商、首次创建品牌 |
| 品牌绑供应商（反方向） | `brand bind-vendors` | 主数据是品牌时 |
| 品牌绑分类 | `brand bind-categories` | 给品牌打类目标签 |
| 供应商合并 | `vendor merge` | 去重，选择性 move 三个方向 |
