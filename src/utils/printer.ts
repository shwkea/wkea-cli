import chalk from 'chalk';

export const dim = (s: string) => chalk.dim(s);

export function success(message: string): void {
  console.log(chalk.green('✓ ') + message);
}

export function error(message: string): void {
  console.error(chalk.red('✗ ') + message);
}

export function info(message: string): void {
  console.log(chalk.cyan('ℹ ') + message);
}

export function warn(message: string): void {
  console.log(chalk.yellow('⚠ ') + message);
}

export function heading(message: string): void {
  console.log(chalk.bold(message));
}
