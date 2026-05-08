import { ApiClient, ApiResponse } from './client';

const ORDER_BASE = '/api/manageV2/business/sales-order';

function checkResponse<T>(resp: ApiResponse<T>): T {
  if (resp.status !== 200) {
    throw new Error(resp.msg || `请求失败(${resp.status})`);
  }
  return resp.data;
}

// ========== 基础 CRUD ==========

export async function createOrder(
  client: ApiClient,
  dto: Record<string, any>
): Promise<string> {
  const resp = await client.post<ApiResponse<string>>(`${ORDER_BASE}`, dto);
  return checkResponse(resp);
}

export async function listOrders(
  client: ApiClient,
  dto: {
    pageNum: number;
    pageSize: number;
    orderId?: string;
    customerName?: string;
    manageId?: number;
    sku?: string;
    orderStatus?: number[];
    beginTime?: string;
    endTime?: string;
  }
): Promise<any> {
  const resp = await client.post<ApiResponse<any>>(`${ORDER_BASE}/list`, dto);
  return checkResponse(resp);
}

export async function orderDetail(
  client: ApiClient,
  id: string
): Promise<any> {
  const resp = await client.get<ApiResponse<any>>(`${ORDER_BASE}/${id}`);
  return checkResponse(resp);
}

export async function deleteOrder(
  client: ApiClient,
  id: string
): Promise<void> {
  const resp = await client.del<ApiResponse<void>>(`${ORDER_BASE}/${id}`);
  checkResponse(resp);
}

// ========== 业务操作 ==========

export async function cancelOrder(
  client: ApiClient,
  id: string
): Promise<void> {
  const resp = await client.post<ApiResponse<void>>(`${ORDER_BASE}/${id}/cancel`);
  checkResponse(resp);
}

export async function confirmOrder(
  client: ApiClient,
  id: string
): Promise<void> {
  const resp = await client.post<ApiResponse<void>>(`${ORDER_BASE}/${id}/confirm`);
  checkResponse(resp);
}

export async function confirmPayment(
  client: ApiClient,
  dto: { orderId: string; paymentTime: string }
): Promise<void> {
  const resp = await client.post<ApiResponse<void>>(`${ORDER_BASE}/${dto.orderId}/confirm-payment`, {
    orderId: dto.orderId,
    paymentTime: dto.paymentTime,
  });
  checkResponse(resp);
}

export async function createShipOrder(
  client: ApiClient,
  dto: { orderId: string; items: Array<{ itemId: number; quantity: number; stockId?: number }> }
): Promise<string> {
  const hasStockIds = dto.items.some(i => i.stockId !== undefined);
  const body = {
    id: dto.orderId,
    orderItems: dto.items.map(item => ({
      Id: item.itemId,
      orderItems: [{ stockId: item.stockId ?? 0, amount: item.quantity }],
    })),
    automaticSplitting: !hasStockIds,
  };
  const resp = await client.post<ApiResponse<string>>(`${ORDER_BASE}/${dto.orderId}/create-ship-order`, body);
  return checkResponse(resp);
}

const LOGISTICS_NAME_MAP: Record<string, number> = {
  '顺丰快递': 57,
  '顺丰特快': 466,
  '顺丰即日': 467,
  '顺丰同城': 458,
  '德邦快递': 58,
  '安能物流': 59,
  '货拉拉物流': 60,
  '速通物流': 2208,
};

export async function shipOrder(
  client: ApiClient,
  dto: { orderId: string; deliverId: string; logisticsCompanyId?: number; logisticsCompany?: string; trackingNumber: string }
): Promise<void> {
  let companyId = dto.logisticsCompanyId;
  if (!companyId && dto.logisticsCompany) {
    const mapped = LOGISTICS_NAME_MAP[dto.logisticsCompany];
    if (!mapped) {
      throw new Error(`未知物流公司："${dto.logisticsCompany}"，可用：${Object.keys(LOGISTICS_NAME_MAP).join('、')}`);
    }
    companyId = mapped;
  }
  if (!companyId) {
    throw new Error('请指定物流公司：--logistics-company-id <id> 或 --logistics-company <name>');
  }
  const resp = await client.post<ApiResponse<void>>(`${ORDER_BASE}/${dto.orderId}/ship`, {
    deliverId: dto.deliverId,
    logisticsCompanyId: companyId,
    trackingNumber: dto.trackingNumber,
    actualFreight: 0,
  });
  checkResponse(resp);
}

export async function backOrder(
  client: ApiClient,
  id: string
): Promise<void> {
  const resp = await client.post<ApiResponse<void>>(`${ORDER_BASE}/${id}/back-order`);
  checkResponse(resp);
}

// ========== 查询子列表 ==========

export async function orderDeliveries(
  client: ApiClient,
  id: string,
  pageNum?: number,
  pageSize?: number
): Promise<any> {
  const params: Record<string, unknown> = {
    pageNum: pageNum || 1,
    pageSize: pageSize || 20,
  };
  const resp = await client.get<ApiResponse<any>>(`${ORDER_BASE}/${id}/deliveries`, params);
  return checkResponse(resp);
}

export async function orderOutboundOrders(
  client: ApiClient,
  id: string,
  pageNum?: number,
  pageSize?: number
): Promise<any> {
  const params: Record<string, unknown> = {
    pageNum: pageNum || 1,
    pageSize: pageSize || 20,
  };
  const resp = await client.get<ApiResponse<any>>(`${ORDER_BASE}/${id}/outbound-orders`, params);
  return checkResponse(resp);
}
