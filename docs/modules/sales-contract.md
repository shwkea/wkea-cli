# 销售合同管理操作指南

> **命令参数以 `<command> --help` 为准。** 以下命令示例仅说明操作流程，具体参数不要照抄，先跑 `--help` 查看完整参数列表后再执行。

## 核心概念

### 合同与订单的关系

```
合同（约定）→ 转订单（执行）
```

- **合同**：约定交易条款，不代表实际发货
- **转订单**：将合同内容转为销售订单，进入实际履约流程
- **删除合同不影响已转的订单**：合同删除后，已生成的订单独立存在，不受影响

### 合同数据结构

合同包含：
- 基本信息：客户、负责人、合同名称等
- 行项目：合同中约定的商品明细（SKU、数量、价格、折扣等）

### 关键约束

- **合同无行项目不能转订单**：至少要有 1 个行项目
- **配送方式/支付方式是枚举值**：必须使用系统中已定义的枚举
- **转订单时负责人设为当前操作者**：不继承合同的负责人字段
- **转订单时 customerFreight 默认 0**：运费需单独设置
- **转订单时 hasFreight 默认否**：运费标记默认关闭

## 常用操作

### 合同 CRUD

- `sales-contract create --data '<JSON>'` — 创建合同（参数见 `--help`）
- `sales-contract list` — 查看合同列表（参数见 `--help`）
- `sales-contract get --id <id>` — 查看合同详情（参数见 `--help`）
- `sales-contract update --id <id> --data '<JSON>'` — 更新合同（参数见 `--help`）
- `sales-contract delete --id <id>` — 删除合同（参数见 `--help`）

**`create --data` JSON 字段说明**：

| 字段 | 必填 | 说明 |
|------|------|------|
| `customerId` | 是 | 客户 ID |
| `demandCompany` | 否 | 需方单位名称，可当作合同名称使用 |
| `demandBankName` | 否 | 需方开户银行名称 |
| `demandBankAccount` | 否 | 需方开户银行账号 |
| `demandDutyParagraph` | 否 | 需方税号 |
| `demandAddress` | 否 | 需方地址 |
| `demandTel` | 否 | 需方电话 |
| `demandRepresentative` | 否 | 需方业务代表人 |
| `demandContactPhone` | 否 | 需方联系方式 |
| `remark` | 否 | 备注 |
| `lines` | 是 | 行项目数组，每项：`sku`（必填）、`unit`（必填，单位枚举 ID，469=pcs）、`amount`（必填，数量）、`price`（可选，不填则用 SKU 销售价）、`sort`（可选，排序） |

> **负责人**：合同创建时由系统记录为当前操作者（`createdByName`），`create` 不需要传负责人；转订单时的负责人才用 `transfer-order --manage-id` 指定。

**完整 JSON 示例**：

```json
{
  "customerId": "客户ID",
  "demandCompany": "某某科技有限公司",
  "demandBankName": "招商银行某某支行",
  "demandBankAccount": "622588****1234",
  "demandDutyParagraph": "91110108MA01XXXXXX",
  "demandAddress": "北京市海淀区某某路 1 号",
  "demandTel": "010-88888888",
  "demandRepresentative": "张三",
  "demandContactPhone": "13800000000",
  "remark": "示例销售合同",
  "lines": [
    { "sku": "W000000001", "unit": 469, "amount": 10, "price": 120 },
    { "sku": "W000000002", "unit": 469, "amount": 5 }
  ]
}
```

### 行项目管理

- `sales-contract create-line --contract-id <合同ID> --sku <SKU> --unit <单位ID> --amount <数量> [--price <单价>] [--sort <排序>]` — 添加行项目（参数见 `--help`）
- `sales-contract list-lines --contract-id <合同ID>` — 查看行项目列表（参数见 `--help`）
- `sales-contract update-line --contract-id <合同ID> --line-id <行项目ID> [--sku <SKU>] [--unit <单位ID>] [--amount <数量>] [--price <单价>] [--sort <排序>]` — 更新行项目（参数见 `--help`）
- `sales-contract delete-line --contract-id <合同ID> --line-id <行项目ID>` — 删除行项目（参数见 `--help`）

### 合同转订单

- `sales-contract transfer-order --id <合同ID>` — 将合同转为销售订单（参数见 `--help`）

转订单前确认：
1. 合同下至少有一个行项目
2. 客户状态正常（非黑名单）
3. 所有行项目的 SKU 仍然有效

## 数据校验

创建后立刻验证：

```bash
sales-contract get --id <id>                     # 确认合同基本信息
sales-contract list-lines --contract-id <id>     # 确认行项目是否齐全
sales-order list --customer-name <客户名>         # 转订单后确认订单已生成
```

### 缺了什么该提醒业务人员

- **合同没有行项目** → 无法转订单，先添加行项目
- **客户不存在** → 先用 `customer list --name <名>` 确认客户
- **SKU 已下架或不存在** → 确认行项目中的 SKU 是否仍然有效
- **配送方式/支付方式为空** → 合同必须指定这些枚举值
- **转订单后找不到订单** → 确认转订单是否成功，用 `sales-order list` 按客户名查

## 常见错误

- **删合同以为订单也删了** → 删除合同不影响已转订单，需要单独操作订单
- **空合同转订单** → 没有行项目的合同转订单会失败
- **修改已转订单的合同** → 合同转订单后，修改合同不会同步到订单
- **重复转订单** → 同一合同多次转订单会生成多个订单，确认前先检查是否已转过
- **行项目价格设为 0** → 如果不确定价格，不传 price 让系统用 SKU 销售价
