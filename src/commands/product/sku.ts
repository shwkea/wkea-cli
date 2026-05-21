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
  getSkuReplacements,
  addSkuReplacement,
  deleteSkuReplacement,
  CreateSkuDto,
  UpdateSkuDto,
  SkuListParams,
  SpecItem,
} from '../../api/product/sku';
import { formatJsonWithFields } from '../../utils/formatter';
import { success, error, info } from '../../utils/printer';

const SPEC_VALUES_FIELDS = [
  { field: 'specId', type: 'number', desc: '规格 ID' },
  { field: 'specName', type: 'string', desc: '规格名称' },
  { field: 'paramId', type: 'number', desc: '参数值 ID' },
  { field: 'paramName', type: 'string', desc: '参数值名称' },
];

const EXTRA_COLUMN_FIELDS = [
  { field: 'columnKey', type: 'string', desc: '字段 key' },
  { field: 'columnTitle', type: 'string', desc: '字段显示名' },
  { field: 'columnType', type: 'string', desc: '字段类型' },
  { field: 'columnValue', type: 'string', desc: '字段值' },
];

const SKU_DETAIL_FIELDS = [
  { field: 'skuId', type: 'string', desc: 'SKU ID' },
  { field: 'spuId', type: 'string', desc: 'SPU ID' },
  { field: 'spuName', type: 'string', desc: 'SPU 名称' },
  { field: 'name', type: 'string', desc: 'SKU 名称' },
  { field: 'skuCode', type: 'string', desc: 'SKU 编码（订货号）' },
  { field: 'price', type: 'number', desc: '销售价' },
  { field: 'actualSalesPrice', type: 'number', desc: '实际销售价' },
  { field: 'stock', type: 'number', desc: '库存' },
  { field: 'weight', type: 'number', desc: '重量(kg)' },
  { field: 'unit', type: 'string', desc: '单位' },
  { field: 'model', type: 'string', desc: '型号' },
  { field: 'images', type: 'string', desc: '图片' },
  { field: 'remark', type: 'string', desc: '备注' },
  { field: 'isShelf', type: 'boolean', desc: '是否上架' },
  { field: 'barcode', type: 'string', desc: '条码' },
  { field: 'salesDeliver', type: 'number', desc: '销售配送方式' },
  { field: 'deliveryDateType', type: 'number', desc: '发货日期类型' },
  { field: 'safetyStock', type: 'number', desc: '安全库存' },
  { field: 'ceilingStock', type: 'number', desc: '库存上限' },
  { field: 'esKeyword', type: 'string', desc: 'ES关键词' },
  { field: 'taxRate', type: 'number', desc: '税率(%)' },
  { field: 'purchaseTaxRate', type: 'number', desc: '采购税率(%)' },
  { field: 'purchaseLink', type: 'string', desc: '采购链接' },
  { field: 'replaceSku', type: 'string', desc: '替换SKU ID' },
  { field: 'itemNumber', type: 'string', desc: '货号' },
  { field: 'positionRemark', type: 'string', desc: '仓位备注' },
  { field: 'simpleDesc', type: 'string', desc: '简短描述' },
  { field: 'tagManage', type: 'number', desc: '标签管理' },
  { field: 'templateId', type: 'number', desc: '运费模板ID' },
  { field: 'life', type: 'number', desc: '有效期（天）' },
  { field: 'returnDeadline', type: 'number', desc: '退货期限（天）' },
  { field: 'salesUnit', type: 'number', desc: '销售单位' },
  { field: 'salesCount', type: 'number', desc: '销量' },
  { field: 'views', type: 'number', desc: '浏览量' },
  { field: 'imgReference', type: 'boolean', desc: '图片引用' },
  { field: 'dineInDetails', type: 'string', desc: '堂食详情' },
  { field: 'specName', type: 'string', desc: '规格名称' },
  { field: 'createdBy', type: 'string', desc: '创建人' },
  { field: 'updatedTime', type: 'datetime', desc: '更新时间' },
  { field: 'updatedBy', type: 'string', desc: '更新人' },
  { field: 'productCategoryId', type: 'number', desc: '分类ID' },
  { field: 'productCategoryName', type: 'string', desc: '分类名称' },
  { field: 'brandId', type: 'number', desc: '品牌ID' },
  { field: 'brandName', type: 'string', desc: '品牌名称' },
  { field: 'copySpu', type: 'boolean', desc: '是否复制SPU' },
  { field: 'specValues', type: 'array', desc: '规格值列表' },
  { field: 'supplies', type: 'array', desc: '供应信息摘要' },
  { field: 'extraColumns', type: 'array', desc: '扩展字段列表' },
  { field: 'createdTime', type: 'datetime', desc: '创建时间' },
];

