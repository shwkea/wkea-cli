# WKEA CLI — 项目总览

## 技术栈

| 层 | 技术 |
|----|------|
| 语言 | TypeScript 5.3+ (strict) |
| CLI 框架 | Commander.js v12 |
| HTTP | axios 1.6+ |
| 文件存储 | cos-nodejs-sdk-v5 (external, 不打包) |
| 打包 | esbuild (bundle, target node20, shebang) |
| 配置 | ~/.wkea/config.json |
| npm 包 | wkea-manage-cli v1.0.47 |

## 目录结构

```
src/
├── index.ts            入口: 注册15模块 + 自定义 help/manifest
├── api/                17 个 API 文件
│   ├── client.ts       ApiClient (axios + token + 401单例重登录)
│   └── <module>.ts     CRUD API + checkResponse
├── commands/           15 个命令模块 (150+ 子命令)
│   ├── vendor/        13 文件 (crud/list/contact/bank/invoice/address/url...)
│   ├── product/        6 文件 (spu/sku/supply/spec/attribute/quick-create)
│   ├── demand/         4 文件 (crud/list/parse/process)
│   ├── customer/       关联 CRUD
│   ├── stock/         库存+仓库
│   ├── sales-order/   销售订单+发货+退货
│   ├── sales-contract/合同+转订单
│   ├── quotation/     报价单+分享
│   └── progress/      任务进度
├── config/            ~/.wkea/config.json 读写
├── types/             TypeScript 类型
└── utils/             printer/formatter/file/validators
```

## 命令列表 (15 模块, 150+ 子命令)

### 系统命令

| 命令 | 参数 | 功能 |
|------|------|------|
| `init` | --api-url --username --password | 配置 API + 登录 |
| `whoami` | 无 | 登录验证, 输出用户卡片 |
| `enum` | --type &lt;名称&gt; | 枚举值查询 (树形, 支持模糊匹配) |
| `update` | 无 | git pull + npm install + npm run build |
| `upload` | --file --type --sub | COS 文件上传 |

### 业务模块

| 模块 | 子命令数 | 代表性命令 |
|------|---------|-----------|
| `brand` | 16 | create/get/update/delete/list, bind-vendors/categories, urls |
| `vendor` | 27 | crud/list/dropdown, brands/categories, contact/bank/invoice/address/url, bind-all, merge, extra-columns |
| `product spu` | 20+ | create/get/update/delete/list, spec/attribute bind, es-search, separator, spec-values, categories |
| `product sku` | 15+ | create/get/update/delete/list/clone, spec-values, extra-columns, replace, batch-shelf |
| `product supply` | 10 | bind-vendor, vendors, supply-list, set-master, sku set/list/get/delete/batch/summary |
| `product spec` | 6 | list/add/unbind, param list/add/delete |
| `product attribute` | 9 | crud/list, spu/sku bind |
| `product quick-create` | 1 | --spu-name --specs(JSON) --sku(JSON多值) |
| `demand` | 12 | crud/list, items, parse(AI SSE), quote-to-vendor, save-price |
| `sales-order` | 11 | crud/list, cancel/confirm/confirm-payment, ship/back-order, deliveries |
| `sales-contract` | 9 | crud/list, transfer-order, line CRUD |
| `stock` | 16 | crud/list, switch-unit, automatic-splitting, expired, warehouses |
| `customer` | 20+ | crud/list, address/invoice/bank/contact CRUD |
| `quotation` | 5 | create/get(add-item/remove-item)/share |
| `progress` | 4 | create/step/get/list |

## API 三层封装

```
CLI命令 → API函数(checkResponse) → ApiClient(axios+token+401重登录)
```

**输出模式**: `formatJsonWithFields()` JSON+字段说明表格 | `--save-json` 写 /tmp/ | success/error/info

**后端三套 API**: `/api/manage/passport/`(登录) + `/api/manageV2/<module>/`(CRUD) + `/api/ec/`(枚举+COS)

## 已知坑点

1. checkResponse 每个 API 文件重复定义
2. config.json 明文存密码
3. npm run build 三步耦合 (esbuild+cp+zip)
4. 无测试覆盖 (npm test = echo + exit 0)
5. cos-nodejs-sdk-v5 作为 external 不打包
6. target node20 硬依赖
7. AI 接口 (demand parse) 60s 超时风险
