import { Command } from 'commander';
import axios from 'axios';
import { loadConfig, saveConfig, buildBaseUrl, WkeaConfig, clearConfig } from '../config';
import { success, warn, error, heading, info } from '../utils/printer';

async function doLogin(
  username: string,
  password: string,
  env: 'prod' | 'test'
): Promise<void> {
  const baseURL = buildBaseUrl(env);
  try {
    const resp = await axios.post<any>(`${baseURL}/api/manage/passport/login`, {
      username,
      password,
    });

    if (resp.data.status !== 200) {
      error(`登录失败：${resp.data.msg}`);
      process.exit(1);
    }

    const token = resp.data.data?.token;
    if (!token) {
      error('登录失败：未获取到 Token');
      process.exit(1);
    }

    const config: WkeaConfig = {
      token,
      username,
      env,
      updatedAt: new Date().toISOString(),
    };

    saveConfig(config);
    success(`登录成功，欢迎 ${username}（${env === 'prod' ? '生产' : '测试'}环境）`);
  } catch (e: any) {
    error(`登录请求失败：${e.message}`);
    process.exit(1);
  }
}

export function registerAuthCommands(program: Command) {
  // login
  program
    .command('login')
    .description('登录 WKEA 后台')
    .requiredOption('--username <username>', '用户名（必填）')
    .requiredOption('--password <password>', '密码（必填）')
    .option('--env <env>', '环境：prod（默认）/ test', 'prod')
    .action(async (opts) => {
      const existing = loadConfig();
      if (existing) {
        warn(
          `当前已登录为 ${existing.username}（${existing.env === 'prod' ? '生产' : '测试'}环境）`
        );
        warn('将使用新账号覆盖登录');
      }
      await doLogin(opts.username, opts.password, opts.env as 'prod' | 'test');
    });

  // logout
  program
    .command('logout')
    .description('退出登录')
    .action(() => {
      clearConfig();
      success('已退出登录');
    });

  // whoami
  program
    .command('whoami')
    .description('查看当前登录信息')
    .action(() => {
      const config = loadConfig();
      if (!config) {
        info('未登录，请先运行：wkea login --username <用户名> --password <密码>');
        return;
      }
      heading('当前登录信息');
      console.log(`  用户名：${config.username}`);
      console.log(`  环境：${config.env === 'prod' ? '生产' : '测试'}`);
      console.log(`  Token：${config.token.substring(0, 20)}...`);
      console.log(`  登录时间：${config.updatedAt}`);
    });
}
