import { Command } from 'commander';
import { ApiClient } from '../../api/client';
import {
  listVendorInvoices,
  getVendorInvoice,
  createVendorInvoice,
  updateVendorInvoice,
  deleteVendorInvoice,
} from '../../api/vendor';
import { formatJsonWithFields, formatOperation } from '../../utils/formatter';
import { success, error } from '../../utils/printer';
import { getApiUrl } from '../../config';

const INVOICE_FIELDS = [
  { field: 'id', type: 'string', desc: '发票ID' },
  { field: 'vendorId', type: 'string', desc: '供应商ID' },
  { field: 'invoiceTitle', type: 'string', desc: '发票抬头' },
  { field: 'taxId', type: 'string', desc: '税号' },
  { field: 'invoiceType', type: 'number', desc: '发票类型' },
  { field: 'address', type: 'string', desc: '地址' },
  { field: 'phone', type: 'string', desc: '电话' },
  { field: 'bankName', type: 'string', desc: '开户银行' },
  { field: 'bankAccount', type: 'string', desc: '银行账号' },
  { field: 'isDefault', type: 'boolean', desc: '是否默认发票' },
  { field: 'createdTime', type: 'datetime', desc: '创建时间' },
  { field: 'updatedTime', type: 'datetime', desc: '更新时间' },
];

export function registerInvoiceCommands(vendor: Command) {

  // list
  vendor
    .command('invoice-list')
    .description('查询供应商发票列表')
    .requiredOption('--vendor-id <vendorId>', '供应商ID（必填）')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        const result = await listVendorInvoices(client, opts.vendorId);
        console.log(formatJsonWithFields(result, INVOICE_FIELDS));
      } catch (e: any) {
        error(e);
        process.exit(1);
      }
    });

  // get
  vendor
    .command('invoice-get')
    .description('查询发票详情')
    .requiredOption('--vendor-id <vendorId>', '供应商ID（必填）')
    .requiredOption('--invoice-id <invoiceId>', '发票ID（必填）')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        const invoice = await getVendorInvoice(client, opts.vendorId, parseInt(opts.invoiceId));
        console.log(formatJsonWithFields(invoice, INVOICE_FIELDS));
      } catch (e: any) {
        error(e);
        process.exit(1);
      }
    });

  // add
  vendor
    .command('invoice-add')
    .description('新增供应商发票')
    .requiredOption('--vendor-id <vendorId>', '供应商ID（必填）')
    .option('--invoice-title <invoiceTitle>', '发票抬头')
    .option('--tax-id <taxId>', '税号')
    .option('--invoice-type <invoiceType>', '发票类型（枚举ID: 发票类型）')
    .option('--address <address>', '地址')
    .option('--phone <phone>', '电话')
    .option('--bank-name <bankName>', '开户银行')
    .option('--bank-account <bankAccount>', '银行账号')
    .option('--default', '设为默认发票', false)
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        const dto: Record<string, any> = {};
        if (opts.invoiceTitle) dto.invoiceTitle = opts.invoiceTitle;
        if (opts.taxId) dto.taxId = opts.taxId;
        if (opts.invoiceType) dto.invoiceType = parseInt(opts.invoiceType);
        if (opts.address) dto.address = opts.address;
        if (opts.phone) dto.phone = opts.phone;
        if (opts.bankName) dto.bankName = opts.bankName;
        if (opts.bankAccount) dto.bankAccount = opts.bankAccount;
        if (opts.default) dto.isDefault = true;
        await createVendorInvoice(client, opts.vendorId, dto);
        success(formatOperation('新增发票'));
      } catch (e: any) {
        error(e);
        process.exit(1);
      }
    });

  // update
  vendor
    .command('invoice-update')
    .description('更新供应商发票')
    .requiredOption('--vendor-id <vendorId>', '供应商ID（必填）')
    .requiredOption('--invoice-id <invoiceId>', '发票ID（必填）')
    .option('--invoice-title <invoiceTitle>', '发票抬头')
    .option('--tax-id <taxId>', '税号')
    .option('--invoice-type <invoiceType>', '发票类型（枚举ID: 发票类型）')
    .option('--address <address>', '地址')
    .option('--phone <phone>', '电话')
    .option('--bank-name <bankName>', '开户银行')
    .option('--bank-account <bankAccount>', '银行账号')
    .option('--default', '设为默认发票')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        const dto: Record<string, any> = {};
        if (opts.invoiceTitle) dto.invoiceTitle = opts.invoiceTitle;
        if (opts.taxId) dto.taxId = opts.taxId;
        if (opts.invoiceType) dto.invoiceType = parseInt(opts.invoiceType);
        if (opts.address) dto.address = opts.address;
        if (opts.phone) dto.phone = opts.phone;
        if (opts.bankName) dto.bankName = opts.bankName;
        if (opts.bankAccount) dto.bankAccount = opts.bankAccount;
        if (opts.default) dto.isDefault = true;
        await updateVendorInvoice(client, opts.vendorId, parseInt(opts.invoiceId), dto);
        success(formatOperation('更新发票'));
      } catch (e: any) {
        error(e);
        process.exit(1);
      }
    });

  // delete
  vendor
    .command('invoice-delete')
    .description('删除供应商发票')
    .requiredOption('--vendor-id <vendorId>', '供应商ID（必填）')
    .requiredOption('--invoice-id <invoiceId>', '发票ID（必填）')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        await deleteVendorInvoice(client, opts.vendorId, parseInt(opts.invoiceId));
        success(formatOperation('删除发票'));
      } catch (e: any) {
        error(e);
        process.exit(1);
      }
    });
}
