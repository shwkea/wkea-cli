# Agent Context & Instructions

## 项目介绍

wkea-cli 是 WKEA 后台管理的 CLI 工具。AI 通过 `node dist/index.js <command>` 对 WKEA 后台执行增删改查操作，底层走 axios 调 `wkea-api` Java 后端。

## AI 操作规范

1. **定价铁律**：产品价格（salesPrice、purchasePrice、price）必须来自供应商正式报价或业务人员明确指示。**禁止从网上搜索价格填入产品**。网上了解到价格信息可写入报告或备注，不能作为产品定价。
2. **先查后改**：不确定参数时先 `--help` 看说明。参数标注"枚举ID"的用 `enum --type <枚举名>` 查可用值。
3. **不猜测数据**：任何数据（名称、型号、价格、数量等）必须有来源依据，不得捏造。
4. **提交必打包**：每次 commit 前必须先 `npm run build` 完成编译和打包，确保 `wkea-cli-skill.zip` 与代码同步。

## 技术约定

- **后端接口三套路径**：
  - `/api/manage/passport/` — 登录/验证
  - `/api/manageV2/<module>/` — **所有业务 CRUD**（vendor、brand、product、demand、stock 等）
  - `/api/ec/` — 电商接口（枚举查询 `/api/ec/set/type/all`、COS 凭证）
- **TypeScript + Commander.js v12**：入口 `src/index.ts`，esbuild 打包为 `dist/index.js`，target node20
- **配置目录**：运行时配置在 `~/.wkea/config.json`（apiUrl/username/account/password/token/updatedAt）
- **ApiClient 自动重登录**：共享单例 Promise（`reloginPromise`）防止并发 401 触发多次重登录
- **Schema 扩展**：Commander 原型挂 `.schema()` 方法，`--manifest` 导出时带 JSON Schema
- **`--save-json` 机制**：输出过长时加 `--save-json` 写完整数据到 `/tmp/wkea-cli-json/`
- **操作结果**：AI 完成操作后用文字汇报关键结果，包含 ID、变更内容、后台跳转链接
- **`marked` 库**：用于 Markdown 转 HTML（报告中的 `aiRemark` 折叠行）

## 输出工具约定

- `src/utils/printer.ts` 统一打印（`success()`/`error()`/`warn()`/`info()`/`heading()`）
- `src/utils/formatter.ts` 格式化表格（`formatJsonWithFields`、FIELD 数组定义字段文档）

## 目录结构

```
src/
  index.ts      入口：注册所有模块命令，自定义 --help 排版，--manifest 导出
  api/          HTTP 客户端 + 各模块 API 函数（manageV2 接口为主）
    client.ts   ApiClient：Axios 封装，自动 token 注入，401 单例重登录
  commands/     按模块分目录，每个目录含 index.ts 聚合 + 子命令文件
  config/       读写 ~/.wkea/config.json（loadConfig/saveConfig/getApiUrl/clearConfig）
  types/        DTO 类型定义（vendor/brand/customer/demand/superior-category）
  utils/        打印、格式化、字符串处理、校验、文件 I/O（saveJsonToFile）
  hooks/        auth.ts requireAuth() 鉴权钩子
  constants/    enums.ts 硬编码枚举参考（AI 备用）
docs/           模块业务文档（modules/）
```

## 模块及核心子命令

### 系统命令

| 命令 | 功能 |
|------|------|
| `init` | 配置 API 地址和登录凭证（`--api-url`/`--username`/`--password`，支持部分更新） |
| `whoami` | 重新登录 + 显示用户信息卡片 |
| `enum --type <name>` | 实时从 `/api/ec/set/type/all` 查枚举值 |
| `urls` | 获取 manageMainUrl 和 ecUrl |
| `update` | git pull + npm install + npm build |
| `upload --file <path> [--type <type>] [--sub <name>]` | 上传文件到腾讯 COS |

> **每个业务模块都有 `guide` 子命令**（如 `product guide`、`vendor guide`），运行后输出该模块的完整操作指南。
> 操作任何模块前，必须先跑 `<module> guide` 阅读核心概念、字段含义和常见错误。

### vendor 供应商管理

CRUD、list、dropdown、bind-brands/brands/unbind-brand、bind-categories/categories/unbind-category、bind-all、merge、extra-columns、contact/bank/invoice/address CRUD、vendor-url CRUD、superior-category CRUD、tags、certificates

### brand 品牌管理

CRUD、list、bind-vendors/vendors/unbind-vendor、bind-categories/categories/unbind-category、url CRUD

### product 产品管理

- **spu**：CRUD + list + specs 绑定 + attributes 绑定 + alternatives 替代品
- **sku**：CRUD + list + stock 库存 + supply 供应 + alternatives 替代品
- **supply**：add/list/remove + set-master（设置主供应商价格）
- **spec**：bind/unbind（规格组/规格值）
- **attribute**：bind/unbind
- **quick-create**：一键创建 SPU + 规格 + 多个 SKU

### demand 需求询价

CRUD、list、parse（AI 解析需求文本）、items（add/update/delete/complete）、quote-to-vendor/quoted-vendors/vendor-quotes、quote-save-info/save-price、vendors-by-brand、simple-create-product（行项目转产品）、claim

### quotation 报价单

create、get、add-items、remove-item、share

### stock 库存

CRUD、list、switch-unit（单位转换）、automatic-splitting（自动拆分包装）、warehouse CRUD

### sales-order 销售订单

CRUD、list、cancel/confirm/confirm-payment（审核流程）、create-ship-order/ship（发货）、back-return（回库）、deliveries/outbound-orders（追踪）

### sales-contract 销售合同

CRUD、list、transfer-order（转订单）、line CRUD

### customer 客户

CRUD、list、address/invoice/bank/contact CRUD

### progress 任务进度

create（`--tasks <json>` 步骤数组）、get、step（`--step-index <n>` 逐步骤完成）、list

## 关键文档引用

- `docs/modules/binding-rules.md` — 供应商↔品牌↔分类三方绑定矩阵
- `docs/modules/extra-columns.md` — 6 模块动态字段扩展系统
- `docs/modules/progress.md` — 任务进度业务方法论文档
- `SKILL.md` — CLI 完整操作规则

## 部署与更新

- **npm 包**：`wkea-manage-cli`，`.npmignore` 只发布 `dist/` 和 `docs/`
- **使用指南**：`使用指南.html` 部署到 `https://orther.wkea.cn/cli/`
- **更新流程**：`git fetch && git log HEAD..origin/master` 检测 → `git pull && npm install && npm run build`

## 常用操作

```bash
npm run dev          # ts-node 直接跑
npm run build        # esbuild 打包到 dist/
npm run link         # build 后 npm link 全局安装
node dist/index.js --help           # 看所有模块
node dist/index.js <module> --help  # 看某模块子命令
node dist/index.js --manifest       # 导出完整命令树 JSON（供 AI 阅读）
node dist/index.js enum --type <name>  # 查枚举值
node dist/index.js urls              # 获取环境 URL（报告链接必须从此命令取）
```
