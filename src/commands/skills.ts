import { Command } from 'commander';

/**
 * 生成 AI 友好的 WKEA CLI Skills 文档
 *
 * 聚焦业务流程，持续更新
 * 命令细节由 AI 自行通过 --help 查看
 */

const SKILLS_DOC = `\`\`\`skills
# WKEA 管理后台 CLI 工具 (wkea-manage-cli)

## 工具背景

WKEA 后台管理系统的命令行工具，用于操作 WKEA 的后台系统。

**前置要求:** 必须先运行 \`wkea-manage-cli init\` 配置 API 地址和登录凭证。

**使用提示:** 查看具体命令用法，运行 \`wkea-manage-cli <command> --help\`

---

## 操作规范（AI 执行时必须遵守）

### 1. 写操作后必须验证

**所有创建、更新、删除操作完成后，必须立即验证是否成功。**

不只看退出码，要用查询命令确认数据真的写入了：

\`\`\`bash
# 创建供应商后，查询确认
wkea-manage-cli vendor get --vendor-id <刚返回的ID>

# 添加联系人后，查询确认
wkea-manage-cli vendor contact-list --vendor-id <ID>

# 绑定品牌后，查询确认
wkea-manage-cli vendor brands --vendor-id <ID>
\`\`\`

**如果验证失败，CLI 退出码仍可能是 0，不能信任退出码。**

### 2. 链式命令必须中断失败

**多个命令在同一行执行时，必须使用 \`|| exit 1\` 中断：**

\`\`\`bash
# 正确写法：任何一个失败立即停止
wkea-manage-cli vendor contact-add ... && wkea-manage-cli vendor contact-list ... || exit 1

# 错误写法：cmd2 静默失败但 cmd3 仍会执行
wkea-manage-cli vendor contact-add ... && wkea-manage-cli vendor contact-list ...
\`\`\`

### 3. 单命令执行优于长链

**优先单命令执行 + 验证循环，不要长链：**

\`\`\`bash
# 推荐：每个写操作后单独验证
wkea-manage-cli vendor contact-add --vendor-id V001 --name "张三" --phone "13800000001"
wkea-manage-cli vendor contact-list --vendor-id V001
wkea-manage-cli vendor contact-add --vendor-id V001 --name "李四" --phone "13900000001"
wkea-manage-cli vendor contact-list --vendor-id V001
\`\`\`

### 4. 批量操作前先小量验证

**批量添加前，先用一个样本验证流程正确性，再批量执行。**

---

## 业务流程

### 保存供应商

保存供应商时，需要完整保存以下所有数据，否则数据不完整：

1. **供应商基础信息**
   - 使用 \`vendor create\` 创建供应商
   - 使用 \`vendor update\` 补充信息（联系方式、银行账户等）

2. **联系人**
   - 使用 \`vendor contact-add\` 保存联系人信息
   - 如需多个联系人，调用多次
   - **注意：联系人不能通过 vendor create/update 一起保存，必须单独调用 contact-add**
   - **每个 contact-add 后必须用 contact-list 验证是否真的写入**

3. **绑定品牌**
   - 先用 \`brand list --keyword <关键词>\` 查找品牌 ID
   - 使用 \`vendor bind-brands\` 绑定品牌到供应商
   - 已绑定的品牌会自动跳过（增量绑定）

4. **绑定分类**
   - 使用 \`vendor bind-categories\` 绑定分类到供应商
   - 分类 ID 需要从其他系统获取

5. **优势分类**
   - 使用 \`vendor superior-category add\` 添加供应商的优势分类
   - 用于标识供应商的优势业务领域

### 查询供应商完整信息

1. \`vendor get\` — 获取供应商基础信息
2. \`vendor brands\` — 查看绑定的品牌
3. \`vendor categories\` — 查看绑定的分类
4. \`vendor contact-list\` — 查看所有联系人
5. \`vendor superior-category list\` — 查看优势分类
6. \`vendor extra-columns\` — 查看扩展字段

### 供应商合并

将来源供应商合并到目标供应商，同时转移所有关联数据：

\`\`\`bash
wkea-manage-cli vendor merge --from-id <来源ID> --to-id <目标ID> --operator <操作人>
\`\`\`

默认转移品牌、分类、产品关联。如需调整，可省略对应 flag 以保留默认值。

### 品牌管理

品牌在系统中独立存在，供应商与品牌是多对多关系：

1. \`brand create\` — 创建品牌
2. \`brand list --keyword <关键词>\` — 搜索品牌（用于查找品牌 ID）
3. \`brand update\` — 更新品牌信息
4. \`brand delete\` — 删除品牌（慎用）

---

## 产品概念（SPU / SKU / 规格 / 属性）

### 核心定义

**SPU（产品组）**
- 定义：具有相同属性、规格的产品集合
- 示例：IPhone 手机、小米手机 是不同的 SPU
- 作用：管理共性特征（产品说明、图片、规格绑定、属性绑定）

**SKU（最小可售卖单位）**
- 定义：具有唯一型号、规格、品牌、供应商组合的最小销售单位
- 示例：IPhone 12 Pro Max 红色 128G 是某个 SPU 下的具体 SKU
- 作用：销售、采购、库存管理的最小单位

**规格（Spec）**
- 定义：影响 SKU 型号（model）和价格的参数
- 示例：颜色、内存、硬盘、尺寸
- **关键**：规格值有 \`tag\`（型号码），参与 SKU 型号拼接
- 当规格数据变化，价格可能不同，所以规格也要维护价格相关字段

**属性（Attribute）**
- 定义：不影响 SKU 型号的描述性参数
- 示例：产地、材质、保修年限、包装清单
- **关键**：纯展示用，不参与型号生成

### 规格 vs 属性 区分原则

**遇到产品参数时，先判断：**

| 问题 | 答案 | 结果 |
|------|------|------|
| 这个参数会影响型号吗？ | 是 → 影响价格/区分可售单位 | 写到规格（Spec） |
| 这个参数会影响型号吗？ | 否 → 只是产品描述 | 写到属性（Attribute） |

### 数据模型关系

\`\`\`
product_spu (SPU)
  ├── tag 字段：产品组标签，用于型号前缀
  │
  ├── spec_mid_spu（SPU 绑定了哪些规格）
  │     └── product_spec（规格定义）
  │           └── product_spec_param（规格值）
  │                 ├── name：规格值名称（如"红色"）
  │                 └── tag：型号码（如"red"），用于生成 SKU 型号
  │
  ├── product_sku（SKU）
  │     ├── model：型号，由 SPU.tag + 各规格值的 tag 拼接而成
  │     └── product_sku_spec（SKU 选了哪些规格值）
  │
  └── attribute_product（属性关联）
        ├── id = SPU/SKU 编号
        ├── value = 属性值（value 为空 = SPU 级属性；非空 = SKU 级属性）
        └── attribute（属性字典）
\`\`\`

### SKU 型号（model）生成规则

\`model\` 由以下部分拼接：

\`\`\`
SKU.model = SPU.tag + 分隔符 + 规格值1.tag + 分隔符 + 规格值2.tag + ...
示例：
  SPU.tag = "Iphone"
  规格值 tag: "12" + "128g" + "red"
  分隔符 = "-"
  → model = "Iphone-12-128g-red"
\`\`\`

**AI 维护规格值时，必须填写 tag 字段，没有 tag 变型生成不出正确的型号。**

### 变型（笛卡尔积生成 SKU）

1. SPU 绑定多个规格（如：型号、内存、硬盘、颜色）
2. 每个规格维护多个规格值（含 tag）
3. 点击变型，系统计算所有规格值的笛卡尔积组合
4. 每种组合生成一个 SKU，自动拼接 model
5. 工业品规格多、组合爆炸（如 4 个规格各 10 个值 = 10000 个 SKU）

### CLI 操作路径

    # SPU 管理
    wkea-manage-cli product spu create   --name <名称> --category-id <ID> --brand-id <ID>
    wkea-manage-cli product spu get      --spu-id <ID>
    wkea-manage-cli product spu list     --keyword <关键词>

    # SKU 管理
    wkea-manage-cli product sku create   --name <名称> --spu-id <SPU编号>
    wkea-manage-cli product sku get      --sku-id <ID>
    wkea-manage-cli product sku list     --spu-id <SPU编号>

    # 规格管理（tag 必填，用于生成 SKU 型号）
    wkea-manage-cli product spec add --spu-id <ID> --name <规格名> --tag <标签> --param '[{"name":"规格值名","tag":"型号码","sort":1}]'

    # 一键创建 SPU + SKU（含规格 + 属性）
    wkea-manage-cli product quick-create --spu-name <名称> -s '<json>' -s '<json>'
    # -s JSON 字段：name(必填)，specs 自动创建规格，attributes 属性列表，paramIds 已有规格ID
    # 示例：wkea-manage-cli product quick-create --spu-name "液压缸" --brand-name "恒宇" \
    #   -s '{"name":"液压缸-50mm","specs":{"材质":["不锈钢"]},"attributes":[{"name":"产地","value":"上海"}]}'

    # 供应信息（SKU + 供应商 + 价格）
    wkea-manage-cli product supply sku set --sku-id <ID> --vendor-id <ID> --sales-price <售价> --stock <库存>

### AI 协作要点

- **新建产品时**：先建 SPU → 绑定规格 → 维护规格值（含 tag） → 变型生成 SKU
- **遇到产品参数时**：先判断是否影响型号 → 影响写规格，不影响写属性
- **变型生成后**：检查生成的 model 是否正确（tag 拼接是否完整）
- **更新 SPU.tag**：会影响所有子 SKU 的型号前缀，需要确认是否需要级联更新

\`\`\``;

export function registerSkillsCommand(program: Command) {
  program
    .command('skills')
    .description('AI 工具说明文档（聚焦业务流程）')
    .action(() => {
      console.log(getSkillsContent());
    });
}

export function getSkillsContent(): string {
  return SKILLS_DOC;
}
