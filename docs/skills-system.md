# WKEA 管理后台 CLI 工具 (wkea-manage-cli)

## 前置

- 必须先运行 `wkea-manage-cli init` 配置 API 和登录凭证
- 命令用法：`wkea-manage-cli <command> --help`
- 枚举查询：`wkea-manage-cli enum --type <类型>`

## 更新 Skill

当用户说"更新 WKEA 技能"或"更新 wkea-manage-cli"时：
1. 运行 `npm update -g wkea-manage-cli`
2. 运行 `wkea-manage-cli skills` 获取最新输出
3. 用最新输出替换 Skill 正文（去掉外层 ```skills 和 ``` 包裹）
4. 告知用户更新完成

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

# 验证登录状态（实时重新登录）
wkea-manage-cli whoami
```

---

## 执行原则（所有操作必须遵守，优先级最高）

### P1：写操作前必须先查询现状

动手之前必须先查清楚，不允许凭猜测执行：

- **创建前**：确认目标数据是否已存在
- **修改前**：先 get 看现有值，明确要改什么
- **删除前**：先 get/list 确认数据存在，展示查询结果

**关键：确认"有没有"要用精确搜索，不能用分页 list。**

`list` 默认只返回第一页（最多 20 条），只看第一页没找到不等于不存在。正确做法：

- **按名称搜**：用 `--keyword`、`--name` 等参数精确查找
- **按 ID 搜**：用 `--id` 参数直接查
- **get 详情**：已知 ID 时直接用 `get`

例如查"西门子"品牌是否存在：用 `brand list --name 西门子`，不是不带参数跑 `brand list` 翻第一页就说没有。

禁止：跑 `list` 不带搜索条件 → 扫一眼第一页 → 结论"不存在"。

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

### P5：写操作后必须提供跳转链接

每次创建或编辑操作完成后，必须提供对应的后台管理页面跳转链接，方便用户直接点击查看。

**获取环境地址**：调用 API `GET /api/manageV2/system/urls` 获取 `manageMainUrl`（如 `https://admin.wkea.cn/`）

**各模块跳转链接格式**（`manageMainUrl` + `#` + 路径）：

| 模块 | 操作 | 跳转链接格式 |
|------|------|-------------|
| 供应商 | 详情/编辑 | `{manageMainUrl}#/main/supplier-add/{vendorId}` |
| SPU | 详情/编辑 | `{manageMainUrl}#/main/product-group-list?id={spuId}` |
| SKU | 详情/编辑 | `{manageMainUrl}#/main/product-edit/{skuId}` |
| 品牌 | 详情/编辑 | `{manageMainUrl}#/main/product-addbrand/{brandId}` |
| 需求询价 | 详情 | `{manageMainUrl}#/main/demandInquiryDetails/{demandId}` |
| 订单 | 详情 | `{manageMainUrl}#/main/order-details/{orderId}` |
| 报价单 | 分享页面 | `{manageMainUrl}#/main/share-order-list` |
| 库存 | 库存管理 | `{manageMainUrl}#/main/product-stock` |
| 库存 | 仓库管理 | `{manageMainUrl}#/main/product-warehouse` |

**示例输出格式**：
```
创建成功！
🔗 跳转链接：https://admin.wkea.cn/#/main/product-edit/W019963854
```

后续新增模块时需同步补充此表。
