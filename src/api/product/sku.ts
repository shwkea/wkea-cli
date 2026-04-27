import { ApiClient, ApiResponse } from '../client';
import { PageResult } from '../../types/vendor';

export interface SkuDetailVo {
  skuId: string;
  spuId: string;
  spuName?: string;
  name: string;
  skuCode?: string;
  price?: number;
  stock?: number;
  weight?: number;
  unit?: string;
  specValues: SkuSpecValueVo[];
  supplies: SkuSupplyVo[];
  extraColumns: SkuExtraColumnVo[];
  createdTime: string;
}

export interface SkuSpecValueVo {
  specId: number;
  specName: string;
  paramId: number;
  paramName: string;
}

export interface SkuSupplyVo {
  vendorId: string;
  vendorName: string;
  salesPrice?: number;
  purchasePrice?: number;
  stock?: number;
}

export interface SkuExtraColumnVo {
  columnKey: string;
  columnTitle: string;
  columnType: string;
  columnValue: string;
}

export interface SkuListVo {
  skuId: string;
  spuId: string;
  name: string;
  price?: number;
  stock?: number;
  createdTime?: string;
}

export interface CreateSkuDto {
  spu: string;
  name: string;
  skuCode?: string;
  price?: number;
  stock?: number;
  weight?: number;
  unit?: string;
}

export interface UpdateSkuDto {
  name?: string;
  skuCode?: string;
  price?: number;
  stock?: number;
  weight?: number;
  unit?: string;
}

export interface SkuListParams {
  page?: number;
  size?: number;
  spu?: string;
  keyword?: string;
  hasSupply?: boolean;
  minPrice?: number;
  maxPrice?: number;
}

export interface SpecItem {
  specId: number;
  paramId: number;
}

function checkResponse<T>(resp: ApiResponse<T>): T {
  if (resp.status !== 200) {
    throw new Error(resp.msg || '请求失败');
  }
  return resp.data;
}

// K1: 创建 SKU
export async function createSku(client: ApiClient, dto: CreateSkuDto): Promise<string> {
  const resp = await client.post<ApiResponse<string>>('/api/manageV2/sku', dto);
  return checkResponse(resp);
}

// K2: SKU 详情
export async function getSku(client: ApiClient, skuId: string): Promise<SkuDetailVo> {
  const resp = await client.get<ApiResponse<SkuDetailVo>>(`/api/manageV2/sku/${skuId}`);
  return checkResponse(resp);
}

// K3: 更新 SKU
export async function updateSku(client: ApiClient, skuId: string, dto: UpdateSkuDto): Promise<void> {
  const resp = await client.put<ApiResponse<void>>(`/api/manageV2/sku/${skuId}`, dto);
  checkResponse(resp);
}

// K4: 删除 SKU
export async function deleteSku(client: ApiClient, skuId: string): Promise<void> {
  const resp = await client.delete<ApiResponse<void>>(`/api/manageV2/sku/${skuId}`);
  checkResponse(resp);
}

// K5: SKU 列表
export async function listSku(client: ApiClient, params: SkuListParams): Promise<PageResult<SkuListVo>> {
  const resp = await client.post<ApiResponse<PageResult<SkuListVo>>>('/api/manageV2/sku/list', params);
  return checkResponse(resp);
}

// K6: 按 SPU 查 SKU
export async function listSkuBySpu(client: ApiClient, spuId: string): Promise<SkuListVo[]> {
  const resp = await client.get<ApiResponse<SkuListVo[]>>(`/api/manageV2/sku/bySpu/${spuId}`);
  return checkResponse(resp);
}

// K7: SKU 克隆
export async function cloneSku(client: ApiClient, skuId: string, newName?: string): Promise<string> {
  const body = newName ? { sku: skuId, name: newName } : { sku: skuId };
  const resp = await client.post<ApiResponse<string>>('/api/manageV2/sku/clone', body);
  return checkResponse(resp);
}

// K8: 批量删除
export async function batchDeleteSku(client: ApiClient, ids: string[]): Promise<void> {
  const resp = await client.post<ApiResponse<void>>('/api/manageV2/sku/batchDelete', ids);
  checkResponse(resp);
}

// K9: 批量上下架
export async function batchShelfSku(client: ApiClient, ids: string[], shelf: boolean): Promise<void> {
  const resp = await client.post<ApiResponse<void>>('/api/manageV2/sku/batchShelf', { ids, shelf });
  checkResponse(resp);
}

// SP5: 获取 SKU 规格值
export async function getSkuSpecValues(client: ApiClient, skuId: string): Promise<SkuSpecValueVo[]> {
  const resp = await client.get<ApiResponse<SkuSpecValueVo[]>>(`/api/manageV2/sku/${skuId}/spec-values`);
  return checkResponse(resp);
}

// SP6: 保存 SKU 规格值
export async function saveSkuSpecValues(client: ApiClient, skuId: string, specs: SpecItem[]): Promise<void> {
  const resp = await client.put<ApiResponse<void>>(`/api/manageV2/sku/${skuId}/spec-values`, specs);
  checkResponse(resp);
}

// E3: 获取 SKU 扩展字段
export async function getSkuExtraColumns(client: ApiClient, skuId: string): Promise<SkuExtraColumnVo[]> {
  const resp = await client.get<ApiResponse<SkuExtraColumnVo[]>>(`/api/manageV2/sku/${skuId}/extra-columns`);
  return checkResponse(resp);
}

// E4: 保存 SKU 扩展字段
export async function saveSkuExtraColumns(client: ApiClient, skuId: string, columns: Record<string, string>): Promise<void> {
  const extraColumns = Object.entries(columns).map(([columnKey, columnValue]) => ({ columnKey, columnValue }));
  const resp = await client.put<ApiResponse<void>>(`/api/manageV2/sku/${skuId}/extra-columns`, { extraColumns });
  checkResponse(resp);
}
