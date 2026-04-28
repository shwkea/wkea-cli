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
  /** 品牌大logo */
  bigLogo?: string;
  /** 品牌授权证书图片 */
  authorizationCertificateImage?: string;
  /** 品牌价值标签 */
  tag?: string;
  /** 绑定的品牌等级组id */
  levelId?: number;
  /** 申请/注册号 */
  regNo?: string;
  /** 商标状态 */
  flowStatusDesc?: string;
  /** 专用权期限 */
  validPeriod?: string;
  /** 申请人 */
  applicant?: string;
  /** 创建人 */
  createdBy?: string;
  /** 更新时间 */
  updatedTime?: string;
  /** 修改人 */
  updatedBy?: string;
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
