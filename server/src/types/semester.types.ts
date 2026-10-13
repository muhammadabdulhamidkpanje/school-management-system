export interface CreateSemesterDTO {
  name: string;
  sessionId: string;
  startDate: string;
  endDate: string;
  isCurrent?: boolean;
}

export interface UpdateSemesterDTO {
  name?: string;
  sessionId?: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
}
