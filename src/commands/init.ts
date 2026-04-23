import { Command } from 'commander';
import axios from 'axios';
import inquirer from 'inquirer';
import { saveConfig, loadConfig, WkeaConfig } from '../config';
import { success, error, info } from '../utils/printer';

const TEST_PATH = '/fuwuqi/test';

async function prompt(question: { name: string; message: string; default?: string; mask?: string }): Promise<string> {
  const answers = await inquirer.prompt<{ value: string }>([question]);
  return answers.value;
}

function mask(s: string): string {
  return s ? '******' : '(未设置)';
}

async function doInit(): Promise<void> {
  const existing = loadConfig();

  // 显示现有配置
  if (existing?.apiUrl || existing?.username) {
    info('当前配置：');
    console.log(`  API 地址：${existing.apiUrl || '(未设置)'}`);
    console.log(`  用户名：${existing.username || '(未设置)'}`);
    console.log(`  密码：${mask(existing.password || '')}`);
    info('');
  }

  // 询问是否复用现有配置
  if (existing?.apiUrl && existing?.username && existing?.password) {
    const { reuse } = await inquirer.prompt<{ reuse: boolean }>([{
      name: 'reuse',
      type: 'confirm',
      message: '是否复用现有配置？',
      default: true,
    }]);
    if (reuse) {
      // 仍测试连接，token 可能已过期
      info(`正在连接 ${existing.apiUrl} ...`);
      try {
        await axios.get(`${existing.apiUrl}${TEST_PATH}`, { timeout: 10000 });
        success('连接成功 ✓');
      } catch {
        error(`无法连接到 ${existing.apiUrl}，请重新配置`);
        process.exit(1);
      }
      info(`正在验证用户 ${existing.username} ...`);
      try {
        const resp = await axios.post(`${existing.apiUrl}/api/manage/passport/login`, {
          account: existing.username,
          password: existing.password,
        }, { timeout: 15000 });
        if (resp.data.status !== 200) {
          error(`登录失败：${resp.data.msg || '请重新运行 init 输入密码'}`);
          process.exit(1);
        }
        const token = typeof resp.data.data === 'string' ? resp.data.data : resp.data.data?.token;
        if (token) {
          saveConfig({ ...existing, token, updatedAt: new Date().toISOString() });
          success('登录成功 ✓（Token 已刷新）');
        }
      } catch (e: any) {
        error(`登录失败：${e.response?.data?.msg || e.message}`);
        process.exit(1);
      }
      info('配置保持不变。');
      process.exit(0);
    }
    info('将重新输入配置...\n');
  }

  // 1. API 地址
  let apiUrl = existing?.apiUrl || '';
  if (!apiUrl) {
    apiUrl = await prompt({
      name: 'value',
      message: '请输入 API 服务器地址：',
    });
    apiUrl = apiUrl.trim().replace(/\/$/, '');
  }
  if (!apiUrl) { error('API 地址不能为空'); process.exit(1); }

  // 2. 测试连接
  info(`正在连接 ${apiUrl} ...`);
  try {
    await axios.get(`${apiUrl}${TEST_PATH}`, { timeout: 10000 });
    success('连接成功 ✓');
  } catch (e: any) {
    if (e.code === 'ENOTFOUND' || e.code === 'ECONNREFUSED') {
      error('无法连接，请检查地址或服务器是否已启动');
    } else if (e.code === 'ETIMEDOUT') {
      error('连接超时，请检查网络或服务器地址');
    } else {
      error(`无法连接：${e.message}`);
    }
    process.exit(1);
  }

  // 3. 用户名
  let username = existing?.username || '';
  if (!username) {
    username = await prompt({ name: 'value', message: '请输入用户名：' });
    username = username.trim();
  }
  if (!username) { error('用户名不能为空'); process.exit(1); }

  // 4. 密码
  let password = existing?.password || '';
  if (!password) {
    password = await prompt({ name: 'value', message: '请输入密码：', mask: '*' });
  }
  if (!password) { error('密码不能为空'); process.exit(1); }

  // 5. 登录
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

  // 6. 保存
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
  success('CLI 配置完成！');
  console.log(`  API 地址：${apiUrl}`);
  console.log(`  用户名：${username}`);
}

export { doInit as init };

export function registerInitCommand(program: Command) {
  program
    .command('init')
    .description('初始化或更新配置（自动检测现有配置并询问是否复用）')
    .action(async () => {
      await doInit();
    });
}
