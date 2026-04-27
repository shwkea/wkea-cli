import { ApiClient, ApiResponse } from './client';
import { BrandDetailVo, BrandListVo, PageResult } from '../types/brand';

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
