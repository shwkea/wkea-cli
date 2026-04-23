#!/usr/bin/env node

import { Command, Help } from 'commander';
import { registerBrandCommands } from './commands/brand';
import { registerVendorCommands } from './commands/vendor';
import { registerAuthCommands } from './commands/auth';
import { registerInitCommand } from './commands/init';
import { registerSystemCommands } from './commands/system';
import { registerEnumCommand } from './commands/enum';
import { registerSkillsCommand } from './commands/skills';
import { loadConfig } from './config';
import { error } from './utils/printer';
import pkg from '../package.json';

function main() {
  const program = new Command();

  program
    .name('wkea-manage-cli')
    .description('WKEA 后台管理 CLI 工具')
    .version(pkg.version)
    .configureOutput({
      writeErr: (s) => {
        if (s.includes('Did you mean')) {
          console.log(`  ! ${s.trim()}`);
          console.log(`  运行 --help 查看所有命令\n`);
        } else {
          process.stderr.write(s);
        }
      },
    })
    .configureHelp({
      helpWidth: 80,
      formatHelp(cmd: Command) {
        // Delegate to subcommand's default help (not the root help)
        if (cmd.name() !== 'wkea-manage-cli') {
          const helper = Object.assign(new Help(), { command: cmd, helpWidth: 80 });
          return helper.formatHelp(cmd, helper);
        }
        let o = '\n  使用方法: wkea-manage-cli [options] [command]\n\n';
        o += '  选项:\n';
        o += '  -V, --version  显示版本号\n';
        o += '  -h, --help     显示帮助信息\n\n';
        o += '  系统工具:\n';
        o += '  init        初始化或更新配置\n';
        o += '  whoami      查看当前登录信息\n';
        o += '  enum        查看枚举值说明\n';
        o += '  version     查看版本\n';
        o += '  update      更新到最新版本\n';
        o += '  skills      AI 工具说明（安装后运行此命令更新 AI Skills）\n\n';
        o += '  模块工具:\n';
        o += '  brand       品牌管理\n';
        o += '  vendor      供应商管理\n\n';
        o += '  运行 <command> --help 查看子命令详细用法\n';
        return o;
      },
    });

  registerInitCommand(program);
  registerAuthCommands(program);
  registerEnumCommand(program);
  registerSystemCommands(program);
  registerSkillsCommand(program);

  const config = loadConfig();

  // brand 无子命令时由 Commander 默认显示子命令列表
  const brand = program.command('brand').description('品牌管理');
  brand.hook('preAction', () => {
    if (!config?.apiUrl) {
      error('尚未初始化，请先运行：wkea-manage-cli init');
      process.exit(1);
    }
  });
  registerBrandCommands(brand);

  // vendor 无子命令时由 Commander 默认显示子命令列表
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
