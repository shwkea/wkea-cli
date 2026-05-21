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
import { formatJsonWithFields, formatOperation } from '../../utils/formatter';
import { success, error } from '../../utils/printer';

const VENDOR_FIELDS = [
  { field: 'vendorId', type: 'string', desc: '供应商 ID' },
  { field: 'name', type: 'string', desc: '供应商名称' },
  { field: 'remark', type: 'string', desc: '备注' },
];

const SUPPLY_DETAIL_FIELDS = [
  { field: 'vendorId', type: 'string', desc: '供应商 ID' },
  { field: 'vendorName', type: 'string', desc: '供应商名称' },
  { field: 'salesPrice', type: 'number', desc: '销售价' },
  { field: 'purchasePrice', type: 'number', desc: '采购价' },
  { field: 'purchaseDeliver', type: 'number', desc: '采购交期（天）' },
  { field: 'stock', type: 'number', desc: '库存' },
  { field: 'orderNumber', type: 'string', desc: '订货号' },
  { field: 'model', type: 'string', desc: '型号' },
  { field: 'shippingLocation', type: 'string', desc: '发货地' },
  { field: 'remark', type: 'string', desc: '备注' },
  { field: 'updatedTime', type: 'datetime', desc: '更新时间' },
];

const SUPPLY_SUMMARY_FIELDS = [
  { field: 'skuId', type: 'string', desc: 'SKU ID' },
  { field: 'supplyCount', type: 'number', desc: '供应数量' },
  { field: 'minPurchasePrice', type: 'number', desc: '最低采购价' },
];

const SPU_SUPPLY_LIST_FIELDS = [
  { field: 'spuId', type: 'string', desc: 'SPU ID' },
  { field: 'spuName', type: 'string', desc: 'SPU 名称' },
  { field: 'vendors', type: 'array', desc: '绑定供应商列表' },
  { field: 'skuSupplies', type: 'array', desc: 'SKU 供应信息列表' },
];

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
        console.log(formatJsonWithFields(vendors, VENDOR_FIELDS));
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
        console.log(formatJsonWithFields(data, SPU_SUPPLY_LIST_FIELDS));
      } catch (e: any) {
    error(e);
        process.exit(1);
      }
    });


  // ============ 设置主供应商价格 ============

  supply
    .command('set-master')
    .description('设置主供应商价格（改写SKU默认售价，SKU有完全替代品则自动设到替代品上）')
    .requiredOption('--sku <sku>', 'SKU ID（必填）')
    .requiredOption('--vendor-id <id>', '供应商ID（必填）')
    .requiredOption('--price <price>', '采购单价（必填）')
    .requiredOption('--gross-margin <pct>', '毛利率（必填）')
    .option('--delivery <days>', '交期（天）')
    .option('--remark <remark>', '备注')
    .option('--stock <stock>', '供应商库存')
    .option('--shipping-location <loc>', '发货地')
    .option('--min-order-quantity <qty>', '最小起订量')
    .option('--min-order-multiple <mul>', '最小起订倍数')
    .option('--wkea-discount <ratio>', '维嘉替代品折扣比例，默认0.95')
    .option('--wkea-deliver-discount <ratio>', '维嘉替代品交期折扣比例，默认0.95')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        const { setMasterVendorPrice } = await import('../../api/demand');
        const dto: Record<string, any> = {
          sku: opts.sku,
          vendorId: opts.vendorId,
          price: parseFloat(opts.price),
          grossMargin: parseInt(opts.grossMargin),
        };
        if (opts.delivery) dto.delivery = parseInt(opts.delivery);
        if (opts.remark) dto.remark = opts.remark;
        if (opts.stock) dto.stock = parseInt(opts.stock);
        if (opts.shippingLocation) dto.shippingLocation = opts.shippingLocation;
        if (opts.minOrderQuantity) dto.minOrderQuantity = parseInt(opts.minOrderQuantity);
        if (opts.minOrderMultiple) dto.minOrderMultiple = parseInt(opts.minOrderMultiple);
        if (opts.wkeaDiscount) dto.wekaReplaceSkuDiscount = parseFloat(opts.wkeaDiscount);
        if (opts.wkeaDeliverDiscount) dto.wekaReplaceSkuDeliverDiscount = parseFloat(opts.wkeaDeliverDiscount);
        await setMasterVendorPrice(client, dto as any);
        success('主供应商价格已设置（SKU售价已更新）');
      } catch (e) {
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
    .option('--id <id>', '编号/ID（精确查询）')
    .requiredOption('--sku-id <id>', 'SKU ID')
    .action(async (options) => {
      const client = new ApiClient(getApiUrl());
      try {
        const supplies = await listSupplies(client, options.skuId);
        console.log(formatJsonWithFields(supplies, SUPPLY_DETAIL_FIELDS));
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
        console.log(formatJsonWithFields(supply, SUPPLY_DETAIL_FIELDS));
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
        console.log(formatJsonWithFields(summary, SUPPLY_SUMMARY_FIELDS));
      } catch (e: any) {
    error(e);
        process.exit(1);
      }
    });
}
