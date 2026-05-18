import { Command } from 'commander';
import { registerProgressCommands } from './crud';

export function registerProgressModule(progress: Command) {
  registerProgressCommands(progress);
}
