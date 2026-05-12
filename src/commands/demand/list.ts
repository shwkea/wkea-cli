import { Command } from 'commander';
import { ApiClient } from '../../api/client';
import { listDemands, getPendingAiTasks } from '../../api/demand';
import { formatJsonWithFields } from '../../utils/formatter';
import { error } from '../../utils/printer';
import { getApiUrl } from '../../config';

const DEMAND_LIST_FIELDS = [
  { field: 'id', type: 'number', desc: '需求ID' },
  { field: 'topic', type: 'string', desc: '主题' },
  { field: 'customerId', type: 'string', desc: '客户ID' },
  { field: 'customerName', type: 'string', desc: '客户名称' },
  { field: 'manageId', type: 'string', desc: '客户经理ID' },
  { field: 'status', type: 'number', desc: '状态(274待处理,275处理中,276已完成)' },
  { field: 'itemCount', type: 'number', desc: '行项目数' },
  { field: 'quotedCount', type: 'number', desc: '已报价数' },
  { field: 'createdTime', type: 'string', desc: '创建时间' },
  { field: 'createdByName', type: 'string', desc: '创建人' },
  { field: 'isLate', type: 'boolean', desc: '是否逾期' },
  { field: 'deepSearchStatus', type: 'string', desc: '深度搜索状态' },
];

const PAGE_RESULT_FIELDS = [
  { field: 'records', type: 'array', desc: '数据列表' },
  { field: 'total', type: 'number', desc: '总记录数' },
  { field: 'current', type: 'number', desc: '当前页码' },
  { field: 'size', type: 'number', desc: '每页条数' },
  { field: 'pages', type: 'number', desc: '总页数' },
];

export function registerListCommand(demand: Command) {

  demand
    .command('list')
    .description('查询需求询价列表（分页）')
    .option('--id <id>', '编号/ID（精确查询）')
    .option('--page <page>', '页码，默认 1', '1')
    .option('--limit <limit>', '每页数量，默认 20', '20')
    .option('--status <status>', '状态ID，逗号分隔（274待处理,275处理中,276已完成）')
    .option('--customer-id <id>', '客户ID')
    .option('--customer-name <name>', '客户名称')
    .option('--manage-id <id>', '客户经理ID')
    .option('--keyword <keyword>', '关键字搜索')
    .option('--manage-id-is-null', '只查未分配处理人的需求')
    .option('--topic <topic>', '主题')
    .option('--sku <sku>', 'SKU')
    .option('--is-late', '只查逾期需求')
    .option('--created-time-begin <time>', '创建时间开始（格式: 2024-01-01）')
    .option('--created-time-end <time>', '创建时间结束（格式: 2024-12-31）')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        const dto: Record<string, unknown> = {
          pageNum: parseInt(opts.page),
          pageSize: parseInt(opts.limit),
        };
        if (opts.id) dto.id = parseInt(opts.id);
        if (opts.status) dto.status = opts.status.split(',').map(Number);
        if (opts.customerId) dto.customerId = opts.customerId;
        if (opts.customerName) dto.customerName = opts.customerName;
        if (opts.manageId) dto.manageId = opts.manageId;
        if (opts.keyword) dto.keyword = opts.keyword;
        if (opts.manageIdIsNull !== undefined) dto.manageIdIsNull = true;
        if (opts.topic) dto.topic = opts.topic;
        if (opts.sku) dto.sku = opts.sku;
        if (opts.isLate !== undefined) dto.isLate = true;
        if (opts.createdTimeBegin) dto.createdTimeBegin = opts.createdTimeBegin;
        if (opts.createdTimeEnd) dto.createdTimeEnd = opts.createdTimeEnd;
        const result = await listDemands(client, dto as any);
        console.log(formatJsonWithFields(result, [...DEMAND_LIST_FIELDS, ...PAGE_RESULT_FIELDS]));
      } catch (e: any) {
        error(e);
        process.exit(1);
      }
    });

  // pending
  demand
    .command('pending')
    .description('查看待AI处理的需求（未分配处理人）')
    .option('--limit <limit>', '每页数量，默认 20', '20')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        const dto = {
          pageNum: 1,
          pageSize: parseInt(opts.limit),
          manageIdIsNull: true,
        };
        const result = await listDemands(client, dto);
        console.log(formatJsonWithFields(result, [...DEMAND_LIST_FIELDS, ...PAGE_RESULT_FIELDS]));
      } catch (e: any) {
        error(e);
        process.exit(1);
      }
    });
}
