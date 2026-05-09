import { ApiClient, ApiResponse } from './client';

const CONTRACT_BASE = '/api/manageV2/business/sales-contract';

function checkResponse<T>(resp: ApiResponse<T>): T {
  if (resp.status !== 200) {
    throw new Error(resp.msg || `请求失败(${resp.status})`);
  }
  return resp.data;
}

// ========== 基础 CRUD ==========

export async function createContract(
  client: ApiClient,
  dto: Record<string, any>
): Promise<string> {
  const resp = await client.post<ApiResponse<string>>(`${CONTRACT_BASE}`, dto);
  return checkResponse(resp);
}

export async function listContracts(
  client: ApiClient,
  dto: { pageNum: number; pageSize: number; id?: string; customerId?: string; customerOrderId?: string }
): Promise<any> {
  const resp = await client.post<ApiResponse<any>>(`${CONTRACT_BASE}/list`, dto);
  return checkResponse(resp);
}

export async function contractDetail(
  client: ApiClient,
  id: string
): Promise<any> {
  const resp = await client.get<ApiResponse<any>>(`${CONTRACT_BASE}/${id}`);
  return checkResponse(resp);
}

export async function updateContract(
  client: ApiClient,
  dto: Record<string, any>
): Promise<void> {
  const resp = await client.put<ApiResponse<void>>(`${CONTRACT_BASE}`, dto);
  checkResponse(resp);
}

export async function deleteContract(
  client: ApiClient,
  id: string
): Promise<void> {
  const resp = await client.del<ApiResponse<void>>(`${CONTRACT_BASE}/${id}`);
  checkResponse(resp);
}

// ========== 业务操作 ==========

export async function transferOrder(
  client: ApiClient,
  id: string,
  dto: { manageId: string; distributionMode: number; payType: number; customerFreight: number; hasFreight: boolean; orderItems: Array<{ productSkuId: string; amount: number }> }
): Promise<void> {
  const body = { id, ...dto };
  const resp = await client.post<ApiResponse<void>>(`${CONTRACT_BASE}/${id}/transfer-order`, body);
  checkResponse(resp);
}

// ========== 合同行项目 CRUD ==========

export async function createContractLine(client: ApiClient, contractId: string, dto: Record<string, any>): Promise<any> {
  const resp = await client.post<ApiResponse<any>>(`${CONTRACT_BASE}/${contractId}/lines`, dto);
  return checkResponse(resp);
}

export async function listContractLines(client: ApiClient, contractId: string): Promise<any[]> {
  const resp = await client.get<ApiResponse<any[]>>(`${CONTRACT_BASE}/${contractId}/lines`);
  return checkResponse(resp);
}

export async function getContractLine(client: ApiClient, contractId: string, lineId: string): Promise<any> {
  const resp = await client.get<ApiResponse<any>>(`${CONTRACT_BASE}/${contractId}/line/${lineId}`);
  return checkResponse(resp);
}

export async function updateContractLine(client: ApiClient, contractId: string, lineId: string, dto: Record<string, any>): Promise<void> {
  const resp = await client.put<ApiResponse<void>>(`${CONTRACT_BASE}/${contractId}/line/${lineId}`, dto);
  checkResponse(resp);
}

export async function deleteContractLine(client: ApiClient, contractId: string, lineId: string): Promise<void> {
  const resp = await client.delete<ApiResponse<void>>(`${CONTRACT_BASE}/${contractId}/line/${lineId}`);
  checkResponse(resp);
}
