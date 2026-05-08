export interface GetCustomerDetailsVo {
  id: string;
  manageId: string;
  mname: string;
  account: string;
  name: string;
  image: string;
  nameRemark: string;
  banRemark: string;
  email: string;
  phone: string;
  telephone: string;
  country: string;
  province: string;
  city: string;
  area: string;
  address: string;
  enterpriseType: number;
  industry: string;
  channelSource: number;
  website: string;
  companyIntroduction: string;
  customerGroupId: number;
  currencyId: number;
  paymentTerm: number;
  settlementType: number;
  remark: string;
  bankNumber: string;
  invoicePricePrint: boolean;
  addressList: AddressInsertDto[];
  invoiceList: InvoiceInsertDto[];
  bankList: BankInsertDto[];
  contactList: ContactInsertDto[];
  extraColumns: Record<string, any>;
}

export interface AddressInsertDto {
  id: number;
  objId: string;
  consignee: string;
  phone: string;
  postcode: number;
  telephone: string;
  province: string;
  city: string;
  area: string;
  town: string;
  address: string;
  isDefault: boolean;
  isInvoiceDefault: boolean;
}

export interface InvoiceInsertDto {
  id: number;
  objId: string;
  invoiceHeader: string;
  address: string;
  registerPhone: string;
  openBank: string;
  bankAccount: string;
  type: number;
  dutyParagraph: string;
  isDefault: boolean;
}

export interface BankInsertDto {
  id: number;
  dutyParagraph: string;
  openName: string;
  account: string;
  lineNumber: string;
  image: string;
  payType: number;
  isDefault: boolean;
}

export interface ContactInsertDto {
  id: string;
  contactName: string;
  contactAddress: string;
  contactPhone: string;
  contactEmail: string;
  contactTelephone: string;
  contactPosition: string;
  groupName: string;
  kgwxUserId: string;
  isDefault: boolean;
  remark: string;
}

export interface GetCustomerVo {
  id: string;
  manageId: string;
  manageName: string;
  account: string;
  name: string;
  nameAndId: string;
  image: string;
  email: string;
  phone: string;
  telephone: string;
  country: string;
  province: string;
  city: string;
  area: string;
  address: string;
  enterpriseType: number;
  industry: string;
  channelSource: number;
  website: string;
  companyIntroduction: string;
  customerGroupId: number;
  currencyId: number;
  paymentTerm: number;
  payType: number;
  settlementType: number;
  createdTime: string;
  updatedTime: string;
  remark: string;
  invoiceHeader: string;
  banRemark: string;
}

export interface PageResult<T> {
  records: T[];
  current: number;
  size: number;
  total: number;
  pages: number;
}
