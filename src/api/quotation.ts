import { ApiClient, ApiResponse } from './client';

const QUOTATION_BASE = '/api/manageV2/business/quotation';

function checkResponse<T>(resp: ApiResponse<T>): T {
  if (resp.status !== 200) {
    throw new Error(resp.msg || `请求失败(${resp.status})`);
  }
  return resp.data;
}

export async function createQuotation(
  client: ApiClient,
  items: Array<{ sku: string; quantity: number; unit: number; selected: boolean; remark?: string }>
): Promise<string> {
  const resp = await client.post<ApiResponse<string>>(`${QUOTATION_BASE}`, items);
  return checkResponse(resp);
}

export async function getQuotationItems(
  client: ApiClient,
  shareId: string
): Promise<any> {
  const resp = await client.get<ApiResponse<any>>(`${QUOTATION_BASE}/${shareId}/items`);
  return checkResponse(resp);
}

export async function addQuotationItems(
  client: ApiClient,
  shareId: string,
  items: Array<{ sku: string; quantity: number; unit: number; selected: boolean; remark?: string }>
): Promise<void> {
  const resp = await client.post<ApiResponse<void>>(`${QUOTATION_BASE}/${shareId}/items`, items);
  checkResponse(resp);
}

export async function removeQuotationItem(
  client: ApiClient,
  shareId: string,
  itemId: string
): Promise<void> {
  const resp = await client.delete<ApiResponse<void>>(`${QUOTATION_BASE}/${shareId}/items/${itemId}`);
  checkResponse(resp);
}

export async function shareQuotation(
  client: ApiClient,
  shareId: string,
  topic?: string
): Promise<{ shareUrl: string; shortUrl: string; copyText: string }> {
  const body: Record<string, string> = {};
  if (topic) body.topic = topic;
  const resp = await client.post<ApiResponse<{ shareUrl: string; shortUrl: string; copyText: string }>>(
    `${QUOTATION_BASE}/${shareId}/share`,
    Object.keys(body).length > 0 ? body : undefined
  );
  return checkResponse(resp);
}
