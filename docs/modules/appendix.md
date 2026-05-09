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

## 2. 跳转链接汇总

写操作后必须提供后台跳转链接。先获取 `manageMainUrl`：`wkea-manage-cli system urls`

| 模块 | 操作 | 链接格式 |
|------|------|---------|
| 供应商 | 详情/编辑 | `{manageMainUrl}#/main/supplier-add/{vendorId}` |
| 品牌 | 详情/编辑 | `{manageMainUrl}#/main/product-addbrand/{brandId}` |
| SPU | 详情/编辑 | `{manageMainUrl}#/main/product-group-list?id={spuId}` |
| SKU | 详情/编辑 | `{manageMainUrl}#/main/product-edit/{skuId}` |
| 需求询价 | 详情 | `{manageMainUrl}#/main/demandInquiryDetails/{demandId}` |
| 报价单 | 后台列表 | `{manageMainUrl}#/main/inquiry-order/{id}` |
| 报价单 | 客户分享 | `{ecUrl}/share-order.html?shareId={shareId}` |
| 销售订单 | 详情 | `{manageMainUrl}#/main/order-details/{orderId}` |
| 销售合同 | 详情 | `{manageMainUrl}#/main/sale-contractDetails/{id}` |
| 客户 | 详情/编辑 | `{manageMainUrl}#/main/customer-add/{id}` |
| 库存 | 管理页 | `{manageMainUrl}#/main/product-stock` |
| 库存 | 仓库管理 | `{manageMainUrl}#/main/product-warehouse` |
