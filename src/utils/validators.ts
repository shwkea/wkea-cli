/**
 * CLI 参数防呆校验
 * 任何 id 类必填参数都应该走这里，避免把"None"等占位符传给后端
 */

/**
 * 要求参数必须是正整数。否则直接抛错，不发请求。
 * @param value CLI 入参（字符串）
 * @param name 参数名（用于报错信息）
 * @returns 合法正整数
 */
export function requirePositiveInt(value: string | undefined, name: string): number {
  if (value == null || value === '' || value === undefined) {
    throw new Error(`参数 --${name} 必填，且必须是正整数（收到了空值）`);
  }
  const s = String(value).trim();
  if (s === '' || s.toLowerCase() === 'none' || s.toLowerCase() === 'null' || s.toLowerCase() === 'undefined') {
    throw new Error(`参数 --${name} 不能是占位符（"None"/"null"/"undefined"），请填入真实的正整数。当前值: "${value}"`);
  }
  // 只接受纯数字（避免 "123abc" 这种）
  if (!/^[1-9]\d*$/.test(s)) {
    throw new Error(`参数 --${name} 必须是正整数，当前值: "${value}"`);
  }
  return parseInt(s, 10);
}

/**
 * 可选的正整数参数。空值/undefined 返回 undefined。
 */
export function optionalPositiveInt(value: string | undefined): number | undefined {
  if (value == null || String(value).trim() === '') return undefined;
  return requirePositiveInt(value, 'value');
}
