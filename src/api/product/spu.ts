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
  tag?: string;
  series?: string;
  canBeReturned?: boolean;
  managerId?: string;
  brandIdList?: number[];
  productCategoryShow?: string;
  desc?: string;
  pdfLink?: string;
  details?: string;
  modelRemark?: string;
  images?: string;
  qualificationPath?: string;
  informationFiles?: string;
  salesDeliver?: number;
  esKeyword?: string;
  buySpec?: boolean;
  stopProduction?: string;
  label?: number[];
  wkeaDiscount?: number;
  wkeaDeliverDiscount?: number;
  extraColumns?: Record<string, any>;
}

export interface UpdateSpuDto {
  name?: string;
  unit?: string;
  description?: string;
  brandId?: number;
  categoryId?: number;
  vendorId?: string;
  tag?: string;
  series?: string;
  canBeReturned?: boolean;
  managerId?: string;
  brandIdList?: number[];
  productCategoryShow?: string;
  desc?: string;
  pdfLink?: string;
  details?: string;
  modelRemark?: string;
  images?: string;
  qualificationPath?: string;
  informationFiles?: string;
  salesDeliver?: number;
  esKeyword?: string;
  buySpec?: boolean;
  stopProduction?: string;
  label?: number[];
  wkeaDiscount?: number;
  wkeaDeliverDiscount?: number;
  extraColumns?: Record<string, any>;
}

export interface SpuListDto {
  page?: number;
  size?: number;
  keyword?: string;
  brandId?: number;
  categoryId?: number;
  vendorId?: string;
  createdTimeBegin?: string;
  createdTimeEnd?: string;
}

// ============ types ============

export interface SpuDetailVo {
  spuId: string;
  name: string;
  description?: string;
  series?: string;
  tag?: string;
  canBeReturned?: boolean;
  productCategoryShow?: string;
  vendorId?: string;
  managerId?: string;
  categoryId?: number;
  brandId?: number;
  pdfLink?: string;
  details?: string;
  modelRemark?: string;
  images?: string;
  qualificationPath?: string;
  informationFiles?: string;
  salesDeliver?: number;
  esKeyword?: string;
  buySpec?: boolean;
  stopProduction?: string;
  wkeaDiscount?: number;
  wkeaDeliverDiscount?: number;
  basicGroupId?: number;
  unit?: string;
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
  categoryId?: number;
  vendorId?: string;
  series?: string;
  tag?: string;
  managerId?: string;
  productCategoryShow?: string;
  images?: string;
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
  weight?: number;
  isShelf?: boolean;
  remark?: string;
  paramIds?: number[];
  /** 规格列表（自动创建/查找，格式: {"颜色":["红色","蓝色"],"尺寸":["10寸","12寸"]}） */
  specs?: Record<string, string[]>;
  /** 属性列表 JSON 字符串（规避 FastJSON 中文 field name 解析 bug） */
  attributesJson?: string;

  // ========== SKU 扩展字段 ==========

