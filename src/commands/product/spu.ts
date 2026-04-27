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
    .action(async (options) => {
      try {
        const client = getClient();
        const dto: { name: string; brandId?: number; categoryId?: number; vendorId?: string } = { name: options.name };
        if (options.brandId) dto.brandId = parseInt(options.brandId);
        if (options.categoryId) dto.categoryId = parseInt(options.categoryId);
        if (options.vendorId) dto.vendorId = options.vendorId;
        const id = await createSpu(client, dto);
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
    .action(async (options) => {
      try {
        const client = getClient();
        const dto: Record<string, unknown> = {};
        if (options.name) dto.name = options.name;
        if (options.unit) dto.unit = options.unit;
        if (options.description) dto.description = options.description;
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
