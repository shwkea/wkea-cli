# WKEA CLI 开发参考

> wkea-manage-cli 是 AI 代理操作后台系统的核心入口，封装 manageV2 REST API 为 CLI 命令。
> 版本: v1.0 | 创建: 2026-05-09

---

## 一、项目结构

```
wkea-cli/
├── src/
│   ├── index.ts              # CLI 入口，注册所有模块
│   ├── config/
│   │   └── index.ts          # 配置读写（~/.wkea/config.json）
│   ├── api/
│   │   ├── client.ts         # ApiClient（axios 封装、自动重登录）
│   │   ├── brand.ts          # 品牌 API
│   │   ├── vendor.ts         # 供应商 API
│   │   ├── demand.ts         # 需求询价 API
│   │   ├── sales-order.ts    # 销售订单 API
│   │   ├── stock.ts          # 库存 API
│   │   ├── customer.ts       # 客户 API
│   │   ├── quotation.ts      # 报价单 API
│   │   ├── sales-contract.ts # 销售合同 API
│   │   ├── vendor-contact.ts # 供应商联系人 API
│   │   ├── superior-category.ts
│   │   ├── system.ts         # 系统 API（urls 等）
│   │   └── product/          # 产品 API（spu/sku/supply/spec/...）
│   ├── commands/
│   │   ├── brand.ts          # 品牌命令
│   │   ├── vendor/           # 供应商命令（多文件模块）
│   │   ├── product/          # 产品命令
│   │   ├── demand/           # 需求命令
│   │   ├── sales-order/      # 销售订单命令
│   │   ├── stock/            # 库存命令
│   │   ├── customer/         # 客户命令
│   │   ├── quotation/        # 报价单命令
│   │   ├── sales-contract/   # 销售合同命令
│   │   └── ...               # 系统命令（init/auth/enum/skills/setup/system）
│   ├── types/
│   │   ├── vendor.ts
│   │   ├── brand.ts
│   │   ├── demand.ts
│   │   ├── customer.ts
│   │   └── superior-category.ts
│   ├── constants/
│   │   └── enums.ts          # 枚举值文档（AI 使用）
│   ├── hooks/
│   │   └── auth.ts           # 鉴权 hook
│   └── utils/
│       ├── formatter.ts      # 输出格式化
│       └── printer.ts        # 控制台输出（success/error/info）
├── docs/
│   ├── skills-business.md    # 业务逻辑文档（AI 使用）
│   ├── skills-system.md      # CLI 工具用法文档
│   └── setup-guide.md        # 初始化引导
├── package.json
└── tsconfig.json
```

---

## 二、API 层规范

### 2.1 文件结构

每个后端模块对应一个 `api/<module>.ts` 文件。格式：

```typescript
import { ApiClient, ApiResponse } from './client';

const MODULE_BASE = '/api/manageV2/business/<module>';     // V2 路径

// ============ helpers ============

function checkResponse<T>(resp: ApiResponse<T>): T {
  if (resp.status !== 200) {
    throw new Error(resp.msg || `请求失败(${resp.status})`);
  }
  return resp.data;
}

// ============ DTO ============

export interface CreateXxxDto {
  /** 字段描述（JSDoc 会被 AI Skill 读取） */
  name: string;
  // ...
}

// ============ API functions ============

export async function createXxx(
  client: ApiClient,
  dto: CreateXxxDto
): Promise<string> {
  const resp = await client.post<ApiResponse<string>>(`${MODULE_BASE}`, dto);
  return checkResponse(resp);
}
```

### 2.2 路径规范

CLI 统一调用 `/api/manageV2/business/` 路径下的 V2 接口：

