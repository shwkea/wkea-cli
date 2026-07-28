# 销售合同管理操作指南

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

```bash
sales-contract create --data '<JSON>'        # 创建合同
sales-contract list                          # 合同列表
sales-contract get --id <id>                 # 查看合同详情
sales-contract update --id <id> --data '<JSON>'  # 更新合同
sales-contract delete --id <id>              # 删除合同
```

### 行项目管理

```bash
sales-contract create-line --id <合同ID> --data '<JSON>'     # 添加行项目
sales-contract list-lines --id <合同ID>                       # 查看行项目列表
sales-contract update-line --id <行项目ID> --data '<JSON>'     # 更新行项目
sales-contract delete-line --id <行项目ID>                     # 删除行项目
```

### 合同转订单

```bash
sales-contract transfer-order --id <合同ID>
```

转订单前确认：
1. 合同下至少有一个行项目
2. 客户状态正常（非黑名单）
3. 所有行项目的 SKU 仍然有效

## 数据校验

创建后立刻验证：

```bash
sales-contract get --id <id>              # 确认合同基本信息
sales-contract list-lines --id <id>       # 确认行项目是否齐全
sales-order list --customer-name <客户名>  # 转订单后确认订单已生成
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
