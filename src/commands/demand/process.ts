import { Command } from 'commander';
import { ApiClient } from '../../api/client';
import {
  claimDemand,
  getDemandDetail,
  autoQuote,
} from '../../api/demand';
import { formatJsonWithFields, formatOperation } from '../../utils/formatter';
import { success, error, info } from '../../utils/printer';
import { getApiUrl } from '../../config';

const DEMAND_FIELDS = [
  { field: 'id', type: 'number', desc: '需求ID' },
  { field: 'topic', type: 'string', desc: '主题' },
  { field: 'customerName', type: 'string', desc: '客户名称' },
  { field: 'status', type: 'number', desc: '状态' },
  { field: 'itemCount', type: 'number', desc: '行项目数' },
  { field: 'items', type: 'array', desc: '行项目列表' },
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

  // auto-quote
  demand
    .command('auto-quote')
    .description('自动按品牌询价')
    .requiredOption('--id <id>', '需求ID（必填）')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        const result = await autoQuote(client, parseInt(opts.id));
        success(result);
      } catch (e: any) {
        error(e);
        process.exit(1);
      }
    });

  // process - 全流程：领单 + 详情 + 自动询价
  demand
    .command('process')
    .description('全流程处理需求（领单 + 自动询价）')
    .requiredOption('--id <id>', '需求ID（必填）')
    .option('--skip-claim', '跳过领取步骤（已领取时使用）')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        const id = parseInt(opts.id);

        // 1. 领取需求
        if (!opts.skipClaim) {
          info('正在领取需求...');
          await claimDemand(client, id);
          success(`领取需求 ${id} 成功`);
        } else {
          info('跳过领取步骤');
        }

        // 2. 获取需求详情
        info('正在获取需求详情...');
        const detail = await getDemandDetail(client, id);
        console.log(formatJsonWithFields(detail, DEMAND_FIELDS));

        // 3. 自动询价
        info('正在执行自动询价...');
        const result = await autoQuote(client, id);
        success(result);

        success(formatOperation('全流程处理'));
      } catch (e: any) {
        error(e);
        process.exit(1);
      }
    });
}
