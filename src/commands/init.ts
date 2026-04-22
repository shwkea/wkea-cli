import { Command } from 'commander';
import axios from 'axios';
import inquirer from 'inquirer';
import { saveConfig, loadConfig, WkeaConfig } from '../config';
import { success, error, info, warn, heading } from '../utils/printer';

/** 测试连接接口 */
const TEST_PATH = '/fuwuqi/test';

async function prompt(question: { name: string; message: string; mask?: string }): Promise<string> {
  const answers = await inquirer.prompt<{ value: string }>([question]);
  return answers.value;
}

async function doInit(apiUrl?: string, username?: string, password?: string): Promise<void> {
  // 无参数且已有配置：显示配置信息并退出
  if (!(apiUrl || username || password)) {
    const existing = loadConfig();
    if (existing?.apiUrl && existing?.token) {
      success('CLI 已配置完成');
      info(`API 地址：${existing.apiUrl}`);
      info(`用户名：${existing.username}`);
      info('');
      info('如需重新配置，请运行：wkea-manage-cli reset');
      process.exit(0);
    }
  }

  if (apiUrl || username || password) {
    info('检测到参数，将跳过交互式配置...');
  }

  // 1. 引导获取 API 地址
  if (!apiUrl) {
    info('');
    apiUrl = await prompt({
      name: 'value',
      message: '请输入 API 服务器地址：',
    });
  }
  apiUrl = apiUrl.trim().replace(/\/$/, '');

  if (!apiUrl) {
    error('API 地址不能为空');
    process.exit(1);
  }

  // 2. 测试连接
  info(`正在连接 ${apiUrl} ...`);
  try {
    await axios.get(`${apiUrl}${TEST_PATH}`, { timeout: 10000 });
    success('连接成功 ✓');
  } catch (e: any) {
    error(`无法连接到 ${apiUrl}`);
    if (e.code === 'ENOTFOUND' || e.code === 'ECONNREFUSED') {
      error('请检查地址是否正确，服务器是否已启动');
    } else if (e.code === 'ETIMEDOUT') {
      error('连接超时，请检查网络或服务器地址');
    } else {
      error(`错误信息：${e.message}`);
    }
    process.exit(1);
  }

  // 3. 引导获取账号密码
  if (!username) {
    info('');
    username = await prompt({ name: 'value', message: '请输入用户名：' });
    username = username.trim();
  }
  if (!username) {
    error('用户名不能为空');
    process.exit(1);
  }

  if (!password) {
    info('');
    password = await prompt({ name: 'value', message: '请输入密码：', mask: '*' });
  }
  if (!password) {
    error('密码不能为空');
    process.exit(1);
  }

  // 4. 登录
  info('');
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
        error(`密码错误，请重新运行 init 输入正确密码`);
      } else if (msg.includes('不存在')) {
        error(`用户名不存在，请检查用户名是否正确`);
      } else {
        error(`登录失败：${msg}`);
      }
      process.exit(1);
    }

    token = typeof resp.data.data === 'string' ? resp.data.data : resp.data.data?.token;
    if (!token) {
      error('登录失败：未获取到 Token');
      process.exit(1);
    }
  } catch (e: any) {
    if (e.response?.status === 400) {
      const msg = e.response?.data?.msg || '';
      if (msg.includes('密码')) {
        error(`密码错误，请重新运行 init 输入正确密码`);
      } else if (msg.includes('账号') || msg.includes('不存在')) {
        error(`用户名不存在，请检查用户名是否正确`);
      } else {
        error(`登录失败：${msg || e.message}`);
      }
    } else if (e.code === 'ECONNABORTED' || e.message?.includes('timeout')) {
      error('登录请求超时，请检查网络');
    } else {
      error(`登录请求失败：${e.message}`);
    }
    process.exit(1);
  }

  success('登录成功 ✓');

  // 5. 保存配置
  const config: WkeaConfig = {
    apiUrl,
    username,
    account: username,
    password,
    token,
    updatedAt: new Date().toISOString(),
  };
  saveConfig(config);

  info('');
  heading('配置完成');
  console.log(`  API 地址：${apiUrl}`);
  console.log(`  用户名：${username}`);
  info('');
  success('CLI 初始化完成，可以开始使用！');
}

export { doInit as init };

export function registerInitCommand(program: Command) {
  program
    .command('init')
    .description('初始化配置（API地址、账号、密码），支持参数或引导式输入')
    .option('--api-url <apiUrl>', 'API 服务器地址（如 https://api.wkea.cn）')
    .option('--username <username>', '用户名')
    .option('--password <password>', '密码')
    .action(async (opts) => {
      await doInit(opts.apiUrl, opts.username, opts.password);
    });
}
