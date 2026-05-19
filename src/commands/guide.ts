import { Command } from 'commander';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

/**
 * 给模块注册 guide 子命令，输出对应模块的业务文档
 */
export function registerGuide(module: Command, moduleName: string, docFile: string) {
  module
    .command('guide')
    .description(`查看 ${moduleName} 业务流程与操作指南`)
    .action(() => {
      const path = resolve(__dirname, '../../docs/modules', docFile);
      if (!existsSync(path)) {
        console.error(`文档 ${docFile} 不存在`);
        return;
      }
      const content = readFileSync(path, 'utf-8');
      console.log(content);
    });
}
