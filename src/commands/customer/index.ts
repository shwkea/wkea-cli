import { Command } from 'commander';
import { registerCustomerCommands } from './crud';

export function registerCustomerModule(program: Command) {
  registerCustomerCommands(program);
}
