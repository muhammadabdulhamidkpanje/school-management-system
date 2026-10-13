export interface CreateSessionDTO {
  name: string;
  startDate: string;
  endDate: string;
  isCurrent?: boolean;
  admissionsOpen?: boolean;
  availableClassroomIds?: string[];
  requiredAdmissionSubjects?: string[];
}

export interface UpdateSessionDTO {
  name?: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
  admissionsOpen?: boolean;
  availableClassroomIds?: string[];
  requiredAdmissionSubjects?: string[];
}
