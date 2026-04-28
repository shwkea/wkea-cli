export interface VendorDetailVo {
  vendorId: string;
  name: string;
  contact: string;
  phone: string;
  address: string;
  bankName: string;
  bankAccount: string;
  manageId: string;
  email: string;
  type: number;
  brands: VendorBrandVo[];
  categories: VendorCategoryVo[];
  extraColumns: VendorExtraColumnVo[];
  createdTime: string;

  // 基本信息
  fixPhone?: string;
  telephone?: string;
  pointOfOrigin?: string;
  enterpriseType?: number;
  industry?: string;
  channelSource?: number;
  website?: string;
  companyIntroduction?: string;

  // 地域信息
  country?: string;
  province?: string;
  city?: string;
  area?: string;
  town?: string;

  // 财务信息
  currencyId?: number;
  payType?: number;
  paymentTerm?: number;
  settlementType?: number;
  playDay?: number;
  groupId?: number;

  // 状态/备注
  isSuspend?: boolean;
  remark?: string;
  tags?: string;
  mainBusiness?: string;
  employeeCount?: number;
  customFields?: string;
  cancellationTime?: string;

  // 审计
  createdBy?: string;
  updatedTime?: string;
  updatedBy?: string;
  kgwxUserId?: string;

  // 工商信息
  legalRepresentative?: string;
  establishmentTime?: string;
  registeredCapital?: string;
  tagName?: string;
}

export interface VendorBrandVo {
  id: number;
  name: string;
  isMain: boolean;
  boundAt: string;
}

export interface VendorCategoryVo {
  id: number;
  name: string;
  boundAt: string;
}

export interface VendorExtraColumnVo {
  columnId: number;
  columnKey: string;
  columnTitle: string;
  columnType: string;
  columnValue: string;
  options: Array<{ label: string; value: string; color: string }>;
  isReadonly: boolean;
  align: string;
}

export interface VendorDropdownVo {
  vendorId: string;
  name: string;
}

export interface BindResultVo {
  addedCount: number;
  skippedCount: number;
}

export interface PageResult<T> {
  rows: T[];
  totalSize: number;
  pageSize: number;
  pageIndex: number;
  totalPage: number;
}

