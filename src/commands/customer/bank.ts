import { Command } from 'commander';
import { ApiClient } from '../../api/client';
import { listCustomerBanks, createCustomerBank, deleteCustomerBank, getCustomerBank } from '../../api/customer';
import { formatJsonWithFields, formatOperation } from '../../utils/formatter';
import { success, error } from '../../utils/printer';
import { getApiUrl } from '../../config';

const BANK_FIELDS = [
  { field: 'id', type: 'number', desc: '银行ID' },
  { field: 'dutyParagraph', type: 'string', desc: '税号' },
  { field: 'openName', type: 'string', desc: '开户名称' },
  { field: 'account', type: 'string', desc: '账号' },
  { field: 'payType', type: 'number', desc: '收款方式' },
  { field: 'isDefault', type: 'boolean', desc: '是否默认' },
];

export function registerBankCommands(program: Command) {
  program
    .command('list-banks')
    .description('客户银行列表')
    .requiredOption('--customer-id <id>', '客户ID（必填）')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        const data = await listCustomerBanks(client, opts.customerId);
        console.log(formatJsonWithFields(data, BANK_FIELDS));
      } catch (e: any) { error(e); process.exit(1); }
    });

  program
    .command('create-bank')
    .description('新增客户银行')
    .requiredOption('--customer-id <id>', '客户ID（必填）')
    .option('--open-name <name>', '开户名称')
    .option('--account <account>', '账号')
    .option('--pay-type <type>', '收款方式')
    .option('--is-default', '设为默认')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        const dto: Record<string, any> = {};
        if (opts.openName) dto.openName = opts.openName;
        if (opts.account) dto.account = opts.account;
        if (opts.payType) dto.payType = parseInt(opts.payType);
        dto.isDefault = !!opts.isDefault;
        await createCustomerBank(client, opts.customerId, dto);
        success(formatOperation('新增'));
      } catch (e: any) { error(e); process.exit(1); }
    });

  program
    .command('delete-bank')
    .description('删除客户银行')
    .requiredOption('--customer-id <id>', '客户ID（必填）')
    .requiredOption('--bank-id <id>', '银行ID（必填）')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        await deleteCustomerBank(client, opts.customerId, parseInt(opts.bankId));
        success(formatOperation('删除'));
      } catch (e: any) { error(e); process.exit(1); }
    });
}
