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
import { formatJsonWithFields, formatOperation } from '../utils/formatter';
import { error, success } from '../utils/printer';
import { getApiUrl, loadConfig } from '../config';

const BRAND_DETAIL_FIELDS = [
  { field: 'id', type: 'number', desc: '品牌ID' },
  { field: 'name', type: 'string', desc: '品牌名称' },
  { field: 'aliases', type: 'array', desc: '别名列表' },
  { field: 'url', type: 'string', desc: '官网' },
  { field: 'logo', type: 'string', desc: 'Logo' },
  { field: 'bigLogo', type: 'string', desc: '品牌大logo' },
  { field: 'authorizationCertificateImage', type: 'string', desc: '品牌授权证书图片' },
  { field: 'type', type: 'string', desc: '品牌类型' },
  { field: 'tag', type: 'string', desc: '品牌价值标签' },
  { field: 'levelId', type: 'number', desc: '品牌等级组ID' },
  { field: 'isCooperation', type: 'boolean', desc: '合作品牌' },
  { field: 'isFeatured', type: 'boolean', desc: '精选品牌' },
  { field: 'vendorCount', type: 'number', desc: '绑定供应商数' },
  { field: 'productCount', type: 'number', desc: '商品数' },
  { field: 'remark', type: 'string', desc: '备注' },
  { field: 'regNo', type: 'string', desc: '申请/注册号' },
  { field: 'flowStatusDesc', type: 'string', desc: '商标状态' },
  { field: 'validPeriod', type: 'string', desc: '专用权期限' },
  { field: 'applicant', type: 'string', desc: '申请人' },
  { field: 'createdBy', type: 'string', desc: '创建人' },
  { field: 'createdTime', type: 'datetime', desc: '创建时间' },
  { field: 'updatedTime', type: 'datetime', desc: '更新时间' },
  { field: 'updatedBy', type: 'string', desc: '修改人' },
];

const BRAND_LIST_FIELDS = [
  { field: 'id', type: 'number', desc: 'ID' },
  { field: 'name', type: 'string', desc: '品牌名称' },
  { field: 'keyword', type: 'string', desc: '别名' },
  { field: 'url', type: 'string', desc: '官网' },
  { field: 'logo', type: 'string', desc: 'Logo' },
  { field: 'bigLogo', type: 'string', desc: '品牌大logo' },
  { field: 'authorizationCertificateImage', type: 'string', desc: '品牌授权证书图片' },
  { field: 'type', type: 'string', desc: '类型' },
  { field: 'tag', type: 'string', desc: '品牌价值标签' },
  { field: 'levelId', type: 'number', desc: '品牌等级组ID' },
  { field: 'isCooperation', type: 'boolean', desc: '合作' },
  { field: 'isFeatured', type: 'boolean', desc: '精选' },
  { field: 'remark', type: 'string', desc: '备注' },
  { field: 'regNo', type: 'string', desc: '申请/注册号' },
  { field: 'flowStatusDesc', type: 'string', desc: '商标状态' },
  { field: 'validPeriod', type: 'string', desc: '专用权期限' },
  { field: 'applicant', type: 'string', desc: '申请人' },
  { field: 'vendorCount', type: 'number', desc: '供应商数' },
  { field: 'productCount', type: 'number', desc: '商品数' },
  { field: 'createdBy', type: 'string', desc: '创建人' },
  { field: 'createdTime', type: 'datetime', desc: '创建时间' },
  { field: 'updatedTime', type: 'datetime', desc: '更新时间' },
  { field: 'updatedBy', type: 'string', desc: '修改人' },
];

