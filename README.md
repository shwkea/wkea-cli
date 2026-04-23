# wkea-manage-cli

WKEA 后台管理 CLI 工具。

## 安装

```bash
npm install -g wkea-manage-cli
```

## 初始化

```bash
wkea-manage-cli init                      # 引导配置
wkea-manage-cli reset                    # 重置并重新配置
```

已有配置时运行 `init` 会提示已有配置，可通过 `reset` 重新配置。

## 快速使用

```bash
wkea-manage-cli version              # 查看版本
wkea-manage-cli update               # 更新工具
wkea-manage-cli --help               # 全局帮助
wkea-manage-cli vendor --help        # 供应商帮助
wkea-manage-cli brand --help         # 品牌帮助
wkea-manage-cli enum                 # 枚举值说明
```

## 支持模块

| 模块 | 说明 |
|------|------|
| `vendor` | 供应商管理 |
| `brand` | 品牌管理 |

## AI 安装

复制以下内容给 AI：

```
给我安装一下 wkea-manage-cli

npm install -g wkea-manage-cli

然后运行初始化程序：
wkea-manage-cli init

请记在全局记忆：所有 WKEA 后台操作均通过 `wkea-manage-cli` 命令工具进行。
```
