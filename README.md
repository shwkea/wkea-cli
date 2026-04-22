# wkea-cli

WKEA CLI 工具 - 供应商管理

## 安装

```bash
npm install
npm run build
npm link
```

## 登录

```bash
wkea login --username <用户名> --password <密码> [--env prod|test]
```

## 供应商管理

```bash
# 列表
wkea vendor list [--page 1] [--page-size 20] [--keyword <关键词>]

# 详情
wkea vendor get --vendor-id <ID>

# 创建
wkea vendor create --name <名称> --contact <联系人> --phone <电话> [--address <地址>] [--email <邮箱>]

# 更新
wkea vendor update --vendor-id <ID> [--name <名称>] [--contact <联系人>] ...

# 删除
wkea vendor delete --vendor-id <ID>

# 品牌绑定
wkea vendor bind-brands --vendor-id <ID> --brand-ids <1,2,3>
wkea vendor brands --vendor-id <ID>
wkea vendor unbind-brand --vendor-id <ID> --brand-id <品牌ID>

# 分类绑定
wkea vendor bind-categories --vendor-id <ID> --category-ids <1,2,3>
wkea vendor categories --vendor-id <ID>
wkea vendor unbind-category --vendor-id <ID> --category-id <分类ID>

# 扩展字段
wkea vendor extra-columns --vendor-id <ID>
wkea vendor save-extra-columns --vendor-id <ID> --columns <JSON>

# 合并
wkea vendor merge --from-id <来源ID> --to-id <目标ID> --operator <操作人>

# 下拉框
wkea vendor dropdown [--keyword <关键词>]
```
