# wkea-manage-cli

WKEA 后台管理 CLI 工具，操作后台系统的 API。

## 安装与初始化

```bash
npm install -g wkea-manage-cli          # 安装
wkea-manage-cli init                    # 初始化（配置 API 地址和登录凭证）
wkea-manage-cli whoami                  # 验证登录状态
```

## 使用方法

```bash
wkea-manage-cli <command> --help       # 查看命令详细用法
```

### 系统命令

| 命令 | 说明 |
|------|------|
| `enum` | 查看枚举值说明（单位、税率等） |
| `whoami` | 验证登录状态（实时重新登录） |
| `version` | 查看版本 |
| `update` | 更新到最新版本 |

## AI 安装（复制给 AI 即可）

```
帮我安装 wkea-manage-cli 并创建 AI Skill，步骤：
1. npm install -g wkea-manage-cli
2. wkea-manage-cli init
3. wkea-manage-cli skills（用输出原文创建 Skill）

Skill 创建要求：
- 名称为「WKEA 后台技能」
- 正文放 skills 命令的输出原文（去掉外层 ```skills 和 ``` 包裹）
- Skill 用于指导 AI 使用 wkea-manage-cli 操作 WKEA 后台系统
```
