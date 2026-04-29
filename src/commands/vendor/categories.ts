import { Command } from 'commander';
import { ApiClient } from '../../api/client';
import { bindCategories, getVendorCategories, unbindCategory } from '../../api/vendor';
import { formatJsonWithFields, formatOperation } from '../../utils/formatter';
import { error, success } from '../../utils/printer';
import { getApiUrl } from '../../config';

const CATEGORY_FIELDS = [
  { field: 'id', type: 'number', desc: '分类ID' },
  { field: 'name', type: 'string', desc: '分类名称' },
  { field: 'boundAt', type: 'datetime', desc: '绑定时间' },
];

export function registerCategoryCommands(
  vendor: Command
) {

  vendor
    .command('bind-categories')
    .description('增量绑定分类到供应商')
    .requiredOption('--vendor-id <vendorId>', '供应商ID（必填）')
    .requiredOption('--category-ids <categoryIds>', '分类ID列表，逗号分隔（如 1,2,3）')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        const categoryIds = opts.categoryIds
          .split(',')
          .map((s: string) => s.trim());
        const result = await bindCategories(client, opts.vendorId, categoryIds);
        success(
          `分类绑定完成，新增 ${result.addedCount} 个，跳过 ${result.skippedCount} 个（已绑定）`
        );
      } catch (e: any) {
    error(e);
        process.exit(1);
      }
    });

  vendor
    .command('categories')
    .description('查询供应商绑定的分类列表')
    .requiredOption('--vendor-id <vendorId>', '供应商ID（必填）')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        const list = await getVendorCategories(client, opts.vendorId);
        console.log(formatJsonWithFields(list, CATEGORY_FIELDS));
      } catch (e: any) {
    error(e);
        process.exit(1);
      }
    });

  vendor
    .command('unbind-category')
    .description('解绑分类')
    .requiredOption('--vendor-id <vendorId>', '供应商ID（必填）')
    .requiredOption('--category-id <categoryId>', '分类ID（必填）')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        await unbindCategory(client, opts.vendorId, opts.categoryId);
        success(formatOperation('解绑分类'));
      } catch (e: any) {
    error(e);
        process.exit(1);
      }
    });
}
