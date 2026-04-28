import { ApiClient, ApiResponse } from './client';
import {
  VendorDetailVo,
  VendorDropdownVo,
  BindResultVo,
  PageResult,
} from '../types/vendor';

const VENDOR_BASE = '/api/manageV2/vendor';

// ============ DTO ============

/**
 * 创建供应商
 * @see ENUM_DOC 供应商类型(vendor type): 106=原厂 107=授权经销商 236=品牌方 237=总代理 238=其他
 * @see ENUM_DOC 供应商组: 65=核心供应商 66=零星供应商
 * @see ENUM_DOC 供应商收款方式: 152=银行转账 154=支付宝 155=微信 402=其它
 * @see ENUM_DOC 企业类型: 71=股份有限公司 72=有限责任公司(台港澳法人独资) 73=有限责任公司(自然人独资) 74=有限责任公司(自然人投资或控股) 等
 * @see ENUM_DOC 渠道来源: 85=企业微信 86=淘宝 87=线下 88=超兔 89=经销商 90=授权经销商 91=品牌方 92=原厂 246=电商
 * @see ENUM_DOC 付款期限: 94=现款提货 95=货到15天 96=货到30天 97=票到7天 98=票到30天 99=款到发货
 * @see ENUM_DOC 结款方式: 234=现款 235=月结
 * @see ENUM_DOC 发票类型: 5=增值税发票 6=普通发票 440=电子增值税专用发票 441=电子普通发票
 */
export interface CreateVendorDto {
  /** 供应商名称 */
  name: string;
  /** 联系人 */
  contact?: string;
  /** 联系电话 */
  phone?: string;
  /** 地址 */
  address?: string;
  /** 开户银行 */
  bankName?: string;
  /** 银行账号 */
  bankAccount?: string;
  /** 客户经理ID */
  manageId: string;
  /** 邮箱 */
  email?: string;
  /**
   * 供应商类型
   * - 106: 原厂
   * - 107: 授权经销商
   * - 236: 品牌方
   * - 237: 总代理
   * - 238: 其他
   * @see ENUM_DOC 供应商类型
   */
  type: number;
  /** 固定电话 */
  fixPhone?: string;
  /** 电话（备用） */
  telephone?: string;
  /** 产地 */
  pointOfOrigin?: string;
  /** 企业类型 */
  enterpriseType?: number;
  /** 行业 */
  industry?: string;
  /** 渠道来源 */
  channelSource?: number;
  /** 网站 */
  website?: string;
  /** 公司简介 */
  companyIntroduction?: string;
  /** 国家 */
  country?: string;
  /** 省 */
  province?: string;
  /** 市 */
  city?: string;
  /** 区 */
  area?: string;
  /** 镇 */
  town?: string;
  /** 币种ID */
  currencyId?: number;
  /** 付款方式 */
  payType?: number;
  /** 付款期限 */
  paymentTerm?: number;
  /** 结款方式 */
  settlementType?: number;
  /** 账期天数 */
  playDay?: number;
  /** 员工数 */
  employeeCount?: number;
  /** 供应商组ID */
  groupId?: number;
  /** 是否暂停合作 */
  isSuspend?: boolean;
  /** 品牌ID列表 */
  brandIdList?: number[];
  /** 备注 */
  remark?: string;
  /** 标签 */
  tags?: string;
  /** 主营业务 */
  mainBusiness?: string;
  /** 自定义字段 */
  customFields?: string;
  /** 发票列表 */
  invoiceList?: any[];
  /** 银行列表 */
  bankList?: any[];
  /** 联系人列表 */
  contactList?: any[];
  /** 地址列表 */
  addressList?: any[];
  /** 供应商链接 */
  vendorUrls?: any[];
}

/**
 * 更新供应商
 * @see ENUM_DOC 供应商类型: 106=原厂 107=授权经销商 236=品牌方 237=总代理 238=其他
 */
export interface UpdateVendorDto {
  name?: string;
  contact?: string;
  phone?: string;
  address?: string;
  bankName?: string;
  bankAccount?: string;
  email?: string;
  manageId?: string;
  /**
   * 供应商类型
   * - 106: 原厂
   * - 107: 授权经销商
   * - 236: 品牌方
   * - 237: 总代理
   * - 238: 其他
   * @see ENUM_DOC 供应商类型
   */
  type?: number;
  /** 固定电话 */
  fixPhone?: string;
  /** 电话（备用） */
  telephone?: string;
  /** 产地 */
  pointOfOrigin?: string;
  /** 企业类型 */
  enterpriseType?: number;
  /** 行业 */
  industry?: string;
  /** 渠道来源 */
  channelSource?: number;
  /** 网站 */
  website?: string;
  /** 公司简介 */
  companyIntroduction?: string;
  /** 国家 */
  country?: string;
  /** 省 */
  province?: string;
  /** 市 */
  city?: string;
  /** 区 */
  area?: string;
  /** 镇 */
  town?: string;
  /** 币种ID */
  currencyId?: number;
  /** 付款方式 */
  payType?: number;
  /** 付款期限 */
  paymentTerm?: number;
  /** 结款方式 */
  settlementType?: number;
  /** 账期天数 */
  playDay?: number;
  /** 员工数 */
  employeeCount?: number;
  /** 供应商组ID */
  groupId?: number;
  /** 是否暂停合作 */
  isSuspend?: boolean;
  /** 品牌ID列表 */
  brandIdList?: number[];
  /** 备注 */
  remark?: string;
  /** 标签 */
  tags?: string;
  /** 主营业务 */
  mainBusiness?: string;
  /** 自定义字段 */
  customFields?: string;
  /** 发票列表 */
  invoiceList?: any[];
  /** 银行列表 */
  bankList?: any[];
  /** 联系人列表 */
  contactList?: any[];
  /** 地址列表 */
  addressList?: any[];
  /** 供应商链接 */
  vendorUrls?: any[];
}

export interface VendorListDto {
  page?: number;
  size?: number;
  name?: string;
  /**
   * 供应商类型
   * - 106: 原厂
   * - 107: 授权经销商
   * - 236: 品牌方
   * - 237: 总代理
   * - 238: 其他
   * @see ENUM_DOC 供应商类型
   */
  type?: number;
  createdTimeBegin?: string;
  createdTimeEnd?: string;
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
    throw new Error(resp.msg || `请求失败(${resp.status})`);
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
