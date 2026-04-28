import { Command } from 'commander';
import { ApiClient } from '../../api/client';
import { getVendorList } from '../../api/vendor';
import { formatJsonWithFields } from '../../utils/formatter';
import { error } from '../../utils/printer';
import { getApiUrl } from '../../config';

const VENDOR_LIST_FIELDS = [
  { field: 'vendorId', type: 'string', desc: '供应商ID' },
  { field: 'name', type: 'string', desc: '供应商名称' },
  { field: 'phone', type: 'string', desc: '联系电话' },
  { field: 'fixPhone', type: 'string', desc: '公司固话' },
  { field: 'telephone', type: 'string', desc: '公司电话' },
  { field: 'address', type: 'string', desc: '地址' },
  { field: 'manageId', type: 'string', desc: '客户经理ID' },
  { field: 'email', type: 'string', desc: '邮箱' },
  { field: 'type', type: 'number', desc: '供应商类型：106=原厂 107=授权经销商 236=品牌方 237=总代理 238=其他' },
  { field: 'pointOfOrigin', type: 'string', desc: '发货地' },
  { field: 'enterpriseType', type: 'number', desc: '企业类型' },
  { field: 'industry', type: 'string', desc: '所属行业' },
  { field: 'channelSource', type: 'number', desc: '渠道来源' },
  { field: 'website', type: 'string', desc: '官网' },
  { field: 'companyIntroduction', type: 'string', desc: '公司介绍' },
  { field: 'country', type: 'string', desc: '国家/地区' },
  { field: 'province', type: 'string', desc: '省/直辖市/自治区' },
  { field: 'city', type: 'string', desc: '市' },
  { field: 'area', type: 'string', desc: '区/县' },
  { field: 'town', type: 'string', desc: '街道/镇' },
  { field: 'currencyId', type: 'number', desc: '币种ID' },
  { field: 'payType', type: 'number', desc: '付款方式' },
  { field: 'paymentTerm', type: 'number', desc: '付款期限' },
  { field: 'settlementType', type: 'number', desc: '结算方式' },
  { field: 'playDay', type: 'number', desc: '月结日期' },
  { field: 'groupId', type: 'number', desc: '供应商组ID' },
  { field: 'isSuspend', type: 'boolean', desc: '是否暂停合作' },
  { field: 'remark', type: 'string', desc: '内部备注' },
  { field: 'tags', type: 'string', desc: '企业标签' },
  { field: 'createdBy', type: 'string', desc: '创建人' },
  { field: 'createdTime', type: 'datetime', desc: '创建时间' },
  { field: 'updatedTime', type: 'datetime', desc: '更新时间' },
  { field: 'updatedBy', type: 'string', desc: '修改人' },
  { field: 'kgwxUserId', type: 'string', desc: '企微ID' },
];

const PAGE_RESULT_FIELDS = [
  { field: 'rows', type: 'array', desc: '数据列表' },
  { field: 'totalSize', type: 'number', desc: '总记录数' },
  { field: 'pageIndex', type: 'number', desc: '当前页码' },
  { field: 'pageSize', type: 'number', desc: '每页条数' },
  { field: 'totalPage', type: 'number', desc: '总页数' },
];

export function registerListCommand(
  vendor: Command
) {

  vendor
    .command('list')
    .description('查询供应商列表（分页）')
    .option('--page <page>', '页码，默认 1', '1')
    .option('--limit <limit>', '每页数量，默认 20', '20')
    .option('--keyword <keyword>', '供应商名称关键词')
    .option('--type <type>', '供应商类型：106=原厂 107=授权经销商 236=品牌方 237=总代理 238=其他')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        const dto = {
          page: parseInt(opts.page),
          size: parseInt(opts.limit),
          name: opts.keyword,
          type: opts.type ? parseInt(opts.type) : undefined,
        };
        const result = await getVendorList(client, dto);
        console.log(formatJsonWithFields(result, [...VENDOR_LIST_FIELDS, ...PAGE_RESULT_FIELDS]));
      } catch (e: any) {
    error(e);
        process.exit(1);
      }
    });
}
