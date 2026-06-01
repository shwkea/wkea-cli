import { Command } from 'commander';
import { ApiClient } from '../../api/client';
import {
  createDemand,
  getDemandDetail,
  updateDemand,
  deleteDemand,
  simpleCreateProduct,
  quoteToVendor,
  getVendorsByBrand,
  getDemandItems,
  addDemandItem,
  updateDemandItem,
  deleteDemandItem,
  completeDemandItem,
} from '../../api/demand';
import { formatJsonWithFields, formatOperation } from '../../utils/formatter';
import { success, error, info } from '../../utils/printer';
import { getApiUrl } from '../../config';
import { unescapeShellArg } from '../../utils/string';

const DEMAND_FIELDS = [
  { field: 'id', type: 'number', desc: '需求ID' },
  { field: 'type', type: 'number', desc: '类型(1需求清单,2询价单)' },
  { field: 'customerId', type: 'string', desc: '客户ID' },
  { field: 'customerName', type: 'string', desc: '客户名称' },
  { field: 'manageId', type: 'string', desc: '客户经理ID' },
  { field: 'status', type: 'number', desc: '状态(274待处理 275处理中 276已完成 291已取消)' },
  { field: 'topic', type: 'string', desc: '主题' },
  { field: 'remark', type: 'string', desc: '备注' },
  { field: 'customerRemark', type: 'string', desc: '客户备注' },
  { field: 'channelSource', type: 'string', desc: '渠道来源' },
  { field: 'customerSource', type: 'string', desc: '客户来源' },
  { field: 'vendorRemark', type: 'string', desc: '供应商询价备注' },
  { field: 'annex', type: 'string', desc: '附件' },
  { field: 'effectiveTime', type: 'string', desc: '报价有效时间' },
  { field: 'lastQuoteTime', type: 'string', desc: '最后报价时间' },
  { field: 'finishTime', type: 'string', desc: '完成时间' },
  { field: 'isRushing', type: 'boolean', desc: '是否催报价' },
  { field: 'lateRemark', type: 'string', desc: '逾期原因' },
  { field: 'deepSearchStatus', type: 'string', desc: '深度搜索状态' },
  { field: 'taskId', type: 'number', desc: '任务ID' },
  { field: 'createdTime', type: 'string', desc: '创建时间' },
  { field: 'createdByName', type: 'string', desc: '创建人' },
  { field: 'order', type: 'number', desc: '排序(置顶)' },
  { field: 'items', type: 'array', desc: '行项目列表' },
];

const DEMAND_ITEM_FIELDS = [
  { field: 'id', type: 'number', desc: '行项目ID' },
  { field: 'productName', type: 'string', desc: '产品名称' },
  { field: 'productBrand', type: 'string', desc: '产品品牌' },
  { field: 'productModel', type: 'string', desc: '产品型号' },
  { field: 'productCategory', type: 'string', desc: '产品分类' },
  { field: 'quantity', type: 'number', desc: '数量' },
  { field: 'productUnit', type: 'string', desc: '产品单位' },
  { field: 'expectPrice', type: 'number', desc: '期望价格' },
  { field: 'finalSkuPrice', type: 'number', desc: 'SKU价格' },
  { field: 'grossMargin', type: 'number', desc: '毛利率' },
  { field: 'status', type: 'number', desc: '状态(0未完成,1已完成)' },
  { field: 'remark', type: 'string', desc: '客户备注' },
  { field: 'toVendorRemark', type: 'string', desc: '供应商备注' },
  { field: 'skuId', type: 'string', desc: 'SKU ID' },
  { field: 'deepSearchStatus', type: 'string', desc: '搜索状态' },
  { field: 'aiRemark', type: 'string', desc: 'AI备注' },
];

