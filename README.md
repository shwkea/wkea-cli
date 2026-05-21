# wkea-cli

WKEA 后台管理 CLI 工具，以 OMC 技能方式运行。仓库即技能目录。

## 安装与初始化

```bash
git clone https://github.com/shwkea/wkea-cli <skills目录>/wkea
cd <skills目录>/wkea
npm install
npm run build
node dist/index.js init       # 配置 API 地址和登录凭证
node dist/index.js whoami     # 验证登录
```

## 使用方法

```bash
node dist/index.js <command> --help    # 查看命令详细用法
node dist/index.js <模块名> guide       # 查看模块业务文档
```

## 更新

```bash
git pull && npm install && npm run build
```

## AI 安装（复制给 AI）

```
帮我安装 WKEA CLI 技能：
1. git clone https://github.com/shwkea/wkea-cli 到 skills 目录
2. cd 到目录，npm install && npm run build
3. 运行 node dist/index.js init，配置 API 地址和登录凭证
4. 运行 node dist/index.js whoami 验证登录是否成功
5. 运行 node dist/index.js -h 看看有哪些模块，用你自己的话告诉我安装好了、能做什么
```
