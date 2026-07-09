# wkea-cli 开发规范

> 版本：2026-07-01 | 最后更新 commit：`d29562d`

本文档解释 wkea-cli 的架构设计、WorkBuddy 插件规范、以及合并第三方 expert 的标准流程。

---

## 1. 架构设计（三层模型）

### 1.1 总体架构

```
┌─────────────────────────────────────────────────────────────┐
│  SKILL.md（启动入口 + 顶层规则 P0-P15 + 更新流程）          │
│  - AI 加载 wkea skill 后先读此文件                            │
│  - P0-P15 是绝对铁律，所有 expert 无条件遵守                  │
│  - 定义：CLI 怎么用、怎么更新、怎么查 --help                  │
└─────────────────────────────────────────────────────────────┘
                          ↓ 调度
┌─────────────────────────────────────────────────────────────┐
│  Workflow 编排层（wkea-expert-team/agents/workflows/）       │
│  - 跨 expert 多步骤业务流程                                   │
│  - 由主理人（team-lead）读 + 按 Phase 调度 member expert     │
│  - 谁先谁后、传什么参数、产出什么报告                         │
└─────────────────────────────────────────────────────────────┘
                          ↓ 派单给
┌─────────────────────────────────────────────────────────────┐
│  Agent 业务层（wkea-expert-team/agents/<expert>.md）         │
│  - 8 个 member agent：demand / product / vendor / brand      │
│                       customer / quotation / stock / sales   │
│  - 职责：解释业务概念 + 列出 CLI 白名单 + 单 expert 内部流程  │
│  - 不复制 SKILL.md 规则（引用即可）                           │
│  - 不复制 workflow 文件内容（引用即可）                       │
└─────────────────────────────────────────────────────────────┘
                          ↓ 调用
┌─────────────────────────────────────────────────────────────┐
│  CLI 操作层（src/commands/ + src/api/）                      │
│  - 200+ 命令行，8 个模块（vendor / brand / product / demand  │
│    / quotation / stock / sales-order / sales-contract /      │
│    customer）                                                │
│  - 每个命令自带 --help 输出全部参数                            │
│  - 实际通过 `node dist/index.js <command>` 调用              │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 三层职责分界（绝对不允许跨层）

| 层 | 能做什么 | **不能做什么** |
|---|---|---|
| **SKILL.md** | 定义 P0-P15 顶层规则、CLI 通用用法、枚举速查、更新流程 | 不写业务概念（那是 agent 的事）|
| **Workflow** | 跨 expert 多步 SOP、Phase 划分、派单契约 | 不解释业务概念（那是 agent 的事）<br>不列 CLI 命令参数（那是 --help 的事）|
| **Agent** | 解释业务概念 + 适用/不适用场景 + 单 expert 内部流程 + CLI 白名单 | 不复制 SKILL.md 规则<br>不复制 workflow 文件内容<br>不列具体参数（参数见 --help）|
| **CLI** | 命令 + 参数 + 返回值 | 不做业务决策（那是 agent 的事）|

### 1.3 目录结构

```
wkea-cli/
├── SKILL.md                          ← 启动入口 + 顶层规则
├── src/commands/                     ← CLI 命令实现
├── src/api/                          ← API 调用层
├── docs/
│   ├── dev-guide.md                  ← 本文档
│   ├── modules/
│   │   ├── binding-rules.md          ← 三方绑定矩阵
│   │   ├── appendix.md               ← 跳转链接 + 级联清理
│   │   ├── extra-columns.md          ← 附加列使用
│   │   └── progress.md               ← 进度跟踪
│   └── report-template.html          ← HTML 报告模板
├── plugins/
│   ├── _template/                    ← 新建 expert 时复制此目录
│   └── wkea-expert-team/             ← 唯一 team plugin
│       ├── .workbuddy-plugin/
│       │   └── plugin.json           ← WorkBuddy 注册（roles / names / avatars）
│       ├── agents/
│       │   ├── wkea-expert-team-team-lead.md   ← 主理人 + 调度 + workflow 索引
│       │   ├── wkea-demand-expert.md         ← 8 个 member
│       │   ├── wkea-product-expert.md
│       │   ├── wkea-vendor-expert.md
│       │   ├── wkea-brand-expert.md
│       │   ├── wkea-customer-expert.md
│       │   ├── wkea-quotation-expert.md
│       │   ├── wkea-stock-expert.md
│       │   ├── wkea-sales-expert.md
│       │   └── workflows/                    ← 跨 expert SOP
│       │       ├── 01-需求询价处理.md
│       │       ├── 02-产品开发供应商.md
│       │       ├── 04-品牌开发供应商.md
│       │       └── 05-产品配置与上架.md
│       ├── avatars/                   ← 团队 + 成员头像
│       ├── settings.json              ← WorkBuddy 入口 agent
│       └── README.md                  ← 使用说明
└── scripts/
    ├── validate-plugin.js             ← 校验 plugin 合规性
    └── pack.js                        ← 打包