const SKU_LIST_FIELDS = [
  { field: 'skuId', type: 'string', desc: 'SKU ID' },
  { field: 'spuId', type: 'string', desc: 'SPU ID' },
  { field: 'spuName', type: 'string', desc: 'SPU 名称' },
  { field: 'name', type: 'string', desc: 'SKU 名称' },
  { field: 'skuCode', type: 'string', desc: 'SKU 编码（订货号）' },
  { field: 'price', type: 'number', desc: '销售价' },
  { field: 'actualSalesPrice', type: 'number', desc: '实际销售价' },
  { field: 'stock', type: 'number', desc: '库存' },
  { field: 'weight', type: 'number', desc: '重量(kg)' },
  { field: 'unit', type: 'string', desc: '单位' },
  { field: 'model', type: 'string', desc: '型号' },
  { field: 'images', type: 'string', desc: '图片' },
  { field: 'remark', type: 'string', desc: '备注' },
  { field: 'isShelf', type: 'boolean', desc: '是否上架' },
  { field: 'barcode', type: 'string', desc: '条码' },
  { field: 'salesDeliver', type: 'number', desc: '销售配送方式' },
  { field: 'safetyStock', type: 'number', desc: '安全库存' },
  { field: 'ceilingStock', type: 'number', desc: '库存上限' },
  { field: 'esKeyword', type: 'string', desc: 'ES关键词' },
  { field: 'taxRate', type: 'number', desc: '税率(%)' },
  { field: 'itemNumber', type: 'string', desc: '货号' },
  { field: 'life', type: 'number', desc: '有效期（天）' },
  { field: 'returnDeadline', type: 'number', desc: '退货期限（天）' },
  { field: 'salesUnit', type: 'number', desc: '销售单位' },
  { field: 'salesCount', type: 'number', desc: '销量' },
  { field: 'tagManage', type: 'number', desc: '标签管理' },
  { field: 'templateId', type: 'number', desc: '运费模板ID' },
  { field: 'simpleDesc', type: 'string', desc: '简短描述' },
  { field: 'positionRemark', type: 'string', desc: '仓位备注' },
  { field: 'createdTime', type: 'datetime', desc: '创建时间' },
];

