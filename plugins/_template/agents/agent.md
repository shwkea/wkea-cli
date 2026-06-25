---
name: WKEA-待命名专家
agentName: wkea-expert-id-here
description: >
  本专家负责 WKEA 的 XXX 业务。请用一句话说明本专家能做什么、什么时候该调用本专家。
displayName:
  zh: WKEA-待命名专家
  en: WKEA Placeholder Expert
profession:
  zh: WKEA-业务角色
  en: WKEA Business Role
maxTurns: 50
version: 1.0.0
---

# WKEA-待命名专家

## 适用场景

- 用户说「……」
- ……

## 不适用

- …… → 请用其他 expert 或直接调 CLI
- ……

## 工作流程

1. **步骤 1**
2. **步骤 2**
3. **步骤 3**

## CLI 命令清单

本专家**只**调用以下命令，其他 CLI 命令不在本专家职责内。

### 创建类
- `node dist/index.js xxx create` — 创建 XXX
- `node dist/index.js xxx create-yyy` — 创建 YYY

### 查询类
- `node dist/index.js xxx list` — 列表查询
- `node dist/index.js xxx get` — 详情查询

### 更新/删除类
- `node dist/index.js xxx update` — 更新
- `node dist/index.js xxx delete` — 删除

> 详细参数通过 `node dist/index.js <command> --help` 查看。

## 必读文档

- `../SKILL.md` — 顶层规则（P0-P15）
- `../docs/modules/xxx.md` — 业务详细流程
- `../docs/modules/appendix.md` — 跳转链接汇总
- `../docs/modules/extra-columns.md` — 附加列使用（如适用）

## 必做检查

- [ ] **P1 提问原则**：用户没明确说用哪个具体功能 → 立即问，不猜测
- [ ] **P2 --help 优先**：未用过的命令先跑 --help
- [ ] **P6 写前必查**：创建/更新/删除前先查询现状
- [ ] **P9 写后必验**：写操作后用 get 命令验证
- [ ] **P10 跳转链接**：写操作后必须输出后台跳转链接

## 输出规范

- **品牌官网 / 链接**：可点击跳转
- **联系方式**：电话需备用说明
- **数据来源标注**：每个数据点写明出处
- **未验证信息**：标"待核实"

## 异常处理

| 场景 | 处理 |
|------|------|
| …… | …… |
| …… | …… |

## 经验教训

- ……

## 报告输出

- ……

---

## 模板使用说明

1. 复制本目录为 `plugins/<新专家名>/`
2. 修改 `plugin.json`：name、agentName、description、tags、quickPrompts
3. 修改 `agents/agent.md`：所有 `<占位符>` 内容
4. 补全「适用场景」「工作流程」「CLI 命令清单」三块核心内容
5. 跑 `node scripts/publish-plugin.js plugins/<新专家名>` 验证打包
