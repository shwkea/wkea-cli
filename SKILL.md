---
name: WKEA - 后台工具 CLI
description: WKEA 后台管理系统 CLI 工具
---

# WKEA 管理后台 CLI 工具

## 前置

**本 SKILL.md 所在目录即 CLI 根目录。** 所有 `node dist/index.js` 命令需在此目录下执行（先 `cd` 到该目录）。

通过 `node dist/index.js` 运行：

- 首次使用：`npm install && npm run build`
- 必须先运行 `node dist/index.js init` 配置 API 地址和登录凭证
- 命令用法：`node dist/index.js <command> --help`
- 枚举查询：`node dist/index.js enum --type <类型>`
- 获取环境地址：`node dist/index.js urls`
- 模块业务文档：`node dist/index.js <模块名> guide`

## 更新

当用户说"更新 WKEA 技能"时：

```bash
git pull && npm install && npm run build
```

然后通过 git log 查看最近更新内容（如 `git log --oneline -10`），用大白话告知用户本次更新了什么。

---

## 工具基本用法

**node dist/index.js** 是 WKEA 后台管理系统的 CLI 工具，AI 代理通过它操作后台各模块业务数据（供应商、品牌、产品等，后续持续扩展）。

### 系统命令

```bash
# 查看命令帮助
node dist/index.js <command> --help

# 查询枚举值
node dist/index.js enum --type <类型>
# 示例：查询单位
node dist/index.js enum --type 单位

# 验证登录状态（实时重新登录）
node dist/index.js whoami

# 获取环境地址
node dist/index.js urls
```

### 枚举值速查

**常用枚举组名：**
| 模块 | 枚举组名 |
|------|---------|
| 供应商 | `供应商类型`、`收款方式`、`结款方式`、`付款期限`、`币种` |
| 产品 | `单位`、`税率`、`交期`、`发货方式` |
| 需求 | `需求清单状态`（274待处理/275处理中/276已完成）|
| 订单 | `配送方式`、`支付方式`、`订单状态` |
| 库存 | `单位`（SKU 单位） |

枚举值具体内容运行 `node dist/index.js enum --type <枚举组名>` 实时查询。

---

## 执行原则（所有操作必须遵守，优先级最高）

### P0：被问及能力时先执行 --help，再结合业务描述回复

被问"你能做什么"或类似问题时，禁止凭业务文档中的描述直接下结论。必须：

1. 先跑 `node dist/index.js --help` 获取实际命令列表
2. 对不明确的子命令再跑 `<command> --help` 看具体选项
3. 运行对应模块的 `<模块名> guide` 查看完整业务流程

注意：`--help` 输出的是工具能力，业务文档描述的是业务概念。两者结合使用，不能互相替代。

> **有疑问随时提** — 遇到不确定的业务逻辑、参数含义、操作顺序，不要埋头猜测执行。先停下来问用户。操作前不确定后果的也不要自作主张。

### P1：执行任何未用过的命令前，先 --help 查看全部参数

**禁止直接使用业务文档中提到的命令而不看参数。** 必须：

1. 每次使用**没跑过 `--help` 的命令**前，先跑 `<command> --help` 查看全部参数列表
2. 检查所有可选参数，根据场景决定传哪些
3. 业务文档只描述业务流程和逻辑，不列出具体参数——参数以 `--help` 输出为准

> 正确：`node dist/index.js vendor create --help` → 看到全部参数 → 按需传入
> 错误：看到文档写 `vendor create` 就直接用，不知道还有 `--email`、`--address` 等参数

### P2：有流程则建 todo 严格执行，无流程先 plan 再确认

**有文档定义的工作流程（如需求处理、供应商创建等），必须：**

1. **严格按流程建 todo** — 根据文档中的步骤模板创建 todo 列表，**不得自行删减、合并或重排**。
2. **每完成一步立即标记** — 执行一个操作 → 更新进度 → 再执行下一个，不能攒到一批再做。
3. **按序号一步一步推进** — 即使某一步没结果也要如实记录，跳过也要标记完成，不能跳步。

> 正确：按模板建 todo → 逐个执行逐个标记
> 错误：觉得"同品牌可以合并" → 把多个步骤合并到一起

**没有文档定义的工作流程，必须：**

