import { ApiClient, ApiResponse } from './client';
import {
  GetCustomerDetailsVo,
  GetCustomerVo,
  PageResult,
} from '../types/customer';

const BASE = '/api/manageV2/business/customer';

function checkResponse<T>(resp: ApiResponse<T>): T {
  if (resp.status !== 200) {
    throw new Error(resp.msg || `请求失败(${resp.status})`);
  }
  return resp.data;
}

/** 创建客户 */
export async function createCustomer(client: ApiClient, dto: Record<string, unknown>): Promise<void> {
  const resp = await client.post<ApiResponse<null>>(BASE, dto);
  checkResponse(resp);
}

/** 客户详情 */
export async function getCustomerDetail(client: ApiClient, id: string): Promise<GetCustomerDetailsVo> {
  const resp = await client.get<ApiResponse<GetCustomerDetailsVo>>(`${BASE}/${id}`);
  return checkResponse(resp);
}

/** 更新客户 */
export async function updateCustomer(client: ApiClient, id: string, dto: Record<string, unknown>): Promise<void> {
  const resp = await client.put<ApiResponse<null>>(`${BASE}/${id}`, dto);
  checkResponse(resp);
}

/** 删除客户 */
export async function deleteCustomer(client: ApiClient, id: string): Promise<void> {
  const resp = await client.del<ApiResponse<null>>(`${BASE}/${id}`);
  checkResponse(resp);
}

/** 客户列表 */
export async function listCustomers(client: ApiClient, dto: Record<string, unknown>): Promise<PageResult<GetCustomerVo>> {
  const resp = await client.post<ApiResponse<PageResult<GetCustomerVo>>>(`${BASE}/list`, dto);
  return checkResponse(resp);
}
