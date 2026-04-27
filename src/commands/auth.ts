import { Command } from 'commander';
import axios from 'axios';
import { loadConfig, saveConfig } from '../config';
import { info, success, error } from '../utils/printer';

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
    .description('验证登录状态（实时重新登录）')
    .action(async () => {
      const config = loadConfig();
      if (!config?.apiUrl || !config?.account || !config?.password) {
        info('未完整配置，请先运行：wkea-manage-cli init');
        return;
      }

      info(`正在登录 ${config.apiUrl}...`);
      try {
        const resp = await axios.post(`${config.apiUrl}/api/manage/passport/login`, {
          account: config.account,
          password: config.password,
        });

        if (resp.data?.status !== 200) {
          error(resp.data?.msg || '登录失败');
          process.exit(1);
        }

        const newToken = typeof resp.data.data === 'string'
          ? resp.data.data
          : resp.data.data?.token;

        if (!newToken) {
          error('登录响应中未找到 Token');
          process.exit(1);
        }

        // 保存新 token
        const updated = { ...config, token: newToken, updatedAt: new Date().toISOString() };
        saveConfig(updated);

        console.log('');
        console.log(card('登录成功', [
          ['API 地址', config.apiUrl],
          ['账号', config.account],
          ['Token', newToken.substring(0, 16) + '...'],
          ['登录时间', updated.updatedAt.replace('T', ' ').substring(0, 19)],
        ]));
        console.log('');
      } catch (e: any) {
        const msg = e.response?.data?.msg || e.message;
        error(`登录失败：${msg}`);
        process.exit(1);
      }
    });
}
