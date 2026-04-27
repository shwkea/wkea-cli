import { Command } from 'commander';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const SYSTEM_DOC = 'docs/skills-system.md';
const BUSINESS_DOC = 'docs/skills-business.md';

function readMarkdown(filename: string): string {
  const path = resolve(__dirname, '..', filename);
  if (!existsSync(path)) {
    return `\n\n> [警告] ${filename} 未找到，请检查 CLI 是否正确安装\n`;
  }
  return readFileSync(path, 'utf-8');
}

export function registerSkillsCommand(program: Command) {
  program
    .command('skills')
    .description('AI 工具说明文档（系统原则 + 业务描述）')
    .action(() => {
      const system = readMarkdown(SYSTEM_DOC);
      const business = readMarkdown(BUSINESS_DOC);
      console.log('```skills');
      console.log(system.trim());
      console.log(business.trim());
      console.log('```');
    });
}

export function getSkillsContent(): string {
  const system = readMarkdown(SYSTEM_DOC);
  const business = readMarkdown(BUSINESS_DOC);
  return '```skills\n' + system.trim() + '\n' + business.trim() + '\n```';
}
