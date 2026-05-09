import { Command } from 'commander';
import { ApiClient } from '../../api/client';
import { listCustomerContacts, createCustomerContact, deleteCustomerContact } from '../../api/customer';
import { formatJsonWithFields, formatOperation } from '../../utils/formatter';
import { success, error } from '../../utils/printer';
import { getApiUrl } from '../../config';

const CONTACT_FIELDS = [
  { field: 'id', type: 'string', desc: '联系人ID' },
  { field: 'contactName', type: 'string', desc: '姓名' },
  { field: 'contactPhone', type: 'string', desc: '手机号' },
  { field: 'contactEmail', type: 'string', desc: '邮箱' },
  { field: 'contactPosition', type: 'string', desc: '职位' },
  { field: 'isDefault', type: 'boolean', desc: '是否默认' },
];

export function registerContactCommands(program: Command) {
  program
    .command('list-contacts')
    .description('客户联系人列表')
    .requiredOption('--customer-id <id>', '客户ID（必填）')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        const data = await listCustomerContacts(client, opts.customerId);
        console.log(formatJsonWithFields(data, CONTACT_FIELDS));
      } catch (e: any) { error(e); process.exit(1); }
    });

  program
    .command('create-contact')
    .description('新增客户联系人')
    .requiredOption('--customer-id <id>', '客户ID（必填）')
    .option('--name <name>', '联系人姓名')
    .option('--phone <phone>', '手机号')
    .option('--email <email>', '邮箱')
    .option('--position <position>', '职位')
    .option('--is-default', '设为默认')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        const dto: Record<string, any> = {};
        if (opts.name) dto.contactName = opts.name;
        if (opts.phone) dto.contactPhone = opts.phone;
        if (opts.email) dto.contactEmail = opts.email;
        if (opts.position) dto.contactPosition = opts.position;
        dto.isDefault = !!opts.isDefault;
        await createCustomerContact(client, opts.customerId, dto);
        success(formatOperation('新增'));
      } catch (e: any) { error(e); process.exit(1); }
    });

  program
    .command('delete-contact')
    .description('删除客户联系人')
    .requiredOption('--customer-id <id>', '客户ID（必填）')
    .requiredOption('--contact-id <id>', '联系人ID（必填）')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        await deleteCustomerContact(client, opts.customerId, opts.contactId);
        success(formatOperation('删除'));
      } catch (e: any) { error(e); process.exit(1); }
    });
}
