import { ApiClient, ApiResponse } from './client';
import {
  DemandDetailVo,
  DemandListVo,
  DemandItemVo,
  VendorForDemandVo,
  VendorQuoteVo,
  PageResult,
} from '../types/demand';

const DEMAND_BASE = '/api/manageV2/business/demand';

// ============ DTO ============

export interface CreateDemandDto {
  customerId: string;
  topic: string;
  type?: number;
  notificationType?: number;
  manageId?: string;
  customerRemark?: string;
  annex?: string;
  effectiveTime?: string;
  vendorRemark?: string;
  items?: CreateDemandItemDto[];
}

export interface CreateDemandItemDto {
  productName: string;
  productBrand?: string;
  productModel?: string;
  productCategory?: string;
  quantity: number;
  productUnit?: string;
  expectPrice?: number;
  expectDelivery?: string;
  skuId?: string;
  remark?: string;
  toVendorRemark?: string;
  aiRemark?: string;
}

export interface UpdateDemandDto {
  type?: number;
  notificationType?: number;
  customerId?: string;
  topic?: string;
  customerRemark?: string;
  annex?: string;
  effectiveTime?: string;
  vendorRemark?: string;
}

export interface DemandListDto {
  pageNum: number;
  pageSize: number;
  status?: number[];
  customerId?: string;
  customerName?: string;
  manageId?: string;
  topic?: string;
  keyword?: string;
  sku?: string;
  isLate?: boolean;
  createdTimeBegin?: string;
  createdTimeEnd?: string;
  manageIdIsNull?: boolean;
}

export interface DemandQuoteDto {
  vendorId: string;
  itemIds?: number[];
  sendDemandQuoteMessage?: boolean;
}

export interface UpdateDemandItemDto {
  productName?: string;
  productBrand?: string;
  productModel?: string;
  productCategory?: string;
  quantity?: number;
  productUnit?: string;
  expectPrice?: number;
  expectDelivery?: string;
  skuId?: string;
  remark?: string;
  toVendorRemark?: string;
  finalSkuPrice?: number;
  grossMargin?: number;
  aiRemark?: string;
}

export interface GrossMarginDto {
  demandQuotationId: number;
  grossMargin?: number;
  itemIds?: number[];
}

export interface ItemSortDto {
  id: number;
  sort?: number;
}

// ============ helpers ============

function checkResponse<T>(resp: ApiResponse<T>): T {
  if (resp.status !== 200) {
    throw new Error(resp.msg || `请求失败(${resp.status})`);
  }
  return resp.data;
}

// ============ API functions ============

export async function createDemand(
  client: ApiClient,
  dto: CreateDemandDto
): Promise<number> {
  const resp = await client.post<ApiResponse<number>>(`${DEMAND_BASE}`, dto);
  return checkResponse(resp);
}

export async function getDemandDetail(
  client: ApiClient,
  id: number
): Promise<DemandDetailVo> {
  const resp = await client.get<ApiResponse<DemandDetailVo>>(
    `${DEMAND_BASE}/${id}`
  );
  return checkResponse(resp);
}

export async function updateDemand(
  client: ApiClient,
  id: number,
  dto: UpdateDemandDto
): Promise<void> {
  const resp = await client.put<ApiResponse<void>>(`${DEMAND_BASE}/${id}`, dto);
  checkResponse(resp);
}

export async function deleteDemand(
  client: ApiClient,
  id: number
): Promise<void> {
  const resp = await client.delete<ApiResponse<void>>(`${DEMAND_BASE}/${id}`);
  checkResponse(resp);
}

export async function listDemands(
  client: ApiClient,
  dto: DemandListDto
): Promise<PageResult<DemandListVo>> {
  const resp = await client.post<ApiResponse<PageResult<DemandListVo>>>(
    `${DEMAND_BASE}/list`,
    dto
  );
  const data = checkResponse(resp);
  return {
    records: data.records ?? [],
    total: data.total ?? 0,
    size: data.size ?? 0,
    current: data.current ?? 0,
    pages: data.pages ?? 0,
  };
}

export async function claimDemand(
  client: ApiClient,
  id: number
): Promise<void> {
  const resp = await client.post<ApiResponse<void>>(
    `${DEMAND_BASE}/${id}/claim`
  );
  checkResponse(resp);
}

