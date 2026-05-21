#!/usr/bin/env node

import { Command, Help } from 'commander';
import { registerBrandCommands } from './commands/brand';
import { registerVendorCommands } from './commands/vendor';
import { productCommands } from './commands/product';
import { registerDemandCommands } from './commands/demand';
import { registerProgressModule } from './commands/progress';
import { registerAuthCommands } from './commands/auth';
import { registerInitCommand } from './commands/init';
import { registerSystemCommands } from './commands/system';
import { registerEnumCommand } from './commands/enum';
import { registerQuotationModule } from './commands/quotation';
import { registerStockModule } from './commands/stock';
import { registerSalesOrderModule } from './commands/sales-order';
import { registerSalesContractModule } from './commands/sales-contract';
import { registerCustomerModule } from './commands/customer';
import { registerGuide } from './commands/guide';
import { loadConfig } from './config';
import { error } from './utils/printer';

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
    .name('wkea-cli')
    .description('WKEA 后台管理 CLI 工具')
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
        if (cmd.name() !== 'wkea-cli') {
          const helper = Object.assign(new Help(), { command: cmd, helpWidth: 80 });
          return helper.formatHelp(cmd, helper);
        }
        const systemCmds = new Set(['init', 'whoami', 'enum', 'update', 'urls']);
        let o = '\n  使用方法: wkea-cli [options] [command]\n\n';
        o += '  选项:\n';
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

  const config = loadConfig();

  // brand 无子命令时由 Commander 默认显示子命令列表
  const brand = program.command('brand').description('品牌管理');
  brand.hook('preAction', () => {
    if (!config?.apiUrl) {
      error('尚未初始化，请先运行：wkea-cli init');
      process.exit(1);
    }
  });
  registerBrandCommands(brand);
  registerGuide(brand, '品牌管理', 'brand.md');

  // vendor 无子命令时由 Commander 默认显示子命令列表
  const vendor = program.command('vendor').description('供应商管理');
  vendor.hook('preAction', () => {
    if (!config?.apiUrl) {
      error('尚未初始化，请先运行：wkea-cli init');
      process.exit(1);
    }
  });
  registerVendorCommands(vendor);
  registerGuide(vendor, '供应商管理', 'vendor.md');

  // product 无子命令时由 Commander 默认显示子命令列表
  const product = program.command('product').description('产品管理（SPU + SKU）');
  product.hook('preAction', () => {
    if (!config?.apiUrl) {
      error('尚未初始化，请先运行：wkea-cli init');
      process.exit(1);
    }
  });
  productCommands(product);
  registerGuide(product, '产品管理', 'product.md');

  // demand 无子命令时由 Commander 默认显示子命令列表
  const demand = program.command('demand').description('需求询价管理');
  demand.hook('preAction', () => {
    if (!config?.apiUrl) {
      error('尚未初始化，请先运行：wkea-cli init');
      process.exit(1);
    }
  });
  registerDemandCommands(demand);
  registerGuide(demand, '需求询价管理', 'demand.md');

  // progress
  const progress = program.command('progress').description('任务进度管理（创建/完成步骤/查看）');
  progress.hook('preAction', () => {
    if (!config?.apiUrl) {
      error('尚未初始化，请先运行：wkea-cli init');
      process.exit(1);
    }
  });
  registerProgressModule(progress);
  registerGuide(progress, '任务进度管理', 'progress.md');

  // quotation
  const quotation = program.command('quotation').description('报价单管理（创建/编辑/分享）');
  quotation.hook('preAction', () => {
    if (!config?.apiUrl) {
      error('尚未初始化，请先运行：wkea-cli init');
      process.exit(1);
    }
  });
  registerQuotationModule(quotation);
  registerGuide(quotation, '报价单管理', 'quotation.md');

  // stock 库存管理
  const stock = program.command('stock').description('库存管理（CRUD + 仓库 + 拆分包装）');
  stock.hook('preAction', () => {
    if (!config?.apiUrl) {
      error('尚未初始化，请先运行：wkea-cli init');
      process.exit(1);
    }
  });
  registerStockModule(stock);
  registerGuide(stock, '库存管理', 'stock.md');

  // sales-order 销售订单
  const salesOrder = program.command('sales-order').description('销售订单管理（创建/审核/发货/回库）');
  salesOrder.hook('preAction', () => {
    if (!config?.apiUrl) {
      error('尚未初始化，请先运行：wkea-cli init');
      process.exit(1);
    }
  });
  registerSalesOrderModule(salesOrder);
  registerGuide(salesOrder, '销售订单管理', 'sales-order.md');

  // sales-contract 销售合同
  const salesContract = program.command('sales-contract').description('销售合同管理（创建/转订单）');
  salesContract.hook('preAction', () => {
    if (!config?.apiUrl) {
      error('尚未初始化，请先运行：wkea-cli init');
      process.exit(1);
    }
  });
  registerSalesContractModule(salesContract);
  registerGuide(salesContract, '销售合同管理', 'sales-contract.md');

  // customer 客户管理
  const customer = program.command('customer').description('客户管理（CRUD + 列表筛选）');
  customer.hook('preAction', () => {
    if (!config?.apiUrl) {
      error('尚未初始化，请先运行：wkea-cli init');
      process.exit(1);
    }
  });
  registerCustomerModule(customer);
  registerGuide(customer, '客户管理', 'customer.md');

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
