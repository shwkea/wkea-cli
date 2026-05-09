import { Command } from 'commander';
import { ApiClient } from '../../api/client';
import { listCustomerAddresses, createCustomerAddress, deleteCustomerAddress } from '../../api/customer';
import { formatJsonWithFields, formatOperation } from '../../utils/formatter';
import { success, error } from '../../utils/printer';
import { getApiUrl } from '../../config';

const ADDRESS_FIELDS = [
  { field: 'id', type: 'number', desc: '地址ID' },
  { field: 'receiveName', type: 'string', desc: '收货人' },
  { field: 'receivePhone', type: 'string', desc: '收货人电话' },
  { field: 'province', type: 'string', desc: '省' },
  { field: 'city', type: 'string', desc: '市' },
  { field: 'area', type: 'string', desc: '区' },
  { field: 'address', type: 'string', desc: '详细地址' },
  { field: 'isDefault', type: 'boolean', desc: '是否默认' },
];

export function registerAddressCommands(program: Command) {
  program
    .command('list-addresses')
    .description('客户地址列表')
    .requiredOption('--customer-id <id>', '客户ID（必填）')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        const data = await listCustomerAddresses(client, opts.customerId);
        console.log(formatJsonWithFields(data, ADDRESS_FIELDS));
      } catch (e: any) { error(e); process.exit(1); }
    });

  program
    .command('create-address')
    .description('新增客户地址')
    .requiredOption('--customer-id <id>', '客户ID（必填）')
    .option('--receive-name <name>', '收货人')
    .option('--receive-phone <phone>', '收货人电话')
    .option('--province <province>', '省')
    .option('--city <city>', '市')
    .option('--area <area>', '区')
    .option('--address <address>', '详细地址')
    .option('--is-default', '设为默认')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        const dto: Record<string, any> = {};
        if (opts.receiveName) dto.receiveName = opts.receiveName;
        if (opts.receivePhone) dto.receivePhone = opts.receivePhone;
        if (opts.province) dto.province = opts.province;
        if (opts.city) dto.city = opts.city;
        if (opts.area) dto.area = opts.area;
        if (opts.address) dto.address = opts.address;
        dto.isDefault = !!opts.isDefault;
        await createCustomerAddress(client, opts.customerId, dto);
        success(formatOperation('新增'));
      } catch (e: any) { error(e); process.exit(1); }
    });

  program
    .command('delete-address')
    .description('删除客户地址')
    .requiredOption('--customer-id <id>', '客户ID（必填）')
    .requiredOption('--address-id <id>', '地址ID（必填）')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        await deleteCustomerAddress(client, opts.customerId, parseInt(opts.addressId));
        success(formatOperation('删除'));
      } catch (e: any) { error(e); process.exit(1); }
    });
}
