#!/usr/bin/env node
/**
 * 校验 plugin 目录的 spec 合规性
 *
 * 用法：
 *   node scripts/validate-plugin.js <plugin-dir>
 *
 * 校验项（不生成任何 zip / dist 产物）：
 *   - manifest 目录存在（.workbuddy-plugin/ 或 .codebuddy-plugin/）
 *   - plugin.json 合法 + 必填字段齐全
 *   - expertType 必须是 "agent" 或 "team"
 *   - team 型额外校验（teamInfo、members、profession === displayName）
 *   - name 必须是 kebab-case
 *   - plugin === name
 *   - tags 固定 3 个
 *   - quickPrompts 固定 3 个
 *   - defaultInitPrompt.zh === quickPrompts[0].zh
 *   - agents 目录有 .md 文件
 *   - agent md frontmatter 合法
 *   - frontmatter 禁止 tools/requires
 *   - 必填字段：name、description
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
  console.log('用法：node scripts/validate-plugin.js <plugin-dir>');
  console.log('示例：node scripts/validate-plugin.js plugins/WKEA-供应商开发专家');
  process.exit(0);
}

const pluginDir = args[0];

if (!fs.existsSync(pluginDir)) {
  console.error(`✗ 目录不存在：${pluginDir}`);
  process.exit(1);
}

let manifestDir = path.join(pluginDir, '.workbuddy-plugin');
if (!fs.existsSync(manifestDir)) {
  const legacyDir = path.join(pluginDir, '.codebuddy-plugin');
  if (fs.existsSync(legacyDir)) {
    manifestDir = legacyDir;
  } else {
    console.error(`✗ manifest 目录不存在：.workbuddy-plugin/ 或 .codebuddy-plugin/`);
    process.exit(1);
  }
}

const pluginJsonPath = path.join(manifestDir, 'plugin.json');
if (!fs.existsSync(pluginJsonPath)) {
  console.error(`✗ plugin.json 不存在：${pluginJsonPath}`);
  process.exit(1);
}

let pluginJson;
try {
  pluginJson = JSON.parse(fs.readFileSync(pluginJsonPath, 'utf-8'));
} catch (e) {
  console.error(`✗ plugin.json 解析失败：${e.message}`);
  process.exit(1);
}

const requiredFields = ['name', 'version', 'description', 'agents', 'expertType', 'agentName', 'displayName', 'profession', 'displayDescription', 'avatar', 'plugin', 'tags', 'quickPrompts', 'defaultInitPrompt'];
for (const f of requiredFields) {
  if (!pluginJson[f]) {
    console.error(`✗ plugin.json 缺少必填字段：${f}`);
    process.exit(1);
  }
}

if (pluginJson.expertType !== 'agent' && pluginJson.expertType !== 'team') {
  console.error(`✗ expertType 必须是 "agent" 或 "team"，当前是 "${pluginJson.expertType}"`);
  process.exit(1);
}

if (pluginJson.expertType === 'team') {
  if (!pluginJson.teamInfo || !pluginJson.teamInfo.leadAgent || !Array.isArray(pluginJson.teamInfo.memberAgents)) {
    console.error(`✗ team 型 plugin.json 必须包含 teamInfo.leadAgent + teamInfo.memberAgents 数组`);
    process.exit(1);
  }
  if (!Array.isArray(pluginJson.members) || pluginJson.members.length === 0) {
    console.error(`✗ team 型 plugin.json 必须包含 members 数组（含主理人 role=lead）`);
    process.exit(1);
  }
  const lead = pluginJson.members.find((m) => m.role === 'lead');
  if (!lead) {
    console.error(`✗ team 型 members 中必须有一个 role=lead 的主理人`);
    process.exit(1);
  }
  if (lead.id !== pluginJson.teamInfo.leadAgent) {
    console.error(`✗ members 中 role=lead 的 id 必须等于 teamInfo.leadAgent`);
    process.exit(1);
  }
  if (JSON.stringify(pluginJson.profession) !== JSON.stringify(pluginJson.displayName)) {
    console.error(`✗ team 型 profession 必须与 displayName 一致`);
    process.exit(1);
  }
}

if (!/^[a-z][a-z0-9-]*$/.test(pluginJson.name)) {
  console.error(`✗ name 必须是 kebab-case（英文小写+连字符），当前是 "${pluginJson.name}"`);
  process.exit(1);
}

if (pluginJson.plugin !== pluginJson.name) {
  console.error(`✗ plugin 字段必须等于 name`);
  process.exit(1);
}

if (pluginJson.tags.length !== 3) {
  console.error(`✗ tags 必须固定 3 个，当前是 ${pluginJson.tags.length} 个`);
  process.exit(1);
}

if (pluginJson.quickPrompts.length !== 3) {
  console.error(`✗ quickPrompts 必须固定 3 个，当前是 ${pluginJson.quickPrompts.length} 个`);
  process.exit(1);
}

if (pluginJson.defaultInitPrompt.zh !== pluginJson.quickPrompts[0].zh) {
  console.error(`✗ defaultInitPrompt.zh 必须与 quickPrompts[0].zh 一致`);
  console.error(`  defaultInitPrompt.zh: ${pluginJson.defaultInitPrompt.zh}`);
  console.error(`  quickPrompts[0].zh:   ${pluginJson.quickPrompts[0].zh}`);
  process.exit(1);
}

const agentsDir = path.join(pluginDir, 'agents');
if (!fs.existsSync(agentsDir)) {
  console.error(`✗ agents 目录不存在：${agentsDir}`);
  process.exit(1);
}

const agentFiles = fs.readdirSync(agentsDir).filter((f) => f.endsWith('.md'));
if (agentFiles.length === 0) {
  console.error(`✗ agents 目录没有 .md 文件`);
  process.exit(1);
}

for (const f of agentFiles) {
  const content = fs.readFileSync(path.join(agentsDir, f), 'utf-8');
  if (!content.startsWith('---')) {
    console.error(`✗ ${f} 缺少 frontmatter（必须以 --- 开头）`);
    process.exit(1);
  }
  const fmMatch = content.match(/^---\r?\n([\s\S]+?)\r?\n---/);
  if (!fmMatch) {
    console.error(`✗ ${f} frontmatter 格式错误`);
    process.exit(1);
  }
  const fm = fmMatch[1];
  if (/^tools\s*:/m.test(fm)) {
    console.error(`✗ ${f} frontmatter 禁止声明 tools 字段`);
    process.exit(1);
  }
  if (/^requires\s*:/m.test(fm)) {
    console.error(`✗ ${f} frontmatter 禁止声明 requires 字段`);
    process.exit(1);
  }
  const fmRequired = ['name', 'description'];
  for (const field of fmRequired) {
    if (!new RegExp(`^${field}\\s*:`, 'm').test(fm)) {
      console.error(`✗ ${f} frontmatter 缺少必填字段：${field}`);
      process.exit(1);
    }
  }
}

console.log(`✓ 校验通过：${path.basename(pluginDir)}`);
console.log(`  name:        ${pluginJson.name}`);
console.log(`  expertType:  ${pluginJson.expertType}`);
console.log(`  agentName:   ${pluginJson.agentName}`);
console.log(`  version:     ${pluginJson.version}`);
console.log(`  agents:      ${agentFiles.length} 个 .md 文件`);
if (pluginJson.expertType === 'team') {
  console.log(`  team:        lead=${pluginJson.teamInfo.leadAgent}, members=${pluginJson.teamInfo.memberAgents.join(', ')}`);
}
