import { ApiClient, ApiResponse } from './client';

export interface EnvUrlsVo {
  manageMainUrl: string;
  ecUrl: string;
}

function checkResponse<T>(resp: ApiResponse<T>): T {
  if (resp.status !== 200) {
    throw new Error(resp.msg || `请求失败(${resp.status})`);
  }
  return resp.data;
}

const BASE = '/api/manageV2/system';

export async function getSystemUrls(client: ApiClient): Promise<EnvUrlsVo> {
  const resp = await client.get<ApiResponse<EnvUrlsVo>>(`${BASE}/urls`);
  return checkResponse(resp);
}
