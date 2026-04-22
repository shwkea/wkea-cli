import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export interface WkeaConfig {
  apiUrl: string;
  username: string;
  account: string;
  password: string;
  token: string;
  updatedAt: string;
}

const CONFIG_DIR = path.join(os.homedir(), '.wkea');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

function ensureDir(): void {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

export function loadConfig(): WkeaConfig | null {
  try {
    if (!fs.existsSync(CONFIG_FILE)) {
      return null;
    }
    const raw = fs.readFileSync(CONFIG_FILE, 'utf-8');
    return JSON.parse(raw) as WkeaConfig;
  } catch {
    return null;
  }
}

export function saveConfig(config: WkeaConfig): void {
  ensureDir();
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
}

export function clearConfig(): void {
  if (fs.existsSync(CONFIG_FILE)) {
    fs.unlinkSync(CONFIG_FILE);
  }
}

export function getConfigToken(): string | null {
  const config = loadConfig();
  return config?.token ?? null;
}

export function getApiUrl(): string {
  const config = loadConfig();
  if (!config?.apiUrl) {
    console.error('⚠ 尚未初始化 CLI，请先运行以下命令：');
    console.error('   wkea init');
    process.exit(1);
  }
  return config.apiUrl;
}
