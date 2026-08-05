import { Command } from 'commander';
import { ApiClient } from '../api/client';
import { listCategories, searchCategory, CategoryVo } from '../api/category';
import { getApiUrl } from '../config';
import { formatJsonWithFields } from '../utils/formatter';
import { error } from '../utils/printer';

const CATEGORY_FIELDS = [
  { field: 'id', type: 'string', desc: '分类 ID' },
  { field: 'name', type: 'string', desc: '分类名称' },
  { field: 'fatherId', type: 'string', desc: '父分类 ID' },
  { field: 'level', type: 'number', desc: '级别' },
  { field: 'purposeType', type: 'number', desc: '用途类型（工业品/生活用品）' },
];

/** 递归展平分类树，输出所有节点 */
function flattenCategories(cats: CategoryVo[], depth = 0): Array<{ id: string; name: string; fatherId: string; level: number; purposeType: number }> {
  const result: Array<{ id: string; name: string; fatherId: string; level: number; purposeType: number }> = [];
  for (const c of cats) {
    result.push({
      id: c.id,
      name: `${'  '.repeat(depth)}${c.name}`,
      fatherId: c.fatherId || '',
      level: c.level || depth,
      purposeType: c.purposeType || 0,
    });
    if (c.subCategory?.length) {
      result.push(...flattenCategories(c.subCategory, depth + 1));
    }
  }
  return result;
}

export function registerCategoryCommands(category: Command) {
  category
    .command('list')
    .description('查询产品分类列表（支持按名称/ID/父分类筛选）')
    .option('--id <id>', '分类 ID（精确查询）')
    .option('--name <name>', '分类名称（精确匹配，查分类 ID 时用）')
    .option('--father-id <id>', '父分类 ID')
    .option('--purpose-type <type>', '用途类型（工业品/生活用品）')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        const data = await listCategories(client, {
          id: opts.id ? parseInt(opts.id) : undefined,
          name: opts.name,
          fatherId: opts.fatherId ? parseInt(opts.fatherId) : undefined,
          purposeType: opts.purposeType ? parseInt(opts.purposeType) : undefined,
        });
        const flat = flattenCategories(data);
        if (flat.length === 0) {
          console.log('未找到匹配的分类');
          return;
        }
        console.log(formatJsonWithFields(flat, CATEGORY_FIELDS));
      } catch (e: unknown) {
        error(e);
      }
    });

  category
    .command('search')
    .description('按关键词搜索分类（下拉框检索，模糊匹配）')
    .requiredOption('--name <name>', '搜索关键词（必填）')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        const data = await searchCategory(client, opts.name);
        if (!data || data.length === 0) {
          console.log('未找到匹配的分类');
          return;
        }
        console.log(formatJsonWithFields(data, CATEGORY_FIELDS));
      } catch (e: unknown) {
        error(e);
      }
    });
}
