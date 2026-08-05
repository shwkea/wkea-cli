# 产品分类操作指南

> **命令参数以 `<command> --help` 为准。** 以下命令示例仅说明操作流程，具体参数不要照抄，先跑 `--help` 查看完整参数列表后再执行。

## 核心概念

- **分类（Category）**：产品的基础分类体系，三级树形结构。创建 SPU 时通过 `--category-id` 指定分类。
- **用途类型（purposeType）**：区分工业品/生活用品。工业品是默认分类。
- **CLI 只提供分类查询**：分类的创建/修改/删除在后台管理页操作，CLI 仅用于查询分类 ID（创建产品前必须查）。

## 常用操作

### 按名称查分类 ID（创建产品前必做）

创建 SPU 前，必须确定分类 ID：

- `category list --name <分类名>` — 按名称精确匹配分类（含子分类树）
- `category search --name <关键词>` — 模糊搜索分类

> 例：`category list --name 气动液压` → 拿到分类 ID，再用于 `product spu create --category-id <id>`

### 其他查询方式

- `category list --id <id>` — 按分类 ID 查询
- `category list --father-id <id>` — 查某分类的子分类
- `category list` — 全部一级分类

## 数据校验

- 查到的分类 ID 是否与要创建的产品匹配（工业品 vs 生活用品）
- 分类存在但不确定是否正确 → 展示给业务人员确认

## 常见错误

- **不查分类直接建产品** → SPU 没有正确的分类归属
- **用 `--category-name` 代替 `--category-id`** → 后端按名字匹配可能不准，应先用 `category list` 查到准确 ID
