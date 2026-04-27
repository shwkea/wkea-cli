import { Command } from 'commander';
import { spuCommands } from './spu';
import { skuCommands } from './sku';
import { supplyCommands } from './supply';
import { specCommands } from './spec';
import { attributeCommands } from './attribute';
import { quickCreateCommand } from './quick-create';

export function productCommands(program: Command) {
  spuCommands(program);
  skuCommands(program);
  supplyCommands(program);
  specCommands(program);
  attributeCommands(program);
  quickCreateCommand(program);
}
