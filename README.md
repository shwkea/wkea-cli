# wkea-cli

WKEA CLI 工具 - 供应商管理

## 安装

```bash
npm install -g wkea-manage-cli
```

## 初始化

```bash
# 全参数（跳过交互）
wkea init --api-url <API地址> --username <用户名> --password <密码>

# 交互式引导
wkea init
```

## 字段规范

所有 `formatList` / `formatDetail` 的字段定义必须与 VO 类型字段一一对应，不得遗漏。

## 命令

```bash
wkea init                      # 初始化/重配置
wkea whoami                    # 查看当前登录信息
wkea logout                    # 清除配置

wkea vendor list               # 供应商列表
wkea vendor get                # 供应商详情
wkea vendor create             # 创建供应商
wkea vendor update             # 更新供应商
wkea vendor delete             # 删除供应商（逻辑删除）
wkea vendor dropdown           # 下拉框搜索

wkea vendor bind-brands        # 绑定品牌
wkea vendor brands             # 品牌列表
wkea vendor unbind-brand       # 解绑品牌

wkea vendor bind-categories    # 绑定分类
wkea vendor categories         # 分类列表
wkea vendor unbind-category    # 解绑分类

wkea vendor bind-all           # 批量绑定品牌和分类
wkea vendor extra-columns      # 扩展字段
wkea vendor save-extra-columns # 保存扩展字段
wkea vendor merge              # 合并供应商

wkea vendor contact-list       # 联系人列表
wkea vendor contact-get        # 联系人详情
wkea vendor contact-add        # 新增联系人
wkea vendor contact-update     # 更新联系人
wkea vendor contact-delete     # 删除联系人（软删除）

# 查看详细帮助
wkea vendor list -h
```

## 开发

```bash
npm run build   # 编译
npm link        # 链接到全局
```
