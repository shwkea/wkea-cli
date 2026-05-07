import { Command } from 'commander';
import { registerSalesContractCommands } from './crud';

export function registerSalesContractModule(program: Command) {
  registerSalesContractCommands(program);
}
