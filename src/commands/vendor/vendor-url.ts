import { Command } from 'commander';
import { ApiClient } from '../../api/client';
import {
  getVendorUrls,
  createVendorUrl,
  updateVendorUrl,
  deleteVendorUrl,
} from '../../api/vendor';
import { formatJsonWithFields, formatOperation } from '../../utils/formatter';
import { success, error } from '../../utils/printer';
import { getApiUrl } from '../../config';

const URL_FIELDS = [
  { field: 'id', type: 'string', desc: '链接ID' },
  { field: 'vendorId', type: 'string', desc: '供应商ID' },
  { field: 'urlName', type: 'string', desc: '链接名称' },
  { field: 'url', type: 'string', desc: '链接地址' },
  { field: 'type', type: 'number', desc: '类型' },
  { field: 'createdTime', type: 'datetime', desc: '创建时间' },
  { field: 'updatedTime', type: 'datetime', desc: '更新时间' },
];

export function registerVendorUrlCommands(vendor: Command) {

  // list
  vendor
    .command('url-list')
    .description('查询供应商链接列表')
    .requiredOption('--vendor-id <vendorId>', '供应商ID（必填）')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        const result = await getVendorUrls(client, opts.vendorId);
        console.log(formatJsonWithFields(result, URL_FIELDS));
      } catch (e: any) {
        error(e);
        process.exit(1);
      }
    });

  // add
  vendor
    .command('url-add')
    .description('新增供应商链接')
    .requiredOption('--vendor-id <vendorId>', '供应商ID（必填）')
    .option('--url-name <urlName>', '链接名称')
    .option('--url <url>', '链接地址')
    .option('--type <type>', '类型')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        const dto: Record<string, any> = {};
        if (opts.urlName) dto.urlName = opts.urlName;
        if (opts.url) dto.url = opts.url;
        if (opts.type) dto.type = parseInt(opts.type);
        await createVendorUrl(client, opts.vendorId, dto);
        success(formatOperation('新增链接'));
      } catch (e: any) {
        error(e);
        process.exit(1);
      }
    });

  // update
  vendor
    .command('url-update')
    .description('更新供应商链接')
    .requiredOption('--vendor-id <vendorId>', '供应商ID（必填）')
    .requiredOption('--url-id <urlId>', '链接ID（必填）')
    .option('--url-name <urlName>', '链接名称')
    .option('--url <url>', '链接地址')
    .option('--type <type>', '类型')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        const dto: Record<string, any> = {};
        if (opts.urlName) dto.urlName = opts.urlName;
        if (opts.url) dto.url = opts.url;
        if (opts.type) dto.type = parseInt(opts.type);
        await updateVendorUrl(client, opts.vendorId, parseInt(opts.urlId), dto);
        success(formatOperation('更新链接'));
      } catch (e: any) {
        error(e);
        process.exit(1);
      }
    });

  // delete
  vendor
    .command('url-delete')
    .description('删除供应商链接')
    .requiredOption('--vendor-id <vendorId>', '供应商ID（必填）')
    .requiredOption('--url-id <urlId>', '链接ID（必填）')
    .action(async (opts) => {
      const client = new ApiClient(getApiUrl());
      try {
        await deleteVendorUrl(client, opts.vendorId, parseInt(opts.urlId));
        success(formatOperation('删除链接'));
      } catch (e: any) {
        error(e);
        process.exit(1);
      }
    });
}
