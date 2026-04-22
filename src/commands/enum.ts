import { Command } from 'commander';
import { ENUM_DOC } from '../constants/enums';

export function registerEnumCommand(program: Command) {
  program
    .command('enum')
    .description('查看所有枚举值说明')
    .action(async () => {
      console.log(ENUM_DOC);
    });
}
