import { Command } from 'commander';
import { ApiClient } from '../../api/client';
import { getVendorDropdown } from '../../api/vendor';
import { error } from '../../utils/printer';
import { getApiUrl } from '../../config';

export function registerDropdownCommand(
  vendor: Command
) {

  vendor
    .command('dropdown')
    .description('供应商下拉框列表')
    .option('--keyword <keyword>', '供应商名称关键词')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        const list = await getVendorDropdown(client, opts.keyword);
        console.log(`## 供应商下拉框 (${list.length} 条)\n`);
        for (const v of list) {
          console.log(`  [${v.vendorId}] ${v.name}`);
        }
        console.log('\n## 字段说明\n');
        console.log(
          '| 字段 | 类型 | 说明 |\n|------|------|------|\n' +
            '| vendorId | string | 供应商ID |\n| name | string | 供应商名称 |'
        );
      } catch (e: any) {
        error(e.message);
        process.exit(1);
      }
    });
}
