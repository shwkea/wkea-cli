import { Command } from 'commander';
import { getApiUrl } from '../../config';
import { ApiClient, ApiError } from '../../api/client';
import { formatOperation } from '../../utils/formatter';
import { success, error, info } from '../../utils/printer';

const SPEC_BASE = '/api/manage/product/spec';
const SPEC_PARAM_BASE = '/api/manage/product/spec/param';

interface SpecVo {
  id: number;
  name: string;
  manageName: string;
  midId: number;
  isFixed: boolean;
  isNameShow: boolean;
  sort: number;
  specParams?: SpecParam[];
}

interface SpecParam {
  id: number;
  name: string;
  tag: string;
  version?: string;
}

export function specCommands(product: Command) {
  const spec = product
    .command('spec')
    .description('规格（Spec）管理');

  // ========== 规格列表 ==========
  spec
    .command('list')
    .description('查询 SPU 关联的规格列表（V1）')
    .requiredOption('--spu-id <id>', 'SPU ID')
    .action(async (options) => {
      const client = new ApiClient(getApiUrl());
      try {
        const resp = await client.get<any>(`${SPEC_BASE}/spu`, {
          spu: options.spuId,
          pageIndex: 1,
          pageSize: 100,
        });
        if (!resp.data?.rows?.length) {
          info(`  ${options.spuId} 暂无规格`);
          return;
        }
        // /spec/spu 不返回 specParams，逐个查询每个规格的规格值
        for (const row of resp.data.rows) {
          const paramsResp = await client.get<any>(SPEC_BASE, {
            id: row.id,
            pageIndex: 1,
            pageSize: 1,
          });
          const specParams = paramsResp.data?.rows?.[0]?.specParams || [];

          console.log(`\n  [${row.id}] ${row.name}`);
          console.log(`    manageName: ${row.manageName}`);
          console.log(`    sort: ${row.sort} | isFixed: ${row.isFixed} | isNameShow: ${row.isNameShow}`);
          if (specParams.length) {
            console.log(`    规格值 (${specParams.length}):`);
            for (const p of specParams) {
              console.log(`      [${p.id}] ${p.name} (${p.tag})`);
            }
          } else {
            console.log(`    规格值: (暂无)`);
          }
        }
        console.log(`\n  共 ${resp.data.totalSize} 个规格`);
      } catch (e) {
        error(e);
        process.exit(1);
      }
    });

  // ========== 添加规格到 SPU ==========
  spec
    .command('add')
    .description('添加规格并绑定到 SPU（V1）')
    .requiredOption('--spu-id <id>', 'SPU ID')
    .requiredOption('--name <name>', '规格名称，如：颜色')
    .requiredOption('--tag <tag>', '模型标签，如：COLOR')
    .option('--sort <n>', '排序号', (v) => parseInt(v))
    .option('--manage-name <name>', '后台规格名，默认：SPU名称+规格名')
    .option('--fixed', '固定规格（前端默认选中）', false)
    .option('--name-show', '规格名在产品名中体现', false)
    .option('--param <json>', '规格值 JSON 数组，每项: {name:"值名",tag:"型号码",sort:序号}，tag 用于生成 SKU 型号  示例: --param \'[{"name":"红色","tag":"RED","sort":1}]\'')
    .action(async (options) => {
      const client = new ApiClient(getApiUrl());
      try {
        const spuId = options.spuId;
        const manageName = options.manageName || `${options.name}-${spuId}`;

        // Step 1: 尝试创建规格，若规格名重复则搜索已有 ID
        let specId: string;
        const specPayload = {
          name: options.name,
          manageName: manageName,
          sort: options.sort || 1,
          isFixed: options.fixed || false,
          isNameShow: options.nameShow || false,
        };
        try {
          const specResp = await client.post<any>(SPEC_BASE, specPayload);
          specId = specResp.data;
          success(`规格 "${options.name}" 创建成功 (ID: ${specId})`);
        } catch (e) {
          if (e instanceof ApiError && e.message.includes('已存在')) {
            // 规格名重复，按 manageName 搜索已有规格 ID
            info(`规格名已存在，搜索 manageName="${manageName}"...`);
            const searchResp = await client.get<any>(SPEC_BASE, {
              pageIndex: 1,
              pageSize: 10,
            });
            const rows = searchResp.data?.rows || [];
            const found = rows.find((r: any) => r.manageName === manageName);
            if (!found) throw new Error(`规格已存在但未找到 manageName="${manageName}" 的规格`);
            specId = String(found.id);
            success(`复用已有规格 "${options.name}" (ID: ${specId})`);
          } else {
            throw e;
          }
        }

        // Step 2: 绑定到 SPU
        try {
          await client.post<any>(`${SPEC_BASE}/bind`, {
            specId: parseInt(specId),
            spu: spuId,
            isInput: false,
          });
          success(`已绑定到 SPU ${spuId}`);
        } catch (e) {
          if (e instanceof ApiError && e.message.includes('已经绑定')) {
            info(`已绑定到 SPU ${spuId}（无需重复绑定）`);
          } else {
            throw e;
          }
        }

        // Step 3: 添加规格值（可选）
        if (options.param) {
          const parsed = JSON.parse(options.param) as { name: string; tag: string; sort?: number }[];
          for (const p of parsed) {
            try {
              await client.post<any>(SPEC_PARAM_BASE, {
                productSpecId: parseInt(specId),
                specs: [{ name: p.name, tag: p.tag, sort: p.sort || 1 }],
              });
            } catch (e) {
              if (!(e instanceof ApiError && e.message.includes('规格值已存在'))) throw e;
            }
          }
          success(`含 ${parsed.length} 个规格值`);
        }
      } catch (e) {
        error(e);
        process.exit(1);
      }
    });

  // ========== 解绑规格 ==========
  spec
    .command('unbind')
    .description('将规格从 SPU 解绑（V1）')
    .requiredOption('--spu-id <id>', 'SPU ID')
    .requiredOption('--spec-id <id>', '要解绑的规格 ID（spec_mid_spu 表的 midId）')
    .action(async (options) => {
      const client = new ApiClient(getApiUrl());
      try {
        // 解绑规格 = DELETE /api/manage/product/spec/{midId}
        const resp = await client.del<any>(`/api/manage/product/spec/${options.specId}`);
        if (resp.status !== 200) throw new Error(resp.msg || '解绑失败');
        success(formatOperation('解绑', '规格'));
      } catch (e) {
        error(e);
        process.exit(1);
      }
    });

  // ========== 规格值（param）子命令 ==========
  const specParam = spec
    .command('param')
    .description('规格值（SpecParam）管理');

  specParam
    .command('list')
    .description('查询某规格下的规格值列表')
    .requiredOption('--spec-id <id>', '规格 ID（product_spec 表的 id）')
    .action(async (options) => {
      const client = new ApiClient(getApiUrl());
      try {
        const resp = await client.get<any>('/api/manage/product/spec', {
          id: parseInt(options.specId),
          pageIndex: 1,
          pageSize: 100,
        });
        if (!resp.data?.rows?.length) {
          info(`  规格 ${options.specId} 暂无规格值`);
          return;
        }
        for (const row of resp.data.rows) {
          console.log(`\n  规格 [${row.id}] ${row.name} (${row.manageName})`);
          if (row.specParams?.length) {
            for (const p of row.specParams) {
              console.log(`    [${p.id}] ${p.name} (${p.tag})`);
            }
          } else {
            console.log(`    (暂无规格值)`);
          }
        }
      } catch (e) {
        error(e);
        process.exit(1);
      }
    });

  specParam
    .command('add')
    .description('为某规格添加规格值（V1）')
    .requiredOption('--spec-id <id>', '规格 ID（product_spec 表的 id）')
    .requiredOption('--name <name>', '规格值名称，如：红色')
    .requiredOption('--tag <tag>', '模型标签，如：RED')
    .option('--sort <n>', '排序号', (v) => parseInt(v))
    .action(async (options) => {
      const client = new ApiClient(getApiUrl());
      try {
        const payload = {
          productSpecId: parseInt(options.specId),
          specs: [{
            name: options.name,
            tag: options.tag,
            sort: options.sort || 1,
          }],
        };
        const resp = await client.post<any>(SPEC_PARAM_BASE, payload);
        if (resp.status !== 200) throw new Error(resp.msg || '添加规格值失败');
        success(`规格值 "${options.name}" 已添加到规格 ${options.specId}`);
      } catch (e) {
        error(e);
        process.exit(1);
      }
    });
}
