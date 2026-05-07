import { ApiClient, ApiResponse } from './client';

const STOCK_BASE = '/api/manageV2/business/stock';

function checkResponse<T>(resp: ApiResponse<T>): T {
  if (resp.status !== 200) {
    throw new Error(resp.msg || `请求失败(${resp.status})`);
  }
  return resp.data;
}

// ========== 库存 CRUD ==========

export async function listStock(
  client: ApiClient,
  dto: { pageNum: number; pageSize: number; sku?: string; warehouseId?: number; productSkuId?: string; spuId?: number; name?: string; location?: string }
): Promise<any> {
  const resp = await client.post<ApiResponse<any>>(`${STOCK_BASE}/list`, dto);
  return checkResponse(resp);
}

export async function addStock(
  client: ApiClient,
  dto: { warehouseId: number; productSkuId: string; stock: number; location?: string; skuUnit?: number }
): Promise<void> {
  const resp = await client.post<ApiResponse<void>>(`${STOCK_BASE}`, dto);
  checkResponse(resp);
}

export async function modifyStock(
  client: ApiClient,
  dto: { id: number; stock?: number; location?: string }
): Promise<void> {
  const resp = await client.put<ApiResponse<void>>(`${STOCK_BASE}`, dto);
  checkResponse(resp);
}

export async function deleteStock(
  client: ApiClient,
  id: number
): Promise<void> {
  const resp = await client.del<ApiResponse<void>>(`${STOCK_BASE}/${id}`);
  checkResponse(resp);
}

// ========== 库存业务操作 ==========

export async function switchUnit(
  client: ApiClient,
  dto: { id: number; oldAmount: number; newUnit: number; newAmount: number }
): Promise<void> {
  const resp = await client.post<ApiResponse<void>>(`${STOCK_BASE}/switch-unit`, dto);
  checkResponse(resp);
}

export async function automaticSplitting(
  client: ApiClient,
  dto: { stockId: number; sentNum: number }
): Promise<void> {
  const resp = await client.post<ApiResponse<void>>(`${STOCK_BASE}/automatic-splitting`, dto);
  checkResponse(resp);
}

export async function expiredProducts(
  client: ApiClient,
  dto?: { days?: number }
): Promise<any> {
  const params: Record<string, unknown> = {};
  if (dto?.days) params.days = dto.days;
  const resp = await client.get<ApiResponse<any>>(`${STOCK_BASE}/expired`, params);
  return checkResponse(resp);
}

export async function productsOver60DaysOld(
  client: ApiClient
): Promise<any> {
  const resp = await client.get<ApiResponse<any>>(`${STOCK_BASE}/over-60-days`);
  return checkResponse(resp);
}

export async function moveExpiredInventory(
  client: ApiClient,
  stockId: number
): Promise<void> {
  const resp = await client.post<ApiResponse<void>>(`${STOCK_BASE}/move-expired/${stockId}`);
  checkResponse(resp);
}

export async function moveOver60DaysToDiscount(
  client: ApiClient,
  stockId: number
): Promise<void> {
  const resp = await client.post<ApiResponse<void>>(`${STOCK_BASE}/move-over-60-days/${stockId}`);
  checkResponse(resp);
}

export async function buyInfo(
  client: ApiClient,
  sku: string
): Promise<any> {
  const resp = await client.get<ApiResponse<any>>(`${STOCK_BASE}/buy-info/${sku}`);
  return checkResponse(resp);
}

// ========== 仓库操作 ==========

export async function listWarehouses(
  client: ApiClient,
  name?: string
): Promise<any> {
  const params: Record<string, unknown> = {};
  if (name) params.name = name;
  const resp = await client.get<ApiResponse<any>>(`${STOCK_BASE}/warehouses`, params);
  return checkResponse(resp);
}

export async function warehouseDetail(
  client: ApiClient,
  id: number
): Promise<any> {
  const resp = await client.get<ApiResponse<any>>(`${STOCK_BASE}/warehouses/${id}`);
  return checkResponse(resp);
}

export async function addOrUpdateWarehouse(
  client: ApiClient,
  data: { id?: number; name: string }
): Promise<void> {
  const resp = await client.post<ApiResponse<void>>(`${STOCK_BASE}/warehouses`, data);
  checkResponse(resp);
}

export async function deleteWarehouse(
  client: ApiClient,
  id: number
): Promise<void> {
  const resp = await client.del<ApiResponse<void>>(`${STOCK_BASE}/warehouses/${id}`);
  checkResponse(resp);
}

export async function skuExistStock(
  client: ApiClient,
  sku: string
): Promise<any> {
  const resp = await client.get<ApiResponse<any>>(`${STOCK_BASE}/sku-exist/${sku}`);
  return checkResponse(resp);
}
