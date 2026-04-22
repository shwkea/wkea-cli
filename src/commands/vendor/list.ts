import { Command } from 'commander';
import { ApiClient } from '../../api/client';
import { getVendorList } from '../../api/vendor';
import { formatList } from '../../utils/formatter';
import { error } from '../../utils/printer';
import { getApiUrl } from '../../config';

const VENDOR_LIST_FIELDS = [
  { field: 'vendorId', type: 'string', desc: '供应商ID' },
  { field: 'name', type: 'string', desc: '供应商名称' },
  { field: 'contact', type: 'string', desc: '联系人' },
  { field: 'phone', type: 'string', desc: '联系电话' },
  { field: 'address', type: 'string', desc: '地址' },
  { field: 'bankName', type: 'string', desc: '开户银行' },
  { field: 'bankAccount', type: 'string', desc: '银行账号' },
  { field: 'manageId', type: 'string', desc: '客户经理ID' },
  { field: 'email', type: 'string', desc: '邮箱' },
  { field: 'type', type: 'number', desc: '供应商类型：106=原厂 107=授权经销商 236=品牌方 237=总代理 238=其他' },
  { field: 'createdTime', type: 'datetime', desc: '创建时间' },
];

export function registerListCommand(
  vendor: Command
) {

  vendor
    .command('list')
    .description('查询供应商列表（分页）')
    .option('--page <page>', '页码，默认 1', '1')
    .option('--page-size <pageSize>', '每页数量，默认 20', '20')
    .option('--keyword <keyword>', '供应商名称关键词')
    .option('--type <type>', '供应商类型：106=原厂 107=授权经销商 236=品牌方 237=总代理 238=其他')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
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
            result.rows as unknown as Record<string, unknown>[],
            VENDOR_LIST_FIELDS,
            { total: result.totalSize, current: result.pageIndex, size: result.pageSize }
          )
        );
      } catch (e: any) {
        error(e.message);
        process.exit(1);
      }
    });
}
