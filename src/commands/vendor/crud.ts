import { Command } from 'commander';
import { ApiClient } from '../../api/client';
import { createVendor, getVendorDetail, updateVendor, deleteVendor } from '../../api/vendor';
import { formatDetail, formatOperation } from '../../utils/formatter';
import { success, error } from '../../utils/printer';
import { getApiUrl } from '../../config';

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
    desc: '供应商类型：106=原厂 107=授权经销商 236=品牌方 237=总代理 238=其他',
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
  { field: 'updatedTime', type: 'datetime', desc: '更新时间' },
];

export function registerCrudCommands(
  vendor: Command
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
      '供应商类型：106=原厂 107=授权经销商 236=品牌方 237=总代理 238=其他'
    )
    .option('--fix-phone <phone>', '固定电话')
    .option('--telephone <phone>', '电话（备用）')
    .option('--point-of-origin <origin>', '产地')
    .option('--enterprise-type <type>', '企业类型')
    .option('--industry <industry>', '行业')
    .option('--channel-source <source>', '渠道来源')
    .option('--website <url>', '网站')
    .option('--company-introduction <text>', '公司简介')
    .option('--country <country>', '国家')
    .option('--province <province>', '省')
    .option('--city <city>', '市')
    .option('--area <area>', '区')
    .option('--town <town>', '镇')
    .option('--currency-id <id>', '币种ID')
    .option('--pay-type <type>', '付款方式')
    .option('--payment-term <term>', '付款期限')
    .option('--settlement-type <type>', '结款方式')
    .option('--play-day <days>', '账期天数')
    .option('--employee-count <count>', '员工数')
    .option('--group-id <id>', '供应商组ID')
    .option('--is-suspend', '是否暂停合作')
    .option('--brand-ids <ids>', '品牌ID列表，逗号分隔')
    .option('--remark <remark>', '备注')
    .option('--tags <tags>', '标签')
    .option('--main-business <business>', '主营业务')
    .option('--custom-fields <fields>', '自定义字段')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        const dto: Record<string, unknown> = {
          name: opts.name,
          manageId: opts.manageId,
        };
        if (opts.contact) dto.contact = opts.contact;
        if (opts.phone) dto.phone = opts.phone;
        if (opts.address) dto.address = opts.address;
        if (opts.bankName) dto.bankName = opts.bankName;
        if (opts.bankAccount) dto.bankAccount = opts.bankAccount;
        if (opts.email) dto.email = opts.email;
        if (opts.type) dto.type = parseInt(opts.type);
        if (opts.fixPhone) dto.fixPhone = opts.fixPhone;
        if (opts.telephone) dto.telephone = opts.telephone;
        if (opts.pointOfOrigin) dto.pointOfOrigin = opts.pointOfOrigin;
        if (opts.enterpriseType) dto.enterpriseType = parseInt(opts.enterpriseType);
        if (opts.industry) dto.industry = opts.industry;
        if (opts.channelSource) dto.channelSource = parseInt(opts.channelSource);
        if (opts.website) dto.website = opts.website;
        if (opts.companyIntroduction) dto.companyIntroduction = opts.companyIntroduction;
        if (opts.country) dto.country = opts.country;
        if (opts.province) dto.province = opts.province;
        if (opts.city) dto.city = opts.city;
        if (opts.area) dto.area = opts.area;
        if (opts.town) dto.town = opts.town;
        if (opts.currencyId) dto.currencyId = parseInt(opts.currencyId);
        if (opts.payType) dto.payType = parseInt(opts.payType);
        if (opts.paymentTerm) dto.paymentTerm = parseInt(opts.paymentTerm);
        if (opts.settlementType) dto.settlementType = parseInt(opts.settlementType);
        if (opts.playDay) dto.playDay = parseInt(opts.playDay);
        if (opts.employeeCount) dto.employeeCount = parseInt(opts.employeeCount);
        if (opts.groupId) dto.groupId = parseInt(opts.groupId);
        if (opts.isSuspend !== undefined) dto.isSuspend = opts.isSuspend;
        if (opts.brandIds) dto.brandIdList = opts.brandIds.split(',').map(Number);
        if (opts.remark) dto.remark = opts.remark;
        if (opts.tags) dto.tags = opts.tags;
        if (opts.mainBusiness) dto.mainBusiness = opts.mainBusiness;
        if (opts.customFields) dto.customFields = opts.customFields;
        const id = await createVendor(client, dto as any);
        success(`创建成功，供应商ID: ${id}`);
      } catch (e: any) {
    error(e);
        process.exit(1);
      }
    });

  // get
  vendor
    .command('get')
    .description('查询供应商详情')
    .requiredOption('--vendor-id <vendorId>', '供应商ID（必填）')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        const data = await getVendorDetail(client, opts.vendorId);
        console.log(
          formatDetail(data as unknown as Record<string, unknown>, VENDOR_FIELDS)
        );
      } catch (e: any) {
    error(e);
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
    .option('--type <type>', '供应商类型：106=原厂 107=授权经销商 236=品牌方 237=总代理 238=其他')
    .option('--manage-id <manageId>', '客户经理ID')
    .option('--fix-phone <phone>', '固定电话')
    .option('--telephone <phone>', '电话（备用）')
    .option('--point-of-origin <origin>', '产地')
    .option('--enterprise-type <type>', '企业类型')
    .option('--industry <industry>', '行业')
    .option('--channel-source <source>', '渠道来源')
    .option('--website <url>', '网站')
    .option('--company-introduction <text>', '公司简介')
    .option('--country <country>', '国家')
    .option('--province <province>', '省')
    .option('--city <city>', '市')
    .option('--area <area>', '区')
    .option('--town <town>', '镇')
    .option('--currency-id <id>', '币种ID')
    .option('--pay-type <type>', '付款方式')
    .option('--payment-term <term>', '付款期限')
    .option('--settlement-type <type>', '结款方式')
    .option('--play-day <days>', '账期天数')
    .option('--employee-count <count>', '员工数')
    .option('--group-id <id>', '供应商组ID')
    .option('--is-suspend', '是否暂停合作')
    .option('--brand-ids <ids>', '品牌ID列表，逗号分隔')
    .option('--remark <remark>', '备注')
    .option('--tags <tags>', '标签')
    .option('--main-business <business>', '主营业务')
    .option('--custom-fields <fields>', '自定义字段')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
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
        if (opts.manageId) dto.manageId = opts.manageId;
        if (opts.fixPhone) dto.fixPhone = opts.fixPhone;
        if (opts.telephone) dto.telephone = opts.telephone;
        if (opts.pointOfOrigin) dto.pointOfOrigin = opts.pointOfOrigin;
        if (opts.enterpriseType) dto.enterpriseType = parseInt(opts.enterpriseType);
        if (opts.industry) dto.industry = opts.industry;
        if (opts.channelSource) dto.channelSource = parseInt(opts.channelSource);
        if (opts.website) dto.website = opts.website;
        if (opts.companyIntroduction) dto.companyIntroduction = opts.companyIntroduction;
        if (opts.country) dto.country = opts.country;
        if (opts.province) dto.province = opts.province;
        if (opts.city) dto.city = opts.city;
        if (opts.area) dto.area = opts.area;
        if (opts.town) dto.town = opts.town;
        if (opts.currencyId) dto.currencyId = parseInt(opts.currencyId);
        if (opts.payType) dto.payType = parseInt(opts.payType);
        if (opts.paymentTerm) dto.paymentTerm = parseInt(opts.paymentTerm);
        if (opts.settlementType) dto.settlementType = parseInt(opts.settlementType);
        if (opts.playDay) dto.playDay = parseInt(opts.playDay);
        if (opts.employeeCount) dto.employeeCount = parseInt(opts.employeeCount);
        if (opts.groupId) dto.groupId = parseInt(opts.groupId);
        if (opts.isSuspend !== undefined) dto.isSuspend = opts.isSuspend;
        if (opts.brandIds) dto.brandIdList = opts.brandIds.split(',').map(Number);
        if (opts.remark) dto.remark = opts.remark;
        if (opts.tags) dto.tags = opts.tags;
        if (opts.mainBusiness) dto.mainBusiness = opts.mainBusiness;
        if (opts.customFields) dto.customFields = opts.customFields;
        await updateVendor(client, opts.vendorId, dto as any);
        success(formatOperation('更新'));
      } catch (e: any) {
    error(e);
        process.exit(1);
      }
    });

  // delete
  vendor
    .command('delete')
    .description('删除供应商（逻辑删除）')
    .requiredOption('--vendor-id <vendorId>', '供应商ID（必填）')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        await deleteVendor(client, opts.vendorId);
        success(formatOperation('删除'));
      } catch (e: any) {
    error(e);
        process.exit(1);
      }
    });
}
