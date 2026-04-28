# WKEA 管理后台 CLI 工具 (wkea-manage-cli)

## 前置

- 必须先运行 `wkea-manage-cli init` 配置 API 和登录凭证
- 命令用法：`wkea-manage-cli <command> --help`
- 枚举查询：`wkea-manage-cli enum --type <类型>`

---

## 工具基本用法

**wkea-manage-cli** 是 WKEA 后台管理系统的 CLI 工具，AI 代理通过它操作后台各模块业务数据（供应商、品牌、产品等，后续持续扩展）。

### 系统命令

```bash
# 查看命令帮助
wkea-manage-cli <command> --help

# 查询枚举值
wkea-manage-cli enum --type <类型>
# 示例：查询单位
wkea-manage-cli enum --type 单位

# 查看当前版本
wkea-manage-cli version

# 更新到最新版本
wkea-manage-cli update

### 更新本工具 & Skills

`update` 仅更新 CLI 本身。更新后需重新获取 Skills 内容：

```bash
# 获取最新 Skills，复制输出后更新 AI 助手中名为 "WKEA 后台技能" 的 Skills 配置
wkea-manage-cli skills
```

更新流程：`wkea-manage-cli update` → `wkea-manage-cli skills` → 复制输出 → 更新 AI 助手中 "WKEA 后台技能" 的配置

# 验证登录状态（实时重新登录）
wkea-manage-cli whoami
```

---

## 执行原则（所有操作必须遵守，优先级最高）

### P1：写操作前必须先查询现状

动手之前必须先查清楚，不允许凭猜测执行：

- **创建前**：确认目标数据是否已存在（用 list/get 查询）
- **修改前**：先 get 看现有值，明确要改什么
- **删除前**：先 get/list 确认数据存在，展示查询结果

禁止：用户说"查一下某供应商" → 不查直接建。

### P2：有缺失信息必须提问

以下情况必须停下来问用户，不能自行填补或跳过：

- 缺少必要参数（品牌ID、分类ID、供应商ID等）→ 问用户
- 数据已存在（与用户意图冲突）→ 问用户如何处理
- 操作后果不确定 → 问用户

禁止：用户没说供应商 → 自己随便选一个 → 直接建。

### P3：删除/不可逆操作必须展示结果后确认

删除操作分两步：

1. 先查询，把要删的内容完整展示给用户
2. 用户明确确认后，才执行删除

禁止：用户说"删了这个供应商" → 不查不展示 → 直接删。

### P4：写操作后必须验证

每次创建/更新/删除完成后，必须用查询命令确认数据真的写入了：

- 不能只看退出码
- 不能假设成功了
