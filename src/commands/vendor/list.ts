import { Command } from 'commander';
import { ApiClient } from '../../api/client';
import { getVendorList } from '../../api/vendor';
import { formatList } from '../../utils/formatter';
import { error } from '../../utils/printer';
import { buildBaseUrl } from '../../config';

const VENDOR_LIST_FIELDS = [
  { field: 'vendorId', type: 'string', desc: '供应商ID' },
  { field: 'name', type: 'string', desc: '供应商名称' },
  { field: 'contact', type: 'string', desc: '联系人' },
  { field: 'phone', type: 'string', desc: '联系电话' },
  { field: 'type', type: 'number', desc: '供应商类型：1=生产型 2=贸易型 3=服务型' },
  { field: 'createdTime', type: 'datetime', desc: '创建时间' },
];

export function registerListCommand(
  vendor: Command,
  token: string | null,
  env: 'prod' | 'test'
) {

  vendor
    .command('list')
    .description('查询供应商列表（分页）')
    .option('--page <page>', '页码，默认 1', '1')
    .option('--page-size <pageSize>', '每页数量，默认 20', '20')
    .option('--keyword <keyword>', '供应商名称关键词')
    .option('--type <type>', '供应商类型：1=生产型 2=贸易型 3=服务型')
    .action(async (opts) => {
      const client = new ApiClient(buildBaseUrl(env), token!);
      try {
        const dto = {
          page: parseInt(opts.page),
          size: parseInt(opts.pageSize),
          name: opts.keyword,
          type: opts.type ? parseInt(opts.type) : undefined,
        };
        const result = await getVendorList(client, dto);
        console.log(
          formatList(
            result.records as unknown as Record<string, unknown>[],
            VENDOR_LIST_FIELDS,
            { total: result.total, current: result.current, size: result.size }
          )
        );
      } catch (e: any) {
        error(e.message);
        process.exit(1);
      }
    });
}