const PAGE_RESULT_FIELDS = [
  { field: 'rows', type: 'array', desc: '数据列表' },
  { field: 'totalSize', type: 'number', desc: '总记录数' },
  { field: 'pageIndex', type: 'number', desc: '当前页码' },
  { field: 'pageSize', type: 'number', desc: '每页条数' },
  { field: 'totalPage', type: 'number', desc: '总页数' },
];

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
        console.log(formatJsonWithFields(data, SKU_DETAIL_FIELDS));
      } catch (e: unknown) {
        error(e);
      }
    });

  // sku list --spu-id <id> [--is-shelf] [--has-supply] [--min-price N] [--max-price N] [--created-time-begin] [--created-time-end]
  sku
    .command('list')
    .description('SKU 列表（--spu-id 则列出该 SPU 下所有 SKU；无 --spu-id 则全量分页搜索）')
    .option('--id <id>', '编号/ID（精确查询）')
    .option('--spu-id <id>', 'SPU ID（指定则列出该 SPU 下所有 SKU）')
    .option('--keyword <keyword>', '关键词（仅在全量模式时生效）')
    .option('--is-shelf', '只看上架的（全量模式）')
    .option('--no-shelf', '只看下架的（全量模式）')
    .option('--has-supply', '只看有供应的（全量模式）')
    .option('--min-price <n>', '最低价格（全量模式）')
    .option('--max-price <n>', '最高价格（全量模式）')
    .option('--model <model>', '型号模糊搜索（全量模式）')
    .option('--barcode <code>', '条码精确搜索（全量模式）')
    .option('--min-stock <n>', '最低库存（全量模式）', (v) => parseInt(v))
    .option('--max-stock <n>', '最高库存（全量模式）', (v) => parseInt(v))
    .option('--created-time-begin <time>', '创建时间开始（全量模式，格式: 2024-01-01 或 2024-01-01 00:00:00）')
    .option('--created-time-end <time>', '创建时间结束（全量模式，格式: 2024-01-01 或 2024-01-01 23:59:59）')
    .option('--page <n>', '页码（全量模式）', (v) => parseInt(v))
    .option('--size <n>', '每页条数（全量模式）', (v) => parseInt(v))
    .action(async (options) => {
      try {
        const client = new ApiClient(getApiUrl());
        if (options.spuId) {
          // 按 SPU 查 SKU
          const rows = await listSkuBySpu(client, options.spuId);
          console.log(formatJsonWithFields(rows, SKU_LIST_FIELDS));
        } else {
          // 全量列表
          const params: SkuListParams = {};
          if (options.keyword) params.keyword = options.keyword;
          if (options.isShelf !== undefined) params.isShelf = true;
          if (options.noShelf !== undefined) params.isShelf = false;
          if (options.hasSupply !== undefined) params.hasSupply = true;
          if (options.minPrice !== undefined) params.minPrice = parseFloat(options.minPrice);
          if (options.maxPrice !== undefined) params.maxPrice = parseFloat(options.maxPrice);
          if (options.model) params.model = options.model;
          if (options.barcode) params.barcode = options.barcode;
          if (options.minStock !== undefined) params.minStock = options.minStock;
          if (options.maxStock !== undefined) params.maxStock = options.maxStock;
          if (options.createdTimeBegin) params.createdTimeBegin = options.createdTimeBegin;
          if (options.createdTimeEnd) params.createdTimeEnd = options.createdTimeEnd;
          if (options.page !== undefined) (params as any).pageNum = options.page;
          if (options.size !== undefined) (params as any).pageSize = options.size;
          const result = await listSku(client, params);
          console.log(formatJsonWithFields(result, [...SKU_LIST_FIELDS, ...PAGE_RESULT_FIELDS]));
        }
      } catch (e: unknown) {
        error(e);
      }
    });

  // sku create --spu-id <id> --name xxx --price <price> [options]
  sku
    .command('create')
    .description('创建 SKU')
    .requiredOption('--spu-id <id>', 'SPU ID')
    .requiredOption('--name <name>', 'SKU 名称')
    .requiredOption('--price <price>', '价格')
    .option('--sku-code <code>', 'SKU 编码')
    .option('--stock <n>', '库存', (v) => parseInt(v))
    .option('--weight <w>', '重量', (v) => parseFloat(v))
    .option('--unit <unit>', '单位（枚举ID: 单位，enum --type 单位 查看可用值）')
    .option('--model <model>', '型号')
    .option('--sales-price <n>', '销售价', (v) => parseFloat(v))
    .option('--actual-price <n>', '实际销售价', (v) => parseFloat(v))
    .option('--is-shelf <bool>', '是否上架', (v) => v === 'true')
    .option('--images <url>', '图片 URL（逗号分隔多图）')
    .option('--barcode <code>', '条码')
    .option('--remark <text>', '备注')
    .option('--life <n>', '有效期（天）', (v) => parseInt(v))
    .option('--return-deadline <n>', '退货期限（天）', (v) => parseInt(v))
    .option('--tax-rate <n>', '税率%（枚举ID: 税率，enum --type 税率 查看可用值）', (v) => parseInt(v))
    .option('--purchase-tax-rate <n>', '采购税率%（枚举ID: 采购税率，enum --type 采购税率 查看可用值）', (v) => parseInt(v))
    .option('--purchase-link <url>', '采购链接')
    .option('--safety-stock <n>', '安全库存', (v) => parseInt(v))
    .option('--ceiling-stock <n>', '库存上限', (v) => parseInt(v))
    .option('--deliver <n>', '销售交期（枚举ID: 交期，enum --type 交期 查看可用值）', (v) => parseInt(v))
    .option('--template-id <id>', '运费模板 ID', (v) => parseInt(v))
    .option('--item-number <num>', '货号')
    .option('--simple-desc <text>', '简短描述')
    .option('--es-keyword <kw>', 'ES 关键词')
    .option('--tag-manage <n>', '标签管理', (v) => parseInt(v))
    .option('--position-remark <text>', '仓位备注')
    .option('--extra-columns <json>', '附加列JSON。简单格式：{"key":"val"}；扩展格式：{"key":{"value":"val","type":"number","title":"xxx"}}')
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
        if (options.model) dto.model = options.model;
        if (options.salesPrice !== undefined) dto.salesPrice = options.salesPrice;
        if (options.actualPrice !== undefined) dto.actualSalesPrice = options.actualPrice;
        if (options.isShelf !== undefined) dto.isShelf = options.isShelf;
        if (options.images) dto.images = options.images;
        if (options.barcode) dto.barcode = options.barcode;
        if (options.remark) dto.remark = options.remark;
        if (options.life !== undefined) dto.life = options.life;
        if (options.returnDeadline !== undefined) dto.returnDeadline = options.returnDeadline;
        if (options.taxRate !== undefined) dto.taxRate = options.taxRate;
        if (options.purchaseTaxRate !== undefined) dto.purchaseTaxRate = options.purchaseTaxRate;
        if (options.purchaseLink) dto.purchaseLink = options.purchaseLink;
        if (options.safetyStock !== undefined) dto.safetyStock = options.safetyStock;
        if (options.ceilingStock !== undefined) dto.ceilingStock = options.ceilingStock;
        if (options.deliver !== undefined) dto.salesDeliver = options.deliver;
        if (options.templateId) dto.templateId = options.templateId;
        if (options.itemNumber) dto.itemNumber = options.itemNumber;
        if (options.simpleDesc) dto.simpleDesc = options.simpleDesc;
        if (options.esKeyword) dto.esKeyword = options.esKeyword;
        if (options.tagManage !== undefined) dto.tagManage = options.tagManage;
        if (options.positionRemark) dto.positionRemark = options.positionRemark;
        if (options.extraColumns) dto.extraColumns = JSON.parse(options.extraColumns);
        const skuId = await createSku(client, dto);
        success(`SKU 创建成功: ${skuId}`);
      } catch (e: unknown) {
        error(e);
      }
    });

  // sku update --sku <id> [options]
  sku
    .command('update')
    .description('更新 SKU')
    .requiredOption('--sku <id>', 'SKU ID')
    .option('--name <name>', 'SKU 名称')
    .option('--price <price>', '价格')
    .option('--stock <n>', '库存', (v) => parseInt(v))
    .option('--weight <w>', '重量', (v) => parseFloat(v))
    .option('--unit <unit>', '单位（枚举ID: 单位，enum --type 单位 查看可用值）')
    .option('--sku-code <code>', 'SKU 编码')
    .option('--model <model>', '型号')
    .option('--sales-price <n>', '销售价', (v) => parseFloat(v))
    .option('--actual-price <n>', '实际销售价', (v) => parseFloat(v))
    .option('--is-shelf <bool>', '是否上架', (v) => v === 'true')
    .option('--images <url>', '图片 URL（逗号分隔多图）')
    .option('--barcode <code>', '条码')
    .option('--remark <text>', '备注')
    .option('--life <n>', '有效期（天）', (v) => parseInt(v))
    .option('--return-deadline <n>', '退货期限（天）', (v) => parseInt(v))
    .option('--tax-rate <n>', '税率%（枚举ID: 税率，enum --type 税率 查看可用值）', (v) => parseInt(v))
    .option('--purchase-tax-rate <n>', '采购税率%（枚举ID: 采购税率，enum --type 采购税率 查看可用值）', (v) => parseInt(v))
    .option('--purchase-link <url>', '采购链接')
    .option('--safety-stock <n>', '安全库存', (v) => parseInt(v))
    .option('--ceiling-stock <n>', '库存上限', (v) => parseInt(v))
    .option('--deliver <n>', '销售交期（枚举ID: 交期，enum --type 交期 查看可用值）', (v) => parseInt(v))
    .option('--template-id <id>', '运费模板 ID', (v) => parseInt(v))
    .option('--item-number <num>', '货号')
    .option('--simple-desc <text>', '简短描述')
    .option('--es-keyword <kw>', 'ES 关键词')
    .option('--tag-manage <n>', '标签管理', (v) => parseInt(v))
    .option('--position-remark <text>', '仓位备注')
    .option('--replace-sku <id>', '替换 SKU ID')
    .option('--dine-in-details <text>', '堂食详情')
    .option('--vendors-id <id>', '供应商 ID')
    .option('--extra-columns <json>', '附加列JSON。简单格式：{"key":"val"}；扩展格式：{"key":{"value":"val","type":"number","title":"xxx"}}')
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
        if (options.model) dto.model = options.model;
        if (options.salesPrice !== undefined) dto.salesPrice = options.salesPrice;
        if (options.actualPrice !== undefined) dto.actualSalesPrice = options.actualPrice;
        if (options.isShelf !== undefined) dto.isShelf = options.isShelf;
        if (options.images) dto.images = options.images;
        if (options.barcode) dto.barcode = options.barcode;
        if (options.remark) dto.remark = options.remark;
        if (options.life !== undefined) dto.life = options.life;
        if (options.returnDeadline !== undefined) dto.returnDeadline = options.returnDeadline;
        if (options.taxRate !== undefined) dto.taxRate = options.taxRate;
        if (options.purchaseTaxRate !== undefined) dto.purchaseTaxRate = options.purchaseTaxRate;
        if (options.purchaseLink) dto.purchaseLink = options.purchaseLink;
        if (options.safetyStock !== undefined) dto.safetyStock = options.safetyStock;
        if (options.ceilingStock !== undefined) dto.ceilingStock = options.ceilingStock;
        if (options.deliver !== undefined) dto.salesDeliver = options.deliver;
        if (options.templateId) dto.templateId = options.templateId;
        if (options.itemNumber) dto.itemNumber = options.itemNumber;
        if (options.simpleDesc) dto.simpleDesc = options.simpleDesc;
        if (options.esKeyword) dto.esKeyword = options.esKeyword;
        if (options.tagManage !== undefined) dto.tagManage = options.tagManage;
        if (options.positionRemark) dto.positionRemark = options.positionRemark;
        if (options.replaceSku) dto.replaceSku = options.replaceSku;
        if (options.dineInDetails) dto.dineInDetails = options.dineInDetails;
        if (options.vendorsId) dto.vendorsId = options.vendorsId;
        if (options.extraColumns) dto.extraColumns = JSON.parse(options.extraColumns);
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
        console.log(formatJsonWithFields(values, SPEC_VALUES_FIELDS));
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
        console.log(formatJsonWithFields(cols, EXTRA_COLUMN_FIELDS));
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

  // ---------- replace ----------
  const replace = sku
    .command('replace')
    .description('替代品管理');

  replace
    .command('list')
    .description('查询替代产品列表')
    .requiredOption('--sku <sku>', 'SKU ID（必填）')
    .action(async (opts) => {
      try {
        const client = new ApiClient(getApiUrl());
        const data = await getSkuReplacements(client, opts.sku);
        console.log(formatJsonWithFields(data, [
          { field: 'originSku', type: 'string', desc: '原SKU' },
          { field: 'sku', type: 'string', desc: '替代SKU' },
          { field: 'name', type: 'string', desc: '产品名称' },
          { field: 'brandName', type: 'string', desc: '品牌' },
          { field: 'model', type: 'string', desc: '型号' },
        ]));
      } catch (e: any) {
        error(e);
        process.exit(1);
      }
    });

  replace
    .command('add')
    .description('添加替代产品')
    .requiredOption('--sku <sku>', '当前 SKU ID（必填）')
    .requiredOption('--replace-sku <sku>', '替代 SKU ID（必填）')
    .option('--full-replace', '是否完全替代')
    .action(async (opts) => {
      try {
        const client = new ApiClient(getApiUrl());
        await addSkuReplacement(client, opts.sku, opts.replaceSku, opts.fullReplace);
        success('替代产品添加成功');
      } catch (e: any) {
        error(e);
        process.exit(1);
      }
    });

  replace
    .command('remove')
    .description('删除替代产品')
    .requiredOption('--sku <sku>', '当前 SKU ID（必填）')
    .requiredOption('--replace-sku <sku>', '替代 SKU ID（必填）')
    .action(async (opts) => {
      try {
        const client = new ApiClient(getApiUrl());
        await deleteSkuReplacement(client, opts.sku, opts.replaceSku);
        success('替代产品已删除');
      } catch (e: any) {
        error(e);
        process.exit(1);
      }
    });
}
