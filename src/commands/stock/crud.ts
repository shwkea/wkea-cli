import { Command } from 'commander';
import { ApiClient } from '../../api/client';
import {
  listStock,
  addStock,
  modifyStock,
  deleteStock,
  switchUnit,
  automaticSplitting,
  expiredProducts,
  productsOver60DaysOld,
  moveExpiredInventory,
  moveOver60DaysToDiscount,
  buyInfo,
  listWarehouses,
  warehouseDetail,
  addOrUpdateWarehouse,
  deleteWarehouse,
  skuExistStock,
} from '../../api/stock';
import { formatJsonWithFields, formatOperation } from '../../utils/formatter';
import { success, error } from '../../utils/printer';
import { getApiUrl } from '../../config';

const STOCK_FIELDS = [
  { field: 'id', type: 'number', desc: '库存ID' },
  { field: 'sku', type: 'string', desc: 'SKU' },
  { field: 'productName', type: 'string', desc: '产品名称' },
  { field: 'model', type: 'string', desc: '型号' },
  { field: 'warehouseName', type: 'string', desc: '仓库' },
  { field: 'stock', type: 'number', desc: '库存数量' },
  { field: 'location', type: 'string', desc: '库位号' },
  { field: 'skuUnit', type: 'number', desc: '单位' },
  { field: 'productionDate', type: 'string', desc: '生产日期' },
  { field: 'expiryDate', type: 'string', desc: '过期日期' },
];

const WAREHOUSE_FIELDS = [
  { field: 'id', type: 'number', desc: '仓库ID' },
  { field: 'name', type: 'string', desc: '仓库名称' },
  { field: 'type', type: 'number', desc: '仓库类型' },
  { field: 'status', type: 'number', desc: '状态' },
];

const EXPIRED_FIELDS = [
  { field: 'id', type: 'number', desc: '库存ID' },
  { field: 'sku', type: 'string', desc: 'SKU' },
  { field: 'productName', type: 'string', desc: '产品名称' },
  { field: 'stock', type: 'number', desc: '库存数量' },
  { field: 'expiryDate', type: 'string', desc: '过期日期' },
  { field: 'remainingDays', type: 'number', desc: '剩余天数' },
];

const BUY_INFO_FIELDS = [
  { field: 'totalBuyQuantity', type: 'number', desc: '总买入数量' },
  { field: 'totalSellQuantity', type: 'number', desc: '总卖出数量' },
  { field: 'totalBuyAmount', type: 'number', desc: '总买入金额' },
  { field: 'totalSellAmount', type: 'number', desc: '总卖出金额' },
];

