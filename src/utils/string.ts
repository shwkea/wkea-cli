/** 把 CLI 参数字符串中的转义序列转为真实字符 */
export function unescapeShellArg(s: string | undefined): string | undefined {
  if (s == null) return s;
  return s.replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/\\r/g, '\r');
}
