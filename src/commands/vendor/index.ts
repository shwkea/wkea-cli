import { Command } from 'commander';
import { registerCrudCommands } from './crud';
import { registerListCommand } from './list';
import { registerDropdownCommand } from './dropdown';
import { registerBrandCommands } from './brands';
import { registerCategoryCommands } from './categories';
import { registerAdvancedCommands } from './advanced';
import { registerContactCommands } from './contact';
import { registerEnumCommand } from './enum';

export function registerVendorCommands(program: Command) {
  registerCrudCommands(program);
  registerListCommand(program);
  registerDropdownCommand(program);
  registerBrandCommands(program);
  registerCategoryCommands(program);
  registerAdvancedCommands(program);
  registerContactCommands(program);
  registerEnumCommand(program);
}
