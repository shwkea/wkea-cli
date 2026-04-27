import { ApiClient, ApiResponse } from '../client';
import { PageResult } from '../../types/vendor';

export interface SpuVo {
  spuId: string;
  name: string;
  brandId?: number;
  brandName?: string;
  categoryId?: number;
  categoryName?: string;
  unit?: string;
  description?: string;
  createdTime?: string;
  updatedTime?: string;
}

export interface CreateSpuDto {
  name: string;
  brandId?: number;
  categoryId?: number;
  vendorId?: string;
}

export interface UpdateSpuDto {
  name?: string;
  unit?: string;
  description?: string;
}

export interface SpuListDto {
  page?: number;
  size?: number;
  keyword?: string;
  brandId?: number;
  categoryId?: number;
  vendorId?: string;
}

// ============ types ============

export interface SpuDetailVo {
  spuId: string;
  name: string;
  unit?: string;
  description?: string;
  brand?: { id: number; name: string };
  category?: { id: number; name: string };
  brands: SpuBrandVo[];
  categories: SpuCategoryVo[];
  vendors: SpuVendorVo[];
  extraColumns: SpuExtraColumnVo[];
  specs: SpuSpecVo[];
  skus: SpuSkuVo[];
  createdTime: string;
  updatedTime?: string;
}

export interface SpuSpecVo {
  specId: number;
  name: string;
  manageName?: string;
  sort?: number;
  isFixed?: boolean;
  isNameShow?: boolean;
  params: SpuSpecParamVo[];
}

export interface SpuSpecParamVo {
  id: number;
  name: string;
  tag?: string;
}

export interface SpuSkuVo {
  skuId: string;
  name: string;
  orderNoSku?: string;
  images?: string;
  salesPrice?: number;
  actualSalesPrice?: number;
  totalStock?: number;
  isShelf?: boolean;
  unit?: number;
  specId?: string;
  specName?: string;
  specNames?: string[];
  createdTime?: string;
}

export interface SpuBrandVo {
  id: number;
  name: string;
  boundAt?: string;
}

export interface SpuCategoryVo {
  id: number;
  name: string;
  boundAt?: string;
}

export interface SpuVendorVo {
  vendorId: string;
  name: string;
  remark?: string;
}

export interface SpuExtraColumnVo {
  columnKey: string;
  columnTitle: string;
  columnType: string;
  columnValue: string;
}

export interface SpuListVo {
  spuId: string;
  name: string;
  brandId?: number;
  brandName?: string;
  categoryId?: number;
  categoryName?: string;
  unit?: string;
  description?: string;
  createdTime?: string;
}

export interface BindResultVo {
  addedCount: number;
  skippedCount: number;
}

export interface QuickCreateSkuAttrDto {
  name: string;
  value: string;
}

export interface QuickCreateSkuDto {
  name: string;
  model?: string;
  unit?: number;
  salesPrice?: number;
  purchasePrice?: number;
  stock?: number;
  isShelf?: boolean;
  remark?: string;
  paramIds?: number[];
  /** 规格列表（自动创建/查找，格式: {"颜色":["红色","蓝色"],"尺寸":["10寸","12寸"]}） */
  specs?: Record<string, string[]>;
  /** 属性列表 JSON 字符串（规避 FastJSON 中文 field name 解析 bug） */
  attributesJson?: string;
}

export interface QuickCreateDto {
  spuId?: string;
  spuName: string;
  brandId?: number;
  brandName?: string;
  categoryId?: number;
  categoryName?: string;
  vendorId?: string;
  vendorName?: string;
  managerId?: string;
  description?: string;
  images?: string;
  skus: QuickCreateSkuDto[];
}

// ============ helpers ============

function checkResponse<T>(resp: ApiResponse<T>): T {
  if (resp.status !== 200) {
    throw new Error(resp.msg || '请求失败');
  }
  return resp.data;
}

const BASE = '/api/manageV2/spu';

// ============ API functions ============

