import { Command } from 'commander';
import { ApiClient } from '../../api/client';
import {
  createSpu,
  getSpu,
  updateSpu,
  deleteSpu,
  listSpu,
  bindBrands,
  unbindBrand,
  getSpuBrands,
  bindCategories,
  unbindCategory,
  getSpuCategories,
  getSpuExtraColumns,
  saveSpuExtraColumns,
  getSpuSpecs,
  bindSpuSpec,
  updateSpuSpec,
  unbindSpuSpec,
  createSpuSpec,
  getSpuSeparators,
  saveSpuSeparators,
  getSkuSpecValues,
  SpuDetailVo,
  SpuBrandVo,
  SpuCategoryVo,
  SpuExtraColumnVo,
  SpuListVo,
} from '../../api/product/spu';
import { PageResult } from '../../types/vendor';
import { getApiUrl } from '../../config';
import { formatJsonWithFields } from '../../utils/formatter';
import { success, error, info } from '../../utils/printer';

function getClient(): ApiClient {
  return new ApiClient(getApiUrl());
}

const SPU_LIST_FIELDS = [
  { field: 'spuId', type: 'string', desc: 'SPU ID' },
  { field: 'name', type: 'string', desc: 'SPU 名称' },
  { field: 'brandId', type: 'number', desc: '品牌 ID' },
  { field: 'categoryId', type: 'number', desc: '分类 ID' },
  { field: 'vendorId', type: 'string', desc: '供应商 ID' },
  { field: 'series', type: 'string', desc: '系列' },
  { field: 'tag', type: 'string', desc: '标签' },
  { field: 'managerId', type: 'string', desc: '经理ID' },
  { field: 'productCategoryShow', type: 'string', desc: '分类展示' },
  { field: 'images', type: 'string', desc: '图片' },
  { field: 'createdTime', type: 'datetime', desc: '创建时间' },
];

const PAGE_RESULT_FIELDS = [
  { field: 'rows', type: 'array', desc: '数据列表' },
  { field: 'totalSize', type: 'number', desc: '总记录数' },
  { field: 'pageIndex', type: 'number', desc: '当前页码' },
  { field: 'pageSize', type: 'number', desc: '每页条数' },
  { field: 'totalPage', type: 'number', desc: '总页数' },
];

const SPU_DETAIL_FIELDS = [
  { field: 'spuId', type: 'string', desc: 'SPU ID' },
  { field: 'name', type: 'string', desc: 'SPU 名称' },
  { field: 'description', type: 'string', desc: '描述' },
  { field: 'series', type: 'string', desc: '系列' },
  { field: 'tag', type: 'string', desc: '标签' },
  { field: 'canBeReturned', type: 'boolean', desc: '是否可退货' },
  { field: 'productCategoryShow', type: 'string', desc: '分类展示' },
  { field: 'vendorId', type: 'string', desc: '供应商ID' },
  { field: 'managerId', type: 'string', desc: '经理ID' },
  { field: 'categoryId', type: 'number', desc: '分类ID' },
  { field: 'brandId', type: 'number', desc: '品牌ID' },
  { field: 'pdfLink', type: 'string', desc: 'PDF链接' },
  { field: 'details', type: 'string', desc: '详情' },
  { field: 'modelRemark', type: 'string', desc: '型号备注' },
  { field: 'images', type: 'string', desc: '图片' },
  { field: 'qualificationPath', type: 'string', desc: '资质文件路径' },
  { field: 'informationFiles', type: 'string', desc: '信息文件' },
  { field: 'salesDeliver', type: 'number', desc: '销售配送方式' },
  { field: 'esKeyword', type: 'string', desc: 'ES关键词' },
  { field: 'buySpec', type: 'boolean', desc: '是否按规格购买' },
  { field: 'stopProduction', type: 'string', desc: '停产状态' },
  { field: 'wkeaDiscount', type: 'number', desc: '维嘉折扣' },
  { field: 'wkeaDeliverDiscount', type: 'number', desc: '维嘉配送折扣' },
  { field: 'basicGroupId', type: 'number', desc: '基础分组ID' },
  { field: 'unit', type: 'string', desc: '单位' },
  { field: 'brand', type: 'object', desc: '品牌信息 {id, name}' },
  { field: 'category', type: 'object', desc: '分类信息 {id, name}' },
  { field: 'brands', type: 'array', desc: '绑定品牌列表' },
  { field: 'categories', type: 'array', desc: '绑定分类列表' },
  { field: 'vendors', type: 'array', desc: '绑定供应商列表' },
  { field: 'extraColumns', type: 'array', desc: '扩展字段列表' },
  { field: 'specs', type: 'array', desc: '规格列表' },
  { field: 'skus', type: 'array', desc: 'SKU 列表' },
  { field: 'createdTime', type: 'datetime', desc: '创建时间' },
  { field: 'updatedTime', type: 'datetime', desc: '更新时间' },
];

