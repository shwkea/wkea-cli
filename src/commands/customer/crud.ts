import { Command } from 'commander';
import { ApiClient } from '../../api/client';
import {
  createCustomer,
  getCustomerDetail,
  updateCustomer,
  deleteCustomer,
  listCustomers,
} from '../../api/customer';
import { formatJsonWithFields, formatOperation } from '../../utils/formatter';
import { success, error } from '../../utils/printer';
import { getApiUrl } from '../../config';

const CUSTOMER_FIELDS = [
  { field: 'id', type: 'string', desc: '客户编号' },
  { field: 'name', type: 'string', desc: '客户名称' },
  { field: 'manageId', type: 'string', desc: '客户经理ID' },
  { field: 'mname', type: 'string', desc: '客户经理姓名' },
  { field: 'account', type: 'string', desc: '账号' },
  { field: 'email', type: 'string', desc: '邮箱' },
  { field: 'phone', type: 'string', desc: '手机号' },
  { field: 'telephone', type: 'string', desc: '固定电话' },
  { field: 'country', type: 'string', desc: '国家/地区' },
  { field: 'province', type: 'string', desc: '省' },
  { field: 'city', type: 'string', desc: '市' },
  { field: 'area', type: 'string', desc: '区' },
  { field: 'address', type: 'string', desc: '详细地址' },
  { field: 'enterpriseType', type: 'number', desc: '企业类型' },
  { field: 'industry', type: 'string', desc: '所属行业' },
  { field: 'channelSource', type: 'number', desc: '渠道来源' },
  { field: 'website', type: 'string', desc: '官网' },
  { field: 'companyIntroduction', type: 'string', desc: '公司介绍' },
  { field: 'customerGroupId', type: 'number', desc: '客户组' },
  { field: 'currencyId', type: 'number', desc: '币种' },
  { field: 'paymentTerm', type: 'number', desc: '付款期限' },
  { field: 'settlementType', type: 'number', desc: '结算方式' },
  { field: 'remark', type: 'string', desc: '内部备注' },
  { field: 'banRemark', type: 'string', desc: '黑名单理由' },
  { field: 'bankNumber', type: 'string', desc: '银行专属号码' },
  { field: 'invoicePricePrint', type: 'boolean', desc: '是否打印发货单价格' },
  { field: 'addressList', type: 'array', desc: '地址列表' },
  { field: 'invoiceList', type: 'array', desc: '发票列表' },
  { field: 'bankList', type: 'array', desc: '银行列表' },
  { field: 'contactList', type: 'array', desc: '联系人列表' },
];

const CUSTOMER_LIST_FIELDS = [
  { field: 'id', type: 'string', desc: '客户编号' },
  { field: 'name', type: 'string', desc: '客户名称' },
  { field: 'nameAndId', type: 'string', desc: '客户名称+ID' },
  { field: 'manageId', type: 'string', desc: '客户经理ID' },
  { field: 'manageName', type: 'string', desc: '客户经理姓名' },
  { field: 'account', type: 'string', desc: '账号' },
  { field: 'phone', type: 'string', desc: '手机号' },
  { field: 'email', type: 'string', desc: '邮箱' },
  { field: 'province', type: 'string', desc: '省' },
  { field: 'city', type: 'string', desc: '市' },
  { field: 'area', type: 'string', desc: '区' },
  { field: 'enterpriseType', type: 'number', desc: '企业类型' },
  { field: 'industry', type: 'string', desc: '所属行业' },
  { field: 'channelSource', type: 'number', desc: '渠道来源' },
  { field: 'customerGroupId', type: 'number', desc: '客户组' },
  { field: 'currencyId', type: 'number', desc: '币种' },
  { field: 'paymentTerm', type: 'number', desc: '付款期限' },
  { field: 'settlementType', type: 'number', desc: '结算方式' },
  { field: 'invoiceHeader', type: 'string', desc: '发票抬头' },
  { field: 'createdTime', type: 'string', desc: '创建时间' },
  { field: 'remark', type: 'string', desc: '内部备注' },
];

const PAGE_RESULT_FIELDS = [
  { field: 'records', type: 'array', desc: '数据列表' },
  { field: 'total', type: 'number', desc: '总记录数' },
  { field: 'current', type: 'number', desc: '当前页码' },
  { field: 'size', type: 'number', desc: '每页条数' },
  { field: 'pages', type: 'number', desc: '总页数' },
];

