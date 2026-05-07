#!/usr/bin/env node

import { Command, Help } from 'commander';
import { registerBrandCommands } from './commands/brand';
import { registerVendorCommands } from './commands/vendor';
import { productCommands } from './commands/product';
import { registerDemandCommands } from './commands/demand';
import { registerAuthCommands } from './commands/auth';
import { registerInitCommand } from './commands/init';
import { registerSystemCommands } from './commands/system';
import { registerEnumCommand } from './commands/enum';
import { registerSkillsCommand } from './commands/skills';
import { registerSetupCommand } from './commands/setup';
import { registerQuotationModule } from './commands/quotation';
import { registerStockModule } from './commands/stock';
import { registerSalesOrderModule } from './commands/sales-order';
import { registerSalesContractModule } from './commands/sales-contract';
import { loadConfig } from './config';
import { error } from './utils/printer';
import pkg from '../package.json';

// 扩展 Command：支持 .schema() 方法，命令文件中直接定义 schema
declare module 'commander' {
  interface Command {
    schema(s: Record<string, any>): this;
  }
}
(Command.prototype as any).schema = function (s: Record<string, any>) {
  (this as any)._schema = s;
  return this;
};

/** 将命令树序列化为 AI 可读的 JSON manifest */
function buildManifest(cmd: Command): any {
  const node: any = {
    name: cmd.name(),
    description: cmd.description(),
    options: cmd.options.map((o) => ({
      flags: o.flags,
      description: o.description,
      defaultValue: o.defaultValue,
      required: o.mandatory,
    })),
    commands: (cmd.commands as readonly Command[]).map((sub: Command) => buildManifest(sub)),
  };

  // 读取命令文件中通过 .schema() 附加的 schema
  if ((cmd as any)._schema) {
    node.schema = (cmd as any)._schema;
  }

  return node;
}

function main() {
  const program = new Command();

  program
    .name('wkea-manage-cli')
    .description('WKEA 后台管理 CLI 工具')
    .version(pkg.version)
    .option('--manifest', '输出完整命令树 JSON（供 AI 阅读）')
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
        if (cmd.name() !== 'wkea-manage-cli') {
          const helper = Object.assign(new Help(), { command: cmd, helpWidth: 80 });
          return helper.formatHelp(cmd, helper);
        }
        const systemCmds = new Set(['init', 'setup', 'whoami', 'enum', 'version', 'update', 'skills', 'urls']);
        let o = '\n  使用方法: wkea-manage-cli [options] [command]\n\n';
        o += '  选项:\n';
        o += '  -V, --version  显示版本号\n';
        o += '  -h, --help     显示帮助信息\n\n';
        const sys: Command[] = [];
        const mod: Command[] = [];
        for (const c of cmd.commands as readonly Command[]) {
          if (systemCmds.has(c.name())) sys.push(c);
          else mod.push(c);
        }
        if (sys.length) {
          o += '  系统工具:\n';
          for (const c of sys) {
            o += `  ${c.name().padEnd(11)}${c.description()}\n`;
          }
          o += '\n';
        }
        if (mod.length) {
          o += '  模块工具:\n';
          for (const c of mod) {
            o += `  ${c.name().padEnd(11)}${c.description()}\n`;
          }
          o += '\n';
        }
        o += '  运行 <command> --help 查看子命令详细用法\n';
        return o;
      },
    });

  registerInitCommand(program);
  registerAuthCommands(program);
  registerEnumCommand(program);
  registerSystemCommands(program);
  registerSkillsCommand(program);
  registerSetupCommand(program);

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

  // product 无子命令时由 Commander 默认显示子命令列表
  const product = program.command('product').description('产品管理（SPU + SKU）');
  product.hook('preAction', () => {
    if (!config?.apiUrl) {
      error('尚未初始化，请先运行：wkea-manage-cli init');
      process.exit(1);
    }
  });
  productCommands(product);

  // demand 无子命令时由 Commander 默认显示子命令列表
  const demand = program.command('demand').description('需求询价管理');
  demand.hook('preAction', () => {
    if (!config?.apiUrl) {
      error('尚未初始化，请先运行：wkea-manage-cli init');
      process.exit(1);
    }
  });
  registerDemandCommands(demand);

  // quotation
  const quotation = program.command('quotation').description('报价单管理（创建/编辑/分享）');
  quotation.hook('preAction', () => {
    if (!config?.apiUrl) {
      error('尚未初始化，请先运行：wkea-manage-cli init');
      process.exit(1);
    }
  });
  registerQuotationModule(quotation);

  // stock 库存管理
  const stock = program.command('stock').description('库存管理（CRUD + 仓库 + 拆分包装）');
  stock.hook('preAction', () => {
    if (!config?.apiUrl) {
      error('尚未初始化，请先运行：wkea-manage-cli init');
      process.exit(1);
    }
  });
  registerStockModule(stock);

  // sales-order 销售订单
  const salesOrder = program.command('sales-order').description('销售订单管理（创建/审核/发货/回库）');
  salesOrder.hook('preAction', () => {
    if (!config?.apiUrl) {
      error('尚未初始化，请先运行：wkea-manage-cli init');
      process.exit(1);
    }
  });
  registerSalesOrderModule(salesOrder);

  // sales-contract 销售合同
  const salesContract = program.command('sales-contract').description('销售合同管理（创建/转订单）');
  salesContract.hook('preAction', () => {
    if (!config?.apiUrl) {
      error('尚未初始化，请先运行：wkea-manage-cli init');
      process.exit(1);
    }
  });
  registerSalesContractModule(salesContract);

  // --manifest 提前解析，输出 JSON 后退出（不执行 action）
  const rawArgs = process.argv.slice(2);
  if (rawArgs.includes('--manifest')) {
    const manifest = buildManifest(program);
    console.log(JSON.stringify(manifest, null, 2));
    process.exit(0);
  }

  program.parse(process.argv);
}

main();
