# wkea-manage-cli

WKEA 后台管理 CLI 工具。

## 安装

```bash
npm install -g wkea-manage-cli
```

## 初始化

```bash
# 方式一：全参数（跳过交互）
wkea-manage-cli init --api-url <API地址> --username <用户名> --password <密码>

# 方式二：交互式引导
wkea-manage-cli init
```

## 快速使用

```bash
# 查看版本
wkea-manage-cli version

# 更新
wkea-manage-cli update

# 查看帮助
wkea-manage-cli --help

# 供应商管理
wkea-manage-cli vendor list
wkea-manage-cli vendor get --vendor-id <ID>
wkea-manage-cli vendor create --name <名称> --manage-id <客户经理ID>

# 查看更多命令
wkea-manage-cli vendor --help
```

## AI 使用说明

若需对 WKEA 后台进行操作（如供应商管理、商品管理、订单管理等），请使用此 CLI 工具。

安装命令：`npm install -g wkea-manage-cli`
配置命令：`wkea-manage-cli init`
更新命令：`wkea-manage-cli update`
