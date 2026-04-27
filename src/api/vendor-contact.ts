import { ApiClient, ApiResponse } from './client';
import { PageResult } from '../types/vendor';

const VENDOR_BASE = '/api/manageV2/vendor';

// ============ types ============

export interface VendorContactVo {
  id: string;
  vendorId: string;
  name: string;
  phone?: string;
  email?: string;
  position?: string;
  isDefault: boolean;
  createdTime?: string;
  updatedTime?: string;
}

export interface CreateVendorContactDto {
  name: string;
  phone?: string;
  email?: string;
  position?: string;
  isDefault?: boolean;
}

export interface UpdateVendorContactDto {
  name?: string;
  phone?: string;
  email?: string;
  position?: string;
  isDefault?: boolean;
}

// ============ helpers ============

function checkResponse<T>(resp: ApiResponse<T>): T {
  if (resp.status !== 200) {
    throw new Error(resp.msg || '请求失败');
  }
  return resp.data;
}

// ============ API functions ============

export async function listContacts(
  client: ApiClient,
  vendorId: string
): Promise<PageResult<VendorContactVo>> {
  const resp = await client.get<ApiResponse<PageResult<VendorContactVo>>>(
    `${VENDOR_BASE}/${vendorId}/contacts`
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

export async function getContact(
  client: ApiClient,
  vendorId: string,
  contactId: string
): Promise<VendorContactVo> {
  const resp = await client.get<ApiResponse<VendorContactVo>>(
    `${VENDOR_BASE}/${vendorId}/contact/${contactId}`
  );
  return checkResponse(resp);
}

export async function createContact(
  client: ApiClient,
  vendorId: string,
  dto: CreateVendorContactDto
): Promise<string> {
  const resp = await client.post<ApiResponse<string>>(
    `${VENDOR_BASE}/${vendorId}/contacts`,
    dto
  );
  return checkResponse(resp);
}

export async function updateContact(
  client: ApiClient,
  vendorId: string,
  contactId: string,
  dto: UpdateVendorContactDto
): Promise<void> {
  const resp = await client.put<ApiResponse<void>>(
    `${VENDOR_BASE}/${vendorId}/contact/${contactId}`,
    dto
  );
  checkResponse(resp);
}

export async function deleteContact(
  client: ApiClient,
  vendorId: string,
  contactId: string
): Promise<void> {
  const resp = await client.delete<ApiResponse<void>>(
    `${VENDOR_BASE}/${vendorId}/contact/${contactId}`
  );
  checkResponse(resp);
}