| 模块 | API Base 路径 | 后端 Controller |
|------|--------------|-----------------|
| 供应商 | `/api/manageV2/business/vendor` | `VendorManageController` |
| 品牌 | `/api/manageV2/business/brand` | `BrandManageController` |
| SPU | `/api/manageV2/business/spu` | `ProductSpuController` |
| SKU | `/api/manageV2/business/sku` | `ProductSkuController` |
| 需求询价 | `/api/manageV2/business/demand` | `DemandManageController` |
| 销售订单 | `/api/manageV2/business/sales-order` | `SalesOrderManageController` |
| 报价单 | `/api/manageV2/business/quotation` | `QuotationManageController` |
| 库存 | `/api/manageV2/business/stock` | `StockManageController` |
| 客户 | `/api/manageV2/business/customer` | `CustomerManageController` |
| 销售合同 | `/api/manageV2/business/sales-contract` | `SalesContractManageController` |

### 2.3 DTO 规范

- JSDoc 注释必须包含 `@see ENUM_DOC` 引用（如果有枚举字段）
- 枚举值用行内注释说明含义，方便 AI 推理
- 必填字段加 `/** 必填 */` 注释
- 字段名用驼峰，与后端 DTO 保持一致

```typescript
/**
 * 创建供应商
 * @see ENUM_DOC 供应商类型: 106=原厂 107=授权经销商 236=品牌方 237=总代理 238=其他
 * @see ENUM_DOC 付款期限: 94=现款提货 95=货到15天 96=货到30天
 */
export interface CreateVendorDto {
  /** 供应商名称（必填） */
  name: string;
  /** 供应商类型 (106=原厂 107=授权经销商) */
  type?: number;
}
```

### 2.4 API 函数规范

| 方法 | HTTP | 用途 |
|------|------|------|
| `createXxx(client, dto)` | POST | 创建，返回 ID |
| `getXxxDetail(client, id)` | GET | 详情，返回 VO |
| `updateXxx(client, id, dto)` | PUT | 更新，返回 void |
| `deleteXxx(client, id)` | DELETE | 删除，返回 void |
| `listXxx(client, dto)` | POST | 分页列表，返回 PageResult |

---

## 三、命令层规范

### 3.1 注册模式

每个模块使用 `registerXxxCommands(program: Command)` 函数注册子命令：

```typescript
// 单文件模块（如 brand.ts）
export function registerBrandCommands(brand: Command) {
  // CRUD 子命令
  brand
    .command('create')
    .description('创建品牌')
    .requiredOption('--name <name>', '品牌名称（必填）')
    .option('--keyword <keyword>', '别名/关键词')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        // ... 业务逻辑
        success(`创建成功，品牌ID: ${result}`);
      } catch (e: any) {
        error(e);
        process.exit(1);
      }
    });
}
```

### 3.2 多文件模块

复杂模块（vendor、product、demand）拆分为多个文件：

```
commands/vendor/
├── index.ts              # 汇总导出 registerVendorCommands
├── crud.ts               # 主 CRUD（create/get/update/delete/list/dropdown）
├── contact.ts            # 联系人
├── brands.ts             # 品牌绑定
├── categories.ts         # 分类绑定
├── advanced.ts           # 优势分类
├── address.ts            # 地址
├── bank.ts               # 银行
├── invoice.ts            # 发票
├── list.ts               # 列表（如果逻辑复杂独立）
└── ...
```

`index.ts` 汇总注册：

```typescript
import { Command } from 'commander';
import { registerCrudCommands } from './crud';
import { registerContactCommands } from './contact';

export function registerVendorCommands(program: Command) {
  registerCrudCommands(program);
  registerContactCommands(program);
  // ...
}
```

### 3.3 Option 命名规范

| 规则 | 示例 |
|------|------|
| 多词用短横线 | `--brand-id`, `--customer-name` |
| 必填参数用 `requiredOption` | `.requiredOption('--id <id>', '...')` |
| 可选参数用 `option` | `.option('--keyword <keyword>', '...')` |
| 布尔开关不加 `<value>` | `.option('--is-cooperation', '设为合作品牌')` |
| 值与参数名一致 | `--vendor-id <vendorId>` |

### 3.4 Action 逻辑模版

