# wkea-cli 开发规范

> 版本：2026-07-28

本文档解释 wkea-cli 的架构设计和开发约定。

---

## 1. 架构概览

```
SKILL.md（AI 启动入口 + 执行原则 P0-P16 + 更新流程）
     ↓
CLI 操作层（src/commands/ + src/api/）
  - 200+ 命令行，涵盖 vendor / brand / product / demand / quotation / stock / sales-order / sales-contract / customer 等模块
  - 每个命令自带 --help 输出全部参数
  - 实际通过 `node dist/index.js <command>` 调用
     ↓
Java API 层（wkea-api）
```

## 2. 目录结构

```
src/
  index.ts      入口：注册所有模块命令，自定义 --help 排版，--manifest 导出
  api/          HTTP 客户端 + 各模块 API 函数（manageV2 接口为主）
    client.ts   ApiClient：Axios 封装，自动 token 注入，401 单例重登录
  commands/     按模块分目录，每个目录含 index.ts 聚合 + 子命令文件
  config/       读写 ~/.wkea/config.json
  types/        DTO 类型定义
  utils/        打印、格式化、字符串处理、校验、文件 I/O
  hooks/        auth.ts 鉴权钩子
  constants/    enums.ts 硬编码枚举参考
docs/           模块业务文档（modules/）、报告模板 HTML、report-spec.md
```

## 3. 开发约定

### 新增命令

1. 在对应模块的 commands 目录下添加命令文件
2. 用 Commander.js v12 的 `.command()` / `.option()` / `.requiredOption()` 定义
3. 在 API 层添加对应的 API 调用函数
4. 在模块的 `index.ts` 注册新命令
5. 编译验证：`npx tsc --noEmit`

### CLI 命令参数说明

- 每个 option 的 description 应简短说明参数含义
- 涉及价格字段需加 "（⚠️ 仅供应商正式报价时填写）" 等提示
- 枚举类型注明 "enum --type <类型> 查看可用值"
- 默认行为标注如 "（不传则后端自动处理）"

### AI 可读性

CLI 通过 `--manifest` 导出完整命令树 JSON 供 AI 阅读。确保每个命令的 description 和 option description 足够清晰，AI 只通过这些文字理解命令用途。

## 4. 常用命令

```bash
npm run dev          # ts-node 直接跑
npm run build        # esbuild 打包到 dist/
node dist/index.js --help           # 看所有模块
node dist/index.js <module> --help  # 看某模块子命令
node dist/index.js --manifest       # 导出完整命令树 JSON
```
