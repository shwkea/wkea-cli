import { Command } from 'commander';
import { ApiClient } from '../../api/client';
import {
  listSuperiorCategories,
  createSuperiorCategory,
  updateSuperiorCategory,
  deleteSuperiorCategory,
} from '../../api/superior-category';
import {
  CreateSuperiorCategoryDto,
  UpdateSuperiorCategoryDto,
} from '../../types/superior-category';
import { formatJsonWithFields, formatOperation } from '../../utils/formatter';
import { success, error } from '../../utils/printer';
import { getApiUrl } from '../../config';

const SUPERIOR_CATEGORY_LIST_FIELDS = [
  { field: 'id', type: 'number', desc: 'ID' },
  { field: 'name', type: 'string', desc: '名称' },
  { field: 'systemCategoryId', type: 'number', desc: '系统分类ID' },
  { field: 'priority', type: 'number', desc: '优先级' },
  { field: 'remark', type: 'string', desc: '备注' },
  { field: 'createdTime', type: 'datetime', desc: '创建时间' },
];

export function registerSuperiorCategoryCommands(vendor: Command) {
  const sc = vendor
    .command('superior-category')
    .description('供应商优势分类管理');

  // list
  sc
    .command('list')
    .description('查询优势分类列表')
    .option('--id <id>', '编号/ID（精确查询）')
    .requiredOption('--vendor-id <vendorId>', '供应商ID（必填）')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        const list = await listSuperiorCategories(client, opts.vendorId);
        console.log(formatJsonWithFields(list, SUPERIOR_CATEGORY_LIST_FIELDS));
      } catch (e: any) {
    error(e);
        process.exit(1);
      }
    });

  // add
  sc
    .command('add')
    .description('新增优势分类')
    .requiredOption('--vendor-id <vendorId>', '供应商ID（必填）')
    .requiredOption('--name <name>', '分类名称（必填）')
    .option('--system-category-id <id>', '系统分类ID', parseInt)
    .option('--system-category-path <path>', '系统分类路径（如 1/5/23，斜杠分隔的分类 ID 链）')
    .option('--priority <num>', '优先级', parseInt)
    .option('--remark <remark>', '备注')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        const dto: CreateSuperiorCategoryDto = { name: opts.name };
        if (opts.systemCategoryId) dto.systemCategoryId = opts.systemCategoryId;
        if (opts.systemCategoryPath) dto.systemCategoryPath = opts.systemCategoryPath;
        if (opts.priority !== undefined) dto.priority = opts.priority;
        if (opts.remark) dto.remark = opts.remark;
        const id = await createSuperiorCategory(client, opts.vendorId, dto);
        success(`新增成功，分类ID: ${id}`);
      } catch (e: any) {
    error(e);
        process.exit(1);
      }
    });

  // update
  sc
    .command('update')
    .description('更新优势分类')
    .requiredOption('--vendor-id <vendorId>', '供应商ID（必填）')
    .requiredOption('--category-id <id>', '分类ID（必填）', parseInt)
    .option('--name <name>', '分类名称')
    .option('--system-category-id <id>', '系统分类ID', parseInt)
    .option('--system-category-path <path>', '系统分类路径（如 1/5/23，斜杠分隔的分类 ID 链）')
    .option('--priority <num>', '优先级', parseInt)
    .option('--remark <remark>', '备注')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        const dto: UpdateSuperiorCategoryDto = {};
        if (opts.name) dto.name = opts.name;
        if (opts.systemCategoryId) dto.systemCategoryId = opts.systemCategoryId;
        if (opts.systemCategoryPath) dto.systemCategoryPath = opts.systemCategoryPath;
        if (opts.priority !== undefined) dto.priority = opts.priority;
        if (opts.remark) dto.remark = opts.remark;
        await updateSuperiorCategory(client, opts.vendorId, opts.categoryId, dto);
        success(formatOperation('更新'));
      } catch (e: any) {
    error(e);
        process.exit(1);
      }
    });

  // remove
  sc
    .command('remove')
    .description('删除优势分类')
    .requiredOption('--vendor-id <vendorId>', '供应商ID（必填）')
    .requiredOption('--category-id <id>', '分类ID（必填）', parseInt)
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        await deleteSuperiorCategory(client, opts.vendorId, opts.categoryId);
        success(formatOperation('删除'));
      } catch (e: any) {
    error(e);
        process.exit(1);
      }
    });
}
