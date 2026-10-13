export interface RegisterDTO {
  email:      string;
  password:   string;
  firstName:  string;
  lastName:   string;
  middleName?: string;
  gender?:    string;
  phone?:     string;
  roleName:   string;   // 'admin' | 'staff' | 'student'
}

export interface LoginDTO {
  email:    string;
  password: string;
}

export interface ForgotPasswordDTO {
  email: string;
}

export interface ResetPasswordDTO {
  token:    string;
  password: string;
}

export interface ChangePasswordDTO {
  currentPassword: string;
  newPassword:     string;
}

export interface UpdateProfileDTO {
  firstName?:   string;
  middleName?:  string | null;
  lastName?:    string;
  gender?:      string | null;
  phone?:       string | null;
  profileImage?: string | null;
}

export interface JwtPayload {
  sub:         string;   // user id
  email:       string;
  role:        string;
  permissions: string[];
}

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}