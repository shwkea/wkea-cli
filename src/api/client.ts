import axios, { AxiosInstance, AxiosError } from 'axios';

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export interface ApiResponse<T> {
  status: number;
  msg: string;
  data: T;
}

export class ApiClient {
  private client: AxiosInstance;

  constructor(baseURL: string, token: string | null) {
    if (!token) {
      throw new Error(
        '未登录或 Token 已过期，请先登录：wkea login --username <用户名> --password <密码>'
      );
    }
    this.client = axios.create({ baseURL });
    this.client.interceptors.request.use((config) => {
      config.headers['token'] = token;
      config.headers['Content-Type'] = 'application/json';
      return config;
    });
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response) {
          const status = error.response.status;
          if (status === 401) {
            return Promise.reject(
              new AuthError('Token 已过期或无效，请重新登录：wkea login')
            );
          }
          const data = error.response.data as any;
          return Promise.reject(new ApiError(data?.msg || error.message, status));
        }
        return Promise.reject(new ApiError(error.message, 0));
      }
    );
  }

  async get<T = unknown>(url: string, params?: Record<string, unknown>): Promise<T> {
    const resp = await this.client.get<any>(url, { params });
    return resp.data;
  }

  async post<T = unknown>(url: string, data?: unknown): Promise<T> {
    const resp = await this.client.post<any>(url, data);
    return resp.data;
  }

  async put<T = unknown>(url: string, data?: unknown): Promise<T> {
    const resp = await this.client.put<any>(url, data);
    return resp.data;
  }

  async del<T = unknown>(url: string): Promise<T> {
    const resp = await this.client.delete<any>(url);
    return resp.data;
  }

  async delete<T = unknown>(url: string): Promise<T> {
    return this.del<T>(url);
  }
}
