import { Command } from 'commander';
import { getApiClient } from '../api/client';
import { ApiResponse } from '../api/client';
import { error } from '../utils/printer';

interface RelationSetItem {
  id: number;
  name: string;
  parentId: number;
  content: string;
}

interface RelationSetGroup {
  id: number;
  name: string;
  children: RelationSetItem[];
}

function buildGroups(data: RelationSetItem[]): RelationSetGroup[] {
  const roots: RelationSetGroup[] = [];
  const map = new Map<number, RelationSetGroup>();
  for (const item of data) {
    if (item.parentId === 0) {
      const g: RelationSetGroup = { id: item.id, name: item.name, children: [] };
      roots.push(g);
      map.set(item.id, g);
    }
  }
  for (const item of data) {
    if (item.parentId !== 0) {
      const parent = map.get(item.parentId);
      if (parent) {
        parent.children.push(item);
      }
    }
  }
  return roots;
}

export function registerEnumCommand(program: Command) {
  program
    .command('enum')
    .description('查看枚举值（从 API 拉取）')
    .option('-t, --type <name>', '只看指定类型，如：单位、税率、发票类型')
    .action(async (options) => {
      const client = getApiClient();
      try {
        const resp = await client.get<ApiResponse<RelationSetItem[]>>('/api/ec/set/type/all');
        if (resp.status !== 200 || !resp.data) {
          console.error(`  [ERR] 获取枚举失败：${resp.msg}`);
          return;
        }
        const groups = buildGroups(resp.data);

        if (options.type) {
          const matched = groups.filter(g => g.name.includes(options.type));
          if (matched.length === 0) {
            console.error(`  [ERR] 未找到类型：${options.type}`);
            return;
          }
          for (const g of matched) {
            console.log(`\n  ◆ ${g.name}（ID 范围: ${g.children.length > 0 ? `${g.children[0].id} ~ ${g.children[g.children.length-1].id}` : '无子项'}）`);
            if (g.children.length === 0) {
              console.log(`    （无子项）`);
            } else {
              for (const c of g.children) {
                console.log(`    ${String(c.id).padStart(4)}  ${c.name}`);
              }
            }
          }
          console.log('');
          return;
        }

        // 默认显示常用组
        const importantNames = ['单位', '税率', '发票类型', '支付方式', '配送方式', '订单状态', '售后类型', '交期', '企业类型'];
        const important = groups.filter(g => importantNames.some(n => g.name.includes(n)));
        const other = groups.filter(g => !importantNames.some(n => g.name.includes(n)));

        console.log('\n  WKEA 枚举速查（来源: /api/ec/set/type/all）\n');
        for (const g of [...important, ...other]) {
          console.log(`\n  ◆ ${g.name}`);
          if (g.children.length === 0) {
            console.log(`    （无子项）`);
          } else if (g.children.length <= 15) {
            for (const c of g.children) {
              console.log(`    ${String(c.id).padStart(4)}  ${c.name}`);
            }
          } else {
            for (const c of g.children.slice(0, 15)) {
              console.log(`    ${String(c.id).padStart(4)}  ${c.name}`);
            }
            console.log(`    ...（共 ${g.children.length} 项，用 --type "${g.name}" 查看全部）`);
          }
        }
        console.log('\n  查看指定类型示例：wkea enum --type 单位\n');
      } catch (e) {
        error(e);
      }
    });
}
