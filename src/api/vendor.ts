import { ApiClient, ApiResponse } from './client';
import {
  VendorDetailVo,
  VendorDropdownVo,
  BindResultVo,
  PageResult,
} from '../types/vendor';

const VENDOR_BASE = '/api/manageV2/business/vendor';

// ============ DTO ============

export interface CreateVendorDto {
  name: string;
  contact?: string;
  phone?: string;
  address?: string;
  bankName?: string;
  bankAccount?: string;
  manageId: string;
  email?: string;
  type: number;
}

export interface UpdateVendorDto {
  name?: string;
  contact?: string;
  phone?: string;
  address?: string;
  bankName?: string;
  bankAccount?: string;
  email?: string;
  type?: number;
}

export interface VendorListDto {
  page?: number;
  size?: number;
  name?: string;
  type?: number;
}

export interface MergeVendorDto {
  sourceVendorId: string;
  targetVendorId: string;
  operator: string;
  mergeOptions?: {
    moveBrands?: boolean;
    moveCategories?: boolean;
    moveProducts?: boolean;
  };
}

// ============ helpers ============

function checkResponse<T>(resp: ApiResponse<T>): T {
  if (resp.status !== 200) {
    throw new Error(resp.msg || '请求失败');
  }
  return resp.data;
}

// ============ API functions ============

export async function createVendor(
  client: ApiClient,
  dto: CreateVendorDto
): Promise<string> {
  const resp = await client.post<ApiResponse<string>>(`${VENDOR_BASE}/create`, dto);
  return checkResponse(resp);
}

export async function getVendorDetail(
  client: ApiClient,
  vendorId: string
): Promise<VendorDetailVo> {
  const resp = await client.get<ApiResponse<VendorDetailVo>>(
    `${VENDOR_BASE}/${vendorId}`
  );
  return checkResponse(resp);
}

export async function updateVendor(
  client: ApiClient,
  vendorId: string,
  dto: UpdateVendorDto
): Promise<void> {
  const resp = await client.put<ApiResponse<void>>(`${VENDOR_BASE}/${vendorId}`, dto);
  checkResponse(resp);
}

export async function deleteVendor(client: ApiClient, vendorId: string): Promise<void> {
  const resp = await client.delete<ApiResponse<void>>(`${VENDOR_BASE}/${vendorId}`);
  checkResponse(resp);
}

export async function getVendorList(
  client: ApiClient,
  dto: VendorListDto
): Promise<PageResult<VendorDetailVo>> {
  const resp = await client.get<ApiResponse<PageResult<VendorDetailVo>>>(
    `${VENDOR_BASE}/list`,
    dto as Record<string, unknown>
  );
  const data = checkResponse(resp);
  return {
    rows: data.rows ?? [],
    totalSize: data.totalSize ?? 0,
    pageSize: data.pageSize ?? 0,
    pageIndex: data.pageIndex ?? 0,
    totalPage: data.totalPage ?? 0,
  };
}

export async function getVendorDropdown(
  client: ApiClient,
  keyword?: string
): Promise<VendorDropdownVo[]> {
  const params = keyword ? { keyword } : undefined;
  const resp = await client.get<ApiResponse<VendorDropdownVo[]>>(
    `${VENDOR_BASE}/dropdown`,
    params
  );
  return checkResponse(resp);
}

export async function bindBrands(
  client: ApiClient,
  vendorId: string,
  brandIds: number[]
): Promise<BindResultVo> {
  const resp = await client.post<ApiResponse<BindResultVo>>(
    `${VENDOR_BASE}/${vendorId}/bind-brands`,
    { brandIds }
  );
  return checkResponse(resp);
}

export async function getVendorBrands(
  client: ApiClient,
  vendorId: string
): Promise<VendorDetailVo['brands']> {
  const resp = await client.get<ApiResponse<VendorDetailVo['brands']>>(
    `${VENDOR_BASE}/${vendorId}/brands`
  );
  return checkResponse(resp);
}

export async function unbindBrand(
  client: ApiClient,
  vendorId: string,
  brandId: number
): Promise<void> {
  const resp = await client.delete<ApiResponse<void>>(
    `${VENDOR_BASE}/${vendorId}/brand/${brandId}`
  );
  checkResponse(resp);
}

export async function bindCategories(
  client: ApiClient,
  vendorId: string,
  categoryIds: number[]
): Promise<BindResultVo> {
  const resp = await client.post<ApiResponse<BindResultVo>>(
    `${VENDOR_BASE}/${vendorId}/bind-categories`,
    { categoryIds }
  );
  return checkResponse(resp);
}

export async function getVendorCategories(
  client: ApiClient,
  vendorId: string
): Promise<VendorDetailVo['categories']> {
  const resp = await client.get<ApiResponse<VendorDetailVo['categories']>>(
    `${VENDOR_BASE}/${vendorId}/categories`
  );
  return checkResponse(resp);
}

export async function unbindCategory(
  client: ApiClient,
  vendorId: string,
  categoryId: number
): Promise<void> {
  const resp = await client.delete<ApiResponse<void>>(
    `${VENDOR_BASE}/${vendorId}/category/${categoryId}`
  );
  checkResponse(resp);
}

export async function bindBoth(
  client: ApiClient,
  vendorId: string,
  dto: { brands?: { brandIds: number[] }; categories?: { categoryIds: number[] } }
): Promise<{ brands?: BindResultVo; categories?: BindResultVo }> {
  const resp = await client.post<
    ApiResponse<{ brands?: BindResultVo; categories?: BindResultVo }>
  >(`${VENDOR_BASE}/${vendorId}/bind-all`, dto);
  return checkResponse(resp);
}

export async function getExtraColumns(
  client: ApiClient,
  vendorId: string
): Promise<VendorDetailVo['extraColumns']> {
  const resp = await client.get<ApiResponse<VendorDetailVo['extraColumns']>>(
    `${VENDOR_BASE}/${vendorId}/extra-columns`
  );
  return checkResponse(resp);
}

export async function saveExtraColumns(
  client: ApiClient,
  vendorId: string,
  data: Record<string, string>
): Promise<void> {
  const resp = await client.put<ApiResponse<void>>(
    `${VENDOR_BASE}/${vendorId}/extra-columns`,
    { vendorId, data }
  );
  checkResponse(resp);
}

export async function mergeVendor(client: ApiClient, dto: MergeVendorDto): Promise<void> {
  const resp = await client.post<ApiResponse<void>>(`${VENDOR_BASE}/merge`, dto);
  checkResponse(resp);
}
