import { ApiClient, ApiResponse } from './client';
import { BrandDetailVo, BrandListVo, PageResult } from '../types/brand';
import { BindResultVo } from '../types/vendor';

const BRAND_BASE = '/api/manageV2/brand';

// ============ DTO ============

export interface CreateBrandDto {
  /** 品牌名称 */
  name: string;
  /** 别名/关键词，逗号分隔 */
  keyword?: string;
  /** 品牌官网 */
  url?: string;
  /** Logo URL */
  logo?: string;
  /** 品牌描述 */
  desc?: string;
  /** 品牌类型 */
  type?: string;
  /** 是否合作品牌 */
  isCooperation?: boolean;
  /** 是否精选品牌 */
  isFeatured?: boolean;
  /** 备注 */
  remark?: string;
  /** 授权证书图片 */
  authorizationCertificateImage?: string;
  /** 供应商ID列表 */
  vendorsId?: string[];
  /** 分类ID列表 */
  categoryId?: number[];
  /** 标签列表 */
  tag?: number[];
  /** 注册号 */
  regNo?: string;
  /** 流程状态描述 */
  flowStatusDesc?: string;
  /** 有效期 */
  validPeriod?: string;
  /** 申请人 */
  applicant?: string;
  /** 品牌链接列表 */
  brandUrlList?: any[];
}

export interface UpdateBrandDto {
  /** 品牌名称 */
  name?: string;
  /** 别名/关键词，逗号分隔 */
  keyword?: string;
  /** 品牌官网 */
  url?: string;
  /** Logo URL */
  logo?: string;
  /** 品牌描述 */
  desc?: string;
  /** 品牌类型 */
  type?: string;
  /** 是否合作品牌 */
  isCooperation?: boolean;
  /** 是否精选品牌 */
  isFeatured?: boolean;
  /** 备注 */
  remark?: string;
  /** 授权证书图片 */
  authorizationCertificateImage?: string;
  /** 供应商ID列表 */
  vendorsId?: string[];
  /** 分类ID列表 */
  categoryId?: number[];
  /** 标签列表 */
  tag?: number[];
  /** 注册号 */
  regNo?: string;
  /** 流程状态描述 */
  flowStatusDesc?: string;
  /** 有效期 */
  validPeriod?: string;
  /** 申请人 */
  applicant?: string;
  /** 品牌链接列表 */
  brandUrlList?: any[];
}

export interface BrandListDto {
  /** 页码，默认 1 */
  pageNum?: number;
  /** 每页数量，默认 20 */
  pageSize?: number;
  /** 搜索关键词（匹配品牌名称或别名） */
  keyword?: string;
  /** 品牌 ID 精确查询 */
  id?: number;
  /** 品牌 ID 批量查询 */
  ids?: number[];
  /** 品牌名称（精确或前缀匹配） */
  name?: string;
  /** 品牌类型 */
  type?: string;
  /** 绑定供应商 ID，筛选绑定到该供应商的品牌 */
  vendorId?: string;
  /** 是否合作品牌 */
  isCooperation?: boolean;
  /** 是否精选品牌 */
  isFeatured?: boolean;
  createdTimeBegin?: string;
  createdTimeEnd?: string;
}

// ============ helpers ============

function checkResponse<T>(resp: ApiResponse<T>): T {
  if (resp.status !== 200) {
    throw new Error(resp.msg || `请求失败(${resp.status})`);
  }
  return resp.data;
}

// ============ API functions ============

export async function createBrand(
  client: ApiClient,
  dto: CreateBrandDto
): Promise<number> {
  const resp = await client.post<ApiResponse<number>>(`${BRAND_BASE}`, dto);
  return checkResponse(resp);
}

export async function getBrandDetail(
  client: ApiClient,
  brandId: number
): Promise<BrandDetailVo> {
  const resp = await client.get<ApiResponse<BrandDetailVo>>(
    `${BRAND_BASE}/${brandId}`
  );
  return checkResponse(resp);
}

