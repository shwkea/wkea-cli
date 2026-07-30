# WKEA CLI — 项目总览

## 技术栈

| 层 | 技术 |
|----|------|
| 语言 | TypeScript 5.3+ |
| CLI 框架 | Commander.js v12 |
| HTTP | axios 1.6+ |
| 文件存储 | cos-nodejs-sdk-v5 |
| 打包 | esbuild (bundle, target node20) |
| 配置 | ~/.wkea/config.json |

## 目录结构

```
src/
├── index.ts           入口: 注册所有模块命令
├── api/               17 个 API 模块
│   ├── client.ts      ApiClient (axios + token + 401重登录)
│   └── <module>.ts    DTO + API 函数
├── commands/          15 个命令模块
│   ├── vendor/       10 文件 (crud/list/brands/categories/contact...)
│   ├── product/       6 文件 (spu/sku/supply/spec/attribute)
│   ├── demand/        5 文件 (crud/list/parse/process)
│   └── ...
├── types/             TypeScript 类型定义
├── utils/             printer/formatter/file 等
└── constants/         硬编码枚举参考
```

## 命令列表

| 模块 | 子命令 |
|------|--------|
| init | 配置 API + 登录 |
| whoami | 登录验证 |
| enum | 枚举值查询 |
| brand | crud/list, bind-vendors/categories, urls |
| vendor | crud/list, brands/categories, contact/bank/invoice/address, merge |
| product | spu/sku crud, supply, spec/attribute bind, quick-create |
| demand | crud/list, parse, items, quote-to-vendor, save-price |
| customer | crud/list, address/invoice/bank/contact |
| stock | crud/list, switch-unit, warehouse |
| sales-order | crud/list, cancel/confirm, ship, deliveries |
| sales-contract | crud/list, transfer-order |
| upload | COS 文件上传 |

## API 封装模式

三层架构: CLI命令 → API函数(`checkResponse`+打包) → ApiClient(`axios`+token注入+401单例重登录)。输出: `formatJsonWithFields()` JSON+字段说明表格。大结果: `--save-json` 写 `/tmp/wkea-cli-json/`。

## 已知坑点

1. checkResponse 每个模块重复定义
2. config.json 明文存密码
3. `npm run build` 三步耦合 (esbuild+cp+zip)
4. 无测试覆盖 (`npm test` 空占位)
5. cos-nodejs-sdk-v5 作为 external 不打包
6. target node20, 旧版 Node 无法运行
