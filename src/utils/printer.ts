export function success(message: string): void {
  console.log(`  [OK] ${message}`);
}

export function error(message: string): void {
  console.error(`  [ERR] ${message}`);
}

export function info(message: string): void {
  console.log(`  ${message}`);
}

export function warn(message: string): void {
  console.log(`  [WARN] ${message}`);
}

export function heading(message: string): void {
  console.log(`  ${message}`);
}
