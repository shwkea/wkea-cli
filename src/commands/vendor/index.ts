import { Command } from 'commander';
import { registerCrudCommands } from './crud';
import { registerListCommand } from './list';
import { registerDropdownCommand } from './dropdown';
import { registerBrandCommands } from './brands';
import { registerCategoryCommands } from './categories';
import { registerAdvancedCommands } from './advanced';

export function registerVendorCommands(
  program: Command,
  token: string | null,
  env: 'prod' | 'test'
) {
  registerCrudCommands(program, token, env);
  registerListCommand(program, token, env);
  registerDropdownCommand(program, token, env);
  registerBrandCommands(program, token, env);
  registerCategoryCommands(program, token, env);
  registerAdvancedCommands(program, token, env);
}
