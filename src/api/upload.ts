import { ApiClient } from './client';

export interface CosCredential {
  token: string;
  secretId: string;
  secretKey: string;
  startTime: number;
  expiredTime: number;
  bucket: string;
  region: string;
}

/** 获取 COS 临时上传凭证 */
export async function getCosCredential(client: ApiClient): Promise<CosCredential> {
  const resp: any = await client.get('/api/ec/cos');
  return resp.data;
}

/** 各业务模块的上传路径 */
export const UploadPaths: Record<string, string> = {
  product: 'products/',      // SPU/SKU 产品图片
  spu: 'spu/',               // SPU 图片
  sku: 'sku/',               // SKU 图片
  demand: 'demands/',        // 需求询价附件
  brand: 'brands/',          // 品牌 Logo
  vendor: 'vendors/',        // 供应商文件
  customer: 'customers/',   // 客户附件
  general: 'uploads/',       // 通用
};
