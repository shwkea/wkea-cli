import { Command } from 'commander';
import { getApiUrl } from '../../config';
import { ApiClient } from '../../api/client';
import { quickCreate, QuickCreateDto } from '../../api/product/spu';
import { success, error } from '../../utils/printer';

export function quickCreateCommand(product: Command) {
  product
    .command('quick-create')
    .description('快速创建 SPU + SKU（支持规格、属性一次性传入）')
    .requiredOption('--spu-name <name>', 'SPU 名称')
    .option('--spu-id <id>', '已有 SPU ID（传此则复用 SPU，只创建 SKU）')
    .option('--brand-id <id>', '品牌 ID')
    .option('--brand-name <name>', '品牌名称（优先用 --brand-id）')
    .option('--category-id <id>', '分类 ID')
    .option('--category-name <name>', '分类名称（优先用 --category-id）')
    .option('--vendor-id <id>', '供应商 ID')
    .option('--vendor-name <name>', '供应商名称（优先用 --vendor-id）')
    .option('--description <text>', 'SPU 描述')
    .option('--images <urls>', '图片 URL（多张逗号分隔）')
    // -s 是手动从 argv 累积，option 只做声明用途（值被忽略）
    .option('-s, --sku <json>', 'SKU JSON（可多次传入），字段说明：\n  name(string,必填)=SKU名称\n  specs(object)=自动创建规格，格式: {"规格名":["值1","值2"]}\n  attributes(array)=属性列表，格式: [{"name":"属性名","value":"属性值"}]\n  paramIds(array)=已有规格参数ID（直接复用，不自动创建）\n  salesPrice(number)=售价  purchasePrice(number)=采购价  stock(number)=库存\n  isShelf(boolean)=是否上架  unit(number)=单位ID  remark(string)=备注  model(string)=型号\n  示例: -s \'{"name":"液压缸-50mm","specs":{"材质":["不锈钢","碳钢"]},"attributes":[{"name":"产地","value":"上海"}],"salesPrice":100,"stock":50}\'')
    .action(async (options) => {
      const client = new ApiClient(getApiUrl());

      // Commander.js 重复 -s 只保留最后一个，手动从 argv 收集所有值
      const rawSkus: string[] = [];
      for (let i = 0; i < process.argv.length; i++) {
        if (process.argv[i] === '-s' || process.argv[i] === '--sku') {
          rawSkus.push(process.argv[++i]);
        }
      }

      const skus: any[] = [];
      for (const input of rawSkus) {
        try {
          const sku = JSON.parse(input);
          // attributes 数组序列化到 attributesJson（规避 FastJSON 中文 field name 解析 bug）
          if (sku.attributes && Array.isArray(sku.attributes)) {
            sku.attributesJson = JSON.stringify(sku.attributes);
            delete sku.attributes;
          }
          skus.push(sku);
        } catch {
          error(`JSON 解析失败：${input}`);
          process.exit(1);
        }
      }

      if (skus.length === 0) {
        error('请至少传入一个 SKU（使用 -s \'{"name":"..."}\'，可多次 -s）');
        process.exit(1);
      }

      const dto: QuickCreateDto = {
        spuId: options.spuId,
        spuName: options.spuName,
        brandId: options.brandId ? parseInt(options.brandId) : undefined,
        brandName: options.brandName,
        categoryId: options.categoryId ? parseInt(options.categoryId) : undefined,
        categoryName: options.categoryName,
        vendorId: options.vendorId,
        vendorName: options.vendorName,
        managerId: options.managerId,
        description: options.description,
        images: options.images,
        skus,
      };

      try {
        const result = await quickCreate(client, dto);
        success(`创建成功：SPU ID=${result.spuId}，生成 SKU ${result.skuIds.length} 个：${result.skuIds.join(', ')}`);
      } catch (e: any) {
        error(e);
        process.exit(1);
      }
    });
}