export async function updateBrand(
  client: ApiClient,
  brandId: number,
  dto: UpdateBrandDto
): Promise<void> {
  const resp = await client.put<ApiResponse<void>>(`${BRAND_BASE}/${brandId}`, dto);
  checkResponse(resp);
}

export async function deleteBrand(client: ApiClient, brandId: number): Promise<void> {
  const resp = await client.delete<ApiResponse<void>>(`${BRAND_BASE}/${brandId}`);
  if (resp.status !== 200) {
    throw new Error(resp.msg || `删除失败(${resp.status})`);
  }
}

export async function listBrands(
  client: ApiClient,
  dto: BrandListDto
): Promise<PageResult<BrandListVo>> {
  const resp = await client.post<ApiResponse<PageResult<BrandListVo>>>(
    `${BRAND_BASE}/list`,
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

// ============ 供应商绑定 ============

/** 绑定供应商到品牌 */
export async function bindVendors(client: ApiClient, brandId: number, vendorIds: string[]): Promise<BindResultVo> {
  const resp = await client.post<ApiResponse<BindResultVo>>(`${BRAND_BASE}/${brandId}/bind-vendors`, { vendorsId: vendorIds });
  return checkResponse(resp);
}

/** 品牌的已绑供应商列表 */
export async function getBrandVendors(client: ApiClient, brandId: number): Promise<any[]> {
  const resp = await client.get<ApiResponse<any[]>>(`${BRAND_BASE}/${brandId}/vendors`);
  return checkResponse(resp);
}

/** 解绑供应商 */
export async function unbindVendorFromBrand(client: ApiClient, brandId: number, vendorId: string): Promise<void> {
  const resp = await client.delete<ApiResponse<void>>(`${BRAND_BASE}/${brandId}/vendor/${vendorId}`);
  checkResponse(resp);
}

// ============ 分类绑定 ============

/** 绑定分类到品牌 */
export async function bindCategoriesToBrand(client: ApiClient, brandId: number, categoryIds: number[]): Promise<any> {
  const resp = await client.post<ApiResponse<any>>(`${BRAND_BASE}/${brandId}/bind-categories`, { categoryIds });
  return checkResponse(resp);
}

/** 品牌的已绑分类列表 */
export async function getBrandCategories(client: ApiClient, brandId: number): Promise<any[]> {
  const resp = await client.get<ApiResponse<any[]>>(`${BRAND_BASE}/${brandId}/categories`);
  return checkResponse(resp);
}

/** 解绑分类 */
export async function unbindCategoryFromBrand(client: ApiClient, brandId: number, categoryId: number): Promise<void> {
  const resp = await client.delete<ApiResponse<void>>(`${BRAND_BASE}/${brandId}/category/${categoryId}`);
  checkResponse(resp);
}

// ============ 品牌链接 CRUD ============

/** 创建品牌链接 */
export async function createBrandUrl(client: ApiClient, brandId: number, url: string, type?: number): Promise<string> {
  const resp = await client.post<ApiResponse<string>>(`${BRAND_BASE}/${brandId}/urls`, { url, type });
  return checkResponse(resp);
}

/** 品牌链接列表 */
export async function getBrandUrls(client: ApiClient, brandId: number): Promise<any[]> {
  const resp = await client.get<ApiResponse<any[]>>(`${BRAND_BASE}/${brandId}/urls`);
  return checkResponse(resp);
}

/** 修改品牌链接 */
export async function updateBrandUrl(client: ApiClient, brandId: number, urlId: number, url: string): Promise<void> {
  const resp = await client.put<ApiResponse<void>>(`${BRAND_BASE}/${brandId}/url/${urlId}`, { url });
  checkResponse(resp);
}

/** 删除品牌链接 */
export async function deleteBrandUrl(client: ApiClient, brandId: number, urlId: number): Promise<void> {
  const resp = await client.delete<ApiResponse<void>>(`${BRAND_BASE}/${brandId}/url/${urlId}`);
  checkResponse(resp);
}
