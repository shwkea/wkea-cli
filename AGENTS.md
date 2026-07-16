# Agent Context & Instructions

## 项目介绍

wkea-cli 是 WKEA 后台管理的 **CLI + Agent 专家团**，分为两部分：

1. **CLI 工具**：通过 `node dist/index.js <command>` 对 WKEA 后台执行增删改查操作，底层走 axios 调 `wkea-api` Java 后端
2. **WorkBuddy 专家团插件**（`plugins/wkea-expert-team/`）：定义 8 个业务专家（需求/产品/供应商/品牌/客户/报价/库存/销售）+ 1 个队长，配有人设和 7 个工作流文档。更新时同步到 `~/.workbuddy/plugins/`

## 技术约定

- **后端接口三套路径**：
  - `/api/manage/passport/` — 登录/验证
  - `/api/manageV2/<module>/` — **所有业务 CRUD**（vendor、brand、product、demand、stock 等）
  - `/api/ec/` — 电商接口（枚举查询 `/api/ec/set/type/all`、COS 凭证）
- **TypeScript + Commander.js v12**：入口 `src/index.ts`，esbuild 打包为 `dist/index.js`，target node20
- **配置目录**：运行时配置在 `~/.wkea/config.json`（apiUrl/username/account/password/token/updatedAt），不在项目目录。另有本地调试用的 `wkea-manage-cli.config.json`
- **ApiClient 自动重登录**：共享单例 Promise（`reloginPromise`）防止并发 401 触发多次重登录
- **Schema 扩展**：Commander 原型挂 `.schema()` 方法，`--manifest` 导出时带 JSON Schema
- **`--save-json` 机制**：输出过长时加 `--save-json` 写完整数据到 `/tmp/wkea-cli-json/`
- **HTML 报告系统**：`docs/` 下有 report-spec.md（规范）、report-template.html（需求处理）、report-template-quote-save.html（报价保存）、product-page-template.html（产品配置页），统一蓝色 `#4f6ef7` 主题，写到 `/tmp/wkea-{task}-{id}.html`
- **`marked` 库**：用于 Markdown 转 HTML（报告中的 `aiRemark` 折叠行）
- **无测试**：`npm test` 直接 exit 0，当前零测试覆盖

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
  utils/        打印、格式化、字符串处理（unescape shell args）、校验、文件 I/O（saveJsonToFile）
  hooks/        auth.ts requireAuth() 鉴权钩子
  constants/    enums.ts 硬编码枚举参考（AI 备用）
plugins/        WorkBuddy 插件
  wkea-expert-team/
    plugin.json    注册 8 专家 + 1 队长
    agents/        9 个 agent 人设 markdown + 2 个未注册评估专家（source-supplier-evaluator、preferred-supplier-confirm）
    workflows/     7 个工作流文档（01 需求询价处理 ~ 07 供应商报价录入）
    avatars/       9 个专家头像
docs/           模块业务文档（modules/ 下十六个 md）、报告模板 HTML、dev-guide.md
scripts/        pack.js 打包脚本
```

## 模块及核心子命令

### 系统命令

| 命令 | 功能 |
|------|------|
| `init` | 配置 API 地址和登录凭证（`--api-url`/`--username`/`--password`，支持部分更新） |
| `whoami` | 重新登录 + 显示用户信息卡片（ID/姓名/手机/邮箱/职位/企微ID/token 前缀/登录时间） |
| `enum --type <name>` | 实时从 `/api/ec/set/type/all` 查枚举值 |
| `urls` | 获取 manageMainUrl 和 ecUrl |
| `update` | git pull + npm install + npm build |
| `upload --file <path> [--type <type>] [--sub <name>]` | 上传文件到腾讯 COS（支持 product/spu/sku/demand/brand/vendor/customer/general 路径） |

### vendor 供应商管理（12 组，~25+ 命令）

CRUD（create/get/update/delete）、list、dropdown、bind-brands/brands/unbind-brand、bind-categories/categories/unbind-category、bind-all（原子绑定品牌+分类）、merge（`--from-id`/`--to-id` 合并，可选 `--move-brands`/`--move-categories`/`--move-products`）、extra-columns（get/set 动态字段）、contact/bank/invoice/address CRUD、vendor-url CRUD、superior-category CRUD（优势分类含 priority）、tags 标签管理、certificates 证书管理

### brand 品牌管理（~12 命令）

CRUD、list、bind-vendors/vendors/unbind-vendor、bind-categories/categories/unbind-category、url CRUD

### product 产品管理（6 组）

- **spu**：CRUD + list + specs 绑定 + attributes 绑定 + alternatives 替代品
- **sku**：CRUD + list + stock 库存 + supply 供应 + alternatives 替代品
- **supply**：add/list/remove
- **spec**：bind/unbind（规格组/规格值）
- **attribute**：bind/unbind
- **quick-create**：一键创建 SPU + 规格（自动检测）+ 多个 SKU（`-s` 多标志）

### demand 需求询价（~20 命令）

CRUD、list、**parse `--text <自由文本>`**（调 `https://ai.wkea.cn/api/chat` SSE 流式 AI 解析为结构化需求项）、**items**（add-item/update-item/delete-item/complete-item）、quote-to-vendor/quoted-vendors/vendor-quotes、quote-save-info/quote-save-price、get-vendors-by-brand/select-vendor、simple-create-product（从需求项创建 SPU/SKU）、claim（领取需求）

