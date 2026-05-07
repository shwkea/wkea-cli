import { Command } from 'commander';
import { registerQuotationCommands } from './crud';

export function registerQuotationModule(program: Command) {
  registerQuotationCommands(program);
}
