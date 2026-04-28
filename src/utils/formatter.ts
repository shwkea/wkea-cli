type FieldDef = { field: string; type: string; desc: string };

function formatJson(data: unknown): string {
  return JSON.stringify(data, null, 2);
}

export function formatFieldsDoc(fields: FieldDef[]): string {
  const header = '| 字段 | 类型 | 说明 |\n|------|------|------|';
  const rows = fields
    .map((f) => `| ${f.field} | ${f.type} | ${f.desc} |`)
    .join('\n');
  return [header, rows].join('\n');
}

export function formatList<T extends Record<string, unknown>>(
  data: T[],
  fields: FieldDef[],
  pagination?: { total: number; current: number; size: number }
): string {
  const parts: string[] = [];
  if (pagination) {
    const totalPages = Math.ceil(pagination.total / pagination.size);
    parts.push(`**总数：${pagination.total}** | 第 ${pagination.current}/${totalPages} 页`);
    parts.push('');
  }
  parts.push('```json');
  parts.push(formatJson(data));
  parts.push('```');
  parts.push('');
  parts.push('## 字段说明');
  parts.push('');
  parts.push(formatFieldsDoc(fields));
  return parts.join('\n');
}

export function formatDetail<T extends Record<string, unknown>>(
  data: T,
  fields: FieldDef[]
): string {
  const parts: string[] = [];
  parts.push('```json');
  parts.push(formatJson(data));
  parts.push('```');
  parts.push('');
  parts.push('## 字段说明');
  parts.push('');
  parts.push(formatFieldsDoc(fields));
  return parts.join('\n');
}

export function formatOperation(op: string, detail?: string): string {
  return detail ? `${op}成功，${detail}` : `${op}成功`;
}

export function formatJsonWithFields(data: unknown, fields: FieldDef[]): string {
  const parts: string[] = [];
  parts.push('```json');
  parts.push(formatJson(data));
  parts.push('```');
  parts.push('');
  parts.push('## 字段说明');
  parts.push('');
  parts.push(formatFieldsDoc(fields));
  return parts.join('\n');
}
