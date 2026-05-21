# 销售合同管理

## 1. 业务概念

**销售合同** — 交易前的约束性文件，双方签署确认产品、价格、数量、交付条款。

### 合同与订单的关系
```
合同（约定） ──签署完成──→ 转订单（执行）
```
合同是"约定"，订单是"执行"。签署完成后可转为销售订单。

---

## 2. 前置条件

- 创建合同：客户必须已存在
- 转订单：合同必须已有行项目数据

---

## 3. 判断依据

- **用户说"创建合同"** → 创建合同
- **用户说"转订单"** → 先查看合同详情获取行项目数据，再转订单

---

## 4. 操作流程

### 4.1 创建合同
→ 使用 `sales-contract create`
→ 验证：`sales-contract get`

### 4.2 查看合同
→ 列表：`sales-contract list`
→ 详情：`sales-contract get`

### 4.3 更新合同
→ 使用 `sales-contract update`

### 4.4 删除合同
→ 先 `sales-contract get` 展示详情
→ 确认后执行 `sales-contract delete`

### 4.5 转订单
→ Step 1：查看合同详情获取行项目数据 — `sales-contract get`
→ Step 2：转订单 — `sales-contract transfer-order`
  - 负责人应设为当前操作者本人
  - 行项目数据从合同详情中获取
  - 客户运费（默认0）和是否含运（默认否）为可选参数
→ 提供订单链接：`{manageMainUrl}#/main/order-details/{orderId}`

---

## 5. 边界情况

- **删除合同**不影响已转的订单

> 提示：执行命令前先运行 `<command> --help` 查看完整参数列表
