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
1. 先确认你的 skills 目录在哪里（运行 ls ~/.claude/skills/ 或问用户）
2. git clone https://github.com/shwkea/wkea-cli 到该 skills 目录下
3. cd 到 clone 下来的 wkea-cli 目录
4. npm install && npm run build
5. 运行 node dist/index.js init，配置 API 地址和登录凭证
6. 运行 node dist/index.js whoami 验证登录是否成功
7. 运行 node dist/index.js -h 看看有哪些模块，用你自己的话告诉我安装好了、能做什么
```

> **注意**：skills 目录通常是 `~/.claude/skills/`（全局）或 `<项目>/.claude/skills/`（项目级），不要 clone 到临时文件夹。