```

---

## 2. WorkBuddy 插件规范

### 2.1 plugin.json 必填字段

```json
{
  "name": "wkea-expert-team",
  "version": "1.0.0",
  "description": "...",
  "expertType": "team",
  "agentName": "wkea-expert-team-team-lead",
  "teamInfo": {
    "leadAgent": "wkea-expert-team-team-lead",
    "memberAgents": ["wkea-product-expert", "wkea-vendor-expert", "..."]
  },
  "members": [
    {
      "id": "wkea-expert-team-team-lead",
      "name": { "en": "Jia", "zh": "小嘉" },
      "profession": { "en": "...", "zh": "..." },
      "avatar": "avatars/...",
      "role": "lead"
    },
    {
      "id": "wkea-product-expert",
      "name": { "en": "Guan", "zh": "管立品" },
      "profession": { "en": "...", "zh": "产品管理专家" },
      "avatar": "avatars/...",
      "role": "member"
    }
  ],
  "agents": [
    "./agents/wkea-expert-team-team-lead.md",
    "./agents/wkea-product-expert.md",
    "./agents/wkea-vendor-expert.md",
    "..."
  ]
}
```

**约定**：
- **1 个 plugin = 1 个 team**（不拆成多个 agent 插件单独发布）
- `agents[]` 数组列出所有 `.md` 文件路径（1 个主理人 + N 个 member）
- `members[]` 数组登记每个 member 的 display name、profession、avatar、role
- team 型必须含 `teamInfo`（leadAgent + memberAgents）和 `settings.json`

### 2.2 agent.md frontmatter

```yaml
---
name: wkea-product-expert
agentName: wkea-product-expert
description: >
  SPU/SKU 全生命周期管理专家。负责 SPU/SKU 创建、规格系统定义...
displayName:
  zh: 产品管理专家
  en: Product Management Expert
profession:
  zh: 产品管理专家
  en: Product Management Specialist
maxTurns: 50
version: 1.0.0
---
```

**必填字段**（validate 脚本检查）：
- `name` — 必须与 `plugin.json.agentName` 一致
- `description` — 一句话说明

**兼容字段**（标准 agent 格式要求）：
- `displayName` / `profession` — 中英文双语
- `maxTurns` — AI 行为控制（建议 member 50，主理人 200）
- `agentName` — 与 `name` 一致

**禁止字段**：`tools`、`requires`

### 2.3 校验

```bash
node scripts/validate-plugin.js ./plugins/wkea-expert-team
```

校验项：plugin.json 必须合法 + tags 固定 3 个 + quickPrompts 固定 3 个 + name 必须是 kebab-case + plugin === name + agent.md frontmatter 必须含 name/description + 禁止 tools/requires。

---

## 3. CLI/Agent/Workflow 三层分界

### 3.1 SKILL.md / CLI（系统工具层）

**SKILL.md 定义**：
- P0-P15 执行原则（写前必查、写后必验、跳转链接、删除确认...）
- 所有 CLI 命令必须通过 `node dist/index.js <command>` 执行
- 如何更新（git pull + 清场 + 全量复制 + 重写 marketplace.json）
- 枚举速查（`enum --type 供应商类型` 等）

**CLI 命令的特点**：
- 每个命令自带 `--help` 输出完整参数列表
- 参数以 `--help` 输出为准，不以文档示例为准
- 不需要 agent.md 列参数

### 3.2 Agent（业务解释层）

**Agent 文件写什么**：
1. **适用场景 / 不适用**：路由到哪个 expert
2. **业务概念**：SPU vs SKU、规格 vs 属性、状态机等
3. **单 expert 内部流程**：本 expert 能独立完成的子任务
4. **CLI 命令白名单**：本 expert 只调用这些命令
5. **经验教训 / 异常处理**：边界情况
6. **跨 expert 协作声明**：本 expert 参与哪些 workflow

**Agent 文件不写什么**：
- ❌ 不列具体参数（参数见 `--help`）
- ❌ 不复制 SKILL.md 的 P-rules
- ❌ 不复制 workflow 文件内容
- ❌ 不写其他 expert 的业务

**Agent body 标准结构**：
```markdown
# 产品管理专家 - 管立品

