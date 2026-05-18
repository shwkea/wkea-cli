import { Command } from 'commander';
import { ApiClient } from '../../api/client';
import {
  createProgress,
  getProgress,
  completeStep,
  listProgress,
} from '../../api/progress';
import { formatJsonWithFields, formatOperation } from '../../utils/formatter';
import { success, error } from '../../utils/printer';
import { getApiUrl } from '../../config';

const PROGRESS_FIELDS = [
  { field: 'id', type: 'number', desc: '进度ID' },
  { field: 'taskName', type: 'string', desc: '进度名称' },
  { field: 'tasks', type: 'array', desc: '任务列表(含名称/描述/链接)' },
  { field: 'finishedStep', type: 'number', desc: '已完成任务数' },
  { field: 'stepCount', type: 'number', desc: '总任务数' },
  { field: 'taskLink', type: 'string', desc: '跳转链接' },
  { field: 'relationType', type: 'string', desc: '关联类型' },
  { field: 'relationId', type: 'string', desc: '关联业务ID' },
  { field: 'status', type: 'number', desc: '状态(0处理中 1已完成)' },
  { field: 'createdTime', type: 'datetime', desc: '创建时间' },
  { field: 'completedTime', type: 'datetime', desc: '完成时间' },
];

export function registerProgressCommands(progress: Command) {
  // create
  progress
    .command('create')
    .description('创建进度任务')
    .requiredOption('--name <name>', '进度名称（必填）')
    .requiredOption('--tasks <json>', '任务JSON数组（必填），如 [{"name":"获取详情"},{"name":"产品匹配","summary":"需要搜索..."},{"name":"供应商匹配","summary":"","links":["url"]}]')
    .option('--link <link>', '跳转链接')
    .option('--relation-type <type>', '关联类型，如 demand')
    .option('--relation-id <id>', '关联业务ID')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        const tasks = JSON.parse(opts.tasks);
        if (!Array.isArray(tasks) || tasks.length === 0) {
          throw new Error('tasks 必须是至少一个任务的 JSON 数组');
        }
        const id = await createProgress(client, {
          taskName: opts.name,
          tasks,
          taskLink: opts.link,
          relationType: opts.relationType,
          relationId: opts.relationId,
        });
        success(`进度创建成功，ID: ${id}，共 ${tasks.length} 个任务`);
      } catch (e: any) {
        error(e);
        process.exit(1);
      }
    });

  // step
  progress
    .command('step')
    .description('完成一个步骤（按顺序，从1开始）')
    .requiredOption('--id <id>', '进度ID（必填）')
    .requiredOption('--step-index <n>', '步骤序号，从1开始（必填），如完成第1步传入 1')
    .option('--summary <summary>', '步骤总结，描述该步骤做了什么')
    .option('--links <links>', '相关链接，多个用逗号分隔')
    .option('--abnormal', '标记为异常（需人工介入），不推进进度')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        const links = opts.links ? opts.links.split(',').map((s: string) => s.trim()) : undefined;
        const result = await completeStep(client, parseInt(opts.id), parseInt(opts.stepIndex), opts.summary, links, opts.abnormal);
        console.log(result.message);
        if (result.isCompleted) {
          success('全部步骤已完成');
        } else {
          success(`已完成 ${result.finishedStep}/${result.totalSteps}，当前步骤：${result.currentStep}`);
        }
      } catch (e: any) {
        error(e);
        process.exit(1);
      }
    });

  // get
  progress
    .command('get')
    .description('查看进度详情')
    .requiredOption('--id <id>', '进度ID（必填）')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        const data = await getProgress(client, parseInt(opts.id));
        console.log(formatJsonWithFields(data, PROGRESS_FIELDS));
      } catch (e: any) {
        error(e);
        process.exit(1);
      }
    });

  // list
  progress
    .command('list')
    .description('进度列表')
    .option('--relation-type <type>', '按关联类型筛选')
    .option('--relation-id <id>', '按关联业务ID筛选')
    .option('--status <status>', '按状态筛选(0处理中 1已完成)')
    .option('--page <page>', '页码，默认 1', '1')
    .option('--limit <limit>', '每页数量，默认 20', '20')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        const result = await listProgress(client, {
          relationType: opts.relationType,
          relationId: opts.relationId,
          status: opts.status !== undefined ? parseInt(opts.status) : undefined,
          pageNum: parseInt(opts.page),
          pageSize: parseInt(opts.limit),
        });
        console.log(formatJsonWithFields(result, [
          ...PROGRESS_FIELDS,
          { field: 'totalSize', type: 'number', desc: '总记录数' },
          { field: 'pageIndex', type: 'number', desc: '当前页码' },
        ]));
        success(`共 ${result.totalSize} 条，第 ${result.pageIndex} 页`);
      } catch (e: any) {
        error(e);
        process.exit(1);
      }
    });
}
