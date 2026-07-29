type FieldDef = { field: string; type: string; desc: string };

function formatJson(data: unknown): string {
  return JSON.stringify(data, null, 2);
}

function formatFieldsDoc(fields: FieldDef[]): string {
  const header = '| 字段 | 类型 | 说明 |\n|------|------|------|';
  const rows = fields
    .map((f) => `| ${f.field} | ${f.type} | ${f.desc} |`)
    .join('\n');
  return [header, rows].join('\n');
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
