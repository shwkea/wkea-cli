import * as fs from 'fs';
import * as path from 'path';

/**
 * 将 JSON 数据写入临时文件，供 AI 后续用 Read 工具完整读取。
 * 用于避免 CLI 输出过长时 AI 上下文截断只看前几条的问题。
 *
 * @param data 要写入的 JSON 数据
 * @param filename 不带路径的文件名（例如 "demand-items-3348.json"）
 * @returns 写入后的完整文件路径
 */
export function saveJsonToFile(data: unknown, filename: string): string {
  const dir = '/tmp/wkea-cli-json';
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const filePath = path.join(dir, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  return filePath;
}