  /** 图片集合（多张逗号分隔） */
  images?: string;
  /** 详情图是否仅供参考 */
  imgReference?: boolean;
  /** 销售交期 */
  salesDeliver?: number;
  /** 交期类型（relation_set:35） */
  deliveryDateType?: number;
  /** 库存下限 */
  safetyStock?: number;
  /** 库存上限（0为不限制） */
  ceilingStock?: number;
  /** 实际销售价格 */
  actualSalesPrice?: number;
  /** 销售税率（relation_set:15） */
  taxRate?: number;
  /** 采购税率（relation_set:15） */
  purchaseTaxRate?: number;
  /** 采购链接 */
  purchaseLink?: string;
  /** SKU 标签（relation:241） */
  tagManage?: number;
  /** 运费模板Id */
  templateId?: number;
  /** 条码 */
  barcode?: string;
  /** ES 搜索关键词 */
  esKeyword?: string;
  /** 质保期（天） */
  life?: number;
  /** 无理由退货期限（天） */
  returnDeadline?: number;
  /** 开票方式（1一单一开，2累计开票） */
  invoiceMethod?: number;
  /** 采购状态（true=在售，false=停购） */
  purchaseState?: boolean;
  /** 替换SKU（存在则下架当前sku） */
  replaceSku?: string;
  /** 堂食详情 */
  dineInDetails?: string;
  /** 规格值名称 */
  specName?: string;
  /** 扩展ID */
  extendId?: string;
  /** 线下分类 */
  offlineCategory?: number;
  /** 单位量 */
  unitAmounts?: string;
  /** 货号（其他地方产品编号） */
  itemNumber?: string;
  /** 位置备注（采购时此产品在供应商的位置） */
  positionRemark?: string;
  /** 简单描述（详情展示） */
  simpleDesc?: string;
  /** SKU 详细信息（选填） */
  info?: AddSkuInfoDto;

  /** 附加列（create/update 时传入） */
  extraColumns?: Record<string, any>;
}

export interface AddSkuInfoDto {
  /** 供应商 SKU */
  vendorsSku?: string;
  /** 制造商型号 */
  manufacturerModel?: string;
  /** 最小起订量 */
  minOrderQuantity?: number;
  /** 最小起订倍数 */
  minOrderMultiple?: number;
  /** 最小采购量 */
  minPurchaseQuantity?: number;
  /** 最小采购倍数 */
  minPurchaseMultiple?: number;
  /** 采购价格 */
  purchasePrice?: number;
  /** 内包装数量 */
  innerPackingQuantity?: number;
  /** 销售开始时间 */
  startDate?: string;
  /** 销售结束时间 */
  endDate?: string;
  /** 备货类型（非备货/备货） */
  stockType?: boolean;
  /** 长宽高 */
  lengthWidthHeight?: string;
  /** 重量(kg) */
  weight?: number;
  /** 是否易碎 */
  isFragile?: boolean;
  /** 采购交期 */
  purchaseDeliver?: number;
  /** 采购交期类型（relation_set:35） */
  deliveryDateType?: number;
  /** 能否退货 */
  isReturn?: boolean;
  /** 能否换货 */
  isExchange?: boolean;
  /** 是否定制 */
  isCustomized?: boolean;
  /** 是否维嘉优选 */
  isPreferred?: boolean;
  /** 发货方式（relation_set:32） */
  deliveryMethod?: number;
}

export interface QuickCreateSpecParamDto {
  name: string;
  tag?: string;
  sort?: number;
}

export interface QuickCreateSpecDto {
  name: string;
  sort?: number;
  isFixed?: boolean;
  isNameShow?: boolean;
  params: QuickCreateSpecParamDto[];
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
  // SPU 扩展字段
  series?: string;
  tag?: string;
  brandIdList?: number[];
  productCategoryShow?: string;
  canBeReturned?: boolean;
  pdfLink?: string;
  details?: string;
  modelRemark?: string;
  salesDeliver?: number;
  esKeyword?: string;
  buySpec?: boolean;
  stopProduction?: string;
  // SPU 级规格
  specs?: Record<string, string[]>;
  /** 完整规格列表（含 tag/sort/isFixed/isNameShow，优先于 specs） */
  fullSpecs?: QuickCreateSpecDto[];
  // SKU 列表（可选）
  skus?: QuickCreateSkuDto[];
}

// ============ helpers ============