export function registerStockCommands(program: Command) {

  // ========== 库存 CRUD ==========

  // list
  program
    .command('list')
    .description('库存列表（分页）')
    .option('--page-num <number>', '页码（默认1）', '1')
    .option('--page-size <number>', '每页条数（默认20）', '20')
    .option('--sku <sku>', 'SKU')
    .option('--warehouse-id <number>', '仓库ID')
    .option('--name <name>', '产品名称')
    .option('--location <location>', '库位号')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        const dto: any = { pageNum: parseInt(opts.pageNum), pageSize: parseInt(opts.pageSize) };
        if (opts.sku) dto.sku = opts.sku;
        if (opts.warehouseId) dto.warehouseId = parseInt(opts.warehouseId);
        if (opts.name) dto.name = opts.name;
        if (opts.location) dto.location = opts.location;
        const data = await listStock(client, dto);
        console.log(formatJsonWithFields(data, STOCK_FIELDS));
      } catch (e: any) {
        error(e);
        process.exit(1);
      }
    });

  // add
  program
    .command('add')
    .description('新增库存（默认入临时仓库）')
    .requiredOption('--sku <sku>', 'SKU（如 W000000001）')
    .requiredOption('--stock <number>', '库存数量')
    .option('--warehouse-id <number>', '仓库ID（不传则入临时仓库）')
    .option('--location <location>', '库位号')
    .option('--unit <number>', '单位')
    .option('--production-date <datetime>', '生产日期/批次（如 2026-05-01T00:00:00）')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        const dto: any = {
          productSkuId: opts.sku,
          stock: parseInt(opts.stock),
        };
        if (opts.warehouseId) dto.warehouseId = parseInt(opts.warehouseId);
        if (opts.location) dto.location = opts.location;
        if (opts.unit) dto.skuUnit = parseInt(opts.unit);
        if (opts.productionDate) dto.productionDate = opts.productionDate;
        await addStock(client, dto);
        success(formatOperation('新增库存'));
      } catch (e: any) {
        error(e);
        process.exit(1);
      }
    });

  // modify
  program
    .command('modify')
    .description('修改库存')
    .requiredOption('--id <number>', '库存ID（必填）')
    .option('--stock <number>', '库存数量')
    .option('--location <location>', '库位号')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        const dto: any = { id: parseInt(opts.id) };
        if (opts.stock) dto.stock = parseInt(opts.stock);
        if (opts.location) dto.location = opts.location;
        await modifyStock(client, dto);
        success(formatOperation('修改库存'));
      } catch (e: any) {
        error(e);
        process.exit(1);
      }
    });

  // delete
  program
    .command('delete')
    .description('删除库存')
    .requiredOption('--id <number>', '库存ID（必填）')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        await deleteStock(client, parseInt(opts.id));
        success(formatOperation('删除库存'));
      } catch (e: any) {
        error(e);
        process.exit(1);
      }
    });

  // ========== 库存业务操作 ==========

  // switch-unit
  program
    .command('switch-unit')
    .description('拆分包装（将大包装拆成小单位）')
    .requiredOption('--stock-id <number>', '库存ID')
    .requiredOption('--old-quantity <number>', '原单位数量')
    .requiredOption('--new-unit <number>', '新单位')
    .requiredOption('--new-quantity <number>', '新数量')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        await switchUnit(client, {
          id: parseInt(opts.stockId),
          oldAmount: parseInt(opts.oldQuantity),
          newUnit: parseInt(opts.newUnit),
          newAmount: parseInt(opts.newQuantity),
        });
        success(formatOperation('拆分包装'));
      } catch (e: any) {
        error(e);
        process.exit(1);
      }
    });

  // automatic-splitting
  program
    .command('automatic-splitting')
    .description('自动拆分（传入需要发出的数量，系统自动拆分）')
    .requiredOption('--stock-id <number>', '库存ID')
    .requiredOption('--quantity <number>', '需要拆分的数量')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        await automaticSplitting(client, {
          stockId: parseInt(opts.stockId),
          sentNum: parseInt(opts.quantity),
        });
        success(formatOperation('自动拆分'));
      } catch (e: any) {
        error(e);
        process.exit(1);
      }
    });

  // expired
  program
    .command('expired')
    .description('快过期产品列表')
    .option('--days <number>', '剩余天数阈值（如30天）')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        const dto = opts.days ? { days: parseInt(opts.days) } : undefined;
        const data = await expiredProducts(client, dto);
        console.log(formatJsonWithFields(data, EXPIRED_FIELDS));
      } catch (e: any) {
        error(e);
        process.exit(1);
      }
    });

  // over-60-days
  program
    .command('over-60-days')
    .description('库龄超过60天的产品列表')
    .action(async () => {
      const client = new ApiClient(getApiUrl());
      try {
        const data = await productsOver60DaysOld(client);
        console.log(formatJsonWithFields(data, EXPIRED_FIELDS));
      } catch (e: any) {
        error(e);
        process.exit(1);
      }
    });

  // move-expired
  program
    .command('move-expired')
    .description('将临期库存转移到临期库位')
    .requiredOption('--stock-id <number>', '库存ID')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        await moveExpiredInventory(client, parseInt(opts.stockId));
        success(formatOperation('转移临期库存'));
      } catch (e: any) {
        error(e);
        process.exit(1);
      }
    });

  // move-over-60-days
  program
    .command('move-over-60-days')
    .description('将超60天库存转移到折扣库位')
    .requiredOption('--stock-id <number>', '库存ID')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        await moveOver60DaysToDiscount(client, parseInt(opts.stockId));
        success(formatOperation('转移超60天库存'));
      } catch (e: any) {
        error(e);
        process.exit(1);
      }
    });

  // buy-info
  program
    .command('buy-info')
    .description('查看SKU的买入/卖出统计')
    .requiredOption('--sku <sku>', 'SKU（必填）')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        const data = await buyInfo(client, opts.sku);
        console.log(formatJsonWithFields(data, BUY_INFO_FIELDS));
      } catch (e: any) {
        error(e);
        process.exit(1);
      }
    });

  // ========== 仓库操作 ==========

  // warehouses
  program
    .command('warehouses')
    .description('仓库列表')
    .option('--name <name>', '按名称筛选')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        const data = await listWarehouses(client, opts.name);
        console.log(formatJsonWithFields(data, WAREHOUSE_FIELDS));
      } catch (e: any) {
        error(e);
        process.exit(1);
      }
    });

  // warehouse-detail
  program
    .command('warehouse-detail')
    .description('仓库详情')
    .requiredOption('--id <number>', '仓库ID')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        const data = await warehouseDetail(client, parseInt(opts.id));
        console.log(formatJsonWithFields(data, WAREHOUSE_FIELDS));
      } catch (e: any) {
        error(e);
        process.exit(1);
      }
    });

  // add-warehouse
  program
    .command('add-warehouse')
    .description('新增仓库')
    .requiredOption('--name <name>', '仓库名称')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        const dto: any = { name: opts.name };
        await addOrUpdateWarehouse(client, dto);
        success(formatOperation('新增仓库'));
      } catch (e: any) {
        error(e);
        process.exit(1);
      }
    });

  // delete-warehouse
  program
    .command('delete-warehouse')
    .description('删除仓库')
    .requiredOption('--id <number>', '仓库ID')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        await deleteWarehouse(client, parseInt(opts.id));
        success(formatOperation('删除仓库'));
      } catch (e: any) {
        error(e);
        process.exit(1);
      }
    });

  // sku-exist
  program
    .command('sku-exist')
    .description('查询SKU是否存在库存')
    .requiredOption('--sku <sku>', 'SKU')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        const data = await skuExistStock(client, opts.sku);
        console.log(formatJsonWithFields(data, []));
      } catch (e: any) {
        error(e);
        process.exit(1);
      }
    });
}
