import { Command } from 'commander';
import { getApiUrl } from '../../config';
import { ApiClient } from '../../api/client';
import {
  bindSpuVendors,
  unbindSpuVendor,
  getSpuVendors,
  getSpuSupplyList,
  setSupply,
  listSupplies,
  getSupply,
  deleteSupply,
  batchSetSupply,
  getSupplySummary,
} from '../../api/product/supply';
import { formatDetail, formatOperation } from '../../utils/formatter';
import { success, error } from '../../utils/printer';

export function supplyCommands(product: Command) {
  const supply = product
    .command('supply')
    .description('供应信息管理（SPU 供应商绑定 + SKU 供应信息）');

  // ============ SPU 供应商绑定 ============

  supply
    .command('bind-vendor')
    .description('SPU 绑定供应商')
    .requiredOption('--spu-id <id>', 'SPU ID')
    .requiredOption('--vendor-id <id>', '供应商ID')
    .option('--remark <remark>', '备注')
    .action(async (options) => {
      const client = new ApiClient(getApiUrl());
      try {
        const result = await bindSpuVendors(client, options.spuId, options.vendorId, options.remark);
        success(`绑定成功：新增 ${result.addedCount}，跳过 ${result.skippedCount}`);
      } catch (e: any) {
    error(e);
        process.exit(1);
      }
    });

  supply
    .command('unbind-vendor')
    .description('SPU 解绑供应商')
    .requiredOption('--spu-id <id>', 'SPU ID')
    .requiredOption('--vendor-id <id>', '供应商ID')
    .action(async (options) => {
      const client = new ApiClient(getApiUrl());
      try {
        await unbindSpuVendor(client, options.spuId, options.vendorId);
        success(formatOperation('解绑'));
      } catch (e: any) {
    error(e);
        process.exit(1);
      }
    });

  supply
    .command('vendors')
    .description('查询 SPU 绑定的供应商列表')
    .requiredOption('--spu-id <id>', 'SPU ID')
    .action(async (options) => {
      const client = new ApiClient(getApiUrl());
      try {
        const vendors = await getSpuVendors(client, options.spuId);
        console.log(JSON.stringify(vendors, null, 2));
      } catch (e: any) {
    error(e);
        process.exit(1);
      }
    });

  supply
    .command('supply-list')
    .description('查询 SPU 的供应列表（含供应商+SKU供应信息）')
    .requiredOption('--spu-id <id>', 'SPU ID')
    .action(async (options) => {
      const client = new ApiClient(getApiUrl());
      try {
        const data = await getSpuSupplyList(client, options.spuId);
        console.log(JSON.stringify(data, null, 2));
      } catch (e: any) {
    error(e);
        process.exit(1);
      }
    });

  // ============ SKU 供应信息 ============

  const skuSupply = supply
    .command('sku')
    .description('SKU 供应信息管理');

  skuSupply
    .command('set')
    .description('设置 SKU 供应信息')
    .requiredOption('--sku-id <id>', 'SKU ID')
    .requiredOption('--vendor-id <id>', '供应商ID')
    .option('--sales-price <price>', '销售价')
    .option('--purchase-price <price>', '采购价')
    .option('--purchase-deliver <days>', '采购交期（天）')
    .option('--stock <stock>', '库存')
    .option('--order-number <num>', '订货号')
    .option('--model <model>', '型号')
    .option('--shipping-location <loc>', '发货地')
    .option('--remark <remark>', '备注')
    .action(async (options) => {
      const client = new ApiClient(getApiUrl());
      try {
        await setSupply(client, options.skuId, {
          vendorsId: options.vendorId as string,
          salesPrice: options.salesPrice !== undefined ? parseFloat(options.salesPrice) : undefined,
          purchasePrice: options.purchasePrice !== undefined ? parseFloat(options.purchasePrice) : undefined,
          purchaseDeliver: options.purchaseDeliver !== undefined ? parseInt(options.purchaseDeliver) : undefined,
          stock: options.stock !== undefined ? parseInt(options.stock) : undefined,
          orderNumber: options.orderNumber,
          model: options.model,
          shippingLocation: options.shippingLocation,
          remark: options.remark,
        });
        success(formatOperation('设置', 'SKU 供应信息'));
      } catch (e: any) {
    error(e);
        process.exit(1);
      }
    });

  skuSupply
    .command('list')
    .description('查询 SKU 的供应信息列表')
    .requiredOption('--sku-id <id>', 'SKU ID')
    .action(async (options) => {
      const client = new ApiClient(getApiUrl());
      try {
        const supplies = await listSupplies(client, options.skuId);
        console.log(JSON.stringify(supplies, null, 2));
      } catch (e: any) {
    error(e);
        process.exit(1);
      }
    });

  skuSupply
    .command('get')
    .description('获取 SKU 指定供应商的供应信息')
    .requiredOption('--sku-id <id>', 'SKU ID')
    .requiredOption('--vendor-id <id>', '供应商ID')
    .action(async (options) => {
      const client = new ApiClient(getApiUrl());
      try {
        const supply = await getSupply(client, options.skuId, options.vendorId);
        if (!supply) {
          error('未找到该供应信息');
          process.exit(1);
        }
        console.log(JSON.stringify(supply, null, 2));
      } catch (e: any) {
    error(e);
        process.exit(1);
      }
    });

  skuSupply
    .command('delete')
    .description('删除 SKU 供应信息')
    .requiredOption('--sku-id <id>', 'SKU ID')
    .requiredOption('--vendor-id <id>', '供应商ID')
    .action(async (options) => {
      const client = new ApiClient(getApiUrl());
      try {
        await deleteSupply(client, options.skuId, options.vendorId);
        success(formatOperation('删除', 'SKU 供应信息'));
      } catch (e: any) {
    error(e);
        process.exit(1);
      }
    });

  skuSupply
    .command('batch')
    .description('批量设置 SKU 供应信息')
    .requiredOption('--sku-id <id>', 'SKU ID')
    .requiredOption('--items <json>', '批量 JSON：[{"vendorsId":"V001","salesPrice":100,"purchasePrice":80,"stock":50}]')
    .action(async (options) => {
      const client = new ApiClient(getApiUrl());
      try {
        const items = JSON.parse(options.items);
        await batchSetSupply(client, options.skuId, items);
        success(formatOperation('批量设置', `${items.length} 条供应信息`));
      } catch (e: any) {
    error(e);
        process.exit(1);
      }
    });

  skuSupply
    .command('summary')
    .description('获取 SKU 供应汇总信息')
    .requiredOption('--sku-id <id>', 'SKU ID')
    .action(async (options) => {
      const client = new ApiClient(getApiUrl());
      try {
        const summary = await getSupplySummary(client, options.skuId);
        console.log(JSON.stringify(summary, null, 2));
      } catch (e: any) {
    error(e);
        process.exit(1);
      }
    });
}
