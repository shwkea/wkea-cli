import { Command } from 'commander';
import { info } from '../../utils/printer';
import { ENUM_DOC } from '../../constants/enums';

export function registerEnumCommand(vendor: Command) {
  vendor
    .command('enum')
    .description('查看所有枚举值说明')
    .action(async () => {
      console.log(ENUM_DOC);
      info('\n品牌和分类请使用实际 ID，可通过供应商详情中的 brands/categories 字段查看已有绑定');
    });
}
