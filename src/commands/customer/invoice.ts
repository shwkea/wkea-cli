import { Command } from 'commander';
import { ApiClient } from '../../api/client';
import { listCustomerInvoices, createCustomerInvoice, deleteCustomerInvoice } from '../../api/customer';
import { formatJsonWithFields, formatOperation } from '../../utils/formatter';
import { success, error } from '../../utils/printer';
import { getApiUrl } from '../../config';

const INVOICE_FIELDS = [
  { field: 'id', type: 'number', desc: '发票ID' },
  { field: 'invoiceHeader', type: 'string', desc: '发票抬头' },
  { field: 'dutyParagraph', type: 'string', desc: '税号' },
  { field: 'isDefault', type: 'boolean', desc: '是否默认' },
];

export function registerInvoiceCommands(program: Command) {
  program
    .command('list-invoices')
    .description('客户发票列表')
    .requiredOption('--customer-id <id>', '客户ID（必填）')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        const data = await listCustomerInvoices(client, opts.customerId);
        console.log(formatJsonWithFields(data, INVOICE_FIELDS));
      } catch (e: any) { error(e); process.exit(1); }
    });

  program
    .command('create-invoice')
    .description('新增客户发票')
    .requiredOption('--customer-id <id>', '客户ID（必填）')
    .option('--invoice-header <header>', '发票抬头')
    .option('--duty-paragraph <dp>', '税号')
    .option('--is-default', '设为默认')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        const dto: Record<string, any> = {};
        if (opts.invoiceHeader) dto.invoiceHeader = opts.invoiceHeader;
        if (opts.dutyParagraph) dto.dutyParagraph = opts.dutyParagraph;
        dto.isDefault = !!opts.isDefault;
        await createCustomerInvoice(client, opts.customerId, dto);
        success(formatOperation('新增'));
      } catch (e: any) { error(e); process.exit(1); }
    });

  program
    .command('delete-invoice')
    .description('删除客户发票')
    .requiredOption('--customer-id <id>', '客户ID（必填）')
    .requiredOption('--invoice-id <id>', '发票ID（必填）')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        await deleteCustomerInvoice(client, opts.customerId, parseInt(opts.invoiceId));
        success(formatOperation('删除'));
      } catch (e: any) { error(e); process.exit(1); }
    });
}
