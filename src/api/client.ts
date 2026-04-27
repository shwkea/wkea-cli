import axios, { AxiosInstance, AxiosError } from 'axios';
import { saveConfig, loadConfig, WkeaConfig } from '../config';

/** Get a configured ApiClient instance. Throws if config not initialized. */
export function getApiClient(): ApiClient {
  const cfg = loadConfig();
  if (!cfg?.apiUrl) throw new Error('请先运行 wkea init');
  return new ApiClient(cfg.apiUrl);
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

export class ApiError extends Error {
  status: number;
  detail?: string;
  constructor(message: string, status: number, detail?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.detail = detail;
  }
}

export interface ApiResponse<T> {
  status: number;
  msg: string;
  data: T;
}

/** 正在重登录的 Promise，避免多个请求同时触发重登录 */
let reloginPromise: Promise<string> | null = null;

export class ApiClient {
  private client: AxiosInstance;
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.client = axios.create({ baseURL });
    this.client.interceptors.request.use((config) => {
      const cfg = loadConfig();
      config.headers['token'] = cfg?.token || '';
      config.headers['Content-Type'] = 'application/json';
      config.headers['debug'] = 'true';
      return config;
    });
    this.client.interceptors.response.use(
      (response) => {
        const data = (response.data as any);
        if (data?.status !== undefined && data.status !== 200) {
          return Promise.reject(new ApiError(
            data?.msg || `请求失败(${data.status})`,
            data?.status || response.status,
            data?.detail || undefined
          ));
        }
        return response;
      },
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          const cfg = loadConfig();
          if (!cfg?.account || !cfg?.password) {
            return Promise.reject(
              new AuthError('Token 已过期，请重新运行：wkea init')
            );
          }
          // 网络不可达时 error.response 为 undefined
          if (!error.response) {
            return Promise.reject(new ApiError(
              error.message || '网络请求失败，请检查 API 是否启动',
              0,
              undefined
            ));
          }
          try {
            // 等待/触发重登录
            const newToken = await this.relogin(cfg);
            // 重试原请求，换上新 token
            const config = error.config!;
            config.headers!['token'] = newToken;
            const resp = await this.client.request(config);
            return resp;
          } catch (e) {
            return Promise.reject(e);
          }
        }
        const data = error.response?.data as any;
        return Promise.reject(new ApiError(
          data?.msg || error.message || '网络请求失败，请检查 API 是否启动',
          error.response?.status || 0,
          data?.detail || error.message || undefined
        ));
      }
    );
  }

  private async relogin(cfg: WkeaConfig): Promise<string> {
    // 如果已有其他请求在重登录，等待它完成
    if (reloginPromise) {
      return reloginPromise;
    }
    reloginPromise = (async () => {
      try {
        const resp = await axios.post(`${this.baseURL}/api/manage/passport/login`, {
          account: cfg.account,
          password: cfg.password,
        });
        if (resp.data.status !== 200) {
          throw new AuthError(`自动登录失败：${resp.data.msg || '请重新运行 wkea init'}`);
        }
        const newToken = typeof resp.data.data === 'string'
          ? resp.data.data
          : resp.data.data?.token;
        if (!newToken) {
          throw new AuthError('自动登录失败：未获取到 Token，请重新运行 wkea init');
        }
        // 更新本地配置
        const updated: WkeaConfig = { ...cfg, token: newToken, updatedAt: new Date().toISOString() };
        saveConfig(updated);
        return newToken;
      } finally {
        reloginPromise = null;
      }
    })();
    return reloginPromise;
  }

  async get<T = unknown>(url: string, params?: Record<string, unknown>): Promise<T> {
    const resp = await this.client.get<any>(url, { params });
    // 保留 body（含 status/msg/data），让调用方的 checkResponse 能读到 status
    return resp.data;
  }

  async post<T = unknown>(url: string, data?: unknown): Promise<T> {
    const resp = await this.client.post<any>(url, data);
    // resp 是 AxiosResponse，resp.data 是 HTTP body（ApiResponse 格式）
    // 保留 body（含 status/msg/data），让调用方的 checkResponse 能读到 status
    return resp.data;
  }

  async put<T = unknown>(url: string, data?: unknown): Promise<T> {
    const resp = await this.client.put<any>(url, data);
    return resp.data;
  }

  async del<T = unknown>(url: string, data?: unknown): Promise<T> {
    const resp = data !== undefined
      ? await this.client.delete<any>(url, { data })
      : await this.client.delete<any>(url);
    // 保留 body（含 status/msg/data）
    return resp.data;
  }

  async delete<T = unknown>(url: string): Promise<T> {
    return this.del<T>(url);
  }
}
