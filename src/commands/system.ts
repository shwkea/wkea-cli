import { Command } from 'commander';
import { execSync } from 'child_process';
import { ApiClient } from '../api/client';
import { getSystemUrls } from '../api/system';
import { formatJsonWithFields } from '../utils/formatter';
import { info, success, error } from '../utils/printer';
import { getApiUrl } from '../config';

export function registerSystemCommands(program: Command) {

  program
    .command('update')
    .description('更新到最新代码')
    .action(() => {
      try {
        info('正在更新 wkea-cli ...');
        execSync('git pull && npm install && npm run build', { stdio: 'inherit' });
        success('更新完成！');
      } catch (e) {
        error('更新失败，请检查网络或手动运行：git pull && npm install && npm run build');
        process.exit(1);
      }
    });

  program
    .command('urls')
    .description('获取环境URL配置（后台管理地址、商城地址）')
    .action(async () => {
      const client = new ApiClient(getApiUrl());
      try {
        const data = await getSystemUrls(client);
        console.log(formatJsonWithFields(data, [
          { field: 'manageMainUrl', type: 'string', desc: '后台管理首页URL' },
          { field: 'ecUrl', type: 'string', desc: '商城首页URL' },
        ]));
      } catch (e: any) {
        error(e);
        process.exit(1);
      }
    });
}
