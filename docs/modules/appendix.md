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

### 前置步骤

生成所有后台链接前，先运行以下命令获取当前环境的真实地址：

```bash
cd wkea-cli && node dist/index.js urls
```

返回示例：
```json
{
  "manageMainUrl": "https://dev-admin.wkea.cn/",
  "ecUrl": "https://dev.wkea.cn/"
}
```

用这两个返回值拼接链接，**严禁猜测或硬编码域名**。

### 链接拼接规则

```
manageMainUrl（带尾随斜杠）+ #/main/{路由路径}/{参数}
ecUrl（带尾随斜杠）+ {页面路径}?{参数}
```

### 各模块链接格式

| 模块 | 操作 | 链接拼接方式 | 完整示例 |
|------|------|-------------|---------|
| 供应商 | 详情/编辑 | `manageMainUrl + "#/main/supplier-add/" + vendorId` | `https://dev-admin.wkea.cn/#/main/supplier-add/42` |
| 品牌 | 详情/编辑 | `manageMainUrl + "#/main/product-addbrand/" + brandId` | `https://dev-admin.wkea.cn/#/main/product-addbrand/5` |
| SPU | 详情/编辑 | `manageMainUrl + "#/main/product-group-list?id=" + spuId` | `https://dev-admin.wkea.cn/#/main/product-group-list?id=123` |
| SKU | 详情/编辑 | `manageMainUrl + "#/main/product-edit/" + skuId` | `https://dev-admin.wkea.cn/#/main/product-edit/W001084186` |
| 需求询价 | 详情 | `manageMainUrl + "#/main/demandInquiryDetails/" + demandId` | `https://dev-admin.wkea.cn/#/main/demandInquiryDetails/667` |
| 报价单 | 后台查看 | `manageMainUrl + "#/main/inquiry-order/" + id` | `https://dev-admin.wkea.cn/#/main/inquiry-order/89` |
| 报价单 | 客户分享 | `ecUrl + "share-order.html?shareId=" + shareId` | `https://dev.wkea.cn/share-order.html?shareId=abc123` |
| 销售订单 | 详情 | `manageMainUrl + "#/main/order-details/" + orderId` | `https://dev-admin.wkea.cn/#/main/order-details/456` |
| 销售合同 | 详情 | `manageMainUrl + "#/main/sale-contractDetails/" + id` | `https://dev-admin.wkea.cn/#/main/sale-contractDetails/789` |
| 客户 | 详情/编辑 | `manageMainUrl + "#/main/customer-add/" + id` | `https://dev-admin.wkea.cn/#/main/customer-add/321` |
| 库存 | 管理页 | `manageMainUrl + "#/main/product-stock"` | `https://dev-admin.wkea.cn/#/main/product-stock` |
| 库存 | 仓库管理 | `manageMainUrl + "#/main/product-warehouse"` | `https://dev-admin.wkea.cn/#/main/product-warehouse` |
| 产品配置器 | 本地页面 | `/tmp/wkea-product-page-{spuId或slug}.html` | 直接浏览器打开本地文件 |
