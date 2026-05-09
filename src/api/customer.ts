import { ApiClient, ApiResponse } from './client';
import {
  GetCustomerDetailsVo,
  GetCustomerVo,
  PageResult,
} from '../types/customer';

const BASE = '/api/manageV2/business/customer';

function checkResponse<T>(resp: ApiResponse<T>): T {
  if (resp.status !== 200) {
    throw new Error(resp.msg || `请求失败(${resp.status})`);
  }
  return resp.data;
}

/** 创建客户 */
export async function createCustomer(client: ApiClient, dto: Record<string, unknown>): Promise<void> {
  const resp = await client.post<ApiResponse<null>>(BASE, dto);
  checkResponse(resp);
}

/** 客户详情 */
export async function getCustomerDetail(client: ApiClient, id: string): Promise<GetCustomerDetailsVo> {
  const resp = await client.get<ApiResponse<GetCustomerDetailsVo>>(`${BASE}/${id}`);
  return checkResponse(resp);
}

/** 更新客户 */
export async function updateCustomer(client: ApiClient, id: string, dto: Record<string, unknown>): Promise<void> {
  const resp = await client.put<ApiResponse<null>>(`${BASE}/${id}`, dto);
  checkResponse(resp);
}

/** 删除客户 */
export async function deleteCustomer(client: ApiClient, id: string): Promise<void> {
  const resp = await client.del<ApiResponse<null>>(`${BASE}/${id}`);
  checkResponse(resp);
}

/** 客户列表 */
export async function listCustomers(client: ApiClient, dto: Record<string, unknown>): Promise<PageResult<GetCustomerVo>> {
  const resp = await client.post<ApiResponse<PageResult<GetCustomerVo>>>(`${BASE}/list`, dto);
  return checkResponse(resp);
}

// ========== 银行 CRUD ==========

export async function listCustomerBanks(client: ApiClient, customerId: string): Promise<any[]> {
  const resp = await client.get<ApiResponse<any[]>>(`${BASE}/${customerId}/banks`);
  return checkResponse(resp);
}

export async function getCustomerBank(client: ApiClient, customerId: string, bankId: number): Promise<any> {
  const resp = await client.get<ApiResponse<any>>(`${BASE}/${customerId}/bank/${bankId}`);
  return checkResponse(resp);
}

export async function createCustomerBank(client: ApiClient, customerId: string, dto: Record<string, any>): Promise<void> {
  const resp = await client.post<ApiResponse<void>>(`${BASE}/${customerId}/banks`, dto);
  checkResponse(resp);
}

export async function updateCustomerBank(client: ApiClient, customerId: string, bankId: number, dto: Record<string, any>): Promise<void> {
  const resp = await client.put<ApiResponse<void>>(`${BASE}/${customerId}/bank/${bankId}`, dto);
  checkResponse(resp);
}

export async function deleteCustomerBank(client: ApiClient, customerId: string, bankId: number): Promise<void> {
  const resp = await client.delete<ApiResponse<void>>(`${BASE}/${customerId}/bank/${bankId}`);
  checkResponse(resp);
}

// ========== 联系人 CRUD ==========

export async function listCustomerContacts(client: ApiClient, customerId: string): Promise<any[]> {
  const resp = await client.get<ApiResponse<any[]>>(`${BASE}/${customerId}/contacts`);
  return checkResponse(resp);
}

export async function getCustomerContact(client: ApiClient, customerId: string, contactId: string): Promise<any> {
  const resp = await client.get<ApiResponse<any>>(`${BASE}/${customerId}/contact/${contactId}`);
  return checkResponse(resp);
}

export async function createCustomerContact(client: ApiClient, customerId: string, dto: Record<string, any>): Promise<void> {
  const resp = await client.post<ApiResponse<void>>(`${BASE}/${customerId}/contacts`, dto);
  checkResponse(resp);
}

export async function updateCustomerContact(client: ApiClient, customerId: string, contactId: string, dto: Record<string, any>): Promise<void> {
  const resp = await client.put<ApiResponse<void>>(`${BASE}/${customerId}/contact/${contactId}`, dto);
  checkResponse(resp);
}

export async function deleteCustomerContact(client: ApiClient, customerId: string, contactId: string): Promise<void> {
  const resp = await client.delete<ApiResponse<void>>(`${BASE}/${customerId}/contact/${contactId}`);
  checkResponse(resp);
}

// ========== 发票 CRUD ==========

export async function listCustomerInvoices(client: ApiClient, customerId: string): Promise<any[]> {
  const resp = await client.get<ApiResponse<any[]>>(`${BASE}/${customerId}/invoices`);
  return checkResponse(resp);
}

export async function getCustomerInvoice(client: ApiClient, customerId: string, invoiceId: number): Promise<any> {
  const resp = await client.get<ApiResponse<any>>(`${BASE}/${customerId}/invoice/${invoiceId}`);
  return checkResponse(resp);
}

export async function createCustomerInvoice(client: ApiClient, customerId: string, dto: Record<string, any>): Promise<void> {
  const resp = await client.post<ApiResponse<void>>(`${BASE}/${customerId}/invoices`, dto);
  checkResponse(resp);
}

export async function updateCustomerInvoice(client: ApiClient, customerId: string, invoiceId: number, dto: Record<string, any>): Promise<void> {
  const resp = await client.put<ApiResponse<void>>(`${BASE}/${customerId}/invoice/${invoiceId}`, dto);
  checkResponse(resp);
}

export async function deleteCustomerInvoice(client: ApiClient, customerId: string, invoiceId: number): Promise<void> {
  const resp = await client.delete<ApiResponse<void>>(`${BASE}/${customerId}/invoice/${invoiceId}`);
  checkResponse(resp);
}

// ========== 地址 CRUD ==========

export async function listCustomerAddresses(client: ApiClient, customerId: string): Promise<any[]> {
  const resp = await client.get<ApiResponse<any[]>>(`${BASE}/${customerId}/addresses`);
  return checkResponse(resp);
}

export async function getCustomerAddress(client: ApiClient, customerId: string, addressId: number): Promise<any> {
  const resp = await client.get<ApiResponse<any>>(`${BASE}/${customerId}/address/${addressId}`);
  return checkResponse(resp);
}

export async function createCustomerAddress(client: ApiClient, customerId: string, dto: Record<string, any>): Promise<void> {
  const resp = await client.post<ApiResponse<void>>(`${BASE}/${customerId}/addresses`, dto);
  checkResponse(resp);
}

export async function updateCustomerAddress(client: ApiClient, customerId: string, addressId: number, dto: Record<string, any>): Promise<void> {
  const resp = await client.put<ApiResponse<void>>(`${BASE}/${customerId}/address/${addressId}`, dto);
  checkResponse(resp);
}

export async function deleteCustomerAddress(client: ApiClient, customerId: string, addressId: number): Promise<void> {
  const resp = await client.delete<ApiResponse<void>>(`${BASE}/${customerId}/address/${addressId}`);
  checkResponse(resp);
}
