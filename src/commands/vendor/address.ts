import { Command } from 'commander';
import { ApiClient } from '../../api/client';
import {
  listVendorAddresses,
  getVendorAddress,
  createVendorAddress,
  updateVendorAddress,
  deleteVendorAddress,
} from '../../api/vendor';
import { formatJsonWithFields, formatOperation } from '../../utils/formatter';
import { success, error } from '../../utils/printer';
import { getApiUrl } from '../../config';

const ADDRESS_FIELDS = [
  { field: 'id', type: 'string', desc: '地址ID' },
  { field: 'vendorId', type: 'string', desc: '供应商ID' },
  { field: 'receiverName', type: 'string', desc: '收货人' },
  { field: 'phone', type: 'string', desc: '联系电话' },
  { field: 'province', type: 'string', desc: '省' },
  { field: 'city', type: 'string', desc: '市' },
  { field: 'area', type: 'string', desc: '区' },
  { field: 'address', type: 'string', desc: '详细地址' },
  { field: 'isDefault', type: 'boolean', desc: '是否默认地址' },
  { field: 'createdTime', type: 'datetime', desc: '创建时间' },
  { field: 'updatedTime', type: 'datetime', desc: '更新时间' },
];

export function registerAddressCommands(vendor: Command) {

  // list
  vendor
    .command('address-list')
    .description('查询供应商地址列表')
    .requiredOption('--vendor-id <vendorId>', '供应商ID（必填）')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        const result = await listVendorAddresses(client, opts.vendorId);
        console.log(formatJsonWithFields(result, ADDRESS_FIELDS));
      } catch (e: any) {
        error(e);
        process.exit(1);
      }
    });

  // get
  vendor
    .command('address-get')
    .description('查询地址详情')
    .requiredOption('--vendor-id <vendorId>', '供应商ID（必填）')
    .requiredOption('--address-id <addressId>', '地址ID（必填）')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        const address = await getVendorAddress(client, opts.vendorId, parseInt(opts.addressId));
        console.log(formatJsonWithFields(address, ADDRESS_FIELDS));
      } catch (e: any) {
        error(e);
        process.exit(1);
      }
    });

  // add
  vendor
    .command('address-add')
    .description('新增供应商地址')
    .requiredOption('--vendor-id <vendorId>', '供应商ID（必填）')
    .option('--receiver-name <receiverName>', '收货人')
    .option('--phone <phone>', '联系电话')
    .option('--province <province>', '省')
    .option('--city <city>', '市')
    .option('--area <area>', '区')
    .option('--address <address>', '详细地址')
    .option('--default', '设为默认地址', false)
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        const dto: Record<string, any> = {};
        if (opts.receiverName) dto.receiverName = opts.receiverName;
        if (opts.phone) dto.phone = opts.phone;
        if (opts.province) dto.province = opts.province;
        if (opts.city) dto.city = opts.city;
        if (opts.area) dto.area = opts.area;
        if (opts.address) dto.address = opts.address;
        if (opts.default) dto.isDefault = true;
        await createVendorAddress(client, opts.vendorId, dto);
        success(formatOperation('新增地址'));
      } catch (e: any) {
        error(e);
        process.exit(1);
      }
    });

  // update
  vendor
    .command('address-update')
    .description('更新供应商地址')
    .requiredOption('--vendor-id <vendorId>', '供应商ID（必填）')
    .requiredOption('--address-id <addressId>', '地址ID（必填）')
    .option('--receiver-name <receiverName>', '收货人')
    .option('--phone <phone>', '联系电话')
    .option('--province <province>', '省')
    .option('--city <city>', '市')
    .option('--area <area>', '区')
    .option('--address <address>', '详细地址')
    .option('--default', '设为默认地址')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        const dto: Record<string, any> = {};
        if (opts.receiverName) dto.receiverName = opts.receiverName;
        if (opts.phone) dto.phone = opts.phone;
        if (opts.province) dto.province = opts.province;
        if (opts.city) dto.city = opts.city;
        if (opts.area) dto.area = opts.area;
        if (opts.address) dto.address = opts.address;
        if (opts.default) dto.isDefault = true;
        await updateVendorAddress(client, opts.vendorId, parseInt(opts.addressId), dto);
        success(formatOperation('更新地址'));
      } catch (e: any) {
        error(e);
        process.exit(1);
      }
    });

  // delete
  vendor
    .command('address-delete')
    .description('删除供应商地址')
    .requiredOption('--vendor-id <vendorId>', '供应商ID（必填）')
    .requiredOption('--address-id <addressId>', '地址ID（必填）')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        await deleteVendorAddress(client, opts.vendorId, parseInt(opts.addressId));
        success(formatOperation('删除地址'));
      } catch (e: any) {
        error(e);
        process.exit(1);
      }
    });
}
