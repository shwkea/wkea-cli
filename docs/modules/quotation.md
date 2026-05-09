# 报价单管理

## 1. 业务概念

**报价单** — 向客户展示产品报价清单的分享模块。可从需求询价生成，也可独立创建。

### 关键标识
- **shareId**：雪花 ID，每条报价单的唯一标识。
- 创建后返回 shareId，后续所有操作通过 shareId 引用。

### 适用场景
1. 需求询价完成后从需求生成报价单
2. 独立创建空的报价单，然后逐个添加产品
3. 编辑管理：增删产品、调整数量、排序
4. 分享：生成短链接 + 复制文案，发送给客户通过微信查看

---

## 2. 前置条件

- 创建报价单：需要 SKU、数量、单位
- 从需求生成：需求必须已存在且有行项目
- 单位是枚举字段，需要查枚举值

---

## 3. 判断依据

- **需求已处理完** → 从需求生成报价单
- **独立创建** → 先创建空报价单，再逐个添加产品

---

## 4. 操作流程

### 4.1 从需求生成报价单
→ 使用 `wkea-manage-cli demand share-order`
- 从需求行项目中提取 SKU/数量/单位
- 返回 shareId

### 4.2 独立创建报价单

**Step 1：创建报价单**
→ 使用 `wkea-manage-cli quotation create`
- 单位是枚举字段，需查询枚举值

**Step 2：添加产品**
→ 使用 `wkea-manage-cli quotation add`

**Step 3：编辑管理**
→ 修改产品：`wkea-manage-cli quotation update`
→ 修改备注：`wkea-manage-cli quotation update-remark`
→ 删除产品：`wkea-manage-cli quotation remove`
→ 排序：`wkea-manage-cli quotation sort`

### 4.3 分享报价单
→ 使用 `wkea-manage-cli quotation share`
- 传入可选 topic（不传则取首个产品名）
- 返回三个值：
  - `shareUrl`：客户可打开的报价单链接
  - `shortUrl`：短链接
  - `copyText`：固定格式的复制文案

**分享文案格式：**
```
你好,请查看{topic}产品报价单,有疑问随时联系,谢谢。链接: {shortUrl}
```

### 4.4 查看报价单
→ 查看产品列表：`wkea-manage-cli quotation items`

---

## 5. 边界情况

- **报价单不提供删除整个单子的接口**，只能增删内部产品
- 分享时需要先获取 `manageMainUrl`（通过 `wkea-manage-cli system urls`）
- 后台查看链接：`{manageMainUrl}#/main/quotation-detail/{shareId}`
- 客户查看链接：`{ecUrl}/share-order.html?shareId={shareId}`
