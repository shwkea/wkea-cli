import { Command } from 'commander';
import { ApiClient } from '../../api/client';
import {
  listContacts,
  getContact,
  createContact,
  updateContact,
  deleteContact,
} from '../../api/vendor-contact';
import { formatJsonWithFields, formatOperation } from '../../utils/formatter';
import { error, success } from '../../utils/printer';
import { getApiUrl } from '../../config';

const CONTACT_FIELDS = [
  { field: 'id', type: 'string', desc: '联系人ID' },
  { field: 'vendorId', type: 'string', desc: '供应商ID' },
  { field: 'name', type: 'string', desc: '联系人姓名' },
  { field: 'phone', type: 'string', desc: '联系电话' },
  { field: 'email', type: 'string', desc: '邮箱' },
  { field: 'position', type: 'string', desc: '职位' },
  { field: 'isDefault', type: 'boolean', desc: '是否默认联系人' },
  { field: 'createdTime', type: 'datetime', desc: '创建时间' },
  { field: 'updatedTime', type: 'datetime', desc: '更新时间' },
];

const PAGE_RESULT_FIELDS = [
  { field: 'rows', type: 'array', desc: '数据列表' },
  { field: 'totalSize', type: 'number', desc: '总记录数' },
  { field: 'pageIndex', type: 'number', desc: '当前页码' },
  { field: 'pageSize', type: 'number', desc: '每页条数' },
  { field: 'totalPage', type: 'number', desc: '总页数' },
];

export function registerContactCommands(
  vendor: Command
) {

  // list
  vendor
    .command('contact-list')
    .description('查询供应商联系人列表')
    .requiredOption('--vendor-id <vendorId>', '供应商ID（必填）')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        const result = await listContacts(client, opts.vendorId);
        console.log(formatJsonWithFields(result, [...CONTACT_FIELDS, ...PAGE_RESULT_FIELDS]));
      } catch (e: any) {
    error(e);
        process.exit(1);
      }
    });

  // get
  vendor
    .command('contact-get')
    .description('查询联系人详情')
    .requiredOption('--vendor-id <vendorId>', '供应商ID（必填）')
    .requiredOption('--contact-id <contactId>', '联系人ID（必填）')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        const contact = await getContact(client, opts.vendorId, opts.contactId);
        console.log(formatJsonWithFields(contact, CONTACT_FIELDS));
      } catch (e: any) {
    error(e);
        process.exit(1);
      }
    });

  // add
  vendor
    .command('contact-add')
    .description('新增供应商联系人')
    .requiredOption('--vendor-id <vendorId>', '供应商ID（必填）')
    .requiredOption('--name <name>', '联系人姓名（必填）')
    .option('--phone <phone>', '联系电话')
    .option('--email <email>', '邮箱')
    .option('--position <position>', '职位')
    .option('--default', '设为默认联系人', false)
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        const dto: { name: string; phone?: string; email?: string; position?: string; isDefault?: boolean } = {
          name: opts.name,
        };
        if (opts.phone) dto.phone = opts.phone;
        if (opts.email) dto.email = opts.email;
        if (opts.position) dto.position = opts.position;
        if (opts.default) dto.isDefault = true;
        const id = await createContact(client, opts.vendorId, dto);
        success(`新增联系人成功，ID: ${id}`);
      } catch (e: any) {
    error(e);
        process.exit(1);
      }
    });

  // update
  vendor
    .command('contact-update')
    .description('更新供应商联系人')
    .requiredOption('--vendor-id <vendorId>', '供应商ID（必填）')
    .requiredOption('--contact-id <contactId>', '联系人ID（必填）')
    .option('--name <name>', '联系人姓名')
    .option('--phone <phone>', '联系电话')
    .option('--email <email>', '邮箱')
    .option('--position <position>', '职位')
    .option('--default', '设为默认联系人')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        const dto: { name?: string; phone?: string; email?: string; position?: string; isDefault?: boolean } = {};
        if (opts.name) dto.name = opts.name;
        if (opts.phone) dto.phone = opts.phone;
        if (opts.email) dto.email = opts.email;
        if (opts.position) dto.position = opts.position;
        if (opts.default) dto.isDefault = true;
        await updateContact(client, opts.vendorId, opts.contactId, dto);
        success(formatOperation('更新联系人'));
      } catch (e: any) {
    error(e);
        process.exit(1);
      }
    });

  // delete
  vendor
    .command('contact-delete')
    .description('删除供应商联系人（软删除）')
    .requiredOption('--vendor-id <vendorId>', '供应商ID（必填）')
    .requiredOption('--contact-id <contactId>', '联系人ID（必填）')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        await deleteContact(client, opts.vendorId, opts.contactId);
        success(formatOperation('删除联系人'));
      } catch (e: any) {
    error(e);
        process.exit(1);
      }
    });
}
