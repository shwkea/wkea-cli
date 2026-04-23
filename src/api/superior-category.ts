import { ApiClient, ApiResponse } from './client';
import { SuperiorCategoryVo, CreateSuperiorCategoryDto, UpdateSuperiorCategoryDto } from '../types/superior-category';

const SUPERIOR_CATEGORY_BASE = '/api/manageV2/business/vendor';

function checkResponse<T>(resp: ApiResponse<T>): T {
  if (resp.status !== 200) {
    throw new Error(resp.msg || '请求失败');
  }
  return resp.data;
}

export async function listSuperiorCategories(
  client: ApiClient,
  vendorId: string
): Promise<SuperiorCategoryVo[]> {
  const resp = await client.get<ApiResponse<SuperiorCategoryVo[]>>(
    `${SUPERIOR_CATEGORY_BASE}/${vendorId}/superior-categories`
  );
  return checkResponse(resp);
}

export async function createSuperiorCategory(
  client: ApiClient,
  vendorId: string,
  dto: CreateSuperiorCategoryDto
): Promise<number> {
  const resp = await client.post<ApiResponse<number>>(
    `${SUPERIOR_CATEGORY_BASE}/${vendorId}/superior-categories`,
    dto
  );
  return checkResponse(resp);
}

export async function updateSuperiorCategory(
  client: ApiClient,
  vendorId: string,
  categoryId: number,
  dto: UpdateSuperiorCategoryDto
): Promise<void> {
  const resp = await client.put<ApiResponse<void>>(
    `${SUPERIOR_CATEGORY_BASE}/${vendorId}/superior-categories/${categoryId}`,
    dto
  );
  checkResponse(resp);
}

export async function deleteSuperiorCategory(
  client: ApiClient,
  vendorId: string,
  categoryId: number
): Promise<void> {
  const resp = await client.delete<ApiResponse<void>>(
    `${SUPERIOR_CATEGORY_BASE}/${vendorId}/superior-categories/${categoryId}`
  );
  // DELETE is idempotent - 200 or 404 are both considered success
  if (resp.status !== 200 && resp.status !== 404) {
    throw new Error(resp.msg || '删除失败');
  }
}
