export interface AdmissionResultInput {
  subject: string;
  grade: string;
}

export interface AdmissionDocumentInput {
  documentType: string;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  fileSize: number;
  publicId?: string;
  resourceType?: 'image' | 'raw' | 'video';
  claimToken?: string;
}

export interface AdmissionSubmissionInput {
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;
  stateOfOrigin: string;
  lga: string;
  religion?: string;
  academicSessionId: string;
  classId: string;
  results: AdmissionResultInput[];
  documents: AdmissionDocumentInput[];
}

export type AdmissionRequestType =
  | 'DOCUMENT'
  | 'PERSONAL_INFORMATION'
  | 'ACADEMIC_INFORMATION'
  | 'ACADEMIC_RESULT'
  | 'CORRECTION'
  | 'OTHER';

export interface AdmissionInformationRequestInput {
  type: AdmissionRequestType;
  field?: string;
  documentType?: string;
  message: string;
}

export interface AdmissionInformationRequestBatchInput {
  message: string;
  items: AdmissionInformationRequestInput[];
}
