# 报价单管理操作指南

> **命令参数以 `<command> --help` 为准。** 以下命令示例仅说明操作流程，具体参数不要照抄，先跑 `--help` 查看完整参数列表后再执行。

## 核心概念

### 报价单与 shareId
- 每条报价单有唯一标识 `shareId`（雪花 ID），创建后所有操作（查看、编辑、分享）都通过 `shareId` 进行
- shareId 由后端生成，不可自定义

### 报价单的两种创建方式

| 方式 | 命令 | 场景 |
|------|------|------|
| 从需求生成 | `demand share-order --id <需求ID>` | **最常用**，基于已有需求生成报价单 |
| 独立创建 | `quotation create --items '<JSON>'` | 无对应需求时，手动录入产品 |

### 报价单的不可删除特性
- 报价单整体**不支持删除**，只能对内部产品进行增删
- 设计意图：报价单作为业务凭证需要留痕，防止误删导致追溯困难

### 报价单的分享
- 分享后生成 `shareUrl`（完整链接）和 `shortUrl`（短链接）
- 客户通过 `shortUrl` 访问报价单页面查看产品详情和价格
- 分享主题（topic）用于生成分享文案

---

## 常用操作

### 从需求生成报价单（最常用）

- `demand share-order --id <需求ID>` — 基于需求 ID 生成报价单（参数见 `--help`）

> 这是最常用的创建方式。拿到返回的 `shareId` 后即可进行后续操作。

### 独立创建报价单

- `quotation create --items '...'` — 创建报价单并添加产品（参数见 `--help`）

### 管理报价单内的产品

- `quotation get --share-id <shareId>` — 查看报价单详情（参数见 `--help`）
- `quotation add-item --share-id <shareId> --items '...'` — 往已有报价单添加产品（参数见 `--help`）
- `quotation remove-item --share-id <shareId> --sku <SKU>` — 从报价单删除产品（参数见 `--help`）

### 分享报价单

- `quotation share --share-id <shareId> --topic <主题>` — 分享报价单，生成分享链接（参数见 `--help`）

返回结果包含：
- `shareUrl`：完整的分享链接
- `shortUrl`：短链接（推荐发给客户）
- `copyText`：预生成的分享文案

**分享文案模板**：

```
你好，请查看{topic}产品报价单，有疑问随时联系，谢谢。链接：{shortUrl}
```

> 如果 API 未返回 `copyText`，按以上模板手动拼写。

### 查询单位枚举

报价单中产品的单位是枚举值，使用前需查询：

- `enum --type 单位` — 查询单位枚举值列表（参数见 `--help`）

> 不能猜测或硬编码单位值。常见如 `469` = pcs（个/件），具体以枚举查询结果为准。

### 获取环境 URL

分享前必须获取当前环境的正确 URL：

- `urls` — 获取当前环境的管理端和客户端 URL（参数见 `--help`）

返回 `manageMainUrl` 和 `ecUrl`，用于拼接后台和客户端的跳转链接。

### 跳转链接

| 端 | 链接格式 | 用途 |
|----|---------|------|
| 后台管理 | `{manageMainUrl}#/main/quotation-detail/{shareId}` | 内部人员在后台查看报价单详情 |
| 客户端 | `{ecUrl}/share-order.html?shareId={shareId}` | 客户在 H5 页面查看报价单 |

> `manageMainUrl` 和 `ecUrl` 通过 `node dist/index.js urls` 动态获取，**严禁硬编码**。

---

## 数据校验

创建后立刻验证：

```bash
# 1. 确认报价单创建成功
node dist/index.js quotation get --share-id <shareId>

# 2. 确认产品列表正确
# 在 get 返回中检查 items 数组：sku、quantity、unit 是否正确

# 3. 确认分享链接可访问（可选）
# 拿到 shortUrl 后在浏览器打开测试
```

### 缺了什么该提醒业务人员

- **shareId 未记录** → 后续所有操作都需要 shareId，创建后务必保存
- **产品 SKU 不正确** → SKU 编码必须与系统中已有 SKU 一致，否则后端报错
- **数量未确认** → quantity 影响报价金额，创建前需与业务人员确认数量
- **单位未设置或错误** → 单位为空或选错会导致报价金额计算错误；需先 `enum --type 单位` 查询，工业品默认 `469`(pcs)
- **主题未设置** → 分享时 `--topic` 为空会导致分享文案不完整
- **缺少后台/客户 URL** → 分享前未调用 `node dist/index.js urls`，导致链接拼错或无法访问
- **需求 ID 不存在** → `demand share-order --id` 前先用 `demand get --id <ID>` 确认需求存在

---

## 常见错误

- **创建前不确认需求是否存在** → `demand share-order` 传入不存在的需求 ID，后端报错
- **硬编码后台 URL** → 测试环境和生产环境的 URL 不同，硬编码导致链接 404；必须用 `node dist/index.js urls` 动态获取
- **单位值猜测** → 如猜测单位 ID 为 `1` 表示 pcs，但实际枚举中 pcs 可能是 `469`；必须先 `enum --type 单位` 查询
- **SKU 编码写错** → 系统中 SKU 编码区分大小写，手写容易出错；建议从已有数据中复制
- **忘记分享报价单** → 创建报价单后没有调 `quotation share`，客户收不到链接
- **主题不清晰** → 分享 topic 写得太笼统（如 "报价"），客户无法快速理解报价内容；建议写具体如 "SMC 气动元件 2024年Q3 报价单"
- **重复添加同一 SKU** → 同一个 SKU 在报价单中添加多次，导致客户困惑；添加前检查是否已存在
- **quantity 传字符串** → `--items` JSON 中 quantity 必须是数字，传 `"5"` 而非 `5` 可能导致解析错误
- **ES 索引延迟** → 刚创建的报价单在搜索中可能暂时查不到，等几秒再操作
