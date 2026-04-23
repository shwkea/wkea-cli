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

WKEA 后台管理系统的命令行工具，用于管理品牌、供应商及其关联数据。

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
