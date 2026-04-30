import { Command } from 'commander';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const SETUP_DOC = 'docs/setup-guide.md';

export function registerSetupCommand(program: Command) {
  program
    .command('setup')
    .description('AI 初始化引导（按步骤完成 WKEA CLI 全部配置）')
    .action(() => {
      const path = resolve(__dirname, '../..', SETUP_DOC);
      if (!existsSync(path)) {
        console.log('错误：引导文档不存在，请检查 CLI 是否正确安装');
        process.exit(1);
      }
      const guide = readFileSync(path, 'utf-8');
      console.log(guide.trim());
    });
}
