export type UserRole = 'USER' | 'ADMIN';

export type User = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
};

export type AuthResponse = {
  token: string;
  tokenType: 'Bearer';
  expiresInMillis: number;
  user: User;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export type AuthSession = {
  token: string;
  user: User;
  expiresAt: number;
};
