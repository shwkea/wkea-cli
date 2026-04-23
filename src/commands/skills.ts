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
