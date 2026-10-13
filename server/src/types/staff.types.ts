export interface CreateStaffDTO {
  employeeNo: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  designation?: string | null;
  employmentDate?: string | null;
}

export interface UpdateStaffDTO {
  employeeNo?: string;
  firstName?: string;
  lastName?: string;
  email?: string | null;
  phone?: string | null;
  designation?: string | null;
  employmentType?: string | null;
  employmentDate?: string | null;
  departmentId?: string | null;
  isActive?: boolean;
}

export interface CreateStaffOnboardingDTO {
  bioData: {
    name: string;
    email: string;
    dob: string;
    phone: string;
    address: string;
  };
  academics: Array<{
    level: string;
    institution: string;
    qualification: string;
    year: number;
    documentIndex?: number;
  }>;
  departmentData: {
    departmentId: string;
    facultyId?: string;
    position: string;
    employmentType: string;
    employmentDate: string;
  };
  accountData?: {
    bankName: string;
    accountNumber: string;
    bvn: string;
  };
  loginData: {
    email: string;
    password: string;
  };
}
