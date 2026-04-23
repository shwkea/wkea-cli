export interface SuperiorCategoryVo {
  id: number;
  vendorId: string;
  name: string;
  systemCategoryId?: number;
  systemCategoryPath?: string;
  priority: number;
  remark?: string;
  createdTime?: string;
  updatedTime?: string;
}

export interface CreateSuperiorCategoryDto {
  name: string;
  systemCategoryId?: number;
  systemCategoryPath?: string;
  priority?: number;
  remark?: string;
}

export interface UpdateSuperiorCategoryDto {
  name?: string;
  systemCategoryId?: number;
  systemCategoryPath?: string;
  priority?: number;
  remark?: string;
}
