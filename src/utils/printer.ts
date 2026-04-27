export function success(message: string): void {
  console.log(`  [OK] ${message}`);
}

export function error(err: unknown): void {
  const msg = err instanceof Error ? err.message : String(err);
  const detail = (err as any)?.detail;
  console.error(`  [ERR] ${msg}`);
  if (detail) {
    // 只显示关键行，过滤框架噪音
    const lines = detail.split('\n');
    const useful = lines.filter((l: string) =>
      l.includes('Caused by:') ||
      l.includes('com.wkeaapi') ||
      (l.includes('SQL') && l.includes('Error')) ||
      (l.includes('###') && !l.includes('may exist'))
    );
    const shown = useful.slice(0, 8);
    if (shown.length > 0) {
      console.error('\n  --- 后端堆栈 ---');
      for (const l of shown) console.error('  ' + l.trim());
      console.error('');
    }
  }
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
