#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { registerBrandCommands } from './commands/brand';
import { registerVendorCommands } from './commands/vendor';
import { registerAuthCommands } from './commands/auth';
import { registerInitCommand } from './commands/init';
import { registerSystemCommands } from './commands/system';
import { registerEnumCommand } from './commands/enum';
import { loadConfig } from './config';
import { error } from './utils/printer';
import pkg from '../package.json';

function main() {
  const program = new Command();

  const sys = (s: string) => chalk.blue(s);
  const mod = (s: string) => chalk.cyan(s);

  program
    .name('wkea-manage-cli')
    .description('WKEA 后台管理 CLI 工具')
    .version(pkg.version)
    .configureHelp({
      helpWidth: 80,
      formatHelp: (cmd) => {
        let output = `\n  ${chalk.bold('使用方法: wkea-manage-cli [options] [command]')}\n\n`;

        output += `  ${chalk.dim('核心选项:')}\n`;
        output += `  ${chalk.blue('-V, --version')}  ${chalk.dim('显示版本号')}\n`;
        output += `  ${chalk.blue('-h, --help')}     ${chalk.dim('显示帮助信息')}\n\n`;

        const sysCmds = ['init', 'whoami', 'enum', 'version', 'update'];
        const sysDescs: Record<string, string> = {
          init: '初始化或更新配置', whoami: '查看当前登录信息',
          enum: '查看枚举值说明', version: '查看版本', update: '更新到最新版本',
        };
        output += `  ${chalk.dim('系统工具:')}\n`;
        for (const name of sysCmds) {
          output += `  ${sys(name.padEnd(10))}  ${chalk.dim(sysDescs[name])}\n`;
        }
        output += '\n';

        output += `  ${chalk.dim('模块工具:')}\n`;
        output += `  ${mod('brand'.padEnd(10))}  ${chalk.dim('品牌管理')}\n`;
        output += `  ${mod('vendor'.padEnd(10))}  ${chalk.dim('供应商管理')}\n`;
        output += '\n';

        output += `  ${chalk.dim('运行')} ${chalk.blue('<command> --help')} ${chalk.dim('查看子命令详细用法')}\n`;
        return output;
      },
    });

  registerInitCommand(program);
  registerAuthCommands(program);
  registerEnumCommand(program);
  registerSystemCommands(program);

  const config = loadConfig();

  const brand = program.command('brand').description('品牌管理');
  brand.hook('preAction', () => {
    if (!config?.apiUrl) {
      error('尚未初始化，请先运行：wkea-manage-cli init');
      process.exit(1);
    }
  });
  registerBrandCommands(brand);

  const vendor = program.command('vendor').description('供应商管理');
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