const PAGE_RESULT_FIELDS = [
  { field: 'rows', type: 'array', desc: '数据列表' },
  { field: 'totalSize', type: 'number', desc: '总记录数' },
  { field: 'pageIndex', type: 'number', desc: '当前页码' },
  { field: 'pageSize', type: 'number', desc: '每页条数' },
  { field: 'totalPage', type: 'number', desc: '总页数' },
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
    .option('--type <type>', '品牌类型（字符串字段，非枚举）')
    .option('--is-cooperation', '设为合作品牌')
    .option('--is-featured', '设为精选品牌')
    .option('--remark <remark>', '备注')
    .option('--auth-cert-image <url>', '授权证书图片URL')
    .option('--vendors-ids <ids>', '供应商ID列表，逗号分隔')
    .option('--category-ids <ids>', '分类ID列表，逗号分隔')
    .option('--tags <ids>', '标签列表，逗号分隔')
    .option('--reg-no <no>', '注册号')
    .option('--flow-status-desc <desc>', '流程状态描述')
    .option('--valid-period <period>', '有效期')
    .option('--applicant <applicant>', '申请人')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        const dto: Record<string, unknown> = {
          name: opts.name,
        };
        if (opts.keyword) dto.keyword = opts.keyword;
        if (opts.url) dto.url = opts.url;
        if (opts.logo) dto.logo = opts.logo;
        if (opts.desc) dto.desc = opts.desc;
        if (opts.type) dto.type = opts.type;
        if (opts.isCooperation !== undefined) dto.isCooperation = opts.isCooperation;
        if (opts.isFeatured !== undefined) dto.isFeatured = opts.isFeatured;
        if (opts.remark) dto.remark = opts.remark;
        if (opts.authCertImage) dto.authorizationCertificateImage = opts.authCertImage;
        if (opts.vendorsIds) dto.vendorsId = opts.vendorsIds.split(',');
        if (opts.categoryIds) dto.categoryId = opts.categoryIds.split(',').map(Number);
        if (opts.tags) dto.tag = opts.tags.split(',').map(Number);
        if (opts.regNo) dto.regNo = opts.regNo;
        if (opts.flowStatusDesc) dto.flowStatusDesc = opts.flowStatusDesc;
        if (opts.validPeriod) dto.validPeriod = opts.validPeriod;
        if (opts.applicant) dto.applicant = opts.applicant;
        const brandId = await createBrand(client, dto as any);
        success(`创建成功，品牌ID: ${brandId}`);
      } catch (e: any) {
    error(e);
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
        console.log(formatJsonWithFields(data, BRAND_DETAIL_FIELDS));
      } catch (e: any) {
    error(e);
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
    .option('--type <type>', '品牌类型（字符串字段，非枚举）')
    .option('--is-cooperation', '设为合作品牌')
    .option('--is-featured', '设为精选品牌')
    .option('--remark <remark>', '备注')
    .option('--auth-cert-image <url>', '授权证书图片URL')
    .option('--vendors-ids <ids>', '供应商ID列表，逗号分隔')
    .option('--category-ids <ids>', '分类ID列表，逗号分隔')
    .option('--tags <ids>', '标签列表，逗号分隔')
    .option('--reg-no <no>', '注册号')
    .option('--flow-status-desc <desc>', '流程状态描述')
    .option('--valid-period <period>', '有效期')
    .option('--applicant <applicant>', '申请人')
    .option('--level-id <id>', '等级ID')
    .option('--vendors-id-list <ids>', '供应商ID列表（逗号分隔）')
    .option('--categories <ids>', '分类列表，逗号分隔')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        const dto: Record<string, unknown> = {};
        if (opts.name) dto.name = opts.name;
        if (opts.keyword) dto.keyword = opts.keyword;
        if (opts.url) dto.url = opts.url;
        if (opts.logo) dto.logo = opts.logo;
        if (opts.desc) dto.desc = opts.desc;
        if (opts.type) dto.type = opts.type;
        if (opts.isCooperation !== undefined) dto.isCooperation = opts.isCooperation;
        if (opts.isFeatured !== undefined) dto.isFeatured = opts.isFeatured;
        if (opts.remark) dto.remark = opts.remark;
        if (opts.authCertImage) dto.authorizationCertificateImage = opts.authCertImage;
        if (opts.vendorsIds) dto.vendorsId = opts.vendorsIds.split(',');
        if (opts.categoryIds) dto.categoryId = opts.categoryIds.split(',').map(Number);
        if (opts.tags) dto.tag = opts.tags.split(',').map(Number);
        if (opts.regNo) dto.regNo = opts.regNo;
        if (opts.flowStatusDesc) dto.flowStatusDesc = opts.flowStatusDesc;
        if (opts.validPeriod) dto.validPeriod = opts.validPeriod;
        if (opts.applicant) dto.applicant = opts.applicant;
        if (opts.levelId) dto.levelId = parseInt(opts.levelId);
        if (opts.vendorsIdList) dto.vendorsIdList = opts.vendorsIdList.split(',');
        if (opts.categories) dto.category = opts.categories.split(',').map(Number);
        await updateBrand(client, parseInt(opts.brandId), dto as any);
        success(formatOperation('更新'));
      } catch (e: any) {
    error(e);
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
    error(e);
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
    .option('--type <type>', '品牌类型（字符串字段，非枚举）')
    .option('--vendor-id <vendorId>', '绑定供应商 ID')
    .option('--is-cooperation', '仅显示合作品牌')
    .option('--is-featured', '仅显示精选品牌')
    .option('--created-time-begin <time>', '创建时间开始（格式: 2024-01-01 00:00:00）')
    .option('--created-time-end <time>', '创建时间结束（格式: 2024-12-31 23:59:59）')
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
          createdTimeBegin: opts.createdTimeBegin,
          createdTimeEnd: opts.createdTimeEnd,
        };
        const result = await listBrands(client, dto);
        console.log(formatJsonWithFields(result, [...BRAND_LIST_FIELDS, ...PAGE_RESULT_FIELDS]));
      } catch (e: any) {
    error(e);
        process.exit(1);
      }
    });
}
