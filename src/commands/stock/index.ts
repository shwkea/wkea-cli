import { Command } from 'commander';
import { registerStockCommands } from './crud';

export function registerStockModule(program: Command) {
  registerStockCommands(program);
}
