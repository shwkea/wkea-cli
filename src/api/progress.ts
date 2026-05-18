import { ApiClient, ApiResponse } from './client';

const PROGRESS_BASE = '/api/manageV2/progress';

export interface TaskItemDto {
  name: string;
  summary?: string;
  links?: string[];
}

export interface CreateProgressDto {
  taskName: string;
  tasks: TaskItemDto[];
  taskLink?: string;
  relationType?: string;
  relationId?: string;
}

export interface StepResultVo {
  finishedStep: number;
  totalSteps: number;
  currentStep: string;
  remainingSteps: string[];
  nextStep: string | null;
  isCompleted: boolean;
  message: string;
}

export interface ProgressVo {
  id: number;
  taskName: string;
  tasks: TaskItemDto[];
  finishedStep: number;
  stepCount: number;
  taskLink: string;
  relationType: string;
  relationId: string;
  status: number;
  createdBy: string;
  createdTime: string;
  updatedTime: string;
  completedTime: string;
}

export interface ProgressListDto {
  relationType?: string;
  relationId?: string;
  status?: number;
  pageNum?: number;
  pageSize?: number;
}

function checkResponse<T>(resp: ApiResponse<T>): T {
  if (resp.status !== 200) {
    throw new Error(resp.msg || `请求失败(${resp.status})`);
  }
  return resp.data;
}

export async function createProgress(
  client: ApiClient,
  dto: CreateProgressDto
): Promise<number> {
  const resp = await client.post<ApiResponse<number>>(PROGRESS_BASE, dto);
  return checkResponse(resp);
}

export async function getProgress(
  client: ApiClient,
  id: number
): Promise<ProgressVo> {
  const resp = await client.get<ApiResponse<ProgressVo>>(`${PROGRESS_BASE}/${id}`);
  return checkResponse(resp);
}

export async function completeStep(
  client: ApiClient,
  id: number,
  stepIndex: number,
  summary?: string,
  links?: string[],
  abnormal?: boolean
): Promise<StepResultVo> {
  const body: Record<string, any> = { stepIndex };
  if (summary) body.summary = summary;
  if (links && links.length > 0) body.links = links;
  if (abnormal) body.abnormal = true;
  const resp = await client.post<ApiResponse<StepResultVo>>(`${PROGRESS_BASE}/${id}/step`, body);
  return checkResponse(resp);
}

export async function listProgress(
  client: ApiClient,
  dto: ProgressListDto
): Promise<{ rows: ProgressVo[]; totalSize: number; pageIndex: number; pageSize: number; totalPage: number }> {
  const resp = await client.post<ApiResponse<{
    records: ProgressVo[];
    total: number;
    current: number;
    size: number;
    pages: number;
  }>>(`${PROGRESS_BASE}/list`, dto);
  const data = checkResponse(resp);
  return {
    rows: data.records ?? [],
    totalSize: data.total ?? 0,
    pageIndex: data.current ?? 0,
    pageSize: data.size ?? 0,
    totalPage: data.pages ?? 0,
  };
}
