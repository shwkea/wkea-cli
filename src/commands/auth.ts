import { Command } from 'commander';
import { loadConfig, clearConfig } from '../config';
import { success, info, heading } from '../utils/printer';

export function registerAuthCommands(program: Command) {

  // logout
  program
    .command('logout')
    .description('退出登录（清除本地配置）')
    .action(() => {
      const config = loadConfig();
      if (!config) {
        info('当前未配置，无需退出');
        return;
      }
      clearConfig();
      success('已退出登录，配置已清除');
    });

  // whoami
  program
    .command('whoami')
    .description('查看当前登录信息')
    .action(() => {
      const config = loadConfig();
      if (!config) {
        info('未配置，请先运行：wkea init');
        return;
      }
      heading('当前配置信息');
      console.log(`  API 地址：${config.apiUrl}`);
      console.log(`  用户名：${config.username}`);
      console.log(`  Token：${config.token.substring(0, 20)}...`);
      console.log(`  登录时间：${config.updatedAt}`);
    });
}
