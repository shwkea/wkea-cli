#!/usr/bin/env node

import { Command } from 'commander';
import { registerVendorCommands } from './commands/vendor';
import { registerAuthCommands } from './commands/auth';
import { registerInitCommand } from './commands/init';
import { registerSystemCommands } from './commands/system';
import { loadConfig } from './config';
import { error } from './utils/printer';
import pkg from '../package.json';

function main() {
  const program = new Command();

  program
    .name('wkea-manage-cli')
    .description('WKEA 后台管理 CLI 工具')
    .version(pkg.version);

  registerInitCommand(program);
  registerAuthCommands(program);
  registerSystemCommands(program);

  // vendor commands
  const config = loadConfig();

  const vendor = program.command('vendor').description('供应商管理');

  // 未初始化则阻止
  vendor.hook('preAction', () => {
    if (!config?.apiUrl) {
      error('尚未初始化，请先运行：wkea-manage-cli init');
      process.exit(1);
    }
  });

  registerVendorCommands(vendor);

  program.parse(process.argv);
}

main();