export async function simpleCreateProduct(
  client: ApiClient,
  id: number,
  lineIdList?: number[]
): Promise<void> {
  const resp = await client.post<ApiResponse<void>>(
    `${DEMAND_BASE}/${id}/simple-create-product`,
    lineIdList ?? []
  );
  checkResponse(resp);
}

export async function quoteToVendor(
  client: ApiClient,
  id: number,
  dto: DemandQuoteDto
): Promise<void> {
  const resp = await client.post<ApiResponse<void>>(
    `${DEMAND_BASE}/${id}/quote-to-vendor`,
    dto
  );
  checkResponse(resp);
}

export async function getVendorsByBrand(
  client: ApiClient,
  brandId: number,
  all?: boolean
): Promise<VendorForDemandVo[]> {
  const params: Record<string, unknown> = { brandId };
  if (all) params.all = true;
  const resp = await client.get<ApiResponse<VendorForDemandVo[]>>(
    `${DEMAND_BASE}/vendors-by-brand`,
    params
  );
  return checkResponse(resp);
}

export async function getPendingAiTasks(
  client: ApiClient
): Promise<DemandListVo[]> {
  const resp = await client.get<ApiResponse<DemandListVo[]>>(
    `${DEMAND_BASE}/pending-ai-tasks`
  );
  return checkResponse(resp);
}

export async function getQuotedVendors(
  client: ApiClient,
  demandId: number
): Promise<any[]> {
  const resp = await client.get<ApiResponse<any[]>>(
    `${DEMAND_BASE}/${demandId}/quoted-vendors`
  );
  return checkResponse(resp);
}

export async function addDemandItem(
  client: ApiClient,
  demandId: number,
  dto: CreateDemandItemDto
): Promise<number> {
  const resp = await client.post<ApiResponse<number>>(
    `${DEMAND_BASE}/${demandId}/items`,
    dto
  );
  return checkResponse(resp);
}

export async function updateDemandItem(
  client: ApiClient,
  itemId: number,
  dto: UpdateDemandItemDto
): Promise<void> {
  const resp = await client.put<ApiResponse<void>>(
    `${DEMAND_BASE}/item/${itemId}`,
    dto
  );
  checkResponse(resp);
}

export async function deleteDemandItem(
  client: ApiClient,
  itemId: number
): Promise<void> {
  const resp = await client.delete<ApiResponse<void>>(
    `${DEMAND_BASE}/item/${itemId}`
  );
  checkResponse(resp);
}

export async function getDemandItems(
  client: ApiClient,
  demandId: number
): Promise<DemandItemVo[]> {
  const resp = await client.get<ApiResponse<DemandItemVo[]>>(
    `${DEMAND_BASE}/${demandId}/items`
  );
  return checkResponse(resp);
}

export async function completeDemandItem(
  client: ApiClient,
  itemId: number
): Promise<void> {
  const resp = await client.put<ApiResponse<void>>(
    `${DEMAND_BASE}/item/${itemId}/complete`
  );
  checkResponse(resp);
}

// ============ 供应商报价 ============

const DEMAND_QUOTATION_BASE = '/api/manage/demand-quotation';

export async function getVendorQuotes(
  client: ApiClient,
  demandId: number
): Promise<VendorQuoteVo[]> {
  const resp = await client.get<ApiResponse<VendorQuoteVo[]>>(
    `${DEMAND_QUOTATION_BASE}/vendorForQuoteNew/${demandId}`
  );
  return checkResponse(resp);
}

export interface SaveVendorPriceDto {
  sku: string;
  vendorsId: string;
  price: number;
  delivery?: number;
  remark?: string;
  grossMargin: number;
  stock?: number;
  shippingLocation?: string;
  minOrderQuantity?: number;
  minOrderMultiple?: number;
  replaceModel?: string;
}

export async function saveVendorPrice(
  client: ApiClient,
  dto: SaveVendorPriceDto
): Promise<void> {
  const resp = await client.post<ApiResponse<void>>(
    `${DEMAND_QUOTATION_BASE}/saveTableData`,
    {
      tableInfoList: [{
        ...dto,
        isMaster: false,
        wekaReplaceSkuDiscount: 1,
        wekaReplaceSkuDeliverDiscount: 1,
      }]
    }
  );
  if (resp.status !== 200) {
    throw new Error(resp.msg || `保存失败(${resp.status})`);
  }
}
