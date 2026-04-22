import { Command } from 'commander';
import { ApiClient } from '../../api/client';
import { bindBrands, getVendorBrands, unbindBrand } from '../../api/vendor';
import { formatList, formatOperation } from '../../utils/formatter';
import { error, success } from '../../utils/printer';
import { getApiUrl } from '../../config';

const BRAND_FIELDS = [
  { field: 'id', type: 'number', desc: '品牌ID' },
  { field: 'name', type: 'string', desc: '品牌名称' },
  { field: 'isMain', type: 'boolean', desc: '是否主营品牌' },
  { field: 'boundAt', type: 'datetime', desc: '绑定时间' },
];

export function registerBrandCommands(
  vendor: Command
) {

  vendor
    .command('bind-brands')
    .description('增量绑定品牌到供应商')
    .requiredOption('--vendor-id <vendorId>', '供应商ID（必填）')
    .requiredOption('--brand-ids <brandIds>', '品牌ID列表，逗号分隔（如 1,2,3）')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        const brandIds = opts.brandIds
          .split(',')
          .map((s: string) => parseInt(s.trim()));
        const result = await bindBrands(client, opts.vendorId, brandIds);
        success(
          `品牌绑定完成，新增 ${result.addedCount} 个，跳过 ${result.skippedCount} 个（已绑定）`
        );
      } catch (e: any) {
        error(e.message);
        process.exit(1);
      }
    });

  vendor
    .command('brands')
    .description('查询供应商绑定的品牌列表')
    .requiredOption('--vendor-id <vendorId>', '供应商ID（必填）')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        const list = await getVendorBrands(client, opts.vendorId);
        console.log(
          formatList(list as unknown as Record<string, unknown>[], BRAND_FIELDS)
        );
      } catch (e: any) {
        error(e.message);
        process.exit(1);
      }
    });

  vendor
    .command('unbind-brand')
    .description('解绑品牌')
    .requiredOption('--vendor-id <vendorId>', '供应商ID（必填）')
    .requiredOption('--brand-id <brandId>', '品牌ID（必填）')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        await unbindBrand(client, opts.vendorId, parseInt(opts.brandId));
        success(formatOperation('解绑品牌'));
      } catch (e: any) {
        error(e.message);
        process.exit(1);
      }
    });
}