```typescript
.action(async (opts) => {
  const client = new ApiClient(getApiUrl());
  try {
    // 1. 构建 DTO（仅传有值的字段）
    const dto: Record<string, unknown> = {
      name: opts.name,
    };
    if (opts.keyword) dto.keyword = opts.keyword;

    // 2. 调用 API
    const result = await createXxx(client, dto as any);

    // 3. 输出结果
    success(`创建成功，ID: ${result}`);
    // 或（查询类命令）：
    console.log(formatJsonWithFields(data, FIELDS));
  } catch (e: any) {
    error(e);
    process.exit(1);
  }
});
```

### 3.5 错误处理规范

- 所有 `action` 必须包 try/catch
- catch 中调用 `error(e)` 输出错误信息
- 错误后 `process.exit(1)` 退出
- 不吞异常，不让用户看到空白输出

```typescript
try {
  // ...
} catch (e: any) {
  error(e);
  process.exit(1);
}
```

### 3.6 Schema 注解（可选）

对于复杂命令，可以用 `schema()` 附加参数说明（用于 --manifest 输出）：

```typescript
// 在命令定义后附加
demand
  .command('create')
  .schema({
    customerId: { type: 'string', desc: '客户ID', required: true },
    topic: { type: 'string', desc: '主题', required: true },
  })
// ...
```

---

## 四、类型定义规范

### 4.1 types/*.ts

后端返回的 VO 定义为 TypeScript 接口，放在 `types/<module>.ts`：

```typescript
// types/demand.ts
export interface DemandDetailVo {
  id: number;
  type: number;
  customerId: string;
  customerName: string;
  status: number;
  // ...
  items: DemandItemVo[];
}
```

**规则**：
- 只定义 CLI 命令中实际用到的字段，不必穷举后端全部字段
- 字段名与后端 VO 驼峰一致
- 可选字段用 `?` 标记

### 4.2 字段定义数组（用于格式化输出）

在命令文件中定义 `FIELDS` 常量，控制输出格式：

```typescript
const DEMAND_FIELDS = [
  { field: 'id', type: 'number', desc: '需求ID' },
  { field: 'customerName', type: 'string', desc: '客户名称' },
  { field: 'status', type: 'number', desc: '状态(274待处理,275处理中,276已完成)' },
];
```

**规则**：
- `desc` 中包含枚举值含义（AI 可读）
- `type` 为 `string`/`number`/`boolean`/`array`/`datetime`
- 按业务重要性排序，ID 在最前

---

## 五、输出格式规范

### 5.1 Printer 工具

```typescript
import { success, error, info, warn } from '../utils/printer';

success('操作成功')           // → "  [OK] 操作成功"
error(someError)              // → "  [ERR] ..." (含堆栈解析)
info('处理中...')              // → "  处理中..."
warn('注意：xxx')              // → "  [WARN] 注意：xxx"
```

### 5.2 Formatter 工具

```typescript
import { formatJsonWithFields, formatOperation } from '../utils/formatter';

// 详情输出（JSON + 字段说明表）
console.log(formatJsonWithFields(data, DETAIL_FIELDS));

// 列表输出（总数 + JSON + 字段说明）
console.log(formatList(data, LIST_FIELDS, { total, current, size }));

// 操作结果（简短的文本）
success(formatOperation('创建成功', `订单ID: ${orderId}`));
```

---

## 六、开发前设计审查

> 开始编码之前，必须先完成设计审查。**这一步缺失是线上漏洞和参数缺失的第一大原因。**

### 6.1 逻辑漏洞审查

逐条检查以下问题，全部确认后才可进入开发：

#### 6.1.1 一对多字段的编辑安全性

**风险场景**：编辑接口中包含一对多关联字段（如品牌的 `vendorsId`、SPU 的 `categoryId`），AI 调用时"只改了名字没传关联字段"，API 端收到空数组 → 全部删除。

```
错误设计：
  brand update --brand-id 1 --name "新名称"
  → 底层 DTO 中 { name: "新名称", vendorsId: undefined }
  → API 把 undefined 解析为 "清空所有供应商" ❌

正确设计：
  brand update --brand-id 1 --name "新名称"
  → 只改 name 字段，vendorsId 根本不在 update 参数中 ✅
  → 关联关系通过独立命令管理：
      brand bind-vendor    --brand-id 1 --vendor-id S001    ✅
      brand unbind-vendor  --brand-id 1 --vendor-id S001    ✅
```

