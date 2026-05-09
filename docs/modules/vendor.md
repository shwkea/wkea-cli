# 供应商管理

## 1. 业务概念

**供应商（Vendor）** — 提供工业品的企业实体，是系统供应链的核心参与者。

**实体关系：**
- 供应商 ↔ 品牌：多对多（一个供应商可代理多个品牌，一个品牌可有多个供应商）
- 供应商 ↔ 分类：多对多（标识供应商的经营范围）
- 供应商 ↔ SPU：多对多（一个供应商可给多个 SPU 供货）
- 供应商 ↔ SKU：多对多（记录每个 SKU 从各供应商的采购/销售价）

**关键枚举字段：**
- 供应商类型：106=原厂、107=授权经销商、236=品牌方、237=总代理、238=其他
- 收款方式、结款方式、付款期限、币种 — 均需查枚举

---

## 2. 前置条件

- 操作前无需特殊前置条件

---

## 3. 判断依据

- **用户只说名称** → 创建基础信息，其他字段填默认值
- **用户说品牌名** → 先查品牌是否存在，不存在则先创建
- **用户说分类** → 先查分类是否存在

---

## 4. 操作流程

### 4.1 创建供应商（6 步，缺一不可）

**Step 1：创建基础信息**
→ 使用 `wkea-manage-cli vendor create`
- 涉及枚举值的字段先查枚举对应关系
- 必填：供应商名称
- 其余字段可先填默认值
- 创建成功返回供应商 ID（如 S00434），后续步骤都会用到

**Step 2：维护联系人**
→ 使用 `wkea-manage-cli vendor contact add`
- 联系人是独立实体，不能随供应商一起保存
- 一个供应商可以有多个联系人

**Step 3：绑定品牌**
→ 使用 `wkea-manage-cli vendor bind-brand`
- 将品牌与供应商建立多对多关联
- 品牌绑定是双向的：可从供应商侧操作，也可从品牌侧操作
- 如果品牌在系统中不存在，先创建品牌

**Step 4：绑定分类**
→ 使用 `wkea-manage-cli vendor bind-category`
- 将产品分类与供应商关联，标识经营范围

**Step 5：设置优势分类（可选）**
→ 使用 `wkea-manage-cli vendor superior-category add`
- 标识供应商的核心业务领域，用于排序和推荐

**Step 6：验证并生成链接**
→ 使用 `wkea-manage-cli vendor get` 验证创建结果
→ 提供后台跳转链接：`{manageMainUrl}#/main/supplier-add/{vendorId}`

### 4.2 查询供应商
→ 列表：`wkea-manage-cli vendor list`（支持名称搜索、分页）
→ 详情：`wkea-manage-cli vendor get`
→ 下拉框：`wkea-manage-cli vendor dropdown`

### 4.3 更新供应商
→ 先 `wkea-manage-cli vendor get` 查看当前值
→ 再 `wkea-manage-cli vendor update`（仅传需要修改的字段）
→ 验证更新结果

### 4.4 删除供应商
→ 先 `wkea-manage-cli vendor get` 查看详情
→ 展示给用户确认（级联清理：供应商-品牌绑定、供应商-分类绑定）
→ 确认后执行 `wkea-manage-cli vendor delete`
→ 验证删除

### 4.5 合并供应商
→ 使用 `wkea-manage-cli vendor merge`
- 将源供应商的数据合并到目标供应商
- 合并选项：品牌、分类、产品

---

## 5. 边界情况

- **供应商已存在** — 按名称精确搜索确认后，展示已有数据给用户
- **品牌/分类不存在** — 提示用户先创建，或用户仅说名称时自动创建
- **删除有绑定关系的供应商** — 级联清理绑定，但不会删除品牌/分类本身
- **枚举值不确定** — 先跑 `wkea-manage-cli enum --type <类型>` 查看
