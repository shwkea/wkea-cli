import { Command } from 'commander';
import { registerCrudCommands } from './crud';
import { registerListCommand } from './list';
import { registerProcessCommand } from './process';
import { registerParseCommand } from './parse';

export function registerDemandCommands(program: Command) {
  registerCrudCommands(program);
  registerListCommand(program);
  registerProcessCommand(program);
  registerParseCommand(program);
}