function checkResponse<T>(resp: ApiResponse<T>): T {
  if (resp.status !== 200) {
    throw new Error(resp.msg || `请求失败(${resp.status})`);
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

export async function bindCategories(client: ApiClient, spuId: string, categoryIds: string[]): Promise<BindResultVo> {
  const resp = await client.post<ApiResponse<BindResultVo>>(
    `${BASE}/${spuId}/bind-categories`,
    { categoryIds }
  );
  return checkResponse(resp);
}

export async function unbindCategory(client: ApiClient, spuId: string, categoryId: string): Promise<void> {
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
  const resp = await client.put<ApiResponse<void>>(`${BASE}/${spuId}/extra-columns`, { data: columns });
  checkResponse(resp);
}

// ============ 规格管理 (V2) ============

/** 获取 SPU 规格列表 */
export async function getSpuSpecs(client: ApiClient, spuId: string): Promise<any> {
  const resp = await client.get<ApiResponse<any>>(`${BASE}/${spuId}/specs`);
  return checkResponse(resp);
}

/** 绑定规格到 SPU */
export async function bindSpuSpec(client: ApiClient, spuId: string, specId: number, isInput: boolean): Promise<void> {
  const resp = await client.post<ApiResponse<void>>(`${BASE}/${spuId}/specs`, { specId, spu: spuId, isInput });
  checkResponse(resp);
}

/** 更新规格（含设置 isFixed） */
export async function updateSpuSpec(client: ApiClient, spuId: string, specId: number, dto: { name?: string; manageName?: string; isFixed?: boolean; isNameShow?: boolean }): Promise<void> {
  const resp = await client.put<ApiResponse<void>>(`${BASE}/${spuId}/spec/${specId}`, dto);
  checkResponse(resp);
}

/** 解绑 SPU 的规格 */
export async function unbindSpuSpec(client: ApiClient, spuId: string, specMidId: number): Promise<void> {
  const resp = await client.delete<ApiResponse<void>>(`${BASE}/${spuId}/spec/${specMidId}`);
  checkResponse(resp);
}

/** 创建新规格 */
export async function createSpuSpec(client: ApiClient, spuId: string, dto: { name: string; manageName: string; sort: number; isFixed?: boolean; isNameShow?: boolean }): Promise<number> {
  const resp = await client.post<ApiResponse<number>>(`${BASE}/${spuId}/specs/create`, dto);
  return checkResponse(resp);
}

// ============ 分隔符管理 (V2) ============

/** 获取 SPU 的分隔符配置 */
export async function getSpuSeparators(client: ApiClient, spuId: string): Promise<any> {
  const resp = await client.get<ApiResponse<any>>(`${BASE}/${spuId}/separators`);
  return checkResponse(resp);
}

/** 保存 SPU 的分隔符配置 */
export async function saveSpuSeparators(client: ApiClient, spuId: string, data: {
  specFg?: (string | null)[];
  specFgIds?: (string | null)[];
  productTagFg?: string | null;
  productTagFgId?: number | null;
  productTagIndex?: number;
}): Promise<void> {
  const resp = await client.put<ApiResponse<void>>(`${BASE}/${spuId}/separators`, data);
  checkResponse(resp);
}

// ============ SKU 规格值 (V2) ============

/** 获取 SKU 的规格值 */
export async function getSkuSpecValues(client: ApiClient, sku: string): Promise<any> {
  const resp = await client.get<ApiResponse<any>>(`${BASE}/sku/${sku}/spec-values`);
  return checkResponse(resp);
}

export async function quickCreate(client: ApiClient, dto: QuickCreateDto) {
  const body = await client.post<ApiResponse<{ spuId: string; skuIds: string[] }>>(`${BASE}/quick-create`, {
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
    series: dto.series,
    tag: dto.tag,
    brandIdList: dto.brandIdList,
    productCategoryShow: dto.productCategoryShow,
    canBeReturned: dto.canBeReturned,
    pdfLink: dto.pdfLink,
    details: dto.details,
    modelRemark: dto.modelRemark,
    salesDeliver: dto.salesDeliver,
    esKeyword: dto.esKeyword,
    buySpec: dto.buySpec,
    stopProduction: dto.stopProduction,
    specs: dto.specs,
    fullSpecs: dto.fullSpecs,
    skus: dto.skus,
  });
  return body.data;
}
