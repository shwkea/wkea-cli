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

