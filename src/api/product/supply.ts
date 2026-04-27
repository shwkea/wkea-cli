import { ApiClient, ApiResponse } from '../client';
import { BindResultVo } from '../../types/vendor';
import { SpuVendorVo } from './spu';

// ============ 类型定义 ============

export interface SetSupplyDto {
  vendorsId: string;
  salesPrice?: number;
  purchasePrice?: number;
  purchaseDeliver?: number;
  stock?: number;
  orderNumber?: string;
  model?: string;
  shippingLocation?: string;
  remark?: string;
}

export interface SupplyDetailVo {
  vendorId: string;
  vendorName?: string;
  salesPrice?: number;
  purchasePrice?: number;
  purchaseDeliver?: number;
  stock?: number;
  orderNumber?: string;
  model?: string;
  shippingLocation?: string;
  remark?: string;
  updatedTime?: string;
}

export interface SupplySummaryVo {
  skuId: string;
  supplyCount?: number;
  minPurchasePrice?: number;
}

export interface SkuSupplyItem {
  skuId: string;
  skuName: string;
  supplyMap: Record<string, SupplyBrief>;
}

export interface SupplyBrief {
  salesPrice?: number;
  stock?: number;
  purchaseDeliver?: number;
}

export interface SpuSupplyListVo {
  spuId: string;
  spuName?: string;
  vendors: SpuVendorVo[];
  skuSupplies: SkuSupplyItem[];
}

// ============ 内部辅助 ============

function checkResponse<T>(resp: ApiResponse<T>): T {
  if (resp.status !== 200) {
    throw new Error(resp.msg || '请求失败');
  }
  return resp.data;
}

// ============ SPU 供应商绑定 (V1-V4) ============

const SPU_BASE = '/api/manageV2/spu';
const SKU_BASE = '/api/manageV2/sku';

export async function bindSpuVendors(
  client: ApiClient,
  spuId: string,
  vendorId: string,
  remark?: string
): Promise<BindResultVo> {
  const resp = await client.post<ApiResponse<BindResultVo>>(
    `${SPU_BASE}/${spuId}/bind-vendors`,
    { vendorIds: [vendorId], remark }
  );
  return checkResponse(resp);
}

export async function getSpuVendors(
  client: ApiClient,
  spuId: string
): Promise<SpuVendorVo[]> {
  const resp = await client.get<ApiResponse<SpuVendorVo[]>>(
    `${SPU_BASE}/${spuId}/vendors`
  );
  return checkResponse(resp);
}

export async function unbindSpuVendor(
  client: ApiClient,
  spuId: string,
  vendorId: string
): Promise<void> {
  const resp = await client.delete<ApiResponse<void>>(
    `${SPU_BASE}/${spuId}/vendor/${vendorId}`
  );
  checkResponse(resp);
}

// ============ SKU 供应信息 (SV1-SV7) ============

export async function setSupply(
  client: ApiClient,
  skuId: string,
  dto: SetSupplyDto
): Promise<void> {
  const resp = await client.post<ApiResponse<void>>(
    `${SKU_BASE}/${skuId}/supply`,
    {
      vendorsId: dto.vendorsId,
      salesPrice: dto.salesPrice,
      purchasePrice: dto.purchasePrice,
      purchaseDeliver: dto.purchaseDeliver,
      stock: dto.stock,
      orderNumber: dto.orderNumber,
      model: dto.model,
      shippingLocation: dto.shippingLocation,
      remark: dto.remark,
    }
  );
  checkResponse(resp);
}

export async function listSupplies(
  client: ApiClient,
  skuId: string
): Promise<SupplyDetailVo[]> {
  const resp = await client.get<ApiResponse<SupplyDetailVo[]>>(
    `${SKU_BASE}/${skuId}/supplies`
  );
  return checkResponse(resp);
}

export async function getSupply(
  client: ApiClient,
  skuId: string,
  vendorId: string
): Promise<SupplyDetailVo | null> {
  const resp = await client.get<ApiResponse<SupplyDetailVo | null>>(
    `${SKU_BASE}/${skuId}/supply/${vendorId}`
  );
  return checkResponse(resp);
}

export async function deleteSupply(
  client: ApiClient,
  skuId: string,
  vendorId: string
): Promise<void> {
  const resp = await client.delete<ApiResponse<void>>(
    `${SKU_BASE}/${skuId}/supply/${vendorId}`
  );
  checkResponse(resp);
}

export async function batchSetSupply(
  client: ApiClient,
  skuId: string,
  items: SetSupplyDto[]
): Promise<void> {
  const resp = await client.post<ApiResponse<void>>(
    `${SKU_BASE}/${skuId}/supplies/batch`,
    { items }
  );
  checkResponse(resp);
}

export async function getSupplySummary(
  client: ApiClient,
  skuId: string
): Promise<SupplySummaryVo> {
  const resp = await client.get<ApiResponse<SupplySummaryVo>>(
    `${SKU_BASE}/${skuId}/supply-summary`
  );
  return checkResponse(resp);
}

export async function getSpuSupplyList(
  client: ApiClient,
  spuId: string
): Promise<SpuSupplyListVo> {
  const resp = await client.get<ApiResponse<SpuSupplyListVo>>(
    `${SPU_BASE}/${spuId}/supply-list`
  );
  return checkResponse(resp);
}
