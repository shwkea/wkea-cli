import { Command } from 'commander';
import { ApiClient } from '../../api/client';
import { createVendor, getVendorDetail, updateVendor, deleteVendor } from '../../api/vendor';
import { formatDetail, formatOperation } from '../../utils/formatter';
import { success, error } from '../../utils/printer';
import { buildBaseUrl } from '../../config';

const VENDOR_FIELDS = [
  { field: 'vendorId', type: 'string', desc: '供应商ID' },
  { field: 'name', type: 'string', desc: '供应商名称' },
  { field: 'contact', type: 'string', desc: '联系人' },
  { field: 'phone', type: 'string', desc: '联系电话' },
  { field: 'address', type: 'string', desc: '地址' },
  { field: 'bankName', type: 'string', desc: '开户银行' },
  { field: 'bankAccount', type: 'string', desc: '银行账号' },
  { field: 'manageId', type: 'string', desc: '客户经理ID' },
  { field: 'email', type: 'string', desc: '邮箱' },
  {
    field: 'type',
    type: 'number',
    desc: '供应商类型：1=生产型 2=贸易型 3=服务型',
  },
  {
    field: 'brands',
    type: 'array',
    desc: '绑定品牌列表 [{id, name, isMain, boundAt}]',
  },
  {
    field: 'categories',
    type: 'array',
    desc: '绑定分类列表 [{id, name, boundAt}]',
  },
  { field: 'extraColumns', type: 'array', desc: '扩展字段列表' },
  { field: 'createdTime', type: 'datetime', desc: '创建时间' },
];

export function registerCrudCommands(
  vendor: Command,
  token: string | null,
  env: 'prod' | 'test'
) {

  // create
  vendor
    .command('create')
    .description('创建供应商')
    .requiredOption('--name <name>', '供应商名称（必填）')
    .option('--contact <contact>', '联系人')
    .option('--phone <phone>', '联系电话')
    .option('--address <address>', '地址')
    .option('--bank-name <bankName>', '开户银行')
    .option('--bank-account <bankAccount>', '银行账号')
    .requiredOption('--manage-id <manageId>', '客户经理ID（必填）')
    .option('--email <email>', '邮箱')
    .option(
      '--type <type>',
      '供应商类型：1=生产型 2=贸易型 3=服务型',
      '2'
    )
    .action(async (opts) => {
      const client = new ApiClient(buildBaseUrl(env), token!);
      try {
        const id = await createVendor(client, {
          name: opts.name,
          contact: opts.contact,
          phone: opts.phone,
          address: opts.address,
          bankName: opts.bankName,
          bankAccount: opts.bankAccount,
          manageId: opts.manageId,
          email: opts.email,
          type: parseInt(opts.type),
        });
        success(`创建成功，供应商ID: ${id}`);
      } catch (e: any) {
        error(e.message);
        process.exit(1);
      }
    });

  // get
  vendor
    .command('get')
    .description('查询供应商详情')
    .requiredOption('--vendor-id <vendorId>', '供应商ID（必填）')
    .action(async (opts) => {
      const client = new ApiClient(buildBaseUrl(env), token!);
      try {
        const data = await getVendorDetail(client, opts.vendorId);
        console.log(
          formatDetail(data as unknown as Record<string, unknown>, VENDOR_FIELDS)
        );
      } catch (e: any) {
        error(e.message);
        process.exit(1);
      }
    });

  // update
  vendor
    .command('update')
    .description('更新供应商信息')
    .requiredOption('--vendor-id <vendorId>', '供应商ID（必填）')
    .option('--name <name>', '供应商名称')
    .option('--contact <contact>', '联系人')
    .option('--phone <phone>', '联系电话')
    .option('--address <address>', '地址')
    .option('--bank-name <bankName>', '开户银行')
    .option('--bank-account <bankAccount>', '银行账号')
    .option('--email <email>', '邮箱')
    .option('--type <type>', '供应商类型：1=生产型 2=贸易型 3=服务型')
    .action(async (opts) => {
      const client = new ApiClient(buildBaseUrl(env), token!);
      try {
        const dto: Record<string, unknown> = {};
        if (opts.name) dto.name = opts.name;
        if (opts.contact) dto.contact = opts.contact;
        if (opts.phone) dto.phone = opts.phone;
        if (opts.address) dto.address = opts.address;
        if (opts.bankName) dto.bankName = opts.bankName;
        if (opts.bankAccount) dto.bankAccount = opts.bankAccount;
        if (opts.email) dto.email = opts.email;
        if (opts.type) dto.type = parseInt(opts.type);
        await updateVendor(client, opts.vendorId, dto as any);
        success(formatOperation('更新'));
      } catch (e: any) {
        error(e.message);
        process.exit(1);
      }
    });

  // delete
  vendor
    .command('delete')
    .description('删除供应商（逻辑删除）')
    .requiredOption('--vendor-id <vendorId>', '供应商ID（必填）')
    .action(async (opts) => {
      const client = new ApiClient(buildBaseUrl(env), token!);
      try {
        await deleteVendor(client, opts.vendorId);
        success(formatOperation('删除'));
      } catch (e: any) {
        error(e.message);
        process.exit(1);
      }
    });
}
