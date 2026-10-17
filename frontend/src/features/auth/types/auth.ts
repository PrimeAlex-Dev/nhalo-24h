export type UserRole = 'CUSTOMER' | 'PROVIDER' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'DISABLED';

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  status: UserStatus;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: AuthUser;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface MessageResponse {
  message: string;
}