## 核心能力
## 工作流程（单 expert 内部能力）
## 核心业务概念
## 产品资料字段（可选，本 expert 特有）
## 规格建模方法论（可选，本 expert 特有）
## 输出规范
## 注意事项
## 团队协作
## 参与需求询价工作流时（跨 expert 声明）
## 参与产品配置与上架工作流时（跨 expert 声明）
```

### 3.3 Workflow（跨 expert SOP 层）

**Workflow 文件写什么**：
1. **触发条件**：用户怎么说才触发
2. **视角**：哪个 expert 主导
3. **Phase 划分**：Phase 1/2/3... 每个 Phase 由谁执行
4. **关键约束**：派单契约、Phase 间数据传递
5. **异常处理**：跨 expert 的异常怎么处理

**Workflow 文件不写什么**：
- ❌ 不解释业务概念（那是 agent 的事）
- ❌ 不列 CLI 命令清单（那是 agent 的事）
- ❌ 不复制 SKILL.md 的 P-rules

**当前 workflow 列表**：
| 文件 | 触发 | 视角 |
|------|------|------|
| `01-需求询价处理.md` | 客户提一个需求，要完整 13 步 | 需求（demand-expert 主导）|
| `02-产品开发供应商.md` | 上架一批产品 + 配套供应商（多品牌批量）| 产品（product-expert 主导）|
| `04-品牌开发供应商.md` | 给品牌 X 找授权代理商 + 写库 | 品牌（vendor-expert 主导）|
| `05-产品配置与上架.md` | 选型资料 → 规格建模 → SKU 变型上架 | 产品（product-expert 主导）|

### 3.4 这三类的关系

```
用户说一句话
  ↓
SKILL.md / P1：判断意图 → 派单给哪个 expert 或哪个 workflow
  ↓
┌─ 复杂（多 step 跨 expert）→ 主理人读 workflow 文件 → 按 Phase 调度 member
└─ 简单（单 expert 独立完成）→ 直接派给 member expert
  ↓
member expert
  ├─ 读自己 agent 文件中的"工作流程"章节
  ├─ 查 CLI 白名单（哪个命令是本 expert 允许的）
  ├─ 跑 `node dist/index.js <command> --help` 看参数
  ├─ 执行命令
  └─ SendMessage 回传给主理人
```

---

## 4. 合并第三方 expert 的标准流程

### 4.1 判断：这是 workflow 还是 agent 能力

第一步，读第三方 agent.md，判断它的内容属于哪个层：

| 内容 | 归属 | 例子 |
|------|------|------|
| 跨 expert SOP（多步骤、调度多个角色）| **Workflow** | "品牌识别 → 搜官网 → 跨验证 → 企查查 → 写库" |
| 单 expert 流程（本角色能独立完成）| **Agent 内"工作流程"** | "SPU 创建 → 规格绑定 → SKU 生成" |
| 业务概念解释 | **Agent 内"业务概念"** | "规格 vs 属性判定原则" |
| CLI 命令清单 / 参数 | **Agent 内"CLI 命令清单"** | "product quick-create / product spu create..." |
| 经验教训 | **Agent 内"经验教训"** | "命名规则、固定规格也要创建" |
| 工具选择 / 操作步骤 | **Workflow** | "web_fetch 拿不到就升级浏览器" |

### 4.2 标准合并流程

> **核心原则**：吸收方法论和 SOP，不照抄 body。合并后 100% 归到我们的 workflow 或 agent 文件中。

```
Step 1  判断归属（workflow 还是 agent）
        ↓ 跨 expert 多步骤 → workflow 文件（NN-场景名.md）
        ↓ 单 expert 知识 → agent 文件（wkea-*.md）
        ↓ 共享知识 → docs/modules/

