import { Command } from 'commander';
import { ApiClient } from '../../api/client';
import {
  claimDemand,
  getQuotedVendors,
  getVendorQuotes,
  saveVendorPrice,
  saveQuotationInfo,
} from '../../api/demand';
import { formatJsonWithFields, formatOperation } from '../../utils/formatter';
import { success, error } from '../../utils/printer';
import { getApiUrl } from '../../config';
import { requirePositiveInt } from '../../utils/validators';

const QUOTED_VENDOR_FIELDS = [
  { field: 'vendorId', type: 'string', desc: '供应商ID' },
  { field: 'vendorName', type: 'string', desc: '供应商名称' },
  { field: 'isFinish', type: 'boolean', desc: '是否完成报价' },
  { field: 'isCancel', type: 'boolean', desc: '是否取消报价' },
];

const VENDOR_QUOTE_FIELDS = [
  { field: 'vendorsId', type: 'string', desc: '供应商ID' },
  { field: 'vendorsName', type: 'string', desc: '供应商名称' },
  { field: 'vendorsTags', type: 'string', desc: '供应商资质' },
  { field: 'isFinish', type: 'boolean', desc: '是否完成报价' },
  { field: 'tableListTotalPrice', type: 'number', desc: '报价总金额' },
];

const VENDOR_QUOTE_ITEM_FIELDS = [
  { field: 'skuName', type: 'string', desc: '产品名称' },
  { field: 'skuModel', type: 'string', desc: '型号' },
  { field: 'brandName', type: 'string', desc: '品牌' },
  { field: 'quantity', type: 'number', desc: '数量' },
  { field: 'price', type: 'number', desc: '单价' },
  { field: 'delivery', type: 'number', desc: '交期（天）' },
  { field: 'stock', type: 'number', desc: '供应商库存' },
  { field: 'shippingLocation', type: 'string', desc: '发货地' },
  { field: 'remark', type: 'string', desc: '备注' },
  { field: 'validityPeriod', type: 'number', desc: '报价有效期（天）' },
];

export function registerProcessCommand(demand: Command) {

  // claim（暂不需要，AI 直接处理即可，保留命令以备后用）
  demand
    .command('claim')
    .description('领取需求（暂不需要，AI直接处理即可，此命令保留以备后用）')
    .requiredOption('--id <id>', '需求ID（必填）')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        await claimDemand(client, parseInt(opts.id));
        success(`领取需求 ${opts.id} 成功`);
      } catch (e: any) {
        error(e);
        process.exit(1);
      }
    });

  // quoted-vendors
  demand
    .command('quoted-vendors')
    .description('查询已询价的供应商列表')
    .requiredOption('--demand-id <id>', '需求ID（必填）')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        const data = await getQuotedVendors(client, parseInt(opts.demandId));
        console.log(formatJsonWithFields(data, QUOTED_VENDOR_FIELDS));
      } catch (e: any) {
        error(e);
        process.exit(1);
      }
    });

  // vendor-quotes
  demand
    .command('vendor-quotes')
    .description('查看供应商报价详情（含每个行项目的价格、交期等）')
    .requiredOption('--demand-id <id>', '需求ID（必填）')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        const data = await getVendorQuotes(client, parseInt(opts.demandId));
        if (!data || data.length === 0) {
          console.log('暂无供应商报价数据');
          return;
        }
        for (const vendor of data) {
          console.log(`\n供应商: ${vendor.vendorsName} (${vendor.vendorsId})`);
          console.log(`  完成报价: ${vendor.isFinish ? '是' : '否'}`);
          if (vendor.tableInfoList && vendor.tableInfoList.length > 0) {
            console.log(`  报价明细:`);
            console.log(formatJsonWithFields(vendor.tableInfoList, VENDOR_QUOTE_ITEM_FIELDS));
          }
        }
      } catch (e: any) {
        error(e);
        process.exit(1);
      }
    });

  // save-price
  demand
    .command('save-price')
    .description('保存供应商报价到产品（仅记录供应价格，不改默认售价。设价请用 product supply set-master）')
    .requiredOption('--sku <sku>', 'SKU ID（必填）')
    .requiredOption('--vendor-id <id>', '供应商ID（必填）')
    .requiredOption('--price <price>', '单价（必填）')
    .requiredOption('--gross-margin <pct>', '毛利率（必填）')
    .option('--delivery <days>', '交期（天）')
    .option('--remark <remark>', '备注')
    .option('--stock <stock>', '供应商库存')
    .option('--shipping-location <loc>', '发货地')
    .option('--min-order-quantity <qty>', '最小起订量')
    .option('--min-order-multiple <mul>', '最小起订倍数')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        await saveVendorPrice(client, {
          sku: opts.sku,
          vendorsId: opts.vendorId,
          price: parseFloat(opts.price),
          grossMargin: parseInt(opts.grossMargin),
          delivery: opts.delivery ? parseInt(opts.delivery) : undefined,
          remark: opts.remark,
          stock: opts.stock ? parseInt(opts.stock) : undefined,
          shippingLocation: opts.shippingLocation,
          minOrderQuantity: opts.minOrderQuantity ? parseInt(opts.minOrderQuantity) : undefined,
          minOrderMultiple: opts.minOrderMultiple ? parseInt(opts.minOrderMultiple) : undefined,
        });
        success('供应商报价已保存（仅记录，未设为主供应商价格）');
      } catch (e: any) {
        error(e);
        process.exit(1);
      }
    });

  // quote-save-info（区别于 save-price）
  // 维护供应商给回的报价字段到询价单上，业务人员只需给 (需求 + 供应商 + 报价字段列表)
  // save-price 是把价格写到产品供应信息，quote-save-info 是把字段写到询价单
  demand
    .command('quote-save-info')
    .description('维护供应商给回的报价字段到询价单（区别于 save-price：save-price 写产品供应信息，这里写询价单的报价字段）')
    .requiredOption('--demand-id <id>', '需求ID（必填）')
    .requiredOption('--vendor-id <id>', '供应商ID（必填）。后端按 (需求+供应商) 自动推断 docInfoId')
    .requiredOption('--info-list <json>', '报价字段 JSON 数组，例如 \'[{"id":1820,"price":220,"delivery":1,"stock":0,"remark":"现货"}]\'。每个对象的 id 是需求行项目 ID（业务人员能理解），后端会自动对应到询价文档 data 行（必填）')
    .action(async (opts) => {
      try {
        const demandId = requirePositiveInt(opts.demandId, 'demand-id');
        const client = new ApiClient(getApiUrl());

        let infoList: any[];
        try {
          infoList = JSON.parse(opts.infoList);
        } catch {
          throw new Error('--info-list 必须是合法 JSON 数组（用单引号包整体，JSON 内容用双引号）');
        }
        if (!Array.isArray(infoList) || infoList.length === 0) {
          throw new Error('--info-list 必须是非空数组');
        }

        const docInfoId = await saveQuotationInfo(client, demandId, {
          vendorId: opts.vendorId,
          infoList,
        });
        success(`报价数据已保存到询价单 docInfoId=${docInfoId}（共 ${infoList.length} 条）`);
      } catch (e: any) {
        error(e);
        process.exit(1);
      }
    });
}