export function registerCrudCommands(demand: Command) {

  // create
  demand
    .command('create')
    .description('创建需求询价')
    .option('--customer-id <id>', '客户ID（可不填，默认为自己是客户）')
    .option('--topic <topic>', '主题（不填则默认取第一个行项目产品名称）')
    .option('--type <type>', '类型(1需求清单,2询价单)，默认1', '1')
    .option('--notification-type <type>', '通知类型(1每日通知,2进度通知)')
    .option('--manage-id <id>', '客户经理ID')
    .option('--customer-remark <remark>', '客户备注')
    .option('--annex <url>', '附件链接')
    .option('--effective-time <date>', '报价有效时间，如 2026-05-15')
    .option('--vendor-remark <remark>', '供应商询价备注')
    .option('--channel-source <source>', '渠道来源，如 淘宝-维嘉、1688、微信、邮箱、线下、其他')
    .option('--customer-source <name>', '客户来源（客户姓名）')
    .option('--items <json>', '行项目JSON数组：[{"productName":"...","quantity":5}]')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        const dto: Record<string, unknown> = {
          customerId: opts.customerId,
          type: parseInt(opts.type),
        };
        if (opts.topic) dto.topic = opts.topic;
        if (opts.notificationType) dto.notificationType = parseInt(opts.notificationType);
        if (opts.manageId) dto.manageId = opts.manageId;
        if (opts.customerRemark) dto.customerRemark = opts.customerRemark;
        if (opts.annex) dto.annex = opts.annex;
        if (opts.effectiveTime) dto.effectiveTime = opts.effectiveTime;
        if (opts.vendorRemark) dto.vendorRemark = opts.vendorRemark;
        if (opts.channelSource) dto.channelSource = opts.channelSource;
        if (opts.customerSource) dto.customerSource = opts.customerSource;
        if (opts.items) dto.items = JSON.parse(opts.items);
        const id = await createDemand(client, dto as any);
        success(`创建成功，需求ID: ${id}`);
      } catch (e: any) {
        error(e);
        process.exit(1);
      }
    });

  // get
  demand
    .command('get')
    .description('查询需求询价详情')
    .requiredOption('--id <id>', '需求ID（必填）')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        const data = await getDemandDetail(client, parseInt(opts.id));
        console.log(formatJsonWithFields(data, DEMAND_FIELDS));
      } catch (e: any) {
        error(e);
        process.exit(1);
      }
    });

  // update
  demand
    .command('update')
    .description('更新需求询价')
    .requiredOption('--id <id>', '需求ID（必填）')
    .option('--type <type>', '类型(1需求清单,2询价单)')
    .option('--notification-type <type>', '通知类型(1每日通知,2进度通知)')
    .option('--customer-id <id>', '客户ID')
    .option('--topic <topic>', '主题')
    .option('--customer-remark <remark>', '客户备注')
    .option('--annex <url>', '附件链接')
    .option('--effective-time <date>', '报价有效时间，如 2026-05-15')
    .option('--vendor-remark <remark>', '供应商询价备注')
    .option('--channel-source <source>', '渠道来源，如 淘宝-维嘉、1688、微信、邮箱、线下、其他')
    .option('--customer-source <name>', '客户来源（客户姓名）')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        const dto: Record<string, unknown> = {};
        if (opts.type) dto.type = parseInt(opts.type);
        if (opts.notificationType) dto.notificationType = parseInt(opts.notificationType);
        if (opts.customerId) dto.customerId = opts.customerId;
        if (opts.topic) dto.topic = opts.topic;
        if (opts.customerRemark) dto.customerRemark = opts.customerRemark;
        if (opts.annex) dto.annex = opts.annex;
        if (opts.effectiveTime) dto.effectiveTime = opts.effectiveTime;
        if (opts.vendorRemark) dto.vendorRemark = opts.vendorRemark;
        if (opts.channelSource) dto.channelSource = opts.channelSource;
        if (opts.customerSource) dto.customerSource = opts.customerSource;
        await updateDemand(client, parseInt(opts.id), dto as any);
        success(formatOperation('更新'));
      } catch (e: any) {
        error(e);
        process.exit(1);
      }
    });

  // delete
  demand
    .command('delete')
    .description('删除需求询价')
    .requiredOption('--id <id>', '需求ID（必填）')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        await deleteDemand(client, parseInt(opts.id));
        success(formatOperation('删除'));
      } catch (e: any) {
        error(e);
        process.exit(1);
      }
    });

  // items
  demand
    .command('items')
    .description('查看需求行项目列表')
    .requiredOption('--demand-id <id>', '需求ID（必填）')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        const data = await getDemandItems(client, parseInt(opts.demandId));
        console.log(formatJsonWithFields(data, DEMAND_ITEM_FIELDS));
      } catch (e: any) {
        error(e);
        process.exit(1);
      }
    });

  // add-item
  demand
    .command('add-item')
    .description('添加行项目')
    .requiredOption('--demand-id <id>', '需求ID（必填）')
    .requiredOption('--product-name <name>', '产品名称（必填）')
    .requiredOption('--quantity <qty>', '数量（必填）')
    .option('--product-brand <brand>', '品牌')
    .option('--product-model <model>', '型号')
    .option('--product-category <cat>', '分类')
    .option('--product-unit <unit>', '产品单位（枚举ID: 单位，先运行 enum --type 单位 查看可用值）')
    .option('--expect-price <price>', '期望价格')
    .option('--expect-delivery <date>', '期望交期')
    .option('--sku-id <id>', 'SKU ID')
    .option('--remark <remark>', '客户备注')
    .option('--to-vendor-remark <remark>', '供应商备注')
    .option('--original-text <text>', '客户原文（parse_demand 返回的原始文本）')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        
        const dto: Record<string, unknown> = { productName: opts.productName, quantity: parseInt(opts.quantity) };
        if (opts.productBrand) dto.productBrand = opts.productBrand;
        if (opts.productModel) dto.productModel = opts.productModel;
        if (opts.productCategory) dto.productCategory = opts.productCategory;
        if (opts.productUnit) dto.productUnit = opts.productUnit;
        if (opts.expectPrice) dto.expectPrice = parseFloat(opts.expectPrice);
        if (opts.expectDelivery) dto.expectDelivery = opts.expectDelivery;
        if (opts.skuId) dto.skuId = opts.skuId;
        if (opts.remark) dto.remark = opts.remark;
        if (opts.toVendorRemark) dto.toVendorRemark = opts.toVendorRemark;
        if (opts.originalText) dto.originalText = opts.originalText;
        const itemId = await addDemandItem(client, parseInt(opts.demandId), dto as any);
        success('行项目添加成功，ID: ' + itemId);
      } catch (e: any) {
        error(e);
        process.exit(1);
      }
    });

  // update-item
  demand
    .command('update-item')
    .description('修改行项目')
    .requiredOption('--item-id <id>', '行项目ID（必填）')
    .option('--product-name <name>', '产品名称')
    .option('--product-brand <brand>', '品牌')
    .option('--product-model <model>', '型号')
    .option('--product-category <cat>', '分类')
    .option('--quantity <qty>', '数量')
    .option('--product-unit <unit>', '产品单位（枚举ID: 单位，先运行 enum --type 单位 查看可用值）')
    .option('--expect-price <price>', '期望价格')
    .option('--expect-delivery <date>', '期望交期')
    .option('--sku-id <id>', 'SKU ID')
    .option('--remark <remark>', '客户备注')
    .option('--to-vendor-remark <remark>', '供应商备注')
    .option('--final-sku-price <price>', 'SKU价格')
    .option('--gross-margin <pct>', '毛利率')
    .option('--ai-remark <remark>', 'AI备注')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        
        const dto: Record<string, unknown> = {};
        if (opts.productName) dto.productName = opts.productName;
        if (opts.productBrand) dto.productBrand = opts.productBrand;
        if (opts.productModel) dto.productModel = opts.productModel;
        if (opts.productCategory) dto.productCategory = opts.productCategory;
        if (opts.quantity) dto.quantity = parseInt(opts.quantity);
        if (opts.productUnit) dto.productUnit = opts.productUnit;
        if (opts.expectPrice) dto.expectPrice = parseFloat(opts.expectPrice);
        if (opts.expectDelivery) dto.expectDelivery = opts.expectDelivery;
        if (opts.skuId) dto.skuId = opts.skuId;
        if (opts.remark) dto.remark = opts.remark;
        if (opts.toVendorRemark) dto.toVendorRemark = opts.toVendorRemark;
        if (opts.finalSkuPrice) dto.finalSkuPrice = parseFloat(opts.finalSkuPrice);
        if (opts.grossMargin) dto.grossMargin = parseInt(opts.grossMargin);
        if (opts.aiRemark) dto.aiRemark = unescapeShellArg(opts.aiRemark);
        await updateDemandItem(client, parseInt(opts.itemId), dto as any);
        success(formatOperation('更新行项目'));
      } catch (e: any) {
        error(e);
        process.exit(1);
      }
    });

  // delete-item
  demand
    .command('delete-item')
    .description('删除行项目')
    .requiredOption('--item-id <id>', '行项目ID（必填）')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        
        await deleteDemandItem(client, parseInt(opts.itemId));
        success(formatOperation('删除行项目'));
      } catch (e: any) {
        error(e);
        process.exit(1);
      }
    });

  // complete-item
  demand
    .command('complete-item')
    .description('完成行项目')
    .requiredOption('--item-id <id>', '行项目ID（必填）')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        
        await completeDemandItem(client, parseInt(opts.itemId));
        success(formatOperation('完成行项目'));
      } catch (e: any) {
        error(e);
        process.exit(1);
      }
    });

  // simple-create-product
  demand
    .command('simple-create-product')
    .description('一键上架（行项目转产品）')
    .requiredOption('--id <id>', '需求ID（必填）')
    .option('--line-id-list <ids>', '行项目ID列表，逗号分隔（默认全部）')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        const lineIds = opts.lineIdList ? opts.lineIdList.split(',').map(Number) : undefined;
        await simpleCreateProduct(client, parseInt(opts.id), lineIds);
        success(formatOperation('一键上架'));
      } catch (e: any) {
        error(e);
        process.exit(1);
      }
    });

  // quote-to-vendor
  demand
    .command('quote-to-vendor')
    .description('向供应商询价')
    .requiredOption('--id <id>', '需求ID（必填）')
    .requiredOption('--vendor-id <id>', '供应商ID（必填）')
    .requiredOption('--item-ids <ids>', '行项目ID列表，逗号分隔（必填），指定要对哪些产品询价')
    .option('--no-message', '不发送通知给供应商（默认发送通知）')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        const dto: Record<string, unknown> = {
          vendorId: opts.vendorId,
          itemIds: opts.itemIds.split(',').map(Number),
        };
        dto.sendDemandQuoteMessage = opts.noMessage ? false : true;
        await quoteToVendor(client, parseInt(opts.id), dto as any);
        success(formatOperation('向供应商询价'));
      } catch (e: any) {
        error(e);
        process.exit(1);
      }
    });

  // vendors-by-brand
  demand
    .command('vendors-by-brand')
    .description('按品牌查询绑定供应商')
    .requiredOption('--brand-id <id>', '品牌ID（必填）')
    .option('--all', '查询全部供应商（默认仅主要供应商）')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        const data = await getVendorsByBrand(client, parseInt(opts.brandId), opts.all);
        console.log(formatJsonWithFields(data, [
          { field: 'vendorId', type: 'number', desc: '供应商ID' },
          { field: 'name', type: 'string', desc: '供应商名称' },
          { field: 'contact', type: 'string', desc: '联系方式' },
          { field: 'isMain', type: 'boolean', desc: '是否为主供应商' },
        ]));
      } catch (e: any) {
        error(e);
        process.exit(1);
      }
    });
}
