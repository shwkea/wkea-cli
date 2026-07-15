# 附录

## 1. 级联清理规则

| 操作 | 级联清理内容 |
|------|-------------|
| 删除品牌 | 供应商-品牌绑定、SPU-品牌绑定、品牌-分类绑定 |
| 删除供应商 | 供应商-品牌绑定、供应商-分类绑定 |
| 删除 SPU | SPU-规格绑定、下属所有 SKU、SKU-规格值绑定、属性绑定 |
| 删除需求询价 | 该需求下的所有行项目、doc_info、doc_info_data |
| 删除客户 | 客户下的所有地址/发票/银行/联系人数据 |

> 所有删除操作均为硬删除（直接从数据库删除）。

## 2. 跳转链接汇总（生成链接前必读）

> ⚠️ **以下表是后台链接的唯一合法格式。不在表里的路由 = 错误格式，禁止使用。**
> 比如 `/product/spu/edit/`、`/product/spu/spec/`、`/product/sku/create` 等都不在表中 → 全错。
> 生成任何后台链接前必须跑 `node dist/index.js urls` 拿 manageMainUrl，然后从下表找到对应行，照抄拼接。

### 前置步骤

```bash
cd wkea-cli && node dist/index.js urls
# → manageMainUrl: "https://dev-admin.wkea.cn/"
# → ecUrl: "https://dev.wkea.cn/"
```

### 链接拼接规则

```
manageMainUrl + "#/main/" + 下面的路由路径
```

### 合法链接格式（只有这些，没有其他的）

| 模块 | 操作 | 路由路径 | 完整示例 |
|------|------|---------|---------|
| SPU | 详情/编辑 | `#/main/product-group-list?id={spuId}` | `https://dev-admin.wkea.cn/#/main/product-group-list?id=123` |
| SKU | 详情/编辑 | `#/main/product-edit/{skuId}` | `https://dev-admin.wkea.cn/#/main/product-edit/W001084186` |
| 供应商 | 详情/编辑 | `#/main/supplier-add/{vendorId}` | `https://dev-admin.wkea.cn/#/main/supplier-add/42` |
| 品牌 | 详情/编辑 | `#/main/product-addbrand/{brandId}` | `https://dev-admin.wkea.cn/#/main/product-addbrand/5` |
| 需求询价 | 详情 | `#/main/demandInquiryDetails/{demandId}` | `https://dev-admin.wkea.cn/#/main/demandInquiryDetails/667` |
| 报价单 | 后台查看 | `#/main/inquiry-order/{id}` | `https://dev-admin.wkea.cn/#/main/inquiry-order/89` |
| 报价单 | 客户分享 | `{ecUrl}share-order.html?shareId={shareId}` | `https://dev.wkea.cn/share-order.html?shareId=abc123` |
| 销售订单 | 详情 | `#/main/order-details/{orderId}` | `https://dev-admin.wkea.cn/#/main/order-details/456` |
| 销售合同 | 详情 | `#/main/sale-contractDetails/{id}` | `https://dev-admin.wkea.cn/#/main/sale-contractDetails/789` |
| 客户 | 详情/编辑 | `#/main/customer-add/{id}` | `https://dev-admin.wkea.cn/#/main/customer-add/321` |
| 库存 | 管理页 | `#/main/product-stock` | `https://dev-admin.wkea.cn/#/main/product-stock` |
| 库存 | 仓库管理 | `#/main/product-warehouse` | `https://dev-admin.wkea.cn/#/main/product-warehouse` |
| 产品配置器 | 本地HTML | `/tmp/wkea-product-page-{slug}.html` | 浏览器直接打开 |
