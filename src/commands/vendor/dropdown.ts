import { Command } from 'commander';
import { ApiClient } from '../../api/client';
import { getVendorDropdown } from '../../api/vendor';
import { formatJsonWithFields } from '../../utils/formatter';
import { error } from '../../utils/printer';
import { getApiUrl } from '../../config';

const VENDOR_DROPDOWN_FIELDS = [
  { field: 'vendorId', type: 'string', desc: '供应商 ID' },
  { field: 'name', type: 'string', desc: '供应商名称' },
];

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
        console.log(formatJsonWithFields(list, VENDOR_DROPDOWN_FIELDS));
      } catch (e: any) {
    error(e);
        process.exit(1);
      }
    });
}