export function registerCustomerCommands(program: Command) {

  // create
  program
    .command('create')
    .description('创建客户')
    .requiredOption('--name <name>', '客户名称（必填）')
    .option('--account <account>', '账号')
    .option('--password <password>', '密码')
    .option('--manage-id <id>', '客户经理ID')
    .option('--email <email>', '邮箱')
    .option('--phone <phone>', '手机号')
    .option('--telephone <tel>', '固定电话')
    .option('--country <country>', '国家/地区')
    .option('--province <province>', '省')
    .option('--city <city>', '市')
    .option('--area <area>', '区')
    .option('--address <address>', '详细地址')
    .option('--enterprise-type <type>', '企业类型')
    .option('--industry <industry>', '所属行业')
    .option('--channel-source <source>', '渠道来源')
    .option('--website <url>', '官网')
    .option('--company-introduction <text>', '公司介绍')
    .option('--customer-group-id <id>', '客户组')
    .option('--currency-id <id>', '币种')
    .option('--payment-term <term>', '付款期限')
    .option('--settlement-type <type>', '结算方式')
    .option('--remark <remark>', '内部备注')
    .option('--address-list <json>', '地址集合 JSON')
    .option('--invoice-list <json>', '发票集合 JSON')
    .option('--bank-list <json>', '银行集合 JSON')
    .option('--contact-list <json>', '联系人集合 JSON')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        const dto: Record<string, unknown> = { name: opts.name };
        if (opts.account) dto.account = opts.account;
        if (opts.password) dto.password = opts.password;
        if (opts.manageId) dto.manageId = opts.manageId;
        if (opts.email) dto.email = opts.email;
        if (opts.phone) dto.phone = opts.phone;
        if (opts.telephone) dto.telephone = opts.telephone;
        if (opts.country) dto.country = opts.country;
        if (opts.province) dto.province = opts.province;
        if (opts.city) dto.city = opts.city;
        if (opts.area) dto.area = opts.area;
        if (opts.address) dto.address = opts.address;
        if (opts.enterpriseType) dto.enterpriseType = parseInt(opts.enterpriseType);
        if (opts.industry) dto.industry = opts.industry;
        if (opts.channelSource) dto.channelSource = parseInt(opts.channelSource);
        if (opts.website) dto.website = opts.website;
        if (opts.companyIntroduction) dto.companyIntroduction = opts.companyIntroduction;
        if (opts.customerGroupId) dto.customerGroupId = parseInt(opts.customerGroupId);
        if (opts.currencyId) dto.currencyId = parseInt(opts.currencyId);
        if (opts.paymentTerm) dto.paymentTerm = parseInt(opts.paymentTerm);
        if (opts.settlementType) dto.settlementType = parseInt(opts.settlementType);
        if (opts.remark) dto.remark = opts.remark;
        if (opts.addressList) dto.addressList = JSON.parse(opts.addressList);
        if (opts.invoiceList) dto.invoiceList = JSON.parse(opts.invoiceList);
        if (opts.bankList) dto.bankList = JSON.parse(opts.bankList);
        if (opts.contactList) dto.contactList = JSON.parse(opts.contactList);
        await createCustomer(client, dto);
        success('客户创建成功');
      } catch (e: any) {
        error(e);
        process.exit(1);
      }
    });

  // get
  program
    .command('get')
    .description('查询客户详情')
    .requiredOption('--id <id>', '客户ID（必填）')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        const data = await getCustomerDetail(client, opts.id);
        console.log(formatJsonWithFields(data, CUSTOMER_FIELDS));
      } catch (e: any) {
        error(e);
        process.exit(1);
      }
    });

  // update
  program
    .command('update')
    .description('更新客户')
    .requiredOption('--id <id>', '客户ID（必填）')
    .option('--name <name>', '客户名称')
    .option('--account <account>', '账号')
    .option('--password <password>', '密码')
    .option('--manage-id <id>', '客户经理ID')
    .option('--email <email>', '邮箱')
    .option('--phone <phone>', '手机号')
    .option('--telephone <tel>', '固定电话')
    .option('--country <country>', '国家/地区')
    .option('--province <province>', '省')
    .option('--city <city>', '市')
    .option('--area <area>', '区')
    .option('--address <address>', '详细地址')
    .option('--enterprise-type <type>', '企业类型')
    .option('--industry <industry>', '所属行业')
    .option('--channel-source <source>', '渠道来源')
    .option('--website <url>', '官网')
    .option('--company-introduction <text>', '公司介绍')
    .option('--customer-group-id <id>', '客户组')
    .option('--currency-id <id>', '币种')
    .option('--payment-term <term>', '付款期限')
    .option('--settlement-type <type>', '结算方式')
    .option('--remark <remark>', '内部备注')
    .option('--address-list <json>', '地址集合 JSON')
    .option('--invoice-list <json>', '发票集合 JSON')
    .option('--bank-list <json>', '银行集合 JSON')
    .option('--contact-list <json>', '联系人集合 JSON')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        const dto: Record<string, unknown> = {};
        if (opts.name) dto.name = opts.name;
        if (opts.account) dto.account = opts.account;
        if (opts.password) dto.password = opts.password;
        if (opts.manageId) dto.manageId = opts.manageId;
        if (opts.email) dto.email = opts.email;
        if (opts.phone) dto.phone = opts.phone;
        if (opts.telephone) dto.telephone = opts.telephone;
        if (opts.country) dto.country = opts.country;
        if (opts.province) dto.province = opts.province;
        if (opts.city) dto.city = opts.city;
        if (opts.area) dto.area = opts.area;
        if (opts.address) dto.address = opts.address;
        if (opts.enterpriseType) dto.enterpriseType = parseInt(opts.enterpriseType);
        if (opts.industry) dto.industry = opts.industry;
        if (opts.channelSource) dto.channelSource = parseInt(opts.channelSource);
        if (opts.website) dto.website = opts.website;
        if (opts.companyIntroduction) dto.companyIntroduction = opts.companyIntroduction;
        if (opts.customerGroupId) dto.customerGroupId = parseInt(opts.customerGroupId);
        if (opts.currencyId) dto.currencyId = parseInt(opts.currencyId);
        if (opts.paymentTerm) dto.paymentTerm = parseInt(opts.paymentTerm);
        if (opts.settlementType) dto.settlementType = parseInt(opts.settlementType);
        if (opts.remark) dto.remark = opts.remark;
        if (opts.addressList) dto.addressList = JSON.parse(opts.addressList);
        if (opts.invoiceList) dto.invoiceList = JSON.parse(opts.invoiceList);
        if (opts.bankList) dto.bankList = JSON.parse(opts.bankList);
        if (opts.contactList) dto.contactList = JSON.parse(opts.contactList);
        await updateCustomer(client, opts.id, dto);
        success(formatOperation('更新客户'));
      } catch (e: any) {
        error(e);
        process.exit(1);
      }
    });

  // delete
  program
    .command('delete')
    .description('删除客户')
    .requiredOption('--id <id>', '客户ID（必填）')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        await deleteCustomer(client, opts.id);
        success(formatOperation('删除客户'));
      } catch (e: any) {
        error(e);
        process.exit(1);
      }
    });

  // list
  program
    .command('list')
    .description('查询客户列表（分页+多维筛选）')
    .option('--page <page>', '页码，默认 1', '1')
    .option('--limit <limit>', '每页条数，默认 20', '20')
    .option('--id <id>', '客户编号')
    .option('--name <name>', '客户名称')
    .option('--account <account>', '账号')
    .option('--phone <phone>', '手机号')
    .option('--email <email>', '邮箱')
    .option('--manage-id <id>', '客户经理ID')
    .option('--contact-name <name>', '联系人姓名')
    .option('--invoice-header <header>', '发票抬头')
    .option('--enterprise-type <type>', '企业类型')
    .option('--industry <industry>', '所属行业')
    .option('--channel-source <source>', '渠道来源')
    .option('--customer-group-id <id>', '客户组')
    .option('--province <province>', '省')
    .option('--city <city>', '市')
    .option('--area <area>', '区')
    .option('--no-manage', '只查未分配客户经理的客户')
    .option('--is-ban', '只查封禁客户')
    .option('--is-cancellation', '只查已注销客户')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        const dto: Record<string, unknown> = {
          pageNum: parseInt(opts.page),
          pageSize: parseInt(opts.limit),
        };
        if (opts.id) dto.id = opts.id;
        if (opts.name) dto.name = opts.name;
        if (opts.account) dto.account = opts.account;
        if (opts.phone) dto.phone = opts.phone;
        if (opts.email) dto.email = opts.email;
        if (opts.manageId) dto.manageId = opts.manageId;
        if (opts.contactName) dto.contactName = opts.contactName;
        if (opts.invoiceHeader) dto.invoiceHeader = opts.invoiceHeader;
        if (opts.enterpriseType) dto.enterpriseType = parseInt(opts.enterpriseType);
        if (opts.industry) dto.industry = opts.industry;
        if (opts.channelSource) dto.channelSource = parseInt(opts.channelSource);
        if (opts.customerGroupId) dto.customerGroupId = parseInt(opts.customerGroupId);
        if (opts.province) dto.province = opts.province;
        if (opts.city) dto.city = opts.city;
        if (opts.area) dto.area = opts.area;
        if (opts.noManage !== undefined) dto.noManage = true;
        if (opts.isBan !== undefined) dto.isBan = true;
        if (opts.isCancellation !== undefined) dto.isCancellation = true;
        const result = await listCustomers(client, dto);
        console.log(formatJsonWithFields(result, [...CUSTOMER_LIST_FIELDS, ...PAGE_RESULT_FIELDS]));
      } catch (e: any) {
        error(e);
        process.exit(1);
      }
    });
}
