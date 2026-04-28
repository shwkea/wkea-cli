import { Command } from 'commander';
import { execSync } from 'child_process';
import { info, success, error } from '../utils/printer';
import pkg from '../../package.json';

export function registerSystemCommands(program: Command) {
  program
    .command('version')
    .description('查看当前版本')
    .action(() => {
      console.log(`  wkea-manage-cli  v${pkg.version}`);
      console.log(`  后台管理 CLI 工具`);
      console.log('');
    });

  program
    .command('update')
    .description('更新到最新版本')
    .action(() => {
      try {
        info('正在检查并更新 wkea-manage-cli ...');
        execSync('npm update -g wkea-manage-cli', { stdio: 'inherit' });
        success('CLI 更新完成！');
        console.log('');
        info('更新完成后，运行以下命令获取最新 Skills 内容，然后更新 AI 助手的 Skills 配置：');
        console.log('  wkea-manage-cli skills');
      } catch (e) {
        error('更新失败，请检查网络或手动运行：npm install -g wkea-manage-cli');
        process.exit(1);
      }
    });
}
