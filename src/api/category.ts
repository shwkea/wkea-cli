import { ApiClient, ApiResponse } from './client';

const CATEGORY_BASE = '/api/manage/category';

export interface CategoryListParams {
  id?: number;
  name?: string;
  fatherId?: number;
  purposeType?: number;
}

export interface CategoryVo {
  id: string;
  name: string;
  fatherId?: string;
  level?: number;
  purposeType?: number;
  desc?: string;
  image?: string;
  icon?: string;
  manageId?: string;
  manageName?: string;
  subCategory?: CategoryVo[];
}

function checkResponse<T>(resp: ApiResponse<T>): T {
  if (resp.status !== 200) {
    throw new Error(resp.msg || `请求失败(${resp.status})`);
  }
  return resp.data;
}

export async function listCategories(
  client: ApiClient,
  params: CategoryListParams
): Promise<CategoryVo[]> {
  const resp = await client.get<ApiResponse<CategoryVo[]>>(CATEGORY_BASE, params as Record<string, unknown>);
  return checkResponse(resp);
}

export async function searchCategory(
  client: ApiClient,
  name: string
): Promise<CategoryVo[]> {
  const resp = await client.get<ApiResponse<CategoryVo[]>>(`${CATEGORY_BASE}/search`, { name });
  return checkResponse(resp);
}
