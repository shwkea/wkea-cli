type FieldDef = { field: string; type: string; desc: string };

function truncate(s: unknown, max: number): string {
  const str = String(s ?? '');
  if (str.length <= max) return str;
  return str.substring(0, max - 1) + '…';
}

function formatValue(val: unknown, type: string): string {
  if (val === null || val === undefined) return '—';
  if (type === 'boolean') return val ? '✓' : '✗';
  if (type === 'datetime') {
    const str = String(val);
    return str.includes('T') ? str.replace('T', ' ').substring(0, 19) : str;
  }
  if (type === 'array') {
    const arr = val as unknown[];
    return arr.length === 0 ? '[]' : `[${arr.length}]`;
  }
  return String(val);
}

function formatListTable<T extends Record<string, unknown>>(
  data: T[],
  fields: FieldDef[],
  pagination?: { total: number; current: number; size: number }
): string {
  const MAX_COLS = 4;
  const cols = fields.slice(0, MAX_COLS);
  const MAX_W = 18;

  const widths = cols.map((f) => {
    const headerW = f.desc.length;
    const dataW = Math.max(...data.map((row) => formatValue(row[f.field], f.type).length));
    return Math.min(MAX_W, Math.max(headerW, dataW, 4));
  });

  const sep = '  +' + widths.map((w) => '-'.repeat(w)).join('+') + '+';
  const hCells = cols.map((f, i) => f.desc.substring(0, widths[i]).padEnd(widths[i]));

  const parts: string[] = [];
  if (pagination) {
    const totalPages = Math.ceil(pagination.total / pagination.size);
    parts.push(`  总数 ${pagination.total}    |    页码 ${pagination.current}/${totalPages}`);
    parts.push('');
  }

  parts.push(sep);
  parts.push('  |' + hCells.join('|') + '|');
  parts.push(sep);

  if (data.length === 0) {
    parts.push('  |' + widths.map((w) => '(无数据)'.padEnd(w)).join('|') + '|');
  } else {
    data.forEach((row) => {
      const cells = cols.map((f, i) => formatValue(row[f.field], f.type).substring(0, widths[i]).padEnd(widths[i]));
      parts.push('  |' + cells.join('|') + '|');
    });
  }
  parts.push(sep);
  return parts.join('\n');
}

function formatDetailCard<T extends Record<string, unknown>>(
  data: T,
  fields: FieldDef[]
): string {
  const col1 = Math.max(...fields.map((f) => f.desc.length), 10);
  const col2 = 60 - col1 - 4;
  const rows = fields
    .filter((f) => data[f.field] !== undefined && data[f.field] !== null)
    .map((f) => [f.desc, formatValue(data[f.field], f.type)] as [string, string]);

  if (rows.length === 0) return '  (无数据)';

  const lines: string[] = [];
  lines.push(`  +${'-'.repeat(col1)}+${'-'.repeat(col2)}+`);
  for (const [k, v] of rows) {
    lines.push(`  |${k.padEnd(col1)}|${truncate(v, col2).padEnd(col2)}|`);
  }
  lines.push(`  +${'-'.repeat(col1)}+${'-'.repeat(col2)}+`);
  return lines.join('\n');
}

export function formatFieldsDoc(fields: FieldDef[]): string {
  return fields
    .map((f) => `  ${f.field.padEnd(16)} ${f.type.padEnd(10)} ${f.desc}`)
    .join('\n');
}

export function formatList<T extends Record<string, unknown>>(
  data: T[],
  fields: FieldDef[],
  pagination?: { total: number; current: number; size: number }
): string {
  const parts: string[] = [];
  parts.push(formatListTable(data, fields, pagination));
  parts.push('');
  parts.push('  字段说明');
  parts.push('  ' + '-'.repeat(50));
  parts.push(formatFieldsDoc(fields));
  return parts.join('\n');
}

export function formatDetail<T extends Record<string, unknown>>(
  data: T,
  fields: FieldDef[]
): string {
  const parts: string[] = [];
  parts.push(formatDetailCard(data, fields));
  parts.push('');
  parts.push('  字段说明');
  parts.push('  ' + '-'.repeat(50));
  parts.push(formatFieldsDoc(fields));
  return parts.join('\n');
}

export function formatOperation(op: string, detail?: string): string {
  return detail ? `${op}成功，${detail}` : `${op}成功`;
}