const SPU_BRAND_FIELDS = [
  { field: 'id', type: 'number', desc: '品牌 ID' },
  { field: 'name', type: 'string', desc: '品牌名称' },
  { field: 'boundAt', type: 'datetime', desc: '绑定时间' },
];

const SPU_CATEGORY_FIELDS = [
  { field: 'id', type: 'number', desc: '分类 ID' },
  { field: 'name', type: 'string', desc: '分类名称' },
  { field: 'boundAt', type: 'datetime', desc: '绑定时间' },
];

const SPU_EXTRA_COLUMN_FIELDS = [
  { field: 'columnKey', type: 'string', desc: '字段 key' },
  { field: 'columnTitle', type: 'string', desc: '字段显示名' },
  { field: 'columnType', type: 'string', desc: '字段类型' },
  { field: 'columnValue', type: 'string', desc: '字段值' },
];

export function spuCommands(product: Command) {
  const spu = product.command('spu').description('SPU 管理');

  // ---------- get ----------
  spu
    .command('get')
    .description('获取 SPU 详情')
    .requiredOption('--spu-id <id>', 'SPU ID（必填）')
    .action(async (options) => {
      try {
        const client = getClient();
        const result = await getSpu(client, options.spuId);
        console.log(formatJsonWithFields(result, SPU_DETAIL_FIELDS));
      } catch (e: any) {
    error(e);
      }
    });

  // ---------- list ----------
  spu
    .command('list')
    .description('SPU 列表')
    .option('--id <id>', 'SPU编号/ID（精确查询）')
    .option('--keyword <keyword>', '关键词')
    .option('--brand-id <id>', '品牌ID')
    .option('--category-id <id>', '分类ID')
    .option('--vendor-id <id>', '供应商ID')
    .option('--created-time-begin <time>', '创建时间开始（格式: 2024-01-01 00:00:00）')
    .option('--created-time-end <time>', '创建时间结束（格式: 2024-12-31 23:59:59）')
    .option('--page <num>', '页码')
    .option('--size <num>', '每页条数')
    .action(async (options) => {
      try {
        const client = getClient();
        const result = await listSpu(client, {
          id: options.id ? parseInt(options.id) : undefined,
          keyword: options.keyword,
          brandId: options.brandId ? parseInt(options.brandId) : undefined,
          categoryId: options.categoryId ? parseInt(options.categoryId) : undefined,
          vendorId: options.vendorId,
          createdTimeBegin: options.createdTimeBegin,
          createdTimeEnd: options.createdTimeEnd,
          page: options.page ? parseInt(options.page) : undefined,
          size: options.size ? parseInt(options.size) : undefined,
        });
        if (result.rows?.length) {
          console.log(formatJsonWithFields(result, [...SPU_LIST_FIELDS, ...PAGE_RESULT_FIELDS]));
        } else {
          info('暂无数据');
        }
      } catch (e: any) {
    error(e);
      }
    });

  // ---------- create ----------
  spu
    .command('create')
    .description('创建 SPU')
    .requiredOption('--name <name>', 'SPU 名称（必填）')
    .option('--brand-id <id>', '品牌 ID（可选，未传则自动绑定默认品牌）')
    .option('--category-id <id>', '分类 ID（可选，未传则自动绑定默认分类工业品）')
    .option('--vendor-id <id>', '供应商 ID（可选，未传则自动绑定默认供应商待开发）')
    .option('--tag <tag>', '标签')
    .option('--series <series>', '系列')
    .option('--manager-id <id>', '经理ID')
    .option('--brand-ids <ids>', '品牌ID列表，逗号分隔')
    .option('--category-show <show>', '产品分类展示')
    .option('--description <desc>', '描述')
    .option('--pdf-link <url>', 'PDF链接')
    .option('--details <details>', '详情')
    .option('--model-remark <remark>', '型号备注')
    .option('--images <urls>', '图片URL，逗号分隔')
    .option('--qualification-path <path>', '资质文件路径')
    .option('--information-files <files>', '信息文件')
    .option('--sales-deliver <num>', '销售交期（枚举ID: 交期，enum --type 交期 查看可用值）')
    .option('--es-keyword <keyword>', 'ES搜索关键词')
    .option('--buy-spec', '是否按规格购买')
    .option('--stop-production <status>', '停产状态')
    .option('--labels <ids>', '标签ID列表，逗号分隔')
    .option('--wkea-discount <num>', '维嘉折扣')
    .option('--wkea-deliver-discount <num>', '维嘉配送折扣')
    .option('--can-be-returned', '是否可退货')
    .option('--extra-columns <json>', '附加列JSON。简单格式：{"key":"val"}；扩展格式：{"key":{"value":"val","type":"number","title":"xxx"}}')
    .action(async (options) => {
      try {
        const client = getClient();
        const dto: Record<string, unknown> = { name: options.name };
        if (options.brandId) dto.brandId = parseInt(options.brandId);
        if (options.categoryId) dto.categoryId = parseInt(options.categoryId);
        if (options.vendorId) dto.vendorId = options.vendorId;
        if (options.tag) dto.tag = options.tag;
        if (options.series) dto.series = options.series;
        if (options.managerId) dto.managerId = options.managerId;
        if (options.brandIds) dto.brandIdList = options.brandIds.split(',').map(Number);
        if (options.categoryShow) dto.productCategoryShow = options.categoryShow;
        if (options.description) dto.desc = options.description;
        if (options.pdfLink) dto.pdfLink = options.pdfLink;
        if (options.details) dto.details = options.details;
        if (options.modelRemark) dto.modelRemark = options.modelRemark;
        if (options.images) dto.images = options.images;
        if (options.qualificationPath) dto.qualificationPath = options.qualificationPath;
        if (options.informationFiles) dto.informationFiles = options.informationFiles;
        if (options.salesDeliver) dto.salesDeliver = parseInt(options.salesDeliver);
        if (options.esKeyword) dto.esKeyword = options.esKeyword;
        if (options.buySpec !== undefined) dto.buySpec = options.buySpec;
        if (options.stopProduction) dto.stopProduction = options.stopProduction;
        if (options.labels) dto.label = options.labels.split(',').map(Number);
        if (options.wkeaDiscount) dto.wkeaDiscount = parseFloat(options.wkeaDiscount);
        if (options.wkeaDeliverDiscount) dto.wkeaDeliverDiscount = parseFloat(options.wkeaDeliverDiscount);
        if (options.canBeReturned !== undefined) dto.canBeReturned = options.canBeReturned;
        if (options.extraColumns) dto.extraColumns = JSON.parse(options.extraColumns);
        const id = await createSpu(client, dto as any);
        success(`创建成功，SPU ID: ${id}`);
      } catch (e: any) {
    error(e);
      }
    });

  // ---------- update ----------
  spu
    .command('update')
    .description('更新 SPU')
    .requiredOption('--spu-id <id>', 'SPU ID（必填）')
    .option('--name <name>', 'SPU 名称')
    .option('--unit <unit>', '单位（枚举ID: 单位，enum --type 单位 查看可用值）')
    .option('--description <desc>', '描述')
    .option('--brand-id <id>', '品牌 ID')
    .option('--category-id <id>', '分类 ID')
    .option('--vendor-id <id>', '供应商 ID')
    .option('--tag <tag>', '标签')
    .option('--series <series>', '系列')
    .option('--manager-id <id>', '经理ID')
    .option('--brand-ids <ids>', '品牌ID列表，逗号分隔')
    .option('--category-show <show>', '产品分类展示')
    .option('--pdf-link <url>', 'PDF链接')
    .option('--details <details>', '详情')
    .option('--model-remark <remark>', '型号备注')
    .option('--images <urls>', '图片URL，逗号分隔')
    .option('--qualification-path <path>', '资质文件路径')
    .option('--information-files <files>', '信息文件')
    .option('--sales-deliver <num>', '销售交期（枚举ID: 交期，enum --type 交期 查看可用值）')
    .option('--es-keyword <keyword>', 'ES搜索关键词')
    .option('--buy-spec', '是否按规格购买')
    .option('--stop-production <status>', '停产状态')
    .option('--labels <ids>', '标签ID列表，逗号分隔')
    .option('--wkea-discount <num>', '维嘉折扣')
    .option('--wkea-deliver-discount <num>', '维嘉配送折扣')
    .option('--can-be-returned', '是否可退货')
    .option('--extra-columns <json>', '附加列JSON。简单格式：{"key":"val"}；扩展格式：{"key":{"value":"val","type":"number","title":"xxx"}}')
    .action(async (options) => {
      try {
        const client = getClient();
        const dto: Record<string, unknown> = {};
        if (options.name) dto.name = options.name;
        if (options.unit) dto.unit = options.unit;
        if (options.description) dto.desc = options.description;
        if (options.brandId) dto.brandId = parseInt(options.brandId);
        if (options.categoryId) dto.categoryId = parseInt(options.categoryId);
        if (options.vendorId) dto.vendorId = options.vendorId;
        if (options.tag) dto.tag = options.tag;
        if (options.series) dto.series = options.series;
        if (options.managerId) dto.managerId = options.managerId;
        if (options.brandIds) dto.brandIdList = options.brandIds.split(',').map(Number);
        if (options.categoryShow) dto.productCategoryShow = options.categoryShow;
        if (options.pdfLink) dto.pdfLink = options.pdfLink;
        if (options.details) dto.details = options.details;
        if (options.modelRemark) dto.modelRemark = options.modelRemark;
        if (options.images) dto.images = options.images;
        if (options.qualificationPath) dto.qualificationPath = options.qualificationPath;
        if (options.informationFiles) dto.informationFiles = options.informationFiles;
        if (options.salesDeliver) dto.salesDeliver = parseInt(options.salesDeliver);
        if (options.esKeyword) dto.esKeyword = options.esKeyword;
        if (options.buySpec !== undefined) dto.buySpec = options.buySpec;
        if (options.stopProduction) dto.stopProduction = options.stopProduction;
        if (options.labels) dto.label = options.labels.split(',').map(Number);
        if (options.wkeaDiscount) dto.wkeaDiscount = parseFloat(options.wkeaDiscount);
        if (options.wkeaDeliverDiscount) dto.wkeaDeliverDiscount = parseFloat(options.wkeaDeliverDiscount);
        if (options.canBeReturned !== undefined) dto.canBeReturned = options.canBeReturned;
        if (options.extraColumns) dto.extraColumns = JSON.parse(options.extraColumns);
        await updateSpu(client, options.spuId, dto as any);
        success('更新成功');
      } catch (e: any) {
    error(e);
      }
    });

  // ---------- delete ----------
  spu
    .command('delete')
    .description('删除 SPU')
    .requiredOption('--spu-id <id>', 'SPU ID（必填）')
    .action(async (options) => {
      try {
        const client = getClient();
        await deleteSpu(client, options.spuId);
        success('删除成功');
      } catch (e: any) {
    error(e);
      }
    });

  // ---------- bind-brand ----------
  spu
    .command('bind-brand')
    .description('绑定品牌到 SPU')
    .requiredOption('--spu-id <id>', 'SPU ID（必填）')
    .requiredOption('--brand-id <id>', '品牌ID（必填）')
    .action(async (options) => {
      try {
        const client = getClient();
        const result = await bindBrands(client, options.spuId, [parseInt(options.brandId)]);
        success(`绑定成功，新增: ${result.addedCount}，跳过: ${result.skippedCount}`);
      } catch (e: any) {
    error(e);
      }
    });

  // ---------- unbind-brand ----------
  spu
    .command('unbind-brand')
    .description('解绑品牌')
    .requiredOption('--spu-id <id>', 'SPU ID（必填）')
    .requiredOption('--brand-id <id>', '品牌ID（必填）')
    .action(async (options) => {
      try {
        const client = getClient();
        await unbindBrand(client, options.spuId, parseInt(options.brandId));
        success('解绑成功');
      } catch (e: any) {
    error(e);
      }
    });

  // ---------- brands ----------
  spu
    .command('brands')
    .description('查询 SPU 绑定的品牌')
    .requiredOption('--spu-id <id>', 'SPU ID（必填）')
    .action(async (options) => {
      try {
        const client = getClient();
        const result = await getSpuBrands(client, options.spuId);
        console.log(formatJsonWithFields(result, SPU_BRAND_FIELDS));
      } catch (e: any) {
    error(e);
      }
    });

  // ---------- bind-category ----------
  spu
    .command('bind-category')
    .description('绑定分类到 SPU')
    .requiredOption('--spu-id <id>', 'SPU ID（必填）')
    .requiredOption('--category-id <id>', '分类ID（必填）')
    .action(async (options) => {
      try {
        const client = getClient();
        const result = await bindCategories(client, options.spuId, [options.categoryId]);
        success(`绑定成功，新增: ${result.addedCount}，跳过: ${result.skippedCount}`);
      } catch (e: any) {
    error(e);
      }
    });

  // ---------- unbind-category ----------
  spu
    .command('unbind-category')
    .description('解绑分类')
    .requiredOption('--spu-id <id>', 'SPU ID（必填）')
    .requiredOption('--category-id <id>', '分类ID（必填）')
    .action(async (options) => {
      try {
        const client = getClient();
        await unbindCategory(client, options.spuId, options.categoryId);
        success('解绑成功');
      } catch (e: any) {
    error(e);
      }
    });

  // ---------- categories ----------
  spu
    .command('categories')
    .description('查询 SPU 绑定的分类')
    .requiredOption('--spu-id <id>', 'SPU ID（必填）')
    .action(async (options) => {
      try {
        const client = getClient();
        const result = await getSpuCategories(client, options.spuId);
        console.log(formatJsonWithFields(result, SPU_CATEGORY_FIELDS));
      } catch (e: any) {
    error(e);
      }
    });

  // ---------- extra-columns ----------
  const extraColumns = spu
    .command('extra-columns')
    .description('SPU 扩展字段');

  extraColumns
    .command('get')
    .description('获取 SPU 扩展字段')
    .requiredOption('--spu-id <id>', 'SPU ID（必填）')
    .action(async (options) => {
      try {
        const client = getClient();
        const result = await getSpuExtraColumns(client, options.spuId);
        console.log(formatJsonWithFields(result, SPU_EXTRA_COLUMN_FIELDS));
      } catch (e: any) {
    error(e);
      }
    });

  extraColumns
    .command('set')
    .description('设置 SPU 扩展字段')
    .requiredOption('--spu-id <id>', 'SPU ID（必填）')
    .requiredOption('--key <key>', '字段键名')
    .requiredOption('--value <value>', '字段值')
    .action(async (options) => {
      try {
        const client = getClient();
        await saveSpuExtraColumns(client, options.spuId, { [options.key]: options.value });
        success('设置成功');
      } catch (e: any) {
    error(e);
      }
    });

  // ---------- spec 子命令 ----------
  const spec = spu
    .command('spec')
    .description('规格管理');

  spec
    .command('list')
    .description('查看 SPU 的规格列表')
    .requiredOption('--spu-id <id>', 'SPU ID（必填）')
    .action(async (options) => {
      try {
        const client = getClient();
        const result = await getSpuSpecs(client, options.spuId);
        console.log(formatJsonWithFields(result, [
          { field: 'id', type: 'number', desc: '规格中间表 ID' },
          { field: 'productSpecId', type: 'number', desc: '规格 ID' },
          { field: 'specName', type: 'string', desc: '规格名称' },
          { field: 'manageName', type: 'string', desc: '规格后台名' },
          { field: 'isFixed', type: 'boolean', desc: '是否固定规格' },
          { field: 'isInput', type: 'boolean', desc: '是否允许选型输入' },
          { field: 'sort', type: 'number', desc: '排序' },
        ]));
      } catch (e: any) {
    error(e);
      }
    });

  spec
    .command('bind')
    .description('绑定规格到 SPU')
    .requiredOption('--spu-id <id>', 'SPU ID（必填）')
    .requiredOption('--spec-id <id>', '规格 ID（必填）')
    .option('--is-input', '是否允许选型输入（默认 false）')
    .action(async (options) => {
      try {
        const client = getClient();
        await bindSpuSpec(client, options.spuId, parseInt(options.specId), options.isInput === true);
        success('绑定成功');
      } catch (e: any) {
    error(e);
      }
    });

  spec
    .command('update')
    .description('更新规格（含设置 isFixed 固定规格标记）')
    .requiredOption('--spu-id <id>', 'SPU ID（必填）')
    .requiredOption('--spec-id <id>', '规格 ID（必填）')
    .option('--name <name>', '规格名称')
    .option('--manage-name <name>', '规格后台名称')
    .option('--is-fixed', '设为固定规格（不可选，默认选中）')
    .option('--no-fixed', '取消固定规格')
    .option('--is-name-show', '在产品名字中体现')
    .action(async (options) => {
      try {
        const client = getClient();
        const dto: Record<string, unknown> = {};
        if (options.name) dto.name = options.name;
        if (options.manageName) dto.manageName = options.manageName;
        if (options.isFixed !== undefined) dto.isFixed = true;
        if (options.noFixed !== undefined) dto.isFixed = false;
        if (options.isNameShow !== undefined) dto.isNameShow = true;
        await updateSpuSpec(client, options.spuId, parseInt(options.specId), dto as any);
        success('更新成功');
      } catch (e: any) {
    error(e);
      }
    });

  spec
    .command('unbind')
    .description('解绑 SPU 的规格（传规格中间表 ID）')
    .requiredOption('--spu-id <id>', 'SPU ID（必填）')
    .requiredOption('--mid-id <id>', '规格中间表 ID（必填，从 spec list 中获取）')
    .action(async (options) => {
      try {
        const client = getClient();
        await unbindSpuSpec(client, options.spuId, parseInt(options.midId));
        success('解绑成功');
      } catch (e: any) {
    error(e);
      }
    });

  spec
    .command('create')
    .description('创建新规格')
    .requiredOption('--spu-id <id>', 'SPU ID（必填）')
    .requiredOption('--name <name>', '规格名称（必填）')
    .requiredOption('--manage-name <name>', '规格后台名称（必填，不能重复）')
    .requiredOption('--sort <num>', '排序序号（必填）')
    .option('--is-fixed', '是否固定规格')
    .option('--is-name-show', '是否在产品名字体现')
    .action(async (options) => {
      try {
        const client = getClient();
        const dto: Record<string, unknown> = {
          name: options.name,
          manageName: options.manageName,
          sort: parseInt(options.sort),
        };
        if (options.isFixed !== undefined) dto.isFixed = true;
        if (options.isNameShow !== undefined) dto.isNameShow = true;
        const id = await createSpuSpec(client, options.spuId, dto as any);
        // 固定规格：自动创建默认规格值（name=tag=规格名）
        if (options.isFixed !== undefined) {
          try {
            await client.post<any>('/api/manage/product/spec/param', {
              productSpecId: id,
              specs: [{ name: options.name, tag: options.name, sort: 1 }]
            });
          } catch { /* 规格值已存在则忽略 */ }
        }
        success(`创建成功，规格 ID: ${id}`);
      } catch (e: any) {
    error(e);
      }
    });

  // ---------- separator 子命令 ----------
  const separator = spu
    .command('separator')
    .description('分隔符管理');

  separator
    .command('get')
    .description('获取 SPU 的规格分隔符配置')
    .requiredOption('--spu-id <id>', 'SPU ID（必填）')
    .action(async (options) => {
      try {
        const client = getClient();
        const result = await getSpuSeparators(client, options.spuId);
        console.log(formatJsonWithFields(result, [
          { field: 'specFg', type: 'array', desc: '每个规格后的分隔符（显示名）' },
          { field: 'specFgIds', type: 'array', desc: '每个规格后的分隔符 ID' },
          { field: 'productTagFg', type: 'string', desc: '产品标签分隔符' },
          { field: 'productTagFgId', type: 'number', desc: '产品标签分隔符 ID' },
          { field: 'productTagIndex', type: 'number', desc: '产品标签位置' },
        ]));
      } catch (e: any) {
    error(e);
      }
    });

  separator
    .command('set')
    .description('保存 SPU 的规格分隔符配置')
    .requiredOption('--spu-id <id>', 'SPU ID（必填）')
    .option('--spec-fg <names>', '分隔符显示名列表，逗号分隔，空值用 null，如: "-,/,null,-"')
    .option('--spec-fg-ids <ids>', '分隔符 ID 列表，逗号分隔，空值用 null')
    .option('--product-tag-fg <fg>', '产品标签分隔符')
    .option('--product-tag-fg-id <id>', '产品标签分隔符 ID')
    .option('--product-tag-index <index>', '产品标签位置（第几个规格后）')
    .action(async (options) => {
      try {
        const client = getClient();
        const data: Record<string, unknown> = {};
        if (options.specFg) {
          data.specFg = options.specFg.split(',').map((s: string) => s === 'null' ? null : s);
        }
        if (options.specFgIds) {
          data.specFgIds = options.specFgIds.split(',').map((s: string) => s === 'null' ? null : s);
        }
        if (options.productTagFg !== undefined) data.productTagFg = options.productTagFg;
        if (options.productTagFgId !== undefined) data.productTagFgId = parseInt(options.productTagFgId);
        if (options.productTagIndex !== undefined) data.productTagIndex = parseInt(options.productTagIndex);
        await saveSpuSeparators(client, options.spuId, data);
        success('分隔符配置已保存');
      } catch (e: any) {
    error(e);
      }
    });

  // ---------- spec-values (SKU 规格值) ----------
  spu
    .command('spec-values')
    .description('查看 SKU 的规格值')
    .requiredOption('--sku <sku>', 'SKU ID（必填）')
    .action(async (options) => {
      try {
        const client = getClient();
        const result = await getSkuSpecValues(client, options.sku);
        console.log(formatJsonWithFields(result, [
          { field: 'specId', type: 'number', desc: '规格 ID' },
          { field: 'specName', type: 'string', desc: '规格名称' },
          { field: 'specParamId', type: 'number', desc: '规格值 ID' },
          { field: 'specParamName', type: 'string', desc: '规格值名称' },
          { field: 'specParamTag', type: 'string', desc: '规格值 tag' },
        ]));
      } catch (e: any) {
    error(e);
      }
    });
}