**审查规则**：
- 编辑接口的 DTO 中**不能包含**一对多关联字段（`vendorsId`、`categoryId`、`items` 等）
- 关联关系必须通过**独立的绑定/解绑命令**管理
- 创建接口的 DTO 可以包含一对多字段（一次性传值），但编辑不行
- 如果旧 API 的编辑接口混入了关联字段，CLI 的 update 命令**必须跳过**这些字段，不传

#### 6.1.2 状态机/流转操作的安全性

**风险场景**：订单、需求等有状态流转的实体，AI 可能跳过中间状态直接操作。

```
错误操作（跳过状态）：
  order create → order ship（跳过了 confirm 和 payment）❌

正确流程：
  order create → order confirm → order confirm-payment → order ship ✅
```

**审查规则**：
- 需确认 API 端是否做了状态校验（非法流转应返回 400）
- 业务文档必须写明状态流转路径
- 如 API 端无校验，CLI 层应不做补偿（由后端统一拦截）

#### 6.1.3 级联操作的告知义务

**风险场景**：删除操作有级联影响，但 AI 直接删了没告诉用户。

**审查规则**：
- 所有删除命令前，必须先 get 展示详情
- 业务文档必须写明级联清理范围（删 A 会同时清掉哪些关联数据）
- CLI 本身不应做二次确认（由 P3 原则约束 AI 行为）

#### 6.1.4 幂等与增量语义

**风险场景**：绑定操作是全量替换还是增量追加？AI 重复调用会不会产生重复数据？

```
品牌绑定供应商：
  ┊ POST /bind-vendors { vendorIds: [1, 2] }  → 绑定 1 和 2
  ┊ POST /bind-vendors { vendorIds: [2, 3] }  → 增量模式：只新增 3，1 和 2 不变 ✅
                                                   全量模式：删 1，保留 2，新增 3 ❌
```

**审查规则**：
- 确认 API 端是增量模式还是全量模式
- 如是全量模式，CLI 参数文档必须明确标注"全量替换，不传的将被删除"
- 业务文档写明"增量绑定：已有绑定自动跳过"

---

### 6.2 查询参数完整性审查

> List 命令的查询参数**不能只满足当前需求**，要考虑真实业务中用户会怎么查。

#### 6.2.1 常见查询维度

对每个 list 命令，逐项检查是否支持以下查询维度：

| 维度 | 示例场景 | 参数 |
|------|---------|------|
| **关键词搜索** | 搜产品名、品牌名 | `keyword` |
| **精确匹配** | 按 ID、编号搜 | `id`、`sku`、`orderId` |
| **负责人/操作人** | "查张三负责的供应商" | `manageId`、`createdBy` |
| **时间范围** | "查今天上架的"、"上个月的订单" | `createdTimeBegin`、`createdTimeEnd` |
| **关联实体** | "查某供应商代理的品牌" | `vendorId`、`brandId`、`categoryId` |
| **状态筛选** | "查待处理的订单" | `status`（支持多值） |
| **布尔标记** | "只查合作品牌" | `isCooperation`、`isFeatured` |
| **金额/数量范围** | "查 100~500 元的产品" | `minPrice`、`maxPrice`、`minStock` |
| **地理位置** | "查广东的客户" | `province`、`city` |
| **业务分类** | "查电动工具类产品" | `categoryId`、`type` |
| **所属分组** | "查核心供应商" | `groupId`、`customerGroupId` |

**审查方法**：针对每个模块，写出 5~10 个真实查询场景，然后对照参数表检查是否都能覆盖。

```
示例 — 供应商列表查询场景：
  1. "搜名字带'深圳'的供应商"                          → keyword ✅
  2. "查供应商 S00434 的信息"                          → id ✅
  3. "查张三负责的供应商"                               → manageId ❌ 缺失
  4. "查上周新注册的供应商"                             → createdTimeBegin/End ❌ 缺失
  5. "查既卖'3M'又卖'施耐德'的供应商"                    → brandId（多值）❌ 缺失
  6. "查广东的供应商"                                  → province ❌ 缺失
  7. "查合作品牌是'精选'的供应商"                        → isFeatured ❌ 缺失
```

