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
| `init` | 初始化配置（API 地址和登录凭证） |
| `setup` | AI 初始化引导（阅读引导后按步骤完成全部配置） |
| `enum` | 查看枚举值说明（单位、税率等） |
| `whoami` | 验证登录状态（实时重新登录） |
| `version` | 查看版本 |
| `update` | 更新到最新版本 |

## AI 安装（复制给 AI）

```
帮我安装 wkea-manage-cli，运行 init 和 setup 完成全部配置。
```
