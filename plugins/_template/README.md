# 模板专家

这是新专家的起点，请按以下步骤填充内容：

1. 复制 `plugins/_template/` 为 `plugins/<新专家名>/`
2. 修改 `plugin.json` 的 name、agentName、description、tags、quickPrompts
3. 修改 `agents/agent.md` 的 frontmatter 和正文
4. 跑 `node scripts/publish-plugin.js plugins/<新专家名>` 验证打包

## 命名约定

- **目录名**：中文（与 WorkBuddy UI 一致）
- **agentName**（plugin.json + frontmatter）：英文 kebab-case，跨平台稳定
- **displayName**：中文为主，英文可选

## frontmatter 必填字段

| 字段 | 说明 | 示例 |
|------|------|------|
| `name` | 中文名 | `供应商开发专家` |
| `agentName` | 英文 ID | `vendor-expert` |
| `description` | 一句话说明何时调用 | 工业品供应商开发专家... |
| `maxTurns` | 最大轮次 | 50 |
| `version` | 版本 | 1.0.0 |
| `requires` | 依赖 | `{ cli: wkea-cli, skills: [...], mcp: [...] }` |

## 兼容性

- **WorkBuddy**：识别 `expertType=agent`、`agentName`、`displayName` 等
- **Claude Agent SDK**：识别 `tools`、`model` 字段
- **Codex CLI**：识别 `name`、`description`
- 未知字段安全忽略，扩展字段用 `x-*` 前缀
