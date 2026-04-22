import { getConfigToken } from '../config/index';
import { error } from '../utils/printer';

export function requireAuth(): string | null {
  const token = getConfigToken();
  if (!token) {
    error(
      '未登录或 Token 已过期，请先登录：wkea login --username <用户名> --password <密码>'
    );
    process.exit(1);
  }
  return token;
}
