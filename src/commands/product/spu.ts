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
  SpuDetailVo,
  SpuBrandVo,
  SpuCategoryVo,
  SpuExtraColumnVo,
  SpuListVo,
} from '../../api/product/spu';
import { PageResult } from '../../types/vendor';
import { getApiUrl } from '../../config';
import { success, error } from '../../utils/printer';

function getClient(): ApiClient {
  return new ApiClient(getApiUrl());
}

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
        console.log(JSON.stringify(result, null, 2));
      } catch (e: any) {
    error(e);
      }
    });

  // ---------- list ----------
  spu
    .command('list')
    .description('SPU 列表')
    .option('--keyword <keyword>', '关键词')
    .option('--brand-id <id>', '品牌ID')
    .option('--category-id <id>', '分类ID')
    .option('--vendor-id <id>', '供应商ID')
    .option('--page <num>', '页码')
    .option('--size <num>', '每页条数')
    .action(async (options) => {
      try {
        const client = getClient();
        const result = await listSpu(client, {
          keyword: options.keyword,
          brandId: options.brandId ? parseInt(options.brandId) : undefined,
          categoryId: options.categoryId ? parseInt(options.categoryId) : undefined,
          vendorId: options.vendorId,
          page: options.page ? parseInt(options.page) : undefined,
          size: options.size ? parseInt(options.size) : undefined,
        });
        console.log(JSON.stringify(result, null, 2));
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
    .option('--sales-deliver <num>', '销售配送方式')
    .option('--es-keyword <keyword>', 'ES搜索关键词')
    .option('--buy-spec', '是否按规格购买')
    .option('--stop-production <status>', '停产状态')
    .option('--labels <ids>', '标签ID列表，逗号分隔')
    .option('--wkea-discount <num>', '维嘉折扣')
    .option('--wkea-deliver-discount <num>', '维嘉配送折扣')
    .option('--can-be-returned', '是否可退货')
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
    .option('--unit <unit>', '单位')
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
    .option('--sales-deliver <num>', '销售配送方式')
    .option('--es-keyword <keyword>', 'ES搜索关键词')
    .option('--buy-spec', '是否按规格购买')
    .option('--stop-production <status>', '停产状态')
    .option('--labels <ids>', '标签ID列表，逗号分隔')
    .option('--wkea-discount <num>', '维嘉折扣')
    .option('--wkea-deliver-discount <num>', '维嘉配送折扣')
    .option('--can-be-returned', '是否可退货')
    .action(async (options) => {
      try {
        const client = getClient();
        const dto: Record<string, unknown> = {};
        if (options.name) dto.name = options.name;
        if (options.unit) dto.unit = options.unit;
        if (options.description) dto.description = options.description;
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
        console.log(JSON.stringify(result, null, 2));
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
        const result = await bindCategories(client, options.spuId, [parseInt(options.categoryId)]);
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
        await unbindCategory(client, options.spuId, parseInt(options.categoryId));
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
        console.log(JSON.stringify(result, null, 2));
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
        console.log(JSON.stringify(result, null, 2));
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
}
