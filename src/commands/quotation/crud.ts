import { Command } from 'commander';
import { ApiClient } from '../../api/client';
import {
  createQuotation,
  getQuotationItems,
  addQuotationItems,
  removeQuotationItem,
  shareQuotation,
} from '../../api/quotation';
import { formatJsonWithFields, formatOperation } from '../../utils/formatter';
import { success, error } from '../../utils/printer';
import { getApiUrl } from '../../config';

const ITEM_FIELDS = [
  { field: 'id', type: 'string', desc: '产品ID' },
  { field: 'sku', type: 'string', desc: 'SKU' },
  { field: 'name', type: 'string', desc: '产品名称' },
  { field: 'spuName', type: 'string', desc: 'SPU名称' },
  { field: 'brandName', type: 'string', desc: '品牌' },
  { field: 'model', type: 'string', desc: '型号' },
  { field: 'quantity', type: 'number', desc: '数量' },
  { field: 'unit', type: 'number', desc: '单位' },
  { field: 'salesPrice', type: 'number', desc: '价格' },
  { field: 'selected', type: 'boolean', desc: '是否选中' },
  { field: 'remark', type: 'string', desc: '备注' },
  { field: 'sort', type: 'number', desc: '排序' },
];

const SHARE_FIELDS = [
  { field: 'shareUrl', type: 'string', desc: '分享链接' },
  { field: 'shortUrl', type: 'string', desc: '短链接' },
  { field: 'copyText', type: 'string', desc: '复制文案' },
];

export function registerQuotationCommands(program: Command) {

  // create
  program
    .command('create')
    .description('创建报价单')
    .requiredOption('--items <json>', '产品JSON数组：[{"sku":"...","quantity":5,"unit":1,"selected":true}]')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        const items = JSON.parse(opts.items);
        const shareId = await createQuotation(client, items);
        success(`创建成功，报价单ID(shareId): ${shareId}`);
      } catch (e: any) {
        error(e);
        process.exit(1);
      }
    });

  // get
  program
    .command('get')
    .description('查看报价单产品列表')
    .requiredOption('--share-id <id>', '报价单ID（必填）')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        const data = await getQuotationItems(client, opts.shareId);
        if (data.list) {
          console.log(formatJsonWithFields(data.list, ITEM_FIELDS));
          console.log(`\n产品数: ${data.productCount} | 小计: ${data.subtotal} | 总计: ${data.total}`);
        } else {
          console.log(formatJsonWithFields(data, ITEM_FIELDS));
        }
      } catch (e: any) {
        error(e);
        process.exit(1);
      }
    });

  // add-item
  program
    .command('add-item')
    .description('添加产品到报价单')
    .requiredOption('--share-id <id>', '报价单ID（必填）')
    .requiredOption('--items <json>', '产品JSON数组：[{"sku":"...","quantity":5,"unit":1,"selected":true}]')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        const items = JSON.parse(opts.items);
        await addQuotationItems(client, opts.shareId, items);
        success(formatOperation('添加产品'));
      } catch (e: any) {
        error(e);
        process.exit(1);
      }
    });

  // remove-item
  program
    .command('remove-item')
    .description('删除报价单中的产品')
    .requiredOption('--share-id <id>', '报价单ID（必填）')
    .requiredOption('--item-id <id>', '产品ID（必填）')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        await removeQuotationItem(client, opts.shareId, opts.itemId);
        success(formatOperation('删除产品'));
      } catch (e: any) {
        error(e);
        process.exit(1);
      }
    });

  // share
  program
    .command('share')
    .description('分享报价单（生成短链+复制文案）')
    .requiredOption('--share-id <id>', '报价单ID（必填）')
    .option('--topic <topic>', '自定义主题（不传则取首个产品名）')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        const result = await shareQuotation(client, opts.shareId, opts.topic);
        console.log(formatJsonWithFields(result, SHARE_FIELDS));
      } catch (e: any) {
        error(e);
        process.exit(1);
      }
    });
}
