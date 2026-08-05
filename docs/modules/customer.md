# 客户管理操作指南

> **命令参数以 `<command> --help` 为准。** 以下命令示例仅说明操作流程，具体参数不要照抄，先跑 `--help` 查看完整参数列表后再执行。

## 核心概念

### 客户是系统交易主体

客户代表系统中的买家。每个客户可维护 **4 个子集合**：

| 子集合 | 说明 |
|--------|------|
| 地址 | 收货地址列表 |
| 发票 | 开票信息 |
| 银行账户 | 收款/付款银行账户 |
| 联系人 | 对接联系人信息 |

### 客户基本信息

| 字段 | 说明 |
|------|------|
| `name` | 客户名称 |
| `account` | 客户账号 |
| `managerId` | 客户经理 |
| `phone` | 联系电话 |
| `enterpriseType` | 企业类型 |
| `channelSource` | 渠道来源 |
| `isBlacklist` | 黑名单标记 |

### 删除级联

删除客户会**级联清理所有子集合**（地址、发票、银行账户、联系人），删除前务必先展示详情确认。

## 常用操作

### 查重（创建前必做）

- `customer list --name <名称>` — 精确搜索，按名称查重（参数见 `--help`）
- `customer list --phone <手机号>` — 精确搜索，按手机号查重（参数见 `--help`）

**不要用无参 `customer list`** 查重，全量列表效率低且容易遗漏。

### 创建客户

推荐一次性传全部数据：

- `customer create --name "<名称>" --phone "<手机号>" ...` — 创建客户，逐字段传参（参数见 `--help`）
- `customer create --address-list '<JSON>' --invoice-list '<JSON>' --bank-list '<JSON>' --contact-list '<JSON>'` — 创建客户时一次性传入子集合 JSON（地址/发票/银行/联系人，参数见 `--help`）

### 查询与验证

- `customer get --id <id>` — 查看客户详情（参数见 `--help`）
- `customer list --name <名>` — 按名称搜索客户（参数见 `--help`）

### 子集合管理

**地址：**
- `customer create-address --customer-id <id> --receive-name <收货人> ...` — 添加地址（参数见 `create-address --help`）
- `customer list-addresses --customer-id <id>` — 查看地址列表（参数见 `list-addresses --help`）
- `customer update-address --customer-id <id> --address-id <地址ID> ...` — 更新地址（参数见 `update-address --help`）
- `customer delete-address --customer-id <id> --address-id <地址ID>` — 删除地址（参数见 `delete-address --help`）

**发票：**
- `customer create-invoice --customer-id <id> --invoice-header <抬头> ...` — 添加发票信息（参数见 `create-invoice --help`）
- `customer list-invoices --customer-id <id>` — 查看发票列表（参数见 `list-invoices --help`）
- `customer update-invoice --customer-id <id> --invoice-id <发票ID> ...` — 更新发票信息（参数见 `update-invoice --help`）
- `customer delete-invoice --customer-id <id> --invoice-id <发票ID>` — 删除发票信息（参数见 `delete-invoice --help`）

**银行账户：**
- `customer create-bank --customer-id <id> --account <账号> ...` — 添加银行账户（参数见 `create-bank --help`）
- `customer list-banks --customer-id <id>` — 查看银行账户列表（参数见 `list-banks --help`）
- `customer update-bank --customer-id <id> --bank-id <银行ID> ...` — 更新银行账户（参数见 `update-bank --help`）
- `customer delete-bank --customer-id <id> --bank-id <银行ID>` — 删除银行账户（参数见 `delete-bank --help`）

**联系人：**
- `customer create-contact --customer-id <id> --name <姓名> ...` — 添加联系人（参数见 `create-contact --help`）
- `customer list-contacts --customer-id <id>` — 查看联系人列表（参数见 `list-contacts --help`）
- `customer update-contact --customer-id <id> --contact-id <联系人ID> ...` — 更新联系人（参数见 `update-contact --help`）
- `customer delete-contact --customer-id <id> --contact-id <联系人ID>` — 删除联系人（参数见 `delete-contact --help`）

### 删除客户

- `customer get --id <id>` — 先查看客户详情，确认要删除的客户（参数见 `--help`）
- `customer delete --id <id>` — 删除客户，级联清理子集合（参数见 `--help`）

## 数据校验

创建后立刻验证：

```bash
customer get --id <id>                      # 确认基本信息
customer list-addresses --customer-id <id>  # 确认地址
customer list-invoices --customer-id <id>   # 确认发票信息
customer list-banks --customer-id <id>      # 确认银行账户
customer list-contacts --customer-id <id>   # 确认联系人
```

### 缺了什么该提醒业务人员

- **名称未查重** → 创建前必须用 `--name` 精确搜索，避免重复建客户
- **手机号缺失** → 手机号是关键联系信息，建议填写
- **客户经理未指定** → 建议指定 managerId，否则后续无负责人
- **黑名单客户操作** → 黑名单客户创建订单/合同时要提醒确认
- **子集合数据缺失** → 创建订单需要收货地址时，先确认客户下是否有地址

## 常见错误

- **用无参 list 查重** → 数据量大时翻页找不全，必须用 `--name` 或 `--phone` 精确搜索
- **建了重复客户** → 同一客户以不同名称创建了多次，查重不充分
- **创建订单前不确认客户** → 客户不存在导致订单创建失败
- **删客户不先看子集合** → 删除客户级联清理所有子集合数据，不可恢复
- **子集合只增不删** → 地址、发票等过期数据堆积，需定期清理
- **黑名单客户直接下单** → 应先确认黑名单原因，特殊处理后再操作
