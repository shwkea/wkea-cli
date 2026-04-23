export interface BrandDetailVo {
  id: number;
  name: string;
  /** 别名/关键词，逗号分隔字符串（API 返回），aliases 为转换后的数组 */
  keyword: string;
  aliases: string[];
  url?: string;
  logo?: string;
  desc?: string;
  type?: string;
  isCooperation?: boolean;
  isFeatured?: boolean;
  remark?: string;
  vendorCount?: number;
  productCount?: number;
  createdTime?: string;
}

/** 品牌列表 VO，与 BrandDetailVo 结构相同 */
export type BrandListVo = BrandDetailVo;

export interface PageResult<T> {
  rows: T[];
  totalSize: number;
  pageSize: number;
  pageIndex: number;
  totalPage: number;
}
