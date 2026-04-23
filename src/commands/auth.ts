import { Command } from 'commander';
import { loadConfig } from '../config';
import { info } from '../utils/printer';

function card(title: string, rows: [string, string][]): string {
  const col1 = Math.max(...rows.map(([k]) => k.length), 10);
  const col2 = 60 - col1 - 4;
  const lines = [
    `  +${'-'.repeat(col1)}+${'-'.repeat(col2)}+`,
    `  |${title.padEnd(col1)}|${''.padEnd(col2)}|`,
    `  +${'-'.repeat(col1)}+${'-'.repeat(col2)}+`,
  ];
  for (const [k, v] of rows) {
    lines.push(`  |${k.padEnd(col1)}|${v.substring(0, col2).padEnd(col2)}|`);
  }
  lines.push(`  +${'-'.repeat(col1)}+${'-'.repeat(col2)}+`);
  return lines.join('\n');
}

export function registerAuthCommands(program: Command) {
  program
    .command('whoami')
    .description('查看当前登录信息')
    .action(() => {
      const config = loadConfig();
      if (!config) {
        info('未配置，请先运行：wkea-manage-cli init');
        return;
      }
      console.log('');
      console.log(card('当前登录信息', [
        ['API 地址', config.apiUrl],
        ['用户名', config.username],
        ['Token', config.token.substring(0, 16) + '...'],
        ['登录时间', config.updatedAt.replace('T', ' ').substring(0, 19)],
      ]));
      console.log('');
    });
}
