# 销售订单管理操作指南

> **命令参数以 `<command> --help` 为准。** 以下命令示例仅说明操作流程，具体参数不要照抄，先跑 `--help` 查看完整参数列表后再执行。

## 核心概念

### 订单状态机

```
创建(110) → 确认(115) → 确认付款(111) → 创建发货单(112) → 发货(113) → 回库(114)
                                              ↘ 取消(109) → 删除
```

| 状态码 | 含义 |
|--------|------|
| 109 | 已取消 |
| 110 | 待审核 |
| 111 | 待付款 |
| 112 | 待发货 |
| 113 | 已发货 |
| 114 | 已完成 |
| 115 | 已确认 |
| 219 | 售后中 |

**状态不可重复流转**，操作前确认当前状态。例如已确认(115)的订单不能再次确认。

**各状态允许的操作**：

| 当前状态 | 允许的操作 |
|---------|-----------|
| 110（待审核） | confirm、cancel |
| 115（已确认） | confirm-payment、cancel |
| 111（待付款） | create-ship-order、cancel |
| 112（待发货） | ship |
| 113（已发货） | back-order |
| 109（已取消） | delete |
| 114（已完成） | 无（终态） |

### 订单三层数据结构

**第一层 — 订单头**
| 字段 | 说明 |
|------|------|
| `customerId` | 必填，客户 ID |
| `manageId` | 必填，负责人 ID |
| `distributionMode` | 必填，配送方式（枚举） |
| `payType` | 必填，支付方式（枚举） |
| `hasFreight` | 是否有运费 |
| `customerFreight` | 客户运费金额 |

**第二层 — 收货信息**
| 字段 | 说明 |
|------|------|
| `consignee` | 必填，收货人姓名 |
| `phone` | 必填，收货人电话 |
| `address` | 必填，详细地址 |
| `province` | 可选，省份 |
| `city` | 可选，城市 |
| `area` | 可选，区县 |

**第三层 — 行项目（JSON 键名：`orderItems`）**
| 字段 | 说明 |
|------|------|
| `productSkuId` | 必填，SKU ID |
| `amount` | 必填，数量 |
| `price` | 可选，不填则使用 SKU 销售价 |
| `discount` | 可选，折扣，范围 0.01~1 |

### 常用物流公司

| 公司 | 编码 |
|------|------|
| 顺丰 | 57 |
| 德邦 | 58 |
| 安能 | 59 |
| 货拉拉 | 60 |

## 常用操作

### 创建订单

- `sales-order create --data '<JSON>'` — 创建销售订单，传入完整三层结构 JSON（参数见 `--help`）

**`create --data` 完整三层 JSON 示例**：

```json
{
  "customerId": "客户ID",
  "manageId": "负责人ID",
  "distributionMode": 118,
  "payType": 支付方式枚举ID,
  "hasFreight": false,
  "customerFreight": 0,
  "orderInfo": {
    "consignee": "收货人",
    "phone": "13800000000",
    "address": "详细地址",
    "province": "省",
    "city": "市",
    "area": "区"
  },
  "orderItems": [
    { "productSkuId": "W000000001", "amount": 2, "price": 120, "discount": 1 },
    { "productSkuId": "W000000002", "amount": 5 }
  ]
}
```

创建前必须先确认客户存在（见 [customer.md](customer.md)）。

### 查询订单

- `sales-order list` — 查询全部订单列表（参数见 `--help`）
- `sales-order list --customer-name <名>` — 按客户名筛选订单（参数见 `--help`）
- `sales-order list --sku <SKU>` — 按 SKU 筛选订单（参数见 `--help`）
- `sales-order list --status "[110,111]"` — 按状态码筛选订单，JSON 数组写法（参数见 `--help`）
- `sales-order list --min-price <金额>` — 按最低金额筛选订单（参数见 `--help`）
- `sales-order list --max-price <金额>` — 按最高金额筛选订单（参数见 `--help`）
- `sales-order get --id <订单ID>` — 查看订单详情（参数见 `--help`）

### 状态流转

- `sales-order confirm --id <id>` — 确认审核，状态 110 → 115（参数见 `--help`）
- `sales-order confirm-payment --id <id> --payment-time "<时间>"` — 确认付款，状态 115 → 111（参数见 `--help`）
- `sales-order create-ship-order --id <id> --items '<json>'` — 创建发货单，状态 111 → 112（参数见 `--help`）
- `sales-order ship --id <id> --deliver-id <id> --tracking-number <号>` — 发货，状态 112 → 113（参数见 `--help`）
- `sales-order back-order --id <id>` — 回库，状态 113 → 114（参数见 `--help`）
- `sales-order cancel --id <id>` — 取消订单，状态 → 109（参数见 `--help`）
- `sales-order delete --id <id>` — 删除订单，仅 109 状态可删（参数见 `--help`）

## 数据校验

创建后立刻验证：

```bash
sales-order get --id <id>       # 确认订单详情，核对三层数据是否完整
sales-order list --id <id>      # 确认订单出现在列表中
```

### 缺了什么该提醒业务人员

- **没有客户 ID** → 先用 `customer create` 或 `customer list --name <名>` 确认客户
- **收货信息不完整** → 提醒补全收货人、电话、地址（这 3 个必填）
- **行项目为空** → 订单至少要有 1 个行项目
- **SKU 不存在** → 先用 `product sku list --keyword <型号>` 确认 SKU
- **配送方式/支付方式不确定** → 这两个是枚举值，确认后再操作
- **物流单号缺失** → 发货时必须填写 `--tracking-number`

## 常见错误

- **重复确认** → 已确认(115)的订单不能再确认，先查状态
- **跳过付款直接发货** → 必须先 `confirm-payment` 将状态流转到 111，才能创建发货单
- **被取消的订单不能恢复** → 取消不可逆，需重新创建
- **删除非已取消订单** → 只有状态 109 的订单才能删除
- **不传 price 以为免费** → 不传 price 会用 SKU 销售价，不是免费
- **discount 填写 0** → 折扣范围 0.01~1，0 是无效值
- **发货不填物流单号** → 发货时必须填写 tracking-number，否则无法追踪
