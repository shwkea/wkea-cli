import { Command } from 'commander';
import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { resolve, join } from 'path';

const SYSTEM_DOC = 'docs/skills-system.md';
const BUSINESS_DOC = 'docs/skills-business.md';
const MODULES_DIR = 'docs/modules';

function readMarkdown(filename: string): string {
  const path = resolve(__dirname, '../..', filename);
  if (!existsSync(path)) {
    return '';
  }
  return readFileSync(path, 'utf-8');
}

/** 读取 docs/modules/ 下所有 .md 文件（按文件名排序），拼接为一个文档 */
function readModules(): string {
  const dir = resolve(__dirname, '../..', MODULES_DIR);
  if (!existsSync(dir)) {
    return '';
  }
  const files = readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .sort();
  const parts: string[] = [];
  for (const file of files) {
    const fullPath = join(dir, file);
    if (statSync(fullPath).isFile()) {
      const content = readFileSync(fullPath, 'utf-8').trim();
      if (content) {
        parts.push(content);
      }
    }
  }
  return parts.join('\n\n---\n\n');
}

export function registerSkillsCommand(program: Command) {
  program
    .command('skills')
    .description('AI 系统操作规则（执行原则、通用流程、基础用法）')
    .action(() => {
      const system = readMarkdown(SYSTEM_DOC);
      console.log('```skills');
      console.log(system.trim());
      console.log('```');
    });
}