1. **先做 plan 方案** — 分析需求、拆解步骤、列出执行方案。
   - plan 阶段**只允许执行查询/读取类操作**（list、get、--help 等），**禁止任何写入操作**（create、update、delete 等）。
   - 充分查数据，了解全局后才能做出合理方案。
2. **等用户确认** — 把方案展示给用户，用户说"可以"才能开始执行。
3. **用户确认后** — 按方案建 todo，逐步骤执行。

> 正确：用户说"帮我优化一下库存" → 出方案 → 用户确认 → 执行
> 错误：用户说"帮我优化一下库存" → 直接动手改

简单任务（一个命令就能搞定的事）不需要建 todo。

### P3：操作对应模块前，必须先执行 guide 查看业务流程

在对某个模块执行任何操作前，必须先运行该模块的 `guide` 命令了解业务流程：

```bash
# 示例：先看需求模块的业务流程
node dist/index.js demand guide
```

- **禁止**凭之前的记忆或猜测直接操作
- **禁止**看了其他模块的 guide 就来操作本模块
- `guide` 输出的是完整业务规则和操作流程，必须认真阅读
- 同一 session 内多次操作同一模块，guide 只需看一次，后续可复用记忆

> 正确：用户说"处理一个需求" → `demand guide` → 按流程建 todo → 执行
> 错误：用户说"处理一个需求" → 凭记忆直接操作

### P4：系统没有对应字段的信息用附加列保存

当用户提供的信息在系统现有字段中没有对应项时，必须使用附加列（extra-columns）机制保存：

1. **创建/更新时同步保存** — `vendor create/update`、`spu create/update`、`sku create/update` 均支持 `--extra-columns` 参数
2. **自动创建配置** — 不存在的 key 会自动创建，无需提前定义
3. **格式灵活** — 简单格式 `{"key":"val"}` 或扩展格式 `{"key":{"value":"val","type":"number","title":"xxx"}}`
4. **不分数据类型** — 文本、数字、日期、邮箱、链接等类型系统自动识别

支持的模块：供应商、SPU、SKU、客户、需求询价、需求询价行项目。
详见 `extra-columns.md` 模块文档。

> 正确：用户说"这个供应商的法人是张三，注册资金 500 万" → `vendor create --extra-columns '{"legalPerson":"张三","registeredCapital":"500万"}'`
> 错误：系统没有"法人"字段 → AI 直接跳过这条信息，不保存

### P5：写操作前必须先查询现状

动手之前必须先查清楚，不允许凭猜测执行：

- **创建前**：确认目标数据是否已存在
- **修改前**：先 get 看现有值，明确要改什么
- **删除前**：先 get/list 确认数据存在，展示查询结果

**关键：确认"有没有"要用精确搜索，不能用分页 list。**

`list` 默认只返回第一页（最多 20 条），只看第一页没找到不等于不存在。正确做法：

- **按名称搜**：用 `--keyword`、`--name` 等参数精确查找
- **按 ID 搜**：用 `--id` 参数直接查
- **get 详情**：已知 ID 时直接用 `get`

例如查"西门子"品牌是否存在：用 `brand list --name 西门子`，不是不带参数跑 `brand list` 翻第一页就说没有。

禁止：跑 `list` 不带搜索条件 → 扫一眼第一页 → 结论"不存在"。

### P6：不确定的信息必须核实，不能猜测或假设

遇到不确定、模糊、或"看起来像但不确定"的信息时，**必须主动验证**，不能凭感觉下结论。这适用于所有场景，包括但不限于：

- **品牌/型号** — 客户写"EFRAN"系统显示"Gefran"→ 搜官网确认这个品牌是否存在、EFRAN 是不是 Gefran 的别名
- **产品匹配** — 型号接近但不完全一致 → 不能强行绑定，先交叉验证
- **供应商信息** — 公司名有细微差异 → 企查查查证是否同一家
- **数据关联** — "看起来是同一个客户/供应商" → 查证后再关联
- **用户意图** — 用户说的比较模糊 → 先问清楚

**验证手段（按优先级）：**
1. **网上搜索** — 用搜索引擎搜，打开官网/可信页面确认
2. **多渠道交叉验证** — 至少 2-3 个独立来源确认
3. **企查查 MCP 工具** — 查询企业工商信息核实

