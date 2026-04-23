import { Command } from 'commander';
import { ApiClient } from '../api/client';
import {
  createBrand,
  getBrandDetail,
  updateBrand,
  deleteBrand,
  listBrands,
  CreateBrandDto,
  UpdateBrandDto,
} from '../api/brand';
import { formatDetail, formatList, formatOperation } from '../utils/formatter';
import { error, success } from '../utils/printer';
import { getApiUrl, loadConfig } from '../config';

const BRAND_DETAIL_FIELDS = [
  { field: 'id', type: 'number', desc: '品牌ID' },
  { field: 'name', type: 'string', desc: '品牌名称' },
  { field: 'aliases', type: 'array', desc: '别名列表' },
  { field: 'url', type: 'string', desc: '官网' },
  { field: 'logo', type: 'string', desc: 'Logo' },
  { field: 'type', type: 'string', desc: '品牌类型' },
  { field: 'isCooperation', type: 'boolean', desc: '合作品牌' },
  { field: 'isFeatured', type: 'boolean', desc: '精选品牌' },
  { field: 'vendorCount', type: 'number', desc: '绑定供应商数' },
  { field: 'productCount', type: 'number', desc: '商品数' },
  { field: 'remark', type: 'string', desc: '备注' },
  { field: 'createdTime', type: 'datetime', desc: '创建时间' },
];

const BRAND_LIST_FIELDS = [
  { field: 'id', type: 'number', desc: 'ID' },
  { field: 'name', type: 'string', desc: '品牌名称' },
  { field: 'keyword', type: 'string', desc: '别名' },
  { field: 'type', type: 'string', desc: '类型' },
  { field: 'isCooperation', type: 'boolean', desc: '合作' },
  { field: 'isFeatured', type: 'boolean', desc: '精选' },
  { field: 'vendorCount', type: 'number', desc: '供应商数' },
  { field: 'productCount', type: 'number', desc: '商品数' },
  { field: 'createdTime', type: 'datetime', desc: '创建时间' },
];

export function registerBrandCommands(brand: Command) {
  brand.hook('preAction', () => {
    const cfg = loadConfig();
    if (!cfg?.apiUrl) {
      error('尚未初始化，请先运行：wkea-manage-cli init');
      process.exit(1);
    }
  });

  // create
  brand
    .command('create')
    .description('创建品牌')
    .requiredOption('--name <name>', '品牌名称（必填）')
    .option('--keyword <keyword>', '别名/关键词，逗号分隔')
    .option('--url <url>', '品牌官网')
    .option('--logo <logo>', 'Logo URL')
    .option('--desc <desc>', '品牌描述')
    .option('--type <type>', '品牌类型')
    .option('--is-cooperation', '设为合作品牌')
    .option('--is-featured', '设为精选品牌')
    .option('--remark <remark>', '备注')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        const dto: CreateBrandDto = {
          name: opts.name,
          keyword: opts.keyword,
          url: opts.url,
          logo: opts.logo,
          desc: opts.desc,
          type: opts.type,
          isCooperation: opts.isCooperation ?? undefined,
          isFeatured: opts.isFeatured ?? undefined,
          remark: opts.remark,
        };
        const brandId = await createBrand(client, dto);
        success(`创建成功，品牌ID: ${brandId}`);
      } catch (e: any) {
        error(e.message);
        process.exit(1);
      }
    });

  // get
  brand
    .command('get')
    .description('查询品牌详情')
    .requiredOption('--brand-id <brandId>', '品牌ID（必填）')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        const data = await getBrandDetail(client, parseInt(opts.brandId));
        console.log(formatDetail(data as unknown as Record<string, unknown>, BRAND_DETAIL_FIELDS));
      } catch (e: any) {
        error(e.message);
        process.exit(1);
      }
    });

  // update
  brand
    .command('update')
    .description('更新品牌信息')
    .requiredOption('--brand-id <brandId>', '品牌ID（必填）')
    .option('--name <name>', '品牌名称')
    .option('--keyword <keyword>', '别名/关键词，逗号分隔')
    .option('--url <url>', '品牌官网')
    .option('--logo <logo>', 'Logo URL')
    .option('--desc <desc>', '品牌描述')
    .option('--type <type>', '品牌类型')
    .option('--is-cooperation', '设为合作品牌')
    .option('--is-featured', '设为精选品牌')
    .option('--remark <remark>', '备注')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        const dto: UpdateBrandDto = {};
        if (opts.name) dto.name = opts.name;
        if (opts.keyword) dto.keyword = opts.keyword;
        if (opts.url) dto.url = opts.url;
        if (opts.logo) dto.logo = opts.logo;
        if (opts.desc) dto.desc = opts.desc;
        if (opts.type) dto.type = opts.type;
        if (opts.isCooperation !== undefined) dto.isCooperation = opts.isCooperation;
        if (opts.isFeatured !== undefined) dto.isFeatured = opts.isFeatured;
        if (opts.remark) dto.remark = opts.remark;
        await updateBrand(client, parseInt(opts.brandId), dto);
        success(formatOperation('更新'));
      } catch (e: any) {
        error(e.message);
        process.exit(1);
      }
    });

  // delete
  brand
    .command('delete')
    .description('删除品牌')
    .requiredOption('--brand-id <brandId>', '品牌ID（必填）')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        await deleteBrand(client, parseInt(opts.brandId));
        success(formatOperation('删除'));
      } catch (e: any) {
        error(e.message);
        process.exit(1);
      }
    });

  // list
  brand
    .command('list')
    .description('查询品牌列表（分页）')
    .option('--page <page>', '页码，默认 1', '1')
    .option('--limit <limit>', '每页数量，默认 20', '20')
    .option('--keyword <keyword>', '搜索关键词（匹配品牌名称或别名）')
    .option('--id <id>', '品牌 ID 精确查询')
    .option('--ids <ids>', '品牌 ID 批量查询，逗号分隔', (val) => val.split(',').map(Number))
    .option('--name <name>', '品牌名称（精确或前缀匹配）')
    .option('--type <type>', '品牌类型')
    .option('--vendor-id <vendorId>', '绑定供应商 ID')
    .option('--is-cooperation', '仅显示合作品牌')
    .option('--is-featured', '仅显示精选品牌')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        const dto = {
          pageNum: parseInt(opts.page),
          pageSize: parseInt(opts.limit),
          keyword: opts.keyword,
          id: opts.id ? parseInt(opts.id) : undefined,
          ids: opts.ids,
          name: opts.name,
          type: opts.type,
          vendorId: opts.vendorId,
          isCooperation: opts.isCooperation ?? undefined,
          isFeatured: opts.isFeatured ?? undefined,
        };
        const result = await listBrands(client, dto);
        console.log(
          formatList(
            result.rows as unknown as Record<string, unknown>[],
            BRAND_LIST_FIELDS,
            { total: result.totalSize, current: result.pageIndex, size: result.pageSize }
          )
        );
      } catch (e: any) {
        error(e.message);
        process.exit(1);
      }
    });
}