#### 6.2.2 时间范围参数规范

时间范围参数统一使用以下命名：

```
--created-time-begin "2026-01-01 00:00:00"
--created-time-end   "2026-04-29 23:59:59"
--updated-time-begin "2026-01-01"
--updated-time-end   "2026-04-29"
```

> 时间范围使用闭区间（begin ≤ time ≤ end），格式统一为 `yyyy-MM-dd HH:mm:ss` 或 `yyyy-MM-dd`。

#### 6.2.3 参数组合的文档说明

如果某些参数之间有关联关系（如 A 参数必须在 B 参数启用时才有意义），必须在 `--help` 或业务文档中说明：

```
# 好的写法（--help）：
  --vendor-id <id>      按供应商筛选（可与 --brand-id 组合使用）
  --is-cooperation      只筛选合作品牌

# 好的写法（业务文档）：
  供应商列表支持 keyword（名称模糊搜索）和 manageId（负责人精确筛选）组合使用。
  不传任何筛选项时返回全量分页数据。
```

---

## 七、开发工作流

### 7.1 新增命令的完整流程

0. **设计审查** — 完成第 6 节的全部审查项
1. **确认 API** — 后端 manageV2 接口已实现，路径为 `/api/manageV2/business/<module>`
2. **定义类型** — 在 `types/` 添加 VO 接口
3. **编写 API 层** — 在 `api/` 添加 API 函数（DTO 定义 + checkResponse）
4. **编写命令** — 在 `commands/` 添加子命令（option 定义 + action 逻辑）
5. **注册命令** — 在 `index.ts` 中注册新模块
6. **编译验证** — `npm run build` 零错误
7. **业务文档** — 更新 `docs/skills-business.md`（见第 8 节）

### 7.2 编译命令

```bash
npm run build          # tsc 编译到 dist/
npm run link           # build + npm link（本地测试）
npx tsc --noEmit       # 仅类型检查（快速）
```

### 7.3 枚举值查询

CLI 运行时可查枚举：

```bash
wkea-manage-cli enum --type 供应商类型
wkea-manage-cli enum --type 订单状态
```

枚举值也在 `constants/enums.ts` 中以 `ENUM_DOC` 常量维护，JSDoc 中引用：

```typescript
/** @see ENUM_DOC 供应商类型: 106=原厂 107=授权经销商 */
```

---

## 八、业务文档更新规范

### 8.1 skills-business.md 更新时机

每次新增或修改命令后，必须同步更新 `docs/skills-business.md`：

**必须更新的场景**：
- ✅ 新增模块（如新增库存模块 → 补充库存的业务概念和操作流程）
- ✅ 新增命令（如新增 `demand claim` → 补充领取需求的业务流程）
- ✅ 修改业务逻辑（命令参数变更、业务流程调整）
- ✅ 新增业务概念（如新增附加列系统 → 补充说明）

**无需更新的场景**：
- ❌ 纯 bug 修复（不影响业务逻辑）
- ❌ 输出格式调整（不影响操作流程）
- ❌ API 层重构（不改变命令行为）

### 8.2 skills-business.md 结构

```
# 通用原则
- P0~P5 执行原则

# 各业务模块
## SPU → SKU
## 供应商管理（6 步流程）
## 品牌管理
## 产品管理
## 需求询价管理（6 步流程）
## 报价单管理
## 销售订单管理（状态流转 + 核心操作）
## 销售合同管理
## 库存管理
## 枚举参数
## 数据删除与关联清理
```

### 8.3 编写原则

- **只写业务逻辑，不写命令参数**（`--help` 已有）
- **写操作流程**（先做什么、再做什么）
- **写业务规则**（什么字段必填、什么操作有副作用、什么场景会级联删除）
- **写枚举值含义**（状态码说明）
- **写判断逻辑**（规格 vs 属性的区别标准）

---

## 九、关键模式总结

