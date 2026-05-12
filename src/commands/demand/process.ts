import { Command } from 'commander';
import { ApiClient } from '../../api/client';
import {
  claimDemand,
  getQuotedVendors,
} from '../../api/demand';
import { formatJsonWithFields, formatOperation } from '../../utils/formatter';
import { success, error } from '../../utils/printer';
import { getApiUrl } from '../../config';

const QUOTED_VENDOR_FIELDS = [
  { field: 'vendorId', type: 'string', desc: '供应商ID' },
  { field: 'vendorName', type: 'string', desc: '供应商名称' },
  { field: 'isFinish', type: 'boolean', desc: '是否完成报价' },
  { field: 'isCancel', type: 'boolean', desc: '是否取消报价' },
];

export function registerProcessCommand(demand: Command) {

  // claim
  demand
    .command('claim')
    .description('领取需求（原子操作）')
    .requiredOption('--id <id>', '需求ID（必填）')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        await claimDemand(client, parseInt(opts.id));
        success(`领取需求 ${opts.id} 成功`);
      } catch (e: any) {
        error(e);
        process.exit(1);
      }
    });

  // quoted-vendors
  demand
    .command('quoted-vendors')
    .description('查询已询价的供应商列表')
    .requiredOption('--demand-id <id>', '需求ID（必填）')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        const data = await getQuotedVendors(client, parseInt(opts.demandId));
        console.log(formatJsonWithFields(data, QUOTED_VENDOR_FIELDS));
      } catch (e: any) {
        error(e);
        process.exit(1);
      }
    });
}
