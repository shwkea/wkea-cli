import { Command } from 'commander';
import { registerSalesOrderCommands } from './crud';

export function registerSalesOrderModule(program: Command) {
  registerSalesOrderCommands(program);
}