Step 2  新建或修改对应文件
        - New workflow: workflows/NN-场景名.md
        - 改 agent: wkea-*.md 里的对应章节
        - New doc: docs/modules/*.md

Step 3  吸收内容（方法论 + 关键判定 + 经验教训）
        ❌ 不照抄：HTML 配置器、CSS 设计令牌、外部部署等（WKEA 不适用）
        ✅ 吸收：规格建模方法论、字段清单、判定规则、异常处理

Step 4  更新主理人索引
        主理人 Workflow 索引表加新 workflow 条目
        参与 workflow 的 expert 更新"跨 expert 协作"小节

Step 5  删除第三方原始文件
        同事的 plugin 目录删除
        user 侧 marketplace 同步清理
```

### 4.3 历史合并案例

**案例 1：同事 brand-supplier-dev → workflow 04**

| 同事原文 | 我们的处理 |
|---------|----------|
| "品牌识别～搜官网～抓代理～企查查～写库" | ✅ → `workflows/04-品牌开发供应商.md`（Phase 1-5）|
| "经验教训（亚德客 AIRTAC 案例）" | ✅ → `wkea-vendor-expert.md` 经验教训 + workflow 04 |
| "agent-browser 操作步骤" | ✅ → vendor-expert 工具选择表（"fetch 拿不到升级浏览器"）|
| "HTML 报告 checker" | ✅ → vendor-expert 报告输出规范 |
| ❌ 独立的 HTML 模板 | 不吸收——WKEA 用 `docs/report-template.html` 已有 |

**案例 2：同事 product-configurator → workflow 05**

| 同事原文 | 我们的处理 |
|---------|----------|
| "规格建模方法论（值变了型号变→规格）" | ✅ → `workflows/05-产品配置与上架.md` Phase 1 |
| "三种创建方式（quick-create / 单独 / 批量）" | ✅ → workflow 05 Phase 3 |
| "三层绑定" | ✅ → workflow 05 Phase 4 |
| "30+ 产品资料字段" | ✅ → `wkea-product-expert.md` 新增字段清单 |
| "配置器预览生成" | ✅ → workflow 05 Phase 7（简化输出物，保留核心匹配功能）|
| "分支流程（仅建规格/仅绑供应/停产替代）" | ✅ → workflow 05 分支 A/B/C |
| "注意事项（ES异步/SKU克隆/级联删除/搜索策略）" | ✅ → `wkea-product-expert.md` 注意事项 |
| "关联专家声明" | ✅ → `wkea-product-expert.md` 关联专家 |
| ❌ CSS 设计令牌 | 不吸收——WKEA 有自己的前端 UI 规范 |
| ❌ cloudstudio_deploy | 不吸收——WKEA 有自有部署渠道 |

### 4.4 合并 checklist

- [ ] 已判断是 workflow 还是 agent 能力（按 4.1 表格）
- [ ] 已创建或修改对应 workflow 文件
- [ ] 已更新对应 expert 的"跨 expert 协作"声明 + 工作流程引用
- [ ] 已更新主理人 Workflow 索引表
- [ ] 已删除同事原始文件
- [ ] 已清理 user 侧 marketplace 残留
- [ ] validate 通过
- [ ] 主理人 agent.md + 参与 workflow 的 expert 的"团队协作"小节一致

---

## 5. AI 执行 CLI 命令的铁律

### 5.1 --help 必查

**AI 执行任何 CLI 命令时，必须先查 --help**，除非已经"知道了"。

| 情况 | 要查 --help？|
|---|---|
| 这个命令**这次会话第一次用** | ✅ **必须查** |
| 这个命令**上次会话用过，但这次是新产品/新模块** | ✅ **必须查** |
| 这个命令**刚才刚刚查过 --help**（同会话内）| ❌ 不用（已知）|
| 文档里写了一个参数示例（如 `--name Festo`）| ⚠️ 文档示例不是完整参数列表，**必须查** |
| 这个命令**已跑过 3 次以上**且参数没变 | ❌ 不用（熟练）|

**为什么文档写的不够**：
- 文档里可能只写了 3 个参数，实际 `--help` 输出 8 个
- 文档更新可能滞后
- **--help 是唯一权威来源**

### 5.2 命令执行标准流程

```
确定要用哪个命令
  ↓
这个命令这次会话第一次用？
  ├ 是 → 跑 `node dist/index.js <command> --help` 看参数
  └ 否（已知参数）→ 直接执行
  ↓
根据 --help 输出 + 业务需求 传参数
  ↓
执行命令
  ↓
验证（写操作用 get 确认）
  ↓
提供跳转链接
```

### 5.3 禁止行为

- ❌ 凭文档里的示例就拼命令，不查 --help
- ❌ 凭记忆（上次会话用过的参数，新会话可能变了）
- ❌ 跳步（没验证就认为成功了）
- ❌ 用 Bash 跑等价 shell 命令（如 `whoami` 替代 `node dist/index.js whoami`）

---

## 6. 更新流程

AI 每次开始任务前，必须执行：

```bash
# 1. 检查远程
git fetch && git log --oneline HEAD..origin/master
```

有新提交 → 执行更新：
```bash
# 2-3. 拉取 + 安装 + 构建
git pull && npm install && npm run build

# 4a. 清场 user 侧 wkea-* 目录
# 4b. 全量复制到 user 侧
# 4c. 全量重写 marketplace.json
# 4d. 列出最终结果
```

然后：
```bash
# 5. 大白话告知本次更新了什么
git log --oneline <OLD_HEAD>..HEAD
```

**核心原则**：AI 不要 diff 文件，不要判断改动大小。pull 后无条件全量覆盖。

---

## 7. 常见问题

### Q: 为什么是 1 个 plugin 而不是 9 个？
A: WorkBuddy 官方 software-company 就是 1 个 plugin 多个 agent.md 的模式。agent 不是 plugin。8 个 expert 协同工作，从来没独立发布过。1 个 plugin 多 agent 更简洁。

### Q: Workflow 为什么要单独维护？
A: 因为 workflow 是跨 expert 多步骤的，不属于任何一个 agent。单独维护 → 主理人读一次就能按 Phase 调度 3-5 个 member。如果散落在各个 agent 里，主理人找不到、AI 会跳步。

### Q: 什么时候建新 workflow？
A: 同时满足 3 个条件：
1. 涉及 2+ expert 协作
2. 有明确的 Phase 划分和依赖关系
3. 主理人需要知道"谁先谁后"

不满足 → 直接派给单个 expert（单 expert 内部流程）。

### Q: 什么时候新建 agent？
A: 新增一种业务领域（系统还没有的），或者在现有 expert 上加一个流程即可。大多数情况是**在已有 expert 上加流程**（见开发流程）。

### Q: 怎么确保 agent 不偏离？
A: validate 脚本确保合规。每次改完 agent.md 跑 `node scripts/validate-plugin.js ./plugins/wkea-expert-team`。

---

## 8. 开发流程

**新增跨 expert Workflow**：
1. 在 `wkea-expert-team/agents/workflows/NN-场景名.md` 新建（N+1 递增）
2. 写清楚触发条件 + Phase 划分 + 派单契约
3. 更新主理人 agent.md 的 Workflow 索引表
4. 更新参与 workflow 的 expert 的"跨 expert 协作"小节

**新增 expert member**（在已有 team 内加一个 role）：
1. 在 `wkea-expert-team/agents/` 新建 `<member>.md`
2. 在 `plugin.json` 的 `agents[]` + `teamInfo.memberAgents[]` + `members[]` 加
3. 主理人 routing 表加一条
4. `node scripts/validate-plugin.js ./plugins/wkea-expert-team`

**在已有 expert 上加一个流程**：
1. 修改 `wkea-expert-team/agents/<expert>.md` 的"工作流程"章节
2. 如果是跨 expert 的 → 走"新增 Workflow"流程
3. validate

**新增共享知识**：
1. 在 `docs/modules/` 加 `.md` 文件
2. 在相关 expert body 里引用
