import { Command } from 'commander';
import { getApiUrl } from '../../config';
import { ApiClient } from '../../api/client';
import {
  getSku,
  listSku,
  listSkuBySpu,
  createSku,
  updateSku,
  deleteSku,
  cloneSku,
  batchDeleteSku,
  batchShelfSku,
  getSkuSpecValues,
  saveSkuSpecValues,
  getSkuExtraColumns,
  saveSkuExtraColumns,
  CreateSkuDto,
  UpdateSkuDto,
  SkuListParams,
  SpecItem,
} from '../../api/product/sku';
import { success, error, info } from '../../utils/printer';

export function skuCommands(product: Command) {
  const sku = product
    .command('sku')
    .description('SKU 管理');

  // sku get --sku-id <id>
  sku
    .command('get')
    .description('获取 SKU 详情')
    .requiredOption('--sku-id <id>', 'SKU ID')
    .action(async (options) => {
      try {
        const client = new ApiClient(getApiUrl());
        const data = await getSku(client, options.skuId);
        success(`SKU 详情: ${data.name}`);
        info(`  SKU ID: ${data.skuId}`);
        info(`  SPU ID: ${data.spuId}`);
        if (data.spuName) info(`  SPU 名称: ${data.spuName}`);
        info(`  名称: ${data.name}`);
        if (data.skuCode) info(`  SKU 编码: ${data.skuCode}`);
        if (data.price !== undefined) info(`  价格: ${data.price}`);
        if (data.stock !== undefined) info(`  库存: ${data.stock}`);
        if (data.weight !== undefined) info(`  重量: ${data.weight}`);
        if (data.unit) info(`  单位: ${data.unit}`);
        info(`  创建时间: ${data.createdTime}`);
        if (data.specValues?.length) {
          info(`  规格值:`);
          for (const sv of data.specValues) {
            info(`    - ${sv.specName}: ${sv.paramName}`);
          }
        }
        if (data.supplies?.length) {
          info(`  供应商:`);
          for (const s of data.supplies) {
            info(`    - ${s.vendorName} (售价:${s.salesPrice ?? '-'} 采购价:${s.purchasePrice ?? '-'})`);
          }
        }
        if (data.extraColumns?.length) {
          info(`  扩展字段:`);
          for (const col of data.extraColumns) {
            info(`    - ${col.columnTitle}: ${col.columnValue}`);
          }
        }
      } catch (e: unknown) {
        error(e);
      }
    });

  // sku list --spu-id <id> [--has-supply] [--min-price N] [--max-price N]
  sku
    .command('list')
    .description('SKU 列表（--spu-id 则列出该 SPU 下所有 SKU；无 --spu-id 则全量分页搜索）')
    .option('--spu-id <id>', 'SPU ID（指定则列出该 SPU 下所有 SKU）')
    .option('--keyword <keyword>', '关键词（仅在全量模式时生效）')
    .option('--has-supply', '只看有供应的（全量模式）')
    .option('--min-price <n>', '最低价格（全量模式）')
    .option('--max-price <n>', '最高价格（全量模式）')
    .option('--page <n>', '页码（全量模式）', (v) => parseInt(v))
    .option('--size <n>', '每页条数（全量模式）', (v) => parseInt(v))
    .action(async (options) => {
      try {
        const client = new ApiClient(getApiUrl());
        if (options.spuId) {
          // 按 SPU 查 SKU
          const rows = await listSkuBySpu(client, options.spuId);
          info(`共 ${rows.length} 条 SKU`);
          for (const item of rows) {
            const priceStr = item.price !== undefined ? `¥${item.price}` : '-';
            const stockStr = item.stock !== undefined ? `${item.stock}` : '-';
            info(`  [${item.skuId}] ${item.name} | 价格:${priceStr} | 库存:${stockStr}`);
          }
        } else {
          // 全量列表
          const params: SkuListParams = {};
          if (options.keyword) params.keyword = options.keyword;
          if (options.hasSupply !== undefined) params.hasSupply = true;
          if (options.minPrice !== undefined) params.minPrice = parseFloat(options.minPrice);
          if (options.maxPrice !== undefined) params.maxPrice = parseFloat(options.maxPrice);
          if (options.page !== undefined) params.page = options.page;
          if (options.size !== undefined) params.size = options.size;
          const result = await listSku(client, params);
          info(`共 ${result.totalSize} 条 SKU`);
          for (const item of result.rows) {
            const priceStr = item.price !== undefined ? `¥${item.price}` : '-';
            const stockStr = item.stock !== undefined ? `${item.stock}` : '-';
            info(`  [${item.skuId}] ${item.name} | 价格:${priceStr} | 库存:${stockStr} | SPU:${item.spuId}`);
          }
          if (result.totalSize > 0) {
            success(`第 ${result.pageIndex}/${result.totalPage} 页，每页 ${result.pageSize} 条`);
          }
        }
      } catch (e: unknown) {
        error(e);
      }
    });

  // sku create --spu-id <id> --name xxx --price <price> [--sku-code xxx] [--stock N] [--weight W] [--unit 台]
  sku
    .command('create')
    .description('创建 SKU')
    .requiredOption('--spu-id <id>', 'SPU ID')
    .requiredOption('--name <name>', 'SKU 名称')
    .requiredOption('--price <price>', '价格')
    .option('--sku-code <code>', 'SKU 编码')
    .option('--stock <n>', '库存', (v) => parseInt(v))
    .option('--weight <w>', '重量', (v) => parseFloat(v))
    .option('--unit <unit>', '单位')
    .action(async (options) => {
      try {
        const client = new ApiClient(getApiUrl());
        const dto: CreateSkuDto = {
          spu: options.spuId,
          name: options.name,
          price: parseFloat(options.price),
        };
        if (options.skuCode) dto.skuCode = options.skuCode;
        if (options.stock !== undefined) dto.stock = options.stock;
        if (options.weight !== undefined) dto.weight = options.weight;
        if (options.unit) dto.unit = options.unit;
        const skuId = await createSku(client, dto);
        success(`SKU 创建成功: ${skuId}`);
      } catch (e: unknown) {
        error(e);
      }
    });

  // sku update --sku <id> [--name xxx] [--price <price>] [--stock <n>] [--weight <w>]
  sku
    .command('update')
    .description('更新 SKU')
    .requiredOption('--sku <id>', 'SKU ID')
    .option('--name <name>', 'SKU 名称')
    .option('--price <price>', '价格')
    .option('--stock <n>', '库存', (v) => parseInt(v))
    .option('--weight <w>', '重量', (v) => parseFloat(v))
    .option('--unit <unit>', '单位')
    .option('--sku-code <code>', 'SKU 编码')
    .action(async (options) => {
      try {
        const client = new ApiClient(getApiUrl());
        const dto: UpdateSkuDto = {};
        if (options.name) dto.name = options.name;
        if (options.price !== undefined) dto.price = parseFloat(options.price);
        if (options.stock !== undefined) dto.stock = options.stock;
        if (options.weight !== undefined) dto.weight = parseFloat(options.weight);
        if (options.unit) dto.unit = options.unit;
        if (options.skuCode) dto.skuCode = options.skuCode;
        await updateSku(client, options.sku, dto);
        success(`SKU 更新成功: ${options.sku}`);
      } catch (e: unknown) {
        error(e);
      }
    });

  // sku delete --sku <id>
  sku
    .command('delete')
    .description('删除 SKU')
    .requiredOption('--sku <id>', 'SKU ID')
    .action(async (options) => {
      try {
        const client = new ApiClient(getApiUrl());
        await deleteSku(client, options.sku);
        success(`SKU 删除成功: ${options.sku}`);
      } catch (e: unknown) {
        error(e);
      }
    });

  // sku clone --sku <id> [--name xxx]
  sku
    .command('clone')
    .description('克隆 SKU')
    .requiredOption('--sku <id>', '源 SKU ID')
    .option('--name <name>', '新 SKU 名称')
    .action(async (options) => {
      try {
        const client = new ApiClient(getApiUrl());
        const newSkuId = await cloneSku(client, options.sku, options.name);
        success(`SKU 克隆成功，新 SKU ID: ${newSkuId}`);
      } catch (e: unknown) {
        error(e);
      }
    });

  // sku spec-values get --sku <id>
  // sku spec-values set --sku <id> --spec-id <id> --param-id <id>
  const specValues = sku
    .command('spec-values')
    .description('SKU 规格值');

  specValues
    .command('get')
    .description('获取 SKU 规格值')
    .requiredOption('--sku <id>', 'SKU ID')
    .action(async (options) => {
      try {
        const client = new ApiClient(getApiUrl());
        const values = await getSkuSpecValues(client, options.sku);
        if (!values.length) {
          info('暂无规格值');
        } else {
          for (const v of values) {
            info(`  [specId:${v.specId}] ${v.specName} → [paramId:${v.paramId}] ${v.paramName}`);
          }
        }
        success(`共 ${values.length} 条规格值`);
      } catch (e: unknown) {
        error(e);
      }
    });

  specValues
    .command('set')
    .description('设置 SKU 规格值')
    .requiredOption('--sku <id>', 'SKU ID')
    .option('--spec-id <id>', '规格 ID', (v) => parseInt(v))
    .option('--param-id <id>', '参数值 ID', (v) => parseInt(v))
    .option('--data <json>', '批量 JSON：[{specId:1,paramId:10}]（可多次 --spec-id + --param-id 替代）')
    .action(async (options) => {
      try {
        const client = new ApiClient(getApiUrl());
        let specs: SpecItem[];
        if (options.data) {
          specs = JSON.parse(options.data);
        } else if (options.specId !== undefined && options.paramId !== undefined) {
          specs = [{ specId: options.specId, paramId: options.paramId }];
        } else {
          error('请提供 --data <json> 或同时提供 --spec-id 和 --param-id');
          return;
        }
        await saveSkuSpecValues(client, options.sku, specs);
        success('SKU 规格值保存成功');
      } catch (e: unknown) {
        error(e);
      }
    });

  // sku extra-columns get --sku <id>
  // sku extra-columns set --sku <id> --key <key> --value <value>
  const extraColumns = sku
    .command('extra-columns')
    .description('SKU 扩展字段');

  extraColumns
    .command('get')
    .description('获取 SKU 扩展字段')
    .requiredOption('--sku <id>', 'SKU ID')
    .action(async (options) => {
      try {
        const client = new ApiClient(getApiUrl());
        const cols = await getSkuExtraColumns(client, options.sku);
        if (!cols.length) {
          info('暂无扩展字段');
        } else {
          for (const col of cols) {
            info(`  [${col.columnKey}] ${col.columnTitle} (${col.columnType}): ${col.columnValue}`);
          }
        }
        success(`共 ${cols.length} 个扩展字段`);
      } catch (e: unknown) {
        error(e);
      }
    });

  extraColumns
    .command('set')
    .description('设置 SKU 扩展字段')
    .requiredOption('--sku <id>', 'SKU ID')
    .option('--key <key>', '字段 key')
    .option('--value <value>', '字段值')
    .option('--data <json>', '批量 JSON：{key1:"值1",key2:"值2"}（可多次 --key + --value 替代）')
    .action(async (options) => {
      try {
        const client = new ApiClient(getApiUrl());
        let data: Record<string, string>;
        if (options.data) {
          data = JSON.parse(options.data);
        } else if (options.key && options.value !== undefined) {
          data = { [options.key]: options.value };
        } else {
          error('请提供 --data <json> 或同时提供 --key 和 --value');
          return;
        }
        await saveSkuExtraColumns(client, options.sku, data);
        success('SKU 扩展字段保存成功');
      } catch (e: unknown) {
        error(e);
      }
    });
}