export async function createSpu(client: ApiClient, dto: CreateSpuDto): Promise<string> {
  const resp = await client.post<ApiResponse<string>>(`${BASE}`, dto);
  return checkResponse(resp);
}

export async function getSpu(client: ApiClient, spuId: string): Promise<SpuDetailVo> {
  const resp = await client.get<ApiResponse<SpuDetailVo>>(`${BASE}/${spuId}`);
  return checkResponse(resp);
}

export async function updateSpu(client: ApiClient, spuId: string, dto: UpdateSpuDto): Promise<void> {
  const resp = await client.put<ApiResponse<void>>(`${BASE}/${spuId}`, dto);
  checkResponse(resp);
}

export async function deleteSpu(client: ApiClient, spuId: string): Promise<void> {
  const resp = await client.delete<ApiResponse<void>>(`${BASE}/${spuId}`);
  checkResponse(resp);
}

export async function listSpu(client: ApiClient, dto: SpuListDto): Promise<PageResult<SpuListVo>> {
  const resp = await client.post<ApiResponse<PageResult<SpuListVo>>>(
    `${BASE}/list`,
    dto
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

export async function bindBrands(client: ApiClient, spuId: string, brandIds: number[]): Promise<BindResultVo> {
  const resp = await client.post<ApiResponse<BindResultVo>>(
    `${BASE}/${spuId}/bind-brands`,
    { brandIds }
  );
  return checkResponse(resp);
}

export async function unbindBrand(client: ApiClient, spuId: string, brandId: number): Promise<void> {
  const resp = await client.delete<ApiResponse<void>>(`${BASE}/${spuId}/brand/${brandId}`);
  checkResponse(resp);
}

export async function getSpuBrands(client: ApiClient, spuId: string): Promise<SpuBrandVo[]> {
  const resp = await client.get<ApiResponse<SpuBrandVo[]>>(`${BASE}/${spuId}/brands`);
  return checkResponse(resp);
}

export async function bindCategories(client: ApiClient, spuId: string, categoryIds: number[]): Promise<BindResultVo> {
  const resp = await client.post<ApiResponse<BindResultVo>>(
    `${BASE}/${spuId}/bind-categories`,
    { categoryIds }
  );
  return checkResponse(resp);
}

export async function unbindCategory(client: ApiClient, spuId: string, categoryId: number): Promise<void> {
  const resp = await client.delete<ApiResponse<void>>(`${BASE}/${spuId}/category/${categoryId}`);
  checkResponse(resp);
}

export async function getSpuCategories(client: ApiClient, spuId: string): Promise<SpuCategoryVo[]> {
  const resp = await client.get<ApiResponse<SpuCategoryVo[]>>(`${BASE}/${spuId}/categories`);
  return checkResponse(resp);
}

export async function getSpuExtraColumns(client: ApiClient, spuId: string): Promise<SpuExtraColumnVo[]> {
  const resp = await client.get<ApiResponse<SpuExtraColumnVo[]>>(`${BASE}/${spuId}/extra-columns`);
  return checkResponse(resp);
}

export async function saveSpuExtraColumns(client: ApiClient, spuId: string, columns: Record<string, string>): Promise<void> {
  const extraColumns = Object.entries(columns).map(([columnKey, columnValue]) => ({ columnKey, columnValue }));
  const resp = await client.put<ApiResponse<void>>(`${BASE}/${spuId}/extra-columns`, { extraColumns });
  checkResponse(resp);
}

export async function quickCreate(client: ApiClient, dto: QuickCreateDto) {
  return client.post<{ spuId: string; skuIds: string[] }>(`${BASE}/quick-create`, {
    spuId: dto.spuId,
    spuName: dto.spuName,
    brandId: dto.brandId,
    brandName: dto.brandName,
    categoryId: dto.categoryId,
    categoryName: dto.categoryName,
    vendorId: dto.vendorId,
    vendorName: dto.vendorName,
    managerId: dto.managerId,
    description: dto.description,
    images: dto.images,
    skus: dto.skus,
  });
}