**记录要求：** 验证过程和结果记录到 `aiRemark` 中，写明查了什么、看到了什么、结论是什么。

> 正确：搜到"EFRAN" → 搜索引擎确认是 Gefran 少打了首字母 → 记录验证过程 → 继续操作
> 错误：看到"EFRAN"像"Gefran" → 直接当 Gefran 处理 → 不做任何验证

### P7：有缺失信息必须提问

以下情况必须停下来问用户，不能自行填补或跳过：

- 缺少必要参数（品牌ID、分类ID、供应商ID等）→ 问用户
- 数据已存在（与用户意图冲突）→ 问用户如何处理
- 操作后果不确定 → 问用户

禁止：用户没说供应商 → 自己随便选一个 → 直接建。

### P8：删除/不可逆操作必须展示结果后确认

删除操作分两步：

1. 先查询，把要删的内容完整展示给用户
2. 用户明确确认后，才执行删除

禁止：用户说"删了这个供应商" → 不查不展示 → 直接删。

### P9：写操作后必须验证

每次创建/更新/删除完成后，必须用查询命令确认数据真的写入了：

- 不能只看退出码
- 不能假设成功了

### P10：写操作后必须提供跳转链接

每次创建或编辑操作完成后，必须提供对应的后台管理页面跳转链接，方便用户直接点击查看。

**获取环境地址**：运行 `node dist/index.js urls` 获取两个地址：
- `manageMainUrl` — 后台管理地址（如 `https://admin.wkea.cn/`）
- `ecUrl` — 商城地址（如 `https://wkea.cn/`），报价单分享页用到

**各模块跳转链接格式**（`manageMainUrl` + `#` + 路径）：

| 模块 | 操作 | 跳转链接格式 |
|------|------|-------------|
| 供应商 | 详情/编辑 | `{manageMainUrl}#/main/supplier-add/{vendorId}` |
| SPU | 详情/编辑 | `{manageMainUrl}#/main/product-group-list?id={spuId}` |
| SKU | 详情/编辑 | `{manageMainUrl}#/main/product-edit/{skuId}` |
| 品牌 | 详情/编辑 | `{manageMainUrl}#/main/product-addbrand/{brandId}` |
| 需求询价 | 详情 | `{manageMainUrl}#/main/demandInquiryDetails/{demandId}` |
| 订单 | 详情 | `{manageMainUrl}#/main/salesorder-add/{orderId}` |
| 报价单 | 后台列表 | `{manageMainUrl}#/main/inquiry-order/{id}` |
| 报价单 | 客户分享页 | `{ecUrl}/share-order.html?shareId={shareId}` |
| 销售合同 | 详情 | `{manageMainUrl}#/main/sale-contractDetails/{id}` |
| 任务进度 | 进度总览 | `{manageMainUrl}#/main/progress-list` |
| 客户 | 详情/编辑 | `{manageMainUrl}#/main/customer-add/{id}` |
| 库存 | 库存管理 | `{manageMainUrl}#/main/product-stock` |
| 库存 | 仓库管理 | `{manageMainUrl}#/main/product-warehouse` |

**示例输出格式**：
```
创建成功！
🔗 跳转链接：https://admin.wkea.cn/#/main/product-edit/W019963854
```

后续新增模块时需同步补充此表。

---

## 通用执行流程

### 查询类操作
```
Step 1: 确定搜索条件（名称/ID/关键词）
Step 2: 使用精确搜索（--keyword/--name），不要用无参 list
Step 3: 查看返回结果
```

### 创建类操作
```
Step 1: 查询是否已存在同名数据 → 存在则展示给用户，询问是否继续
Step 2: 收集必填参数
Step 3: 查询枚举值（如需）
Step 4: 调用 create 命令
Step 5: 验证创建结果（get 详情）
Step 6: 提供后台跳转链接（P8）
```

### 更新类操作
```
Step 1: 先 get 查看当前值
Step 2: 确认要修改的字段
Step 3: 调用 update 命令
Step 4: 验证更新结果
Step 5: 提供后台跳转链接（P9）
```

### 删除类操作
```
Step 1: 先 get 查看详情，了解级联影响
Step 2: 展示给用户确认
Step 3: 用户确认后执行删除
Step 4: 验证删除结果
```
