const fs = require('fs');
const { execSync } = require('child_process');

const ZIP_NAME = 'wkea-cli-dist.zip';
const ITEMS = ['SKILL.md', 'package.json', 'dist', 'docs'];

// 删除旧压缩包
try { fs.unlinkSync(ZIP_NAME); } catch {}

const items = ITEMS.filter(i => fs.existsSync(i));
if (items.length === 0) {
  console.error('没有找到可打包的文件');
  process.exit(1);
}

const psItems = items.map(i => `'${i}'`).join(',');
execSync(
  `powershell -Command "Compress-Archive -Path ${psItems} -DestinationPath '${ZIP_NAME}' -Force"`,
  { stdio: 'inherit' }
);

const stat = fs.statSync(ZIP_NAME);
console.log(`打包完成: ${ZIP_NAME} (${(stat.size / 1024).toFixed(0)}KB)`);
