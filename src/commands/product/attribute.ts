import { Command } from 'commander';
import { getApiUrl } from '../../config';
import { ApiClient } from '../../api/client';
import { formatOperation } from '../../utils/formatter';
import { success, error, info } from '../../utils/printer';

const ATTR_BASE = '/api/manageV2/attributes';
const SPU_BASE = '/api/manageV2/spu';
const SKU_BASE = '/api/manageV2/sku';

export function attributeCommands(product: Command) {
  const attr = product
    .command('attribute')
    .description('属性（Attribute）管理');

  // ========== 属性定义 ==========

  attr
    .command('list')
    .description('属性列表（分页）')
    .option('--name <name>', '属性名称（模糊搜索）')
    .option('--page <n>', '页码', (v) => parseInt(v))
    .option('--size <n>', '每页数量', (v) => parseInt(v))
    .action(async (options) => {
      const client = new ApiClient(getApiUrl());
      try {
        const page = options.page ?? 1;
        const size = options.size ?? 20;
        const resp = await client.get<{ status: number; data: { rows: unknown[]; totalSize: number }; msg?: string }>(
          `${ATTR_BASE}?name=${options.name ?? ''}&page=${page}&size=${size}`
        );
        if (resp.status !== 200) throw new Error(resp.msg || '请求失败');
        const rows = resp.data.rows;
        if (!rows.length) {
          info('暂无属性');
        } else {
          for (const r of rows as { id: number; name: string; manageName: string }[]) {
            info(`  [${r.id}] ${r.name}（${r.manageName}）`);
          }
        }
        success(`共 ${resp.data.totalSize} 条`);
      } catch (e: any) {
    error(e);
        process.exit(1);
      }
    });

  attr
    .command('create')
    .description('新增属性')
    .requiredOption('--name <name>', '属性名称（前台展示）')
    .requiredOption('--manage-name <manageName>', '后台属性名字')
    .action(async (options) => {
      const client = new ApiClient(getApiUrl());
      try {
        const resp = await client.post<{ status: number; msg?: string }>(ATTR_BASE, {
          name: options.name,
          manageName: options.manageName,
        });
        if (resp.status !== 200) throw new Error(resp.msg || '请求失败');
        success(formatOperation('新增', '属性'));
      } catch (e: any) {
    error(e);
        process.exit(1);
      }
    });

  attr
    .command('update')
    .description('修改属性')
    .requiredOption('--id <id>', '属性 ID')
    .requiredOption('--name <name>', '属性名称（前台展示）')
    .requiredOption('--manage-name <manageName>', '后台属性名字')
    .action(async (options) => {
      const client = new ApiClient(getApiUrl());
      try {
        const resp = await client.put<{ status: number; msg?: string }>(`${ATTR_BASE}/${options.id}`, {
          name: options.name,
          manageName: options.manageName,
        });
        if (resp.status !== 200) throw new Error(resp.msg || '请求失败');
        success(formatOperation('修改', '属性'));
      } catch (e: any) {
    error(e);
        process.exit(1);
      }
    });

  attr
    .command('delete')
    .description('批量删除属性')
    .requiredOption('--ids <ids>', '属性 ID，逗号分隔')
    .action(async (options) => {
      const client = new ApiClient(getApiUrl());
      try {
        const ids = options.ids.split(',').map((s: string) => parseInt(s.trim()));
        const resp = await (client as any).del(ATTR_BASE, ids) as { status: number; msg?: string };
        if (resp.status !== 200) throw new Error(resp.msg || '请求失败');
        success(formatOperation('删除', `属性（${ids.length} 条）`));
      } catch (e: any) {
    error(e);
        process.exit(1);
      }
    });

  // ========== SPU 属性 ==========

  attr
    .command('spu-list')
    .description('查询 SPU 绑定的属性列表')
    .requiredOption('--spu-id <spuId>', 'SPU ID')
    .action(async (options) => {
      const client = new ApiClient(getApiUrl());
      try {
        const resp = await client.get<{ status: number; data: unknown[]; msg?: string }>(
          `${SPU_BASE}/${options.spuId}/attributes`
        );
        if (resp.status !== 200) throw new Error(resp.msg || '请求失败');
        const rows = resp.data;
        if (!rows.length) {
          info('SPU 暂无绑定属性');
        } else {
          for (const r of rows as { id: number; name: string; manageName: string; attributeSort?: number }[]) {
            info(`  [${r.id}] ${r.name}（${r.manageName}）排序:${r.attributeSort ?? '-'}`);
          }
        }
        success(`共 ${rows.length} 条`);
      } catch (e: any) {
    error(e);
        process.exit(1);
      }
    });

  attr
    .command('spu-bind')
    .description('SPU 绑定属性')
    .requiredOption('--spu-id <spuId>', 'SPU ID')
    .requiredOption('--attr-id <id>', '属性 ID')
    .option('--sort <n>', '排序', (v) => parseInt(v))
    .action(async (options) => {
      const client = new ApiClient(getApiUrl());
      try {
        const resp = await client.post<{ status: number; msg?: string }>(
          `${SPU_BASE}/${options.spuId}/attributes/bind`,
          { attributes: [{ attributeId: parseInt(options.attrId), attributeSort: options.sort ?? 0 }] }
        );
        if (resp.status !== 200) throw new Error(resp.msg || '请求失败');
        success(formatOperation('绑定', '属性到 SPU'));
      } catch (e: any) {
    error(e);
        process.exit(1);
      }
    });

  attr
    .command('spu-values')
    .description('查询 SPU 属性值')
    .requiredOption('--spu-id <spuId>', 'SPU ID')
    .action(async (options) => {
      const client = new ApiClient(getApiUrl());
      try {
        const resp = await client.get<{ status: number; data: unknown[]; msg?: string }>(
          `${SPU_BASE}/${options.spuId}/attribute-values`
        );
        if (resp.status !== 200) throw new Error(resp.msg || '请求失败');
        const rows = resp.data;
        if (!rows.length) {
          info('暂无属性值');
        } else {
          for (const r of rows as { attributeId: number; name: string; value: string; isShow?: boolean }[]) {
            info(`  [${r.attributeId}] ${r.name} = ${r.value || '(空)'} 显示:${r.isShow ? '是' : '否'}`);
          }
        }
        success(`共 ${rows.length} 条`);
      } catch (e: any) {
    error(e);
        process.exit(1);
      }
    });

  attr
    .command('spu-set')
    .description('更新 SPU 属性值')
    .requiredOption('--spu-id <spuId>', 'SPU ID')
    .requiredOption('--attr-id <id>', '属性 ID')
    .option('--value <value>', '属性值')
    .option('--show', '设为显示（默认 true）', true)
    .option('--hide', '设为隐藏', false)
    .action(async (options) => {
      const client = new ApiClient(getApiUrl());
      try {
        const resp = await client.put<{ status: number; msg?: string }>(
          `${SPU_BASE}/${options.spuId}/attribute/${options.attrId}`,
          {
            attributeId: parseInt(options.attrId),
            skuId: options.spuId,
            value: options.value ?? '',
            isShow: options.hide ? false : true,
          }
        );
        if (resp.status !== 200) throw new Error(resp.msg || '请求失败');
        success(formatOperation('更新', 'SPU 属性值'));
      } catch (e: any) {
    error(e);
        process.exit(1);
      }
    });

  // ========== SKU 属性 ==========

  attr
    .command('sku-list')
    .description('查询 SKU 属性值（含 SPU 级继承覆盖）')
    .requiredOption('--sku-id <skuId>', 'SKU ID')
    .action(async (options) => {
      const client = new ApiClient(getApiUrl());
      try {
        const resp = await client.get<{ status: number; data: unknown[]; msg?: string }>(
          `${SKU_BASE}/${options.skuId}/attributes`
        );
        if (resp.status !== 200) throw new Error(resp.msg || '请求失败');
        const rows = resp.data;
        if (!rows.length) {
          info('SKU 暂无属性');
        } else {
          for (const r of rows as { attributeId: number; name: string; value: string; isShow?: boolean }[]) {
            info(`  [${r.attributeId}] ${r.name} = ${r.value || '(空)'} 显示:${r.isShow ? '是' : '否'}`);
          }
        }
        success(`共 ${rows.length} 条`);
      } catch (e: any) {
    error(e);
        process.exit(1);
      }
    });

  attr
    .command('sku-set')
    .description('更新 SKU 属性值')
    .requiredOption('--sku-id <skuId>', 'SKU ID')
    .requiredOption('--attr-id <id>', '属性 ID')
    .option('--value <value>', '属性值')
    .option('--show', '设为显示（默认 true）', true)
    .option('--hide', '设为隐藏', false)
    .action(async (options) => {
      const client = new ApiClient(getApiUrl());
      try {
        const resp = await client.put<{ status: number; msg?: string }>(
          `${SKU_BASE}/${options.skuId}/attribute/${options.attrId}`,
          {
            attributeId: parseInt(options.attrId),
            skuId: options.skuId,
            value: options.value ?? '',
            isShow: options.hide ? false : true,
          }
        );
        if (resp.status !== 200) throw new Error(resp.msg || '请求失败');
        success(formatOperation('更新', 'SKU 属性值'));
      } catch (e: any) {
    error(e);
        process.exit(1);
      }
    });
}
