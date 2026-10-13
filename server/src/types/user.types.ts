export interface CreateUserDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  gender?: string;
  phone?: string;
  roleName: string;
}

export interface UpdateUserDTO {
  email?: string;
  firstName?: string;
  lastName?: string;
  middleName?: string | null;
  gender?: string | null;
  phone?: string | null;
  profileImage?: string | null;
  roleName?: string;
  isActive?: boolean;
  isVerified?: boolean;
}
