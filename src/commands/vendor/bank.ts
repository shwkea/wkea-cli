import { Command } from 'commander';
import { ApiClient } from '../../api/client';
import {
  listVendorBanks,
  getVendorBank,
  createVendorBank,
  updateVendorBank,
  deleteVendorBank,
} from '../../api/vendor';
import { formatJsonWithFields, formatOperation } from '../../utils/formatter';
import { success, error } from '../../utils/printer';
import { getApiUrl } from '../../config';

const BANK_FIELDS = [
  { field: 'id', type: 'string', desc: '银行ID' },
  { field: 'vendorId', type: 'string', desc: '供应商ID' },
  { field: 'bankName', type: 'string', desc: '开户银行' },
  { field: 'bankAccount', type: 'string', desc: '银行账号' },
  { field: 'bankCode', type: 'string', desc: '银行编码' },
  { field: 'swiftCode', type: 'string', desc: 'SWIFT Code' },
  { field: 'branchName', type: 'string', desc: '支行名称' },
  { field: 'contactName', type: 'string', desc: '联系人' },
  { field: 'contactPhone', type: 'string', desc: '联系电话' },
  { field: 'currencyId', type: 'number', desc: '币种ID' },
  { field: 'isDefault', type: 'boolean', desc: '是否默认银行' },
  { field: 'remark', type: 'string', desc: '备注' },
  { field: 'createdTime', type: 'datetime', desc: '创建时间' },
  { field: 'updatedTime', type: 'datetime', desc: '更新时间' },
];

export function registerBankCommands(vendor: Command) {

  // list
  vendor
    .command('bank-list')
    .description('查询供应商银行账户列表')
    .requiredOption('--vendor-id <vendorId>', '供应商ID（必填）')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        const result = await listVendorBanks(client, opts.vendorId);
        console.log(formatJsonWithFields(result, BANK_FIELDS));
      } catch (e: any) {
        error(e);
        process.exit(1);
      }
    });

  // get
  vendor
    .command('bank-get')
    .description('查询银行账户详情')
    .requiredOption('--vendor-id <vendorId>', '供应商ID（必填）')
    .requiredOption('--bank-id <bankId>', '银行ID（必填）')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        const bank = await getVendorBank(client, opts.vendorId, parseInt(opts.bankId));
        console.log(formatJsonWithFields(bank, BANK_FIELDS));
      } catch (e: any) {
        error(e);
        process.exit(1);
      }
    });

  // add
  vendor
    .command('bank-add')
    .description('新增供应商银行账户')
    .requiredOption('--vendor-id <vendorId>', '供应商ID（必填）')
    .option('--bank-name <bankName>', '开户银行')
    .option('--bank-account <bankAccount>', '银行账号')
    .option('--bank-code <bankCode>', '银行编码')
    .option('--swift-code <swiftCode>', 'SWIFT Code')
    .option('--branch-name <branchName>', '支行名称')
    .option('--contact-name <contactName>', '联系人')
    .option('--contact-phone <contactPhone>', '联系电话')
    .option('--currency-id <currencyId>', '币种ID')
    .option('--default', '设为默认银行', false)
    .option('--remark <remark>', '备注')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        const dto: Record<string, any> = {};
        if (opts.bankName) dto.bankName = opts.bankName;
        if (opts.bankAccount) dto.bankAccount = opts.bankAccount;
        if (opts.bankCode) dto.bankCode = opts.bankCode;
        if (opts.swiftCode) dto.swiftCode = opts.swiftCode;
        if (opts.branchName) dto.branchName = opts.branchName;
        if (opts.contactName) dto.contactName = opts.contactName;
        if (opts.contactPhone) dto.contactPhone = opts.contactPhone;
        if (opts.currencyId) dto.currencyId = parseInt(opts.currencyId);
        if (opts.default) dto.isDefault = true;
        if (opts.remark) dto.remark = opts.remark;
        await createVendorBank(client, opts.vendorId, dto);
        success(formatOperation('新增银行账户'));
      } catch (e: any) {
        error(e);
        process.exit(1);
      }
    });

  // update
  vendor
    .command('bank-update')
    .description('更新供应商银行账户')
    .requiredOption('--vendor-id <vendorId>', '供应商ID（必填）')
    .requiredOption('--bank-id <bankId>', '银行ID（必填）')
    .option('--bank-name <bankName>', '开户银行')
    .option('--bank-account <bankAccount>', '银行账号')
    .option('--bank-code <bankCode>', '银行编码')
    .option('--swift-code <swiftCode>', 'SWIFT Code')
    .option('--branch-name <branchName>', '支行名称')
    .option('--contact-name <contactName>', '联系人')
    .option('--contact-phone <contactPhone>', '联系电话')
    .option('--currency-id <currencyId>', '币种ID')
    .option('--default', '设为默认银行')
    .option('--remark <remark>', '备注')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        const dto: Record<string, any> = {};
        if (opts.bankName) dto.bankName = opts.bankName;
        if (opts.bankAccount) dto.bankAccount = opts.bankAccount;
        if (opts.bankCode) dto.bankCode = opts.bankCode;
        if (opts.swiftCode) dto.swiftCode = opts.swiftCode;
        if (opts.branchName) dto.branchName = opts.branchName;
        if (opts.contactName) dto.contactName = opts.contactName;
        if (opts.contactPhone) dto.contactPhone = opts.contactPhone;
        if (opts.currencyId) dto.currencyId = parseInt(opts.currencyId);
        if (opts.default) dto.isDefault = true;
        if (opts.remark) dto.remark = opts.remark;
        await updateVendorBank(client, opts.vendorId, parseInt(opts.bankId), dto);
        success(formatOperation('更新银行账户'));
      } catch (e: any) {
        error(e);
        process.exit(1);
      }
    });

  // delete
  vendor
    .command('bank-delete')
    .description('删除供应商银行账户')
    .requiredOption('--vendor-id <vendorId>', '供应商ID（必填）')
    .requiredOption('--bank-id <bankId>', '银行ID（必填）')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        await deleteVendorBank(client, opts.vendorId, parseInt(opts.bankId));
        success(formatOperation('删除银行账户'));
      } catch (e: any) {
        error(e);
        process.exit(1);
      }
    });
}
