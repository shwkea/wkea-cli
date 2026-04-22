#!/usr/bin/env node

import { Command } from 'commander';
import { registerVendorCommands } from './commands/vendor';
import { registerAuthCommands } from './commands/auth';
import { loadConfig } from './config';
import { error } from './utils/printer';

function main() {
  const program = new Command();

  program
    .name('wkea')
    .description('WKEA CLI 工具 - 供应商管理')
    .version('1.0.0');

  // auth commands (always available)
  registerAuthCommands(program);

  // vendor commands
  const config = loadConfig();
  const token = config?.token ?? null;
  const env = config?.env ?? 'prod';

  const vendor = program.command('vendor').description('供应商管理');

  // Auth gate: block all vendor subcommands if not logged in
  vendor.hook('preAction', () => {
    if (!token) {
      error(
        '未登录或 Token 已过期，请先登录：wkea login --username <用户名> --password <密码>'
      );
      process.exit(1);
    }
  });

  registerVendorCommands(vendor, token, env);

  program.parse(process.argv);
}

main();