### 9.1 标准 CRUD 命令模式

```typescript
// 创建
.command('create')
.description('创建XXX')
.requiredOption('--name <name>', '名称（必填）')
.option('--field <field>', '字段说明')
.action(async (opts) => { ... });

// 详情
.command('get')
.description('查询XXX详情')
.requiredOption('--id <id>', 'ID（必填）')
.action(async (opts) => { ... });

// 更新
.command('update')
.description('更新XXX')
.requiredOption('--id <id>', 'ID（必填）')
.option('--name <name>', '新名称')
.action(async (opts) => { ... });

// 删除
.command('delete')
.description('删除XXX')
.requiredOption('--id <id>', 'ID（必填）')
.action(async (opts) => { ... });

// 列表
.command('list')
.description('XXX列表')
.option('--keyword <keyword>', '搜索关键词')
.option('--page <page>', '页码', '1')
.option('--size <size>', '每页条数', '20')
.action(async (opts) => { ... });
```

### 9.2 Action 统一模板

```typescript
.action(async (opts) => {
  const client = new ApiClient(getApiUrl());
  try {
    // 构建参数
    const dto: Record<string, unknown> = {};
    if (opts.name) dto.name = opts.name;
    // 调用 API
    const result = await someApi(client, dto as any);
    // 输出
    success(`操作成功: ${result}`);
  } catch (e: any) {
    error(e);
    process.exit(1);
  }
});
```

---

## 十、API 路径速查

| 操作 | HTTP | 路径模式 |
|------|------|---------|
| 创建 | POST | `/api/manageV2/business/{module}` |
| 详情 | GET | `/api/manageV2/business/{module}/{id}` |
| 更新 | PUT | `/api/manageV2/business/{module}/{id}` |
| 删除 | DELETE | `/api/manageV2/business/{module}/{id}` |
| 列表 | POST | `/api/manageV2/business/{module}/list` |
| 级联操作 | POST | `/api/manageV2/business/{module}/{id}/{action}` |
| 绑定 | POST | `/api/manageV2/business/{module}/{id}/bind-{target}s` |
| 查询绑定 | GET | `/api/manageV2/business/{module}/{id}/{target}s` |
| 解绑 | DELETE | `/api/manageV2/business/{module}/{id}/{target}/{targetId}` |
| 扩展字段 | GET/PUT | `/api/manageV2/business/{module}/{id}/extra-columns` |

---

## 十一、测试流程

> 每次新增或修改命令后，必须按以下三阶段完成测试，缺一不可。

### 总览

```
Phase 1 - API 自测
  ├─ 启动 API 项目
  ├─ 获取 Token
  └─ 直测 API 接口（数据结构/状态码/边界）
        │
        ▼ 通过
Phase 2 - CLI 自测
  ├─ 编译 CLI
  ├─ 简单链路（核心 CRUD 正常走通）
  └─ 边界测试（缺参/异常数据/错误处理）
        │
        ▼ 通过
Phase 3 - 子任务模拟测试（核心环节）
  ├─ 准备模拟数据
  ├─ 仅以 skills 输出为知识
  ├─ 简单场景（正常链路覆盖所有参数）
  ├─ 复杂场景（边界参数/层级关系/每个参数单独验证）
  └─ 评估执行结果合理性
```

---

### 11.1 Phase 1 — API 自测
### 11.2 Phase 2 — CLI 自测
### 11.3 Phase 3 — 子任务模拟测试（核心环节）
### 11.4 测试完成标准

- [ ] Phase 1：API 所有接口返回 200，数据正确写入
- [ ] Phase 2：CLI 所有命令正常执行，错误场景合理
- [ ] Phase 3：简单测试全部通过，复杂测试全部通过
- [ ] Phase 3：所有参数经验证有效，层级关系清晰
- [ ] Phase 3：子任务仅凭 skills 文档即可独立完成

任何 Phase 失败 → 修 bug → 从 Phase 1 重新开始。

---

*文档版本: v1.1*
*创建时间: 2026-05-09*
*关联文档: 管理V2接口开发参考.md、skills-business.md、skills-system.md*
