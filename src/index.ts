#!/usr/bin/env node

import { Command } from 'commander';
import { registerVendorCommands } from './commands/vendor';
import { registerAuthCommands } from './commands/auth';
import { registerInitCommand } from './commands/init';
import { loadConfig } from './config';
import { error } from './utils/printer';

function main() {
  const program = new Command();

  program
    .name('wkea')
    .description('WKEA CLI 工具 - 供应商管理')
    .version('1.0.0');

  registerInitCommand(program);
  registerAuthCommands(program);

  // vendor commands
  const config = loadConfig();

  const vendor = program.command('vendor').description('供应商管理');

  // 未初始化则阻止
  vendor.hook('preAction', () => {
    if (!config?.apiUrl) {
      error('尚未初始化，请先运行：wkea init');
      process.exit(1);
    }
  });

  registerVendorCommands(vendor);

  program.parse(process.argv);
}

main();
