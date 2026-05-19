# 销售订单管理

## 1. 业务概念

**销售订单** — 客户下单后的交易执行记录，从采购到交付的完整链路。

### 订单状态流转
| 状态码 | 含义 | 说明 |
|--------|------|------|
| 109 | 已取消 | 订单作废 |
| 110 | 待审核 | 新创建订单的初始状态 |
| 111 | 待付款 | 审核通过，等待客户付款 |
| 112 | 待发货 | 已确认付款，等待发货 |
| 113 | 已发货 | 已录入物流信息 |
| 114 | 已完成 | 已回库/签收完成 |
| 115 | 已确认 | 已审核通过 |
| 219 | 售后中 | 订单有售后处理 |

### 流转路径
```
创建(110) → 确认(115) → 确认付款 → 创建发货单(112) → 发货(113) → 回库(114)
                                                      ↘ 取消(109) → 删除
```

### 订单数据结构（三层）
**第一层 — 订单头：**
- `customerId`（必填）— 客户 ID
- `manageId`（必填）— 负责人 ID
- `distributionMode`（必填）— 配送方式（查枚举）
- `payType`（必填）— 支付方式（查枚举）
- `hasFreight`、`customerFreight`（必填）— 运费信息

**第二层 — 收货信息 `orderInfo`：**
- `consignee`（必填）、`phone`（必填）、`address`（必填）
- `province`/`city`/`area`（可选）

**第三层 — 行项目 `orderItems`（数组）：**
- `productSkuId`（必填）、`amount`（必填）
- `price`（可选，不填使用 SKU 销售价）
- `skuUnit`（可选）、`discount`（可选 0.01~1）

---

## 2. 前置条件

- 创建订单：客户必须已存在
- 状态流转：订单必须在正确的当前状态才能执行下一步

---

## 3. 判断依据

| 当前状态 | 允许的操作 |
|---------|-----------|
| 110（待审核） | 确认、取消 |
| 115（已确认） | 确认付款、取消 |
| 112（待发货） | 先创建发货单，再发货 |
| 113（已发货） | 回库 |
| 109（已取消） | 删除 |
| 114（已完成） | 无 |

---

## 4. 操作流程

### 4.1 创建订单
→ 使用 `wkea-manage-cli sales-order create`
- 先确认客户存在
- 查询配送方式、支付方式枚举
- 按三层结构传入数据：订单头 + 收货信息 + 行项目
- 验证：`wkea-manage-cli sales-order get`
- 提供后台链接：`{manageMainUrl}#/main/order-details/{orderId}`

### 4.2 订单流转操作
→ 确认审核：`wkea-manage-cli sales-order confirm`
→ 确认付款：`wkea-manage-cli sales-order confirm-payment`
→ 创建发货单：`wkea-manage-cli sales-order create-ship-order`
→ 发货（录入物流）：`wkea-manage-cli sales-order ship`
→ 回库：`wkea-manage-cli sales-order back-order`
→ 取消：`wkea-manage-cli sales-order cancel`
→ 删除：`wkea-manage-cli sales-order delete`（仅可删除已取消的订单）

### 4.3 查询订单
→ 列表：`wkea-manage-cli sales-order list`（支持 customerName/status/sku/时间范围等筛选）
→ 详情：`wkea-manage-cli sales-order get`
→ 发货单列表：`wkea-manage-cli sales-order deliveries`
→ 出库单列表：`wkea-manage-cli sales-order outbound-orders`

---

## 5. 边界情况

- **常用物流公司**：顺丰快递(57)、德邦快递(58)、安能物流(59)、货拉拉物流(60)
- **订单不可重复流转**：状态不匹配时操作会失败
- **删除限制**：仅可删除已取消（109）的订单

> 提示：执行命令前先运行 `<command> --help` 查看完整参数列表
