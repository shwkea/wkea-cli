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
}

export interface PageResult<T> {
  records: T[];
  current: number;
  size: number;
  total: number;
  pages: number;
}
