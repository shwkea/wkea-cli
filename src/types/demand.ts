export interface DemandListVo {
  id: number;
  type: number;
  topic: string;
  customerId: string;
  customerName: string;
  manageId: string;
  status: number;
  createdTime: string;
  createdByName: string;
  finishTime: string;
  order: number;
  itemCount: number;
  quotedCount: number;
  latestQuoteTime: string;
  isLate: boolean;
  deepSearchStatus: string;
}

export interface DemandDetailVo {
  id: number;
  type: number;
  customerId: string;
  customerName: string;
  manageId: string;
  status: number;
  topic: string;
  remark: string;
  customerRemark: string;
  vendorRemark: string;
  annex: string;
  effectiveTime: string;
  lastQuoteTime: string;
  finishTime: string;
  order: number;
  isRushing: boolean;
  lateRemark: string;
  deepSearchTaskId: string;
  deepSearchStatus: string;
  supplierExtractTaskId: string;
  supplierExtractStatus: string;
  taskId: number;
  createdTime: string;
  createdBy: string;
  createdByName: string;
  items: DemandItemVo[];
  extraColumns: Record<string, any>;
  quotedVendors?: QuotedVendorVo[];
  vendorQuotes?: VendorQuoteVo[];
}

export interface QuotedVendorVo {
  vendorId: string;
  vendorName: string;
  isFinish: boolean;
  isCancel: boolean;
}

export interface VendorQuoteVo {
  demandQuotationDocInfoId: number;
  vendorsId: string;
  vendorsName: string;
  vendorsTags?: string;
  isFinish: boolean;
  tableInfoList: VendorQuoteItemVo[];
  tableListTotalPrice: number;
}

export interface VendorQuoteItemVo {
  demandQuotationItemId: number;
  skuName: string;
  skuModel: string;
  brandName: string;
  quantity: number;
  price: number;
  delivery: number;
  stock: number;
  shippingLocation: string;
  remark: string;
  validityPeriod: number;
}

export interface DemandItemVo {
  id: number;
  demandQuotationId: number;
  productName: string;
  productBrand: string;
  productModel: string;
  productCategory: string;
  manageProductName: string;
  manageProductBrand: string;
  manageProductModel: string;
  manageProductCategory: string;
  skuId: string;
  skuName: string;
  skuModel: string;
  quantity: number;
  productUnit: string;
  expectPrice: number;
  expectDelivery: string;
  grossMargin: number;
  finalSkuPrice: number;
  status: number;
  remark: string;
  toVendorRemark: string;
  toCustomerRemark: string;
  annex: string;
  sort: number;
  deepSearchProductId: string;
  deepSearchStatus: string;
  aiRemark: string;
}

export interface VendorForDemandVo {
  vendorId: string;
  name: string;
  contact: string;
  isMain: boolean;
}

export interface PageResult<T> {
  records: T[];
  current: number;
  size: number;
  total: number;
  pages: number;
}
