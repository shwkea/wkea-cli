import { Command, Option } from 'commander';
import axios from 'axios';
import { saveConfig, loadConfig, WkeaConfig } from '../config';
import { success, error, info } from '../utils/printer';

const TEST_PATH = '/fuwuqi/test';

async function doLogin(apiUrl: string, username: string, password: string): Promise<string> {
  info(`正在连接 ${apiUrl} ...`);
  try {
    await axios.get(`${apiUrl}${TEST_PATH}`, { timeout: 10000 });
  } catch (e: any) {
    const detail = (e as any).detail;
    if (e.code === 'ENOTFOUND' || e.code === 'ECONNREFUSED') {
      error('无法连接，请检查地址或服务器是否已启动');
    } else if (e.code === 'ETIMEDOUT') {
      error('连接超时，请检查网络或服务器地址');
    } else {
      error(`无法连接：${e.message}`);
    }
    throw new Error('CONN_FAIL');
  }

  info(`正在登录用户 ${username} ...`);
  let token = '';
  try {
    const resp = await axios.post(`${apiUrl}/api/manage/passport/login`, {
      account: username,
      password,
    }, { timeout: 15000 });

    if (resp.data.status !== 200) {
      const msg = resp.data.msg || '未知错误';
      if (msg.includes('密码')) {
        error(`密码错误：${msg}`);
      } else if (msg.includes('不存在') || msg.includes('账号')) {
        error(`用户名不存在：${msg}`);
      } else {
        error(`登录失败：${msg}`);
      }
      throw new Error('LOGIN_FAIL');
    }

    token = typeof resp.data.data === 'string' ? resp.data.data : resp.data.data?.token;
    if (!token) {
      error('登录失败：未获取到 Token');
      throw new Error('TOKEN_MISSING');
    }
  } catch (e: any) {
    const detail = (e as any).detail;
    if (e.message === 'CONN_FAIL' || e.message === 'LOGIN_FAIL' || e.message === 'TOKEN_MISSING') throw e;
    if (e.response?.status === 400) {
      const msg = e.response?.data?.msg || '';
      if (msg.includes('密码')) {
        error(`密码错误：${msg}`);
      } else if (msg.includes('账号') || msg.includes('不存在')) {
        error(`用户名不存在：${msg}`);
      } else {
        error(`登录失败：${msg || e.message}`);
      }
    } else if (e.code === 'ECONNABORTED' || e.message?.includes('timeout')) {
      error('登录请求超时，请检查网络');
    } else {
      error(`登录请求失败：${e.message}`);
    }
    throw new Error('LOGIN_FAIL');
  }
  return token;
}

export function registerInitCommand(program: Command) {
  program
    .command('init')
    .description('初始化或更新配置')
    .addOption(
      new Option('--api-url <url>').hideHelp()
    )
    .addOption(
      new Option('--username <username>').hideHelp()
    )
    .addOption(
      new Option('--password <password>').hideHelp()
    )
    .action(async (opts) => {
      const existing = loadConfig();
      const apiUrl = opts.apiUrl || existing?.apiUrl;
      const username = opts.username || existing?.username;
      const password = opts.password || existing?.password;

      // 无参数时显示用法
      if (!opts.apiUrl && !opts.username && !opts.password) {
        console.log('');
        info('wkea-manage-cli init 用法：');
        console.log('');
        console.log('  wkea-manage-cli init --api-url <地址> --username <用户名> --password <密码>');
        console.log('');
        if (existing?.apiUrl) {
          info(`已有配置：${existing.apiUrl} (${existing.username})`);
          console.log('');
          info('可只传需要更新的参数，其他沿用现有配置：');
          console.log('');
          console.log('  # 只更新密码：');
          console.log('  wkea-manage-cli init --password <新密码>');
          console.log('');
          console.log('  # 更新用户名和密码：');
          console.log('  wkea-manage-cli init --username <用户名> --password <新密码>');
          console.log('');
        } else {
          info('必填参数：');
          console.log('');
          console.log('  --api-url    API 服务器地址（如 https://api-test.wkea.cn）');
          console.log('  --username   登录用户名');
          console.log('  --password   登录密码');
          console.log('');
        }
        console.log('');
        return;
      }

      // 参数校验
      if (!apiUrl) { error('--api-url 不能为空'); process.exit(1); }
      if (!username) { error('--username 不能为空'); process.exit(1); }
      if (!password) { error('--password 不能为空'); process.exit(1); }

      const cleanApiUrl = apiUrl.trim().replace(/\/$/, '');
      const cleanUsername = username.trim();

      // 登录
      let token = '';
      try {
        token = await doLogin(cleanApiUrl, cleanUsername, password);
      } catch (e: any) {
    const detail = (e as any).detail;
        process.exit(1);
      }

      // 保存
      const config: WkeaConfig = {
        apiUrl: cleanApiUrl,
        username: cleanUsername,
        account: cleanUsername,
        password,
        token,
        updatedAt: new Date().toISOString(),
      };
      saveConfig(config);

      info('');
      success('CLI 配置完成！');
      console.log(`  API 地址：${cleanApiUrl}`);
      console.log(`  用户名：${cleanUsername}`);
    });
}
