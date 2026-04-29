import { Command } from 'commander';
import { ApiClient } from '../../api/client';
import { bindBoth, getExtraColumns, saveExtraColumns, mergeVendor } from '../../api/vendor';
import { formatJsonWithFields, formatOperation } from '../../utils/formatter';
import { error, success } from '../../utils/printer';
import { getApiUrl } from '../../config';

const EXTRA_COLUMN_FIELDS = [
  { field: 'columnId', type: 'number', desc: '扩展字段ID' },
  { field: 'columnKey', type: 'string', desc: '字段标识键' },
  { field: 'columnTitle', type: 'string', desc: '字段标题' },
  {
    field: 'columnType',
    type: 'string',
    desc: '字段类型：text/number/date/select/boolean/email/phone',
  },
  { field: 'columnValue', type: 'string', desc: '当前值' },
  {
    field: 'options',
    type: 'array',
    desc: '下拉选项（select 类型时有效）[{label, value, color}]',
  },
  { field: 'isReadonly', type: 'boolean', desc: '是否只读' },
  { field: 'align', type: 'string', desc: '对齐方式' },
];

export function registerAdvancedCommands(
  vendor: Command
) {

  // bind-all
  vendor
    .command('bind-all')
    .description('同时绑定品牌和分类到供应商')
    .requiredOption('--vendor-id <vendorId>', '供应商ID（必填）')
    .option('--brand-ids <brandIds>', '品牌ID列表，逗号分隔')
    .option('--category-ids <categoryIds>', '分类ID列表，逗号分隔')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        const dto: { brands?: { brandIds: number[] }; categories?: { categoryIds: string[] } } =
          {};
        if (opts.brandIds) {
          dto.brands = {
            brandIds: opts.brandIds.split(',').map((s: string) => parseInt(s.trim())),
          };
        }
        if (opts.categoryIds) {
          dto.categories = {
            categoryIds: opts.categoryIds
              .split(',')
              .map((s: string) => s.trim()),
          };
        }
        const result = await bindBoth(client, opts.vendorId, dto);
        const parts: string[] = [];
        if (result.brands) {
          parts.push(
            `品牌：新增 ${result.brands.addedCount}，跳过 ${result.brands.skippedCount}`
          );
        }
        if (result.categories) {
          parts.push(
            `分类：新增 ${result.categories.addedCount}，跳过 ${result.categories.skippedCount}`
          );
        }
        success(`绑定完成，${parts.join('；')}`);
      } catch (e: any) {
    error(e);
        process.exit(1);
      }
    });

  // extra-columns get
  vendor
    .command('extra-columns')
    .description('获取供应商扩展字段')
    .requiredOption('--vendor-id <vendorId>', '供应商ID（必填）')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        const list = await getExtraColumns(client, opts.vendorId);
        console.log(formatJsonWithFields(list, EXTRA_COLUMN_FIELDS));
      } catch (e: any) {
    error(e);
        process.exit(1);
      }
    });

  // save-extra-columns
  vendor
    .command('save-extra-columns')
    .description('保存供应商扩展字段')
    .requiredOption('--vendor-id <vendorId>', '供应商ID（必填）')
    .requiredOption(
      '--columns <columns>',
      "扩展字段值，JSON 字符串（如 '{\"tax_rate\":\"13%\",\"annual_revenue\":\"5000\"}')"
    )
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        const data = JSON.parse(opts.columns);
        await saveExtraColumns(client, opts.vendorId, data);
        success(formatOperation('保存扩展字段'));
      } catch (e: any) {
    if (e instanceof SyntaxError) {
          error('--columns 参数必须是有效的 JSON 字符串');
        } else {
          error(e);
        }
        process.exit(1);
      }
    });

  // merge
  vendor
    .command('merge')
    .description('合并供应商（将来源供应商合并到目标供应商）')
    .requiredOption('--from-id <fromId>', '来源供应商ID（将被删除）')
    .requiredOption('--to-id <toId>', '目标供应商ID（合并后保留）')
    .requiredOption('--operator <operator>', '操作人')
    .option('--move-brands', '转移品牌绑定', true)
    .option('--move-categories', '转移分类绑定', true)
    .option('--move-products', '转移产品绑定', true)
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        await mergeVendor(client, {
          sourceVendorId: opts.fromId,
          targetVendorId: opts.toId,
          operator: opts.operator,
          mergeOptions: {
            moveBrands: opts.moveBrands !== false,
            moveCategories: opts.moveCategories !== false,
            moveProducts: opts.moveProducts !== false,
          },
        });
        success(`合并完成：${opts.fromId} → ${opts.toId}（${opts.fromId} 已删除）`);
      } catch (e: any) {
    error(e);
        process.exit(1);
      }
    });
}