### quotation 报价单（5 命令）

create、get、add-items、remove-item、share

### stock 库存（~15 命令）

CRUD、list、switch-unit（单位转换）、automatic-splitting（自动拆分包装）、expired-products/over-60-days（临期/老化库存）、move-expired/move-over-60-days-to-discount（移库）、buy-info（采销历史）、warehouse CRUD、sku-exist-stock（检查 SKU 有无库存）

### sales-order 销售订单（~12 命令）

CRUD、list、cancel/confirm/confirm-payment（审核流程）、create-ship-order/ship（发货）、back-return（回库）、deliveries/outbound-orders（追踪）

### sales-contract 销售合同（~12 命令）

CRUD、list、transfer-order（转订单）、line CRUD（行项目管理）

### customer 客户（~16 命令）

CRUD、list、address/invoice/bank/contact 各自 CRUD

### progress 任务进度（4 命令）

create（`--tasks <json>` 步骤数组）、get、step（`--step-index <n>` 逐步骤完成，返回当前/下一步/剩余步骤）、list

### guide 业务文档

`progress guide` 读取 `docs/modules/progress.md` 输出业务文档。模式可扩展到任意模块。

## env 枚举参考

常用枚举类型通过 `enum --type <name>` 查询：supplierTag（供应商标签）、brandLevel（品牌等级）、demandStatus（需求状态）、quotationStatus（报价状态）、orderStatus（订单状态）、stockUnit（库存单位）等。

## 关键文档引用

- `docs/modules/binding-rules.md` — 供应商↔品牌↔分类三方绑定矩阵（9 节参考）
- `docs/modules/extra-columns.md` — 6 模块动态字段扩展系统（文本/数字/日期/选择/布尔/邮箱/电话/链接）
- `docs/modules/progress.md` — 任务进度业务方法论文档
- `docs/report-spec.md` — HTML 报告规范（8 节，aiRemark 折叠行，链接 target="_blank"，URL 必须来自 `urls` 命令输出）
- `SKILL.md` — AI Agent 完整操作规则（15 条 P0-P15 优先级规则）
- `SKILL-atomic.md` — 精简版目标驱动执行规则（6 条，不用 guide 命令）

## 插件专家团

### 已注册 Agent（8+1）

| Agent | 人设名 | 职责 |
|-------|--------|------|
| team-lead | 小嘉 | 队长/调度 |
| demand-expert | 谭知行 | 需求询价处理 |
| product-expert | 管立品 | 产品 SPU/SKU |
| vendor-expert | 原启诚 | 供应商开发 |
| brand-expert | 姚承志 | 品牌管理 |
| customer-expert | 宋知信 | 客户管理 |
| quotation-expert | 卢文耀 | 报价单管理 |
| stock-expert | 沈知诚 | 库存管理 |
| sales-expert | 钟启元 | 销售订单与合同 |

### 未注册评估专家

- `source-supplier-evaluator` — 源头供应商评估，工信部百十万千培育名单双门模型
- `preferred-supplier-confirm` — 品牌首选供应商确认，硬阈值+加权阈值评分四梯队

### 工作流文档（7 个）

`01-需求询价处理.md` `02-产品开发供应商.md` `03-产品开发.md` `04-品牌开发供应商.md` `05-产品配置与上架.md` `06-供应商评估与确认.md` `07-供应商报价录入.md`

## 部署与更新

- **npm 包**：`wkea-manage-cli`，`.npmignore` 只发布 `dist/` 和 `docs/`
- **使用指南**：`使用指南.html` 部署到 `https://orther.wkea.cn/cli/`（`upload.js` SSH 上传）
- **AI 更新流程**：`git fetch && git log HEAD..origin/master` 检测 → `git pull && npm install && npm run build` → 同步专家插件到 `~/.workbuddy/plugins/`

## Commit 规范

- 一句大白话说明本次提交干了什么
- 不用 emoji 前缀（如 📝Docs、✨Feat、🐛Bug、♻Refactor 等都不写）
- 可多行补充细节，但首行必须可独立阅读

## 常见操作

```bash
npm run dev          # ts-node 直接跑
npm run build        # esbuild 打包到 dist/
npm run link         # build 后 npm link 全局安装
node dist/index.js --help           # 看所有模块
node dist/index.js <module> --help  # 看某模块子命令
node dist/index.js --manifest       # 导出完整命令树 JSON（含 .schema() 定义的 JSON Schema）
node dist/index.js enum --type <name>  # 查枚举值
node dist/index.js urls              # 获取环境 URL（报告链接必须从此命令取）
```
