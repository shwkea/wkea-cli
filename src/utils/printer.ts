export function success(message: string): void {
  console.log(`  [OK] ${message}`);
}

export function error(err: unknown): void {
  if (err === null) {
    console.error('  [ERR] (未知错误: null)');
    return;
  }
  if (err === undefined) {
    console.error('  [ERR] (未知错误: undefined)');
    return;
  }

  const name = (err as any)?.name || (err instanceof Error ? err.name : '');
  const msg = (err instanceof Error ? err.message : String(err)).trim();
  const status = (err as any)?.status;
  const detail = (err as any)?.detail;
  const code = (err as any)?.code;

  // 第一行：错误类型 + 消息
  if (msg) {
    console.error(`  [ERR] ${name ? name + ': ' : ''}${msg}`);
  } else {
    // 消息为空时，尝试从 error 对象里挖其他字段
    const resp = (err as any)?.response;
    if (resp) {
      console.error(`  [ERR] ${name || 'RequestError'}: ${resp.statusText || '(无响应文本)'}`);
      if (resp.status) console.error(`  状态码: ${resp.status}`);
      if (resp.data?.msg) console.error(`  接口消息: ${resp.data.msg}`);
    } else {
      console.error(`  [ERR] ${name || 'UnknownError'}: (空错误消息)`);
    }
  }

  // 其他有用字段
  if (status) console.error(`  状态码: ${status}`);
  if (code) console.error(`  错误码: ${code}`);

  // 后端堆栈
  if (detail) {
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
    }
  }

  // 兜底：完全没有有效信息时
  if (!msg && !status && !code && !detail && !(err as any)?.response) {
    console.error('  原始错误:', String(err));
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
