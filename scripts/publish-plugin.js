#!/usr/bin/env node
/**
 * 打包单个 plugin 目录为 WorkBuddy 兼容的 zip
 *
 * 用法：
 *   node scripts/publish-plugin.js <plugin-dir>
 *   node scripts/publish-plugin.js <plugin-dir> --out <output-dir>
 *
 * 使用 Node 原生 zlib 实现 zip 编码，避免 PowerShell 中文路径乱码
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const args = process.argv.slice(2);
if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
  console.log('用法：node scripts/publish-plugin.js <plugin-dir> [--out <output-dir>]');
  console.log('示例：node scripts/publish-plugin.js plugins/供应商开发专家');
  process.exit(0);
}

const pluginDir = args[0];
const outIdx = args.indexOf('--out');
const outDir = outIdx > -1 ? args[outIdx + 1] : path.join(pluginDir, '..', '..', 'dist', 'plugins');

if (!fs.existsSync(pluginDir)) {
  console.error(`✗ 目录不存在：${pluginDir}`);
  process.exit(1);
}

// WorkBuddy 规范：manifest 目录必须是 .workbuddy-plugin（不是 .codebuddy-plugin）
const manifestDir = path.join(pluginDir, '.workbuddy-plugin');
if (!fs.existsSync(manifestDir)) {
  // 兼容旧目录名，自动重命名
  const legacyDir = path.join(pluginDir, '.codebuddy-plugin');
  if (fs.existsSync(legacyDir)) {
    console.log(`  ! 检测到 .codebuddy-plugin 目录，重命名为 .workbuddy-plugin`);
    fs.renameSync(legacyDir, manifestDir);
  } else {
    console.error(`✗ manifest 目录不存在：${manifestDir}`);
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

// 校验必填字段
const requiredFields = ['name', 'version', 'description', 'agents', 'expertType', 'agentName', 'displayName', 'profession', 'displayDescription', 'avatar', 'plugin', 'tags', 'quickPrompts', 'defaultInitPrompt'];
for (const f of requiredFields) {
  if (!pluginJson[f]) {
    console.error(`✗ plugin.json 缺少必填字段：${f}`);
    process.exit(1);
  }
}

if (pluginJson.expertType !== 'agent') {
  console.error(`✗ expertType 必须是 "agent"，当前是 "${pluginJson.expertType}"`);
  process.exit(1);
}

// name 必须是 kebab-case
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

// defaultInitPrompt.zh 必须与 quickPrompts[0].zh 一致
if (pluginJson.defaultInitPrompt.zh !== pluginJson.quickPrompts[0].zh) {
  console.error(`✗ defaultInitPrompt.zh 必须与 quickPrompts[0].zh 一致`);
  console.error(`  defaultInitPrompt.zh: ${pluginJson.defaultInitPrompt.zh}`);
  console.error(`  quickPrompts[0].zh:   ${pluginJson.quickPrompts[0].zh}`);
  process.exit(1);
}

// 校验 agent 文件
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
  const fmMatch = content.match(/^---\n([\s\S]+?)\n---/);
  if (!fmMatch) {
    console.error(`✗ ${f} frontmatter 格式错误`);
    process.exit(1);
  }
  const fm = fmMatch[1];
  // frontmatter 禁止声明 tools / requires
  if (/^tools\s*:/m.test(fm)) {
    console.error(`✗ ${f} frontmatter 禁止声明 tools 字段`);
    process.exit(1);
  }
  if (/^requires\s*:/m.test(fm)) {
    console.error(`✗ ${f} frontmatter 禁止声明 requires 字段`);
    process.exit(1);
  }
  // 必填
  const fmRequired = ['name', 'description'];
  for (const field of fmRequired) {
    if (!new RegExp(`^${field}\\s*:`, 'm').test(fm)) {
      console.error(`✗ ${f} frontmatter 缺少必填字段：${field}`);
      process.exit(1);
    }
  }
}

// 创建输出目录
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const pluginName = path.basename(pluginDir);
const zipName = `${pluginName}-v${pluginJson.version}.zip`;
const zipPath = path.join(outDir, zipName);

// 用 Node 原生 zlib 打包，避免 PowerShell 编码问题
function crc32(buf) {
  let table = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    table[n] = c;
  }
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  return (crc ^ 0xffffffff) >>> 0;
}

function makeZip(srcDir, outPath, rootName) {
  const files = [];
  function walk(dir, base) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      const rel = base ? `${base}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        walk(full, rel);
      } else {
        files.push({ rel: `${rootName}/${rel}`, full });
      }
    }
  }
  walk(srcDir, '');
  files.sort((a, b) => (a.rel < b.rel ? -1 : 1));

  const parts = [];
  const central = [];
  let offset = 0;

  for (const f of files) {
    const data = fs.readFileSync(f.full);
    const nameBuf = Buffer.from(f.rel.replace(/\\/g, '/'), 'utf-8');
    const crc = crc32(data);
    const size = data.length;
    const isUtf8 = true;

    // Local file header
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);  // version
    local.writeUInt16LE(0x0800, 6);  // flags (UTF-8)
    local.writeUInt16LE(0, 8);  // compression (stored)
    local.writeUInt16LE(0, 10);  // time
    local.writeUInt16LE(0, 12);  // date
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(size, 18);
    local.writeUInt32LE(size, 22);
    local.writeUInt16LE(nameBuf.length, 26);
    local.writeUInt16LE(0, 28);

    parts.push(local, nameBuf, data);

    // Central directory header
    const cd = Buffer.alloc(46);
    cd.writeUInt32LE(0x02014b50, 0);
    cd.writeUInt16LE(20, 4);
    cd.writeUInt16LE(20, 6);
    cd.writeUInt16LE(0x0800, 8);
    cd.writeUInt16LE(0, 10);
    cd.writeUInt16LE(0, 12);
    cd.writeUInt16LE(0, 14);
    cd.writeUInt32LE(crc, 16);
    cd.writeUInt32LE(size, 20);
    cd.writeUInt32LE(size, 24);
    cd.writeUInt16LE(nameBuf.length, 28);
    cd.writeUInt16LE(0, 30);
    cd.writeUInt16LE(0, 32);
    cd.writeUInt16LE(0, 34);
    cd.writeUInt16LE(0, 36);
    cd.writeUInt32LE(0, 38);
    cd.writeUInt32LE(offset, 42);
    central.push(cd, nameBuf);

    offset += local.length + nameBuf.length + data.length;
  }

  const cdSize = central.reduce((s, b) => s + b.length, 0);
  const cdOffset = offset;

  // End of central directory
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(files.length, 8);
  eocd.writeUInt16LE(files.length, 10);
  eocd.writeUInt32LE(cdSize, 12);
  eocd.writeUInt32LE(cdOffset, 16);
  eocd.writeUInt16LE(0, 20);

  const all = Buffer.concat([...parts, ...central, eocd]);
  fs.writeFileSync(outPath, all);
  return files.length;
}

try {
  if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);
  // zip 根目录 = plugin.json 的 name 字段（kebab-case），避免中文目录编码问题
  const count = makeZip(pluginDir, zipPath, pluginJson.name);
  const size = fs.statSync(zipPath).size;
  console.log(`\n✓ 打包成功：${zipPath} (${(size / 1024).toFixed(1)}KB)`);
  console.log(`  name: ${pluginJson.name}`);
  console.log(`  agentName: ${pluginJson.agentName}`);
  console.log(`  version: ${pluginJson.version}`);
  console.log(`  agents: ${agentFiles.length} 个文件（共 ${count} 个文件入包）`);
} catch (e) {
  console.error(`✗ 打包失败：${e.message}`);
  console.error(e.stack);
  process.exit(1);
}
