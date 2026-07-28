import { Command } from 'commander';
import { registerCrudCommands } from './crud';
import { registerListCommand } from './list';
import { registerParseCommand } from './parse';
import { registerProcessCommand } from './process';

export function registerDemandCommands(program: Command) {
  registerCrudCommands(program);
  registerListCommand(program);
  registerProcessCommand(program);
  registerParseCommand(program);
}
