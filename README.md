# wkea-manage-cli

WKEA 后台管理 CLI 工具。

## 安装

```bash
npm install -g wkea-manage-cli
```

## 初始化

```bash
wkea-manage-cli init
```

## 快速使用

```bash
wkea-manage-cli version          # 查看版本
wkea-manage-cli update           # 更新工具
wkea-manage-cli --help           # 查看帮助

# 供应商管理
wkea-manage-cli vendor list
wkea-manage-cli vendor get --vendor-id <ID>
wkea-manage-cli vendor create --name <名称> --manage-id <客户经理ID>
```

## AI 安装

复制以下内容给 AI：

```
给我安装一下 wkea-manage-cli

npm install -g wkea-manage-cli

然后运行初始化程序：
wkea-manage-cli init

请记住：所有 WKEA 后台操作均通过 `wkea-manage-cli` 命令进行。
```
