export interface User {
  id: string;
  username: string;
  email: string;
  isVerified: boolean;
  isActive: boolean;
  role: "user" | "admin";
  createdAt: string;
  updatedAt: string;
  avatarUrl: string | null;
  stripeCustomerId?: string | null;
  premiumStatus?: "none" | "premium" | "canceled" | null;
}

export interface UsersResponse {
  users: User[];
  total: number;
  offset: number;
  limit: number;
}

export interface CreateUserData {
  username: string;
  email: string;
  password: string;
  role: User["role"];
  isActive: boolean;
  isVerified: boolean;
  avatarUrl?: string;
}

export interface UpdateUserData {
  username?: string;
  email?: string;
  role?: User["role"];
  isActive?: boolean;
  isVerified?: boolean;
  avatarUrl?: string | null;
}
